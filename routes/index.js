var express = require('express');
var router = express.Router();
var request=require("request");
var _ = require('underscore')._;
var properties = require('propertiesmanager').conf;
var tokenManager = require('./commonFunctions').tokenManager;
var util=require('util');
var commonFunctions=require('./commonFunctions');
var codified_data=require('codified_data');


var authMsUrl  = properties.authUrl; //"http://seidue.crs4.it/api/user/v1/";
var userMsUrl  = properties.userUrl; //"http://seidue.crs4.it/api/user/v1/";
var userWebUiMsUrl  = properties.userUIUrl; //"http://seidue.crs4.it/api/user/v1/";



function getCommonUiResource(resource,callback){
    request.get(properties.commonUIUrl+resource, function (error, response, body) {
        if(error){
            commonFunctions.getErrorPage(500,"500",error,function(er,content){
                return callback (er,content);
            });
        }else{
            console.log(body);
            body=JSON.parse(body);
            if(response.statusCode!=200){
                commonFunctions.getErrorPage(500,500,"Get commonUi Elements: "+ util.inspect(body.error_message),function(er,content){
                    return callback (er,content);
                });

            }else{
                var commonUI={
                    footer:body.footer.html,
                    footerCss:body.footer.css,
                    footerScript:body.footer.js,
                    header:body.header.html,
                    headerCss:body.header.css,
                    headerScript:body.header.js,
                };
                return callback(null,commonUI);
            }
        }
    });
}

function addParamstoURL(url,paramKey,paramValue){
    if(paramValue){
        let op= url.indexOf('?')>=0 ? "&" : "?";
        url= url + op + paramKey +"=" + paramValue
    }

    return url;
}

function getDefaultRequestParams(req){

    let queryparams={};

    let redirectTo=(req.query && req.query.redirectTo) || null;
    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }
    if(redirectTo && ((redirectTo.indexOf("null")>=0)||(redirectTo.indexOf("false")>=0)))
        redirectTo=null;

    queryparams.redirectTo=redirectTo;

    let homeRedirect=(req.query && req.query.homeRedirect) || null;
    if (req.headers['homeRedirect']) {
        homeRedirect= req.headers['homeRedirect'];
    }
    if(homeRedirect && ((homeRedirect.indexOf("null")>=0)||(homeRedirect.indexOf("false")>=0)))
        homeRedirect=null;

    queryparams.homeRedirect=homeRedirect;

    let loginHomeRedirect=(req.query && req.query.loginHomeRedirect) || null;
    if (req.headers['loginHomeRedirect']) {
        loginHomeRedirect= req.headers['loginHomeRedirect'];
    }
    if(loginHomeRedirect && ((loginHomeRedirect.indexOf("null")>=0)||(loginHomeRedirect.indexOf("false")>=0)))
        loginHomeRedirect=null;

    queryparams.loginHomeRedirect=loginHomeRedirect;

    let enableUserUpgrade=(req.query && req.query.enableUserUpgrade) || null;
    if (req.headers['enableUserUpgrade']) {
        enableUserUpgrade= req.headers['enableUserUpgrade'];
    }
    if(enableUserUpgrade && ((enableUserUpgrade.indexOf("null")>=0)||(enableUserUpgrade.indexOf("false")>=0)))
        enableUserUpgrade=null;

    queryparams.enableUserUpgrade=enableUserUpgrade;

    let applicationSettings=(req.query && req.query.applicationSettings) || null;
    if (req.headers['applicationSettings']) {
        applicationSettings= req.headers['applicationSettings'];
    }
    if(applicationSettings && ((applicationSettings.indexOf("null")>=0)||(applicationSettings.indexOf("false")>=0)))
        applicationSettings=null;

    queryparams.applicationSettings=applicationSettings;


    let hAndF="/headerAndFooter";
    hAndF=addParamstoURL(hAndF,"homePage",homeRedirect);
    hAndF=addParamstoURL(hAndF,"loginHomeRedirect",loginHomeRedirect);
    hAndF=addParamstoURL(hAndF,"afterLoginRedirectTo",redirectTo);
    hAndF=addParamstoURL(hAndF,"enableUserUpgrade",enableUserUpgrade);
    hAndF=addParamstoURL(hAndF,"applicationSettings",applicationSettings);

    queryparams.hAndF=hAndF;

    return queryparams;


}


