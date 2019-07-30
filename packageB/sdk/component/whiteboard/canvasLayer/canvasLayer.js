var cursorAutoHideTimer, canvasWidth, canvasHeight, painter = require("./painter"),
  eventEmitter = require("../../../eventEmitter"),
  shapeData = require("../../../data/shape"),
  docData = require("../../../data/doc"),
  pageData = require("../../../data/page"),
  auth = require("../../../auth"),
  config = require("./config"),
  language = require("../../../language/main")();
Component({
  properties: {
    canDraw: {
      type: Boolean,
      value: !0,
      observer: function(e, t) {
        console.log("can draw"), console.log(e)
      }
    },
    drawing: {
      type: Boolean,
      value: !1,
      observer: function(e, t) {
        void 0 !== typeof e && void 0 !== typeof t && painter && painter.draw(e)
      }
    },
    pageCount: {
      type: String,
      value: ""
    },
    showClear: {
      type: Boolean,
      value: !0
    },
    showPageCount: {
      type: Boolean,
      value: !1
    },
    finished: {
      type: Boolean,
      value: !1
    },
    styleInfo: {
      type: "Object",
      value: {
        backgroundColor: "black",
        pageCountColor: "white",
        pageCountBackground: "#C2C0C1",
        isHide: false
      }
    },
    pageInfo: {
      type: Object,
      value: {},
      observer: function(e, t) {
        var a = this,
          n = wx.createCanvasContext("doc-canvas", a);
        if (e.docId && !t.docId) {
          var i = e;
          painter.init(n, i.width, i.height)
        }
        e.docId && (canvasWidth = e.width, canvasHeight = e.height), e.width && t.width && (e.width == t.width && e.height == t.height || setTimeout(function() {
          a.resize(e.width, e.height)
        }, 100))
      }
    }
  },
  data: {
    laserStyle: {},
    language: language,
    showLaser: !1
  },
  methods: {
    resize: function(e, t) {
      painter.resize(e, t)
    },
    setPage: function(t) {
      eventEmitter.trigger(eventEmitter.PAGE_SHAPE_LOAD_START);
      var e = docData.getComplexPage(t);
      shapeData.load(e.docId, e.page).done(function(e) {
        t === pageData.getClientPage() && (painter.create(e), eventEmitter.trigger(eventEmitter.CURRENT_PAGE_SHAPE_LOAD_END)), eventEmitter.trigger(eventEmitter.PAGE_SHAPE_LOAD_END)
      })
    },
    hideLaser: function() {
      this.setData({
        showLaser: !1
      })
    },
    onCanvasTouchStart: function(e) {
      painter.onCanvasTouchStart(e)
    },
    onCanvasTouchMove: function(e) {
      painter.onCanvasTouchMove(e)
    },
    onCanvasTouchEnd: function(e) {
      painter.onCanvasTouchEnd(e)
    },
    onClearTap: function() {
      this.triggerEvent("clearTap")
    },
    onMaskTap: function() {
      this.triggerEvent("maskTap")
    },
    onPageCountTap: function() {
      this.triggerEvent("pageCountTap")
    }
  },
  ready: function() {
    var n = this;
    eventEmitter.on(eventEmitter.CURRENT_DOC_IMAGE_LOAD_SUCCESS, function(e, t) {
      setTimeout(function() {
        n.setPage(pageData.getClientPage())
      }, 0)
    }).on(eventEmitter.CLEAR_CANVAS, function(e, t) {
      painter.onClearTap();
      var a = docData.getComplexPage(pageData.getClientPage());
      eventEmitter.trigger(eventEmitter.SHAPE_REMOVE_TRIGGER, {
        docId: a.docId,
        page: a.page,
        shapeId: ""
      })
    }).on(eventEmitter.SHAPE_LASER, function(e, t) {
      if (!auth.isSelf(t.fromId) && pageData.getClientPage() === pageData.getServerPage()) {
        var a = t.shape;
        n.setData({
          laserStyle: {
            left: a.x * canvasWidth,
            top: a.y * canvasHeight
          },
          showLaser: !0
        }), cursorAutoHideTimer && clearTimeout(cursorAutoHideTimer), cursorAutoHideTimer = setTimeout(function() {
          n.hideLaser(), cursorAutoHideTimer = null
        }, config.LASER_TIME_OUT)
      }
    })
  }
});