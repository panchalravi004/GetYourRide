var nodemailer = require('nodemailer');

const { SEND_GMAIL_ADDRESS, SEND_GMAIL_PASSWORD, RECEIVER_GMAIL_ADDRESS } = require('../config');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SEND_GMAIL_ADDRESS,
        pass: SEND_GMAIL_PASSWORD
    }
  });

async function sendContactUsEmail(req, res){

    const { email, subject, message } = req.body;

    var mailOptions = {
        from: SEND_GMAIL_ADDRESS,
        to: RECEIVER_GMAIL_ADDRESS,
        subject: 'Customer Inquiry !',
        text: `Email: ${email}, Subject: ${subject}, Message: ${message}`
    };
      
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            // console.log(error);
            return res.json({
                status: 'Error',
                message: 'Faild to send email!',
                error
            });
        } else {
            // console.log('Email sent: ' + info.response);
            return res.status(200).json({
                status: 'Success',
                message: 'Email sent successfully!',
                response: info.response
            });
        }
    });
}

module.exports = {
    sendContactUsEmail
}