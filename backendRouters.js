module.exports=function(app){
    app.get("/",function (req,res) {
	    res.redirect('/backend/login');
    })
    var stateModule = require('./controllers/backend/changeState');
    app.post("/backend/change_state/:model/:id",stateModule.index)

    var stateModule = require('./controllers/backend/changeFlag');
    app.post("/backend/change_flag/:model/:id",stateModule.index)

    var unverifiedDriversModule = require('./controllers/backend/unverifiedDrivers');
    app.get('/backend/unverified_drivers', unverifiedDriversModule.index );
    app.post('/backend/search/unverified_drivers/:pageIndex', unverifiedDriversModule.search );
    app.get('/backend/unverified_drivers/profile/:id', unverifiedDriversModule.profile );
    app.post('/backend/unverified_drivers/set_meeting/:id', unverifiedDriversModule.setMeeting );
    app.get('/backend/unverified_drivers/set_meeting/:id', unverifiedDriversModule.confirm );
    app.post('/backend/unverified_drivers/do_meeting', unverifiedDriversModule.doMeeting );

    var passengersModule = require('./controllers/backend/passengers');
    app.post('/backend/search/passengers/:pageIndex', passengersModule.search );
    app.post('/backend/passengers/excel', passengersModule.excel );
    app.get('/backend/passengers/profile/:id', passengersModule.profile );
    app.use('/backend/passengers', passengersModule.index );

    var tripModule = require('./controllers/backend/trips');
    app.get('/backend/trips',tripModule.index );
    app.post('/backend/search/trips/:pageIndex',tripModule.search);
    app.post('/backend/trips/excel',tripModule.excel);
    app.get('/backend/trips/profile/:id',tripModule.profile);
    app.get('/backend/trips/sources_map',tripModule.sourceMap);
    app.get('/backend/trips/fixed_passenger_trips_count',tripModule.fixedPassengerTripsCount);

    var unsuccessfulTripModule = require('./controllers/backend/unsuccessfulTrips');
    app.use('/backend/unsuccessfull_trips',unsuccessfulTripModule.index );
    app.use('/backend/unsuccessfull_excel',unsuccessfulTripModule.excel );

    var tripModule = require('./controllers/backend/financialDrivers');
    app.get('/backend/financial_drivers',tripModule.index);
    app.post('/backend/financial_drivers/pony_driver',tripModule.ponyDriver);
    app.post('/backend/search/financial_drivers/:pageIndex',tripModule.search);
    app.post('/backend/financial_drivers/excel',tripModule.excel);
    app.get('/backend/financial_drivers/total_settlement',tripModule.totalSettlement);
    app.post('/backend/financial_drivers/total_settlement/bank_output',tripModule.bankOutput);
    app.post('/backend/financial_drivers/do_total_settlement',tripModule.doTotalSettlement);
    app.get('/backend/financial_drivers/get_report/:id',tripModule.getReport);
    app.post('/backend/get_report/excel/:id',tripModule.getReportExcel);
    app.post('/backend/search/get_report/financial_drivers/:pageIndex',tripModule.searchReport);
    app.post('/backend/financial_drivers/settle_report/:id',tripModule.settleReport);
    app.post('/backend/financial_drivers/settle_driver',tripModule.settleDriver);

    var financialPassengerModule = require('./controllers/backend/financialPassengers');
    app.get('/backend/financial_passengers',financialPassengerModule.index);
    app.post('/backend/search/financial_passengers/:pageIndex',financialPassengerModule.search);
    app.post('/backend/financial_passengers/excel',financialPassengerModule.excel);
    app.get('/backend/financial_passengers/payment_report/:id',financialPassengerModule.paymentReport);
    app.post('/backend/search/financial_passengers/payment_report/:id/:pageIndex',financialPassengerModule.searchPaymentReport);

    var setCommissionModule = require('./controllers/backend/setCommission');
    app.use('/backend/set_commission',setCommissionModule.index);

    var setManageParamsModule = require('./controllers/backend/setManageParams');
    app.get('/backend/set_manage_params',setManageParamsModule.index);
    // app.post('/backend/search/manage_params/:pageIndex',setManageParamsModule.search);
    app.get('/backend/manage_params/add',setManageParamsModule.add);
    app.post('/backend/manage_params/add',setManageParamsModule.postAdd);

    var setManageParamsModule = require('./controllers/backend/feedback');
    app.get('/backend/feedback/:type',setManageParamsModule.index);
    app.post('/backend/feedback/delete/:id',setManageParamsModule.delete);
    app.post('/backend/search/feedback/:dataType/:pageIndex',setManageParamsModule.search);
    app.get('/backend/feedback/profile/:id',setManageParamsModule.profile);
    app.post('/backend/feedback/send_res',setManageParamsModule.sendRes);

    var verifiedDriversModule = require('./controllers/backend/verifiedDrivers');
    app.get('/backend/verified_drivers', verifiedDriversModule.index );
    app.post('/backend/verified_drivers/excel', verifiedDriversModule.excel);
    app.post('/backend/search/verified_drivers/:pageIndex', verifiedDriversModule.search );
    app.get('/backend/verified_drivers/profile', verifiedDriversModule.profile );
    app.post('/backend/verified_drivers/do_meeting', verifiedDriversModule.doMeeting);
    app.get('/backend/verified_drivers/see_messages', verifiedDriversModule.messages);
    app.get('/backend/verified_drivers/cars', verifiedDriversModule.cars);
    app.post('/backend/verified_drivers/get_car_models', verifiedDriversModule.models);
    app.post('/backend/verified_drivers/search/cars', verifiedDriversModule.searchCars);
    app.get('/backend/verified_drivers/see_online_driver/:id', verifiedDriversModule.seeOnlineDriver);
    app.post('/backend/verified_drivers/get_driver_position', verifiedDriversModule.getDriverPosition);


    var backendPanelUserModule = require('./controllers/backend/backend-users');
    app.get('/backend/backend-users/delete/:id', backendPanelUserModule.delete );
    app.get('/backend/backend-users/edit/:id', backendPanelUserModule.edit );
    app.get('/backend/backend-users/add', backendPanelUserModule.add );
    app.use('/backend/backend-users', backendPanelUserModule.index );


    var backendNotificationModule = require('./controllers/backend/notification');
    app.get('/backend/notification/delete/:id', backendNotificationModule.delete );
    app.get('/backend/notification/edit/:id', backendNotificationModule.edit );
    app.get('/backend/notification/add', backendNotificationModule.add );
    var multer3  = require('multer')
    var storage3 = multer3.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/app/notification')
        },
        filename: function (req, file, cb) {
            var ext=file.originalname.split(".")
            cb(null, Date.now() +'.'+ext[1])
        }
    })
    var upload3 = multer3({ storage: storage3 });
    app.post('/backend/notification/add', upload3.single('pic'),backendNotificationModule.postAdd );
    app.get('/backend/notification', backendNotificationModule.index );

    var paymentModule = require('./controllers/backend/payment');
    app.get('/do_payment/:token',paymentModule.index)
    app.post('/resolve/payment',paymentModule.resolve)

    var discountCouponModule = require('./controllers/backend/discountCoupon');
    app.get('/backend/discount_coupon/index',discountCouponModule.index)
    app.get('/backend/discount_coupon/create',discountCouponModule.create)
    app.post('/backend/discount_coupon/create',discountCouponModule.saveData)
    app.post('/backend/discount_coupon/delete',discountCouponModule.delete)

	var backendIndexModule = require('./controllers/backend/index');
	app.get('/backend/lockscreen/:username', backendIndexModule.lockscreenUsername );
	app.use('/backend/lockscreen', backendIndexModule.lockscreen );
	app.use('/backend/dashboard', backendIndexModule.dashboard );
	app.use('/backend/login', backendIndexModule.login );
	app.use('/backend/logout', backendIndexModule.logout );
	app.use('/backend', backendIndexModule.index );

	app.get('/backend/not_found',function(req,res){
		res.render('not_found')
	});
}
