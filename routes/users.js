var express = require('express');
var router = express.Router();
var request=require("request");
var _ = require('underscore')._;
var properties = require('propertiesmanager').conf;
var multiparty = require('multiparty');
var magic = require('stream-mmmagic');
var fs=require('fs');
var Buffer=require('buffer').Buffer;
var commonFunctions=require('./commonFunctions');
var tokenManager = require('./commonFunctions').tokenManager;




var userMsUrl  = properties.userUrl;

var uploadMsUrl  = properties.uploadUrl; //"http://seidue.crs4.it/api/user/v1/";





router.post('/signup', function(req, res) {


    var rqparams = {
        url:  userMsUrl + '/users/signup',
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.myMicroserviceToken},
        body: JSON.stringify(req.body)
    };

    request.post(rqparams, function (error, response, body) {
        return res.status(response.statusCode).send(body);
    });
});



router.post('/signin', function(req, res) {


    var rqparams = {
        url:  userMsUrl + '/users/signin',
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.myMicroserviceToken},
        body: JSON.stringify(req.body)
    };

    console.log("°°°°°" + userMsUrl + '/users/signup' + "òòòòòòò");

    request.post(rqparams, function (error, response, body) {
        console.log(body);
        return res.status(response.statusCode).send(body);
    });
});


router.put('/:id', function(req, res) {

    var rqparams = {
        url:  userMsUrl + '/users/' + req.params.id,
        headers: {'content-type': 'application/json','Authorization': "Bearer " + (req.query.access_token || "")},
        body: JSON.stringify(req.body)
    };

    console.log("=====>" + req.query.access_token );

    request.put(rqparams, function (error, response, body) {
        console.log(body);
        return res.status(response.statusCode).send(body);
    });
});






function readStream(allowedMime,req,callback){

    var form = new multiparty.Form();

    form.on('error', function(err){
        return callback({error:"InternalError", error_code:err.statusCode, error_message:err},null);
    });


    form.on('part', function(part){


        console.log(JSON.stringify(part));

        if(part.filename){
            if(allowedMime == undefined){
                return callback(null,{tag:part.name, file:part, filename: part.filename, byteCount:part.byteCount,contentType:part.headers['content-type']});
            }else{
                console.log("im Before MAGIC");
                magic(part, function (err, mime, output){ //get mime
                    console.log("im in MAGIC");
                    if (err) return callback({error:"InternalError", error_code:500, error_message:err},null);
                    var allowed = false;

                    for(var i in allowedMime){
                        if(allowedMime[i].indexOf("/") > -1){
                            // check if strings are equals (ignore case)
                            var re = new RegExp("^" + allowedMime[i] + "$", "i");
                            if(re.test(mime.type)){
                                allowed = true;
                                break;
                            }
                        }else{
                            // check if  mime.type starts with allowedMime[i] (ignore case)
                            // fastest method
                            var re = new RegExp("^" + allowedMime[i], "i");
                            if(re.test(mime.type)){
                                allowed = true;
                                break;
                            }
                        }
                    }

                    if(allowed){
                        return callback(null,{tag:part.name, file:output, filename:  part.filename, byteCount:part.byteCount,contentType:part.headers['content-type']});
                    }else{
                        return callback({error:"BadRequest", error_code:400, error_message:"Mime type " + mime.type + " is not allowed"},null);
                    }
                });
            }

        }
    });
    form.parse(req);

};



router.post('/actions/upload', function(req, response, next) {
    var form = new multiparty.Form();

    form.on('part', function(formPart) {
       var contentType = formPart.headers['content-type'];

        var formData = {
            file: {
                value: formPart,
                options: {
                    filename: formPart.filename,
                    knownLength: formPart.byteCount,
                    contentType: contentType
                }
            }
        };

        request.post({
            url: uploadMsUrl + "/file",
            formData: formData,

            // These may or may not be necessary for your server:
            preambleCRLF: true,
            postambleCRLF: true
        },function(err,respon,body){
            console.log(body);
            response.send(body);
        });
    });

    // form.on('error', function(error) {
    //     next(error);
    // });

    // form.on('close', function() {
    //     // response.send('received upload');
    //     console.log("CLOSE");
    // });

    form.parse(req);
});


