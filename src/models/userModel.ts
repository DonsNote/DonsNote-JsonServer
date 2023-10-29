import { Artist } from './artistModel';

export interface User {

    id: number;
    userName: string;
    userInfo: string;
    userImageURL: string;
    userArtist?: Artist; // '?'는 userArtist가 optional임을 나타냅니다.

}