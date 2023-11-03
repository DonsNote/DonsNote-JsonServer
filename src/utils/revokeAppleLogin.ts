import axios from "axios";
import { generateClientSecret } from "../utils/makeCliSecret";

export async function revokeAppleLogin(refreshToken: string): Promise<void> {
const clientId = process.env.CLIENT_ID;
if (!clientId) {
    throw new Error('CLIENT_ID is not defined in the env variables.');
}
const clientSecret = generateClientSecret();

const tokenData = new URLSearchParams();
tokenData.append('client_id', clientId);
tokenData.append('client_secret', clientSecret);
tokenData.append('token', refreshToken);
tokenData.append('token_type_hint', 'refresh_token');

const response = await axios.post('https://appleid.apple.com/auth/oauth2/v2/revoke', tokenData.toString(), {
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    },
});

if (response.status !== 200) {
    throw new Error('Failed to revoke Apple token.');
}}
