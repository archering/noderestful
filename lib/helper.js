/***
 * 
 * A helper utility for deal with file and data 
 * 
 */
var config = require("../config");
//deps 
var crypto = require("crypto");
var file = require("./data");

 // create a container
 var utility = {};


//crypto  data 
utility.hash = function(str){
    if(str){
        return crypto.createHmac("sha256",config.key).update(str).digest("hex");
    }else{
        return false;
    }
}

// parse  string to json object
utility.parse2JSON = function(str){
    try{
        return JSON.parse(str);
    }catch(err){
        return {};
    }
}

utility.generateToken = function(len){
    var dic = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var i = 0,token="";
    while(i<20){
        token += dic.charAt(Math.floor(Math.random()*dic.length))
        i++;
    }
    return token;
}

//这个方法是用来给 user  handler 里面的请求做校验的
utility.verifyToken = function(tid,phone,callback){
    if(tid){
        file.read("token",tid,function(err,dat){
            if(!err && dat){
                var datObj = utility.parse2JSON(dat);
                if(datObj.phone == phone && datObj.expired > Date.now()){
                    callback(false);
                }else{
                    callback(true);
                }
            }else{
                callback(true);
            }
        });
    }else{
        callback(true,"token is empty");
    }
}


module.exports = utility;
