var restify = require('restify');
var mongojs = require('mongojs');
var morgan  = require('morgan');
//var speakeasy  = require('speakeasy');//not requied now on 02FEB2017
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var db = require('mongodb://asharma182:root@ds023425.mlab.com:23425/bucketlistapp',['appUsers','bucketLists']);
//var db = mongojs('mongodb://asharma182:root@ds059316.mlab.com:59316/thelawala',['appUsers','mobOtp','users','vendorDb','userDiscount','couponAmount','items','imagetests','citizens','userAddress']);
//var db = mongojs('mongodb://dbowner:password@139.59.71.94:10948/startup',['appUsers','buyer_dtls','mobOtp','users','vendorDb','userDiscount','couponAmount','items','imagetests','citizens','userAddress','package','order']);
//var db = mongojs('mongodb://localhost:27017/dbfinaltest');
var db = mongojs('mongodb://dba:password@139.59.71.105:10948/grosodel', ['Customer']);

var server  = restify.createServer();
//var manageUsers = require("./auth/manageUser")(server, db);
//var manageLists =   require('./list/manageList')(server, db);
var pwdMgr = require('./auth/managePasswords'); //ABHI15012017

//var sendOtp = require('./twilio/otp_main'); //ABHI03062017

var assert = require('assert'); //ABHI18032017

var date = require('date-and-time'); //ABHI20032017

var http = require("http");

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(morgan('dev')); //Logger

//CORS (Cross Origin Request Sharing). i.e. any web based client can access our resources.
server.use(function(req, res, next){
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers','Content-Type');
	next();
});

//port = 9804;
//host = '127.0.0.1';
//server.listen(port, host);

server.listen(process.env.PORT || 9804,function(){

	console.log("Server Started @ ", process.env.PORT || 9804);
	console.log("server Started @ 9804");
});

//////Mongoose Declaration/////////////
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.connect('mongodb://dba:password@139.59.71.105:10948/grosodel');
var ItemSchema = Schema({
  _id: Schema.Types.ObjectId,
  Id: String,
  Name: String,
  CategoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  Image: String,
  ItemStatus: String
});

var ItemPackageSchema = Schema({
  Id: String,
  Items: [{
        Quantity: String,
        PrefferedUnitType: String,
        ItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }
    }],
  PackageId: [{ type: Schema.Types.ObjectId, ref: 'Package' }]
});

var PackageSchema = Schema({
  Id: String,
      Name : String,
    StartDate : String,
    Price : String,
    EndDate : String,
    CreateDate : String
});
var CategorySchema = Schema({
  _id: Schema.Types.ObjectId,
  Uid: String,
  Name: String,
  CategoryStatus: String,
  CreateDate : String
});

var ItemPriceSchema = Schema({
  _id: Schema.Types.ObjectId,
  Uid: String,
  Name: String,
  ItemSellingPrice: String,
  LastModifiedDate : String,
  ItemId: {type: Schema.Types.ObjectId, ref: 'Item'}
});


var ItemPackage = mongoose.model('ItemPackage', ItemPackageSchema, 'ItemPackage');
var Item = mongoose.model('Item', ItemSchema, 'Item');
var Package = mongoose.model('Package', PackageSchema, 'Package');
var Category = mongoose.model('Category', CategorySchema, 'Category');
var ItemPrice = mongoose.model('ItemPrice', ItemPriceSchema, 'ItemPrice');
//////////////////////////////////

// server.get("/api/v1/bucketList/auth/register", function (req, res, next) {
// 	console.log(req.params);
//     db.products.find(function (err, products) {
//         res.writeHead(200, {
//             'Content-Type': 'application/json; charset=utf-8'
//         });
//         res.end(JSON.stringify(products));
//     });
//     return next();
// });


//Global Variables
var otp_global = 0;


