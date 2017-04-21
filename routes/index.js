var express = require('express');
var router = express.Router();
var request=require("request");
var _ = require('underscore')._;
var properties = require('propertiesmanager').conf;
var tokenManager = require('tokenmanager');

var authGwExists=_.isEmpty(properties.authApiGwBaseUrl) ? "" : properties.authApiGwBaseUrl;
authGwExists=_.isEmpty(properties.authApiVersion) ? authGwExists : authGwExists + "/" + properties.authApiVersion;
var authMsUrl  = properties.authProtocol + "://" + properties.authHost + ":" + properties.authPort + authGwExists; //"http://seidue.crs4.it/api/user/v1/";

var userGwExists=_.isEmpty(properties.userApiGwBaseUrl) ? "" : properties.userApiGwBaseUrl;
userGwExists=_.isEmpty(properties.userApiVersion) ? userGwExists : userGwExists + "/" + properties.userApiVersion;
var userMsUrl  = properties.userProtocol + "://" + properties.userHost + ":" + properties.userPort + userGwExists; //"http://seidue.crs4.it/api/user/v1/";

var userWebUiGwExists=_.isEmpty(properties.userWebUiApiGwBaseUrl) ? "" : properties.userWebUiApiGwBaseUrl;
userWebUiGwExists=_.isEmpty(properties.userWebUiApiVersion) ? userWebUiGwExists : userWebUiGwExists + "/" + properties.userWebUiApiVersion;
var userWebUiMsUrl  = properties.userWebUiProtocol + "://" + properties.userWebUiHost + ":" + properties.userWebUiPort + userWebUiGwExists; //"http://seidue.crs4.it/api/user/v1/";





tokenManager.configure( {
    "decodedTokenFieldName":"UserToken", // Add token in UserToken field
    "exampleUrl":userWebUiMsUrl,
    "authorizationMicroserviceUrl":authMsUrl+ "/tokenactions/checkiftokenisauth",
    "authorizationMicroserviceEncodeTokenUrl":authMsUrl+ "/tokenactions/decodeToken",
    "authorizationMicroserviceToken":properties.myMicroserviceToken,
});



/* GET home page. */
router.get('/',tokenManager.checkTokenValidityOnReq, function(req, res) {

    console.log(req.UserToken);

    var redirectTo=(req.query && req.query.redirectTo);

    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }

    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to login

        request.get(properties.commonUIUrl+"/headerAndFooter", function (error, response, body) {
            if(error){
              return res.render('page_400_error',{properties: properties,error_message:error});
            }else{
                body=JSON.parse(body);
                if(response.statusCode!=200){
                    return res.render('page_400_errors',{properties: properties,error_message:body.error_message});
                }else{
                    var commonUI={
                        footer:body.footer.html,
                        footerCss:body.footer.css,
                        footerScript:body.footer.js,
                        header:body.header.html,
                        headerCss:body.header.css,
                        headerScript:body.header.js
                    };
                    return res.render('login', {commonUI:commonUI,properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
                }
            }
        });

    }
    else { // get user profile
        if(req.UserToken && req.UserToken.error_code) { // no valid access_token
            // go to login
            console.log("Login because not valid Access_token");
            return res.render('login', {properties: properties, redirectTo: userWebUiMsUrl});
        }
        else{ // load page profile

            var rqparams = {
                url:  userMsUrl + '/users/' + req.UserToken.token._id,
                headers: {'content-type': 'application/json','Authorization': "Bearer " + req.UserToken.access_token},
            };

            request.get(rqparams, function (error, response, body) {
                var bodyJson=JSON.parse(body);
                if(response.statusCode==200) {
                    bodyJson.UserToken=req.UserToken.access_token;
                    return res.render('profile', {properties: properties, user: bodyJson, error: null});
                }
                else{
                    return res.render('profile', {properties: properties, user:null ,error:bodyJson});
                }
            });

            }

    }
});




//TODO REMOVE

router.get('/old',tokenManager.checkTokenValidityOnReq, function(req, res) {

    console.log(req.UserToken);

    var redirectTo=(req.query && req.query.redirectTo);

    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }

    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to login

        return res.render('loginOld', {properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});

    }
    else { // get user profile
        if(req.UserToken && req.UserToken.error_code) { // no valid access_token
            // go to login
            console.log("Login because not valid Access_token");
            return res.render('login', {properties: properties, redirectTo: userWebUiMsUrl});
        }
        else{ // load page profile

            var rqparams = {
                url:  userMsUrl + '/users/' + req.UserToken.token._id,
                headers: {'content-type': 'application/json','Authorization': "Bearer " + req.UserToken.access_token},
            };

            request.get(rqparams, function (error, response, body) {
                var bodyJson=JSON.parse(body);
                if(response.statusCode==200) {
                    bodyJson.UserToken=req.UserToken.access_token;
                    return res.render('profile', {properties: properties, user: bodyJson, error: null});
                }
                else{
                    return res.render('profile', {properties: properties, user:null ,error:bodyJson});
                }
            });

        }

    }
});

// /* GET home page. */
// router.get('/index', function(req, res) {
//     res.render('index', {POST_TITLE:"TITLE",POST_AUTHOR:"Author",POST_CONTENT:"Post Content"});
// });

