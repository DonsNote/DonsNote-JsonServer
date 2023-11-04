import axios from "axios";
import express from "express";
import fs from 'fs/promises';
import jwt from "jsonwebtoken";
import path from "path";
import { Auth } from '../models/authModel';
import { User } from '../models/userModel';
import { generateClientSecret } from "../utils/makeCliSecret";

const router = express.Router();
const secret = process.env.SECRET_KEY;

if (!secret) {
  throw new Error('SECRET_KEY is not defined in the env variables.');
}

const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');
const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json');
const responseFilePath = path.join(__dirname, '..', 'DB', 'auth', 'response.json');

router.post("/apple-login", async (req, res) => {
  try {
    const authorizationCode = req.body.code;
    const appleTokenResponse = await fetchAppleTokens(authorizationCode);
    const users = JSON.parse(await fs.readFile(usersFilePath, "utf8"));
    let newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
    users.push({
      id: newId,
      artistId: null,
      follow: [],
      block: [],
      userName: "User",
      userInfo: "Hi, there!",
      userImageURL: "https://aesopos.co.kr/images/default.png"
    });
    await fs.writeFile(usersFilePath, JSON.stringify(users));

    const authData = JSON.parse(await fs.readFile(authFilePath, "utf8"));
    authData[newId] = {
      id: newId,
      refreshToken: appleTokenResponse.refresh_token
    };
    await fs.writeFile(authFilePath, JSON.stringify(authData));

    const token = jwt.sign({ id: newId }, secret);
    res.send({ token });
  } catch (error) {
    console.error('Error during Apple login:', error);
    res.status(500).send({ message: 'Internal Server Error' });
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
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    const userId = decoded.id; // 토큰에서 사용자 ID 추출

    // auth.json에서 사용자의 refresh_token을 찾기
    const authData = JSON.parse(await fs.readFile(authFilePath, 'utf8'));
    const refreshToken = authData[userId]?.refreshToken;
    if (!refreshToken) {
      return res.status(404).send({ message: 'Refresh token not found.' });
    }

    // 클라이언트 시크릿 생성
    const clientId = process.env.CLIENT_ID;
    const clientSecret = generateClientSecret();

    // Apple의 토큰 폐기 API에 요청을 보낼 데이터 구성
    const tokenData = new URLSearchParams();
    tokenData.append('client_id', clientId as string);
    tokenData.append('client_secret', clientSecret);
    tokenData.append('token', refreshToken);
    tokenData.append('token_type_hint', 'refresh_token');

    // Apple의 토큰 폐기 API에 POST 요청 보내기
    const revokeResponse = await axios.post('https://appleid.apple.com/auth/oauth2/v2/revoke', tokenData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 폐기 요청이 성공했다면, 서버의 데이터베이스에서 사용자 정보 삭제
    if (revokeResponse.status === 200) {
      // auth.json에서 사용자 정보 삭제
      const deleteAuthData = authData.filter((auth: Auth) => auth.id !== userId);
      await fs.writeFile(authFilePath, JSON.stringify(deleteAuthData, null, 2));

      // users.json에서 사용자 정보 삭제
      const users = JSON.parse(await fs.readFile(usersFilePath, 'utf8'));
      const deleteUsers = users.filter((user: User) => user.id !== userId);
      await fs.writeFile(usersFilePath, JSON.stringify(deleteUsers));

      res.status(200).send({ message: 'User and refresh token have been revoked successfully.' });
    } else {
      // Apple 토큰 폐기 요청이 실패했을 경우
      res.status(revokeResponse.status).send({ message: 'Failed to revoke Apple token.' });
    }
  }  catch (error: unknown) {
    // error가 AxiosError 인스턴스인지 확인
    if (axios.isAxiosError(error)) {
      // 이제 error는 AxiosError 타입으로 간주됩니다.
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

async function fetchAppleTokens(authorizationCode: string): Promise<any> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = generateClientSecret();

  // URLSearchParams 객체 생성
  const tokenData = new URLSearchParams();
  tokenData.append('client_id', clientId as string);
  tokenData.append('client_secret', clientSecret);
  tokenData.append('code', authorizationCode);
  tokenData.append('grant_type', "authorization_code");
  tokenData.append('redirect_uri', "https://aesopos.co.kr/apple-response");

  // axios.post에 문자열로 변환된 tokenData 전달
  const response = await axios.post('https://appleid.apple.com/auth/oauth2/v2/token', tokenData.toString(), {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });

  return response.data;
}

export default router;