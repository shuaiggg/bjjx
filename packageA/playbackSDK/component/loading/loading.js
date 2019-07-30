// common/component/loading.js
/**
 * @file 进教室加载组件
 * @author  yanlingling
 */

const Queue = require('../../Queue');
const appLanguage = require('../../language/main')();
const pageLanguage = require('./language/main')();

import store from '../../store';
import eventEmitter from '../../eventEmitter';

Object.assign(pageLanguage, appLanguage);

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    styleInfo: {
      type: 'Object',
      value: {
        showInfo: true,
        strokeWidth: 6,
        activeColor: '#1694ff',
        backgroundColor: '#d8d9d8'
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    needHelp: false,
    progress: 0,
    statusTips: '',
    logoSrc: '',
    roomLoadEnded: false
  },

  ready: function() {
    const me = this;
    const queue = new Queue({
      task: function(item, callback) {
        if (item.callback) {
          item.callback(item);
        }
        callback();
      }
    });

    this.queue = queue;

    this.namespace = '.loading' + Math.random();

    let stepIndex = 0;
    let stepValue = 25;

    eventEmitter
      .one(
        eventEmitter.PLAYBACK_ROOM_INFO_FETCH_FAILED,
        (event, data) => {
          queue.add({
            callback: () => {
              me.setData({
                statusTips: (data && data.msg) || pageLanguage.ENTER_PLAYBACK_ROOM_INFO_FETCH_FAILED,
              });
            }
          });
        }
      )
      .one(
        eventEmitter.PLAYBACK_INFO_FETCH_START + this.namespace,
        () => {
          const logoPrefix = store.get('partner.logoPrefix') || '.';
          this.setData({
            logoSrc: `${logoPrefix}/m-loading.png`
          });
          queue.add({
            progress: (++stepIndex) * stepValue,
            callback: item => {
              me.setData({
                statusTips: pageLanguage.ENTER_PLAYBACK_INFO_FETCH_START,
                progress: item.progress
              });
            }
          });
        }
      )
      .one(
        eventEmitter.PLAYBACK_INFO_FETCH_FAILED + this.namespace,
        (event, data) => {

          queue.add({
            callback: function() {
              me.setData({
                statusTips: (data && data.msg) || pageLanguage.ENTER_PLAYBACK_ROOM_INFO_FETCH_FAILED,
              });
            }
          });
        }
      )
      .one(
        eventEmitter.PLAYBACK_INFO_FETCH_END + this.namespace,
        (event, data) => {
          if (!data.response.data) {
            queue.add({
              progress: (++stepIndex) * stepValue,
              callback: function(item) {
                me.setData({
                  statusTips: data.response.msg,
                  progress: item.progress,
                });
              }
            });
          } else {
            queue.add({
              progress: (++stepIndex) * stepValue,
              callback: function(item) {
                me.setData({
                  statusTips: pageLanguage.ENTER_PLAYBACK_INFO_FETCH_END,
                  progress: item.progress
                });
              }
            });
          }
        }
      )
      .one(
        eventEmitter.PLAYBACK_SIGNAL_FETCH_START + this.namespace,
        () => {
          queue.add({
            progress: (++stepIndex) * stepValue,
            callback: function(item) {
              me.setData({
                statusTips: pageLanguage.ENTER_PLAYBACK_SIGNAL_FETCH_START,
                progress: item.progress
              });
            }
          });
        }
      )
      .one(
        eventEmitter.PLAYBACK_SIGNAL_FETCH_END + this.namespace,
        () => {
          queue.add({
            progress: (++stepIndex) * stepValue,
            callback: function(item) {
              me.setData({
                statusTips: pageLanguage.ENTER_PLAYBACK_SIGNAL_FETCH_END,
                progress: item.progress
              });
              wx.nextTick(() => {
                  me.setData({
                      roomLoadEnded: true
                  })
                me.triggerEvent('loadEnded');
              });
            }
          });
        }
      )
      .one(
        eventEmitter.UNSUPPORTED_END_TYPE + this.namespace,
        () => {
          queue.add({
            callback: function(item) {
              me.setData({
                statusTips: pageLanguage.UNSUPPORTED_END_TYPE_ERROR,
              });
            }
          });
        }
      );
    wx.nextTick(() => {
      this.triggerEvent('loadingReady');
    });
  },

  detached: function() {
    eventEmitter.off(this.namespace);
    this.queue && this.queue.dispose();
  },
});