router.post('/actions/uploadprofileimage', function(req, res) {


    readStream(["image"],req,function(err,stream){
        
        var formData = {};

        formData[stream.tag]={
            value:stream.file,
            options: {
                filename: stream.filename,
                knownLength: stream.byteCount,
                contentType: stream.contentType
            }
        };

        var options ={
            url: uploadMsUrl + "/file",
            method: "POST",
            headers: {'Authorization': "Bearer " + properties.myMicroserviceToken || (getToken(req) || "")},
            formData:formData,
            preambleCRLF: true,
            postambleCRLF: true
        };

        request.post(options,function(err,response,body){
            if(err)
                return res.status(500).send({error_code:500, error:"Internalerror", error_message:err});
            res.status(response.statusCode).send(JSON.parse(body));
        });

    });
});

router.get('/actions/getprofileimage/:id', function(req, res) {
    var imageId=req.params.id;

    var rqparams = {
        url:  uploadMsUrl + "/file/" + imageId,
        headers: {'Authorization': "Bearer " +  properties.myMicroserviceToken || (getToken(req))},
    };

    request.get(rqparams).on('response', function(response) {
        if(response.statusCode==200)
            this.pipe(res);
        else {
            request.get(properties.userUIUrl + "/customAssets/img/avatar.png").pipe(res);
        }
    });
});

function getToken(req){
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token)|| null; // || req.headers['x-access-token'];
    if (req.headers['authorization']) {
        var value = req.headers['authorization'];
        header = value.split(" ");
        if (header.length == 2)
            if (header[0] == "Bearer") {
                token = header[1];
            }
    }

    return token;
}

router.post('/:id/actions/setpassword', function(req, res) {

    var userId=req.params.id;


    var rqparams = {
        url:  userMsUrl+"/users/" +userId + "/actions/setpassword",
        headers: {'content-type': 'application/json','Authorization': "Bearer " + (getToken(req) || properties.myMicroserviceToken)},
        body:JSON.stringify(req.body)
    };
    request.post(rqparams).pipe(res);
});


router.post('/actions/resetPassword/:email', function(req, res) {

    var email=req.params.email;


    let applicationSettings={};
    if(!req.query.applicationSettings)
        return res.status(500).send({error:"Internal Server Error",error_message:"No applicationSettings query field"});

    try {
        applicationSettings = JSON.parse(req.query.applicationSettings);
    }catch (ex) {
        return res.status(500).send({error:"Internal Server Error",error_message:"Bad applicationSettings query field"});
    }




    var rqparams = {
        url:  userMsUrl + "/users/"+email+"/actions/resetpassword",
        headers: {'Authorization': "Bearer " + properties.myMicroserviceToken},
    };
    request.post(rqparams,function(err,response,body){ // get reset password token
        if(err){ // internla Error
                return res.status(500).send({error:"InternalError",error_message:err});
        }else{
            var bodyJson=JSON.parse(body);
            if(bodyJson.error){ // reset password error
                return res.status(response.statusCode).send(bodyJson);
            }else{

                var resetLink=properties.userUIUrl + "/setNewPassword/"+ bodyJson.reset_token +"?homeRedirect=" + applicationSettings.appBaseUrl;
                resetLink+= ("&loginHomeRedirect=" + applicationSettings.appBaseUrl + "&redirectTo="+applicationSettings.appBaseUrl);
                resetLink+=("&applicationSettings="+ encodeURIComponent(JSON.stringify(applicationSettings)));


                var bodyMail="<p>"+ properties.resetPasswordMail.htmlMessage +"<br> <a href=\""+ resetLink + "\" style=\"color:#2A5685\">Click Here</a></p>";

                var mail={
                         "from":applicationSettings.mailFrom,
                         "to":[email],
                         "subject":applicationSettings.appName + " " + properties.resetPasswordMail.subject,
                         "htmlBody":bodyMail
                };

                var options={
                    url:  properties.mailUrl + "/email",
                    headers: {'Authorization': "Bearer " + properties.myMicroserviceToken, 'content-type': 'application/json'},
                    body: JSON.stringify(mail)
                };

                request.post(options,function(err,resp,body){
                    if(err){
                        return res.status(500).send({error:"InternalError",error_message:err});
                    }else{
                        console.log(body);
                        var respBody=JSON.parse(body);
                       if(resp.statusCode!=200){
                            return res.status(resp.statusCode).send({error:respBody.error,error_message:body});
                       }else{
                            return res.status(200).send({username:email});
                       }
                    }
                });

            }
        }
    });
});



