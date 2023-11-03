import axios from "axios";
import { AppleTokenResponse } from "../models/appleTokenResponse";
import { generateClientSecret } from "../utils/makeCliSecret";


export async function fetchAppleTokens(authorizationCode: string): Promise<AppleTokenResponse> {
    try {
    const clientId = process.env.CLIENT_ID;
    if (!clientId) {
        throw new Error('CLIENT_ID is not defined in the env variables.');
    }
    const clientSecret = generateClientSecret();

    const tokenData = new URLSearchParams();
    tokenData.append('client_id', clientId);
    tokenData.append('client_secret', clientSecret);
    tokenData.append('code', authorizationCode);
    tokenData.append('grant_type', "authorization_code");
    tokenData.append('redirect_uri', "https://aesopos.co.kr/apple-response");

    const response = await axios.post('https://appleid.apple.com/auth/oauth2/v2/token', tokenData.toString(), {
        headers: {
        'content-type': 'application/x-www-form-urlencoded'
        }
    });

    return response.data;
    } catch (error: unknown) {
    console.error('Error fetching Apple tokens:', error);
    if (axios.isAxiosError(error)) {
        // 여기서 error.response 등의 추가 정보를 로깅할 수 있습니다.
        console.error('Error details:', error.response?.data);
    }
      throw error; // 에러를 다시 던져 호출자가 처리할 수 있도록 합니다.
    }
}
