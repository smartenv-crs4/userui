var express = require('express');
var router = express.Router();
var request=require("request");
var _ = require('underscore')._;
var properties = require('propertiesmanager').conf;
var tokenManager = require('tokenmanager');
var util=require('util');
var commonFunctions=require('./commonFunctions');


var authMsUrl  = properties.authUrl; //"http://seidue.crs4.it/api/user/v1/";
var userMsUrl  = properties.userUrl; //"http://seidue.crs4.it/api/user/v1/";
var userWebUiMsUrl  = properties.userUIUrl; //"http://seidue.crs4.it/api/user/v1/";


tokenManager.configure( {
    "decodedTokenFieldName":"UserToken", // Add token in UserToken field
    "exampleUrl":userWebUiMsUrl,
    "authorizationMicroserviceUrl":authMsUrl+ "/tokenactions/checkiftokenisauth",
    "authorizationMicroserviceEncodeTokenUrl":authMsUrl+ "/tokenactions/decodeToken",
    "authorizationMicroserviceToken":properties.myMicroserviceToken,
});


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

    var redirectTo=(req.query && req.query.redirectTo);

    if (req.headers['redirectTo']) {
        redirectTo= req.headers['redirectTo'];
    }


    var homeRedirect=(req.query && req.query.homeRedirect) || null;
    if (req.headers['homeRedirect']) {
        homeRedirect= req.headers['homeRedirect'];
    }

    if(homeRedirect && ((homeRedirect.indexOf("null")>=0)||(homeRedirect.indexOf("false")>=0)))
        homeRedirect=null;


    var hAndF=homeRedirect !=null ? "/headerAndFooter" :"/headerAndFooter?homePage=" + homeRedirect;

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
                    return res.render('login', {commonUI:commonUIItem,options:{error:"true"},properties: properties, redirectTo:userWebUiMsUrl});
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
                    if(hAndF.indexOf("?")>=0)
                        hAndF=hAndF+"logout=logout();&access_token=" + bodyJson.UserToken;
                    else
                        hAndF=hAndF+"?logout=logout();&access_token=" + bodyJson.UserToken;
                    getCommonUiResource(hAndF,function(er,commonUIItem){
                        if(er){
                            return res.status(er).send(commonUIItem);;
                        } else {
                            commonUIItem.languagemanager=properties.languageManagerLibUrl;
                            return res.render('profile', {commonUI:commonUIItem,properties: properties, user: bodyJson, error: null,openPassordTab:false});
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
