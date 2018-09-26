require('dotenv').config();
var mysql = require('promise-mysql');
var mailer = require('./mailer');
var async = require("async");

var connection;
var resp = [];
var _config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};



mysql.createConnection(_config).then(function(conn){
    connection = conn;
    return connection.query("select comments.id, comments.post_id, comments.comment_body, comments.comment_type, comments.date, users.fullname, users.username, posts.title, posts.slug from comments inner join users on comments.author_id = users.id inner join posts on comments.post_id = posts.id where comments.author_id != comments.post_author_id and comments.status=0 and comments.mail_status=0");
}).then(function(rows){    
    
    
    var callbackFunc = function(element, value, callback){
        var sql1 = "select users.fullname, users.username, users.email from posts inner join users on posts.author_id = users.id where posts.id = '"+element.post_id+"'";
        connection.query(sql1)
        .then(post_resp=>{
            var data = {to: post_resp[0].email};
            if (element.comment_type == 1) {                
                data = mailer.form_comment_message(data, element, post_resp[0]);
            }else{                
                data = mailer.form_review_message(data, element, post_resp[0]);
            }                
            resp.push(element.id);            
            mailer._send(data, console.log);
            // console.log(data);
            callback();
        }, err=>{
            if (err) throw err;
        } );
        
    }
   

    async.forEachOf(rows, callbackFunc, function (err) {
        if (err) console.error(err.message);            
        
        console.log("Received ids => ",resp)
        if(resp.length >= 1){                
            
            var sql2 = "update comments set mail_status=1 where id in ("+resp+")"
            // console.log(sql2);
            connection.query(sql2);
        }
        connection.end();    
    });


}).catch( err => {
    // handle the error    
    console.log(err);
    connection.end();
} );