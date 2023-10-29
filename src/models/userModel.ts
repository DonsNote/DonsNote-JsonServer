import { Artist } from './artistModel';

export interface User {

    id: number;
    userName: string;
    userInfo: string;
    userImageURL: string;
    userArtist?: Artist;

}