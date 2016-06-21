'use strict'

var config = require('./config.json'),
    tg = require('telegram-node-bot')(config.token),
    fs = require('fs'),
    req = require('tiny_request'),
    hexrgb = require('hexrgb'),
    ColorThief = require("thief");
    colorThief = new ColorThief()

tg.router.
    when(['/start'], 'StartController').
    when(['/toHEX :color'], 'ToHexController').
    when(['/toRGB :color'], 'ToRgbController').
    otherwise('OtherwiseController')

tg.controller('StartController', ($) => {
    $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /toHEX `rgb(51,0,255)` \n• Convert HEX to RGB /toRGB `#3300ff`', { parse_mode: 'Markdown' });
})
tg.controller('ToHexController', ($) => {
    tg.for('/toHEX :color', ($) => {
        console.log($.query.color)
        if (isValidRGB($.query.color)) {
            $.sendMessage(hexrgb.rgb2hex($.query.color))
        } else {
            $.sendMessage('It\'s not valid')
        }
    })
})
tg.controller('ToRgbController', ($) => {
    tg.for('/toRGB :color', ($) => {
        console.log($.query.color)
        if (isValidHEX($.query.color)) {
            $.sendMessage(hexrgb.hex2rgb($.query.color))
        } else {
            $.sendMessage('It\'s not valid')
        }
    })
})
tg.controller('OtherwiseController', ($) => {
    if (isValidHEX($.message.text)) {
        if ($.message.text.length === 7) {
            var color = $.message.text.slice(1, 7);
        } else if ($.message.text.length === 4) {
            var color = $.message.text[1] + $.message.text[1]
                + $.message.text[2] + $.message.text[2]
                + $.message.text[3] + $.message.text[3]
        } else { errIsntColor($) }

        sendColorPic($, color)
    } else if (isValidRGB($.message.text)) { // TODO 
        console.log(hexrgb.rgb2hex($.message.text))
        sendColorPic($, hexrgb.rgb2hex($.message.text).slice(1))
    } else {
        errIsntColor($)
    }

})
function sendColorPic($, color) {
    var filename = '.\\temp\\' + color + '.png'
    var wstream = fs.createWriteStream(filename)

    wstream.on('finish', () => {
        $.sendPhoto(fs.createReadStream(filename))
        var image = fs.readFileSync(filename);
        var rgb = colorThief.getColor(image);
        console.log(rgb)
        fs.unlink(filename)
    })

    req.get({
        url: 'http://www.colorhexa.com/' + color + '.png',
        pipe: wstream
    })
}
function errIsntColor($) {
    $.sendMessage('I dont think that it\'s a color', { parse_mode: 'Markdown' });
}
function isValidRGB(sample) {
    var regexp = /^(\brgba?\()( ?[0-9](\d{0,2}) ?), ?( ?[0-9](\d{0,2}) ?), ?( ?[0-9](\d{0,2}) ?)?(,?)?( ?[0-9](\d{0,2}) ?)\)/;
    return regexp.test(sample);
}
function isValidHEX(sample) {
    var regexp = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    console.log(regexp.test(sample))
    return regexp.test(sample);
} 