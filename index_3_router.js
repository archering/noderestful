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

    var path = String(parsedurl.pathname).trim();// 请求的路由

    var method = req.method.toUpperCase();//客户端请求的方法

    var queryStringObject = parsedurl.query;//querystring

    var headers = req.headers;


    req.originalPath = path;
    req.originalURL = parsedurl;
    req.query = queryStringObject;

    if(/^\/hello\b/ig.test(path)){// hello开头的路由
       req.path = path.replace("/hello","");
       routerhandler.hello(req,res);
    }else if(/^\/home\b/ig.test(path)){//home 开头的路由
    req.path = path.replace("/home","");
        routerhandler.home(req,res);
    }else{
        routerhandler.other(req,res);
    }

});


// the server should start listening

server.listen(config.port,function(){
    console.log("server on "+config.port+" is started and it's running on " + config.mode + " mode");
});


var routerhandler  = {
    "hello":function(req,res){
        if(req.method == "POST" || req.method == "PUT"){
            var decoder = new StringDecoder();
            var buffer = "";
            req.on("data",function(dat){
                buffer += decoder.write(dat);
            });

            req.on("end",function(){
                buffer += decoder.end();
                res.writeHead(200);
                res.end("hello world \n "  + buffer);
                console.log("\n"+req.path);
            });
        }else{
            res.end("without payload and method is " + req.method + "  " + req.path);
        }

    },
    "home":function(req,res){
        if(req.method == "POST" || req.method == "PUT"){
            var decoder = new StringDecoder();
            var buffer = "";
            req.on("data",function(dat){
                buffer += decoder.write(dat);
            });

            req.on("end",function(){
                buffer += decoder.end();
                res.setHeader("Content-Type","text/json"); //浏览器解析为json对象
                res.writeHead(200);
                var reqtype = req.headers["content-type"];
                var dat = {
                    result:"success",
                    status:"0",
                    data:reqtype=="application/json"?JSON.parse(buffer):buffer  
                }

                res.end(JSON.stringify(dat));
                console.log("BUFFER IS ",buffer);
            });
        }else{
            res.end("without payload and method is " + req.method + "  " + req.path);
        }
    },
    "other":function(req,res){
        res.end("no one want handle it ,path is " + req.originalPath);
    }
}
