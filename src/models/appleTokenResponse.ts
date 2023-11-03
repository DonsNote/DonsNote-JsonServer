export interface AppleTokenResponse {

    access_token: string;
    expires_in: number;
    id_token: string;
    refresh_token: string;
    token_type: 'Bearer';
    
}