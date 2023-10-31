import dotenv from 'dotenv';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
dotenv.config();

export function generateClientSecret(): string {
    const privateKeyPath = path.join(__dirname, '..', '..', 'AuthKey_KJF9M662UW.p8')
    const privateKey = fs.readFileSync(privateKeyPath);
    const teamId = process.env.TEAM_ID;
    const keyId = process.env.KEY_ID;
    const clientId = process.env.CLIENT_ID;

    const token = jwt.sign({}, privateKey, {
        algorithm: 'ES256',
        expiresIn: '30d',
        audience: 'https://appleid.apple.com',
        issuer: teamId,
        subject: clientId,
        keyid: keyId,
        header: {
            alg: 'ES256',
            kid: keyId
        }
    });

    return token;
}
