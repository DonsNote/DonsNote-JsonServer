import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/checkToken";
import { getUserById } from "../utils/getUserById"; // getUserById 함수를 임포트합니다.

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    try {
        const decoded = verifyToken(token) as JwtPayload;
        const userId = decoded.id;
        const user = getUserById(userId); // 사용자 정보 조회
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};