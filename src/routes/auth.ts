import bcrypt from "bcrypt";
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

const router = express.Router();
const SECRET_KEY = "your_secret_key";

const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json');

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync(authFilePath, "utf8"));

  // 사용자가 이미 존재하는 경우
  if (users[username]) {
    // 저장된 해시된 비밀번호와 제공된 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, users[username].password);

    if (isPasswordValid) {
      // 비밀번호가 일치하면 JWT 토큰 발행
      const token = jwt.sign({ username }, SECRET_KEY);
      return res.send({ message: "Login successful!", token });
    } else {
      // 비밀번호가 일치하지 않으면 오류 메시지 반환
      return res.status(401).send({ message: "Invalid password" });
    }
  }

  // 새로운 사용자 등록
  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = {
    password: hashedPassword,
  };
  fs.writeFileSync(authFilePath, JSON.stringify(users));

  // JWT 토큰 발행
  const token = jwt.sign({ username }, SECRET_KEY);
  res.send({ message: "Registration successful!", token });
});

export default router;
