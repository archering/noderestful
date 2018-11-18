//deps
var StringDecoder = require("string_decoder").StringDecoder;

var handler = {name:"home"};

var acceptMethods = ["post","get","put","delete"];
handler.handle = function(req,res){

    var method = req.method.toLowerCase();
    if(acceptMethods.indexOf(method)!=-1){
        this[method](req,res);
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
}

handler.put = function(req,res){
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
}

handler.delete = function(req,res){

}

module.exports = handler;