import bcrypt from "bcrypt";
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";

const router = express.Router();
const SECRET_KEY = "your_secret_key";

const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json');
const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  const usersAuth = JSON.parse(fs.readFileSync(authFilePath, "utf8"));

  // 사용자가 이미 존재하는 경우
  if (usersAuth[username]) {
    // 저장된 해시된 비밀번호와 제공된 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, usersAuth[username].password);

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
  usersAuth[username] = {
    password: hashedPassword,
  };
  fs.writeFileSync(authFilePath, JSON.stringify(usersAuth));

  // Create a new user profile with default or null values in users.json
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  let newId = 1;
  while (users[newId]) {
    newId++;
  }
  users[newId] = {
    id: newId,
    userName: null,
    userInfo: null,
    userImageURL: null,
    userArtist: null,
  };
  fs.writeFileSync(usersFilePath, JSON.stringify(users));

  const token = jwt.sign({ id: newId }, SECRET_KEY);
  res.send({ message: "Registration and login successful!", token });
});


export default router;
