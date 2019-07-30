// common/component/whiteboard/canvasLayer/canvasLayer.js
const painter = require('./painter');
import shapeData from '../../../data/shape';
import docData from '../../../data/doc';
import pageData from '../../../data/page';
import auth from '../../../auth';
import config from '../../../config';
import eventEmitter from '../../../eventEmitter';
import whiteboardEventEmitter from '../eventEmitter';

Object.assign(eventEmitter, whiteboardEventEmitter);

const language = require('../../../language/main')();
let cursorAutoHideTimer;
let canvasWidth;
let canvasHeight;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    styleInfo: {
      type: 'Object',
      value: {
        backgroundColor: 'black',
        pageCountColor: 'white',
        pageCountBackground: '#C2C0C1',
        isHide: false
      }
    },
    pageInfo: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {
        const context = wx.createCanvasContext('doc-canvas', this);
        if (newVal.docId && !oldVal.docId) {
          const pageInfo = newVal;
          painter.init(
            context,
            pageInfo.width,
            pageInfo.height
          );
        }
        if (newVal.docId) {
          canvasWidth = newVal.width;
          canvasHeight = newVal.height;
        }
        if (newVal.width && oldVal.width) {
          if ((newVal.width !== oldVal.width) ||
            (newVal.height !== oldVal.height)) {
            setTimeout(() => {
              this.resize(newVal.width, newVal.height);
            }, 100);
          }
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    laserStyle: {},
    language: language,
    showCanvas: true,
    showLaser: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 重置画布大小
     *
     * @param {number} width
     * @param {number} height
     */
    resize: function(width, height) {
      painter.resize(
        width,
        height
      );
    },

    /**
     * 设置当前页码，会加载对应的标注数据
     *
     * @param {number} page
     */
    setPage: function(page) {
      eventEmitter.trigger(
        eventEmitter.PAGE_SHAPE_LOAD_START
      );

      const doc = docData.getComplexPage(page);

      shapeData
        .load(doc.docId, doc.page)
        .then(function(shapeList) {
          if (page === pageData.getClientPage()) {
            painter.create(shapeList);
            eventEmitter.trigger(
              eventEmitter.CURRENT_PAGE_SHAPE_LOAD_END
            );
          }

          eventEmitter.trigger(
            eventEmitter.PAGE_SHAPE_LOAD_END
          );

        });
    },
    hideLaser: function() {
      this.setData({
        showLaser: false
      });
    },
  },

  ready: function() {
    eventEmitter
      .on(
        eventEmitter.CURRENT_DOC_IMAGE_LOAD_SUCCESS,
        () => {
          wx.nextTick(() => {
            // 异步执行,否则重连时候,画笔画的逻辑会先于擦除的逻辑,画完又被擦掉了。。
            this.setPage(
              pageData.getClientPage()
            );
          });
        }
      )
      .on(
        eventEmitter.CLEAR_CANVAS,
        () => {
          painter.clear();
        }
      )
      .on(
        eventEmitter.SHAPE_LASER,
        (event, data) => {

          if (auth.isSelf(data.fromId) ||
            pageData.getClientPage() !== pageData.getServerPage()
          ) {
            return;
          }

          const shape = data.shape;
          this.setData({
            laserStyle: {
              left: shape.x * canvasWidth,
              top: shape.y * canvasHeight,
            },
            showLaser: true
          });

          // 当一定时间未接收到时，自动隐藏
          if (cursorAutoHideTimer) {
            clearTimeout(cursorAutoHideTimer);
          }

          cursorAutoHideTimer = setTimeout(
            () => {
              this.hideLaser();
              cursorAutoHideTimer = null;
            },
            config.LASER_TIME_OUT
          );
        }
      )
      .on(eventEmitter.PLAYBACK_VIDEO_FULLSCREEN, (event, data) => {
        this.setData({
          showCanvas: !data.fullScreen
        })
      });
  }
});