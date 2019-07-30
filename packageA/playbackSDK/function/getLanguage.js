var store = require('../store');
module.exports.getLanguage = function (language) {
    return  store.get('isLive') ? language.chineseLive
        : language.chineseClassroom
};

