'use strict'

var config = require('./config.json'),
    fs = require('fs'),
    req = require('tiny_request'),
    im = require('imagemagick'),
    hexrgb = require('hexrgb'),
    colorPalette = require("colors-palette"),
    urlToImage = require('url-to-image')

var botan = require('botanio')(config.botanio);

var Telegram = require('telegram-node-bot'),
    TelegramBaseController = Telegram.TelegramBaseController,
    tg = new Telegram.Telegram(config.token)

class StartController extends TelegramBaseController {

    startHandler($) {
        $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /toHEX `rgb(51,0,255)` \n• Convert HEX to RGB /toRGB `#3300ff`\n• /randomColor generate random color\n• /help for this message', { parse_mode: 'Markdown' });
    }

    get routes() {
        return {
            '/start': 'startHandler',
        }
    }
}

class HelpController extends TelegramBaseController {

    helpHandler($) {
        $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /toHEX `rgb(51,0,255)` \n• Convert HEX to RGB /toRGB `#3300ff`\n• /randomColor generate random color\n• /help for this message', { parse_mode: 'Markdown' });

    }

    get routes() {
        return {
            '/help': 'helpHandler'
        }
    }
}

class ToHexController extends TelegramBaseController {

    toHexHandler($) {
        console.log('toHEX ' + $.query.color)
        if (isValidRGB($.query.color)) {
            $.sendMessage(hexrgb.rgb2hex($.query.color))
        } else {
            $.sendMessage(colorErr($))
        }
    }

    get routes() {
        return {
            '/toHEX :color': 'toHexHandler'
        }
    }
}

class ToRgbController extends TelegramBaseController {

    toRgbHandler($) {
        console.log('toRGB ' + $.query.color)
        if (isValidHEX($.query.color)) {
            $.sendMessage(hexrgb.hex2rgb($.query.color))
        } else {
            $.sendMessage(colorErr($))
        }
    }

    get routes() {
        return {
            '/toRGB :color': 'toRgbHandler'
        }
    }
}

class SiteColorsController extends TelegramBaseController {

    siteColorsHandler($) {
        if (isValidURL($.query.url)) {
            $.sendMessage("Murr~")

            var dir = './temp/' + Math.random().toString(36).substr(2, 5) + '.png'
            console.log(dir)
            urlToImage($.query.url, dir).then(function () {
                colorPalette(dir, 3, function (err, colors) {
                    if (err) {
                        $.sendMessage(err);
                        console.error(err);
                        return false;
                    } else {
                        console.log($.query.url)
                        console.log(colors)
                        var detected_colors = []
                        colors.result.forEach(function (item, index, array) {
                            var color = '#' + item.hex.toLowerCase()
                            detected_colors.push(color)
                            $.sendMessage(color);
                            sendColorPic($, color)
                        });
                    }
                    fs.unlinkSync(dir);
                });
            }).catch(function (err) {
                console.error(err);
            });



        } else {
            urlErr($)
        }

    }

    get routes() {
        return {
            '/siteColors :url': 'siteColorsHandler'
        }
    }
}
class PingController extends TelegramBaseController {

    pingHandler($) {
        $.sendMessage("Murr~");
    }

    get routes() {
        return {
            '/ping': 'pingHandler'
        }
    }
}

class RandomColorController extends TelegramBaseController {

    randomColorHandler($) {
        var random = Math.random();
        var exponent = --random.toExponential().split('-')[1];

        random *= Math.pow(10, exponent);

        var color = '#' + (~~(random * (1 << 24))).toString(16);

        $.sendMessage(color)
        sendColorPic($, color)
    }

    get routes() {
        return {
            '/randomColor': 'randomColorHandler'
        }
    }
}

class OtherwiseController extends TelegramBaseController {
    handle($) {
        if ($.message.photo) {
            $.sendMessage("photo");
            //
            // colorPalette('https://new.vk.com/images/safari_152.png', 3, function (err, colors) {
            //     if (err) {
            //         $.sendMessage(err);
            //         console.error(err);
            //         return false;
            //     }
            //     var detected_colors = []
            //     colors.result.forEach(function (item, index, array) {
            //         detected_colors.push('#' + item.hex.toLowerCase())
            //     });

            //     console.log(detected_colors)
            //     $.sendMessage('#' + colors.result[0].hex.toLowerCase());
            // });
            //
            //var downloadUrl = getFile($.message.photo.file_id)
            ///console.log(getFile($.message.photo.file_id))
            //          var filename = '.\\temp\\' + $.message.photo[0].file_id + '.png'

            // $.sendMessage('https://api.telegram.org/file/bot' + config.token + '/' + $.message.photo[0].file_id)


        } else if (isValidHEX($.message.text)) {
            if ($.message.text.length === 7) {
                var color = $.message.text;
            } else if ($.message.text.length === 4) {
                var color = '#' + $.message.text[1] + $.message.text[1]
                    + $.message.text[2] + $.message.text[2]
                    + $.message.text[3] + $.message.text[3]
            } else { colorErr($) }

            sendColorPic($, color)
        } else if (isValidRGB($.message.text)) {
            sendColorPic($, hexrgb.rgb2hex($.message.text))
        } else {
            colorErr($)
        }
    }
}
tg.router
    .when('/start', new StartController())
    .when('/help', new HelpController())
    .when(['/toHEX :color'], new ToHexController())
    .when(['/toRGB :color'], new ToRgbController())
    .when(['/randomColor'], new RandomColorController())
    .when(['/siteColors :url'], new SiteColorsController())
    .when(['/ping'], new PingController())
    .otherwise(new OtherwiseController())

function sendColorPic($, color) {
    console.log('Sending pic with color: ' + color)
    color = color.toLowerCase().slice(1);
    $.sendPhoto({ url: 'http://www.colorhexa.com/' + color + '.png', filename: 'color.png' })
}

function isValidURL(sample) {
    var regexp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    return regexp.test(sample);
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

function colorErr($) {
    $.sendMessage('I dont think that it\'s a color', { parse_mode: 'Markdown' });
}

function urlErr($) {
    $.sendMessage('Sorry, but isn\'t valid url', { parse_mode: 'Markdown' });
}


// function isValidColor(sample, type){
//     if(type=='hex'){}
// }