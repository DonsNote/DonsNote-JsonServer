export interface Busking {

    id : number;
    artistId : number;
    buskingName : string;
    artistImageURL : string;
    buskingInfo : string;
    startTime : Date;
    endTime : Date;
    latitude : DoubleRange;
    longitude : DoubleRange;

}