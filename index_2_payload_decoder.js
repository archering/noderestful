/**
 * 
 * first demo
 * start a server
 * 
 */


//deps
var http = require("http");
var url = require("url");
//dep decoder
var StringDecoder = require("string_decoder").StringDecoder;
//get config
var config = require("./config");

// create a server and the server should respone to any request

var server = http.createServer(function(req,res){

var requrl = req.url;

var parsedurl = url.parse(requrl,true);//true 标书解析querystring

var route = String(parsedurl.pathname).trim();// 请求的路由

var method = req.method.toUpperCase();//客户端请求的方法

var queryStringObject = parsedurl.query;//querystring

var headers = req.headers;


//get the payload if 
var decoder = new StringDecoder("utf-8");

var buffer = "";
req.on("data",function(data){
    buffer += decoder.write(data);
});

req.on("end",function(){
    buffer += decoder.end();
    if(/^\{.*\}$/igm.test(buffer)){// 这个方法不行, reg没问题
     
        try{
        var json = JSON.parse(buffer);
        }catch(error){

        }
        var tag = "json"
    }else{
        tag = "plain string";
    }
    

    
    if(tag=="json"){
        res.end("your name is " + tag.name + " \n  your age is " + tag.age);
    }else{
        res.end("payload geted" + buffer);
        console.log("payload is ",buffer);
    }
    

});

});


// the server should start listening

server.listen(config.port,function(){
    console.log("server on "+config.port+" is started and it's running on " + config.mode + " mode");
});