import { Artist } from './artistModel';
import { Busking } from './buskingModel';
import { Member } from './memberModel';
import { User } from './userModel';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            artist?: Artist;
            busking?: Busking;
            member?: Member;
        }
    }
}
