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


codified_data.setup({
    host: properties.redisCache.host, // default value
});



let filteredProperties=_.omit(properties,["limit", "skip", "logfile", "myMicroserviceToken", "resetPasswordMail", "upgradeUsermailConf", "redisCache"]);




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



// applicationsettings={
//     mailFrom:config.contentUiAppAdmin.mailfrom,
//     appBaseUrl:config.contentUIUrl,
//     appAdmins:config.ApplicationTokenTypes.adminTokenType,
//     appName:config.contentUiAppAdmin.applicationName,
//     userTokentypesTranslations:config.ApplicationTokenTypes.userTokentypesTranslations,
//     defaultUserType:config.ApplicationTokenTypes.defaultUserType
// };
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
    //*********************************************************************************************************************************************//
    // DS - 20181121
    // userui crashava quando l'admin cliccava sul link della mail per fare l'upgrade del token di un utente che lo richiedeva
    // il motivo era che queryParams.fastSearchUrl risultava settato a "undefined" (string) quindi il JSON.parse della riga 567 andava in eccezione
    // FIX: aggiunto il check ||(loginHomeRedirect.indexOf("undefined")>=0) ai controlli qui sotto
    //*********************************************************************************************************************************************//
    if(homeRedirect && ((homeRedirect.indexOf("null")>=0)||(homeRedirect.indexOf("false")>=0)||(homeRedirect.indexOf("undefined")>=0)))
        homeRedirect=null;

    queryparams.homeRedirect=homeRedirect;

    let loginHomeRedirect=(req.query && req.query.loginHomeRedirect) || null;
    if (req.headers['loginHomeRedirect']) {
        loginHomeRedirect= req.headers['loginHomeRedirect'];
    }
    if(loginHomeRedirect && ((loginHomeRedirect.indexOf("null")>=0)||(loginHomeRedirect.indexOf("false")>=0)||(loginHomeRedirect.indexOf("undefined")>=0)))
        loginHomeRedirect=null;

    queryparams.loginHomeRedirect=loginHomeRedirect;

    let enableUserUpgrade=(req.query && req.query.enableUserUpgrade) || null;
    if (req.headers['enableUserUpgrade']) {
        enableUserUpgrade= req.headers['enableUserUpgrade'];
    }
    if(enableUserUpgrade && ((enableUserUpgrade.indexOf("null")>=0)||(enableUserUpgrade.indexOf("false")>=0)||(enableUserUpgrade.indexOf("undefined")>=0)))
        enableUserUpgrade=null;

    queryparams.enableUserUpgrade=enableUserUpgrade;

    let applicationSettings=(req.query && req.query.applicationSettings) || null;
    if (req.headers['applicationSettings']) {
        applicationSettings= req.headers['applicationSettings'];
    }
    if(applicationSettings && ((applicationSettings.indexOf("null")>=0)||(applicationSettings.indexOf("false")>=0)||(applicationSettings.indexOf("undefined")>=0)))
        applicationSettings=null;

    queryparams.applicationSettings=applicationSettings;

    let fastSearchUrl=(req.query && req.query.fastSearchUrl) || null;
    if (req.headers['fastSearchUrl']) {
        fastSearchUrl= req.headers['fastSearchUrl'];
    }
    if(fastSearchUrl && ((fastSearchUrl.indexOf("null")>=0)||(fastSearchUrl.indexOf("false")>=0)||(fastSearchUrl.indexOf("undefined")>=0)))
        fastSearchUrl=null;

    queryparams.fastSearchUrl=fastSearchUrl;


    let customMenu=(req.query && req.query.customMenu) || null;
    if (req.headers['customMenu']) {
        customMenu= req.headers['customMenu'];
    }
    if(customMenu && ((customMenu.indexOf("null")>=0)||(customMenu.indexOf("false")>=0)))
        customMenu=null;

    queryparams.customMenu=customMenu;

    let favourite=(req.query && req.query.favourite) || null;
    if (req.headers['favourite']) {
        favourite= req.headers['favourite'];
    }
    if(favourite && ((favourite.indexOf("null")>=0)||(favourite.indexOf("false")>=0)))
        favourite=null;

    queryparams.favourite=favourite;


    let hAndF="/headerAndFooter";
    hAndF=addParamstoURL(hAndF,"homePage",homeRedirect);
    hAndF=addParamstoURL(hAndF,"loginHomeRedirect",loginHomeRedirect);
    hAndF=addParamstoURL(hAndF,"afterLoginRedirectTo",redirectTo);
    hAndF=addParamstoURL(hAndF,"enableUserUpgrade",enableUserUpgrade);
    hAndF=addParamstoURL(hAndF,"applicationSettings",applicationSettings);
    hAndF=addParamstoURL(hAndF,"fastSearchUrl",fastSearchUrl);
    hAndF=addParamstoURL(hAndF,"customMenu",customMenu);
    hAndF=addParamstoURL(hAndF,"favourite",favourite);

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


    let userUiDeleteUserRedirect=(req.query && req.query.userUiDeleteUserRedirect) || null;
    if (req.headers['userUiDeleteUserRedirect']) {
        logOutFunc= req.headers['userUiDeleteUserRedirect'];
    }
    if(userUiDeleteUserRedirect && ((userUiDeleteUserRedirect.indexOf("null")>=0)||(userUiDeleteUserRedirect.indexOf("false")>=0)))
        userUiDeleteUserRedirect=null;


    queryparams.userUiDeleteUserRedirect=userUiDeleteUserRedirect;


    let hAndF=queryparams.hAndF;
    hAndF=addParamstoURL(hAndF,"logout","logout('"+ logOutFunc + "');");
    hAndF=addParamstoURL(hAndF,"access_token",userToken);
    hAndF=addParamstoURL(hAndF,"userUiLogoutRedirect",logOutFunc);
    hAndF=addParamstoURL(hAndF,"userUiDeleteUserRedirect",userUiDeleteUserRedirect);

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
                       return res.render('resetPassword', {error_message:null,resetTokenuserId:bodyJson.token._id,resetToken:resetToken,resetPassword:true,commonUI:commonUIItem,properties: filteredProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                   }
               });
           }else{
               getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                   if(er){
                       // return error page from commonUI
                       return res.status(er).send(commonUIItem);
                   } else {
                       commonUIItem.languagemanager=properties.languageManagerLibUrl;
                       return res.render('resetPassword', {error_message:"error.resetPassword401",resetPassword:false,commonUI:commonUIItem,properties: filteredProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
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
                    return res.render('resetPassword', {error_message:"error.resetPassword500",resetPassword:false,commonUI:commonUIItem,properties: filteredProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
                }
            });
        }
    });

});



