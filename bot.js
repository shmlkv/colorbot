'use strict'

var config = require('./config.json'),
    tg = require('telegram-node-bot')(config.token),
    fs = require('fs'),
    req = require('tiny_request'),
    hexrgb = require('hexrgb')


tg.router.
    when(['/start'], 'StartController').
    otherwise('OtherwiseController')

tg.controller('StartController', ($) => {
    $.sendMessage('Hello! Send me color like #3300ff, #30f or rgb(51,0,255)', { parse_mode: 'Markdown' });
})

tg.controller('OtherwiseController', ($) => {
    if (isValidHEX($.message.text)) {
        if ($.message.text.length === 7) {
            var color = $.message.text.slice(1, 7);
        } else if ($.message.text.length === 4) {
            var color = $.message.text[1] + $.message.text[1]
                + $.message.text[2] + $.message.text[2]
                + $.message.text[3] + $.message.text[3]
        } else { errIsntColor() }
        
        sendColorPic($, color)
    } else if (isValidRGB($.message.text)) { // TODO 
        console.log(hexrgb.rgb2hex($.message.text))
        sendColorPic($, hexrgb.rgb2hex($.message.text).slice(1))
    } else {
        errIsntColor()
    }
    function errIsntColor() {
        $.sendMessage('I dont think that it\'s a color', { parse_mode: 'Markdown' });
    }
    function isValidRGB(sample) {
        var regexp = /^(\brgba?\()( ?[0-9](\d{1,2}) ?), ?( ?[0-9](\d{1,2}) ?), ?( ?[0-9](\d{1,2}) ?)?(,?)?( ?[0-9](\d{0,2}) ?)\)/;
        return regexp.test(sample);
    }
    function isValidHEX(sample) {
        var regexp = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
        return regexp.test(sample);
    }
    function sendColorPic($, color) {
            var filename = '.\\temp\\' + color + '.png'
            var wstream = fs.createWriteStream(filename)

            wstream.on('finish', () => {
                $.sendPhoto(fs.createReadStream(filename))
                fs.unlink(filename)
            })

            req.get({
                url: 'http://www.colorhexa.com/' + color + '.png',
                pipe: wstream
            })
        }
}) 