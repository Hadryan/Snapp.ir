var lib = require('../include/lib');
//******************SEPARATE******************
var checkDiscountCoupon = function (params, callBack) {
	lib.dbConnection.DiscountCoupon.find({
		where: {
			coupon: params.DiscountCode,
			start_date: {lte: new Date()},
			end_date: {gte: new Date()},
		}
	}).success(function (discountCode) {
		if (discountCode) {
			lib.dbConnection.DiscountCouponUsedLog.find({
				where: {
					couponId: discountCode.id,
					userId: params.UserId
				}
			}).success(function (discountCodeUsed) {
				if (!discountCodeUsed) {
					var discount = parseInt(params.TripPrice) * parseInt(discountCode.discount_percent) / 100;
					if (discount > parseInt(discountCode.discount_max_amount)) {
						discount = parseInt(discountCode.discount_max_amount);
					}
					var price = params.TripPrice - discount;
					if (price < 0) {
						price = 0;
					}
					callBack({
						Result: true,
						Data: [{
							price: price,
							discountCodeId: discountCode.id,
							DiscountFlag: 1
						}]
					});
				} else {
					console.log('discount code used before');
					callBack(lib.errorCodes.setError('discountCodeNotValid'));
				}
			}).error(function (error) {
				console.log("an error accord: ", error);
				callBack(lib.errorCodes.setError('dbError'));
			});
		} else {
			console.log('discount code not found');
			callBack(lib.errorCodes.setError('discountCodeNotValid'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
var checkDiscountCode = function (params, callBack) {
	lib.dbConnection.DiscountCode.find({
		where: {discount_code: params.DiscountCode}
	}).success(function (discountCode) {
		if (discountCode) {
			if (discountCode.user_id == params.UserId) {
				lib.dbConnection.DiscountCodeAvailableForUser.find({
					where: {
						user_id: params.UserId,
						discount_code_used_id: discountCode.id,
						used_flag: 0
					}
				}).success(function (userDiscountCode) {
					if (userDiscountCode) {
						var price = params.TripPrice - userDiscountCode.available_discount_price;
						if (price < 0) {
							price = 0;
						}
						callBack({
							Result: true,
							Data: [{
								price: price,
								discountCodeId: userDiscountCode.discount_code_used_id,
								DiscountFlag: 0
							}]
						});
					} else {
						console.log('discount code same user not used before');
						callBack(lib.errorCodes.setError('discountCodeNotValid'));
					}
				}).error(function (error) {
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			} else {
				lib.dbConnection.DiscountCodeUsedLog.find({
					where: {
						user_id: params.UserId,
						discount_code_id: discountCode.id,
					}
				}).success(function (userLogDiscountCode) {
					if (userLogDiscountCode) {
						console.log('discount code used before');
						callBack(lib.errorCodes.setError('discountCodeNotValid'));
					} else {
						var price = params.TripPrice - parseInt(lib.Constants.setConstant("defaultDiscountAmount"));
						if (price < 0) {
							price = 0;
						}
						callBack({
							Result: true,
							Data: [{price: price, discountCodeId: discountCode.id, DiscountFlag: 0}]
						});
					}
				}).error(function (error) {
					console.log("an error accord: ", error);
					callBack(lib.errorCodes.setError('dbError'));
				});
			}
		} else {
			console.log('discount code not found');
			callBack(lib.errorCodes.setError('discountCodeNotValid'));
		}
	}).error(function (error) {
		console.log("an error accord: ", error);
		callBack(lib.errorCodes.setError('dbError'));
	});
};
//******************SEPARATE******************
exports.applyDiscountCode = function (params, callBack) {
	var repo = require('../include/repo');
	var repository = new repo();
	var validateParams = {"params": params, "requireParams": ['DeviceId', 'UserId', 'TripPrice', 'DiscountCode']};
	repository.validate.validate(validateParams, function (validationResult) {
		if (validationResult.Result) {
			// callBack(lib.errorCodes.setError('discountCodeNotValid'));
			checkDiscountCoupon(params, function (discountCouponResult) {
				// callBack(discountCouponResult);
				if (discountCouponResult.Result) {
					callBack(discountCouponResult);
				} else {
					checkDiscountCode(params, function (discountCodeResult) {
						callBack(discountCodeResult);
					});
				}
			});
		} else {
			callBack(validationResult);
		}
	});
};