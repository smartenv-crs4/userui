/**
 * Created by Alessandro on 21/04/2017.
 */

var properties = require('propertiesmanager').conf;
var request=require("request");
var tokenManager = require('tokenmanager');

tokenManager.configure( {
    "decodedTokenFieldName":"UserToken", // Add token in UserToken field
    "exampleUrl":properties.userUIUrl,
    "authorizationMicroserviceUrl":properties.authUrl+ "/tokenactions/checkiftokenisauth",
    "authorizationMicroserviceEncodeTokenUrl":properties.authUrl+ "/tokenactions/decodeToken",
    "authorizationMicroserviceToken":properties.myMicroserviceToken,
});

exports.getErrorPage=function (errorCode,errorMessage,showMore,callback){
    var url=properties.commonUIUrl+"/errorPage?error_code="+errorCode+"&error_message="+ errorMessage +"&showMore_message="+showMore;
    request.get(url,function(err,response,body){
        if(err) return callback(500,{error:"Internal Server Error", error_message:err});
        else{
            return callback(200,body);
        }
    });
}


exports.tokenManager=tokenManager;