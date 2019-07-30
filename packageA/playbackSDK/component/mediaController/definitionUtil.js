/*
 * @file 格式化清晰度
 * @author dujianhao
 */

const videoConfig = {

  VIDEO_DEFINITION_STANDARD: 'low',

  VIDEO_DEFINITION_HIGH: 'high',

  VIDEO_DEFINITION_SUPER: 'super',

  VIDEO_DEFINITION_SUPERHD: 'superHD',

  VIDEO_DEFINITION_720: '720p',

  VIDEO_DEFINITION_1080: '1080p',
};

const definitionArr = [
    videoConfig.VIDEO_DEFINITION_STANDARD,
    videoConfig.VIDEO_DEFINITION_HIGH,
    videoConfig.VIDEO_DEFINITION_SUPER,
    videoConfig.VIDEO_DEFINITION_SUPERHD,
    videoConfig.VIDEO_DEFINITION_720,
    videoConfig.VIDEO_DEFINITION_1080,
];
function getDefinitionArr (arr) {
  return definitionArr.filter(value => {
    return ~arr.indexOf(value);
  });
}

const definitionTextArr = {
  [videoConfig.VIDEO_DEFINITION_STANDARD]: '标清',
  [videoConfig.VIDEO_DEFINITION_HIGH]: '高清',
  [videoConfig.VIDEO_DEFINITION_SUPER]: '超清',
  [videoConfig.VIDEO_DEFINITION_SUPERHD]: '超清HD',
  [videoConfig.VIDEO_DEFINITION_720]: '720p',
  [videoConfig.VIDEO_DEFINITION_1080]: '1080p',
};

function getDefinitionText (definition) {
  return definitionTextArr[definition];
}

export default {
  getDefinitionArr,
  getDefinitionText,
}