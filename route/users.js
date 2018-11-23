//deps
var StringDecoder = require("string_decoder").StringDecoder;

//local deps
var file = require("../lib/data");
var helper = require("../lib/helper");

var handler = {name:"users"};

var acceptMethods = ["post","get","put","delete"];
handler.handle = function(req,res){

    var method = req.method.toLowerCase();
    if(acceptMethods.indexOf(method)!=-1){
        this[method](req,res);
    }else{
        res.writeHead(405);
        res.end("method not allowed, only supports : "+ acceptMethods.join(","));
    }

}

/***
 * 
 * @TODO read user info from server according user phone numbere
 */
handler.get = function(req,res){
    var phone = req.query.phone;
    var tid = req.headers["token"];
    if(phone){
        helper.verifyToken(tid,phone,function(err,desc){
            if(!err){
                file.read("users",phone,function(err,dat){
                    if(err){
                        res.end("the phone number you asked is not exists!");
                    }else{
                        res.setHeader("Content-Type","text/json");
                        res.end(dat);
                    }
                });    
            }else{
                res.writeHead(405);
                res.end(desc||"token is not validated");                
            }
        });

    }else{
        res.setHeader("Content-Type","text/json");
        res.end(JSON.stringify({error:"phone number is missing"}));
    }
}

/***
 * 
 * 
 * @TODO save user info to a perminate place 
 */
handler.post = function(req,res){
    var decoder = new StringDecoder();
    var buffer = "";
    req.on("data",function(dat){
        buffer += decoder.write(dat);
    });

    req.on("end",function(){
        buffer += decoder.end();
        res.setHeader("Content-Type","text/json"); //浏览器解析为json对象
        var reqtype = req.headers["content-type"];
        var payload = reqtype=="application/json"?JSON.parse(buffer):buffer;
        if(payload.username && payload.password && payload.phone){
            file.read("users",payload.phone,function(err){
                if(err){//file not exits create it
                    var data = {
                        name : payload.username,
                        pwd:helper.hash(payload.password),
                        phone:payload.phone
                    };
                    file.saveAs("users",payload.phone,data,function(err,desc){
                        res.writeHead(200);
                        if(err){
                            res.end(JSON.stringify({"error":err}));
                        }else{
                            res.end(JSON.stringify({"status":"success",desc:desc}));
                        }
                    });
                }else{
                    res.writeHead(500);
                    res.end(JSON.stringify({status:"falied",error:"file already exists"}));
                }
            });
        }else{
            res.writeHead(400);
            res.end("there is something required missing");
        }
    });
}
/***
 * 
 * 
 *@TODO update user info 
 * only allow the phone's host update it's own info   
 */
handler.put = function(req,res){
    var decoder = new StringDecoder();
    var buffer = "";
    req.on("data",function(dat){
        buffer += decoder.write(dat);
    });

    req.on("end",function(){
        buffer += decoder.end();
        res.setHeader("Content-Type","text/json"); //浏览器解析为json对象
        var reqtype = req.headers["content-type"];
        var payload = reqtype=="application/json"?helper.parse2JSON(buffer):buffer;
        if(payload.phone){
            file.read("users",payload.phone,function(err,dat){
                
                if(!err){//file not exits create it
                    var datObj = helper.parse2JSON(dat);
                    if(datObj.phone == payload.phone){
                        if(payload.age){
                            datObj.age = payload.age;
                        }
                        if(payload.username){
                            datObj.name = payload.username;
                        }
                        if(payload.password){
                            datObj.pwd = helper.hash(payload.password);
                        }

                        if(payload.grade){
                            datObj.username = payload.username;
                        }
                        file.update("users",payload.phone,datObj,function(err,desc){
                            res.writeHead(200);
                            if(err){
                                res.end(JSON.stringify({"error":err}));
                            }else{
                                res.end(JSON.stringify({"status":"success",desc:desc}));
                            }
                        });
                    }else{
                        res.writeHead(405);
                        res.end("you do not have permission to update");
                    }
                }else{
                    res.writeHead(500);
                    res.end(JSON.stringify({status:"falied",error:"file with phone you asked is not exists"}));
                }
            });
        }else{
            res.writeHead(400);
            res.end("there is something required missing");
        }
    });
}

handler.delete = function(req,res){
    var phone = req.query.phone;
    var username = req.query.user||req.query.username;
    if(phone && username){
        file.read("users",phone,function(err,dat){
            var obj = helper.parse2JSON(dat);
            if(!err){
                if(obj && obj.name == username && obj.phone == phone){
                    file.delete("users",phone,function(err){
                        if(err){
                            res.writeHead(500);
                            res.end("delete user failed",err);
                        }else{
                            res.writeHead(200);
                            res.end("delete user with phone number "+phone + " succeed");
                        }
                    });
                }else{
                    res.writeHead(405);
                    res.end("do not have permission to delete user " + phone);
                }
            }else{
                res.writeHead(400);
                res.end("user  " + phone +  " not exists");                
            }
        });
    }else{
        res.writeHead(500);
        res.end("required field is missing");
    }
}

module.exports = handler;