function getLoggedInUserDefaultRequestParams(req,queryparams,userToken){

    let logOutFunc=(req.query && req.query.logout) || null;
    if (req.headers['logout']) {
        logOutFunc= req.headers['logout'];
    }
    if(logOutFunc && ((logOutFunc.indexOf("null")>=0)||(logOutFunc.indexOf("false")>=0)))
        logOutFunc=null;

    queryparams.logOutFunc=logOutFunc;

    let hAndF=queryparams.hAndF;
    hAndF=addParamstoURL(hAndF,"logout","logout('"+ logOutFunc + "');");
    hAndF=addParamstoURL(hAndF,"access_token",userToken);
    hAndF=addParamstoURL(hAndF,"userUiLogoutRedirect",logOutFunc);

    queryparams.hAndF=hAndF;

    return queryparams;


}


router.get('/setNewPassword/:resetToken', function(req, res) {

    var resetToken=req.params.resetToken;
    let queryParams=getDefaultRequestParams(req);




    var rqparams = {
        url:  authMsUrl+ "/tokenactions/decodeToken",
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.myMicroserviceToken},
        body:JSON.stringify({decode_token:resetToken})
    };

    request.get(rqparams, function (error, response, body) {

        try {
            var bodyJson = JSON.parse(body);
        }catch (ex) {
            commonFunctions.getErrorPage(500,"Internal Server Error","Response has no body",function(statusCode,content){
                return res.status(statusCode).send(content);
            });
        }

        if(response.statusCode==200) {
           if(bodyJson.valid==true){
               getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                   if(er){
                       // return error page from commonUI
                       return res.status(er).send(commonUIItem);
                   } else {
                       commonUIItem.languagemanager=properties.languageManagerLibUrl;
                       return res.render('resetPassword', {error_message:null,resetTokenuserId:bodyJson.token._id,resetToken:resetToken,resetPassword:true,commonUI:commonUIItem,properties: properties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                   }
               });
           }else{
               getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                   if(er){
                       // return error page from commonUI
                       return res.status(er).send(commonUIItem);
                   } else {
                       commonUIItem.languagemanager=properties.languageManagerLibUrl;
                       return res.render('resetPassword', {error_message:"error.resetPassword401",resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                   }
               });
           }

        }else{
            getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                if(er){
                    // return error page from commonUI
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('resetPassword', {error_message:"error.resetPassword500",resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                }
            });
        }
    });

});



router.get('/resetPassword',tokenManager.checkTokenValidityOnReq, function(req, res) {

    console.log(req.UserToken);

    let queryParams=getDefaultRequestParams(req);


    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to reset


        var customProperties=_.clone(properties);
        if(queryParams.applicationSettings) {
            customProperties.applicationSettings =  JSON.parse(req.query.applicationSettings);
        }

        console.log("######################################################################################### reset because not Access_token --->" + req.UserToken.error_message);
        getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
           if(er){
               // return error page from commonUI
               return res.status(er).send(commonUIItem);
           } else {
               commonUIItem.languagemanager=properties.languageManagerLibUrl;
               return res.render('resetPassword', {error_message:null,resetPassword:false,commonUI:commonUIItem,properties: customProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
           }
        });

    }
    else { // get user profile
        if(req.UserToken && req.UserToken.error_code) { // no valid access_token
            // go to login
            console.log("######################################################################################### Login because not valid Access_token --> " + req.UserToken.error_message);
            getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                if(er){
                    // return error page from commonUI
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('resetPassword', {error_message:null,resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                }
            });

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
                    bodyJson.type=req.UserToken.token.type;
                    queryParams=getLoggedInUserDefaultRequestParams(req,queryParams,bodyJson.UserToken);


                    var customProperties=_.clone(properties);
                    if(queryParams.enableUserUpgrade){
                        customProperties.enableUserUpgrade=queryParams.enableUserUpgrade;
                    }

                    if(queryParams.applicationSettings){
                        customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
                    }


                    console.log("######################################################################################### Logged User" + bodyJson);
                    getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                        if(er){
                            // return error page from commonUI
                            return res.status(er).send(commonUIItem);
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: customProperties, user: bodyJson, error: null,openPassordTab:true});
                        }
                    });

                }else{

                    commonFunctions.getErrorPage(500,"Internal Server Error",body,function(statusCode,content){
                        return res.status(statusCode).send(content);
                    });
                }
            });
        }
    }
});



