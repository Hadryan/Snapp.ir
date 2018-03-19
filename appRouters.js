module.exports = function (app) {
	var installAppModule = require("./controllers/app/installApp");
	app.post('/install_app', installAppModule.index);

	var loginModule = require("./controllers/app/login");
	app.post('/login', loginModule.index);
	app.post('/login/confirm_activation_code', loginModule.confirmActivationCode);

	var changeMobileModule = require("./controllers/app/changeMobile");
	app.post('/change_mobile', changeMobileModule.index);
	app.post('/change_mobile/confirm', changeMobileModule.confirm);

	var profileModule = require("./controllers/app/profile");
	app.post('/profile/genders', profileModule.genders);
	app.post('/profile/edit_customer', profileModule.editCustomer);

	var serviceProviderProfileModule = require("./controllers/app/serviceProviderProfile");
	app.post('/service_provider_profile/set_info', serviceProviderProfileModule.registerDriver);
	var multer = require('multer');
	var driverLicenceStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/driving_licences');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var driverLicenceUpload = multer({storage: driverLicenceStorage});
	app.post('/service_provider_profile/set_driver_licence', driverLicenceUpload.single('DrivingLicence'), serviceProviderProfileModule.setDrivingLicence);
	var diagnosisStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/diagnosis');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var diagnosisUpload = multer({storage: diagnosisStorage});
	app.post('/service_provider_profile/set_diagnosis', diagnosisUpload.single('Diagnosis'), serviceProviderProfileModule.setDiagnosis);
	var vehicleCardStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/vehicle_card');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var vehicleCardUpload = multer({storage: vehicleCardStorage});
	app.post('/service_provider_profile/set_vehicle_card', vehicleCardUpload.fields([{
		name: 'VehicleCardFront',
		maxCount: 1
	}, {name: 'VehicleCardBack', maxCount: 1}]), serviceProviderProfileModule.setVehicleCard);
	var clearancesStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/clearances');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var clearancesUpload = multer({storage: clearancesStorage});
	app.post('/service_provider_profile/set_clearances', clearancesUpload.single('Clearances'), serviceProviderProfileModule.setClearances);
	var ownershipStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/ownership');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var ownershipUpload = multer({storage: ownershipStorage});
	app.post('/service_provider_profile/set_ownership', ownershipUpload.single('Ownership'), serviceProviderProfileModule.setOwnership);
	var insuranceStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/insurance');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var insuranceUpload = multer({storage: insuranceStorage});
	app.post('/service_provider_profile/set_insurance', insuranceUpload.single('Insurance'), serviceProviderProfileModule.setInsurance);
	var picStorage = multer.diskStorage({
		destination: function (req, file, callBack) {
			callBack(null, './public/uploads/service_providers/pic');
		},
		filename: function (req, file, callBack) {
			var ext = file.originalname.split(".");
			var extPosition = ext.length - 1;
			callBack(null, Date.now() + '.' + ext[extPosition]);
		}
	});
	var picUpload = multer({storage: picStorage});
	app.post('/service_provider_profile/set_pic', picUpload.single('Pic'), serviceProviderProfileModule.setPic);
	app.post('/service_provider_profile/set_vehicle_info', serviceProviderProfileModule.setVehicleInfo);
	app.post('/service_provider_profile/finish', serviceProviderProfileModule.finish);
	app.post('/service_provider_profile/get_document', serviceProviderProfileModule.getDocument);

	var supportModule = require("./controllers/app/support");
	app.post('/support/subjects', supportModule.subjects);
	app.post('/support/send', supportModule.send);

	var favoriteAddressModule = require("./controllers/app/favoriteAddress");
	app.post('/favorite_address/add', favoriteAddressModule.add);
	app.post('/favorite_address/edit', favoriteAddressModule.edit);
	app.post('/favorite_address/delete', favoriteAddressModule.delete);
	app.post('/favorite_address/list', favoriteAddressModule.list);

	var customerSettingsModule = require("./controllers/app/customerSettings");
	app.post('/customer_settings', customerSettingsModule.index);

	var setDriverVisibilityModule = require("./controllers/app/setDriverVisibility");
	app.post('/set_driver_visibility', setDriverVisibilityModule.index);

	var bankInfoUpdateModule = require("./controllers/app/bankInfoUpdate");
	app.post('/bank_info_update', bankInfoUpdateModule.index);

	var driverMainPageInfoModule = require("./controllers/app/driverMainPageInfo");
	app.post('/driver_main_page_info', driverMainPageInfoModule.index);

	var driverProfileInfoModule = require("./controllers/app/driverProfileInfo");
	app.post('/driver_profile_info', driverProfileInfoModule.index);

	var driverMyHooberInfoModule = require("./controllers/app/driverMyHooberInfo");
	app.post('/driver_my_hoober_info', driverMyHooberInfoModule.index);

	var driverDailyTripsInfoModule = require("./controllers/app/driverDailyTripsInfo");
	app.post('/driver_daily_trips_info', driverDailyTripsInfoModule.index);

	var driverMonthlyTripsInfoModule = require("./controllers/app/driverMonthlyTripsInfo");
	app.post('/driver_monthly_trips_info', driverMonthlyTripsInfoModule.index);

	var passengerMissObjectModule = require("./controllers/app/passengerMissObject");
	app.post('/passenger_miss_object', passengerMissObjectModule.index);

	var driverDayTripsModule = require("./controllers/app/driverDayTrips");
	app.post('/driver_day_trips', driverDayTripsModule.index);

	var calculateTripPriceModule = require("./controllers/app/calculateTripPrice");
	app.post('/calculate_trip_price', calculateTripPriceModule.index);

	var applyDiscountCodeModule = require("./controllers/app/applyDiscountCode");
	app.post('/apply_discount_code', applyDiscountCodeModule.index);

	var applyDriverRateModule = require("./controllers/app/applyDriverRate");
	app.post('/apply_driver_rate', applyDriverRateModule.index);

	var applyPassengerRateModule = require("./controllers/app/applyPassengerRate");
	app.post('/apply_passenger_rate', applyPassengerRateModule.index);

	var applyDriverCommentModule = require("./controllers/app/applyDriverComment");
	app.post('/apply_driver_comment', applyDriverCommentModule.index);

	var getPassengerPaymentsModule = require("./controllers/app/getPassengerPayments");
	app.post('/get_passenger_payments', getPassengerPaymentsModule.index);

	var getPassengerTripsListModule = require("./controllers/app/getPassengerTripsList");
	app.post('/get_passenger_trips_list', getPassengerTripsListModule.index);

	var getPassengerTripInfoModule = require("./controllers/app/getPassengerTripInfo");
	app.post('/get_passenger_trip_info', getPassengerTripInfoModule.index);

	var setTripRejectionReasonModule = require("./controllers/app/setTripRejectionReason");
	app.post('/set_trip_rejection_reason', setTripRejectionReasonModule.index);

	var getUserSituationModule = require("./controllers/app/getUserSituation");
	app.post('/get_user_situation', getUserSituationModule.index);

	var increaseBalanceModule = require("./controllers/app/increaseBalance");
	app.post('/increase_balance_request', increaseBalanceModule.request);
	app.post('/increase_balance_confirm', increaseBalanceModule.confirm);

	var checkVersionModule = require("./controllers/app/checkVersion");
	app.post('/check_version', checkVersionModule.index);

	var getDriverLocationModule = require("./controllers/app/getDriverLocation");
	app.post('/get_driver_location', getDriverLocationModule.index);

	var cancelTripsModule = require("./controllers/app/cancelTrip");
	app.post('/cancel_trip', cancelTripsModule.index);

	var tripPriceModule = require("./controllers/app/tripPrice");
	app.post('/get_trip_price', tripPriceModule.getTripPrice);


};
