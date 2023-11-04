import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { User } from '../models/userModel';
import { authenticateToken } from "../utils/authenticateToken";
import upload from "../utils/saveImage";
import { userValidationRules, validateUser } from '../utils/userModelCheck';

const router = express.Router();
const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');

router.get("/", authenticateToken, (req: Request, res: Response) => {
  // authenticateToken 미들웨어에서 추가된 user 사용
  const user: User = req.user as User;

  // 사용자 정보 반환
  res.json(user);
});

router.patch("/", userValidationRules, validateUser, upload.single('image'), authenticateToken, async (req: Request, res: Response) => {
  // authenticateToken 미들웨어에서 추가된 user 사용
  const user: User | undefined = req.user as User | undefined;
  
  // user가 유효한지 확인
  if (!user) {
    return res.status(403).send({ message: "User not authenticated" });
  }

  // 파일 업로드가 있을 경우 이미지 URL 업데이트
  const updatedData = req.body;
  if (req.file) {
    updatedData.userImageURL = `https://aesopos.co.kr/images/${req.file.filename}`;
  }

  // 사용자 정보 업데이트
  Object.assign(user, updatedData);

  try {
    // 파일에서 사용자 목록을 비동기적으로 읽어옵니다.
    const usersData = await fs.promises.readFile(usersFilePath, "utf8");
    const users: User[] = JSON.parse(usersData);

    // userId에 해당하는 사용자 찾기
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).send({ message: "User not found" });
    }

    // 사용자 정보 업데이트
    users[userIndex] = user;

    // 업데이트된 사용자 목록을 파일에 비동기적으로 다시 씁니다.
    await fs.promises.writeFile(usersFilePath, JSON.stringify(users));

    res.send({ message: "User profile updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "An error occurred while updating the profile" });
  }
});


export default router;
