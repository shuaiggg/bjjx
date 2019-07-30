// common/component/whiteboard/imageLayer/imageLayer.js
import getLanguage from '../../../language/main';
import info from '../../../info';
import playback from '../../../playback';
import eventEmitter from '../../../eventEmitter';
import whiteboardEventEmitter from '../eventEmitter';
Object.assign(eventEmitter, whiteboardEventEmitter);


const docData = playback.data.docData;
const pageData = playback.data.pageData;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageInfo: {
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {
        // 图片没有变化, 重连的时候图片不变会导致不加载画笔数据
        if (newVal.url && oldVal.url &&
          (newVal.url === oldVal.url) &&
          (newVal.width === oldVal.width) &&
          (newVal.height === oldVal.height)
        ) {
          eventEmitter
            .trigger(
              eventEmitter.CURRENT_DOC_IMAGE_LOAD_SUCCESS, {
                docId: newVal.docId,
                page: newVal.page,
                docPage: newVal.docPage,
                rawUrl: newVal.url
              }
            );
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    imgError: function(event) {
      const dataset = event.target.dataset;
      eventEmitter
        .trigger(
          eventEmitter.DOC_IMAGE_LOAD_FAIL, {
            docId: dataset.docid,
            page: dataset.page
          }
        );
      eventEmitter
        .trigger(
          eventEmitter.PAGE_CHANGE_END, {
            docId: dataset.docid,
            page: dataset.page
          }
        );
      this.triggerEvent('pageImageLoaded', event);
    },

    imgLoaded: function(event) {
      const dataset = event.target.dataset;
      eventEmitter
        .trigger(
          eventEmitter.CURRENT_DOC_IMAGE_LOAD_SUCCESS, {
            docId: dataset.docid,
            page: dataset.page,
            docPage: dataset.docpage,
            rawUrl: dataset.url
          }
        );

      eventEmitter.trigger(
        eventEmitter.PAGE_CHANGE_END
      );
      this.triggerEvent('pageImageLoaded', event);
    },

    /**
     * 设置当前页码，会加载对应的图片
     *
     * @param {Object} data
     */
    setPage: function(data, width, height) {

      const page = data.page;
      let doc = docData.getComplexPage(data.page);

      if (!doc) {
        eventEmitter.trigger(
          eventEmitter.DOC_IMAGE_NOT_FOUND, {
            page: page
          }
        );
      }

      // 文档的相对页码
      const docPage = doc.page;

      // 获得最原始的文档数据
      doc = docData.getDocumentById(doc.docId);


      return {
        page: page
      };
    }

  },

  ready: function() {
    eventEmitter
      .on(
        eventEmitter.DOC_IMAGE_LOAD_FAIL,
        function(event, data) {
          if (data.page === pageData.getClientPage()) {
            info.tip(getLanguage().IMAGE_LOAD_FAIL);
            eventEmitter.trigger(
              eventEmitter.CURRENT_DOC_IMAGE_LOAD_FAIL,
              data
            );
          }
        }
      );
  },


});