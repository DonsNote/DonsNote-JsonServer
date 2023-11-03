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

router.patch("/", userValidationRules, validateUser, upload.single('images'), authenticateToken, (req: Request, res: Response) => {
  // authenticateToken 미들웨어에서 추가된 user 사용
  const user: User = req.user as User;

  // 파일에서 사용자 목록을 읽어옴
  const usersData = fs.readFileSync(usersFilePath, "utf8");
  const users: User[] = JSON.parse(usersData);

  // userId에 해당하는 사용자 찾기
  const userIndex = users.findIndex(u => u.id === user.id);
  if (userIndex === -1) {
    return res.status(404).send({ message: "User not found" });
  }

  // 파일 업로드가 있을 경우 이미지 URL 업데이트
  const updatedData = req.body;
  if (req.file) {
    updatedData.userImageURL = `https://aesopos.co.kr/images/${req.file.filename}`;
  }

  // 사용자 정보 업데이트
  users[userIndex] = { ...users[userIndex], ...updatedData };
  fs.writeFileSync(usersFilePath, JSON.stringify(users));

  res.send({ message: "User profile updated successfully!" });
});

export default router;
