var express = require('express');
var connect = require('connect');
var app = express();
var fs        = require('fs')
  , path      = require('path')
  , lodash    = require('lodash');

var appConfig = require('../config.json')[app.get('env')];

var Sequelize = require('sequelize');
var myLogFunc = function (msg) {
	console.log(msg);
	var date = new Date();
	var fullYear = date.getFullYear();
	var fullMonth = date.getMonth();
	var fullDay = date.getDate();
	var fileName = 'logs/'+fullYear+'-'+fullMonth+'-'+fullDay+'.log';
	if (fs.existsSync(fileName)) {
		fs.appendFileSync(fileName, '\n'+new Date()+'\t'+msg);
	} else {
		fs.writeFileSync(fileName, '\n'+new Date()+'\t'+msg);
	}
};
var sequelize = new Sequelize(appConfig.db.database, appConfig.db.user, appConfig.db.pass, {
	host: appConfig.db.host,
	logging: myLogFunc,
  define: {
    underscored: false,
    syncOnAssociation: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    timestamps: true
  }
});
var db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  });
 
Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});
 
module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);