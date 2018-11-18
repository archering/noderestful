
//deps
var StringDecoder = require("string_decoder").StringDecoder;

var handler = {name:"hello"};

var acceptMethods = ["post","get","put","delete"];
handler.handle = function(req,res){

    var method = req.method.toLowerCase();
    if(acceptMethods.indexOf(method)!=-1){
        thid[method](req,res);
    }else{

    }

}

handler.get = function(req,res){

}

handler.post = function(req,res){
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
}

handler.put = function(req,res){
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
}

handler.delete = function(req,res){

}

module.exports = handler;