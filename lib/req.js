/****
 * 
 * 处理请求，并进行路由分发
 * 
 */

 //deps
var url = require("url");

 module.exports = function(req,res,next){
    var requrl = req.url;

    var parsedurl = url.parse(requrl,true);//true 标书解析querystring

    var path = String(parsedurl.pathname).trim();// 请求的路由

    var method = req.method.toUpperCase();//客户端请求的方法

    var queryStringObject = parsedurl.query;//querystring

    var headers = req.headers;


    req.originalPath = path;
    req.originalURL = parsedurl;
    req.query = queryStringObject;
    
    next();
 }