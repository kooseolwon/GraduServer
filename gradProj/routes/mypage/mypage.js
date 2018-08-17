const express = require('express');
const router = express.Router();
const jwt = require('../../module/jwt');
const db = require('../../module/pool.js');
const crypto = require('crypto-promise');

router.put('/passward', async(req,res)=>{
    let token = req.headers.token;
    let pw = req.body.pw;
    let newPw = req.body.newPw;

//Null value 401
//잘못된 값 402
    if(!token){
        console.log("Null token");
        res.status(401).send({
            message:"Null value"
        });
    }else{
        let decoded = jwt.verify(token);
        if(decoded === -1){
            console.log("token error");
            res.status(500).send({
                message: "token error"
            });
        }else{
            console.log();
            let selectQuery = `SELECT user_pw, user_salt FROM user_table WHERE user_index =?`;
            let selectResult =  await db.queryParam_Arr(selectQuery,[decoded.user_index]);
            //console.log(selectResult);
            const hashedpw = await crypto.pbkdf2(pw, selectResult[0]['user_salt'].toString('base64'), 100000, 32, 'sha512');
            const hashedNewpw = await crypto.pbkdf2(newPw, selectResult[0]['user_salt'].toString('base64'), 100000, 32, 'sha512');
            console.log(hashedpw.toString('base64'));
            console.log(selectResult[0]['user_pw']);
            console.log(hashedNewpw.toString('base64'));
            
            if(!selectResult){
                res.status(500).send({
                    message:"Internal Server Error"
                });
            }else{
                if(hashedpw.toString('base64')===selectResult[0]['user_pw']){
                    let changeQuery = `UPDATE user_table SET user_pw =? WHERE user_index = ?`;
                    let changeResult = await db.queryParam_Arr(changeQuery,[hashedNewpw.toString('base64'),decoded.user_index]);
                    if(!changeResult){
                        res.status(500).send({
                            message: "Internal Server Error"
                        });
                    }else{
                        
                        res.status(201).send({
                            message:"success to update pw"
                        });
                    }
                }else{
                    console.log("different PW");
                    res.status(402).send({
                        message: "fail to update pw"
                    });
                }
            }
            
        }
    }

});
router.put('/region', async(req,res)=>{

});




module.exports = router;