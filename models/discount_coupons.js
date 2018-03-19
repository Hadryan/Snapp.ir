module.exports = function(sequelize, DataTypes) {
	var DiscountCode = sequelize.define('DiscountCoupon', {
		coupon : {
			type : DataTypes.STRING,
			allowNull : true
		},
		discount_percent : {
			type : DataTypes.STRING,
			allowNull : true
		},
		discount_max_amount : {
			type : DataTypes.STRING,
			allowNull : true
		},
		start_date : {
			type : DataTypes.DATE,
			allowNull : true
		},
		end_date : {
			type : DataTypes.DATE,
			allowNull : true
		},
		city_id : {
			type : DataTypes.INTEGER,
			allowNull : true
		},
	}, {
		timestamps: false,
		tableName: 'discount_coupons',

		classMethods: {
			associate : function(models) {
                DiscountCode.belongsTo( models.City, { foreignKey: 'city_id'} );
            },
		},

		instanceMethods: {

		}
	});

	return DiscountCode;
};