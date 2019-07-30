import config from '../../config';

Object.assign(config, {

  DOC_IMAGE_LOAD_TIMEOUT: 5 * config.SECOND,

  DOC_IMAGE_PRELOAD_COUNT: 7,

  DOC_IMAGE_WIDTH: 750,

  DOC_IMAGE_HEIGHT: 562,
  TOUCH_DISTANCE: 40,
  TOUCH_TIME: 15
});

export default config;