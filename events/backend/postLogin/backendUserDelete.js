var tools = require('../../../include/tools');
var async = require('async');

module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ signup event =========================================================================
  // ==========================================================================================
  var returnCode = socket.on('backend.user.delete', function(formData){

    if ( formData ) {
      if ( typeof formData !== 'object') {
        formData = JSON.parse(formData);
      }
      console.log('receive : ', formData);
    } else {
      return false;
    }

    if ( formData.chkSelect ) {

      async.auto(
        {
          userDelete : function(cb, results) {
              
              dbConnection.BackendUser.destroy({
                id : formData.chkSelect                   
              }).success(function(affectedRows) {
                console.log('destroy success ', affectedRows);
                cb(null, affectedRows);
              }).error(function( err ) {
                cb(null, false);
              }); 

          },
        },

        function(err, allResult) {
            resultResponse = {
              'result' : true,
              'data' : allResult.userDelete
            };
            socket.emit('backend.user.delete_res', resultResponse);
        }

      );

    }


  });
  // == signup event /=========================================================================


  return returnCode;

}