var isInited,isLoading,element,eventEmitter=require("../../eventEmitter");exports.init=function(i){isInited=!0,eventEmitter.on(eventEmitter.PAGE_CHANGE_START,function(i,e){e.hasCache||exports.show()}).on(eventEmitter.PAGE_CHANGE_END,function(i,e){exports.hide()})},exports.show=function(){isInited&&!isLoading&&(isLoading=!0,wx.showLoading({title:"loading..."}))},exports.hide=function(){isLoading&&wx.hideLoading()};