//REGISTER USER
server.post('/grosodel/api/user/register', function (req, res, next) {

    var user = req.params;
	// var user_mob = {MobNo: user.MobNo, otp: ""};
	// user_mob.otp= (100000 + Math.floor(Math.random() * 900000)).toString();
	//otp_global = user_mob.mob
	// console.log(user_mob.otp,user_mob.MobNo);
	

	// otp_test = user_mob.otp;
	// mob_test=user_mob.MobNo;
	// var options = {
	//   "method": "GET",
	//   "hostname": "2factor.in",
	//   "port": null,
	//   "number": mob_test,
	//   "path": "/API/V1/47d696ec-241c-11e7-929b-00163ef91450/SMS/"+mob_test+"/"+otp_test+"",
	//   "headers": {}
	// };

	// var req = http.request(options, function (res) {
	//   var chunks = [];

	//   res.on("data", function (chunk) {
	//     chunks.push(chunk);
	//   });

	//   res.on("end", function () {
	//     var body = Buffer.concat(chunks);
	//     console.log(body.toString());
	//     console.log("Abhishek");

	//   });
	// });

	// req.write("{}");
	// req.end();

	// //Saving Mobile Number and OTP code in DB
	//  if(SendOtp(MobNo, otp)){
	//  db.mobOtp.insert(user_mob,function(err, dbOtp){});
	// }

	// db.users.insert(user,function(err, users){
	// 	console.log("Hi inside mobotp-------------------------------");
	// if(err){
	// 		if(err.code == 11000)
	// 		console.log(err.code);
	// 			res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});
	// 		res.end(JSON.stringify({
	// 			error: err,
	// 			message: "A user with this email already exists"
	// 		}));
	// 	}else{
	// 	console.log("inside else ")

	// 		res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
	// 		res.end(JSON.stringify(users));
	// 	}
	// });

		db.Customer.find({}, function(err,data){
			if(data.length == 0){
				user.Uid = "Cust_" + "1";
				insertCustomerIntoDb();
			}else{

			db.Customer.find().limit(1).sort({$natural:-1}, function(err, db){
			var customerId = db[0].Uid;
			console.log(db);
			var incrementBy1 = IdAutoIncrement(customerId);
			user.Uid = ("Cust_" + incrementBy1);
			console.log(user.Uid);
			insertCustomerIntoDb();

		})
		}
		})  


	function insertCustomerIntoDb(){

		pwdMgr.cryptPassword(user.password, function(err, hash){
		user.password = hash;
		user.Name= user.fname + " " + user.lname;
		user.ReferralCode = user.Name.split(" ")[0];
		console.log("2");
		user.AccountStatus = 0;
		user.CreateDate = Date();
		db.Customer.insert(user, function(err , dbUser){
			if(err){
				if(err.code == 11000)
					res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});
					res.end(JSON.stringify({
						error: err,
						message: "A user with this email already exists"
				}));
			}else{
				SendOtp(user.MobNo);
				res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
				//dbUser.email = ""
				dbUser.password = "";
				console.log("Hi inside citizens---------------------------------------------//////");

			res.end(JSON.stringify(dbUser));
		}
	});
	});
	}

    return next();
	
});

//OTP Validation
server.post('/grosodel/api/otp', function(req, res, next) {
	console.log(req.params);
	var customerCoupon = req.params;
	customerCoupon.ccode=  "",
	customerCoupon.last_used_date= "", 
	customerCoupon.times_used= "", 
	customerCoupon.times_can_be_used= "", 
	customerCoupon.value= "";
	db.mobOtp.findOne({MobNo: customerCoupon.MobNo}, function(err, dbOtp){

		console.log(dbOtp.otp,customerCoupon.dig1);
		if (dbOtp.otp == customerCoupon.dig1){
			console.log("validated");
			db.Customer.update({MobNo: customerCoupon.MobNo},
							{
								$set: { AccountStatus: '1'
									}
							},
								{multi:true});
		insertCustomerCoupon();

		};
	});

function insertCustomerCoupon(){
	db.userDiscount.find({}, function(err,data){
			if(data.length == 0){
				customerCoupon.Uid = "Coup_" + "1";
				console.log("no data", data.length);
				insertCustomerCouponIntoDb();
			}else{

			db.userDiscount.find().limit(1).sort({$natural:-1}, function(err, db){
			var userDiscountId = db[0].Uid;
			var incrementBy1 = IdAutoIncrement(userDiscountId);
			customerCoupon.Uid = ("Coup_" + incrementBy1);
			insertCustomerCouponIntoDb();

		})
		}
		})
}
function insertCustomerCouponIntoDb(){
		db.userDiscount.insert(customerCoupon,function(err, db){
			console.log(db);
		res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
		res.end(JSON.stringify(customerCoupon));
		})

}
	/*if (dig.dig1 == otp_global){
		console.log("validated");
		res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
		res.end(JSON.stringify(dig));
	};*/
	return next();
});

