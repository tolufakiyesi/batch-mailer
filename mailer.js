require('dotenv').config();
var nodemailer = require('nodemailer');
var base_url = process.env.BASEURL,

transporter = nodemailer.createTransport({
    host: 'mail.iworder.com',
    port: 25,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

module.exports = {
    _send: function(data, callback){
        data.from = '"Team Iworder" <'+process.env.MAIL_USER+'>'
        // var mailOptions = data;
          
        transporter.sendMail(data, function(error, info){
            if (error) {
                console.log(error);
            } else {
                callback('Email sent: '+info.response+' | ID: '+info.messageId+' | PreviewURL: '+ nodemailer.getTestMessageUrl(info));
            }
        }); 
    },
    form_review_message: function(data, sender, receiver){
        data.subject = 'You have a new review from '+sender.fullname;
        data.html= ` 
        <link rel="stylesheet" href="`+base_url+`assets/new/css/mail.css">
        <b>Hello `+receiver.fullname+`</b></br></br>
            <div class="message unread">
            <a href="`+base_url+`post/view/`+ receiver.slug+`">
                <p class="last-msg">
                    <i class="fas fa-envelope"></i>
                    <span><a href="`+base_url+`user/view/`+sender.username+`" style="font-weight: bold;">`+sender.fullname+` (@`+sender.username+`) </a> reviewed your <a href="`+base_url+`post/view/`+ receiver.slug+`" style="font-weight: bold;"> post</a></span>
                </p>
                <div class="user">
                <p class="name"> <a href="`+base_url+`post/view/`+ receiver.slug+`" style="font-weight: bold;">`+receiver.title+`</a></p>
                <p class="message">`+sender.comment_body+`</p>
                <p class="time">`+sender.date+`</p>
                </div>
            </a>
        </div>` // html body
        return data
    },
    form_comment_message: function(data, sender, receiver){
        data.subject = 'You have a new comment from '+sender.fullname;
        data.html= ` 
        <link rel="stylesheet" href="`+base_url+`assets/new/css/mail.css">
        <b>Hello `+receiver.fullname+`</b></br></br>
            <div class="message unread">
            <a href="`+base_url+`post/view/`+ receiver.slug+`">
                <p class="last-msg">
                    <i class="fas fa-envelope"></i>
                    <span><a href="`+base_url+`user/view/`+sender.username+`" style="font-weight: bold;">`+sender.fullname+` (@`+sender.username+`) </a> commented on your <a href="`+base_url+`post/view/`+ receiver.slug+`" style="font-weight: bold;"> post</a></span>
                </p>
                <div class="user">
                <p class="name"> <a href="`+base_url+`post/view/`+ receiver.slug+`" style="font-weight: bold;">`+receiver.title+`</a></p>
                <p class="message">`+sender.comment_body+`</p>
                <p class="time">`+sender.date+`</p>
                </div>
            </a>
        </div>` // html body
        return data
    }
}

