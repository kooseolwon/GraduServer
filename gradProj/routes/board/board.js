var express = require('express');
var router = express.Router();
var moment = require('moment');
var request = require('async-request');
var pool = require('../../module/pool.js');

//3000/board/write
router.post('/write',async function(req,res){
    var title = req.body.board_title;
    var content = req.body.board_content;
    var uid = req.body.user_index;
    var photo = req.body.board_photo;//고쳐야 함
    var category = req.body.board_category;
    var time = moment().format('YYYY-MM-DD HH:mm:ss'); //ec2에서 시간바꿔주기.
    
    
    if(!title || !uid || !category|| !time||!content){
        res.status(400).send({
            message:"fail writing board from client"
        });
    
    
    }else
    {
        var writeBoardQuery = 'INSERT INTO board_table (board_title,board_content,user_index,board_time,board_category,board_photo) values (?,?,?,?,?,?);';
        var writeBoard = await pool.queryParam_Arr(writeBoardQuery, [title,content,uid,time,category,photo]);

        console.log(writeBoard); 

        if(writeBoard){
            res.status(201).send({
                message : "success writing board"            
            });
        }
        else {
            res.status(500).send({
                message : "fail writing board from server"
            });
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
