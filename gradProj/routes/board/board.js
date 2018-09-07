const express = require('express');
const router = express.Router();
const moment = require('moment');
const request = require('async-request');
const jwt = require('../../module/jwt');
const upload = require('../../config/multer').uploadBoardImage;
const pool = require('../../module/pool.js');

//3000/board/write
router.post('/write',upload.array('board_photos', 20), async function(req,res){
    let title = req.body.board_title;
    let content = req.body.board_content;
    var uid = req.body.user_index;
    let bImages = req.files;
    //let token = req.headers.token;
    let category = req.body.board_category;
    let time = moment().format('YYYY-MM-DD HH:mm:ss'); //ec2에서 시간바꿔주기.
    
    if(!uid){
        console.log("no user_idx");
        res.status(400).send({
            message:"null value"
        });
    }else{

        if(!title && !category && !time && !content){//바디에 안들어올 때
            res.status(400).send({
                message:"fail writing board from client"
            });

        }else
        {
            
            
           // console.log(token);
            let tempArr =[];
            let joinImages;
            if(!bImages){
                joinImages = "";
            
            }else{
                
                for(let i = 0; i<bImages.length;i++){
                    tempArr[i] = bImages[i].location;

                }
                joinImages = tempArr.join(',');//이미지들을 ','로 엮어준다.
            }
            console.log(joinImages);
            //console.log(decoded.user_index);
            let writeBoardQuery = 'INSERT INTO board_table (board_title,board_content,user_index,board_time,board_category,board_photo) values (?,?,?,?,?,?);';
            let writeBoard = await pool.queryParam_Arr(writeBoardQuery, [title,content,uid,time,category,joinImages]);

            console.log(writeBoard); 

            if(writeBoard){
                res.status(201).send({
                    message : "success writing board"            
                });
            }
            else {
                res.status(500).send({
                    message : "fail writing board from server"
                });}
            
        }
    }

});
//52.~~/board/show

router.get('/show',async function(req,res){
// var board_category = req.params.board_category;
        let category = req.query.board_category || 0;
        let showingQuery = `SELECT board_index,board_title, board_time, board_category,user_name 
        FROM board_table JOIN user_table ON board_table.user_index = user_table.user_index
        `;//0으로 바꿔야함

        let showingResult = await pool.queryParam_None(showingQuery);
        if(category === "[]"|| category === 0)
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
                res.status(200).send({
                    message : "success showing board",
                    data : showingResult
                });
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

        let detailQuery = `SELECT board_table.board_index, board_title, board_time, board_category,board_photo,user_name
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
