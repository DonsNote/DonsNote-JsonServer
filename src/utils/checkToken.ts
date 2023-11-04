import jwt from "jsonwebtoken";

if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined');
}

const secret = process.env.SECRET_KEY as string;

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
