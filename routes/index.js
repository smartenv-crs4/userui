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




router.get('/setNewPassword/:resetToken', function(req, res) {

    var resetToken=req.params.resetToken;

    var redirectTo=(req.query && req.query.redirectTo);

    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }




    var rqparams = {
        url:  authMsUrl+ "/tokenactions/decodeToken",
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.myMicroserviceToken},
        body:JSON.stringify({decode_token:resetToken})
    };

    request.get(rqparams, function (error, response, body) {

        var bodyJson=JSON.parse(body);
        console.log("????????????????????????????????????????????????????????????????????????????????????????");
        console.log(body);
        console.log(bodyJson.valid);
        console.log(bodyJson.token._id);
        console.log(resetToken);

        if(response.statusCode==200) {
           if(bodyJson.valid==true){
               getCommonUiResource("/headerAndFooter",function(er,commonUIItem){
                   if(er){
                       return res.status(er).send(commonUIItem);
                   } else {
                       commonUIItem.languagemanager=properties.languageManagerLibUrl;
                       return res.render('resetPassword', {resetTokenuserId:bodyJson.token._id,resetToken:resetToken,resetPassword:true,commonUI:commonUIItem,properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
                   }
               });
           }else{
               getCommonUiResource("/headerAndFooter",function(er,commonUIItem){
                   if(er){
                       return res.status(er).send(commonUIItem);
                   } else {
                       commonUIItem.languagemanager=properties.languageManagerLibUrl;
                       return res.render('resetPassword', {resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
                   }
               });
           }

        }else{
            getCommonUiResource("/headerAndFooter",function(er,commonUIItem){
                if(er){
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('resetPassword', {resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
                }
            });
        }
    });

});



router.get('/resetPassword',tokenManager.checkTokenValidityOnReq, function(req, res) {

    console.log(req.UserToken);

    var redirectTo=(req.query && req.query.redirectTo);

    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }

    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to reset

        console.log("######################################################################################### reset because not Access_token --->" + req.UserToken.error_message);
        getCommonUiResource("/headerAndFooter",function(er,commonUIItem){
           if(er){
               return res.status(er).send(commonUIItem);
           } else {
               commonUIItem.languagemanager=properties.languageManagerLibUrl;
               return res.render('resetPassword', {resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
           }
        });

    }
    else { // get user profile
        if(req.UserToken && req.UserToken.error_code) { // no valid access_token
            // go to login
            console.log("######################################################################################### Login because not valid Access_token --> " + req.UserToken.error_message);
            getCommonUiResource("/headerAndFooter",function(er,commonUIItem){
                if(er){
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('resetPassword', {resetPassword:false,commonUI:commonUIItem,properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
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

                    console.log("######################################################################################### Logged User" + bodyJson);
                    bodyJson.type=req.UserToken.token.type;
                    getCommonUiResource("/headerAndFooter?logout=logout();&access_token=" + bodyJson.UserToken,function(er,commonUIItem){
                        if(er){
                            return res.status(er).send(commonUIItem);;
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: properties, user: bodyJson, error: null,openPassordTab:true});
                        }
                    });

                }else{
                    console.log("######################################################################################### " + bodyJson);
                    getCommonUiResource("/headerAndFooter",function(er,commonUIItem){
                        if(er){
                            return res.status(er).send(commonUIItem);
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: properties, user:null ,error:bodyJson, openPassordTab:false});
                        }
                    });
                }
            });
        }
    }
});



/* GET home page. */
router.get('/',tokenManager.checkTokenValidityOnReq, function(req, res) {

    console.log(req.UserToken);



    var redirectTo=(req.query && req.query.redirectTo) || null;

    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }


    var homeRedirect=(req.query && req.query.homeRedirect) || null;
    if (req.headers['homeRedirect']) {
        homeRedirect= req.headers['homeRedirect'];
    }

    if(homeRedirect && ((homeRedirect.indexOf("null")>=0)||(homeRedirect.indexOf("false")>=0)))
        homeRedirect=null;


    var loginHomeRedirect=(req.query && req.query.loginHomeRedirect) || "null";
    if (req.headers['loginHomeRedirect']) {
        loginHomeRedirect= req.headers['loginHomeRedirect'];
    }

    if(loginHomeRedirect && ((loginHomeRedirect.indexOf("null")>=0)||(loginHomeRedirect.indexOf("false")>=0)))
        loginHomeRedirect="null";



    var hAndF= (homeRedirect ==null) ? "/headerAndFooter" :"/headerAndFooter?homePage=" + homeRedirect+ "&loginHomeRedirect=" + loginHomeRedirect;
    hAndF= (redirectTo ==null) ? hAndF :  hAndF+"&afterLoginRedirectTo="+redirectTo;


    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to login

        console.log("######################################################################################### Login because not Access_token --->" + req.UserToken.error_message);
        getCommonUiResource(hAndF,function(er,commonUIItem){
            if(er){
                return res.status(er).send(commonUIItem);
            } else {
                commonUIItem.languagemanager=properties.languageManagerLibUrl;
                return res.render('login', {commonUI:commonUIItem,options:{error:false},properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
            }
        });

    }
    else { // get user profile
        if(req.UserToken && req.UserToken.error_code) { // no valid access_token
            // go to login
            console.log("######################################################################################### Login because not valid Access_token --> " + req.UserToken.error_message);
            getCommonUiResource(hAndF,function(er,commonUIItem){
                if(er){
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('login', {commonUI:commonUIItem,options:{error:"true"},properties: properties, redirectTo:redirectTo || properties.defaultHomeRedirect});
                }
            });
        }
        else{ // load page profile

            var rqparams = {
                url:  userMsUrl + '/users/' + req.UserToken.token._id,
                headers: {'content-type': 'application/json','Authorization': "Bearer " + req.UserToken.access_token},
            };


            console.log(rqparams.url);

            request.get(rqparams, function (error, response, body) {

                var bodyJson=JSON.parse(body);
                if(response.statusCode==200) {
                    bodyJson.UserToken=req.UserToken.access_token;

                    var logOutFunc=(req.query && req.query.logout) || "/";
                    if (req.headers['logout']) {
                        logOutFunc= req.headers['logout'];
                    }

                    if(logOutFunc && ((logOutFunc.indexOf("null")>=0)||(logOutFunc.indexOf("false")>=0)))
                        logOutFunc="/";


                    // var loginHomeRedirect=(req.query && req.query.loginHomeRedirect) || "null";
                    // if (req.headers['loginHomeRedirect']) {
                    //     loginHomeRedirect= req.headers['loginHomeRedirect'];
                    // }
                    //
                    // if(loginHomeRedirect && ((loginHomeRedirect.indexOf("null")>=0)||(loginHomeRedirect.indexOf("false")>=0)))
                    //     loginHomeRedirect="null";


                    console.log("######################################################################################### Logged User" + bodyJson);
                    bodyJson.type=req.UserToken.token.type;
                    if(hAndF.indexOf("?")>=0)
                        hAndF=hAndF+"&logout=logout('"+ logOutFunc + "');&access_token=" + bodyJson.UserToken+"&userUiLogoutRedirect="+logOutFunc;
                    else
                        hAndF=hAndF+"?logout=logout('" + logOutFunc + "');&access_token=" + bodyJson.UserToken+"&userUiLogoutRedirect="+logOutFunc;


                    var customProperties=_.clone(properties);

                    if(req.query.enableUserUpgrade){
                        customProperties.enableUserUpgrade=req.query.enableUserUpgrade;
                        hAndF=hAndF+"&enableUserUpgrade="+customProperties.enableUserUpgrade;
                    }

                    if(req.query.applicationSettings){
                        customProperties.applicationSettings=JSON.parse(req.query.applicationSettings);
                        hAndF=hAndF+"&applicationSettings="+req.query.applicationSettings;
                    }



                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! loginHomeRedirect: !!!!!!!!!!!!!!! " + hAndF);
                    console.log(customProperties);
                    console.log(req.query.enableUserUpgrade);

                    getCommonUiResource(hAndF,function(er,commonUIItem){
                        if(er){
                            return res.status(er).send(commonUIItem);
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: customProperties, user: bodyJson, error: null,openPassordTab:false});
                        }
                    });

                }else{
                    console.log("######################################################################################### " + bodyJson);
                    getCommonUiResource(hAndF,function(er,commonUIItem){
                        if(er){
                            return res.status(er).send(commonUIItem);
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: properties, user:null ,error:bodyJson,openPassordTab:false});
                        }
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
