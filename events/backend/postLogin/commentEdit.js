var tools = require('../../../include/tools');
var async = require('async');
var Sequelize = require('sequelize');

module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ signup event =========================================================================
  // ==========================================================================================
  var returnCode = socket.on('comment.edit', function(formData){

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
        commentEdit : function(cb, results) {

              dbConnection.Comment.find(
                { 
                  where : { 
                    id : formData.id
                  }
                }
              )
              .success(function( comment ) {
                if ( comment ) {

                  comment.updateAttributes(
                    formData,
                    ['description', 'passcode', 'detail', 'editor1', 'status', 'age', 'introduceType', 'UserId', 'way', 'when', 'thetime']
                  ).success(function() {
                    cb(null, comment.dataValues);
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
            'data' : allResult.commentEdit
          };
          socket.emit('comment.edit_res', resultResponse);
      }

    );


  });
  // == signup event /=========================================================================


  return returnCode;

}