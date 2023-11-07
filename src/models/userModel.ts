export interface User {

    id: number;
    artistId : number | null;
    follow : number[];
    block : number[];
    userName: string;
    userInfo: string;
    userImageURL: string;

}