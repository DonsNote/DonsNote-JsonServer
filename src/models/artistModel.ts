import { Busking } from './buskingModel';
import { Member } from './memberModel';

export interface Artist {

    id : number;
    artistName : string;
    artistInfo : string;
    artistImage : string;

    genres : string;
    youtubeURL : string;
    instagramURL : string;
    soundcloudURL : string;

    members? : Member;
    buskings? : Busking;

}