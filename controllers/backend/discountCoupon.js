var lib = require('../../include/lib')
var theNamespace = 'backend'
//******************SEPARATOR******************
exports.index = function (req, res) {
	lib.tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login')
		} else {
			lib.dbConnection.DiscountCoupon.findAll({
				include: [lib.dbConnection.City]
			}).success(function (discountCoupon) {
				res.render(theNamespace + '/discountCoupon/index', {
					userLoggedInDetails: userLoggedIn,
					data: discountCoupon,
					selectedMenu: 'discountCoupons'
				})
			}).error(function (error) {
				res.json(lib.errorCodes.setError('dbError'))
			})
		}
	})
}
//******************SEPARATOR******************
exports.create = function (req, res) {
	lib.tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login')
		} else {
			lib.dbConnection.State.findAll({include: [lib.dbConnection.City]}).then(function (States) {
				res.render(theNamespace + '/discountCoupon/create', {
					userLoggedInDetails: userLoggedIn,
					States: States,
					selectedMenu: 'discountCoupons'
				})
			}).catch(function (error) {
				console.log('an error accord: ', error)
				res.json(lib.errorCodes.setError('dbError'))
			})
		}
	})
}
//******************SEPARATOR******************
exports.saveData = function (req, res) {
	lib.tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login')
		} else {
			lib.dbConnection.DiscountCoupon.create({
				coupon: req.body.coupon,
				discount_percent: req.body.discount_percent,
				discount_max_amount: req.body.discount_max_amount,
				start_date: (lib.moment(req.body.start_date+' 00:00:00', 'jYYYY/jMM/jDD HH:mm:SS').format('YYYY-MM-DD HH:mm:SS')),
				end_date: (lib.moment(req.body.end_date+' 23:59:59', 'jYYYY/jMM/jDD HH:mm:SS').format('YYYY-MM-DD HH:mm:SS')),
				city_id: req.body.city_id,
			}).then(function (discountCoupon) {
				res.redirect('/backend/discount_coupon/index')
			}).catch(function (error) {
				console.log('an error accord: ', error)
				res.json(lib.errorCodes.setError('dbError'))
			})
		}
	})
}
//******************SEPARATOR******************
exports.delete = function (req, res) {
	lib.tools.getLoggedInUser(theNamespace, req.sessionID, function (userLoggedIn) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login')
		} else {
			lib.dbConnection.DiscountCoupon.find({where: {id: req.body.id}}).then(function (discountCoupon) {
				if (discountCoupon) {
					discountCoupon.destroy().then(function () {
						res.json({Result: true});
					}).catch(function (error) {
						console.log('an error accord: ', error)
						res.json(lib.errorCodes.setError('dbError'))
					})
				} else {
					res.json({Result: false});
				}
			}).catch(function (error) {
				console.log('an error accord: ', error)
				res.json(lib.errorCodes.setError('dbError'))
			})
		}
	})
}