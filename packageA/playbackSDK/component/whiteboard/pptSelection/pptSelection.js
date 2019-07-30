import playback from '../../../playback';

const eventEmitter = playback.eventEmitter;
const pageData = playback.data.pageData;
const docData = playback.data.docData;
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        currentPage: {
            type: Number,
            value: 0,
            abserver: function (newVal, oldVal) {
                this.refreshList();
            }
        },

        styleInfo: {
            type: Object,
            value: {
                imageWidth: 80,
                imageHeight: 60
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        pptList: []
    },

    ready: function () {
        eventEmitter
            .on(
                eventEmitter.SERVER_PAGE_CHANGE,
                (e, data) => {
                    this.setData({
                        currentPage: docData.getSimplePage(data.docId, data.page).page
                    });
                    this.refreshList();
                }
            )
            .on(
                eventEmitter.CLIENT_PAGE_CHANGE,
                (e, data) => {
                    this.setData({
                        currentPage: docData.getSimplePage(data.docId, data.page).page
                    });
                    this.refreshList();
                }
            )
            .on(
                eventEmitter.DOC_REMOVE,
                () => {
                    this.refreshList();
                }
            )
            .on(
                eventEmitter.DOC_ADD,
                () => {
                    this.refreshList();
                }
            );
    },

    /**
     * 组件的方法列表
     */
    methods: {
        refreshList: function () {
            wx.nextTick(() => {
                const pptList = pageData.getPageList(pageData.getServerPage());
                const currentPage = this.data.currentPage;
                for (let i = 0, item; item = pptList[i++];) {
                    if (item.page === currentPage) {
                        item.activeClass = 'active';
                    }
                    else {
                        item.activeClass = '';
                    }
                }
                this.setData({
                    pptList: pptList
                });
            });
        },
        onImageTap: function (event) {
            console.log('pptSelection onImageTap');
            this.triggerEvent('pptImageTap', {
                item: event.currentTarget.dataset.item
            });
        }
    }
});
