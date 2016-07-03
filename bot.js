'use strict'

var config = require('./config.json'),
    tg = require('telegram-node-bot')(config.token),
    fs = require('fs'),
    req = require('tiny_request'),
    hexrgb = require('hexrgb'),
    color = require('dominant-color')

var im = require('imagemagick');

var botan = require('botanio')(config.botanio);

tg.router.
    when(['/start'], 'StartController').
    when(['/help'], 'HelpController').
    when(['/toHEX :color'], 'ToHexController').
    when(['/toRGB :color'], 'ToRgbController').
    when(['/randomColor'], 'RandomColorController').
    when(['/ping'], 'PingController').
    otherwise('OtherwiseController')

tg.controller('StartController', ($) => {
    $.routeTo("/help")
})

tg.controller('PingController', ($) => {
    $.sendMessage(config.greeting[Math.floor(Math.random() * config.greeting.length)]);
})

tg.controller('HelpController', ($) => {
    $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /toHEX `rgb(51,0,255)` \n• Convert HEX to RGB /toRGB `#3300ff`\n• Generate random color by /randomColor', { parse_mode: 'Markdown' });
    botan.track($.message, 'Help', function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    });

    //botan.track(config.botanio, $.chatId, $, '/help')
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
tg.controller('RandomColorController', ($) => {
    var rnd = randomHEX()
    $.sendMessage(rnd)
    sendColorPic($, rnd.slice(1))
})

tg.controller('OtherwiseController', ($) => {
    if ($.message.photo) {
        console.log($.message.photo)
        var downloadUrl = "https://api.telegram.org/file/bot" + config.token + "/" + $.message.photo.file_id;

        var filename = '.\\temp\\' + $.message.photo[0].file_id + '.png'
        var wstream = fs.createWriteStream(filename)

        wstream.on('finish', () => {
            $.sendPhoto(fs.createReadStream(filename))
            fs.unlink(filename)
            $.sendMessage('https://api.telegram.org/file/bot' + config.token + '/' + $.message.photo[0].file_id)
        })

        req.get({
            url: 'https://api.telegram.org/file/bot' + config.token + '/' + $.message.photo[0].file_id,
            pipe: wstream
        })
        //fs.createWriteStream($.message.photo.file_id)
        // im.readMetadata('kittens.jpg', function (err, metadata) {
        //     if (err) throw err;
        //     console.log('Shot at ' + metadata.exif.dateTimeOriginal);
        // })

    } else if (isValidHEX($.message.text)) {
        if ($.message.text.length === 7) {
            var color = $.message.text.slice(1, 7);
        } else if ($.message.text.length === 4) {
            var color = $.message.text[1] + $.message.text[1]
                + $.message.text[2] + $.message.text[2]
                + $.message.text[3] + $.message.text[3]
        } else { errIsntColor($) }

        sendColorPic($, color)
    } else if (isValidRGB($.message.text)) {
        console.log(hexrgb.rgb2hex($.message.text))
        sendColorPic($, hexrgb.rgb2hex($.message.text).slice(1))
    } else {
        errIsntColor($)
    }

})
function sendColorPic($, color) {
    color = color.toLowerCase();
    var filename = '.\\temp\\' + color + '.png'
    var wstream = fs.createWriteStream(filename)

    wstream.on('finish', () => {
        // gm(filename)
        //     .resize(240, 240)
        //     .noProfile()
        //     .write(filename, function (err) {
        //         if (!err) console.log('done');
        //     });
        $.sendPhoto(fs.createReadStream(filename))
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
function randomHEX() {
    var random = Math.random();
    var exponent = --random.toExponential().split('-')[1];

    // Make sure random number is between 1.0 and 0.1 to assure correct hex values.
    random *= Math.pow(10, exponent);

    return '#' + (~~(random * (1 << 24))).toString(16);
}