//Deactivate Account
server.post("/grosodel/api/user/deactivateAccount", function (req, res, next) {
	console.log(req.params);
    db.Customer.findOne({MobNo: req.params.MobNo},function (err, products) {

        db.Customer.update({MobNo: req.params.MobNo},
			{
				$set: { AccountStatus: '0'
				}
			},
			{multi:true});

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        }); 
        res.end(JSON.stringify({AccountStatus: '0'}));
    });
    return next();
});

//resend otp
server.post('/grosodel/api/user/resendOtp', function(req,res,next){
	console.log(JSON.stringify(req.params));
	SendOtp(req.params.MobNo);
	console.log("error");
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({message: "Otp Sent"}));
    return next();
});

//change number
server.post('/grosodel/api/user/changeNumber', function(req,res,next){
	console.log(JSON.stringify(req.params.MobNo));
	var NewMobNo = req.params.NewMobNo.toString();
	db.Customer.update({MobNo: req.params.MobNo},
			{
				$set: { MobNo: NewMobNo
				}
			},
			{multi:true});
	db.userImages.update({MobNo: req.params.MobNo},
		{
				$set: { MobNo: NewMobNo
				}
			},
			{multi:true});
	SendOtp(req.params.NewMobNo);
	console.log("error");
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({message: "Otp Sent"}));
    return next();
});

//Update User Data
server.post('/grosodel/api/user/updateUserData', function(req,res,next){
	console.log(JSON.stringify(req.params), req.params.Name, req.params.Email);
	if (req.params.Name != null){
	db.Customer.update({MobNo: req.params.MobNo},
			{
				$set: { Name: (req.params.Name)
				}
			},
			{multi:true});
		}else{
			db.Customer.update({MobNo: req.params.MobNo},
			{
				$set: { Email: (req.params.Email)
				}
			},
			{multi:true});
		}
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({message: "Updated"}));
    return next();
})
//LOGIN USER
server.post('/grosodel/api/auth/login', function(req, res, next){
	var user = req.params;
	console.log("logging...........", user.MobNo);
	if (user.MobNo.trim().length == 0 || user.password.trim().length == 0){
		res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
	}
	console.log("in", user.MobNo);
	db.Customer.findOne({MobNo: user.MobNo }, function(err, dbUser){
		console.log("inside customer", dbUser);
		if(dbUser == null){
			res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify({error: "User not found"}));
		}else{
		pwdMgr.comparePassword(user.password, dbUser.password, function(err, isPasswordMatch){
			//ABHISHEK08072017
			var base64;
			//if(isPasswordMatch && (dbUser.active) == '1'){
			if(isPasswordMatch && (dbUser.AccountStatus) == '1'){
				        //console.log("base64",base64);
				        console.log("paswwod matched");
				dbUser.password = "";
				dbUser.image=base64;
				res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
				res.end(JSON.stringify(dbUser));
			} else if(isPasswordMatch && (dbUser.AccountStatus) == '0'){
				console.log("else .....");
				res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
				res.end(JSON.stringify({mobNumberNotValidated: true, AccountStatus: "0"}));
			}else{
				res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
				res.end(JSON.stringify({error: "Invalid user"}));
			}
		// 	db.imagetests.find(function (err, doc) {
  //           if (err) return next(err);
  //       base64 = (doc[0].img.data.toString('base64'));
  //        //res.send(base64);        
        
		// 	//
		// 	if(isPasswordMatch && (dbUser.active) == '1'){
		// 		        //console.log("base64",base64);
		// 		dbUser.password = "";
		// 		dbUser.image=base64;
		// 		res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
		// 		res.end(JSON.stringify(dbUser));
		// 	} else if(isPasswordMatch && (dbUser.active) == '0'){
		// 		console.log("else .....");
		// 		res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
		// 		res.end(JSON.stringify({mobNumberNotValidated: true}));
		// 	}else{
		// 		res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
		// 		res.end(JSON.stringify({error: "Invalid user"}));
		// 	}
		// });
		});
	}
	});
	return next();
});
//Get user Image
server.post('/grosodel/getuserimage', function(req,res,next){
	// var MobNo = req.params.toString();
	// console.log("phone number",MobNo);
	db.userImages.find({MobNo: req.params.MobNo}).limit(1).next(function(err, doc){
		console.log(doc);
   		if(err){
   			console.log("error1",err);
   			res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify({error: "User not found"}));
   		}
   		if(doc === null){
   			console.log("error2",err);
   			res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify({error: "User not found"}));
   		}else{
   			console.log("found");
       // base64 = (doc.img.data.toString('base64'));
        base64 = (doc.image.data.toString('base64'));
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        doc.image = base64;
        res.end(JSON.stringify(doc));
   		}
})
	// db.userImages.find({},function (err, doc) {
	// 	console.log("rrgegegtrgrrth",doc.MobNo,req.params.MobNo, doc);
 //        if(doc.length === 0 ){
 //        	consle.log("nuldffsfssfgsfgfssfgfsgfdgfgfdgfgfdgfdgfg");
	// 		res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
	// 		res.end(JSON.stringify({error: "User not found"}));
 //        }else{
 //        console.log("found");
 //       // base64 = (doc.img.data.toString('base64'));
 //        base64 = (doc.image.data.toString('base64'));
 //        res.writeHead(200, {
 //            'Content-Type': 'application/json; charset=utf-8'
 //        });
 //        doc.image = base64;
 //        res.end(JSON.stringify(doc));
 //    }
 //    });
    return next();
});
//REGISTER VENDOR
// server.post('/api/vendor/auth/register', function (req, res, next) {
//     var user = req.params;
// //--Registering Mobile, OTP
// 	var user_mob = {MobNo: user.MobNo, otp: ""};
// 	user_mob.otp= (1000 + Math.floor(Math.random() * 9000)).toString();
// 	otp_global = user_mob.mob
// 	console.log(user_mob.otp,user_mob.mob);
// 	var resp = {};
// 	var send_msg = sendOtp.sendMsg(user_mob.mob, user_mob.otp, function(error, message){
// 		console.log("Hi inside twilio");
// 		if (error){
// 			res.status = "error";
// 			res.message = message;
// 		}else {
//       res.status = "success";
//       res.message = message.sid;
//     };
 
