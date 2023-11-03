// userModelCheck.ts
import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// User 인터페이스에 대한 검증 규칙 정의
export const userValidationRules = [
body('id').optional().isNumeric(),
body('artistId').optional().isNumeric(),
body('follow').optional().isArray(),
body('block').optional().isArray(),
body('userName').optional().isString(),
body('userInfo').optional().isString(),
body('userImageURL').optional().isString(),

];

// 검증 결과를 처리하는 미들웨어
export const validateUser = (req: Request, res: Response, next: NextFunction) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
next();
};
