// common/component/maskCover/maskCover.js
/**
 * @file 带蒙版的底部弹框
 * @author  yanlingling
 */
var store = require('../../store');
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        contentBottom: {
            type: Number,
            value: 0
        },
        show: {
            type: 'Boolean',
            value: false,
            observer: function (newVal, oldVal) {
                var me = this;
                if (newVal === true) {
                    setTimeout(function () {
                        var windowHeight = store.get('sysInfo.windowHeight');
                        var query = wx.createSelectorQuery().in(me);
                        query.select('#content').boundingClientRect();
                        query.exec(function (res) {
                            me.setData({
                                maskBottom: res[0].height
                            })
                        })
                    }, 0)
                }
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        maskBottom: 0,
        maskTop: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        maskTap: function () {
            var me = this;
            me.setData({
                show: false
            });
        }
    }
})