//     res.json(resp);
// 	});
// 	//testing ROR
// 	db.users.insert(user,function(err, users){
// 		console.log("Hi inside mobotp");
		
// 	});
// 	//
// 	db.mobOtp.insert(user_mob,function(err, dbOtp){
// 		console.log("Hi inside mobotp");
		
// 	});
// 	pwdMgr.cryptPassword(user.password, function(err, hash){
// 		user.password = hash;
// 	db.vendorDb.insert(user, function(err , dbVendor){
// 		if(err){
// 			if(err.code == 11000)
// 			console.log(err.code);
// 				res.writeHead(400,{'Content-Type':'application/json; charset=utf-8'});
// 			res.end(JSON.stringify({
// 				error: err,
// 				message: "A user with this email already exists"
// 			}));
// 		}else{
// 			res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
// 			dbVendor.email = ""
// 			dbVendor.password = "";
// 			res.end(JSON.stringify(dbVendor));
// 		}
// 	});
// 	});
//     return next();
// });

//LOGIN VENDOR
server.post('/grosodel/api/vendor/auth/login', function(req, res, next){
	var user = req.params;
	if (user.MobNo.trim().length == 0 || user.password.trim().length == 0){
		res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
	}
	console.log("in");
	db.Vendor.findOne({MobNo: req.params.MobNo }, function(err, dbVendor){
	console.log("logging...........");
		pwdMgr.comparePassword(user.password, dbVendor.password, function(err, isPasswordMatch){
			if(isPasswordMatch){
				res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
				dbVendor.password = "";
				res.end(JSON.stringify(dbVendor));
			} else {
				res.writeHead(403, {'Content-Type': 'application/json; charset=utf-8'});
				res.end(JSON.stringify({error: "Invalid user"}));
			}
		});
	});
	return next();
});

//vendor image
server.post('/grosodel/getvendorimage', function(req,res,next){
	// var MobNo = req.params.toString();
	// console.log("phone number",MobNo);
	db.Vendor.find({MobNo: req.params.MobNo}).limit(1).next(function(err, doc){
		console.log(doc);
   		if(err){
   			console.log("error1",err);
   			res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify({error: "User not found"}));
   		}
   		if(doc === null){
   			console.log("error2",err);
   			res.writeHead(500, {'Content-Type': 'application/json; charset=utf-8'});
			res.end(JSON.stringify({error: "User not found"}));
   		}else{
   			console.log("found");
       // base64 = (doc.img.data.toString('base64'));
        base64 = (doc.image.data.toString('base64'));
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        doc.image = base64;
        res.end(JSON.stringify(doc));
   		}
})
	    return next();
});

