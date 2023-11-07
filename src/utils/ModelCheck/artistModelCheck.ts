// artistModelCheck.ts
import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// artist 인터페이스에 대한 검증 규칙 정의
export const artistValidationRules = [
body('id').optional().isNumeric(),
body('artistName').optional().isString(),
body('artistInfo').optional().isString(),
body('artistImageURL').optional().isString(),
body('genres').optional().isString(),
body('youtubeURL').optional().isString(),
body('instagramURL').optional().isString(),
body('soundcloudURL').optional().isString(),
body('members').optional().isArray(),
body('buskings').optional().isArray(),
body('followers').optional().isArray(),
];

// 검증 결과를 처리하는 미들웨어
export const validateArtist = (req: Request, res: Response, next: NextFunction) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
}
next();
};