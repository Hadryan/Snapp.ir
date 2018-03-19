var appRoot = require('app-root-path');
var randomstring = require("randomstring");
var async = require('async');
var tools = require('../include/tools');
var dbConnection = require('../models');
var errorCodes = tools.ErrorCodes;
var Constants = tools.Constants;
var moment = require('moment-jalaali');
var Sequelize = require('sequelize');
var config = require('../config.json');
var firebase = require("firebase");
var jwt = require('jsonwebtoken');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var xml2js = require('xml2js');
var conf = {
	apiKey: "AIzaSyBctqBS9ceQTHXKeumbzYnTInVxVobDHDo",
	authDomain: "hoober-2b5d9.firebaseapp.com",
	databaseURL: "https://hoober-2b5d9.firebaseio.com",
	storageBucket: "hoober-2b5d9.appspot.com",
	messagingSenderId: "987087596991"
};
firebase.initializeApp(conf);

var customFormat = function (formatString) {
	var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
	YY = ((YYYY = new Date().getFullYear()) + "").slice(-2);
	MM = (M = new Date().getMonth() + 1) < 10 ? ('0' + M) : M;
	MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
	DD = (D = new Date().getDate()) < 10 ? ('0' + D) : D;
	DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()]).substring(0, 3);
	th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
	formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
	h = (hhh = new Date().getHours());
	if (h == 0) h = 24;
	if (h > 12) h -= 12;
	hh = h < 10 ? ('0' + h) : h;
	hhhh = h < 10 ? ('0' + hhh) : hhh;
	AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
	mm = (m = new Date().getMinutes()) < 10 ? ('0' + m) : m;
	ss = (s = new Date().getSeconds()) < 10 ? ('0' + s) : s;
	return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
};
var jalaliMonthName = function (month) {
	switch (month) {
		case 1: {
			return "فروردین";
			break;
		}
		case "01": {
			return "فروردین";
			break;
		}
		case 2: {
			return "اردیبهشت";
			break;
		}
		case "02": {
			return "اردیبهشت";
			break;
		}
		case 3: {
			return "خرداد";
			break;
		}
		case "03": {
			return "خرداد";
			break;
		}
		case 4: {
			return "تیر";
			break;
		}
		case "04": {
			return "تیر";
			break;
		}
		case 5: {
			return "مرداد";
			break;
		}
		case "05": {
			return "مرداد";
			break;
		}
		case 6: {
			return "شهریور";
			break;
		}
		case "06": {
			return "شهریور";
			break;
		}
		case 7: {
			return "مهر";
			break;
		}
		case "07": {
			return "مهر";
			break;
		}
		case 8: {
			return "آبان";
			break;
		}
		case "08": {
			return "آبان";
			break;
		}
		case 9: {
			return "آذر";
			break;
		}
		case "09": {
			return "آذر";
			break;
		}
		case 10: {
			return "دی";
			break;
		}
		case "10": {
			return "دی";
			break;
		}
		case 11: {
			return "بهمن";
			break;
		}
		case "11": {
			return "بهمن";
			break;
		}
		case 12: {
			return "اسفند";
			break;
		}
		case "12": {
			return "اسفند";
			break;
		}
		default: {
			return "";
			break;
		}
	}
};
var firstDayOfMonth = function (argm, argy) {
	if (!argm) {
		argm = 0;
	}
	if (!argy) {
		argy = 0;
	}
	if (argm > 11) {
		argy += parseInt(argm / 12);
		argm = (argm % 12);
	}
	var currentDate, currentJalali, currentJalaliYear, currentJalaliMonth, currentJalaliDay, firstMonthJalaliDate,
		firstMonthGregoriandate, monthName;
	currentDate = customFormat("#YYYY#/#MM#/#DD#");
	currentJalali = moment(currentDate, 'YYYY/MM/DD').format('jYYYY/jMM/jDD');
	currentJalali = currentJalali.split('/');
	currentJalaliYear = currentJalali[0] - argy;
	currentJalaliMonth = currentJalali[1] - argm;
	currentJalaliDay = '01';
	if (currentJalaliMonth < 1) {
		currentJalaliYear--;
		currentJalaliMonth = 12 - currentJalaliMonth;
	}
	if (currentJalaliMonth < 10) {
		currentJalaliMonth = '0' + currentJalaliMonth;
	}
	firstMonthJalaliDate = currentJalaliYear + '/' + currentJalaliMonth + '/' + currentJalaliDay;
	firstMonthGregoriandate = moment(firstMonthJalaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
	monthName = jalaliMonthName(currentJalaliMonth);
	return {
		jalaliDate: firstMonthJalaliDate,
		gregorianDate: firstMonthGregoriandate,
		monthName: monthName,
	};
};
var lastDayOfMonth = function (argm, argy) {
	if (!argm) {
		argm = 0;
	}
	if (!argy) {
		argy = 0;
	}
	if (argm > 11) {
		argy += parseInt(argm / 12);
		argm = argm % 12;
	}
	var currentDate, currentJalali, currentJalaliYear, currentJalaliMonth, currentJalaliDay, lastMonthJalaliDate,
		lastMonthGregoriandate, monthName;
	currentDate = customFormat("#YYYY#/#MM#/#DD#");
	currentJalali = moment(currentDate, 'YYYY/MM/DD').format('jYYYY/jMM/jDD');
	currentJalali = currentJalali.split('/');
	currentJalaliYear = currentJalali[0] - argy;
	currentJalaliMonth = currentJalali[1] - argm;
	currentJalaliDay = '30';
	if (currentJalaliMonth < 1) {
		currentJalaliYear--;
		currentJalaliMonth = 12 - currentJalaliMonth;
	}
	if (currentJalaliMonth < 7) {
		currentJalaliDay = '31';
	} else if (currentJalaliMonth == 12) {
		currentJalaliDay = '29';
	}
	if (currentJalaliMonth < 10) {
		currentJalaliMonth = '0' + currentJalaliMonth;
	}
	lastMonthJalaliDate = currentJalaliYear + '/' + currentJalaliMonth + '/' + currentJalaliDay;
	lastMonthGregoriandate = moment(lastMonthJalaliDate, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
	monthName = jalaliMonthName(currentJalaliMonth);
	return {
		jalaliDate: lastMonthJalaliDate,
		gregorianDate: lastMonthGregoriandate,
		monthName: monthName,
	};
};
var dayBeforeDate = function (day, milliseconds) {
	if (!day) {
		day = 0;
	}
	if (milliseconds) {
		var date = new Date(milliseconds);
	} else {
		var date = new Date();
	}
	date.setDate(date.getDate() - day);
	var target = date.getFullYear() + '-' + ((date.getMonth() + 1) < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)) + '-' + (date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate());
	var millisecond = date.getTime();
	return {
		date: target,
		millisecond: millisecond
	};
};
/**************************/
var paging = function (currentPage, pageSize, dataCount) {
	var pageCount = Math.floor(dataCount / pageSize);
	if (pageCount * pageSize < dataCount) {
		pageCount++;
	}
	var returnParams = {
		"first": {index: 1},
		"prev": {},
		"pages": [],
		"next": {},
		"last": {index: pageCount}
	};
	if (dataCount < pageSize) {
		returnParams.first.current = returnParams.prev.current = returnParams.next.current = returnParams.last.current = true;
		returnParams.pages = [{index: 1, current: true}];
		return returnParams;
	}
	if (currentPage == 1) {
		returnParams.first.current = returnParams.prev.current = true;
		returnParams.prev.index = 1;
		returnParams.next.index = parseInt(currentPage) + 1;
		returnParams.last.index = pageCount;
	} else if (currentPage == pageCount) {
		returnParams.next.current = returnParams.last.current = true;
		returnParams.prev.index = parseInt(currentPage) - 1;
		returnParams.next.index = currentPage;
		returnParams.last.index = currentPage;
	} else {
		returnParams.next.index = parseInt(currentPage) + 1;
		returnParams.prev.index = parseInt(currentPage) - 1;
		returnParams.last.index = pageCount;
	}
	var start = 1;
	var end = pageCount;
	if (currentPage < 4) {
		start = 1;
		end = 5;
	} else if (currentPage > (pageCount - 3)) {
		end = pageCount;
		start = pageCount - 4;
	} else {
		start = currentPage - 2;
		end = parseInt(currentPage) + 2;
	}
	if (start < 1) {
		start = 1;
	}
	if (end > pageCount) {
		end = pageCount;
	}
	for (var i = start; i <= end; i++) {
		var pageParams = {index: i};
		if (i == currentPage) {
			pageParams.current = true;
		}
		returnParams.pages.push(pageParams);
	}
	return returnParams;
};
/*****************************/
var paging = function (currentPage, pageSize, dataCount) {
	var pageCount = Math.floor(dataCount / pageSize);
	if (pageCount * pageSize < dataCount) {
		pageCount++;
	}
	var returnParams = {
		"first": {index: 1},
		"prev": {},
		"pages": [],
		"next": {},
		"last": {index: pageCount}
	};
	if (dataCount < pageSize) {
		returnParams.first.current = returnParams.prev.current = returnParams.next.current = returnParams.last.current = true;
		returnParams.pages = [{index: 1, current: true}];
		return returnParams;
	}
	if (currentPage == 1) {
		returnParams.first.current = returnParams.prev.current = true;
		returnParams.prev.index = 1;
		returnParams.next.index = parseInt(currentPage) + 1;
		returnParams.last.index = pageCount;
	} else if (currentPage == pageCount) {
		returnParams.next.current = returnParams.last.current = true;
		returnParams.prev.index = parseInt(currentPage) - 1;
		returnParams.next.index = currentPage;
		returnParams.last.index = currentPage;
	} else {
		returnParams.next.index = parseInt(currentPage) + 1;
		returnParams.prev.index = parseInt(currentPage) - 1;
		returnParams.last.index = pageCount;
	}
	var start = 1;
	var end = pageCount;
	if (currentPage < 4) {
		start = 1;
		end = 5;
	} else if (currentPage > (pageCount - 3)) {
		end = pageCount;
		start = pageCount - 4;
	} else {
		start = currentPage - 2;
		end = parseInt(currentPage) + 2;
	}
	if (start < 1) {
		start = 1;
	}
	if (end > pageCount) {
		end = pageCount;
	}
	for (var i = start; i <= end; i++) {
		var pageParams = {index: i};
		if (i == currentPage) {
			pageParams.current = true;
		}
		returnParams.pages.push(pageParams);
	}
	return returnParams;
};

/******************************/
var pagingFindParams = function (params) {
	if (params.pageSize) {
		var pageSize = params.pageSize;
	} else {
		var pageSize = 10;
	}
	if (params.page) {
		var page = params.page;
	} else {
		var page = 1;
	}
	if (params.sortField && params.sortField != "") {
		var sortArray = params.sortField.split('.');
		for (var i = 0; i < (sortArray.length - 1); i++) {
			sortArray[i] = dbConnection[sortArray[i]];
		}
		sortArray.push(params.sortCondition);
		var order = [sortArray];
	} else {
		var order = [["id", 'DESC']];
	}
	var offset = (page - 1) * pageSize;
	if (params.searchFlag == 1) {
		offset = 0;
		page = 1;
	}
	return {
		where: {},
		include: [],
		limit: parseInt(pageSize),
		offset: offset,
		order: order,
		page: page
	};
};
/*****************************/
module.exports = {
	paging: paging,
	XMLHttpRequest: XMLHttpRequest,
	xml2js: xml2js,
	jwt: jwt,
	async: async,
	tools: tools,
	appRoot: appRoot,
	dbConnection: dbConnection,
	errorCodes: errorCodes,
	Constants: Constants,
	randomstring: randomstring,
	moment: moment,
	customFormat: customFormat,
	firstDayOfMonth: firstDayOfMonth,
	lastDayOfMonth: lastDayOfMonth,
	jalaliMonthName: jalaliMonthName,
	dayBeforeDate: dayBeforeDate,
	Sequelize: Sequelize,
	config: config,
	firebase: firebase,
	pagingFindParams: pagingFindParams
};