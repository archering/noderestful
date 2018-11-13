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

datOpt.saveAs("test","c",{"name":"zhang",age:30},function(err){
        console.log(err);
});

datOpt.read("test","a",function(err,data){
    if(!err){
        console.log("data is ",data);
    }else{
        console.log("err is ",err);
    }
});

setTimeout(function(){

    datOpt.update("test","c",{"greeting":"hello world"},function(err){
        if(!err){
            console.log("更新文件成功");
            datOpt.read("test","c",function(err,data){
                if(!err){
                    console.log("new data is ",data);
                }else{
                    console.log("err is ",err);
                }
            });


        }else{
            console.log(err);
        }
    });

},1000);

setTimeout(function(){

    datOpt.delete("test","c",function(err){
        if(!err){
            console.log("删除文件成功");
        }else{
            console.log(err);
        }
    });


},6000);



//deal request
function dealRequest(req,res){
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
        routerhandler.notFound(req,res);
    }
}

// create a server and the server should respone to any request

var httpserver = http.createServer(function(req,res){
    dealRequest(req,res);
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
    "notFound":function(req,res){
        res.writeHead(404);
        res.end("no one want handle it ,path is " + req.originalPath);
    }
}
