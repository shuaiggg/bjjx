const common = require('../../utils/ajax.js')
const getPhone = require('../../utils/getPhoneNumber.js')
import { $wuxActionSheet, $stopWuxRefresher, $wuxBackdrop } from '../components/index'
const app = getApp()

Page({
  data: {
    baseUrl: app.globalData.baseUrl,
    header: {
      iconShow: true,
      title: '考试详情',
      isPlaceholder: true
    },
    categoryId: null,
    tabArr: [],
    sliderArr: [],
    active: 0,
    phoneNumber: '',
    isAlert: false,
    mall_status: 0
  },
  onLoad: function (options) {
    let that = this
    common.ajax({
      url: 'api/Specialty/getCategoryGuidance',
      askType: 'POST'
    }, { categoryId: options.categoryId }, function (msg) {
      if (msg.status === 200) {
        let resArr = msg.data.img
        let swiperArr = new Array(resArr.length)
        let tabArr = new Array(resArr.length)

        for (let i = 0; i < resArr.length; i++) {
          let temStr = ''
          switch (resArr[i].status) {
            case 1:
              temStr = '了解考试'
              break;
            case 2:
              temStr = '价值和前景'
              break;
            case 3:
              temStr = '报考条件'
              break;
            case 4:
              temStr = '考试科目'
              break;
            case 5:
              temStr = '题型与分值'
              break;
            default:
              temStr = '学习规划'
          }
          swiperArr[resArr[i].status - 1] = resArr[i]
          tabArr[resArr[i].status - 1] = temStr
        }

        that.setData({
          tabArr: tabArr,
          sliderArr: swiperArr,
          phoneNumber: app.globalData.phoneNumber,
          categoryId: options.categoryId,
          mall_status: msg.data.mall_status
        })
      }
    })
  },
  stopTouchMove(e) {
    return false;
  },
  clickTab(e) {
    this.setData({
      active: e.currentTarget.dataset.num
    })
  },
  sliderChange(e) {
    this.setData({
      active: e.detail.current
    })
  },
  getPhoneNumber(e) {
    let that = this
    if (that.data.phoneNumber === '') {
      getPhone.getPhoneNumber(e, function (msg) {
        that.setData({
          phoneNumber: msg
        })
        app.globalData.phoneNumber = msg
        that.connect()
      })
    }
  },
  connect() {
    let that = this
    common.ajax({
      url: 'api/Specialty/createConsultinginfo',
      askType: 'POST'
    }, { categoryId: that.data.categoryId }, function (msg) {
      if (msg.status === 200) {
        that.$wuxBackdrop = $wuxBackdrop()
        that.$wuxBackdrop.retain()
        that.setData({
          isAlert: true
        })

        setTimeout(function(){
          that.closeAlert()
        },3000)
      }
    })
  },
  closeAlert() {
    this.$wuxBackdrop.release()
    this.setData({
      isAlert: false
    })
  },
  goBack() {
    app.globalData.isGoodClass = true
    wx.navigateBack()
  },
  onTabItemTap: function (item) {
    if (item.index === 2) {
      console.log(item)
      wx.navigateToMiniProgram({
        appId: 'wxe4482346c7bef727',
        path: '',
        envVersion: 'develop',
        success(res) {
          // 打开成功
        }
      })
    }
  }
})