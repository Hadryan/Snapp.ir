var lib = require('../../include/lib');
/***********************************************************************************************************************
 setInfo action for edit service providers profile info

 inputs : DeviceId , UserId , GenderId , FirstName , LastName , StateId , CityId , Email , NationalCode , BankAtmNumber , BankShabaNumber
 outputs : result:(true or false) if result true Data is service provider profile information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.registerDriver = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderProfile.registerDriver(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setDrivingLicence action for edit service providers driving licence

 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setDrivingLicence = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.DrivingLicence = req.file;
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.updateDrivingLicenceInfo(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setDiagnosis action for edit service providers diagnosis
 
 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setDiagnosis = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.Diagnosis = req.file;
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.updateDiagnosisInfo(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setVehicleCard action for edit service providers vehicle card
 
 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setVehicleCard = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	if(req.files && req.files['VehicleCardFront'] && req.files['VehicleCardFront'][0] && req.files['VehicleCardBack'] && req.files['VehicleCardBack'][0]) {
		body.VehicleCardFront = req.files['VehicleCardFront'][0];
		body.VehicleCardBack = req.files['VehicleCardBack'][0];
		lib.async.auto({
			find: function (callBack, results) {
				repository.serviceProviderDocument.updateVehicleCardInfo(body, function (result) {
					callBack(null, result);
				});
			}
		}, function (err, result) {
			if (result.find.Result == false) {
				res.status(200).json(result.find);
			} else {
				res.status(200).json({Result: true, Data: [result.find.data]});
			}
		});
	} else {
		res.status(200).json(lib.errorCodes.setError('NotFileSent'));
	}
};
/***********************************************************************************************************************
 setClearances action for edit service providers clearances
 
 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setClearances = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.Clearances = req.file;
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.updateClearances(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setOwnership action for edit service providers vehicle ownership document
 
 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setOwnership = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.Ownership = req.file;
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.updateOwnership(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setInsurance action for edit service providers driving vehicle insurance
 
 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setInsurance = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.Insurance = req.file;
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.updateInsurance(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setPic action for edit service providers picture
 
 inputs : DeviceId , UserId , ExpireYear , ExpireMonth
 outputs : result:(true or false) if result true Data is service provider profile document information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setPic = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
	body.Pic = req.file;
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.updatePic(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 setVehicleInfo action for edit service providers vehicle information
 
 inputs : DeviceId , UserId , BrandId , ModelId , ProductYear , Color , Capacity , PlaqueLeft , PlaqueAlphabet , PlaqueRight , PlaqueIran , HasLicenseTrafficPlan , LicenseTrafficPlanExpirationDate , Description
 outputs : result:(true or false) if result true Data is service provider vehicle information if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.setVehicleInfo = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderSpecialInfo.updateVehicleInfo(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 finish action for sending special code to driver in end of successful register
 
 inputs : DeviceId , UserId
 outputs : result:(true or false) if result true Data is user object data  if resut false ErrorCode is representing error code
************************************************************************************************************************/
exports.finish = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderSpecialInfo.finish(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};
/***********************************************************************************************************************
 getDocument action for getting driver specific document if exist and an error code if not exist
 
 inputs : DeviceId , UserId , Type
 outputs : result:(true or false) if result true Data is driver document url and other data if result false ErrorCode is representing error code
************************************************************************************************************************/
exports.getDocument = function(req, res) {
	var repo = require('../../include/repo');
	var repository = new repo();
	var body = JSON.parse (JSON.stringify(req.body));
    lib.async.auto({
        find: function(callBack, results){
	        repository.serviceProviderDocument.getDocument(body ,function(result){
		        callBack(null ,result);
	        });
        }
    } ,function(err, result) {
        if(result.find.Result == false) {
            res.status(200).json(result.find);
        } else {
            res.status(200).json({Result: true, Data: [result.find.data]});
        }
    });
};