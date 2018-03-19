var lib = require('../../include/lib');
var theNamespace = 'backend';
//******************SEPARATOR******************
exports.index = function (req, res) {
    lib.tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
        if (userLoggedIn === false) {
            res.redirect('/' + theNamespace + '/login');
        } else {
            lib.dbConnection.Setting.findAll({limit:1}).success(function(setting){
            	setting = setting[0];
            	if(req.body.commission_amount){
            		setting.commission_amount = req.body.commission_amount;
            		setting.save();
	            }
                res.render(theNamespace+'/setCommission/index',{
                    userLoggedInDetails: userLoggedIn,
	                setting: setting,
                    selectedMenu: 'setCommission'
                })
            }).error(function (error) {
                res.json(lib.errorCodes.setError("dbError"));
            });
        }
    })
};