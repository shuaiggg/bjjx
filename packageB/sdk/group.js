var $=require("./jquery"),roomServer=require("./server/room"),eventEmitter=require("./eventEmitter"),groupTypes={},groupSize={};exports.groupTypes=groupTypes,exports.groupSize=groupSize,exports.join=function(e){roomServer.send({message_type:"group_join_req",group:e})},exports.exit=function(e){roomServer.send({message_type:"group_exit_req",group:e})},exports.get=function(e){roomServer.send({message_type:"group_size_req",group:e||""})},exports.init=function(){eventEmitter.on(eventEmitter.CLASSROOM_CONNECT_SUCCESS,function(){exports.get()}).on(eventEmitter.GROUP_SIZE_RES,function(e,r){$.each(r,function(e,r){var o=groupTypes[e];o&&o(r),groupSize[e]=r})})};