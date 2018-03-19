var lib = require('../../include/lib');
/***********************************************************************************************************************
 request action for requesting increase balance
 ************************************************************************************************************************/
exports.request = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
		find: function(callBack, results) {
			repository.payment.requestIncreaseBalance(body, function (res) {
				callBack(null, res);
			});
		}
	} ,function(err, result) {
		if(result.find.Result == false) {
			res.status(200).json(result.find);
		} else {
			res.status(200).json({Result: true, Data: [result.find.data]});
		}
	});
};
/***********************************************************************************************************************
 confirm action for confirming increase balance
 ************************************************************************************************************************/
exports.confirm = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	lib.async.auto({
		find: function(callBack, results) {
			repository.payment.confirmIncreaseBalance(body, function (res) {
				callBack(null, res);
			});
		}
	} ,function(err, result) {
		if(result.find.Result == false) {
			res.status(200).json(result.find);
		} else {
			res.status(200).json({Result: true, Data: [result.find.data]});
		}
	});
};