//Adding discount to User Bucket
//New-Code
var set_global_discount_value=0
server.post('/grosodel/api/applyCoupon/', function(req, res, next){
	var ccode_addition;
	//console.log(req.params.mobNumber);
	var now = new Date();
	var cur_date = date.format(now, 'YYYY-MM-DD HH:mm:ss');
	var coupon_date_active=false;
	//date.format(now, 'YYYY/MM/DD HH:mm:ss'); 
	db.couponAmount.findOne({ccode: req.params.copCode}, function(err, dbCouponAmount){
	//	var d1 = date.format(Date(dbCouponAmount.startDate), 'YYYY/MM/DD')
	//	var date = dbCouponAmount.startDate;
	d1 = new Date(dbCouponAmount.startDate);
    d2 = new Date(dbCouponAmount.endDate);
    if (d1 <= cur_date <= d2) {
       coupon_date_active =true;
    } else {
        console.log("not active");
    } 

	  	if((req.params.copCode == dbCouponAmount.ccode) && (coupon_date_active == true)
	  		&& (dbCouponAmount.active = "Y")){
	  		set_global_discount_value = dbCouponAmount.value;
				db.userDiscount.findOne({mob: req.params.mobNumber}, function(err, dbDiscount){
					console.log("dbDiscount",dbDiscount.ccode);
					if(dbDiscount.ccode === '' ){
						console.log("hii...the coupon is active",set_global_discount_value,req.params.copCode,req.params.mobNumber);
						db.userDiscount.update({mob: req.params.mobNumber},
							{
								$set: {ccode: (req.params.copCode), 
										last_used_date: cur_date,
										times_used: "1",
										times_can_be_used: dbCouponAmount.number_of_times_can_be_used,
										value: dbCouponAmount.value
									}
							},
								{multi:true});
					}
					else if(dbDiscount.ccode == req.params.copCode && dbDiscount.times_used < dbDiscount.times_can_be_used){
						set_global_discount_value = dbDiscount.value;
						//console.log(parseInt(dbDiscount.times_used) + 1);
						db.userDiscount.update({mob: req.params.mobNumber},
							{
								$set: { last_used_date: date.format(now, 'YYYY-MM-DD HH:mm:ss'),
										times_used: (parseInt(dbDiscount.times_used) + 1).toString(),
									}
							},
								{multi:true});

					}else if(dbDiscount.ccode == req.params.copCode && dbDiscount.times_used == dbDiscount.times_can_be_used){
						db.userDiscount.update({mob: req.params.mobNumber},
							{
								$set: { valid: "N"
									}
							},
								{multi:true});
					}
					//console.log(JSON.stringify(dbDiscount.times_used) + 1);
	db.userDiscount.findOne({mob: req.params.mobNumber}, function(err, dbDiscount){
		res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
		res.end(JSON.stringify(dbDiscount));
		});
				})
	}
	})
	return next();
});

//New-Code-End
//Get Item List//
server.get('/grosodel/api/getVegList', function(req,res,next){
	//console.log(req.params.catid);
	var base64;
	ItemPrice.find({})
			.populate('ItemId')
            .exec(function(error, posts) {
                console.log(JSON.stringify(posts, null, "\t"))
                        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        }); 
        res.end(JSON.stringify(posts));
            })
	//db.items.find({catid: req.params.catid}).toArray(function(err, itemList) {
	// db.items.find().toArray(function(err, itemList) {
	// 	console.log(JSON.stringify(itemList));
	// 	// console.log("Found the following records");
 //    //db.imagetests.find(function (err, doc) {
 //       //     if (err) return next(err);
 //        //base64 = (doc[0].img.data.toString('base64'));
 //        //base64 = (itemList[0].image.data.toString('base64'));

	// //console.log("doc",doc[0]);
	// //console.log("itemList",itemList[0]);
	// // for(var i = 0; i < itemList.length; i++){
	// // 	//console.log("length",i);
	// // 	//console.log(itemList[i].image);
	// // 	base64 = (itemList[i].image.data.toString('base64'));
	// // 	//console.log("name",itemList[i].item_name);
	// // 	itemList[i].image = base64;

	// // }
	// //itemList[0].image = base64;
	// //console.log("---------------",itemList);
	// res.writeHead(200,{'Content-Type': 'application/json; charset=utf-8'});
	// res.end(JSON.stringify(itemList));
 //  });
