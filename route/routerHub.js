/***
 * 
 * 路由的注册和管理中心
 * 
 */

//deps
var hello = require("./hello");
var home = require("./home");
var users = require("./users");
var token = require("./token");
var checks = require("./checks");
 var handler = {"notFound":function(req,res){
    res.writeHead(404);
    res.end("not found");
 }};

 handler[hello.name] = hello;
 handler[home.name] = home;
 handler[users.name] = users;
 handler[token.name] = token;
 handler[checks.name] = checks;
 module.exports = function(path,req,res){
    var re = new RegExp("^"+path,"i");

    if(re.test(req.originalPath)){
        req.path = path.replace(path,"");//子一集的路由
        var name = path.match(/^\/([^\/]+)\b/)[1]||"";
        if(name){
            if(handler[name]){
                handler[name].handle(req,res);
            }else{
                handler.notFound(req,res);
            }
        }else{//根路径
            res.end("hello world");
        }
        
     }else{
        return;
     }    
 }