// /* GET home page. */
// router.get('/env', function(req, res) {
//  var env;
//  if (process.env['NODE_ENV'] === 'dev')
//       env='dev';
//  else
//       env='production';
//
//  res.status(200).send({env:env});
// });
//
// router.get('/main', function(req, res) {
//     var action=req.signedCookies.action || null;
//
//     if(action=="log") {
//
//         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//         var gwBaseUrl=conf.getParam("apiGwAuthBaseUrl");
//         var gwVersion=conf.getParam("apiVersion");
//         var gwConf=_.isEmpty(gwBaseUrl) ? "" : gwBaseUrl;
//         gwConf=_.isEmpty(gwVersion) ? gwConf : gwConf + "/" + gwVersion;
//         var adminToken=req.query.adminToken || null;
//         res.render('main', {
//             MicroSL: conf.getParam("microserviceList"),
//             myUrl: conf.getParam("authProtocol") + "://" + conf.getParam("authHost") + ":" + conf.getParam("authPort") + gwConf,
//             myToken: conf.getParam("myMicroserviceToken"),
//             iconsList: iconsList,
//             adminToken:adminToken
//         });
//     }
//     else {
//         res.status(401).send({error:"Unauthorized", error_message:"You are not authorized to access this resource"});
//     }
// });
//
//
//
// /* GET home page. */
// router.get('/configure', function(req, res) {
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     res.render('start', {read:"No"});
// });
//
//
//
// /* GET home page. */
// router.get('/login', function(req, res) {
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     var gwBaseUrl=conf.getParam("apiGwAuthBaseUrl");
//     var gwVersion=conf.getParam("apiVersion");
//     var gwConf=_.isEmpty(gwBaseUrl) ? "" : gwBaseUrl;
//     gwConf=_.isEmpty(gwVersion) ? gwConf : gwConf + "/" + gwVersion;
//     res.render('login', {
//         next: conf.getParam("authProtocol") + "://" + conf.getParam("authHost") + ":" + conf.getParam("authPort") + gwConf,
//         at: conf.getParam("myMicroserviceToken")
//     });
// });
//
// // /* GET home page. */
// // router.get('/configure', function(req, res) {
// //
// // var action=req.signedCookies.action || null;
// //
// //  console.log("XXXXXXXXXXXXXXX " + action + " XXXXXXXXXXXXXX");
// //
// //  console.log("Rendering " + conf.getParam("msType"));
// //
// //
// //     if(action=="log") {
// //
// //         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
// //         res.render('main', {
// //             MicroSL: conf.getParam("microserviceList"),
// //             myUrl: conf.getParam("myMicroserviceBaseUrl"),
// //             myToken: conf.getParam("myMicroserviceToken"),
// //             iconsList: iconsList
// //         });
// //     }
// //     else {
// //         //res.cookie("action","log");
// //         console.log("LOGIN");
// //         res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
// //         res.render('login', {
// //             next: conf.getParam("myMicroserviceBaseUrl"),
// //             at: conf.getParam("myMicroserviceToken")
// //         });
// //     }
// // });
//
//
//
// /* GET home page. */
// router.post('/configure', function(req, res) {
//
//     var ms = {
//         "username": req.body.username,
//         "password": req.body.password
//     };
//     var userBody = JSON.stringify(ms);
//     // console.log("BODY " + userBody);
//
//     var gwBaseUrl=conf.getParam("apiGwAuthBaseUrl");
//     var gwVersion=conf.getParam("apiVersion");
//     var gwConf=_.isEmpty(gwBaseUrl) ? "" : gwBaseUrl;
//     gwConf=_.isEmpty(gwVersion) ? gwConf : gwConf + "/" + gwVersion;
//     request.post({
//         url: conf.getParam("authProtocol") + "://" + conf.getParam("authHost") + ":" + conf.getParam("authPort") + gwConf + "/authuser/signin",
//         body: userBody,
//         headers: {'content-type': 'application/json', 'Authorization': "Bearer " + conf.getParam("myMicroserviceToken")}
//     }, function (error, response,body) {
//         console.log(body);
//         respb=JSON.parse(body);
//         if (respb.error_message){
//             res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//             var gwBaseUrl=conf.getParam("apiGwAuthBaseUrl");
//             var gwVersion=conf.getParam("apiVersion");
//             var gwConf=_.isEmpty(gwBaseUrl) ? "" : gwBaseUrl;
//             gwConf=_.isEmpty(gwVersion) ? gwConf : gwConf + "/" + gwVersion;
//             res.render('login', {
//                 next: conf.getParam("authProtocol") + "://" + conf.getParam("authHost") + ":" + conf.getParam("authPort") + gwConf,
//                 at: conf.getParam("myMicroserviceToken"),
//                 error_message:respb.error_message
//             });
//         }
//         else {
//             res.cookie("action","log",{ signed: true });
//             res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//             res.render('start', {read:"Yes", adminToken:respb.apiKey.token});
//         }
//     });
// });
//
//
//
// /* GET home page. */
// router.post('/logout', function(req, res) {
//     res.clearCookie("action");
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     res.render('start', {read:"No"});
// });





module.exports = router;
