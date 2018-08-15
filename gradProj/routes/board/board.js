var express = require('express');
var router = express.Router();
var moment = require('moment');
var request = require('async-request');
var jwt = require('../../module/jwt');
var upload = require('../../config/multer').uploadBoardImage;
var pool = require('../../module/pool.js');

//3000/board/write
router.post('/write',upload.array('board_photos', 20), async function(req,res){
    var title = req.body.board_title;
    var content = req.body.board_content;
    //var uid = req.body.user_index;
    let bImages = req.files;
    let token = req.headers.token;
    var category = req.body.board_category;
    var time = moment().format('YYYY-MM-DD HH:mm:ss'); //ec2에서 시간바꿔주기.
    
    if(!token){
        console.log("no token");
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
            let decoded = jwt.verify(token);
            if(decoded === -1){//토큰값이 에러가 있다면
                res.status(500).send({
                    message:"token err"
                });
            }else{
            
            console.log(token);
            let tempArr =[];
            for(let i = 0; i<bImages.length;i++){
                tempArr[i] = bImages[i].location;

            }
            let joinImages = tempArr.join(',');//이미지들을 ','로 엮어준다.
            console.log(joinImages);
            console.log(decoded.user_index);

            var writeBoardQuery = 'INSERT INTO board_table (board_title,board_content,user_index,board_time,board_category,board_photo) values (?,?,?,?,?,?);';
            var writeBoard = await pool.queryParam_Arr(writeBoardQuery, [title,content,decoded.user_index,time,category,joinImages]);

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
    }

});
//52.~~/board/show

router.get('/show',async function(req,res){
// var board_category = req.params.board_category;
        
        let showingQuery = `SELECT board_index,board_title, board_time, board_category,user_name 
        FROM board_table JOIN user_table ON board_table.user_index = user_table.user_index`;//0으로 바꿔야함
        let showingResult = await pool.queryParam_None(showingQuery);
        
        
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
);

//board/detail/:params
router.get('/detail/:board_index',async function(req,res){
    var boardindex = req.params.board_index;

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
