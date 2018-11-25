//deps
var StringDecoder = require("string_decoder").StringDecoder;

//local deps
var file = require("../lib/data");
var helper = require("../lib/helper");

var handler = {name:"checks"};

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
    //read token from header
    var tid = req.header["token"];
    var cid = req.query["checkId"];
    if(tid){
        file.read("checks",cid,function(err,dat){
            if(err){
                res.end("the token you asked is not exists!");
            }else{

                var datObj = helper.parse2JSON(dat);
                helper.verifyToken(tid,datObj.phone,function(err,errMSG){
                    if(!err){
                        res.end(dat);
                    }else{
                        res.writeHead(403);
                        res.end("not authorized");
                    }
                });

            }
        });
    }else{
        res.setHeader("Content-Type","text/json");
        res.end(JSON.stringify({error:"token id is missing"}));
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
        if(!req.method || !payload.protocal || !req.url || !req.headers["timeout"]){
            res.writeHead(400);
            res.end("params not complete");
            return;
        }
        var tid = req.headers["token"];
        if(tid){
            helper.verifyToken(tid,payload.phone,function(err,errMSG){
                if(!err){
                    file.read("token",tid,function(err,dat){
                        if(!err && dat){//user  info exists
                            var udata = helper.parse2JSON(dat);
                            if(udata.phone){
                                
                                file.read("users",udata.phone,function(err,dat){
                                    var dat = helper.parse2JSON(dat);
                                    if(!err){
                                        if(!dat.checks ||(dat.checks && dat.checks.length<5)){
                                            var checkId = helper.generateToken(20);
                                            var dat2 = {
                                                method:payload.method,
                                                protocal:payload.protocal,
                                                url:payload.url,
                                                timeout:payload.timeout
                                            };
                                            //创建这个checks
                                            file.create("checks",checkId,dat2,function(err){
                                                if(!err){
                                                    dat.checks = dat.checks || [];
                                                    dat.checks.push(checkId);

                                                    file.update("users",udata.phone,dat,function(err){
                                                        if(!err){
                                                            res.end(JSON.stringify(dat));
                                                        }else{
                                                            res.writeHead(500);
                                                            res.end("update user checks fails");
                                                        }
                                                    });
                                                }else{
                                                    res.writeHead(500);
                                                    res.end("create check fail");
                                                }
                                            });
                                        }else{
                                            res.writeHead(500);
                                            res.end("checks 5 in users");
                                        }

                                    }else{
                                        res.writeHead(500);
                                        res.end(errmsg);
                                    }
                                });


                            }else{
                                res.writeHead(500);
                                res.end("phone number is missing");
                            }
                        }else{
                            res.writeHead(500);
                            res.end(JSON.stringify({status:"falied",error:"file already exists"}));
                        }
                    });
                }else{
                    res.writeHead(400);
                    res.end(errMSG);
                }
            });
        }else{
            res.writeHead(403);
            res.end("token is empty");            
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
        var tid = req.headers["token"];
        if(tid){
            file.read("token",tid,function(err,dat){
                
                if(!err){
                    var datObj = helper.parse2JSON(dat);
                    if(datObj.expired>=Date.now){// tid 存在 and 没有过期
                        datObj.expired = Date.now() + 1000 * 60 * 60; //续期

                        file.update("token",tid,datObj,function(err,desc){
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
   // 一个用户有最多5个checks
    //删除check 要根据用户输入的 check id
    var  checkId = req.query["checkId"];
    var  token = req.headers["token"];
    if(checkId){
        file.read("checks",checkId,function(err,dat){
            if(!err){
                var o = help.parse2JSON(dat);
                helper.verifyToken(token,o.phone,function(err,errMSG){
                    if(!err){
                        file.delete("checks",checkId,function(err){
                            if(!err){
                                file.read("users",o.phone,function(err,dat){
                                    if(!err && dat){
                                        var a = helper.parse2JSON(dat);
                                        var index = a.checks.indexOf(checkId);
                                        if(index>-1){
                                            a.checks.splice(index,1);
                                            file.update("user",o.phone,a,function(err){
                                                if(!err){
                                                    res.writeHead(200);
                                                    res.end("delete success");
                                                }else{
                                                    res.writeHead(500);
                                                    res.end();
                                                }
                                            });
                                        }else{
                                            res.end("could not find checkid in users");
                                        }
                                    }else{
                                        res.end("user not found");
                                    }
                                });
                            }else{
                                res.end("delete check failed");
                            }
                        })
                    }else{
                        res.end("token failed");
                    }
                });
            }else{
                res.end("read checks failed");
            }
        });
    }else{
        res.writeHead(500);
        res.end("this si no checkId");
    }
}



module.exports = handler;