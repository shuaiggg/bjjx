import config from '../../config';
import docData from '../../data/doc';
import pageData from '../../data/page';
import loading from './loading';
import eventEmitter from '../../eventEmitter';
import whiteboardEventEmitter from './eventEmitter';
Object.assign(eventEmitter, whiteboardEventEmitter);

import getDocumentImageDimension from '../../function/getDocumentImageDimension';


const pageInfo = {};

let touchTime = 0;
let touchDot = 0; //触摸时的原点
let touchInterval = '';
let loadedImageUrl;
let pageChangeData;
const systemInfo = wx.getSystemInfoSync();


function pageEnd(me) {
  eventEmitter.trigger(
    eventEmitter.PAGE_CHANGE_END,
    pageInfo
  );
}


function changePage(page, step) {
  const pageInfo = docData.getComplexPage(page);
  eventEmitter.trigger(
    eventEmitter.PAGE_CHANGE_TRIGGER, {
      docId: pageInfo.docId,
      page: pageInfo.page,
      step: step
    }
  );
}


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    canChangePage: {
      type: Boolean,
      value: false
    },
    canUsePptSelection: {
      type: Boolean,
      value: true
    },
    size: {
      type: Object,
      value: {
        width: systemInfo.windowWidth,
        height: Math.ceil(systemInfo.windowWidth * 3 / 4),
      },
      observer: function(newVal, oldVal) {
        if (newVal && oldVal) {
          eventEmitter.trigger(eventEmitter.WHITEBOARD_RESIZE);
        }
      }
    },
    styleInfo: {
      type: 'Object',
      value: {
        backgroundColor: 'black',
        pageCountColor: 'white',
        pageCountBackground: '#C2C0C1',
        isHide: false
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pageInfo: {},
    currentPage: 0,
    showPptSelection: true,
    showNext: true,
    showPrev: true,
  },


  ready: function() {
    const me = this;

    this.setData({
      pageInfo: Object.assign({}, pageInfo)
    });

    eventEmitter
      .on(
        eventEmitter.PAGE_PREV_TRIGGER,
        function() {
          if (pageData.prevPage()) {
            changePage(
              pageData.getClientPage()
            );
          }
        }
      )
      .on(
        eventEmitter.PAGE_NEXT_TRIGGER,
        function() {
          if (pageData.nextPage()) {
            changePage(
              pageData.getClientPage()
            );
          }
        }
      );

    loading.init();


    function pageStart(event, data) {

      const docId = data.docId;
      const docPage = data.page;

      const rawDoc = docData.getDocumentById(docId);

      // 兼容回放
      if (!rawDoc) {
        return;
      }
      Object.assign(pageInfo, rawDoc.pageList[docPage]);


      function getDimensionCallback(dimension) {
        const page = docData.getSimplePage(docId, docPage).page;
        pageInfo.docId = docId;
        pageInfo.docPage = docPage;
        pageInfo.page = page;
        pageInfo.rawWidth = +pageInfo.width;
        pageInfo.rawHeight = +pageInfo.height;

        loadedImageUrl = null;

        pageChangeData = pageInfo;
        pageInfo.hasPrevPage = pageData.hasPrevPage(page);
        pageInfo.hasNextPage = pageData.hasNextPage(page);
        pageInfo.width = dimension.width;
        pageInfo.height = dimension.height;
        const dataToSet = {
          pageInfo: pageInfo
        };
        me.setData(dataToSet);
        eventEmitter.trigger(
          eventEmitter.PAGE_CHANGE_START,
          pageInfo
        );
      }

      me.getImageDimension(pageInfo.width, pageInfo.height, getDimensionCallback);
    }

    eventEmitter
      .on(
        eventEmitter.SERVER_PAGE_CHANGE,
        pageStart
      )
      .on(
        eventEmitter.CLIENT_PAGE_CHANGE,
        pageStart
      )
      .on(
        eventEmitter.CURRENT_PAGE_SHAPE_LOAD_END,
        pageEnd
      )
      .on(
        eventEmitter.CURRENT_DOC_IMAGE_LOAD_SUCCESS,
        function(event, data) {

          const rawUrl = data.rawUrl;
          if (rawUrl !== loadedImageUrl) {
            loadedImageUrl = rawUrl;
            pageEnd();
          }
        }
      )
      .on(
        eventEmitter.DOC_QUALITY_CHANGE_TRIGGER,
        function(event, data) {
          const value = +data.value;
          if (value !== docData.getQuality()) {
            data.value = value;
            docData.setQuality(value);
            exports.refresh();
            eventEmitter.trigger(
              eventEmitter.DOC_QUALITY_CHANGE,
              data
            );
          }
        }
      )
      .on(
        eventEmitter.WHITEBOARD_RESIZE,
        function(e, data) {
          me.resize();
        }
      );
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getImageDimension: function(imageWidth, imageHeight, callback) {
      const data = this.data;
      const dimension = getDocumentImageDimension(
        data.size.width,
        data.size.height,
        imageWidth,
        imageHeight,
        docData.getFit(),
        true,
        1
      );
      callback(dimension, pageInfo);
    },
    resize: function() {
      if (pageInfo.rawWidth === undefined || pageInfo.rawHeight === undefined) {
        return;
      }
      console.log('whiteboard resize');
      this.getImageDimension(pageInfo.rawWidth, pageInfo.rawHeight, dimension => {
        pageInfo.width = dimension.width;
        pageInfo.height = dimension.height;
        // DOM刷新在下一时序
        wx.nextTick(()=> {
          this.setData({
            pageInfo,
          });
        });
      });
    },

    touchStart: function(e) {
      console.log('touchStart');
      if (!this.data.canChangePage) {
        return;
      }
      touchDot = e.touches[0].pageX;
      touchInterval = setInterval(function() {
        touchTime++;
      }, 100);
    },
    showNext: function() {
      this.setData({
        showNext: true
      });
      setTimeout(() => {
        this.setData({
          showNext: false
        });
      }, 500);
    },
    showPrev: function() {

      this.setData({
        showPrev: true
      });
      setTimeout(() => {
        this.setData({
          showPrev: false
        });
      }, 500);
    },
    // 触摸结束事件
    touchEnd: function(e) {
      console.log('touch end');
      if (!this.data.canChangePage) {
        return;
      }
      const touchMove = e.changedTouches[0].pageX;
      if (touchMove - touchDot <= -config.TOUCH_DISTANCE && touchTime < config.TOUCH_TIME) {
        this.showNext();
        eventEmitter.trigger(
          eventEmitter.PAGE_NEXT_TRIGGER
        );
      }
      if (touchMove - touchDot >= config.TOUCH_DISTANCE && touchTime < config.TOUCH_TIME) {
        this.showPrev();
        eventEmitter.trigger(
          eventEmitter.PAGE_PREV_TRIGGER
        );
      }
      clearInterval(touchInterval); // 清除setInterval
      touchTime = 0;
    },


    onWhiteboardTap: function() {
      console.log('onWhiteboardTap');
      this.triggerEvent('whiteboardTap');
    },

    onPptImageTap: function(event) {
      if (!this.data.canChangePage) {
        return;
      }
      const item = event.detail.item;
      const pageInfo = docData.getComplexPage(item.page);
      eventEmitter.trigger(
        eventEmitter.CLIENT_PAGE_CHANGE, {
          docId: pageInfo.docId,
          page: pageInfo.page
        }
      );
    }
  }
});