/* GET home page. */
router.get('/',tokenManager.checkTokenValidityOnReq, function(req, res) {



    let queryParams=getDefaultRequestParams(req);

    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to login

        var customProperties=_.clone(properties);
        customProperties.resetLinkApplicationSettings="?loginHomeRedirect=" + queryParams.loginHomeRedirect+ "&homeRedirect="+queryParams.homeRedirect+"&redirectTo="+queryParams.redirectTo;
        if(req.query.applicationSettings) {
            customProperties.resetLinkApplicationSettings += "&applicationSettings=" + encodeURIComponent(req.query.applicationSettings);
        }

        console.log("######################################################################################### Login because not Access_token --->" + req.UserToken.error_message);
        console.log(queryParams);
        getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
            if(er){
                // return error page from commonUI
                return res.status(er).send(commonUIItem);
            } else {
                commonUIItem.languagemanager=properties.languageManagerLibUrl;
                return res.render('login', {commonUI:commonUIItem,options:{error:false},properties: customProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
            }
        });

    }
    else { // get user profile
        if(req.UserToken && req.UserToken.error_code) { // no valid access_token
            // go to login
            console.log("######################################################################################### Login because not valid Access_token --> " + req.UserToken.error_message);
            getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                if(er){
                    // return error page from commonUI
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('login', {commonUI:commonUIItem,options:{error:"true"},properties: properties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                }
            });
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
                    queryParams=getLoggedInUserDefaultRequestParams(req,queryParams,bodyJson.UserToken);

                    console.log("######################################################################################### Logged User" + bodyJson);
                    bodyJson.type=req.UserToken.token.type;
                    var customProperties=_.clone(properties);

                    if(queryParams.enableUserUpgrade){
                        customProperties.enableUserUpgrade=req.query.enableUserUpgrade;
                    }

                    if(queryParams.applicationSettings){
                        customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
                    }

                    getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                        if(er){
                            // return error page from commonUI
                            return res.status(er).send(commonUIItem);
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: customProperties, user: bodyJson, error: null,openPassordTab:false});
                        }
                    });

                }else{
                    commonFunctions.getErrorPage(500,"Internal Server Error",body,function(statusCode,content){
                        return res.status(statusCode).send(content);
                    });
                }
            });
        }
    }
});

// need appDmins Array to check in /userprofileAsAdmin/:id route
router.post('/actions/getcodeforsecurecalls',tokenManager.checkAuthorization,function(req,res){
    if(!req.body) return res.status(400).send({error:"BadRequest",error_message:"no body in your request"});
    if(!req.body.appAdmins) return res.status(400).send({error:"BadRequest",error_message:"no mandatory appAdmins field in your body request"});

    codified_data.setKey(req.body,function(err,secret){
        if(err) return res.status(500).send({error:"InternalError",error_message:err});
        res.status(200).send({secret:secret});
    });
});



