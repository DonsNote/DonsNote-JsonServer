import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';

export function generateClientSecret(): string {
    const privateKeyPath = path.join(__dirname, '..', '..', 'AuthKey_22Y4RW292W.p8')
    const privateKey = fs.readFileSync(privateKeyPath).toString();
    const iss = process.env.TEAM_ID;
    const kid = process.env.KEY_ID;
    const sub = process.env.CLIENT_ID;

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 15777000;

    const token = jwt.sign(
        {
            iss: iss,
            iat: iat,
            exp: exp,
            aud: "https://appleid.apple.com",
            sub: sub
        },
        privateKey,
        {
            algorithm: 'ES256',
            header: {
                alg: 'ES256',
                kid: kid,
                typ: undefined
            }
        }
    );
    
    return token;
}
