'use strict'

var config = require('./config.json'),
    tg = require('telegram-node-bot')(config.token),
    // gm = require('gm').subClass({ imageMagick: true }),
    fs = require('fs'),
    req = require('tiny_request')

tg.router.
    when(['/start'], 'StartController').
    otherwise('OtherwiseController')

tg.controller('PingController', ($) => {
    tg.for('ping', () => {
        $.sendMessage('pong')
    })
}) 

// tg.controller('OtherwiseController', ($) => {
//     //  if (true) {
//     var color = $.message.text.slice(1, 6);
//     var fileName = Math.random().toString(16) + ".jpg"
//     var wstream = fs.createWriteStream(__dirname + "/"  + fileName)
//     var self = this
//     req.get({
//         url: 'http://www.colorhexa.com/ffff00.png',
//         pipe: wstream
//     })
//     console.log(__dirname + "/" + fileName)
//     wstream.on('finish', () => {
//         $.sendPhoto($.chatId, fs.createReadStream(__dirname + "/" + fileName), (body, err) => {
//             fs.unlink(__dirname + "/" + fileName)
//             if (!err) {
//                 callback(body)
//             } else {
//                 callback(undefined, err)
//             }
//         })
//     })
// })
    
    // wstream.on('finish', () => {
    //     sendPhoto($.chatId, fs.createReadStream(__dirname + '/temp/' + fileName), (body, err) => {
    //         fs.unlink(__dirname + '/temp/' + fileName)
    //         if (!err) {
    //             callback(body)
    //         } else {
    //             callback(undefined, err)
    //         }
    //     })
    // })
    // req.get({
    //     url: 'http://www.colorhexa.com/ffff00.png',
    //     pipe: wstream
    // })


// //sendPhotoFromUrl(chatId, url, options, callback) {
//     callback = callback || Function()
//     var fileName = Math.random().toString(16) + ".jpg"
//     var wstream = fs.createWriteStream(__dirname + '/temp/' + fileName)
//     var self = this


//     wstream.on('finish', () => {
//         self.sendPhoto(chatId, fs.createReadStream(__dirname + '/temp/' + fileName), options, (body, err) => {
//             fs.unlink(__dirname + '/temp/' + fileName)
//             if (!err) {
//                 callback(body)
//             } else {
//                 callback(undefined, err)
//             }
//         })
//     })

//     req.get({
//         url: url,
//         pipe: wstream
//     })
// //})


    // }
    // var x = gm(200, 400, "#ddff99f3")
    //     .drawText(10, 50, "from scratch")
    //     .write("brandNewImg.jpg", function (err) {
    //         console.log(err)
    //     });


    //     var doc = {
    //         value: x, //stream
    //         filename: 'photo.png',
    //         contentType: 'image/png'
    //     }
    //     $.sendDocument(doc)