/* GET home page. */
router.get('/userprofileAsAdmin/:id',tokenManager.checkAuthorization, function(req, res) {

    var secret=(req.query && req.query.secret)||null;

    if(!secret || (secret.toLocaleUpperCase()=="UNDEFINED") || (secret.toLocaleUpperCase()=="NULL")){
        commonFunctions.getErrorPage(400,"BadRequest","query field “secret” is mandatory in the request",function(statusCode,content){
            return res.status(statusCode).send(content);
        });
    }



    codified_data.getKey(secret,function(err,appAdmin){
        if(err){
            commonFunctions.getErrorPage(500,"InternalError",err,function(statusCode,content){
                return res.status(statusCode).send(content);
            });
        }

        if(appAdmin) {
            if (appAdmin.appAdmins.indexOf(req.UserToken.token.type) >= 0) {

                var redirectTo = (req.query && req.query.redirectTo) || null;

                if (req.headers['redirectTo']) {
                    redirectTo = req.headers['redirectTo'];
                }


                var homeRedirect = (req.query && req.query.homeRedirect) || null;
                if (req.headers['homeRedirect']) {
                    homeRedirect = req.headers['homeRedirect'];
                }

                if (homeRedirect && ((homeRedirect.indexOf("null") >= 0) || (homeRedirect.indexOf("false") >= 0)))
                    homeRedirect = null;


                var loginHomeRedirect = (req.query && req.query.loginHomeRedirect) || "null";
                if (req.headers['loginHomeRedirect']) {
                    loginHomeRedirect = req.headers['loginHomeRedirect'];
                }

                if (loginHomeRedirect && ((loginHomeRedirect.indexOf("null") >= 0) || (loginHomeRedirect.indexOf("false") >= 0)))
                    loginHomeRedirect = "null";


                var hAndF = (homeRedirect == null) ? "/headerAndFooter" : "/headerAndFooter?homePage=" + homeRedirect + "&loginHomeRedirect=" + loginHomeRedirect;
                hAndF = (redirectTo == null) ? hAndF : hAndF + "&afterLoginRedirectTo=" + redirectTo;


                var rqparams = {
                    url: userMsUrl + '/users/' + req.params.id,
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': "Bearer " + req.UserToken.access_token
                    },
                };

                console.log(rqparams.url);

                request.get(rqparams, function (error, response, body) {

                    var bodyJson = JSON.parse(body);
                    if (response.statusCode == 200) {

                        bodyJson.UserToken = req.UserToken.access_token;

                        var logOutFunc = (req.query && req.query.logout) || "/";
                        if (req.headers['logout']) {
                            logOutFunc = req.headers['logout'];
                        }

                        if (logOutFunc && ((logOutFunc.indexOf("null") >= 0) || (logOutFunc.indexOf("false") >= 0)))
                            logOutFunc = "/";

                        if (hAndF.indexOf("?") >= 0)
                            hAndF = hAndF + "&logout=logout('" + logOutFunc + "');&access_token=" + bodyJson.UserToken + "&userUiLogoutRedirect=" + logOutFunc;
                        else
                            hAndF = hAndF + "?logout=logout('" + logOutFunc + "');&access_token=" + bodyJson.UserToken + "&userUiLogoutRedirect=" + logOutFunc;

                        bodyJson.ptitle=bodyJson.email+"[" + bodyJson.name + " " + bodyJson.surname + "]";
                        bodyJson.ApplicationTokenTypes=appAdmin.ApplicationTokenTypes;

                        getCommonUiResource(hAndF, function (er, commonUIItem) {
                            if (er) {
                                commonFunctions.getErrorPage(500,"InternalError",(commonUIItem.error_message || "error in get commonui resource"),function(statusCode,content){
                                    return res.status(statusCode).send(content);
                                });
                            } else {
                                commonUIItem.languagemanager = properties.languageManagerLibUrl;
                                return res.render('profile', {
                                    commonUI: commonUIItem,
                                    properties: properties,
                                    user: bodyJson,
                                    error: null,
                                    openPassordTab: false
                                });
                            }
                        });

                    } else {
                        commonFunctions.getErrorPage(404,"Not Found","User Not Found",function(statusCode,content){
                            return res.status(statusCode).send(content);
                        });
                    }
                });

            } else {
                commonFunctions.getErrorPage(401,"Unauthorised","You are not unauthorised to access this resource. Login as"+ appAdmin.appAdmins.toString(),function(statusCode,content){
                    return res.status(statusCode).send(content);
                });
            }
        } else {
            commonFunctions.getErrorPage(500,"InternalError","Is not possible to get secret code",function(statusCode,content){
                return res.status(statusCode).send(content);
            });
        }

    });

});


/* GET status */
router.get('/env', function(req, res) {
 var env;
 if (process.env['NODE_ENV'] === 'dev')
      env='dev';
 else
      env='production';

 res.status(200).send({env:env});
});



module.exports = router;
