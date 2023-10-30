import jwt from "jsonwebtoken";

const SECRET_KEY = "your_secret_key"; // 이전에 정의한 SECRET_KEY

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
