/**
 * @file 日志
 * @author zhujialu
 */

// 按颜色值，而不是按传统的日志级别，颜色参考如下
// https://v4.bootcss.com/docs/4.0/components/alerts/#examples

function output(params, color, backgroundColor) {
    var args = [];
    args.push(
        '%c' + params[0], 'color:' + color + ';background-color:' + backgroundColor + ';padding: 2px 4px;'
    );
    console.log.apply(console, args)
}

exports.primary = function () {
    output(arguments, '#004085', '#cce5ff');
};

exports.secondary = function () {
    output(arguments, '#464a4e', '#e7e8ea');
};

exports.success = function () {
    output(arguments, '#155724', '#d4edda');
};

exports.danger = function () {
    output(arguments, '#721c24', '#f8d7da');
};

exports.warn = function () {
    output(arguments, '#856404', '#fff3cd');
};

exports.info = function () {
    output(arguments, '#0c5460', '#d1ecf1');
};

exports.light = function () {
    output(arguments, '#818182', '#fefefe');
};

exports.dark = function () {
    output(arguments, '#1b1e21', '#d6d8d9');
};

