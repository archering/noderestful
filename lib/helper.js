/***
 * 
 * A helper utility for deal with file and data 
 * 
 */
var config = require("../config");
//deps 
var crypto = require("crypto");


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

module.exports = utility;
