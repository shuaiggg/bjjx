// playbackSDK/component/mediaController/mediaController.js
import stringifySecond from '../../function/stringifySecond.js';
// 分辨率工具
import definitionUtil from './definitionUtil.js';

Component({
  /**
   * Component properties
   */
  properties: {
    /**
     * 媒体时长
     */
    duration: {
      type: Number,
      value: 100,
      observer: function(v) {
        this.setData({
          durationStr: stringifySecond(v),
        })
      }
    },
    /**
     * 媒体当前时间
     */
    currentTime: {
      type: Number,
      value: 0,
      observer: function(v) {
        if (this.data.isSeeking) {
          return;
        }
        this.setData({
          sliderValue: v,
          progressText: stringifySecond(v),
        });
      }
    },
    /**
     * 首次播放时间
     */
    initialTime: {
      type: Number,
      value: 0,
      observer: function(v) {
        this.setData({
          sliderValue: v,
          progressText: stringifySecond(v),
        })
      }
    },

    /**
     * 媒体播放状态从外界获取，内部改变时若媒体播放出错则控制条样式会有问题
     */
    isPlaying: {
      type: Boolean,
      value: false,
    },

    /**
     * 视频全屏状态从外界获取，内部改变时若媒体全屏失败则控制条样式会有问题
     */
    isFullScreen: {
      type: Boolean,
      value: false,
    },

    resolutionArr: {
      type: Array,
      value: [],
      observer: function(v) {
        const resolutionTextArr = v.map(item => {
          return definitionUtil.getDefinitionText(item);
        });
        this.setData({
          resolutionTextArr,
        })
      },
    },

    initialResolutionIndex: {
      type: Number,
      value: 0,
      observer: function(v) {
        this.setData({
          resolutionIndex: v,
        })
      },
    },

    initialRateIndex: {
      type: Number,
      value: 2,
      observer: function(v) {
        this.setData({
          rateIndex: v,
        })
      },
    },

    /**
     * 进度条高亮色
     */
    activeColor: {
      type: String,
      value: '#fff'
    },
    /**
     * 进度条背景色
     */
    backgroundColor: {
      type: String,
      value: '#999'
    },
    /**
     * 进度拖拽圆钮大小
     */
    blockSize: {
      type: Number,
      value: 16
    },
    /**
     * 组件额外配置
     * @property showFullScreen: 显示全屏按钮
     * @property showPlayBtn: 显示播放按钮
     * @property showProgressBar: 显示进度条
     * @property showCurrentTime: 显示当前时间
     * @property showDuration: 显示总时长
     * @property showResolutionPicker: 显示分辨率选择
     * @property showPlaybackRatePicker: 显示播放速度选择
     */
    mediaControllerConfig: {
      type: Object,
      value: {
        showFullScreen: true,
        showPlayBtn: true,
        showProgressBar: true,
        showCurrentTime: true,
        showDuration: true,
        showResolutionPicker: true,
        showPlaybackRatePicker: true,
      }
    }
  },

  /**
   * Component initial data
   */
  data: {
    hasPlayed: false,

    // 进度条拖拽时需要断开与媒体时间的绑定，不然会出现按钮跳动，此处加上标志量
    isSeeking: false,
    sliderValue: 0,
    durationStr: stringifySecond(0),
    progressText: stringifySecond(0),

    // 媒体播放速度原生只支持0.5/0.8/1.0/1.25/1.5
    // https://developers.weixin.qq.com/miniprogram/dev/api/media/video/VideoContext.playbackRate.html
    rateArr: ['0.5', '0.8', '1.0', '1.25', '1.5'],
    rateArrIndex: 2,

    resolutionIndex: 0,
    resolutionTextArr: [],
  },

  /**
   * Component methods
   */
  methods: {
    /**
     * 进度条拖拽中事件
     */
    sliderChanging: function(e) {
      const value = e.detail.value;
      this.setData({
        isSeeking: true,
      });
    },
    /**
     * 进度条拖拽结束 触发seek
     */
    sliderChange: function(e) {
      const value = e.detail.value;
      this.triggerEvent('seek', {
        value
      });
      this.setData({
        isSeeking: false,
        progressText: stringifySecond(value),
      });
    },

    /**
     * 播放暂停
     */
    togglePlay: function() {
      const isPlaying = this.properties.isPlaying;

      this.triggerEvent('togglePlay', {
        isPlaying: !isPlaying
      });
      this.triggerEvent(isPlaying ? 'pause' : 'play');

      !this.data.hasPlayed && this.setData({
        hasPlayed: true
      });
    },

    /**
     * 全屏
     * !!!IMPORTANT: 因为小程序元素层级原因，video的层级最高，因此媒体控制组件在触发了video的全屏后需要开启video自带的控制条，不然会无法退出全屏
     */
    toggleFullScreen: function() {

      const isFullScreen = this.properties.isFullScreen;

      this.triggerEvent('toggleFullScreen', {
        isFullScreen: !isFullScreen
      });
      this.triggerEvent(isFullScreen ? 'exitFullScreen' : 'enterFullScreen');
    },

    /**
     * 更改播放速率
     */
    changeRate: function(e) {
      const rateArrIndex = e.detail.value;
      const rateArr = this.data.rateArr;
      const rate = +rateArr[rateArrIndex];
      this.setData({
        rateArrIndex
      })
      this.triggerEvent('changeRate', {
        rate,
      });
    },

    /**
     * 分辨率改变
     */
    changeResolution: function(e) {
      // 当前分辨率index
      const resolutionIndex = e.detail.value;
      this.triggerEvent('changeResolution', {
        resolutionIndex,
        resolution: this.properties.resolutionArr[resolutionIndex]
      });

      // 改变分辨率播放后需将播放速率重新置为设定的值
      const rateArr = this.data.rateArr;
      const rateArrIndex = this.data.rateArrIndex;
      const rate = +rateArr[rateArrIndex];
      wx.nextTick(() => {
        this.triggerEvent('changeRate', {
          rate,
        });
      });
    },
  }
})