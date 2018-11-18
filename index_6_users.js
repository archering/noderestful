/**
 * 
 * first demo
 * start a server
 * 
 */


//deps
var http = require("http");
var url = require("url");
var https = require("https");
var fs = require("fs");
//dep decoder
var StringDecoder = require("string_decoder").StringDecoder;
//get config 
var config = require("./config");
//opt files
var datOpt = require("./lib/data");

//local deps
var dealRequest = require("./lib/req");
var router = require("./route/routerHub");


// create a server and the server should respone to any request

var httpserver = http.createServer(function(req,res){
    dealRequest(req,res,function(){
        router("/hello",req,res);
        router("/home",req,res);
        router("/users",req,res);
        router("/token",req,res);
    });
});


// the server should start listening

httpserver.listen(config.port,function(){
    console.log("server on "+config.port+" is started and it's running on " + config.mode + " mode");
});


var httpsconfig = {
    'key':fs.readFileSync('./https/key.pem'),
    'cert':fs.readFileSync('./https/cert.pem')
};
var httpsserver = https.createServer(httpsconfig,function(req,res){
    dealRequest(req,res);  
});

// the https server should start listening

httpserver.listen(config.httpsport,function(){
    console.log("https server on "+config.httpsport+" is started and it's running on " + config.mode + " mode");
});
