var express = require('express');
var router = express.Router();
var pool = require('../../module/pool.js');




router.post('/adding',async function(req, res){

    var user_index = req.body.user_index;
    var board_index = req.body.board_index;
    

    if(!board_index || !user_index){
        res.status(400).send({
            message:"fail bookmark from client"
        });
    }else{
        var bookmarkAddQuery = "INSERT INTO bookmark_table (user_index, board_index) values (?,?)";
        var bookmarkAddingResult = await pool.queryParam_Arr(bookmarkAddQuery,[user_index, board_index]); 
        if(!bookmarkAddingResult){
            res.status(500).send({
                message : "fail bookmark from server"
            });
        }else{
            res.status(201).send({
                message : "success bookmark"
            });
        }
        
    }
});

router.get('/show',async function(req,res){
    var userid = req.query.user_index;
    var boardid = req.query.board_index;
    
    if( !userid){
        res.status(400).send({
            message : "fail bookmark from client"
        });
    }else{
        var bookShowingQuery = `SELECT bookmark_table.board_index, board_title,board_photo,user_name FROM project.bookmark_table 
        JOIN project.board_table ON board_table.board_index = bookmark_table.board_index 
        JOIN project.user_table ON user_table.user_index = bookmark_table.user_index WHERE bookmark_table.user_index= ?;`;
        
      /*   select bookmark_table.board_index , board_table.board_title, user_table.user_name 
FROM project.bookmark_table, project.board_table, project.user_table 
where bookmark_table.board_index = board_table.board_index 
AND bookmark_table.user_index = user_table.user_index AND user_table.user_index = 1;
        */

        var bookShowingResult = await pool.queryParam_Arr(bookShowingQuery,[userid]);
        if(!bookShowingResult){

            res.status(500).send({
                message : "fail bookmark from server"
            });
        }else{

            res.status(200).send({
                message : "success showing bookmark",
                data : bookShowingResult 
            });
        }

    }

    
});



module.exports = router;
