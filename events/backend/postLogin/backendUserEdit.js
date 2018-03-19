var tools = require('../../../include/tools');
var async = require('async');
var Sequelize = require('sequelize');

module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ signup event =========================================================================
  // ==========================================================================================
  var returnCode = socket.on('backend.user.edit', function(formData){

    if ( formData ) {
      if ( typeof formData !== 'object') {
        formData = JSON.parse(formData);
      }
      console.log('receive : ', formData);
    } else {
      return false;
    }

    async.auto(
      {
        userEdit : function(cb, results) {

            
              dbConnection.BackendUser.find(
                { 
                  where : { 
                    id : formData.id 
                  }
                }
              )
              .success(function( user ) {
                if ( user ) {

                  formData.password = tools.encode(formData.password);

                  user.updateAttributes(
                    formData, 
                    ['fullname', 'username', 'email', 'status', 'gender', 'mobileNumber', 'password', 'img']
                  ).success(function() {
                    cb(null, user.dataValues);
                  })
                  .error(function( err ) {
                    cb(null, err);
                  }); 

                } else {
                  cb(null, false);
                }
              })
              .error(function( err ) {
                cb(null, err);
              }); 

        },

      },

      function(err, allResult) {
          resultResponse = {
            'result' : true,
            'data' : allResult.userEdit
          };
          socket.emit('backend.user.edit_res', resultResponse);
      }

    );


  });
  // == signup event /=========================================================================


  return returnCode;

}