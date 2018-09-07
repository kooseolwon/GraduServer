var express = require('express');
var router = express.Router();
var moment = require('moment');
var request = require('async-request');
var pool = require('../../module/pool.js');



//comment/write
router.post('/write', async function(req,res){
    var comment_content = req.body.comment_content;
    //var comment_photo = req.body.comment_photo;
    var board_index = req.body.board_index;
    var user_index = req.body.user_index;
    var comment_time = moment().format('YYYY-MM-DD HH:mm:ss')

    if(!comment_content || !comment_time ||!board_index ||!user_index){
        res.status(400).send({
            message:"fail writing comment from client"
        });
    }else{
        var commentQuery = 'INSERT INTO comment_table (board_index,comment_content,user_index,comment_time) values (?,?,?,?)';
        var commentResult = await pool.queryParam_Arr(commentQuery, [board_index,comment_content,user_index,comment_time]);
        console.log(commentResult);
        if(!commentResult){
            res.status(500).send({
                message : "fail writing comment from server"
            });

        }else{
            res.status(201).send({
                message:"success writing comment"
            });
        }
    }

});

//comment/show/:params

router.get('/show/:board_index',async function(req,res){

    var board_index = req.params.board_index;
    if(!board_index){

        res.status(400).send({
            message:"fail showing comment from client"
        });
    }else{
        var commentQuery = "SELECT comment_index,comment_content,comment_time,user_name FROM comment_table JOIN user_table ON comment_table.user_index = user_table.user_index WHERE board_index=?";
        var commentResult = await pool.queryParam_Arr(commentQuery,[board_index]);
        if(!commentResult){
            res.status(500).send("fail showing comment from server");
        }else{

            res.status(200).send({
                message:"success showing comment",
                data : commentResult
            });
        }
        
        console.log(commentResult);


    }

});











module.exports = router;