var validate = require('../repository/validationRepository');
var serviceProviderProfile = require('../repository/serviceProviderProfileRepository');
var serviceProviderDocument = require('../repository/serviceProviderDocumentRepository');
var userChangeMobileRequest = require('../repository/userChangeMobileRequestRepository');
var userToken = require('../repository/userTokenRepository');
var user = require('../repository/userRepository');
var customerSettings = require('../repository/customerSettingsRepository');
var favoriteAddress = require('../repository/favoriteAddressRepository');
var userGender = require('../repository/userGenderRepository');
var customerProfile = require('../repository/customerProfileRepository');
var serviceProviderSpecialInfo = require('../repository/serviceProviderSpecialInfoRepository');
var supportMessageSubject = require('../repository/supportMessageSubjectRepository');
var supportMessage = require('../repository/supportMessageRepository');
var state = require('../repository/stateRepository');
var city = require('../repository/cityRepository');
var vehicleBrand = require('../repository/vehicleBrandRepository');
var vehicleModel = require('../repository/vehicleModelRepository');
var trip = require('../repository/tripRepository');
var ServiceProviderCurrentSituation = require('../repository/ServiceProviderCurrentSituationRepository');
var discountCode = require('../repository/discountCodeRepository');
var driverRate = require('../repository/driverRateRepository');
var driverComment = require('../repository/driverCommentRepository');
var passengerRate = require('../repository/passengerRateRepository');
var payment = require('../repository/paymentRepository');
var drivers = require('../repository/driversRepository');
var tripRejectReason = require('../repository/tripRejectReasonRepository');
var checkVersion = require('../repository/checkVersionRepository');

function repo() {}
repo.prototype.checkVersion = checkVersion;
repo.prototype.validate = validate;
repo.prototype.serviceProviderProfile = serviceProviderProfile;
repo.prototype.serviceProviderDocument = serviceProviderDocument;
repo.prototype.userChangeMobileRequest = userChangeMobileRequest;
repo.prototype.userToken = userToken;
repo.prototype.user = user;
repo.prototype.customerSettings = customerSettings;
repo.prototype.favoriteAddress = favoriteAddress;
repo.prototype.userGender = userGender;
repo.prototype.customerProfile = customerProfile;
repo.prototype.serviceProviderSpecialInfo = serviceProviderSpecialInfo;
repo.prototype.supportMessageSubject = supportMessageSubject;
repo.prototype.supportMessage = supportMessage;
repo.prototype.state = state;
repo.prototype.city = city;
repo.prototype.vehicleBrand = vehicleBrand;
repo.prototype.vehicleModel = vehicleModel;
repo.prototype.trip = trip;
repo.prototype.ServiceProviderCurrentSituation = ServiceProviderCurrentSituation;
repo.prototype.discountCode = discountCode;
repo.prototype.driverRate = driverRate;
repo.prototype.driverComment = driverComment;
repo.prototype.passengerRate = passengerRate;
repo.prototype.payment = payment;
repo.prototype.drivers = drivers;
repo.prototype.tripRejectReason = tripRejectReason;

module.exports = repo;
/*
 module.exports = {
 validate:validate,
 serviceProviderProfile:serviceProviderProfile,
 serviceProviderDocument:serviceProviderDocument,
 userChangeMobileRequest:userChangeMobileRequest,
 userToken:userToken,
 user:user,
 customerSettings:customerSettings,
 favoriteAddress:favoriteAddress,
 userGender:userGender,
 customerProfile:customerProfile,
 serviceProviderSpecialInfo:serviceProviderSpecialInfo,
 supportMessageSubject:supportMessageSubject,
 supportMessage:supportMessage,
 state:state,
 city:city,
 vehicleBrand:vehicleBrand,
 vehicleModel:vehicleModel,
 trip:trip,
 ServiceProviderCurrentSituation:ServiceProviderCurrentSituation,
 }*/
