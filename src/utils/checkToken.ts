import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";


if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is not defined');
}

const secret = process.env.SECRET_KEY as string;

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new Error("Token has expired");
    } else if (error instanceof JsonWebTokenError) {
      throw new Error("Invalid token");
    } else if (error instanceof NotBeforeError) {
      throw new Error("Token not active");
    } else {
      throw new Error("Token cannot be processed");
    }
  }
};
