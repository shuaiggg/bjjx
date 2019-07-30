/**
 * @file 消息体处理模块
 * @author zhujialu
 */
import store from '../store';

/**
 * 对字符串进行 HTML 编码
 *
 * @param {string} source 字符串
 * @return {string}
 */
function encode(source) {
    return String(source)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * 消息内容允许出现的标签
 *
 * @inner
 * @type {Object}
 */
const allowedTag = {
    // 暂时全不允许
};

/**
 * 转义标签
 *
 * @inner
 * @param {string} content
 * @return {string}
 */
function encodeHTML(content) {
    return content.replace(
        /<?\/?([^\s]+)( [^>]+)?>?/ig,
        function ($0, $1) {

            if ($0.startsWith('<') && $0.endsWith('>')) {
                const tagName = $1.toLowerCase();
                if (!allowedTag[tagName]) {
                    $0 = encode($0);
                }
            }
            else {
                $0 = encode($0);
            }

            return $0;
        }
    );
}

/**
 * 解析换行符
 *
 * @inner
 * @param {string} content
 * @return {string}
 */
function parseBreakline(content) {
    return content
        .replace(
            /\n\r?/g,
            function () {
                return '<br>';
            }
        );
}

/**
 * 解析空白符
 *
 * @inner
 * @param {string} content
 * @return {string}
 */
function parseWhitespace(content) {
    return content
        .replace(
            / /g,
            function ($0) {
                return '&nbsp;';
            }
        );
}

/**
 * url 正则
 *
 * @inner
 * @type {RegExp}
 */
const urlExpr = /(?=http[s]?:\/\/|www)[-~!@#$%^&*_+=.:?\/a-z0-9]+/i;

function replaceLink(original) {
    var url = original;
    if (url.indexOf('http') !== 0) {
        url = location.protocol + '//' + url;
    }
    return '<em class="bjy-link" data-href="' + url + '">'
        + original
        + '</em>';
}

/**
 * 解析链接
 *
 * @inner
 * @param {string} content
 * @return {string}
 */
function parseLink(content, render) {
    return content.replace(
        urlExpr,
        render || replaceLink
    );
}

function isPureText(content) {
    return !/\[([^\]]+)\]/g.test(content);
}


const imagePrefix = 'img:';

/**
 * 解析图片
 *
 * @param {string} content
 * @param {Function} render
 * @return {string}
 */
function parseImage(content, render) {
    var reg = /\[([^\]]+)\]/g;
    var res = reg.exec(content);
    var $0 = res[0];
    var $1 = res[1];
    if ($1.startsWith(imagePrefix)) {
        $1 = $1.substring(imagePrefix.length);
        return $1;
    }
}

function stringifyImage(url) {
    return '[' + imagePrefix + url + ']';
}


const emojiPrefix = 'emoji:';

function getEmojiUrlByKey(key) {
    const emoji = key2Emoji[key];
    if (emoji) {
        return emoji.url;
    }
}

function parseEmoji(content, render) {
    var reg = /\[([^\]]+)\]/g;
    var res = reg.exec(content);
    var $0 = res[0];
    var $1 = res[1];
    var name;
    var url;
    if ($1.indexOf(':') < 0) {
        name = $1;
    }
    else if ($1.startsWith(emojiPrefix)) {
        $1 = $1.substr(emojiPrefix.length);
        var index = $1.indexOf('|');
        if (index >= 0) {
            name = $1.substr(0, index);
            url = $1.substr(index + 1);
        }
    }
    return {
        name: name,
        url: url || getEmojiUrlByKey(name)
    };
}

function stringifyEmoji(name, url) {
    if (url) {
        name = emojiPrefix + name + '|' + url;
    }
    return '[' + name + ']';
}

const key2Emoji = {};

function init() {
    const list = store.get('partner.customExpression');
    if (Array.isArray(list)) {
        list.forEach(item => {
            key2Emoji[item.key] = item;
        });
    }
}

exports.init = init;

exports.parseBreakline = parseBreakline;
exports.parseWhitespace = parseWhitespace;
exports.parseLink = parseLink;
exports.encodeHTML = encodeHTML;

exports.isPureText = isPureText;

exports.parseEmoji = parseEmoji;
exports.stringifyEmoji = stringifyEmoji;

exports.getEmojiUrlByKey = getEmojiUrlByKey;

exports.parseImage = parseImage;
exports.stringifyImage = stringifyImage;

export default {
    init,
    parseBreakline,
    parseWhitespace,
    parseLink,
    encodeHTML,
    isPureText,
    parseEmoji,
    stringifyEmoji,
    getEmojiUrlByKey,
    parseImage,
    stringifyImage,
};
