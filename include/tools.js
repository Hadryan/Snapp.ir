var php = require('phpjs');
var crypto = require('crypto');
var util = require('util');
var cookie = require('cookie');
var redis = require("redis");
var redisClient = redis.createClient();
var soap = require("soap");





var toolsModel = (function() {
	var toolsObj = {};
	
	var _cryptoSalt = '@PZ110N0d3';
	var _cryptoAlgorithm = 'aes256';
	
	toolsObj = {
		ErrorCodes: {
			'dbError': '1',
			'emptyParams': '2',
			'missesDeviceId': '3',
			'invalidAuthentication': '4',
			'inactiveUser': '5',
			'activationCodeGeneratedBefore': '6',
			'notSendSms': '7',
			'activationCodeExpire': '8',
			'inactiveRecord': '9',
			'notExistRecord': '10',
			'inputsNotValid': '11',
			'thisObjectIsNotForThisUser': '12',
			'notCustomerUser': '13',
			'notServiceProviderUser': '14',
			'discountCodeNotValid': '15',
			'NotFileSent': '16',
			'invalidDocumentType': '17',
			'documentTypeNotSet': '18',
			'DriverNotRegister': '19',
			'activeDestinationNotFound': '20',
			'tripHasMoreThanOnePendingDestination': '21',
			'userBalanceIsLowerThanExpected': '22',
			'tripAcceptedOrCanceledBefore': '23',
			'noRecordFound': '24',
			'driverCanNotEditHisProfileInfo': '25',
			'noOnlineDriverFound': '26',
			'noDriverAcceptRequest': '27',
			'passengerNoLongerOnline': '28',
			'driverProfileConfirmedAndHeCanLogin': '29',
			'setVisitDateForDriver': '30',
			'driverIsNotOnline': '31',
			'tripCanNotBeenCancelled': '32',
			'tripPaymented': '33',
			'AcceptingTripOutOfTime' : '44',
			
			setError: function (err) {
				return {Result: false, ErrorCode: this[err]}
			}
		},
        Constants:{
		    "TripPriceCalculationP1": "550",
		    "TripPriceCalculationP2": "251",
		    "TripPriceCalculationMaxDistance": "25",
		    "TripPriceCalculationMaxDistanceEachKilometer": "550",
		    "TripPriceCalculationMinPrice": "3500",
		    "TripPriceCalculationNightStart": "23",
		    "TripPriceCalculationMorningEnd": "6",
	        
		    // "DriverSliceFromTripPrice": "0.90",
		    "findingDriverCircularDistance": "100",
	        "defaultDiscountAmount" : "3500",
	        "minDriverBalanceAllowed" : "-30000",
	        
	        "UserTypeDriver": "1",
	        "UserTypePassenger": "2",
	        
	        "UserSituationActive": "1",
	        "UserSituationDeActive": "2",
	        "UserSituationOnProgress": "3",
	        "UserSituationNotAccept": "4",
	        "UserSituationVisit": "5",
	        
		    "tripTypeSingleDestination": "1",
		    "tripTypeDoubleDestination": "2",
		    "tripTypeWithStop": "3",
		    "tripTypeDestinationChanged": "4",
			
			"tripPaid" : "1",
			"tripUnPaid" : "0",
			
		    "tripDestinationSituationNotStarted": "1",
		    "tripDestinationSituationOnTrip": "2",
		    "tripDestinationSituationEdited": "3",
		    "tripDestinationSituationTripDone": "4",
		    
		    "tripSituationLookingForDriver": "1",
		    "tripSituationWaitingForDriver": "2",
		    "tripSituationWaitingForPassenger": "3",
		    "tripSituationOnTrip": "4",
		    "tripSituationWaitingForConfirmPayment": "5",
	        "tripSituationTripDone": "6",
	        "tripSituationTripCancel": "7",
	        
	        "paymentMethodCash": "1",
	        "paymentMethodOnline": "2",
	        "paymentMethodInternalTransfer": "3",
	        
	        "paymentReasonTripPaymentByPassenger":"1",
	        "paymentReasonRemoveSystemSliceForTrip":"2",
	        "paymentReasonDepositDriverSliceForTrip":"3",
	        "paymentReasonDepositToDriverBankAccountForPony":"4",
	        "paymentReasonPaymentDriverDebt":"5",
	        "paymentReasonSystemPaymentToDriverForDiscount":"6",
	        "paymentReasonPassengerOnlinePaymentForIncreaseBalance":"7",
	        
	        "paymentSituationPending":"1",
	        "paymentSituationSuccessful":"2",
	        "paymentSituationFail":"3",
	
	        "customerNotFillHisProfile": "10",
	        "customerCurrentSituationOffline": "1",
	        "customerCurrentSituationDetermineSourceAndDestination": "2",
	        "customerCurrentSituationWaitingToFindDriver": "3",
	        "customerCurrentSituationWaitingForDriver": "4",
	        "customerCurrentSituationOnDriverWay": "5",
	        "customerCurrentSituationOnTrip": "6",
	        "customerCurrentSituationWaitingForConfirmPayment": "7",
	        "customerCurrentSituationWaitingForRatingToDriver": "8",
	        
	        "serviceProviderCurrentSituationOffline": "1",
	        "serviceProviderCurrentSituationOnline": "2",
	        "serviceProviderCurrentSituationHasRequest": "3",
	        "serviceProviderCurrentSituationOnPassengerWay": "4",
	        "serviceProviderCurrentSituationWaitingForPassenger": "5",
	        "serviceProviderCurrentSituationOnTrip": "6",
	        "serviceProviderCurrentSituationWaitingForConfirmPayment": "7",
	        "serviceProviderCurrentSituationWaitingForRatingToPassenger": "8",
	        "serviceProviderCurrentSituationWaitingToDetermineRejectReason": "9",
	        
	        "TripPriceParameterIncrease": "1",
	        "TripPriceParameterDecrease": "2",
            
            setConstant: function (cons) {
                return this[cons];
            }
        },
		isValidMobileNumber: function (mobileNumber) {
			var mobileNumberPattern = /^\d{11}$/;
			if (!mobileNumber.match(mobileNumberPattern) || mobileNumber.substring(0, 2) != '09') {
				return false;
			} else {
				return true;
			}
		},
		
		isValidEmail: function (email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},
		
		isValidMobile: function (mobile) {
			var re = /(0|\+98)?([ ]|-|[()]){0,2}9[1|2|3|4]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}/ig;
			return re.test(mobile);
		},
		
		
		isValidPassword: function (pass) {
			var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
			if (!pass.match(passw)) {
				return false;
			} else {
				return true;
			}
		},
		
		generateVerificationCode: function () {
			return php.mt_rand(1000, 99999999);
		},
		
		generateVerificationCodeDate: function () {
			return php.date('Y-m-d H:i:s');
		},
		
		encode: function (rowStr) {
			if (rowStr) {
				var cipher = crypto.createCipher(_cryptoAlgorithm, _cryptoSalt);
				return cipher.update(rowStr, 'utf8', 'hex') + cipher.final('hex');
			} else {
				return false;
			}
		},
		
		decode: function (encodeStr) {
			if (encodeStr) {
				var decipher = crypto.createDecipher(_cryptoAlgorithm, _cryptoSalt);
				return decipher.update(encodeStr, 'hex', 'utf8') + decipher.final('utf8');
			} else {
				return false;
			}
		},
		
		getDataValues: function (cb) {
			
			cb();
			
		},
		
		
		log: function (lable, content) {
			console.log('LABLE:', lable);
			console.log(util.inspect(content, false, null));
			return true;
		},
		
		getSessionIdBySocket: function (socket, sessionKey) {
			
			if (socket && socket.handshake && socket.handshake.headers['cookie']) {
				
				this.log('##MODE## :', 'SESSION');
				//this.log('###mobile cookie content', socket.handshake.headers);
				// it is from web and support cookie, auth by sessionID
				cookies = cookie.parse(socket.handshake.headers['cookie']);
				
				if (cookies && cookies[sessionKey]) {
					this.log('sesssion id found by socket is : ', cookies[sessionKey].substring(2, 34));
					return cookies[sessionKey].substring(2, 34);
				} else {
					this.log('sesssion id  by socket not found! : ');
					return false;
				}
				
			} else {
				
				// it is a mobile event and not support cookie, auth by socketID
				this.log('##MODE## :', 'SOCKET');
				if (sessionKey && socket.handshake.headers[sessionKey]) {
					//this.log('##SocKET Received## :', socket.handshake.headers[ sessionKey ]);
					this.log('##SocKET Received decoded## :', this.decode(socket.handshake.headers[sessionKey]));
					return this.decode(socket.handshake.headers[sessionKey]);
				} else {
					this.log('##SOcket MODE## :', 'false');
					return socket.id;
				}
				
			}
			
		},
		
		
		getLoggedInUser: function (namespace, sessionId, cb) {
			theKey = namespace + sessionId;
			console.log('the key in loggeduser is ' + theKey);
			redisClient.get(theKey, function (err, userLoggedIn) {
				if (userLoggedIn) {
					if (typeof userLoggedIn !== 'object') {
						userLoggedIn = JSON.parse(userLoggedIn);
					}
					if (typeof userLoggedIn === 'object' && userLoggedIn.id > 0) {
						cb(userLoggedIn);
						return true;
					}
				}
				
				cb(false);
			});
		},
		
		logoutUser: function (namespace, sessionId, cb) {
			theKey = namespace + sessionId;
			console.log('the key in logout is ' + theKey);
			redisClient.del(theKey, function () {
				cb();
			});
		},
		
		loginUser: function (namespace, sessionId, userInfo, cb) {
			theKey = namespace + sessionId;
			console.log('the key in login is ' + theKey);
			redisClient.set(theKey, userInfo, function () {
				cb(true);
			});
		},
		
		
		sendSms: function (smsMobileNumber, smsContent, smsConfig, cb) {
			smsMobileNumber = '98' + smsMobileNumber.substring(1);
			console.log('send sms to ' + smsMobileNumber + ' with content[ ' + smsMobileNumber + ' ]');
			var url = smsConfig.url;
			var args = {
				pUsername: smsConfig.user,
				pPassword: smsConfig.pass,
				messages: {
					'string': [smsContent]
				},
				mobiles: {
					'string': [smsMobileNumber]
				},
				'Encodings': {
					'int': 2
				}
			};
			
			soap.createClient(url, function (err, client) {
				
				if (err) {
					console.log('sms client error : ', err);
					cb();
				} else {
					
					client.SendSms(args, function (err, result) {
						
						if (err) {
							console.log('sms error : ', err);
						} else {
							console.log('sms response : ', result);
						}
						cb();
						
					});
					
					cb();
					
				}
				
			});
			
		},
		
		
		parspal: {
			requestPayment: function (requestObj, parspalConfig, cb) {
				var url = parspalConfig.url;
				var args = {
					'MerchantID': parspalConfig.user,
					'Password': parspalConfig.pass,
					'Price': {
						'decimal': requestObj.Price
					},
					'Description': {
						'string': requestObj.Desc
					},
					'Paymenter': {
						'string': requestObj.Paymenter
					},
					'Email': {
						'string': requestObj.Email
					},
					'Mobile': {
						'string': requestObj.Mobile
					},
					'ResNumber': {
						'string': requestObj.ReceiptId + ''
					},
					'ReturnPath': {
						'string': requestObj.ReturnPath
					}
				};
				
				
				console.log('received this param in payment request', url, args);
				
				soap.createClient(url, function (err, client) {
					
					if (err) {
						console.log('ERROR CLIENT :: parspal payment client error : ', err);
						cb(false);
					} else {
						
						client.RequestPayment(args, function (err, result) {
							
							if (err) {
								console.log('ERROR REQUEST :: parspal payment request error : ', err);
								cb(false);
							} else {
								console.log('SUCCESS :: parspal payment request response : ', result);
								cb(result);
							}
							
						});
						
					}
					
				});
				
			},
		},
		
		
	}
	
	return toolsObj;
})();

module.exports = toolsModel;