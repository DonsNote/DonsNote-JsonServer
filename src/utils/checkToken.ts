import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY || "Dafault");
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
