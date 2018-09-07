// require('dotenv').config();
var mailer = require('./mailer');
var DB = require('./connector');
var async = require("async");

conn = new DB();



var someRows, successAr ;

conn.execute(database => conn.query( "select comments.id, comments.post_id, comments.comment_body, comments.comment_type, comments.date, users.fullname, users.username from comments inner join users on comments.author_id = users.id where comments.author_id != comments.post_author_id and comments.status=0 and comments.mail_status=0" )
    .then( rows => {
        someRows = rows;
        var resp = []
        // Object.keys(someRows).forEach(function(element){
        async.forEachOf(someRows, function (value, element, callback) {
            var sql1 = "select posts.title, posts.slug, users.fullname, users.username, users.email from posts inner join users on posts.author_id = users.id where posts.id = '"+someRows[element].post_id+"'";
            conn.query(sql1, function(err, post_resp){
                if (err) throw err;
                
                var data = {to: post_resp[0].email};
                if (someRows[element].comment_type == 1) {                
                    data = mailer.form_comment_message(data, someRows[element], post_resp[0]);
                }else{                
                    data = mailer.form_review_message(data, someRows[element], post_resp[0]);
                }                
                resp.push(someRows[element].id);
                mailer._send(data, console.log);
                // console.log(resp);
                callback();
            } );

        }, err => {
            if (err) console.error(err.message);

            if(resp.length >= 1){                
                newconn = new DB();
                var sql = "update comments set mail_status=1 where id in ("+resp+")"
                // console.log(sql);
                newconn.query(sql).then(response=>{
                    return newconn.close()
                }, err=>{
                    return newconn.close().then( () => { throw err; } )
                });
            }
        
        });
        // console.log(resp);
    } )

).then( () => {
  
} ).catch( err => {
    // handle the error
    console.log(err);
} );