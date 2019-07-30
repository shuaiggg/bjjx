// demo/playback/playback.js
// @author dujianhao
const app = getApp()
const common = require('../../../utils/ajax.js')

// 引入回放SDK
import playback from '../../playbackSDK/playback.js';

// 分辨率工具（可选）
import definitionUtil from './utils/definitionUtil';

// 网络监听工具（可选）
import networkUtil from './utils/networkUtil.js';

// 默认判断的seek最小距离
const SEEK_RANGE = 5;
let lastTimeUpdateTime = undefined;
let isFirstPlay = true;
let mediaContext = null;
let mediaWaitingTimer = null;

/**
 * 检测timeupdate是不是seek
 */
function checkIsSeek(currentTime) {

  let flag = false;
  // 小程序没有seek事件，通过timeupdate的差值判断是否seek
  if (lastTimeUpdateTime !== undefined && Math.abs(lastTimeUpdateTime - currentTime) > SEEK_RANGE) {
    flag = true;
  }
  lastTimeUpdateTime = currentTime;
  return flag;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    header: {
      iconShow: true,
      title: '回放',
      isPlaceholder: false
    },
    navigaHeight: 0,
    parameter: '',
    // 网络是否连接
    isConnected: true,

    videoSources: null,
    allVideos: null,
    videoWatermark: null,
    currentVideoSourceIndex: null,
    currentVideoSource: null,
    currentVideoURL: null,
    currentResolution: null,
    resolutionArr: [],
    resolutionIndex: 0,

    // 视频相关配置
    // 原生只支持0.5/0.8/1.0/1.25/1.5
    // https://developers.weixin.qq.com/miniprogram/dev/api/media/video/VideoContext.playbackRate.html
    rateArr: ['0.5', '0.8', '1.0', '1.25', '1.5'],
    rateArrIndex: 2,
    playRate: 1,
    isPlaying: false,
    isVideoFullScreen: false,

    loadingStyleInfo: {
      activeColor: '#1795ff',
      strokeWidth: '5',
      backgroundColor: '#aaa'
    },


    // 白板组件相关配置
    isWhiteboardFullScreen: false,
    showClear: false,
    whiteboardStyleInfo: {
      backgroundColor: 'white',
      pageCountColor: 'red',
      pageCountBackground: 'green',
      isHide: false
    },

    // 消息列表组件相关配置
    messageListStyleInfo: {
      messageBackground: '#f2f3f5',
      contentColor: '#333'
    },

    // tab项
    tabIndex: 0,

    logoSrc: 'img/m-loading.png',
    // 进度条样式
    loadingStyleInfo: {
      // 进度条前景色
      activeColor: '#1795ff',
      // 进度条背景色
      backgroundColor: '#aaa',
      // 进度条粗细
      strokeWidth: '5'
    },
    closeLoading: false
  },

  /**
   * 获取回放数据之后初始化页面数据
   * @param data {Object}
   * data.title {String}: 回放标题
   * data.audio {String}: 回放音频
   * data.videoId {String}: 视频ID
   * data.videos {Object}: 所有视频
   * data.videoWatermark {String}: 视频水印，后台可配置
   * data.definition {Array}: 视频分辨率数组
   * data.defaultDefinition {String}: 默认分辨率
   */
  initData: function(data) {

    if (!(data && data.videos)) {
      return;
    }

    // 设置小程序标题
    wx.setNavigationBarTitle({
      title: data.title
    });

    // 包含所有分辨率，所有CDN的视频
    const allVideos = data.videos;

    const resolutionArr = definitionUtil.getDefinitionArr(Object.keys(data.videos));
    const resolutionTextArr = resolutionArr.map(item => {
      return definitionUtil.getDefinitionText(item);
    });

    // 后台可配置默认分辨率，此处读取后台默认配置
    const defaultDefinition = data.defaultDefinition;
    let currentResolution = resolutionArr[0];

    if (defaultDefinition && defaultDefinition !== currentResolution && allVideos[defaultDefinition]) {
      currentResolution = defaultDefinition;
    }

    const currentResolutionText = definitionUtil.getDefinitionText(currentResolution);

    const resolutionIndex = resolutionArr.indexOf(currentResolution);
    const videoSources = allVideos[currentResolution];
    let currentVideoSourceIndex = 0;
    const currentVideoSource = videoSources[currentVideoSourceIndex];

    this.setData({
      videoSources,
      currentVideoSourceIndex,
      currentVideoSource,
      currentVideoURL: currentVideoSource.url,
      currentResolution,
      resolutionArr,
      resolutionTextArr,
      currentResolutionText,
      resolutionIndex,
      allVideos,
      videoWatermark: data.videoWatermark,
    });

    // 发送媒体信息给回放SDK
    this.sendMediaInfo();
    // 获取video实例
    mediaContext = wx.createVideoContext('mainVideo', this);

    // 获取当前网络信息并toast提示
    networkUtil.getNetworkStatus();

    // 监听网络变化
    networkUtil.watchNetwork(
      () => {
        this.setData({
          isConnected: true
        });
      },
      () => {
        this.setData({
          isConnected: false
        });
      }
    );
  },

  /**
   * 点击切换tab
   * @param e
   */
  changeTab: function(e) {
    this.setData({
      tabIndex: +e.target.dataset.index
    });
  },

  /**
   * 向回放SDK发送当前媒体信息
   * 首次播放的时候发送视频信息(可能存在切换cdn或清晰度，所以可能需要多次发送)
   */
  sendMediaInfo: function() {
    const sourceInfo = this.data.currentVideoSource;
    const mediaInfo = {};
    mediaInfo.cdn = sourceInfo.cdn;
    mediaInfo.filesize = sourceInfo.size;
    mediaInfo.totaltime = sourceInfo.duration;
    mediaInfo.resolution = this.data.currentResolution;
    mediaInfo.playfiletype = 'mp4';
    mediaInfo.contenttype = 0; // 播放内容的类型  0:正片 1:片头 2:片尾

    playback.sendMediaInfo(mediaInfo);
  },

  /**
   * 开始播放事件
   */
  onVideoPlay: function() {
    this.setData({
      isPlaying: true,
    });
    // 视频播放时告诉回放SDK开始播放了
    playback.play();
    isFirstPlay = false;
  },

  /**
   * 暂停播放事件
   */
  onVideoPause: function() {
    this.setData({
      isPlaying: false,
    });
    // 视频暂停时告诉回放SDK暂停了
    playback.pause();
  },

  /**
   * 时间更新事件
   */
  onVideoTimeUpdate: function(e) {
    // 视频时间更新则说明不再卡顿
    mediaWaitingTimer && (mediaWaitingTimer = clearTimeout(mediaWaitingTimer));
    if (isFirstPlay) {
      return;
    }
    const currentTime = e.detail.currentTime;
    const duration = e.detail.duration;

    // 小程序bug：卡顿或暂停后再播放会发出两次timeupdate事件，第二次为多余的事件，时间比第一次少2s左右
    const range = lastTimeUpdateTime - currentTime;
    if (range >= 0 && range < 3) {
      return;
    }

    // 微信video组件没有seek事件，此处必须自己判断
    if (checkIsSeek(currentTime)) {
      // 视频seek后需告诉回放SDKseek的位置
      playback.seek(currentTime);
    } else {
      // ！！！！
      // 通过视频的timeupdate事件驱动回放SDK持续发送消息（必须调用）
      // ！！！！
      playback.timeupdate(currentTime, duration);
    }
  },

  /**
   * 视频卡顿事件
   */
  onVideoWaiting: function() {
    console.log('waiting');
    wx.hideLoading();
    mediaWaitingTimer = clearTimeout(mediaWaitingTimer);
    if (this.data.isConnected) {
      wx.showToast({
        title: '有点卡哦~',
        icon: 'none',
        duration: 1000,
      });
      // 卡顿超过5秒则切CDN
      mediaWaitingTimer = setTimeout(() => {
        this.changeCDN();
      }, 5000);
    } else {
      wx.showToast({
        title: '断网了哦~',
        icon: 'none',
        duration: 1000,
      });
    }
  },

  /**
   * 视频出错事件
   */
  onVideoError: function() {
    console.log('error');
    // 播放出错且连着网，则切CDN
    if (this.data.isConnected) {
      this.changeCDN();
    }
  },

  /**
   * 结束播放事件
   */

  onVideoEnded: function(e) {
    // console.log('ended');
    // 告诉回放SDK视频播放结束
    playback.sendLog('endplay');
  },

  /**
   * 视频全屏触发
   */
  onFullScreenChange: function(e) {
    this.setData({
      isVideoFullScreen: e.detail.fullScreen
    });
  },

  /**
   * 更改播放速率
   */
  changeRate: function(e) {
    const rateArrIndex = e.detail.value;
    const rateArr = this.data.rateArr;
    const playRate = +rateArr[rateArrIndex];
    this.setData({
      rateArrIndex,
      playRate,
    });
    // 小程序bug：改变速率的时候video会自己播放起来，而界面上还是显示的暂停
    // 此处多一次play，让界面显示正常播放样式
    mediaContext.play();
    wx.nextTick(() => {
      mediaContext.playbackRate(playRate);
    });
    playback.setSpeed(playRate);
  },

  /**
   * 更改CDN
   */
  changeCDN: function() {
    // 当前视频源index
    let currentVideoSourceIndex = this.data.currentVideoSourceIndex;
    // 当前视频源
    let currentVideoSource = this.data.currentVideoSource;

    // 视频源最后的index
    const lastSourcesIndex = currentVideoSource.length - 1;
    if (lastSourcesIndex === 0) {
      console.log('仅有唯一播放源，无法切换');
      return;
    }

    currentVideoSourceIndex = currentVideoSourceIndex >= lastSourcesIndex ? 0 : ++currentVideoSourceIndex;
    currentVideoSource = this.data.videoSources[currentVideoSourceIndex];

    this.setData({
      currentVideoSourceIndex,
      currentVideoSource,
    });
    this.changeMediaUrl(currentVideoSource.url, lastTimeUpdateTime);
  },

  /**
   * 更改视频URL
   */
  changeMediaUrl: function(newUrl, currentTime) {

    mediaContext.pause();

    wx.nextTick(() => {
      this.setData({
        currentVideoURL: newUrl,
      });

      // 因video没有metadata事件，暴力解决切视频源后的继续播放问题
      const interval = setInterval(() => {
        if (this.data.isPlaying) {
          clearInterval(interval);
          return;
        }
        mediaContext.play();
        // 恢复到历史位置
        mediaContext.seek(currentTime);
      }, 500);
    });
    // 视频信息改变需要告诉回放SDK
    this.sendMediaInfo();
  },

  /**
   * 更改分辨率
   */
  changeResolution: function(e) {

    // 当前分辨率index
    const resolutionIndex = e.detail.value;

    // 当前分辨率
    const currentResolution = this.data.resolutionArr[resolutionIndex];

    // 当前分辨率文本
    const currentResolutionText = definitionUtil.getDefinitionText(currentResolution);

    // 当前分辨率下的视频源合集
    const videoSources = this.data.allVideos[currentResolution];
    // 重置视频源index为0
    const currentVideoSourceIndex = 0;
    // 当前视频源
    const currentVideoSource = videoSources[currentVideoSourceIndex];

    this.setData({
      videoSources,
      currentVideoSourceIndex,
      currentVideoSource,
      currentResolution,
      currentResolutionText,
      resolutionIndex,
    });

    this.changeMediaUrl(currentVideoSource.url, lastTimeUpdateTime);
  },

  /**
   * 白板全屏
   */
  toggleWhiteboardFullScreen: function() {
    const isWhiteboardFullScreen = this.data.isWhiteboardFullScreen;
    this.setData({
      isWhiteboardFullScreen: !isWhiteboardFullScreen,
      [`whiteboardStyleInfo.isHide`]: !isWhiteboardFullScreen
    });
  },
  onLoad: function(options) {
    let that = this
    console.log('options:' + options.parameter)
    that.setData({
      navigaHeight: app.globalData.systemInfo.navHeight,
      parameter: options.parameter
    })
  },
  loadingReady: function () {
    let parameter = JSON.parse(this.data.parameter)
    console.log(parameter)
    // return false
    // 设置屏幕不锁屏
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    // 回放SDK初始化，在此写入需要的回放数据
    playback.init({
      apiOrigin: '', // 与百家云约定的自定义域名，如'http://custom.at.baijiauyn.com', 若未约定则可以不传
      token: parameter.token,
      'class': {
        id: parameter.id,
        sessionId: 0,
      },
      user: {
        number: parameter.number,
        avatar: parameter.avatar,
        name: parameter.user_name,
        type: 0
      }
    }).then(data => {
      if (!data) {
        return;
      }
      console.log(data)
      this.initData(data);
    });
  },
  loadEnded(e) {
    console.log('加载完毕')
    this.setData({
      closeLoading: true
    })
  }
});