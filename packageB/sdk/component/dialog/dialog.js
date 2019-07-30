/**
 * @file dialog
 * 可覆盖在canvas和video上的通用dialog，支持slot自定义内容(slot内容必须为cover-view支持的tag),dialog的显隐由外界控制
 * ！！！注意：当前时间点（2018-12-05）小程序iOS不支持component的cover-view内嵌slot
 * @author dujianhao
 */
// sdk/component/dialog/dialog.js

var appLanguage = require('../../language/main')();

Component({
  /**
   * Component properties
   */
  properties: {
    showTitle: {
      type: 'boolean',
      value: false,
    },
    title: {
      type: 'string',
      value: appLanguage.DIALOG_TITLE,
    },
    contentStyle: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
    showConfirmBtn: {
      type: 'boolean',
      value: true,
    },
    confirmText: {
      type: 'string',
      value: appLanguage.CONFIRM,
      observer: function(v) {
        this.setData({
          confirmBtnText: v || appLanguage.CONFIRM,
        });
      }
    },
    showCancelBtn: {
      type: 'boolean',
      value: true,
    },
    cancelText: {
      type: 'string',
      value: appLanguage.CANCEL,
      observer: function(v) {
        this.setData({
          cancelBtnText: v || appLanguage.CANCEL,
        });
      }
    },
    /**
     * 点击mask等同cancel
     */
    maskClickAsCancel: {
      type: 'boolean',
      value: false,
    },
  },

  /**
   * Component initial data
   */
  data: {
    confirmBtnText: appLanguage.CONFIRM,
    cancelBtnText: appLanguage.CANCEL,
  },

  /**
   * Component methods
   */
  methods: {
    confirm: function() {
      this.triggerEvent('confirm');
    },
    cancel: function() {
      this.triggerEvent('cancel');
    },
    maskClick: function() {
      if (this.data.maskClickCancel) {
        this.triggerEvent('cancel');
      }
    },
  }
});