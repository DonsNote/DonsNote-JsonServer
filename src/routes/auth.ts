import axios from "axios";
import dotenv from 'dotenv';
import express from "express";
import fs from "fs";
import jwt from "jsonwebtoken";
import NodeRSA from 'node-rsa';
import path from "path";
import { generateClientSecret } from "../utils/makeCliSecret";
dotenv.config();

const router = express.Router();
const SECRET_KEY = "your_secret_key";

const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json');
const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');

router.post("/apple-login", async (req, res) => {
  const { identityToken, authorizationCode } = req.body;

  // 1. Identity Token의 Header 추출 및 검증
  const tokenHeaders = parseHeaders(identityToken);

  // 2. Apple의 공개키 가져오기
  const applePublicKeys = await fetchApplePublicKeys();
  const matchingKey = applePublicKeys.find(key => key.kid === tokenHeaders.kid);

  if (!matchingKey) {
    return res.status(401).send({ message: "Invalid Apple Identity Token" });
  }

  // 3. Identity Token 검증
  const publicKey = generatePublicKey(matchingKey);
  const claims = parseClaims(identityToken, publicKey);
  const client_id = process.env.CLIENT_ID || "default_client_id";
  validateClaims(claims, client_id);

  // 4. 사용자 데이터베이스에서 사용자 찾기 또는 생성
  const userId = claims.sub;

  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
  if (!users[userId]) {
    // 새로운 사용자 등록
    users[userId] = {
      id: userId,
      artistId: null,
      follow: [],
      block: [],
      userName: "User",
      userInfo: "Hi, there!",
      userImageURL: "http://54.180.143.129:3000/images/default.jpg"
    };
    fs.writeFileSync(usersFilePath, JSON.stringify(users));
  }

  // 5. Access Token 발급
  const token = jwt.sign({ userId }, SECRET_KEY);

  // 6. Apple의 refreshToken 및 accessToken 받아오기
  const appleTokenResponse = await fetchAppleTokens(authorizationCode);
  const refreshToken = appleTokenResponse.refresh_token;

  res.send({ token, refreshToken });
});


function parseHeaders(token: string): any {
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken || !decodedToken.header) {
    throw new Error("Invalid token");
  }
  return decodedToken.header;
}

async function fetchApplePublicKeys(): Promise<any[]> {
  const response = await axios.get('https://appleid.apple.com/auth/keys');
  return response.data.keys;
}

function generatePublicKey(keyData: any): NodeRSA {
  const publicKey = new NodeRSA();
  publicKey.importKey({ n: Buffer.from(keyData.n, 'base64'), e: Buffer.from(keyData.e, 'base64') }, 'components-public');
  return publicKey;
}

function parseClaims(idToken: string, publicKey: NodeRSA): any {
  try {
    const decoded = jwt.verify(idToken, publicKey.exportKey('public'), { algorithms: ['RS256'] });
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

function validateClaims(claims: any, clientId: string): void {
  if (claims.iss !== 'https://appleid.apple.com') {
    throw new Error("Invalid issuer");
  }
  if (claims.aud !== clientId) {
    throw new Error("Invalid audience");
  }
  // 추가적인 검증 로직을 여기에 추가할 수 있습니다.
}

// Apple의 authorizationCode를 사용하여 refreshToken 및 accessToken을 받아오는 함수
async function fetchAppleTokens(authorizationCode: string): Promise<any> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = generateClientSecret();

  const response = await axios.post('https://appleid.apple.com/auth/token', {
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    grant_type: "authorization_code"
  });

  return response.data;
}

export default router;
