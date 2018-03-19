var express = require('express');
var connect = require('connect');
/*
test panel
 */
var app = express();
var fs = require('fs');
var responseTime = require('response-time');
var dbConnection = require('./models');

var cookieParser = require('cookie-parser');
var session      = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = require("redis");

var redisClient = redis.createClient();

var appConfig = require('./config.json')[app.get('env')];
var tools = require("./include/tools");

app.set('port', appConfig.host.port);

dbConnection
.sequelize
.sync({ force: false }) // if true try to make Tables again
.complete(function(err) {
	if (err) {
		console.log(err);
		throw err[0];
	} else {
		console.log('runing server for project ' + appConfig.app.name + ' at port ' + appConfig.host.port + ' successfully.');
		var server = app.listen(app.get('port'));
		var io = require('socket.io').listen(server);
		//app.locals.io = io;
		// ******************************************************************************************
		// ** /prepare Event array to Load dynamically **********************************************
		// ******************************************************************************************
		var eventNamespaceList = [];
		var eventDir = fs.readdirSync('events');
		//console.log('directory list : ', eventDir);
		eventDir.forEach(function (dirRoot, i) {
			var dirName = 'events/' + dirRoot;
			var rowStat = fs.statSync(dirName);
			if (rowStat.isDirectory()) {
				var eventSubDir = fs.readdirSync(dirName);
				//console.log('sub directory list :' , eventSubDir);
				if (eventSubDir.length > 0) {
					eventSubDir.forEach(function (dirSub, i) {
						var dirSubName = dirName + '/' + dirSub;
						var rowStat = fs.statSync(dirSubName);
						if (rowStat.isDirectory()) {
							var eventSubDirFiles = fs.readdirSync(dirSubName);
							if (eventSubDirFiles.length > 0) {
								eventSubDirFiles.forEach(function (fileName, i) {
									if (fileName.split('.')[1] !== 'js') {
										eventSubDirFiles.splice(i, 1);
									}
								});
								eventRow = [
									dirRoot + '/' + dirSub,
									eventSubDirFiles
								];
								eventNamespaceList.push(eventRow);
							}
						}
					});
				}
			}
		});
		console.log('event structure loading : ', eventNamespaceList);
		// ** prepare Event array to Load dynamically/ **********************************************
		// ******************************************************************************************
		// ** /namespace socket management **********************************************************
		// ******************************************************************************************
		eventNamespaceList.forEach(function (namespaceRow, i) {
			var namespacePath = namespaceRow[0];
			var eventList = namespaceRow[1];
			var namespaceKey = namespacePath.replace('/', '_');
			if (namespacePath.split('/')[1] == 'default') {
				var namespaceIo = io.of('/' + namespacePath.split('/')[0]);
			} else {
				var namespaceIo = io.of('/' + namespaceKey);
			}
			redisClient.set('counter' + namespaceKey, 0);
			// ** /namespace connect event **************************************************************
			namespaceIo.on('connection', function (socket) {
				/*
				 if ( namespaceKey=='restaurant_postLogin' ) {
				 smg = socket.manager;
				 tools.log('socket manager', smg);
				 srv = socket.manager.server;
				 tools.log('server', srv);
				 //srv.of('/restaurant_postLogin').broadcast.emit('reserve.table.update_res', {});
				 nsp = socket.manager.namespaces['/restaurant_postLogin'];
				 tools.log('namespace', nsp);
				 nsp.manager.sockets.emit('reserve.table.update_res', {});
				 }
				 */
				if (namespacePath.split('/')[1] == 'postLogin') {
					sessionId = tools.getSessionIdBySocket(socket, appConfig.app.sessionKey);
					tools.log('======== session socket ===========', sessionId);
					tools.getLoggedInUser(namespacePath.split('/')[0], sessionId, function (userLoggedIn) {
						if (userLoggedIn === false) {
							console.log(namespaceKey + ' - User not logged in at ' + namespacePath.split('/')[0] + ' panel!');
							resultResponse = {
								'error': 'This namespace need authentication but you not provide any authenticated user!'
							};
							socket.emit('need_authentication', resultResponse);
							socket.disconnect();
						} else {
							console.log(namespaceKey + ' - logged in ' + namespacePath.split('/')[0] + ' as user ID ' + userLoggedIn.id);
							eventList.forEach(function (eventKey, i2) {
								require('./events/' + namespacePath + '/' + eventKey)(redisClient, namespaceKey, socket, dbConnection, appConfig);
							});
						}
						tools.log('==================================', ' done events ' + namespaceKey);
					});
				} else {
					eventList.forEach(function (eventKey, i2) {
						require('./events/' + namespacePath + '/' + eventKey)(redisClient, namespaceKey, socket, dbConnection, appConfig,io);
					});
				}
			});
			// ** namespace connect event/ **************************************************************
		});
		// ** namespace socket management/ ************************************************************
	}
});
var php = require('phpjs');
app.locals.$ = php;
//console.log( php.nl2br('apz\nnext\n\ntest') ); // in js usage
// $.nl2br( parameter ); // in view usage
var path = require('path');
var favicon = require('static-favicon');
// var logger = require('morgan');
var bodyParser = require('body-parser');
var headerConfig = require('./include/header-config');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon());
// app.use(logger('dev'));
app.use(bodyParser.json({
    keepExtensions: true,
    uploadDir: './upload_files'
}));
app.use(bodyParser.urlencoded());
app.use(cookieParser('APZSecretKey'));
app.use(session({
    //secret: 'APZSecretKey',
    //cookie: { secure: true },
    store: new RedisStore({
    }),
    key : appConfig.app.sessionKey
}));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'upload_files')));
//app.use(responseTime(5));
// ******************************************************************************************
// **/ Define routers  **********************************************************************
// ******************************************************************************************
app.use('/', function(req, res, next) {
	app.locals.appConfig = appConfig;
	//req.db = dbConnection;
	//req.session.testSession = 1;
	//console.log('session content :', req.session.testSession );
	//req.session.testSession++;
	//console.log('-------------------------------------------------');
	//console.log('session id in app.js : ', req.session.id);
	//console.log('session id in app.js : ', req.sessionID);
	//console.log('-------------------------------------------------');
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
// Routers
// application Start ----------------------------------------------------------------------------
require('./appRouters')(app);
// application end ----------------------------------------------------------------------------

// application socket start ----------------------------------------------------------------------------
app.get('/driver_socket',function(req,res) {
	res.render("driver_socket");
});
app.get('/passenger_socket',function(req,res) {
	res.render("passenger_socket");
	/*var theNamespace='backend'
	tools.getLoggedInUser(theNamespace, req.sessionID, function( userLoggedIn ) {
		if (userLoggedIn === false) {
			res.redirect('/' + theNamespace + '/login');
		} else {
			res.render("passenger_socket",{
				userLoggedIn:userLoggedIn
			});
		}
	})*/

});
// application socket start ----------------------------------------------------------------------------

// backend Start ----------------------------------------------------------------------------
require('./backendRouters')(app)
// backend End ------------------------------------------------------------------------------
// ******************************************************************************************
// ** /catch 404 and forward to error handler ***********************************************
// ******************************************************************************************
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// ** /catch 404 and forward to error handler/ **********************************************
// ******************************************************************************************
// ** /development error handler ************************************************************
// will print stacktrace
// ******************************************************************************************
if (app.get('env') === 'development') {
    app.locals.pretty = true;
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
		console.log("err.message",err.message)
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// ** development error handler/ *************************************************************
// ******************************************************************************************
// ** /production error handler *************************************************************
// no stacktraces leaked to user
// ******************************************************************************************
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
	console.log("err.message",err.message)
    res.render('error', {
        message: err.message,
        error: {}
    });
});
// ** production error handler/ *************************************************************