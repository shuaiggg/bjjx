/**
 * @file 话术入口
 * @author zhujialu
 */

var getLanguage = require('../../../../playbackSDK/function/getLanguage').getLanguage;
module.exports = function () {
    return getLanguage({
        english: require('./english'),
        chineseLive: require('./chineseLive'),
        chineseClassroom: require('./chineseClassroom')
    });
};

