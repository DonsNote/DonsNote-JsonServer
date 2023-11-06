export interface Artist {

    id : number;
    artistName : string;
    artistInfo : string;
    artistImageURL : string;

    genres : string;
    youtubeURL : string;
    instagramURL : string;
    soundcloudURL : string;

    members? : number[];
    buskings? : number[];

}