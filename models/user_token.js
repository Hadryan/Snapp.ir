var tools = require('../include/tools');

module.exports = function(sequelize, DataTypes) {
    var UserToken = sequelize.define('UserToken',
        {
            device_id : {
                type : DataTypes.TEXT
                , allowNull : true


            },
            token : {
                type : DataTypes.TEXT
                , allowNull : true


            },
            user_id : {
                type : DataTypes.INTEGER



            },
            app_id : {
                type : DataTypes.INTEGER
                , allowNull : true


            },
            created_at : {
                type : DataTypes.TEXT
                , allowNull : true


            },
            updated_at : {
                type : DataTypes.TEXT
                , allowNull : true


            },
        },
        {
            timestamps: true,
            freezeTableName: true,
            tableName: 'user_token',

            classMethods: {
                associate : function(models) {
                },
            },

            instanceMethods: {
            }
        }
    );

    return UserToken;
}
