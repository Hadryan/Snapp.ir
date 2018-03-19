module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ signup event =========================================================================
  // ==========================================================================================
  var returnCode = socket.on('forgotPass', function(formData){
    console.log('receive : ', formData);

      dbConnection.BackendUser.find(
        { 
          where : {
            mobileNumber : formData.mobileNumber
          }
        }
      ).complete(function(err, userRow) {
      	
        if (!!err) {

          resultResponse = {
            'result' : false,
            'errorAllObj' : {
              'ALL' : 'There is an error in Database, please wait a little and try again.'
            }
          };
          socket.emit('forgotPass_res', resultResponse);
          console.log('error happend', error, resultResponse);

        } else if (!userRow) {

          resultResponse = {
            'result' : false,
            'errorAllObj' : {
              'ALL' : 'User not found. Please provide a valid MOBILE NUMBER please.'
            }
          };
          socket.emit('forgotPass_res', resultResponse);
          console.log('user not found', resultResponse);

        } else {

	        userRow.forgotPassword(redisClient, appConfig.sms, function(){
	          console.log('yes backend password sent', userRow.dataValues);

            resultResponse = {
              'result' : true,
              'successAllObj' : {
                'ALL' : 'Your password sent to your mobile number.'
              }
            }
	          socket.emit('forgotPass_res', resultResponse);
	        });

        }

      });  


  });
  // == signup event /=========================================================================


  return returnCode;

}