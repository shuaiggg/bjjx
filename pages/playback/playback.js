 // pages/playback/playback.js
const app = getApp()
import $wuxPrompt from '../common/prompt/prompt'
const common = require('../../utils/ajax.js')
const getPhone = require('../../utils/getPhoneNumber.js')
import { $wuxBackdrop } from '../components/index'

Page({
  data: {
    baseUrl: 'https://wx.jianxuejy.net',
    header: {
      iconShow: true,
      title: '课程详情',
      isPlaceholder: false
    },
    videoUrl: '',
    frontCover: '',
    classTitle: '',
    lessonInfo: [],
    salePrice: 0,
    falseCover: '',
    lessonId: '',
    aboutImg: '',
    techerImg: '',
    showAa: true,
    phoneNum: '',
    downLink: '',
    isShowLink: false,
    isShow: false,
    btnText: '',
    tabs: ["课程详情", "课程评论"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 86,
    isShowGuide: false,
    guidePosition: 0,
    lessonInfoCanShare: false,
    isIos: false,
    catalogType: true,
    commentValue: '',
    commentArr: [],
    showCommentForm: false,
    toggleIcon: 'vertical_icon',
    pageBody: 0,
    scrollTop: 960
  },
  onLoad: function (options) {
    var that = this
    //设置分享群标志
    wx.showShareMenu({
      withShareTicket: true
    })

    if (options.q) {
      console.log("url=" + decodeURIComponent(options.q))
    }
    that.setData({
      lessonId: options.id
    })
    console.log('手机号：' + app.globalData.phoneNumber)
    //是否绑定过手机号
    if (app.globalData.phoneNumber === '') {
      that.setData({
        showAa: false
      })
    } else {
      that.setData({
        phoneNum: app.globalData.phoneNumber
      })
    }
    
    //是否来自banner
    console.log(options)
    var item = ''
    if (options.item) {
      item = options.item 
    }

    //请求课程详情
    common.ajax({
      url: 'api/getCourseInfoById',
      askType: 'POST'
    },{
      courseId: options.id,
      item: item
    }, function (msg) {
      if (msg.code === 200) {
        var temLesson = msg.data[0].lessonInfo
        var lessonInfoCanShare = false
        for (var i = 0; i < temLesson.length; i++) {
          if (temLesson[i].shareStatus === 'Yes') {
            lessonInfoCanShare = true
            break
          }
        }
        var temShow = null
        var temText = null
        if (msg.data[0].courseStatus === 'learn') {
          temShow = false
        } else if (msg.data[0].courseStatus === 'buy')  {
          temShow = true
          temText = '立即报名'
        } else {
          temShow = true
          temText = '分享解锁'
          //是否显示guided2引导蒙版
          // wx.getStorage({
          //   key: 'guided2',
          //   success: function (res) {
          //   },
          //   fail: function () {
          //     console.log('查找失败')
          //     that.$wuxBackdrop = $wuxBackdrop()
          //     that.$wuxBackdrop.retain()
          //     that.setData({
          //       isShowGuide: true
          //     })
          //   }
          // })
        }

        that.setData({
          classTitle: msg.data[0].title,
          frontCover: msg.data[0].largePicture,
          falseCover: msg.data[0].largePicture,
          lessonInfo: msg.data[0].lessonInfo,
          salePrice: msg.data[0].salePrice,
          // aboutImg: msg.data[0].about,
          teacherImg: msg.data[0].teacherImg,
          downLink: msg.data[0].file,
          btnText: temText,
          isShow: temShow,
          lessonInfoCanShare: lessonInfoCanShare
        })
      }
    })

    //请求课程评论
    common.ajax({
      url: 'api/Comments/getCommentsInfo',
      askType: 'POST'
    }, {
      courseId: that.data.lessonId
    }, function (msg) {
      if (msg.status === 200) {
        that.setData({
          commentArr: msg.data
        })
      }
    })

    //请求课程详情图片
    common.ajax({
      url: 'api/Specialty/getCourseDetails',
      askType: 'POST'
    }, {
      courseId: that.data.lessonId
    }, function (msg) {
      if (msg.status === 200) {
        that.setData({
          aboutImg: msg.data
        })
      }
    })

    $wuxPrompt.init('msg1', {
      title: '空空如也',
      text: '暂时没有相关数据',
    }).show()
  },
  onReady: function (res) {
    var that = this
    //视频组件
    that.videoContext = wx.createVideoContext('myVideo')
    // 获取蒙版定位位置
    let systemInfo = app.globalData.systemInfo
    var statusBar = 0
    if (systemInfo.statusBarHeight > 20) {
      statusBar = systemInfo.statusBarHeight
    }
    that.setData({
      guidePosition: systemInfo.screenHeight * 0.47 + 86 - statusBar,
      isIos: systemInfo.isIos
    })
   
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id,
      showCommentForm: e.currentTarget.id === '1' ? true : false
    });
   
  },
  doPlay: function (e) {
    var that = this
    wx.getNetworkType({
      success: function (res) {
        if (res.networkType !== 'wifi') {
          wx.showModal({
            title: '提示',
            content: '当前使用的是移动网络，是否继续观看?',
            success: function (res) {
              if (res.confirm) {
                common.ajax({
                  url: 'api/getLessonUrlByMediaId',
                  askType: 'POST'
                }, {
                    mediaId: e.currentTarget.dataset['mediaid']
                  }, function (msg) {
                    if (msg.code === 200) {
                      that.setData({
                        videoUrl: msg.data.url,
                      })
                    }
                })
              }
            }
          })
        } else {
          common.ajax({
            url: 'api/getLessonUrlByMediaId',
            askType: 'POST'
          }, {
            mediaId: e.currentTarget.dataset['mediaid']
          }, function (msg) {
            if (msg.code === 200) {
              that.setData({
                videoUrl: msg.data.url,
              })
            }
          })
        }      
      }
    }) 
  },
  doLive: function (e) {
    var that = this
    var serile = e.currentTarget.dataset['serile']
    var tem = that.data.lessonInfo[serile]

    common.ajax({
      url: 'api/live/lessonlive',
      askType: 'POST'
    }, {
      lessonId: tem.id
    }, function (msg) {
      if (msg.code === 200) {
        // 有token说明是百家云回放回放
        if (msg.data.token) {
          wx.navigateTo({
            url: '/packageA/pages/playback/playback?parameter=' + JSON.stringify(msg.data)
          })
        } else {
          wx.navigateTo({
            url: '/packageB/pages/teacherPlayer/teacherPlayer?parameter=' + JSON.stringify(msg.data)
          })
        }
      }
    })
  },
  doPrompt: function (e) {
    let serile = e.currentTarget.dataset['serile']
    let temJson = this.data.lessonInfo[serile]
    let title = ''
    if (temJson.shareStatus === 'Yes' && temJson.free === 0) {
      title = '点击分享按钮解锁试听哦'
    } else {
      title = '亲，先报名哦'
    }

    this.myToast(title, 3000)
  },
  getPhoneNumber: function (e) {
    var that = this
    getPhone.getPhoneNumber(e, function (msg) {
      that.setData({
        showAa: true,
        phoneNum: msg
      })
    })
  },
  onShareAppMessage: function (res) {
    let that = this
    let shareFn = null
    let shareTitle = ''

    if (res.from === 'button') {
      // 课程分享
      if (res.target.id === 'courseShare') {
        shareTitle = that.data.classTitle
        common.ajax({
          url: 'api/course/courseShare',
          askType: 'POST'
        }, {
          courseId: that.data.lessonId
        }, function (msg) {
          if (msg.code === 200) {
            that.setData({
              isShow: false,
              btnText: ''
            })
            console.log('课程分享成功')
          } else {
            console.log('课程分享失败')
          }
        })
      } else {
        // 课时分享
        let temNum = res.target.dataset['serile']
        shareTitle = that.data.lessonInfo[temNum].title
        common.ajax({
          url: 'api/lesson/lessonShare',
          askType: 'POST'
        }, {
          courseId: that.data.lessonId,
          lessonId: res.target.dataset['sectionid']
        }, function (msg) {
          if (msg.code === 200) {
            var str = "lessonInfo[" + temNum + "].free"
            that.setData({
              [str]: 1
            })
            console.log('课时分享成功')
          } else {
            console.log('课时分享成功')
          }
        })
      }
    }
    
    return {
      title: '赠送你一节简学课程，分享即可解锁:' + shareTitle,
      path: '/pages/playback/playback?id=' + that.data.lessonId,
      imageUrl: that.data.baseUrl + that.data.falseCover
    }
  },
  release: function (e) {
    console.log(e.currentTarget.dataset['guided'])
    var that = this
    var temKey = null
    if (e.currentTarget.dataset['guided'] === 'guided2') {
      temKey = 'guided2'
    } else {
      temKey = 'guided3'
    }
    
    wx.setStorage({
      key: temKey,
      data: 'ok',
      success: function (res) {
        that.$wuxBackdrop.release()
        that.setData({
          isShowGuide: false
        })
      },
      fail: function () {
        console.log('guided储存失败')  
      }
    }) 
  },
  goPay: function () {
    var that = this
    console.log(that.data.lessonId)
    wx.navigateTo({
      url: '../pay/pay?lessonId=' + that.data.lessonId
    })
  },
  toggle() {
    this.setData({
      catalogType: !this.data.catalogType,
      toggleIcon: this.data.toggleIcon === 'vertical_icon' ? 'horizontal_icon' : 'vertical_icon'
    })
  },
  downApp() {
    wx.showModal({
      title: '提示',
      content: '下载简学教育APP，学习更多课程',
      showCancel: false
    })
  },
  doComment: function (e) {
    let that = this
    let systemInfo = app.globalData.systemInfo

    if (systemInfo.isIos) {
      that.myToast('IOS暂不支持')
      return false
    }
    if (that.data.commentValue === '') {
      that.myToast('评论不可为空')
      return false
    }
    if (that.data.btnText === '立即报名') {
      that.myToast('购买之后才可评论呦！')
      return false
    }
    
    common.ajax({
      url: 'api/Comments/createComment',
      askType: 'POST'
    }, {
      courseId: that.data.lessonId,
      comments: that.data.commentValue
    }, function (msg) {
      if (msg.status === 200) {
        let temJson = {
          nickName: app.globalData.userInfo.nickName,
          header_img: app.globalData.userInfo.avatarUrl,
          content: that.data.commentValue,
          create_time: '现在',
          children: []
        }
        that.data.commentArr.unshift(temJson)
        that.setData({
          commentArr: that.data.commentArr
        })
        that.myToast('为遵守国家法律，评论需要审核之后才能被大家看到！', 4000)
        that.setData({
          commentValue: ''
        })
      }
    })

  },
  changeBlur: function (e) {
    this.setData({
      commentValue: e.detail.value
    })
  },
  imageLoad: function (e) {
    let systemInfo = app.globalData.systemInfo
    let imgwidth = e.detail.width,
        imgheight = e.detail.height,
        ratio = imgwidth / imgheight;
    imgheight = Math.floor(systemInfo.screenWidth / ratio) 
    let navigaHeight = systemInfo.statusBarHeight + 44
    this.setData({
      pageBody: systemInfo.screenHeight - imgheight - navigaHeight
    })
  },
  myToast(e, t=2000) {
    wx.showToast({
      title: e,
      icon: 'none',
      duration: t
    })
    setTimeout(function () {
      wx.hideToast()
    }, t)
  }
})