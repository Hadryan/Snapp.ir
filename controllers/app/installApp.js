var lib = require('../../include/lib');
//******************Repositories******************
exports.index = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse(JSON.stringify(req.body));
	const OK = 'OK'
	body.validation = function (params) {
		this.status = true
		for (var key in params) {
			if (!(typeof this[params[key]] != 'undefined' && this[params[key]] && this[params[key]] != "")) {
				this.status = false;
			}
		}
	}
	var params = ['DeviceId', 'Token']
	body.validation(params)
	if (body.status) {
		lib.async.auto
		(
			{
				installApp: function (cb, results) {
					repository.userToken.updateOrCreate(body, function (result) {
						cb(null, (result ? {status: OK} : {status: 'missesDeviceId'}))
					})
				}
			},
			function (err, allResult) {
				if (allResult.installApp.status == OK) {
					res.status(200).json({Result: true, Data: [{}]})
				} else {
					res.json(lib.errorCodes.setError(allResult.installApp.status))
				}
			}
		)
	} else {
		res.json(lib.errorCodes.setError('emptyParams'))
	}
}