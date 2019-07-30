// sdk/component/rollCall/rollCall.js

var device = require('../../device');
var eventEmitter = require('../../eventEmitter');
var language = require('./language/main')();
var rollCallInterval = null;
Component({

  /**
   * Component initial data
   */
  data: {
    isAndroid: device.isAndroid(),
    language: language,
    // 是否显示dialog
    showDialog: false,
    duration: 0,
    content: '',
    confirmText: language.CALL_THE_ROOL_RESPOND,
    showCancelBtn: false,
  },

  /**
   * Component methods
   */
  methods: {

    onDialogConfirm: function() {
      console.log(11)
      this.setData({
        showDialog: false,
        duration: 0,
        content: '',
      });
      rollCallInterval = clearInterval(rollCallInterval);
      wx.showToast({
        title: language.CALL_THE_ROOL_RESPOND_SUCCESS,
      });
      eventEmitter.trigger(eventEmitter.ROLL_CALL_RES);
    },
  },

  ready: function() {
    eventEmitter
      .on(
        eventEmitter.ROLL_CALL,
        (event, data) => {
          var isAndroid = device.isAndroid();
          var duration = data.duration;
          this.setData({
            showDialog: true,
            duration: duration,
          });
          if (!isAndroid) {
            this.setData({
              content: `${language.CALL_THE_ROOL_REQUIREMENTS_BEFORE} ${duration}s ${language.CALL_THE_ROOL_REQUIREMENTS_AFTER}`,
            });
          }
          duration--;
          rollCallInterval = setInterval(() => {
            if (duration <= 0) {
              this.setData({
                showDialog: false,
                duration: 0,
              });
              rollCallInterval = clearInterval(rollCallInterval);
              return;
            }
            this.setData({
              duration: duration,
            });
            if (!isAndroid) {
              this.setData({
                content: `${language.CALL_THE_ROOL_REQUIREMENTS_BEFORE} ${duration}s ${language.CALL_THE_ROOL_REQUIREMENTS_AFTER}`,
              });
            }
            duration--;
          }, 1000);
        }
      );
  }
})