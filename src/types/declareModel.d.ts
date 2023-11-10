declare global {
    namespace Express {
        interface Request {
            user?: import('../models/userModel').User;
            artist?: import('../models/artistModel').Artist;
            busking?: import('../models/buskingModel').Busking;
            member?: import('../models/memberModel').Member;
            report?: import('../models/reportModel').Report
        }
    }
}

export { };
