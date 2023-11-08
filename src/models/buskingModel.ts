export interface Busking {

    id : number;
    artistId : number;
    artistImageURL : string;
    buskingInfo : string;
    startTime : Date;
    endTime : Date;
    latitude : DoubleRange;
    longitude : DoubleRange;

}