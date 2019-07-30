const common = require('../../utils/ajax.js')
const app = getApp()
import { $wuxActionSheet, $stopWuxRefresher, $wuxBackdrop } from '../components/index'

Page({
  data: { 
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: false,
      title: '首页',
      rotate: true
    },
    showMark: false,
    categoryId: '6',
    bannerInfo: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,
    activeColor: '#fff',
    liveCourse: [],
    course: [],
    freeCourse: [],
    nowTime: new Date().getTime(),
    categoryInfo: [],
    current: '',
    scrollTabs: false,
    distance: 0,
    swiperHeight: 150,
    intoView: '',
    isShowGuide: false,
    isAd: false,
    navigaHeight: 0,
    isIos: false,
    hideChat: false,
    isUpgrade: false,
    lineVersion: '',
    upgradeContent: [],
    examGuidance: 0
  },
  onLoad: function (options) {
    let that = this
    // 系统信息
    let systemInfo = app.globalData.systemInfo
    that.setData({
      navigaHeight: (systemInfo.statusBarHeight - 20) / (systemInfo.screenWidth / 750),
      isIos: systemInfo.isIos
    })
    that.askData()
    // 获取滚动触发位置
    var query = wx.createSelectorQuery()
    query.select('.page__bd').boundingClientRect(function (rect) {
      that.setData({
        distance: that.data.distance + rect.top
      })
    }).exec();

    //是否绑定过手机号
    common.ajax({
      url: 'api/checkPhoneBySign',
      askType: 'POST'
    }, {}, function (msg) {
      app.globalData.phoneNumber = msg.code === 200 ? msg.data.phone : ''
    })

      
  },
  onReady: function () {
    let that = this
    try {
      let guided1 = wx.getStorageSync('guided1')
      let isAd = that.data.isAd
      let localVersion = wx.getStorageSync('localVersion')
      
      if (typeof localVersion != 'number') {
        localVersion = localVersion.split('.')
        localVersion = parseInt(localVersion.join(''))
        console.log('本地版本号:' + localVersion)
      }

      if (!guided1) {
        throw new Error('未引导')
      }
      console.log(localVersion)
      if (!localVersion) {
        throw new Error('未更新')
      } else {
        common.ajax({
          url: 'api/Specialty/updatedInstructions',
          askType: 'POST'
        }, {}, function (msg) {
          if (msg.status === 200) {
            let temArr = msg.data.version.split('.')
            let lineVersion = parseInt(temArr.join(''))
            that.setData({
              lineVersion: lineVersion,
              isUpgrade: localVersion < lineVersion ? true : false,
              upgradeContent: msg.data.content.split('&&')
            })
          }
        })
        
      }
    } catch (e) {
      console.log(e.message)
      if (e.message === '未引导') {
        that.setData({
          isShowGuide: true
        })
      } else if (e.message === '未更新') {
        common.ajax({
          url: 'api/Specialty/updatedInstructions',
          askType: 'POST'
        }, {}, function (msg) {
          if (msg.status === 200) {
            let temArr = msg.data.version.split('.')
            let lineVersion = parseInt(temArr.join(''))
            that.setData({
              lineVersion: lineVersion,
              isUpgrade: true,
              upgradeContent: msg.data.content.split('&&')
            })
          }
        })
      }
    }

    this.header = this.selectComponent("#header");    
  },
  onShow: function () { 
    let that = this
    // 如果选择的科目发生变化则重新请求数据
    if (app.globalData.refreshFlag) {
      wx.getStorage({
        key: 'newcategory',
        success: function (res) {
          var str = "header.title"
          that.setData({
            [str]: res.data.categoryName,
            categoryId: res.data.categoryId
          })
          that.askData()
        }
      })
      app.globalData.refreshFlag = false
    }

    //如果来自查看优选班级
    if (app.globalData.isGoodClass) {
      let categoryInfo = that.data.categoryInfo
      let temId = null
      for (let i = 0; i < categoryInfo.length; i++) {
        if (categoryInfo[i].name.indexOf('商城') >= 0) {
          temId = categoryInfo[i].categoryId
          break;
        }
        temId = categoryInfo[0].categoryId
      }
      that.coursesCallBack(temId)
    }
  },
  imageLoad: function (e) {
    var that = this
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      ratio = imgwidth / imgheight;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          swiperHeight: (res.screenWidth - 20) / ratio
        })
      }
    }) 
  },
  onShareAppMessage: function (res) {
    return {
      title: '化繁为简，为梦而学',
      path: '/pages/coursesList/coursesList',
      imageUrl: 'https://wx.jianxuejy.net/static/banner/share.jpg'
    }
  },
  onPulling: function () {
  },
  onRefresh: function () {
    setTimeout(() => {
      $stopWuxRefresher()
      wx.showToast({
        title: '刷新成功',
        icon: 'none',
        duration: 1000
      })
    }, 1500)
  },
  onPageScroll: function (e) {
    if (e.scrollTop >= this.data.distance + this.data.swiperHeight) {
      this.setData({
        scrollTabs: true
      })
    }
    if (e.scrollTop < this.data.distance + this.data.swiperHeight) {
      this.setData({
        scrollTabs: false
      })
    }
  },
  onChange: function (e) {
    var that = this
    that.setData({
      current: e.detail.key
    })
    that.askCourses()
  },
  showActionSheet: function () {
    var that = this
    if (that.data.showMark === false) {
      that.header.showRotate();
      wx.getStorage({
        key: 'allcategorys',
        success: function (res) {
          $wuxActionSheet().showSheet({
            theme: 'wx',
            titleText: '选择类目',
            buttons: res.data,
            buttonClicked(index, item) {
              that.header.colseRotate()
              var str = "header.title"
              that.setData({
                [str]: item.text
              })
              var category = {}
              category.categoryId = item.categoryId
              category.categoryName = item.text
              
              wx.setStorage({
                key: 'newcategory',
                data: category,
                success: function (res) {
                  that.setData({
                    showMark: false,
                    categoryId: item.categoryId
                  });
                  that.askData()
                }
              })
              return true
            },
            cancel: function () {
              that.header.colseRotate()
              that.setData({
                showMark: !that.data.showMark
              })
            }
          })
        }
      })      
    } else {
      $wuxActionSheet().removeSheet(function (e) {
        that.header.colseRotate()
      })
    }
    that.setData({
      showMark: !that.data.showMark
    })
  },
  askData: function () {
    var that = this
    //获取选择过de科目
    wx.getStorage({
      key: 'newcategory',
      success: function (res) {
        var str = "header.title"
        that.setData({
          [str]: res.data.categoryName,
          categoryId: res.data.categoryId
        })
        that.successCallBack(res.data.categoryId)
      },
      fail: function () {
        console.log('没存所选分类，使用默认')
        that.successCallBack(6)
      }
    })  
  },
  askCourses: function (e) {
    let temId = e.currentTarget.dataset.into
    this.coursesCallBack(temId)
  },
  coursesCallBack(e) {
    let that = this
    common.ajax({
      url: 'api/getCourseByCategoryId',
      askType: 'POST'
    }, {
      categoryId: e
    }, function (msg) {
      if (msg.code === 200) {
        that.setData({
          freeCourse: msg.data,
          current: e,
          intoView: 'id' + e
        })
      } else {
        console.log('数据请求失败')
      }
    })
  },
  goPlayBackPay: function (e) {
    var that = this
    var serial = e.currentTarget.dataset.serial
    var temJson = that.data.freeCourse[serial]
    wx.navigateTo({
      url: '../playback/playback?type=2&id=' + temJson.id
    })
  },
  jumpTo(e) {
    var jumpto = e.currentTarget.dataset.jumpto
    if (jumpto.indexOf('../') > -1) {
      wx.navigateTo({
        url: jumpto
      })
    }
    if (jumpto.indexOf('miniProgram') > -1) {
      this.onTabItemTap()
    }
  },
  closeGuide() {
    let that = this
    wx.setStorage({
      key: 'guided1',
      data: 'ok',
      success: function (res) {
        that.setData({
          isShowGuide: false
        })
      }
    })
  },
  closeAD() {
    let that = this
    that.setData({
      isAd: false
    })  
  },
  closeUpgrade() {
    let that = this
    wx.setStorage({
      key: 'localVersion',
      data: that.data.lineVersion,
      success: function (res) {
        that.setData({
          isUpgrade: false
        })
      }
    })
  },
  hideChat() {
    this.setData({
      hideChat: !this.data.hideChat
    })
  },
  successCallBack(e) {
    let that = this
    let userInfoName = app.globalData.userInfo.nickName
    common.ajax({
      url: 'api/index',
      askType: 'GET'
    }, {
      categoryId: e,
      userInfoName: userInfoName ? userInfoName : '',
      userInfoHeader: app.globalData.userInfo.avatarUrl
    }, function (msg) {
      if (msg.code === 200) {
        var live = msg.data.livecourseInfo.liveingCourse
        var future = msg.data.livecourseInfo.futureCourse

        if (live.length > 0 || future.length > 0) {
          var temArr = []
          for (var i = 0; i < live.length; i++) {
            var temJson = {}
            temJson.playTime = live[i].beginTime
            temJson.peopleNum = live[i].reserveNum
            temJson.playType = 1
            temJson.playImg = live[i].picture
            temJson.playTitle = live[i].title
            temJson.id = live[i].id
            temArr.push(temJson)
          }
          for (var i = 0; i < future.length; i++) {
            var temJson = {}
            temJson.playTime = future[i].beginTime
            temJson.peopleNum = future[i].reserveNum
            temJson.playType = 2
            temJson.playImg = future[i].picture
            temJson.playTitle = future[i].title
            temJson.id = future[i].id
            temArr.push(temJson)
          }

          that.setData({
            liveCourse: temArr,
            freeCourse: msg.data.courseInfo,
            bannerInfo: msg.data.bannerInfo,
            categoryInfo: msg.data.categoryInfo,
            current: msg.data.categoryInfo[0].categoryId
          })
        } else {
          that.setData({
            liveCourse: msg.data.livecourseInfo.backCourse,
            freeCourse: msg.data.courseInfo,
            bannerInfo: msg.data.bannerInfo,
            categoryInfo: msg.data.categoryInfo,
            current: msg.data.categoryInfo[0].categoryId
          })
        }

        // 请求是否显示专业指导
        common.ajax({
          url: 'api/Specialty/getCategoryGuidance',
          askType: 'POST'
        }, { categoryId: that.data.categoryId }, function (msg) {
          if (msg.status === 200) {
            that.setData({
              examGuidance: msg.data.is_release
            })
          }
        })  

      } else {
        wx.showToast({
          title: '网络繁忙',
          icon: 'none',
          duration: 1000
        });
      }
    })
  },
  onTabItemTap(item) {
    if (item.index === 3) {
      wx.navigateToMiniProgram({
        appId: 'wxe4482346c7bef727',
        path: '',
        envVersion: 'develop',
        success(res) {}
      })
    }
  }
})