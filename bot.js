'use strict'

var config = require('./config.json'),
    fs = require('fs'),
    req = require('tiny_request'),
    im = require('imagemagick'),
    hexrgb = require('hexrgb'),
    colorPalette = require("colors-palette"),
    urlToImage = require('url-to-image'),
    gm = require('gm').subClass({ imageMagick: true })

var botan = require('botanio')(config.botanio);
var Telegram = require('telegram-node-bot'),
    TelegramBaseController = Telegram.TelegramBaseController,
    tg = new Telegram.Telegram(config.token)

class StartController extends TelegramBaseController {

    startHandler($) {
        $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /tohex `rgb(51,0,255)` \n• Convert HEX to RGB /torgb `#3300ff`\n• /randomcolor generate random color\n• /sitescheme `http://site.com/` to get color scheme of site \n• /help for this message', { parse_mode: 'Markdown' });
        botan.track($._message, 'Start');
    }

    get routes() {
        return {
            '/start': 'startHandler',
        }
    }
}

class HelpController extends TelegramBaseController {

    helpHandler($) {
        $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /tohex `rgb(51,0,255)` \n• Convert HEX to RGB /torgb `#3300ff`\n• /randomcolor generate random color\n• /sitescheme `http://site.com/` to get color scheme of site \n• /help for this message', { parse_mode: 'Markdown' });
        botan.track($._message, 'Help');
        
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
            //$.sendMessage(hexrgb.rgb2hex($.query.color))
            sendColorPic($, $.query.color, hexrgb.rgb2hex($.query.color), hexrgb.rgb2hex($.query.color))
        } else {
            $.sendMessage(colorErr($))
        }
        botan.track($._message, 'toHEX');
        
    }

    get routes() {
        return {
            '/tohex :color': 'toHexHandler'
        }
    }
}

class ToRgbController extends TelegramBaseController {

    toRgbHandler($) {
        console.log('toRGB ' + $.query.color)
        if (isValidHEX($.query.color)) {
            //$.sendMessage(hexrgb.hex2rgb($.query.color))
            sendColorPic($, $.query.color, hexrgb.hex2rgb($.query.color), hexrgb.hex2rgb($.query.color))

        } else {
            $.sendMessage(colorErr($))
        }
        botan.track($._message, 'toRGB');
        
    }

    get routes() {
        return {
            '/torgb :color': 'toRgbHandler'
        }
    }
}

class SiteSchemeController extends TelegramBaseController {

    siteSchemeHandler($) {
        botan.track($._message, 'siteColorScheme');
        
        if (isValidURL($.query.url)) {
            $.sendMessage('Okay, now you need to wait..~', { parse_mode: 'Markdown' });

            var dir = './temp/' + Math.random().toString(36).substr(2, 5) + '.png'
            console.log(dir)
            urlToImage($.query.url, dir, { width: 600, height: 600 }).then(function () {
                colorPalette(dir, 5, function (err, colors) {
                    if (err) {
                        console.error(err);
                        return false;
                    } else {
                        console.log(colors)
                        var detected_colors = []
                        console.log('sended colors for site: ' + $.query.url)
                        colors.result.forEach(function (item, index, array) {
                            var color = '#' + item.hex.toLowerCase()
                            detected_colors.push(color)
                            sendColorPic($, color, ' - ' + item.percent)

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
            '/sitescheme :url': 'siteSchemeHandler'
        }
    }
}
class PingController extends TelegramBaseController {

    pingHandler($) {
        $.sendMessage("Murr~");
        botan.track($._message, 'Ping~');
        
    }

    get routes() {
        return {
            '/ping': 'pingHandler'
        }
    }
}

class RandomColorController extends TelegramBaseController {

    randomColorHandler($) {
        botan.track($._message, 'RandomColor');

        sendColorPic($, getRandomColor(), '\nRandom color')
    }

    get routes() {
        return {
            '/randomcolor': 'randomColorHandler'
        }
    }
}

class OtherwiseController extends TelegramBaseController {
    handle($) {
        botan.track($._message, 'Otherwise');
        
        // console.log($.message._photo[0]._fileId)
        if ($.message._photo) {
            // $.sendMessage($.message._document)
            //$.sendMessage($.message._photo._fileId)
            //$.sendPhoto($.message._photo[0].fileId);
        }
        if ($.message.photo) {
            $.sendMessage($.message._photo[0].fileId);
            $.sendPhoto($.message._photo[0].fileId)
            //$.sendMessage('https://api.telegram.org/file/bot' + config.token + '/' + $.message.photo[0].file_id)
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



            // var downloadUrl = getFile($.message.photo.file_id)
            // /console.log(getFile($.message.photo.file_id))
            //          var filename = '.\\temp\\' + $.message.photo[0].file_id + '.png'

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
    .when(['/tohex :color'], new ToHexController())
    .when(['/torgb :color'], new ToRgbController())
    .when(['/randomcolor'], new RandomColorController())
    .when(['/randomСolor'], new RandomColorController())
    .when(['/sitescheme :url'], new SiteSchemeController())
    .when(['/ping'], new PingController())
    .otherwise(new OtherwiseController())

function sendColorPic($, color, desc, textonpic) {
    botan.track($._message, '-colorPic');

    console.log('Sending pic with color: ' + color)
    color = color.toLowerCase()

    //var filename = __dirname + '/temp/' + color + '.png'
    var filename = __dirname + '/temp/colorpic.png'

    // console.log(filename)
    if (textonpic) {
        gm(460, 460, color)
            .fontSize(50)
            .drawText(40, 240, textonpic)
            .write(filename, function (err) {
                if (!err) {
                    if (desc) {
                        $.sendPhoto(fs.createReadStream(filename), { caption: color + '\n' + desc })
                    }
                }
            })
    } else {
        gm(460, 460, color)
            .fontSize(50)
            .drawText(130, 240, color)
            .write(filename, function (err) {
                if (!err) {
                    if (desc) {

                        $.sendPhoto(fs.createReadStream(filename), { caption: color + desc })

                    } else {
                        // fs.readFile(filename, function () {
                        $.sendPhoto(fs.createReadStream(filename), { caption: color })

                        //     var stream = fs.createReadStream(filename)
                        //     stream.pipe(res);
                        //     stream.on('close', function () {
                        //         fs.unlink(filename)
                        //         console.log("!")
                        //     });
                        // })

                    }

                } else {
                    console.error(err)
                }
            });
    }


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
    $.sendMessage('Sorry, but isn\'t valid url \n Note, that url starts with `http://`', { parse_mode: 'Markdown' });
}
function finishedReading(filename) {
    fs.unlink(filename)
    fs.unlinkSync(filename);
    console.log("!")
}
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    console.log('Generated color: ' + color)
    return color;
}