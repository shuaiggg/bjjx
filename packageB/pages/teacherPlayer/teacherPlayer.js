// pages/teacherPlayer/teacherPlayer.js
var util = require('../util');
var bjy = require('../../sdk/bjy');
const app = getApp();

Page({
    data: {
      header: {
        iconShow: true,
        title: '直播',
        isPlaceholder: true
      },
      showBtns: false,
      whiteboardFull: false,

      hidePlayer: false,
      fullScreen: false,
      parameter: '',
      teacherSize: {
        width: 0,
        height: 0
      },
      messagesHeight: 200,

      hidePageCount: true,
      showClear: false,
      optValue: '变小',
      drawing: false,
      drawOptValue: '开启画笔',
      size: {
        width: 300,
        height: 200
      },
      whiteboardClass: 'whiteboard',
      styleInfo: {
        backgroundColor: '#e5e5e5',
        pageCountColor: 'red',
        pageCountBackground: 'green',
        isHide: false
      },

      // 消息列表
      messageStyleInfo: {
        messageBackground: 'red',
        fromColor: 'yellow',
        contentColor: 'blue'
      },
      historySize: 5,
      maxCount: 10,

      // 发送消息
      placeholder: '请输入..',
      messageMaxLength: 10,
      focus: false,
      scrollTop: 200
    },
    onLoad: function (options) {
      let that = this
      let screenWidth = app.globalData.systemInfo.screenWidth
      let screenHeight = app.globalData.systemInfo.screenHeight - 160
      let ratioHeight = screenWidth / (16 / 9)
      that.setData({
        ['size.width']: screenWidth,
        ['size.height']: ratioHeight,
        ['teacherSize.width']: screenWidth / 3,
        ['teacherSize.height']: ratioHeight / 3,
        messagesHeight: screenHeight - ratioHeight,
        parameter: options.parameter
      })
    },
    onTapHide: function () {
        var me = this;
        me.setData({
          hidePlayer: !me.data.hidePlayer
        });
    },
    onTapFullScreen: function () {
        
    },
    onReady: function () {
      let parameter = JSON.parse(this.data.parameter)
      console.log(JSON.parse(this.data.parameter));
      util.init(parameter)
    },
    onUnload: function () {
        bjy.exit();
    },
    onPlayerTap: function (event) {
      // bjy.info.tip('老师视频点击');
      console.log('用户触摸player');
      console.log(event);

      let that = this;
      let teacherSize = that.data.teacherSize
      let size = that.data.size
      let fullScreen = that.data.fullScreen
      that.setData({
        fullScreen: !that.data.fullScreen,
        ['teacherSize.width']: fullScreen ? teacherSize.width / 3 : teacherSize.width * 3,
        ['teacherSize.height']: fullScreen ? teacherSize.height / 3 : teacherSize.height * 3
      })
    },
    onTeacherPlayerSupportedChanged: function (event) {
        if (event.detail.support) {
            console.log('当前流可以播放');
        } else {
            console.log('当前流不可以播放');
        }
    },
    onTeacherPlayerAVStatusChange: function (event) {
        if (typeof event.detail.changeInfo.videoTo == 'boolean') {
            console.log('视频变化');
        }
        if (typeof event.detail.changeInfo.audioTo == 'boolean') {
            console.log('音频频变化');
        }
    },

    // 白板触摸
    onWhiteboardTap: function () {
      console.log('白板点击')
      this.whiteboardFullScreen()
    },
    //消息列表
    onAddMessage: function (event) {
      console.log('onAddMessage');
      console.log(event.detail);
      this.setData({
        scrollTop: 45 + this.data.scrollTop
      })
    },
    // 发送消息 
    onSendMessage: function (event) {
      console.log('发送消息');
      console.log(event.detail);
    },
    onHeightChange: function (event) {
      console.log('高度变化');
      console.log(event.detail);
    },
    // 白板全屏
    whiteboardFullScreen() {
      this.setData({
        whiteboardFull: !this.data.whiteboardFull,
        [`styleInfo.isHide`]: !this.data.whiteboardFull
      })
    }
})