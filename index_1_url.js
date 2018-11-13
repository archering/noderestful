/**
 * 
 * first demo
 * start a server
 * 
 */


 //deps
 var http = require("http");
 var url = require("url");

 // create a server and the server should respone to any request

 var server = http.createServer(function(req,res){
    
    var requrl = req.url;

    var parsedurl = url.parse(requrl,true);//true 标书解析querystring
    
    var route = String(parsedurl.pathname).trim();// 请求的路由

    var method = req.method.toUpperCase();//客户端请求的方法

    var queryStringObject = parsedurl.query;//querystring

    var headers = req.headers;
    
    res.end("hello world\n");

    console.log("request route is " + route + " and the method is " + method + " and with there queries:",queryStringObject);
    // 注意啊， console.log 里面写 字符串 和 object的输出方式不同
    console.log("request headers are :", headers);
});


 // the server should start listening

 server.listen(9090,function(){
    console.log("server on 9090 is started");
 });