var express = require('express');
var router = express.Router();
var request=require("request");
var _ = require('underscore')._;
var properties = require('propertiesmanager').conf;

var gwExists=_.isEmpty(properties.apiGwUserBaseUrl) ? "" : properties.apiGwUserBaseUrl;
gwExists=_.isEmpty(properties.apiVersion) ? gwExists : gwExists + "/" + properties.apiVersion;
var userMsUrl  = properties.userProtocol + "://" + properties.userHost + ":" + properties.userPort + gwExists; //"http://seidue.crs4.it/api/user/v1/";






router.post('/signup', function(req, res) {

    console.log("BODY TYPE "+typeof  req.body + " --> " + JSON.stringify(req.body));

    var rqparams = {
        url:  userMsUrl + '/users/signup',
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.MyMicroserviceToken},
        body: JSON.stringify(req.body)
    };

    console.log("°°°°°" + userMsUrl + '/users/signup' + "òòòòòòò");

    request.post(rqparams, function (error, response, body) {
        console.log(body);
        return res.status(response.statusCode).send(body);
    });
});



router.post('/signin', function(req, res) {

    console.log("BODY TYPE "+typeof  req.body + " --> " + JSON.stringify(req.body));

    var rqparams = {
        url:  userMsUrl + '/users/signin',
        headers: {'content-type': 'application/json','Authorization': "Bearer " + properties.MyMicroserviceToken},
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


module.exports = router;
