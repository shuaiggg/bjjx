import eventEmitter from '../../eventEmitter';

let isInited;
let isLoading;


const init = function(container) {
  isInited = true;
  eventEmitter
    .on(
      eventEmitter.PAGE_CHANGE_START,
      function(event, data) {
        if (!data.hasCache) {
          show();
        }
      }
    )
    .on(
      eventEmitter.PAGE_CHANGE_END,
      function(event, data) {
        hide();
      }
    );

};

const show = function() {
  if (isInited && !isLoading) {
    isLoading = true;
    // wx.showLoading({
    //   title: 'loading...',
    //   mask: true
    // })
  }
};

const hide = function() {
  if (isLoading) {
    // wx.hideLoading();
  }
};

export default {
  init,
  show,
  hide,
}