router.get('/resetPassword',tokenManager.checkTokenValidityOnReq, function(req, res) {

    console.log(req.UserToken);

    let queryParams=getDefaultRequestParams(req);

    var customProperties=_.clone(filteredProperties);
    if(queryParams.applicationSettings) {
        customProperties.applicationSettings =  JSON.parse(req.query.applicationSettings);
    }

    if(req.UserToken && req.UserToken.error_code && req.UserToken.error_code=="0") { // no access_token provided so go to reset




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
                    return res.render('resetPassword', {error_message:null,resetPassword:false,commonUI:commonUIItem,properties: customProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
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


                    // var customProperties=_.clone(filteredProperties);
                    if(queryParams.enableUserUpgrade){
                        customProperties.enableUserUpgrade=queryParams.enableUserUpgrade;
                    }

                    if(queryParams.applicationSettings){
                        customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
                    }


                    if(queryParams.fastSearchUrl){
                        customProperties.fastSearchUrl=JSON.parse(queryParams.fastSearchUrl);
                    }

                    if(queryParams.userUiDeleteUserRedirect){
                        customProperties.userUiDeleteUserRedirect=queryParams.userUiDeleteUserRedirect;
                    }


                    if(queryParams.logOutFunc){
                        customProperties.logOutFunc=queryParams.logOutFunc;
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

        var customProperties=_.clone(filteredProperties);
        customProperties.resetLinkApplicationSettings="?loginHomeRedirect=" + queryParams.loginHomeRedirect+ "&homeRedirect="+queryParams.homeRedirect+"&redirectTo="+queryParams.redirectTo;
        if(queryParams.applicationSettings){
            customProperties.resetLinkApplicationSettings += "&applicationSettings=" + encodeURIComponent(req.query.applicationSettings);
            customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
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
            var customProperties=_.clone(filteredProperties);
            customProperties.resetLinkApplicationSettings="?loginHomeRedirect=" + queryParams.loginHomeRedirect+ "&homeRedirect="+queryParams.homeRedirect+"&redirectTo="+queryParams.redirectTo;
            if(queryParams.applicationSettings){
                customProperties.resetLinkApplicationSettings += "&applicationSettings=" + encodeURIComponent(req.query.applicationSettings);
                customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
            }
            // go to login
            console.log("######################################################################################### Login because not valid Access_token --> " + req.UserToken.error_message);
            getCommonUiResource(queryParams.hAndF,function(er,commonUIItem){
                if(er){
                    // return error page from commonUI
                    return res.status(er).send(commonUIItem);
                } else {
                    commonUIItem.languagemanager=properties.languageManagerLibUrl;
                    return res.render('login', {commonUI:commonUIItem,options:{error:"true"},properties: customProperties, redirectTo:queryParams.redirectTo || properties.defaultHomeRedirect});
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


                    bodyJson.type=req.UserToken.token.type;
                    var customProperties=_.clone(filteredProperties);

                    if(queryParams.enableUserUpgrade){
                        customProperties.enableUserUpgrade=req.query.enableUserUpgrade;
                    }

                    if(queryParams.applicationSettings){
                        customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
                    }


                    if(queryParams.fastSearchUrl){
                        customProperties.fastSearchUrl=JSON.parse(queryParams.fastSearchUrl);
                    }

                    if(queryParams.userUiDeleteUserRedirect){
                        customProperties.userUiDeleteUserRedirect=queryParams.userUiDeleteUserRedirect;
                    }


                    if(queryParams.logOutFunc){
                        customProperties.logOutFunc=queryParams.logOutFunc;
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
router.get('/userprofileAsAdmin/:id',tokenManager.checkAuthorizationOnReq, function(req, res) {


    if(req.UserToken.valid){
        var secret=(req.query && req.query.secret)||null;

        if(!secret || (secret.toLocaleUpperCase()=="UNDEFINED") || (secret.toLocaleUpperCase()=="NULL")){
            console.log("Not Secret");
            commonFunctions.getErrorPage(400,"BadRequest","query field 'secret' is mandatory in the request",function(statusCode,content){
                return res.status(statusCode).send(content);
            });
        }else{
            codified_data.getKey(secret,{delete:true},function(err,appAdmin){
                if(err){
                    commonFunctions.getErrorPage(500,"InternalError",err,function(statusCode,content){
                        return res.status(statusCode).send(content);
                    });
                }

                if(appAdmin) {
                    if (appAdmin.appAdmins.indexOf(req.UserToken.token.type) >= 0) {

                        let queryParams=getDefaultRequestParams(req);

                        var rqparams = {
                            url: userMsUrl + '/users/' + req.params.id,
                            headers: {
                                'content-type': 'application/json',
                                'Authorization': "Bearer " + req.UserToken.access_token
                            },
                        };


                        request.get(rqparams, function (error, response, body) {

                            var bodyJson = JSON.parse(body);

                            if (response.statusCode == 200) {

                                bodyJson.UserToken = req.UserToken.access_token;

                                queryParams=getLoggedInUserDefaultRequestParams(req,queryParams,bodyJson.UserToken);


                                var customProperties=_.clone(filteredProperties);

                                if(queryParams.enableUserUpgrade){
                                    customProperties.enableUserUpgrade=req.query.enableUserUpgrade;
                                }

                                if(queryParams.applicationSettings){
                                    customProperties.applicationSettings=JSON.parse(queryParams.applicationSettings);
                                }

                                if(queryParams.fastSearchUrl){
                                    customProperties.fastSearchUrl=JSON.parse(queryParams.fastSearchUrl);
                                }

                                if(queryParams.userUiDeleteUserRedirect){
                                    customProperties.userUiDeleteUserRedirect=queryParams.userUiDeleteUserRedirect;
                                }


                                if(queryParams.logOutFunc){
                                    customProperties.logOutFunc=queryParams.logOutFunc;
                                }


                                bodyJson.ptitle=bodyJson.email+"[" + bodyJson.name + " " + bodyJson.surname + "]";
                                bodyJson.ApplicationTokenTypes=appAdmin.ApplicationTokenTypes;

                                getCommonUiResource(queryParams.hAndF, function (er, commonUIItem) {
                                    if (er) {
                                        commonFunctions.getErrorPage(500,"InternalError",(commonUIItem.error_message || "error in get commonui resource"),function(statusCode,content){
                                            return res.status(statusCode).send(content);
                                        });
                                    } else {
                                        commonUIItem.languagemanager = properties.languageManagerLibUrl;
                                        return res.render('profile', {
                                            commonUI: commonUIItem,
                                            properties: customProperties,
                                            user: bodyJson,
                                            error: null,
                                            openPassordTab: false
                                        });
                                    }
                                });

                            } else {
                                if(response.statusCode==404){
                                    commonFunctions.getErrorPage(404,"Not Found","User profile not found",function(statusCode,content){
                                        return res.status(statusCode).send(content);
                                    });
                                }else {
                                    let msg;
                                    if(bodyJson.error_message) msg=bodyJson.error_message;
                                    else msg=body;

                                    commonFunctions.getErrorPage(500, "Internal Server Error", msg, function (statusCode, content) {
                                        return res.status(statusCode).send(content);
                                    });
                                }
                            }
                        });

                    } else {
                        commonFunctions.getErrorPage(401,"Unauthorised","You are not unauthorised to access this resource. Login as"+ appAdmin.appAdmins.toString(),function(statusCode,content){
                            return res.status(statusCode).send(content);
                        });
                    }
                } else {
                    commonFunctions.getErrorPage(403,"Forbidden","You are not authorised. Expired session due to is not possible to get secret code",function(statusCode,content){
                        return res.status(statusCode).send(content);
                    });
                }

            });
        }
    }else{
        commonFunctions.getErrorPage(401,"Unauthorised",req.UserToken.error_message,function(statusCode,content){
            return res.status(statusCode).send(content);
        });
    }

});


router.get('/redirecttoerrorpage', function(req, res) {
    commonFunctions.getErrorPage(req.query.error_status || 500, req.query.error_code|| "Internal Server Error", req.query.error_message || "No More Info", req.query.defaultHomeRedirect || null,function (statusCode, content) {
        return res.status(statusCode).send(content);
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
