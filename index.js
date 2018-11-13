/**
 * 
 * first demo
 * start a server
 * 
 */


 //deps
 var http = require("http");

 // create a server and the server should respone to any request

 var server = http.createServer(function(req,res){
    res.end("hello world\n");
 });


 // the server should start listening

 server.listen(9090,function(){
    console.log("server on 9090 is started");
 });