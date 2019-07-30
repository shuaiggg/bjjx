const getLanguage = require('../function/getLanguage').getLanguage;
const language = function() {
    return getLanguage({
        english: require('./english'),
        chineseLive: require('./chineseLive'),
        chineseClassroom: require('./chineseClassroom')
    });
};
module.exports = language;

export default language;