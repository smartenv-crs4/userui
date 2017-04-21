/**
 * Created by Alessandro on 21/04/2017.
 */
exports.crossOrigin = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, Authorization, Content-Length, X-Requested-With');
    if ('OPTIONS' == req.method) res.sendStatus(200);
    else next();
};