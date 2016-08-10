'use strict'

var config = require('./config.json'),
    fs = require('fs'),
    req = require('tiny_request'),
    im = require('imagemagick'),
    hexrgb = require('hexrgb'),
    colorPalette = require("colors-palette"),
    urlToImage = require('url-to-image'),
    gm = require('gm').subClass({ imageMagick: true })

//var botan = require('botanio')(config.botanio);
var botan = require('botanio')('asd');

var Telegram = require('telegram-node-bot'),
    TelegramBaseController = Telegram.TelegramBaseController,
    //tg = new Telegram.Telegram(config.token)
    tg = new Telegram.Telegram('247937051:AAEBzwnRtdMvkUjkRm1YDCNgAKPCc5EzrvY')

class StartController extends TelegramBaseController {

    startHandler($) {
        $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /tohex `rgb(51,0,255)` \n• Convert HEX to RGB /torgb `#3300ff`\n• /randomcolor generate random color\n• /feedback if you have any ideas for improvement or corrective bot \n• /help for this message', { parse_mode: 'Markdown' });
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
        $.sendMessage('Hello! 👋\n\nWhat I can do:\n\n• Preview of colors like: `#3300ff`, `#30f` or `rgb(51,0,255)`\n• Convert RGB to HEX /tohex `rgb(51,0,255)` \n• Convert HEX to RGB /torgb `#3300ff`\n• /randomcolor generate random color\n• /feedback if you have any ideas for improvement or corrective bot \n• /help for this message', { parse_mode: 'Markdown' });
        //• /sitescheme `http://site.com/` to get color scheme of site 
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

            var dir = './temp/siteimage.png'
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
class VerificationController extends TelegramBaseController {

    verHandler($) {
        $.sendMessage("F313C395CE3C04E63E492141DACA001C");

    }

    get routes() {
        return {
            '/botfamily_verification_code': 'verHandler'
        }
    }
}

class FeedBackController extends TelegramBaseController {

    feedbackHandler($) {
        const form = {
            feedback: {
                q: 'What do you want to send the bot creators?\n\nType /cancel to cancel the opearation.',
                error: 'sorry, wrong input',
                validator: (message, callback) => {
                    if (message.text) {
                        $.sendMessage('Thank you! Message was sent. We will read it and reply to you as soon as we can. /help')

                        callback(true, message) //you must pass the result also
                        return
                    }

                    callback(false)
                }
            }
        }

        $.runForm(form, (result) => {
            //result.feedback._from._id
            //result.feedback._from._username
            //result.feedback._text

            var options = { parse_mode: 'Markdown' }
            var time = new Date();
            var timeFormated =
                ("0" + time.getDate()).slice(-2) + "." +
                ("0" + time.getMonth()).slice(-2) + "." +
                ("0" + time.getFullYear()).slice(-2) +
                ' ' +
                ("0" + time.getHours()).slice(-2) + ":" +
                ("0" + time.getMinutes()).slice(-2) + ":" +
                ("0" + time.getSeconds()).slice(-2)
            console.log('FeedBack: ' + result.feedback._from._username + ': ' + result.feedback._text)
            tg.api.sendMessage('94556687', result.feedback._from._id + '~@' + result.feedback._from._username + '\n*' + timeFormated + '*\n\n' + result.feedback._text, options) 
        })
        botan.track($._message, 'FeedBack');

    }

    get routes() {
        return {
            '/feedback': 'feedbackHandler'
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
        botan.track($._message, 'RandomColor')
        var rnd = getRandomColor()
        sendColorPic($, rnd, rnd)
    }

    get routes() {
        return {
            '/randomcolor': 'randomColorHandler'
        }
    }
}

class OtherwiseController extends TelegramBaseController {
    handle($) {
        // console.log($._message._replyToMessage._оmessageId)
        //$._message._replyToMessage._messageId
        if ($.message._from._username === 'shmlkv' && $._message._replyToMessage && $._message._replyToMessage._text.split('~')[0]) {
            var userid = $._message._replyToMessage._text.split('~')[0];

            console.log('admin is reply')
            var options = {  parse_mode: 'Markdown' }

            tg.api.sendMessage(userid, 'Developer bot replied to your message:\n\n' + $.message._text + '\n\nSend me /feedback command if you want to write something else.', options)
            botan.track($._message, 'FeedBack');
            
        } else {
            botan.track($._message, 'Otherwise');

            // console.log($.message._photo[0]._fileId)
            if ($.message._photo) {
                $.sendMessage('I don\'t know what to do with pics :(')
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
    .when(['/botfamily_verification_code'], new VerificationController())
    .when(['/feedback'], new FeedBackController())

    .otherwise(new OtherwiseController())

function sendColorPic($, color, desc) {
    botan.track($._message, '-colorPic');

    console.log('Sending pic with color: ' + color)
    color = color.toLowerCase()

    var filename = __dirname + '/temp/colorpic.png'

    gm(460, 460, color)
        //.fontSize(50)
        //.drawText(130, 240, color)
        .write(filename, function (err) {
            if (!err) {
                if (desc)
                    var options = { caption: desc, reply_to_message_id: $.message._messageId }
                else
                    var options = { reply_to_message_id: $.message._messageId }

                $.sendPhoto(fs.createReadStream(filename), options)

            } else {
                console.error(err)
            }
        });
    // }


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