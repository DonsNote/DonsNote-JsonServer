import axios from "axios";
import dotenv from 'dotenv';
import express from "express";
import fs from 'fs/promises';
import jwt from "jsonwebtoken";
import path from "path";
import qs from 'qs';
import { generateClientSecret } from "../utils/makeCliSecret";
dotenv.config();

const router = express.Router();
const secret = process.env.SECRET_KEY;

if (!secret) {
  throw new Error('SECRET_KEY is not defined in the env variables.');
}

const usersFilePath = path.join(__dirname, '..', 'DB', 'users.json');
const authFilePath = path.join(__dirname, '..', 'DB', 'auth', 'auth.json');

router.post("/apple-login", async (req, res) => {
  try {
    const authorizationCode = req.body.code;
    const appleTokenResponse = await fetchAppleTokens(authorizationCode);

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
      userImageURL: "http://54.180.143.129:3000/images/default.jpg"
    };
    await fs.writeFile(usersFilePath, JSON.stringify(users));

    const token = jwt.sign({ id: newId }, secret);
    res.send({ token });
  } catch (error) {
    console.error('Error during Apple login:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// apple response 받기
router.post("/apple-response", async (req, res) => {
  try {
    const responseData = req.body;
    const authData = JSON.stringify(responseData, null, 2);
    await fs.writeFile(authFilePath, authData);
    res.status(200).send({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving apple response data:", error);
    res.status(500).send({ message: "Error saving data" });
  }
});

async function fetchAppleTokens(authorizationCode: string): Promise<any> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = generateClientSecret();

  const response = await axios.post('https://appleid.apple.com/auth/token', qs.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: authorizationCode,
    grant_type: "authorization_code",
    redirect_uri: "http://aesopos.co.kr:3000/apple-response"
  }), {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
}

export default router; 