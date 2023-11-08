import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

export const buskingValidationRules = [
body('id').optional().isNumeric(),
body('artistId').optional().isNumeric(),
body('artistImageURL').optional().isString(),
body('startTime').optional().isDate(),
body('endTime').optional().isDate(),
body('latitude').optional().isNumeric(),
body('longitude').optional().isNumeric(),

];

// 검증 결과를 처리하는 미들웨어
export const validateBusking = (req: Request, res: Response, next: NextFunction) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
next();
};