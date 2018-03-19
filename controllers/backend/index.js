var redis = require("redis");
var redisClient = redis.createClient();

var dbConnection = require('../../models');
var tools = require('../../include/tools');

var async = require('async');
var theNamespace = 'backend';

// ******************************************************************************************
// ** /Define routers  **********************************************************************
// ******************************************************************************************

    // -- /Route / --------------------------------------------------------------------------
    exports.index = function(req, res){
      
      tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ){
        if ( userLoggedIn === false ) {
          console.log('index - User not logged in at ' + theNamespace + ' panel!');
          res.redirect('/' + theNamespace + '/login');
        } else {
          console.log('index - logged in ' + theNamespace + ' as user ID ' + userLoggedIn.id);
          res.redirect('/' + theNamespace + '/dashboard');
        }
      });

    }
    // -- Route / /--------------------------------------------------------------------------



    // -- /Route /logout --------------------------------------------------------------------
    exports.logout = function(req, res){

      tools.logoutUser(theNamespace, req.sessionID, function(){
        console.log('yes logout ' + theNamespace);
        res.redirect('/' + theNamespace + '/login');                
      });

    }
    // -- Route /logout /--------------------------------------------------------------------



    // -- /Route /login ---------------------------------------------------------------------
    exports.login = function(req, res){
      tools.logoutUser(theNamespace, req.sessionID, function(){
        res.render(theNamespace + '/login/index',{
        });
      });
    }
    // -- Route /login /---------------------------------------------------------------------



    // -- /Route /dashboard -----------------------------------------------------------------
    exports.dashboard = function(req, res){


      tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ){
        if ( userLoggedIn === false ) {
          console.log('dashboard - User not logged in at ' + theNamespace + ' panel!');
          res.redirect('/' + theNamespace + '/login');
        } else {

          res.render(theNamespace + '/dashboard/index',{
              userLoggedInDetails : userLoggedIn,
              selectedMenu : 'dashboard'
          });

        }
      });


    }
    // -- Route /dashboard /-----------------------------------------------------------------



    // -- /Route /lockscreen ----------------------------------------------------------------
    exports.lockscreen = function(req, res){
      res.redirect('/' + theNamespace + '/login');
    }
    // -- Route /lockscreen /----------------------------------------------------------------



    // -- /Route /lockscreen/:username ------------------------------------------------------
    exports.lockscreenUsername = function(req, res){

      var currentUsername = req.params.username;
      if ( currentUsername ) { 

        dbConnection.BackendUser.find(
          { 
            where : { 
              username : currentUsername, 
              status : 'Active' 
            }
          }
        )
        .success(function( user ) {

          if ( user ) {
            res.render(theNamespace + '/login/lockscreen',{
                userDetails : user.dataValues
            });
          } else {
            console.log('Username not found!');
            res.redirect('/' + theNamespace + '/login');
          }

        }).error(function(){
          console.log('Error found!');
          res.redirect('/' + theNamespace + '/login');
        });


      } else {
        console.log('Invalid username');
        res.redirect('/' + theNamespace + '/login');
      }

    }
    // -- Route /lockscreen/:username /------------------------------------------------------


// ** Define routers/ ***********************************************************************