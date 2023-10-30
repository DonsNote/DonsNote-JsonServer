import express, { Request, Response } from "express";
import fs from "fs";
import { JwtPayload } from "jsonwebtoken";
import path from "path";
import { verifyToken } from "../utils/checkToken";
import upload from "../utils/saveImage";
const router = express.Router();

const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');

router.get("/", (req: Request, res: Response) => {
  // 사용자 목록 가져오기
});

router.post("/", (req: Request, res: Response) => {
  // 사용자 등록인데 auth에서 해결하고 있음
});


router.delete("/:id", (req: Request, res: Response) => {
  // 사용자 삭제하기
});

router.patch("/", upload.single('images'), (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Token is required" });
  }

  try {
    const decoded = verifyToken(token) as JwtPayload;
    const userId = decoded.id; // 토큰에서 id 값을 추출

    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
    if (userId >= users.length || !users[userId]) {
      return res.status(404).send({ message: "User not found" });
    }
    const user = users[userId]; // id 값을 사용하여 사용자 정보 찾기
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const file = req.file;
    const updatedData = req.body;

    if (file) {
      updatedData.userImageURL = `http://54.180.143.129:3000/images/${file.filename}`;
    }

    users[userId] = { // id 값을 사용하여 사용자 정보 업데이트
      ...user,
      ...updatedData,
    };
    fs.writeFileSync(usersFilePath, JSON.stringify(users));

    res.send({ message: "User profile updated successfully!" });
  } catch (error) {
    res.status(401).send({ message: "Invalid token" });
  }
});

export default router;