//     });
	return next();
});

server.post('/grosodel/api/getPackList', function(req,res,next){



            ItemPackage.find({})
            .populate('Items.ItemId').populate('PackageId')
            .exec(function(error, posts) {
                console.log(JSON.stringify(posts, null, "\t"))
                        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        }); 
        res.end(JSON.stringify(posts));
            })

    return next();
});

server.post('/grosodel/api/user/saveAddress', function(req,res,next){
	db.Customer.findOne({MobNo: req.params.MobNo},function(err, useraddress){
		console.log(useraddress, req.params.Address);
		db.Customer.update({MobNo: req.params.MobNo},
			{
				$set: { Address: (req.params.Address)
				}
			},
			{multi:true});

        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        }); 
        res.end(JSON.stringify(req.params.Address));
    });
    return next();
});

server.post('/item_order', function(req,res,next){
	console.log(JSON.stringify(req.params));
	var createOrder = {};
	 createOrder.Items = req.params.orderConfirmed.Items;
	 createOrder.paymentMode = req.params.orderConfirmed.paymentMode;
	 createOrder.amount = req.params.orderConfirmed.amount;
	 createOrder.MobNo = req.params.orderConfirmed.MobNo;
	 createOrder.CreateDate = Date();
	db.order.insert(createOrder,function(err, order){
		console.log(order);
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        var orderNumber = 84820230323;
        res.end(JSON.stringify(order._id));
    });
    return next();
});

server.post('/grosodel/api/user/orderDetails', function(req,res,next){
	console.log(JSON.stringify(req.params));
	var userOrderList=[];
	db.order.find({},function(err, order){
		console.log("list of orders",order,order.length,req.params.MobNo);
		for(var i=0; i < order.length; i++){
			console.log("database",order[i].MobNo,req.params.MobNo);
		if(order[i].MobNo == req.params.MobNo){
		console.log("orders",order[i]);
		order[i].CreateDate = order[i].CreateDate.split("GMT+0530")[0];
			userOrderList.push(order[i]);
		}
	}
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(userOrderList));
    });
    return next();
});


function IdAutoIncrement(Id){
			console.log(Id);
				var splitCustId = Id.split('_');
			var convertStringToInt= parseInt(splitCustId[1]);
			var incrementBy1 = convertStringToInt + 1;
			console.log("auto incremented");
			return incrementBy1; 
}

function SendOtp(MobNo){
	var userMobOtp = {MobNo: MobNo, otp: ""};
	userMobOtp.otp= (100000 + Math.floor(Math.random() * 900000)).toString();
	var userMobile = MobNo.toString();
	console.log(userMobOtp.otp,userMobile);
	var resp = {};
	var options = {
	  "method": "GET",
	  "hostname": "2factor.in",
	  "port": null,
	  "number": MobNo,
	  "path": "/API/V1/47d696ec-241c-11e7-929b-00163ef91450/SMS/"+userMobOtp.MobNo+"/"+userMobOtp.otp+"",
	  "headers": {}
	};

	var req = http.request(options, function (res) {
	  var chunks = [];

	  res.on("data", function (chunk) {
	    chunks.push(chunk);
	  });

	  res.on("end", function () {
	    var body = Buffer.concat(chunks);
	    console.log(body.toString());
	    console.log("Abhishek");

	  });
	});

	req.write("{}");
	req.end();

	// //Saving Mobile Number and OTP code in DB
	db.mobOtp.findOne({MobNo: userMobile}, function(err, checkdata){
		console.log("exist data",checkdata);
		if (checkdata==null){
			userMobOtp.MobNo = userMobOtp.MobNo.toString();
			db.mobOtp.insert(userMobOtp,function(err, dbOtp){
				console.log(dbOtp);
			});
		}else{
			console.log("updating",MobNo);
			db.mobOtp.update({MobNo: userMobile},
			{
				$set: { otp: userMobOtp.otp
				}
			},
			{multi:true});
		}
	})
	return true;
}

module.exports = server;
