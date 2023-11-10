import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

export const reportValidationRules = [
body('id').optional().isNumeric(),
body('userid').optional().isNumeric(),
body('artistId').optional().isNumeric(),
body('report').optional().isString(),

];

// 검증 결과를 처리하는 미들웨어
export const validateReport = (req: Request, res: Response, next: NextFunction) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
next();
};