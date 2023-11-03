import axios from "axios";
import express from "express";
import fs from 'fs/promises';
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "path";
import { fetchAppleTokens } from "../utils/getRefreshToken";
import { revokeAppleLogin } from "../utils/revokeAppleLogin";


const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');
const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json');
const responseFilePath = path.join(__dirname, '..', 'DB', 'auth', 'response.json');
const router = express.Router();
const secret = process.env.SECRET_KEY;
if (!secret) {
  throw new Error('SECRET_KEY is not defined in the env variables.');
}

router.post("/apple-login", async (req, res) => {
  try {
    const authorizationCode = req.body.code;
    if (!authorizationCode) {
      return res.status(400).send({ message: 'Authorization code is required.' });
    }
    const appleTokenResponse = await fetchAppleTokens(authorizationCode);
    if (!appleTokenResponse || !appleTokenResponse.refresh_token) {
      return res.status(500).send({ message: 'Failed to retrieve refresh token from Apple.' });
    }

    const users = JSON.parse(await fs.readFile(usersFilePath, "utf8"));
    let newId = 1;
    while (users[newId]) { newId++; }

    users[newId] = {
      id: newId,
      artistId: null,
      follow: [],
      block: [],
      userName: "User",
      userInfo: "Hi, there!",
      userImageURL: "https://aesopos.co.kr/images/default.jpg"
    };
    await fs.writeFile(usersFilePath, JSON.stringify(users));

    const authData = JSON.parse(await fs.readFile(authFilePath, "utf8"));
    authData[newId] = {
      id: newId,
      refreshToken: appleTokenResponse.refresh_token
    };
    await fs.writeFile(authFilePath, JSON.stringify(authData));

    const token = jwt.sign({ id: newId }, secret);
    res.send({ token });

  } catch (error: unknown) { // TypeScript에서 error는 unknown 타입으로 처리됩니다.
    console.error('Error during Apple login:', error);

    let errorMessage = 'An error occurred during the Apple login process.';
    if (error instanceof Error) {
      errorMessage = error.message; // 이제 error.message는 안전하게 접근할 수 있습니다.
      if (axios.isAxiosError(error)) {
        // error가 AxiosError 인스턴스인 경우, HTTP 응답에 포함된 에러 메시지에 접근할 수 있습니다.
        errorMessage = error.response?.data?.error || error.message;
      }
    }

    res.status(500).send({ message: 'Internal Server Error', error: errorMessage });
  }
});

router.post('/apple-revoke', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Token is required.' });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const userId = decoded.id; // 토큰에서 사용자 ID 추출

    // auth.json에서 사용자의 refresh_token을 찾기
    const authData = JSON.parse(await fs.readFile(authFilePath, 'utf8'));
    const refreshToken = authData[userId]?.refreshToken;
    if (!refreshToken) {
      return res.status(404).send({ message: 'Refresh token not found.' });
    }

    await revokeAppleLogin(refreshToken);

    // auth.json에서 사용자 정보 삭제
    delete authData[userId];
    await fs.writeFile(authFilePath, JSON.stringify(authData));

    // users.json에서 사용자 정보 삭제
    const users = JSON.parse(await fs.readFile(usersFilePath, 'utf8'));
    delete users[userId];
    await fs.writeFile(usersFilePath, JSON.stringify(users));

    res.status(200).send({ message: 'User and refresh token have been revoked successfully.' });
  } catch (error) {
    // error가 AxiosError 인스턴스인지 확인
    if (axios.isAxiosError(error)) {
      // error는 AxiosError 타입으로 간주됩니다.
      res.status(error.response?.status || 500).send({
        message: 'Failed to revoke refresh token.',
        error: error.response?.data
      });
    } else if (error instanceof Error) {
      // 일반적인 Error 인스턴스인 경우
      res.status(500).send({
        message: 'Failed to revoke refresh token.',
        error: error.message
      });
    } else {
      // error가 Error 인스턴스도 아니고 AxiosError도 아닌 경우
      res.status(500).send({
        message: 'An unknown error occurred.'
      });
    }
  }
});


// apple response 받기
router.post("/apple-response", async (req, res) => {
  try {
    const responseData = req.body;
    const appleReData = JSON.stringify(responseData, null, 2);
    await fs.writeFile(responseFilePath, appleReData);
    res.status(200).send({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving apple response data:", error);
    res.status(500).send({ message: "Error saving data" });
  }
});

export default router;