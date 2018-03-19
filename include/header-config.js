module.exports = function() {
    return function(req, res, next) {
        res.set('X-Sponsors', 'www.atd.com.co');
        res.set('X-Powered-By', 'APZ Framework');
        res.set('X-Developer', 'Ali Pour Zahmatkesh');
        res.set('X-developer-Email', 'info@ali-pourzahmatkesh.com');
        next();
    }
}
