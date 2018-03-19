var tools = require('../../../include/tools');
var async = require('async');
var Sequelize = require('sequelize');

module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ signup event =========================================================================
  // ==========================================================================================
  var returnCode = socket.on('comment.add', function(formData){

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
        commentAdd : function(cb, results) {

            dbConnection.Comment.create(formData).success(function( comment ) {
              if ( comment ) {
                cb(null, comment.dataValues);
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
            'allowAdd' : true,
            'data' : allResult.commentAdd
          };
          socket.emit('comment.add_res', resultResponse);
      }

    );


  });
  // == signup event /=========================================================================


  return returnCode;

}