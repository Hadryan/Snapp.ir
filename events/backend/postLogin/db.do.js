var tools = require('../../../include/tools');
var async = require('async');
var Sequelize = require('sequelize');

module.exports = function(redisClient, namespaceKey, socket, dbConnection, appConfig) {
    
  // ==========================================================================================
  // ==/ db.do event ==========================================================================
  // ==========================================================================================
  var returnCode = socket.on('db.do', function(formData){

    if ( formData ) {
      if ( typeof formData !== 'object') {
        formData = JSON.parse(formData);
      }
      console.log('receive : ', formData);
    } else {
      return false;
    }


    // -- validate model name ---------------------------------------------------
    // --------------------------------------------------------------------------
    var theModelName = null;
    if ( formData.modelName ) {
      theModelName = formData.modelName;  
    } else {
      // invalid model name
      return false;
    }
    // --------------------------------------------------------------------------


    // -- validate function name ------------------------------------------------
    // --------------------------------------------------------------------------
    var theFuncName = 'findAll';
    var theFuncNameIsValid = false;

    switch( formData.funcName ) {
      case 'find' :
      case 'all' :
      case 'findAll' :
      case 'findAndCountAll' :
      case 'count' :
      case 'sum' :
      case 'max' :
      case 'min' :
        theFuncNameIsValid = true;
      break;

      default :
        // invalid function name
        theFuncNameIsValid = false;          
    }

    if ( theFuncNameIsValid ) {
      theFuncName = formData.funcName;  
    } else {
      // invalid function name
      return false;
    }
    // --------------------------------------------------------------------------


    // -- validate configuration ------------------------------------------------
    // --------------------------------------------------------------------------
    var theConfiguration = null;
    if ( formData.configuration ) {
      theConfiguration = formData.configuration;
      if( theConfiguration.include ) {
        var realInclude = []; 
        async.each(theConfiguration.include, function( item, callback) {
          realInclude.push( { model : dbConnection[item.model] } );
          callback();
        }, function(err){
            if( err ) {
              return false;
            } else {
              theConfiguration.include = realInclude;   
            }
        });
      }
      //console.log('configuration is : ', theConfiguration);
    }
    // --------------------------------------------------------------------------

    async.auto(
      {
        mainList : function(cb, results) {

          dbConnection[theModelName][theFuncName]( theConfiguration )
            .success(function( theResult ) {
              if ( theResult ) {
                cb(null, theResult);
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
          'funcName' : theFuncName,
          'data' : allResult.mainList
        };
        socket.emit('db.do_res', resultResponse);
      }

    );


  });
  // == db.do event /==========================================================================


  return returnCode;

}