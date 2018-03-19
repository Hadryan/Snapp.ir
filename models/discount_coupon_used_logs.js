module.exports = function (sequelize, DataTypes) {
	var DiscountCouponUsedLog = sequelize.define('DiscountCouponUsedLog', {
		couponId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		orderPrice: {
			type: DataTypes.STRING,
			allowNull: true
		},
		discountPrice: {
			type: DataTypes.STRING,
			allowNull: true
		}
	}, {
		timestamps: false,
		tableName: 'discount_coupon_used_logs',

		classMethods: {
			associate: function (models) {
			},
		},

		instanceMethods: {}
	});

	return DiscountCouponUsedLog;
};