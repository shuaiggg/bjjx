/**
 * @file 消息列表
 * @author  yanlingling, dujianhao
 */
import playback from '../../playback.js';
import config from '../../config';
import eventEmitter from '../../eventEmitter';
import auth from '../../auth';
import info from '../../info';

import userData from '../../data/user';

import isSameChannel from '../../function/isSameChannel';
import parser from '../../function/messageParser';
import string from '../../function/stringUtil';
import getDocumentImageDimension from '../../function/getDocumentImageDimension';
import stringifyTime from '../../function/stringifyTime';
import debounce from '../../function/debounce';

const language = require('../../language/main')();
Object.assign(language, require('./language/main')());

function needDivider(item, prev) {
  const dividerInterval = 2 * config.MINUTE;
  if (dividerInterval) {
    if (prev) {
      return item.time - prev.time > dividerInterval;
    } else {
      return true;
    }
  }
}

let isAppendingMessage = false;
let tempMessageData = [];

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    channel: {
      type: String
    },
    autoScroll: {
      type: Boolean,
      value: true
    },
    maxCount: {
      type: Number,
      value: 200
    },
    historySize: {
      type: Number,
      value: 10
    },
    shortContentSize: {
      type: Number,
      value: 80
    },
    styleInfo: {
      type: Object,
      value: {
        messageBackground: 'white',
        fromColor: '#9E9DA0',
        contentColor: 'black'
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

    messageData: [],
    language: language,
    lastMessageElId: 'message',
    hasMore: true,
    fetching: false,
    // 显示图片放大
    showImageMask: false,
    // 判断当前状态是否可以执行自动滚动（相当于prop中autoScroll的补充）
    canAutoScroll: true,
    zoomImage: {},
    teacherOnly: false,
  },
  ready: function() {
    this.setData({
      messageData: tempMessageData.slice(0)
    });

    this.namespace = '.message_list' + Math.random();

    const hasImage = function(message) {
      const content = message && message.content;
      if (content && typeof content === 'string') {
        return content.indexOf('<img ') >= 0;
      }
    };

    eventEmitter
      .on(
        eventEmitter.PLAYBACK_SEEK_START,
        () => {
          this.setData({
            canAutoScroll: false
          })
        }
      )
      .on(
        eventEmitter.PLAYBACK_SEEK_END,
        () => {
          setTimeout(() => {
            const lastMessage = this.data.messageData.slice(-1);
            this.setData({
              canAutoScroll: true,
              lastMessageElId: `message${lastMessage.id}`
            }, 200);
          })
        }
      )
      .on(
        eventEmitter.MESSAGE_PULL_RES + this.namespace,
        (event, data) => {
          if (this.isSameChannel(data.channel)) {
            this.setData({
              fetching: false,
              hasMore: data.hasMore
            });
            let hasImageMessage;
            data.messageList.forEach(message => {
              if (hasImage(this.prependMessage(message))) {
                hasImageMessage = true;
              }
            });
          }
        }
      )
      .on(
        eventEmitter.MESSAGE_RECEIVE + this.namespace,
        (event, message) => {
          if (!message) {
            return;
          }
          this.isSameChannel(message.channel) && this.appendMessage(message);
        }
      )
      .on(
        eventEmitter.MESSAGE_LIST_CLEAR + this.namespace,
        (event, data) => {
          if (this.isSameChannel(data.channel)) {
            this.setData({
              messageData: [],
              canAutoScroll: true
            });
            tempMessageData = [];
          }
        }
      );
  },

  /**
   * 组件的方法列表
   */
  methods: {
    validate: function(message) {
      if (!message.content || !message.from) {
        return false;
      }
      return message.content.trim() && message.from.status === config.USER_STATUS_ONLINE;
    },

    format: function(message) {
      const user = message.from;
      const data = message.data;
      const custom = message.custom;
      const messageTo = message.to;
      let content = message.content;
      let receiver;
      let shortContent;

      function getRenderUser() {
        const userRendered = Object.assign({}, user);
        const type = userRendered.type;
        if (auth.isTeacher(type) || auth.isAssistant(type)) {
          userRendered.roleName = 'teacher';
        }
        if (auth.isStudent(type)) {
          userRendered.roleName = 'student';
        }
        return userRendered;
      }

      const userRendered = getRenderUser();

      if (messageTo) {
        const messageReceiver = userData.find(messageTo);
        if (messageReceiver) {
          receiver = messageReceiver.name;
        }
      }

      if (!custom) {
        if (data && data.type) {
          message.type = data.type;
          if (data.type === 'emoji') {
            message.key = data.key;
            message.url = data.url || parser.getEmojiUrlByKey(data.key);
          } else if (data.type === 'image') {
            message.url = data.url;
            message.height = data.height;
            message.width = data.width;
          }
          content = '';
          shortContent = content;
        } else {
          message.type = 'text';
          content = content.trim();
          if (parser.isPureText(content)) {
            // content = parser.encodeHTML(content);
            // content = parser.parseWhitespace(content);
            // content = parser.parseBreakline(content);

            const contentTitle = userRendered.name;

            const titleLength = string.size(contentTitle);


            shortContent = string.cut(
              content,
              this.data.shortContentSize - (titleLength > 12 ? 12 : titleLength)
            );
          } else {
            const res = parser.parseEmoji(content);
            if (res.url) {
              message.url = res.url;
              message.type = 'emoji';
            }
            const url = parser.parseImage(content);
            if (url) {
              message.url = url;
              message.type = 'image';
            }
            shortContent = '';
          }
        }
      }

      let channel = message.channel;

      if (typeof channel !== 'string') {
        channel = channel ? typeof channel : '';
      }

      return {
        id: message.id,
        type: message.type,
        url: message.url,
        number: channel + (message.id || ('' + Math.random())),
        user: userRendered,
        receiver: receiver,
        time: stringifyTime(message.time ? message.time * 1000 : Date.now()),
        custom: custom,
        content: content,
        key: message.key,
        width: message.width,
        height: message.height,
        shortContent: shortContent,
        fromColor: this.data.styleInfo.fromColor
      };
    },

    prependMessage: function(message) {

      if (!this.validate(message)) {
        return;
      }
      const messageData = this.data.messageData;
      const firstMessage = messageData[0];
      if (firstMessage && message.id === firstMessage.id) {
        return;
      }

      message = this.format(message);
      messageData.unshift(message);
      this.setData({
        messageData: messageData
      });
      tempMessageData = messageData;
      this.triggerEvent('addMessage', {
        message: message
      });
      return message;
    },

    appendMessage: function(message) {

      if (!this.validate(message)) {
        return;
      }

      let messageData = this.data.messageData;
      const lastMessage = messageData[messageData.length - 1];

      if (message.to === config.MESSAGE_TO_ALL && lastMessage && message.id === lastMessage.id) {
        return;
      }
      message = this.format(message);
      message.needDivider = needDivider(message, messageData[messageData.length - 1]);
      messageData.push(message);
      const maxCount = this.data.maxCount;

      if (maxCount > 0 && messageData.length > maxCount) {
        messageData = messageData.slice(1);
      }
      isAppendingMessage = true;
      this.setData({
        messageData: messageData
      });
      tempMessageData = messageData;
      this.triggerEvent('addMessage', {
        message: message
      });

      if (this.data.autoScroll && this.data.canAutoScroll) {
        // 加防抖，小程序性能奇差
          debounce(() => {
              this.setData({
                  lastMessageElId: `message${message.id}`
              });
          }, 100, true)();
      }
      return message;
    },

    isSameChannel: function(channel) {
      return isSameChannel(
        'chat',
        channel
      );
    },

    onMessageScroll: function(e) {
      // 消息接收引发的滚动不判断
      if (isAppendingMessage) {
        isAppendingMessage = false;
        return;
      }
      const {
        scrollHeight,
        scrollTop,
        deltaY
      } = e.detail;

      // 手动向下滚动则认为是需要自动滚动
      this.setData({
        canAutoScroll: deltaY < 0
      });
    },

    onImageMaskTap: function() {
      this.setData({
        showImageMask: false
      });
      wx.nextTick(() => {
        this.triggerEvent('imagePreview', { showPreview: false });
      })
    },

    onZoomImageError: function() {
      info.alert('image load fail');
      info.hideLoading();
    },

    onZoomImageLoad: function() {
      info.hideLoading();
    },

    imageTap: function(event) {
      var data = event.target.dataset;
      var systemInfo = wx.getSystemInfoSync();
      var dimension = getDocumentImageDimension(
        systemInfo.windowWidth,
        systemInfo.windowHeight,
        data.width,
        data.height,
        config.DOC_FIT_VIEW,
        true,
        1
      );

      this.setData({
        showImageMask: true,
        zoomImage: {
          // 不加时间戳,连续点击相同的图片放大会不显示。。。
          url: data.src + '?v=' + new Date().getTime(),
          width: dimension.width,
          height: dimension.height
        }
      });
      wx.nextTick(() => {
        this.triggerEvent('imagePreview', {showPreview: true});
      })
    },

    toggleTeacherOnly: function() {
      const teacherOnly = this.data.teacherOnly;

      if (!teacherOnly) {
        const messageFilter = function(message) {
          if (message.from && message.from.type) {
            return true;
          }
          if (message.user &&
            (message.user.role == 'teacher' ||
              message.user.role == 'assistant')
          ) {
            return true;
          }
          return false;
        };
        playback.setMessageFilter(
          messageFilter
        );
      } else {
        playback.setMessageFilter(null);
      }

      this.setData({
        teacherOnly: !teacherOnly
      });
    },
  }
});