router.post('/:id/actions/upgradeusertype/:type',tokenManager.checkAuthorization,function(req,res){

    var id=req.params.id;
    var upgradeType=req.params.type;

    var rqparams = {
        url:  userMsUrl + '/users/' +id+ '/actions/setusertype/'+upgradeType,
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.myMicroserviceToken},
        body: JSON.stringify(req.body)
    };

    request.post(rqparams).pipe(res);

});



// applicationSettings={mailFrom:{name":"Cagliari Port", "address":"cport2020@gmail.com"}, appAdmins:["tokentype"],appName:"NomeApp", appBaseUrl:"http://localhost.....",};
router.post('/actions/upgradeUser', function(req, res) {


    console.log("send email request");

    let applicationSettings=JSON.parse(req.query.applicationSettings);
    let toUserType=req.query.toUserType;

    console.log(applicationSettings);

    var resetLink=applicationSettings.appBaseUrl + "/upgradeuser/"+ req.query.access_token;

    console.log(resetLink);

    var bodyMail="<p>"+ properties.upgradeUsermailConf.htmlMessage +"<br> <a href=\""+ resetLink + "\" style=\"color:#2A5685\">Click Here</a></p>";

    console.log(bodyMail);


    // get Application user Admins
    var rqparams = {
        url:  properties.userUrl + "/users/actions/search",
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.myMicroserviceToken },
        body:JSON.stringify({searchterm:{type:applicationSettings.appAdmins}})
    };

    console.log(rqparams);

    request.post(rqparams,function(err,response,body){ //check if default admin user exist
        if(err) {
            console.log(err);
            return res.status(500).send({error: "InternalError", error_message: err});
        }

        var responseBody=JSON.parse(body);

        console.log(body);

        if(response.statusCode==200){
            if(responseBody._metadata.totalCount==0){ // if not user  exist
                return res.status(500).send({error:"InternalError",error_message:"Application administrator not found"});
            }else{ // send email to all admin user


                let to=[];

                responseBody.users.forEach(function(userElement) {
                   to.push(userElement.email);
                });


                var mail={
                    "from":applicationSettings.mailFrom,
                    "to":to,
                    "subject":applicationSettings.appName+ " " +properties.upgradeUsermailConf.subject + " " + toUserType,
                    "htmlBody":bodyMail
                };

                console.log(mail);

                var options={
                    url:  properties.mailUrl + "/email",
                    headers: {'Authorization': "Bearer " + properties.myMicroserviceToken, 'content-type': 'application/json'},
                    body: JSON.stringify(mail)
                };

                console.log(options);

                request.post(options,function(err,resp,body){
                    if(err){
                        return res.status(500).send({error:"InternalError",error_message:err});
                    }else{
                        console.log(body);
                        var respBody=JSON.parse(body);
                        if(resp.statusCode!=200){
                            return res.status(resp.statusCode).send({error:respBody.error,error_message:body});
                        }else{
                            return res.status(200).send(respBody);
                        }
                    }
                });

            }
        }else{
            responseBody.error_message+=" in " + properties.userUrl + "/users/actions/search";
            return res.status(response.statusCode).send(responseBody);
        }
    });
});


router.post('/actions/checkIftokenexixt/:name',function(req,res){

    var rqparams = {
        url:  properties.authUrl + '/usertypes?skip=-1&limit=-1&name='+req.params.name,
        headers: {'Authorization': "Bearer " + properties.myMicroserviceToken},
    };

    request.get(rqparams).pipe(res);

});





module.exports = router;
