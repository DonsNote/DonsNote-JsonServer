import axios from "axios";
import dotenv from 'dotenv';
import express from "express";
import fs from 'fs';
import jwt from "jsonwebtoken";
import path from "path";
import qs from 'qs';
import { generateClientSecret } from "../utils/makeCliSecret";
dotenv.config();

const router = express.Router();
const secret = process.env.SECRET_KEY;

const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');
const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json')

router.post("/apple-login", async (req, res) => {
  const authorizationCode = req.body;
  console.log("authorizationCode : " + authorizationCode );

  // 4. Apple의 refreshToken 및 accessToken 받아오기
  const appleTokenResponse = await fetchAppleTokens(authorizationCode);
  const refreshToken = appleTokenResponse.refresh_token;

  // Apple의 authorizationCode를 사용하여 refreshToken 및 accessToken을 받아오는 함수
async function fetchAppleTokens(authorizationCode: string): Promise<any> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = generateClientSecret();

  try {
    const response = await axios.post('https://appleid.apple.com/auth/token', qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: authorizationCode,
      grant_type: "authorization_code",
      redirect_uri: "https://aesopos.co.kr:3000/apple-response"
    }),
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Apple tokens:', error);
    throw error;
  }
}

  // 5. 사용자 데이터베이스에서 사용자 찾기 또는 생성
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  let newId = 1;
  while (users[newId]) { newId++; }

  // 새로운 사용자 등록
  users[newId] = {
    id: newId,
    artistId: null,
    follow: [],
    block: [],
    userName: "User",
    userInfo: "Hi, there!",
    userImageURL: "http://54.180.143.129:3000/images/default.jpg"
  };
  fs.writeFileSync(usersFilePath, JSON.stringify(users));

  // 6. Access Token 발급
  const token = jwt.sign({ newId }, secret || "Default");

  res.send({ token });

  //apple response 받기
  router.post("/apple-response", async (req, res) => {
    try {
      // 요청에서 데이터 추출
      const responseData = req.body;
  
      // 데이터를 auth.json 파일에 저장
      const authData = JSON.stringify(responseData, null, 2); // 보기 좋게 포맷팅
      fs.writeFileSync(authFilePath, authData);
  
      // 성공 응답 보내기
      res.status(200).send({ message: "Data saved successfully" });
  
    } catch (error) {
      // 에러 처리
      console.error("Error saving apple response data:", error);
      res.status(500).send({ message: "Error saving data" });
    }
  });

});

export default router;
