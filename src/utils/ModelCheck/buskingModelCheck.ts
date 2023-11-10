import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

export const buskingValidationRules = [
body('id').optional().isNumeric(),
body('artistId').optional().isNumeric(),
body('buskingName').optional().isString(),
body('artistImageURL').optional().isString(),
body('startTime').optional().custom(isValidDate),
body('endTime').optional().custom(isValidDate),
body('latitude').optional().isNumeric(),
body('longitude').optional().isNumeric(),

];

function isValidDate(value: string) {
    if (!value) return true; // 값이 없으면 통과
    const date = new Date(value);
    return !isNaN(date.getTime()); // 유효한 날짜인지 검사
}

// 검증 결과를 처리하는 미들웨어
export const validateBusking = (req: Request, res: Response, next: NextFunction) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
next();
};