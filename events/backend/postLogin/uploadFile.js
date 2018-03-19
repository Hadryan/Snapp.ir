var tools = require('../../../include/tools');
var async = require('async');
var fs = require('fs');

function decodeBase64Image(dataString) {
  if ( dataString ) { 

    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
      //return new Error('Invalid input string');
      return false;
    }
    response.type = matches[1];
    switch( response.type ) {
      case 'image/png' :
        response.ext = '.png';
        break;

      case 'image/jpg' :
      case 'image/jpeg' :
      default :
        response.ext = '.jpg';
    }
    response.data = new Buffer(matches[2], 'base64');
    return response;

  } else {
    return false;
  }
}

module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ signup event =========================================================================
  // ==========================================================================================
  var returnCode = socket.on('uploadFile', function(formData){
    console.log('receive : ', formData);

    async.auto(
      {
        rowEdit : function(cb, results) {
          
              dbConnection[formData.model].find(
              { 
                where : { 
                  id : formData.id 
                }
              })
              .success(function( row ) {
                if ( row ) {

                  
                  var base64Data = decodeBase64Image(formData.file1);
                  //console.log(base64Data);
                  if ( base64Data!= false ) {
                    
                    fs.writeFile("public/app/" + formData.path + "/" + formData.id + formData.field + base64Data.ext, base64Data.data, function (err) {
                      if (err) {
                        console.log('ERROR SAVE FILE IN SERVER :: ' + err);
                        cb(null, err);
                      } else {

                        objData = {};
                        objData[formData.field] = formData.id + formData.field + base64Data.ext;
                        arrValidField = [];
                        arrValidField[0] = formData.field;
                        console.log('data object', objData);
                        
                        row.updateAttributes(
                          objData,
                          arrValidField
                        ).success(function() {
                          cb(null, row.dataValues);
                        })
                        .error(function( err ) {
                          cb(null, err);
                        }); 

                      }
                    });

                  } else {
                    cb(null, false);
                  }


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
            'data' : allResult.rowEdit
          };
          socket.emit('uploadFile_res', resultResponse);
      }

    );


  });
  // == signup event /=========================================================================


  return returnCode;

}