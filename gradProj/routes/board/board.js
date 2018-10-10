const express = require('express');
const router = express.Router();
const moment = require('moment');

const FCM = require('fcm-node');
const request = require('async-request');
const jwt = require('../../module/jwt');
const upload = require('../../config/multer').uploadBoardImage;
const pool = require('../../module/pool.js');
const unirest = require('unirest');

const serverKey = require('../../config/secretKey').push;
const fcm = new FCM(serverKey);


//3000/board/write
router.post('/write',upload.array('board_photos', 20), async function(req,res){
    let Btitle = req.body.board_title;
    let content = req.body.board_content;
    let uid = req.body.user_index;
    let bImages = req.files;
    let bLocation = req.body.board_location;
    //let token = req.headers.token;
    let category = req.body.board_category;
    //let time = moment().format('YYYY-MM-DD HH:mm:ss'); //ec2에서 시간바꿔주기.
    
    if(!uid){
        console.log("no user_idx");
        res.status(400).send({
            message:"null value"
        });
    }else{

        if(!Btitle || !category || !content){//바디에 안들어올 때
            res.status(400).send({
                message:"fail writing board from client"
            });

        }else
        {
            let joinImages;
            
            console.log(bImages);
            // console.log(token);
            if(!bImages){
                joinImages ='';

            }else{
                let tempArr =[];
            for(let i = 0; i<bImages.length;i++){
                tempArr[i] = bImages[i].location;

            }
            joinImages = tempArr.join(',');//이미지들을 ','로 엮어준다.
            console.log(joinImages);

            }
        
            
            //console.log(decoded.user_index);

            let writeBoardQuery = 'INSERT INTO board_table (board_title,board_content,user_index,board_category,board_photo,board_location) values (?,?,?,?,?,?);';
            let writeBoard = await pool.queryParam_Arr(writeBoardQuery, [Btitle,content,uid,category,joinImages,bLocation]);

            console.log(writeBoard); 
            let tokenQuery = `SELECT token FROM user_table WHERE user_area = ?`;
            let tokenResult = await pool.queryParam_Arr(tokenQuery,[category]);
            console.log(tokenResult);
            let tokenArr = new Array;
            for(let i = 0; i< tokenResult.length;i++ ){
                if(tokenResult[i]["token"]!==null){
                    tokenArr.push(tokenResult[i]["token"]);
                }

            }
            console.log(tokenArr);
            let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                registration_ids:tokenArr,
                collapse_key: 'your_collapse_key',
                
                notification: {
                    title: "", 
                    body:"관심지역에 글이 등록되었습니다."  //노드로 발송하는 푸쉬 메세지
                },
                
                data: {  //you can send only notification or only data(or include both)
                    my_key: 'my value',
                    my_another_key: 'my another value'
                }
            };

        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
                console.log(err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });

            if(writeBoard){
                res.status(201).send({
                    message : "success writing board",
                    data : {
                        board_category : category,
                        board_index : writeBoard["insertId"]
                    }            
                });
            }
            else {
                res.status(500).send({
                    message : "fail writing board from server"
                });
            }

            
        }
    }

});
//52.~~/board/show

router.get('/show',async function(req,res){
// var board_category = req.params.board_category;
        let category = req.query.board_category || "[]";
        let showingQuery = `SELECT board_index,board_title,date_format(board_time,"%Y-%m-%d %r") AS board_time, board_category,user_name 
        FROM board_table JOIN user_table ON board_table.user_index = user_table.user_index order by board_index asc
        `;//0으로 바꿔야함
        console.log(category);
        let showingResult = await pool.queryParam_None(showingQuery);
        if(category === "[]"|| category === 0 || category ==="[0]"|| category === -1 || category === "[-1]" )
        {//지역입력안하면
            
            if(!showingResult){
                res.status(500).send({
                    message : "fail showing board from server"
                });
            }else{
                res.status(200).send({
                    message : "success showing board",
                    data : showingResult
                });
            }
            
        }else{
            
            
            // 지역 입력 하면
            // "[1,2,3]" 을 [1,2,3] 으로 바꿈
            
            let areaList = Array.from(category);
            areaList.splice(0, 1);
            areaList.pop();

            let areaString = areaList.join("");
            let realareaList = areaString.split(",").map(Number);
            
            if(realareaList.includes(0)){

                if(!showingResult){
                    res.status(500).send({
                        message : "fail showing board from server"
                    });
                }else{
                    console.log(showingResult);
                    res.status(200).send({
                        message : "success showing board",
                        data : showingResult
                    });
                }

            }else{
                showingResult = showingResult.filter((value)=>{
                    if(realareaList.includes(value.board_category)){
                        //console.log("aa"+value.board_category);
                        return true;
                    }else{
                        //console.log("bb"+value.board_category);
                        return false;
                    }
                });
    
    
    
    
    
                if(!showingResult){
                    res.status(500).send({
                        message : "fail showing board from server"
                    });
                }else{
                    console.log(showingResult);
                    res.status(200).send({
                        message : "success showing board",
                        data : showingResult
                    });
                }
            }
        }
    }
);

//board/detail/:params
router.get('/detail/:board_index',async function(req,res){
    let boardindex = req.params.board_index;

    if(!boardindex){
        res.status(400).send({
        
            message:"fail showing detail board from server"
        });

    }else{

        let detailQuery = `SELECT board_table.board_index, board_location,board_content ,board_title, board_time, board_category,board_photo,user_name
        FROM board_table JOIN user_table ON user_table.user_index= board_table.user_index WHERE board_index=?`;
        let detailResult = await pool.queryParam_Arr(detailQuery,[boardindex]);
        if(!detailResult){
            res.status(500).send({
                message : "fail showing detail board from server"

            });

        }else{
            res.status(200).send(
                {  message : "success showing detail board",
                    data : detailResult}
            );


        }
    }


})


module.exports = router;
