require('dotenv').config();
var mysql = require('mysql');
var mailer = require('./mailer');

var base_url = process.env.BASEURL,

con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "select comments.id, comments.post_id, comments.comment_body, comments.comment_type, comments.date, users.fullname, users.username from comments inner join users on comments.author_id = users.id where comments.author_id != comments.post_author_id and comments.status=0";
  con.query(sql, function (err, result) {
    if (err) throw err;

    Object.keys(result).forEach(function(element){
        var sql1 = "select posts.title, posts.slug, users.fullname, users.username, users.email from posts inner join users on posts.author_id = users.id where posts.id = '"+result[element].post_id+"'";
        con.query(sql1, function(err, post_resp){
            if (err) throw err;
            // console.log(post_resp, result);
            var data = {to: post_resp[0].email};
            if (result[element].comment_type == 1) {                
                data = mailer.form_comment_message(data, result[element], post_resp[0]);
            }else{                
                data = mailer.form_review_message(data, result[element], post_resp[0]);
            }            
            mailer._send(data, function(output){
                console.log(output);
                // console.log("Exxternal=> ",externaldata);
                var sql2 = "update comments set mail_status=1 where id = '"+result[element].id+"'";
                con.query(sql2);
            });
            // console.log(data);
        } );
        // console.log(result[element].post_id);
        // console.log(response);
        
    }, con);
    con.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Connection going to sleep');
    });    
    
  });
});

