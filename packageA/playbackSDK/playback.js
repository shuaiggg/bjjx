import camelCaseObject from './function/camelCaseObject.js';
import inflatePoints from './function/inflatePoints.js';
import base64Util from './function/base64Util.js';
import binarySearch from './function/binarySearch.js';
import getLanguage from './language/main';
import Timer from './function/Timer';
import parser from './function/messageParser';
import roomServer from './server/room';
import chatServer from './server/chat';
import store from './store';
import storage from './storage';
import auth from './auth';
import shapeData from './data/shape';
import pageData from './data/page';
import docData from './data/doc';
import userData from './data/user';
import eventEmitter from './eventEmitter';
import info from './info';
import deviceInfo from './deviceInfo';
import config from './config';


const roomTip = function(tip) {
  if (store.get('hasDefaultTip', true)) {
    info.tip(tip);
  }
};

let language;

let playback = {
  currentTime: 0,
  paused: true,
  blocked: false,
  messageFilter: null,
  store,
  storage,
  auth,
  eventEmitter,
  data: {
    shapeData,
    pageData,
    docData,
    userData,
  }
};

const messages = [];
const channelMessages = {};
const pages = [];

// 添加文档/白板的消息单独保存，针对动态PPT，每次快退需要发送docAdd消息
const docMessages = [];
const whiteboardMessages = [];
const chatMessages = [];
const mediaPublishMessages = [];
const noticeMessages = [];

const whiteboardTimes = [];
const chatTimes = [];
const mediaPublishTimes = [];
const noticeTimes = [];

const docs = {};

let initialData;

let audio;
let videos;
let videoId;
let userVideos;
let videoWatermark;
let definition; // 主讲视频清晰度列表
let userDefinition; // 观众视频清晰度列表
let defaultDefinition;


let playbackInfo;
let whiteboardMessage;
let playSpeed = 1;

// 各类型消息每次最多发送数，多了会特别卡
let MAX_MESSAGE_COUNT = 30;

let reportTimer;
// 默认两分钟上报一次
let reportInterval = 120;
let lastTime = 0;

const logData = {};

let reportMediaInfo = {};

let apiOrigin = 'https://www.baijiayun.com';

/**
 * 向后台发送log
 * 上报文档：http://ewiki.baijiashilian.com/%E7%99%BE%E5%AE%B6%E4%BA%91/%E7%82%B9%E6%92%AD/%E7%82%B9%E6%92%AD%E4%B8%8A%E6%8A%A5%E7%BB%9F%E8%AE%A1.md
 * @param event {String} log事件名
 * @param time {Number} event为seek时需上报seek到的位置 || event为firstplaywait或blockend时上报卡顿时长，单位均为秒
 */
function sendLog(event, time) {
  if ((playback.paused || playback.blocked) && event === 'normal') {
    return;
  }

  // 记忆播放首次播放的时候需要将lastTime同步为当前记忆播放的时间
  if (event === 'play') {
    lastTime = playback.currentTime;
  }

  const params = {
    uuid: logData.uuid,
    guid: logData.guid,
    type: 'video_vod',
    clientype: deviceInfo.isAndroid() ? 8 : 9, // 8:安卓微信小程序 9:ios微信小程序
    browser: 7,
    fid: logData.videoId,
    partner_id: logData.partnerId,
    contenttype: reportMediaInfo.contenttype || 0, // 播放内容的类型  0:正片 1:片头 2:片尾
    cdn: reportMediaInfo.cdn,
    filesize: reportMediaInfo.filesize,
    totaltime: (reportMediaInfo.totaltime || logData.duration) * 1000,
    resolution: reportMediaInfo.resolution,
    playfiletype: reportMediaInfo.playfiletype,
    playbegintime: lastTime * 1000,
    playendtime: playback.currentTime * 1000,
    duration: (playback.currentTime - lastTime) * 1000,
    speedup: playSpeed,
    event: event,
    customstr: logData.customStr,
    user_number: store.get('user.number'),
    user_name: store.get('user.name')
  };

  if (event === 'block') {
    playback.blocked = true;
  }
  if (event === 'firstplaywait' || event === 'blockend') {
    params.waittime = time * 1000;
    playback.blocked = false;
  }


  if (event === 'seek') {
    params.seekTo = time * 1000 || 0;
    lastTime = time || 0;
  } else {
    lastTime = playback.currentTime;
  }

  wx.request({
    url: `https://click.baijiayun.com/gs.gif`,
    data: params
  });

  // 不是normal上报，则新建定时器定时发送上报
  if (!reportTimer || event !== 'normal') {
    // 上报间隔
    const timeRange = reportInterval / playSpeed * 1000;
    reportTimer = clearInterval(reportTimer);
    reportTimer = setInterval(() => {
      sendLog('normal');
    }, timeRange);
  }
}

playback.sendLog = sendLog;

function toChannel(channel) {
  return channel || 'chat';
}

function getTime(message) {
  return parseInt(message.offset_timestamp) || -1;
}

function startsWith(str, part) {
  str += '';
  part += '';
  return str.startsWith(part);
}

function isDocMessage(message) {
  return startsWith(message.message_type, 'doc_');
}

function isShapeMessage(message) {
  return startsWith(message.message_type, 'shape_');
}

function isPageChangeMessage(message) {
  return message.message_type === 'page_change';
}

function isWhiteboardMessage(message) {
  return message.message_type === 'wb';
}

function isPublishMessage(message) {
  return startsWith(message.message_type, 'media_') ||
    startsWith(message.message_type, 'presenter_');
}

function isNoticeMessage(message) {
  return startsWith(message.message_type, 'notice_');
}

function isChatMessage(message) {
  return startsWith(message.message_type, 'message_');
}

function decodeUrl(url) {
  const prefix = 'bjcloudvod://';
  if ('' === url || url.indexOf(prefix) !== 0) {
    return;
  }
  url = url.slice(prefix.length, url.length).replace(/-/g, '+').replace(/_/g, '/');

  const pad = url.length % 4;
  if (pad === 2) {
    url += '==';
  } else if (pad === 3) {
    url += '=';
  }

  url = base64Util.decode(url);
  const factor = url.charCodeAt(0);
  const c = factor % 8;
  url = url.slice(1, url.length);
  const result = [];
  for (let i = 0, char; char = url[i]; i++) {
    const step = (i % 4) * c + (i % 3) + 1;
    result.push(String.fromCharCode(char.charCodeAt(0) - step));
  }
  return result.join('');
}

let lastDispatchMessage = null;

function dispatchMessage(message) {
  // 避免发送重复消息
  if (JSON.stringify(lastDispatchMessage) === JSON.stringify(message)) {
    return;
  }
  lastDispatchMessage = message;

  const type = message.message_type;

  const handler = roomServer.messageTypes[type] || chatServer.messageTypes[type];

  if (handler) {
    if (isPageChangeMessage(message)) {
      shapeData.clear();
    }
    if (isChatMessage(message) && playback.messageFilter && !playback.messageFilter(message)) {
      return;
    }
    handler(message);
  }
}

/**
 * dispatch消息队列
 * @param messages 消息数组
 * @param interval 定时器间隔时间，默认30，传0时直接同步发送
 * @return {*} 定时器调用时返回定时器
 */
function dispatchMessages(messages, interval) {
  // 消息队列为空则跳出
  if (!messages.length) {
    return;
  }
  let index = 0;
  if (interval === 0) {
    for (let len = messages.length; index < len; index++) {
      dispatchMessage(messages[index]);
    }
  } else {
    const timer = new Timer({
      task: function() {
        const message = messages[index++];
        if (message) {
          dispatchMessage(message);
        } else {
          return false;
        }
      },
      timeout: 0,
      interval: interval || 30,
    });
    timer.start();
    return timer;
  }
}


/**
 * 生成基于时间戳的消息
 */
function generateTimeStampMessages() {
  whiteboardTimes.length = 0;
  chatTimes.length = 0;
  mediaPublishTimes.length = 0;
  noticeTimes.length = 0;
  whiteboardMessages.forEach(message => {
    let timestamp = Math.ceil(message.offset_timestamp);
    timestamp = timestamp < 0 ? 0 : timestamp;
    whiteboardTimes[timestamp] = whiteboardTimes[timestamp] || [];
    whiteboardTimes[timestamp].push(message);
  });
  chatMessages.forEach(message => {
    let timestamp = Math.ceil(message.offset_timestamp);
    timestamp = timestamp < 0 ? 0 : timestamp;
    chatTimes[timestamp] = chatTimes[timestamp] || [];
    chatTimes[timestamp].push(message);
  });

  mediaPublishMessages.forEach(message => {
    let timestamp = Math.ceil(message.offset_timestamp);
    timestamp = timestamp < 0 ? 0 : timestamp;
    mediaPublishTimes[timestamp] = mediaPublishTimes[timestamp] || [];
    mediaPublishTimes[timestamp].push(message);
  });
  noticeMessages.forEach(message => {
    let timestamp = Math.ceil(message.offset_timestamp);
    timestamp = timestamp < 0 ? 0 : timestamp;
    noticeTimes[timestamp] = noticeTimes[timestamp] || [];
    noticeTimes[timestamp].push(message);
  });
}

/**
 * 消息分类
 * @param allMessages 全部消息
 */
function category(allMessages) {
  whiteboardMessages.length = 0;
  chatMessages.length = 0;
  mediaPublishMessages.length = 0;
  noticeMessages.length = 0;

  for (let i = 0, len = allMessages.length, message; i < len; i++) {

    message = allMessages[i];

    if (isDocMessage(message)) {
      if (message.message_type === 'doc_add') {
        const doc = message.doc;
        docs[doc.id] = {
          id: doc.id,
          name: doc.name
        };
      }
      messages.push(message);
      docMessages.push(message);
      whiteboardMessages.push(message);
    } else if (isPageChangeMessage(message)) {
      pages.push({
        doc: docs[message.doc_id],
        page: message.page,
        time: getTime(message)
      });
      messages.push(message);
      whiteboardMessages.push(message);
    } else if (isWhiteboardMessage(message)) {
      const whiteboardInfo = message.doc.page_list[0];
      whiteboardMessage = {
        ext: '',
        id: '0',
        name: 'board',
        number: '0',
        pageInfo: {
          width: whiteboardInfo.width,
          height: whiteboardInfo.height,
          url: whiteboardInfo.url,
        },
        pageList: [{
          width: whiteboardInfo.width,
          height: whiteboardInfo.height,
          url: whiteboardInfo.url,
        }]
      };
      docs[whiteboardMessage.id] = {
        id: whiteboardMessage.id,
        name: whiteboardMessage.name
      };
      messages.push(message);
      docMessages.push(message);
      whiteboardMessages.push(message);
      whiteboardMessages.push({
        message_type: 'page_change',
        doc_id: '0',
        page: 0,
        offset_timestamp: message.offset_timestamp
      });
    } else if (isShapeMessage(message)) {
      messages.push(message);
      whiteboardMessages.push(message);
    } else if (isChatMessage(message)) {
      message.message_type = 'message_receive';
      messages.push(message);
      chatMessages.push(message);
    } else if (isPublishMessage(message)) {
      mediaPublishMessages.push(message);
      messages.push(message);
    } else if (isNoticeMessage(message)) {
      noticeMessages.push(message);
      messages.push(message);
    }
  }

  // 消息分类完成后生成基于时间戳的消息对象
  generateTimeStampMessages();
}

function s4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
  const uuid = [
    s4() + s4(),
    s4(),
    s4(),
    s4(),
    s4() + s4() + s4()
  ].join('-');
  return 'uuid-' + uuid;
}

function getUuid() {
  let uuid = storage.get('uuid');

  if (!uuid) {
    uuid = guid();
    storage.set('uuid', uuid);
  }
  return uuid;
}

function parsePlaybackData(responseData) {
  playbackInfo.data = responseData;
  audio = responseData.audioUrl;

  if (responseData.reportInterval) {
    reportInterval = responseData.reportInterval;
  }
  defaultDefinition = responseData.playbackDefaultDefinition;

  const classData = {
    title: responseData.videoInfo.title
  };

  if (responseData.classData) {
    classData.forbiddenEndTypes = responseData.classData.forbiddenEndTypes;
  }

  initialData = initialData || {};
  initialData.class = initialData.class || {};
  Object.assign(initialData.class, classData);

  const partner = responseData.partnerConfig;
  if (partner) {
    initialData.partner = Object.assign({}, initialData.partner, partner);
    parser.init();
  }

  logData.uuid = getUuid();
  logData.guid = responseData.guid;
  logData.duration = parseInt(responseData.duration);
  logData.videoId = responseData.videoInfo.videoId;
  logData.partnerId = responseData.videoInfo.partnerId;

  videoId = responseData.videoId;
  videos = {};
  definition = responseData.definition;
  Object.entries(responseData.playInfo).forEach(([key, value]) => {
    videos[key] = value.cdnList.map(item => ({
      cdn: item.cdn,
      width: item.width,
      height: item.height,
      duration: item.duration,
      size: item.size,
      url: decodeUrl(item.encUrl)
    }));
  });

  videoWatermark = responseData.videoWatermark;

  userVideos = {};
  userDefinition = {};


  const userVideo = responseData.userVideo;
  userVideo.length && userVideo.forEach((video, index) => {
    if (!video) {
      return;
    }
    userDefinition[index] = video.definition;
    userVideos[index] = {};
    Object.entries(video.playInfo).forEach(([key, value]) => {
      userVideos[index][key] = value.cdnList.map(item => ({
        cdn: item.cdn,
        width: item.width,
        height: item.height,
        duration: item.duration,
        url: decodeUrl(item.encUrl)
      }));
    });
  });
}

function getPlaybackInfo() {

  eventEmitter.trigger(
    eventEmitter.PLAYBACK_INFO_FETCH_START
  );


  const params = {
    room_id: initialData.class.id,
    token: initialData.token || '',
    session_id: initialData.class.sessionId,
    render: 'jsonp'
  };

  if (initialData.version != null) {
    params.version = initialData.version;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiOrigin}/web/playback/getPlayInfo`,
      data: params,
      complete: response => {
        playbackInfo = response.data;

        if (playbackInfo.code !== 0) {
          wx.showToast({
            title: playbackInfo.msg,
            icon: 'none',
            duration: 2000
          });
          reject({
            msg: playbackInfo.msg
          });
        }
        const responseData = camelCaseObject(playbackInfo.data);
        if (responseData && Object.keys(responseData).length) {

          // 部分课程信息加密，加密课程只能在客户端打开
          if (responseData.isEncrypt) {
            eventEmitter.trigger(
              eventEmitter.UNSUPPORTED_END_TYPE
            );
            resolve(false);
          } else {
            resolve(parsePlaybackData(responseData));
          }
        }
      }
    });
  });
}

/**
 * 初始化并返回回放信息
 * @return {{videoId: *, videos: *, pages: Array, userVideos: *, videoWatermark: *, definition: *, userDefinition:
 *     *, defaultDefinition: *}}
 */
function init() {

  docData.init();
  pageData.init();
  shapeData.init();

  eventEmitter
    .on(
      eventEmitter.SHAPE_ALL_REQ,
      function(event, data) {

        const docId = data.docId;
        const page = data.page;

        const shapeList = [];

        function findById(shapeId) {
          for (let m = 0, n = shapeList.length; m < n; m++) {
            if (shapeList[m].id === shapeId) {
              return m;
            }
          }
          return -1;
        }

        whiteboardMessages.forEach(message => {
          if (message.offset_timestamp > playback.timeIndex) {
            return false;
          }
          if (message.doc_id === docId && message.page === page) {
            const type = message.message_type;
            if (type === 'shape_add') {
              shapeList.push(message.shape);
            } else if (type === 'shape_del') {
              if (!message.shape_id) {
                shapeList.length = 0;
              } else {
                message.shape_id.split(',').forEach(shapeId => {
                  const index = findById(shapeId);
                  if (index >= 0) {
                    shapeList.splice(index, 1);
                  }
                });
              }
            } else if (type === 'shape_update') {
              message.shape_list.forEach(shape => {
                const index = findById(shape.id);
                if (index >= 0) {
                  shapeList[index] = shape;
                }
              });
            }
          }
        });

        setTimeout(function() {
          eventEmitter.trigger(
            eventEmitter.SHAPE_ALL_RES, {
              docId: docId,
              page: page,
              shapeList: shapeList.map(
                function(shape) {
                  shape.points = inflatePoints(shape);
                  return shape;
                }
              )
            }
          );
        }, 0);

      }
    )
    .on(
      eventEmitter.USER_ACTIVE_RES,
      function(event, data) {
        const userList = data.userList;

        if (userList.length > 0) {
          userData.add(userList);
          userList.forEach(user => {

            user.canPlay = !userData.isAudioSpeex(user);
            const data = {
              user: user,
              linkType: user.linkType
            };

            if (user.videoOn) {
              data.videoOn = true;
            }

            if (user.audioOn) {
              data.audioOn = true;
            }

            if (user.supportMuteStream === 1) {
              data.supportMuteStream = true;
            }

            if (user.supportBlackStream === 1) {
              data.supportBlackStream = true;
            }

            eventEmitter.trigger(
              eventEmitter.MEDIA_PUBLISH,
              data
            );

            if (user.mediaExt) {
              const extInfo = user.mediaExt[0];

              user = Object.assign({}, user);
              user.videoOn = extInfo.videoOn;
              user.audioOn = false;

              eventEmitter.trigger(
                eventEmitter.ASSIST_MEDIA_PUBLISH, {
                  user: user,
                  linkType: user.linkType,
                  videoOn: extInfo.videoOn,
                  audioOn: extInfo.audioOn,
                  mediaId: extInfo.id,
                }
              );
            }
          });
        }
      }
    )
    .on(
      eventEmitter.MESSAGE_RECEIVE,
      function(event, data) {
        userData.add(data.from);
      }
    )
    .on(
      eventEmitter.DOC_ALL_RES,
      function(event, data) {
        docData.clear();
        docData.add(data.docList);
      }
    )
    .on(
      eventEmitter.DOC_ADD,
      function(event, data) {
        docData.add(data.doc);
      }
    )
    .on(
      eventEmitter.DOC_UPDATE,
      function(event, data) {
        docData.update(data.docId, camelCaseObject(data.extra));
      }
    )
    .on(
      eventEmitter.DOC_REMOVE,
      function(event, data) {
        if (data.fromId === store.get('user.id')) {
          eventEmitter.trigger(
            eventEmitter.PAGE_CHANGE_TRIGGER, {
              docId: '0',
              page: 0
            }
          );
        }

      }
    )
    // .on(
    //     eventEmitter.SHAPE_ADD,
    //     function (event, data) {
    //         shapeData.add(
    //             data.docId,
    //             data.page,
    //             data.shape
    //         );
    //     }
    // )
    // .on(
    //     eventEmitter.SHAPE_REMOVE,
    //     function (event, data) {
    //
    //         var docId = data.docId;
    //         var page = data.page;
    //         var shapeId = data.shapeId;
    //
    //         if (shapeId === '') {
    //             shapeData.clear(docId, page);
    //         }
    //         else {
    //             shapeId.split(',').forEach(id => id && shapeData.remove(docId, page, id));
    //         }
    //
    //     }
    // )
    // .on(
    //     eventEmitter.SHAPE_UPDATE,
    //     function (event, data) {
    //         shapeData.update(
    //             data.docId,
    //             data.page,
    //             data.shapeList
    //         );
    //     }
    // )

    .on(
      eventEmitter.PAGE_CHANGE_TRIGGER,
      function(event, data) {

        const docId = data.docId;
        const page = data.page;
        const step = data.step || 0;

        eventEmitter.trigger(
          eventEmitter.CLIENT_PAGE_CHANGE, {
            docId: docId,
            page: page,
            step: step
          }
        );
      }
    )
    .on(
      eventEmitter.CLASS_START,
      function() {
        roomTip(language.CLASS_START);
        store.set('class.started', true);
      }
    )

    .on(
      eventEmitter.CLASS_END,
      function() {
        store.set('class.started', false);
        roomTip(language.CLASS_END);
      }
    )
    .on(
      eventEmitter.TEACHER_ADD,
      function() {
        store.set('teacher.in', true);
      }
    )
    .on(
      eventEmitter.TEACHER_REMOVE,
      function() {
        if (!store.get('playback')) {
          store.set({
            'teacher.in': false,
            'teacher.videoOn': false,
            'teacher.audioOn': false
          });
        }
      }
    );

  eventEmitter
    .on(
      eventEmitter.MESSAGE_PULL_REQ,
      function(event, data) {

        const channel = toChannel(data.channel);
        let next = data.next;
        const count = data.count;

        let messageList = [];
        let hasMore = false;

        const list = channelMessages[channel];
        let startIndex;
        let endIndex;

        if (list && list.length) {
          if (next === -1) {
            next = parseInt(list[list.length - 1].id);
          }
          endIndex = binarySearch(
            list,
            function(messages, index) {
              const id = parseInt(messages[index].id);
              if (id < next) {
                return 1;
              } else if (id > next) {
                return -1;
              }
              return 0;
            }
          );
          startIndex = Math.max(0, endIndex - count);

          messageList = list.slice(startIndex, endIndex + 1);
          hasMore = startIndex > 0;
        }

        if (hasMore) {
          next = parseInt(list[startIndex - 1].id);
        } else {
          next = -1;
        }

        setTimeout(function() {
          eventEmitter.trigger(
            eventEmitter.MESSAGE_PULL_RES, {
              channel: data.channel,
              next: next,
              hasMore: hasMore,
              messageList: camelCaseObject(messageList.reverse())
            }
          );
        }, 0);
      }
    );
  playback.start();
  return {
    title: store.get('class.title'),
    audio: audio,
    videoId: videoId,
    videos: videos,
    pages: pages,
    userVideos: userVideos,
    videoWatermark: videoWatermark,
    definition: definition,
    userDefinition: userDefinition,
    defaultDefinition: defaultDefinition
  };
}

/**
 * 格式化数据并存入store
 */
function formatData() {

  if (!initialData.user) {
    initialData.user = {};
  }

  if (logData.userName) {
    initialData.user.name = logData.userName;
  }
  if (logData.userNumber) {
    initialData.user.number = logData.userNumber;
  }

  if (!logData.customStr && initialData.customStr) {
    logData.customStr = initialData.customStr;
  }

  store.set(initialData);
}


/**
 * 初始化并获取回放内容信息
 * @param data
 */
function initData(data) {

  language = getLanguage();
  initialData = data || {};
  formatData();

  return getPlaybackInfo().then(flag => {
    // 针对不支持的终端类型，直接返回
    if (flag === false) {
      return;
    }
    eventEmitter.trigger(
      eventEmitter.PLAYBACK_INFO_FETCH_END, {
        response: playbackInfo
      }
    );

    if (playbackInfo && playbackInfo.data) {
      eventEmitter.trigger(
        eventEmitter.PLAYBACK_SIGNAL_FETCH_START
      );
      return new Promise(resolve => {
        wx.request({
          url: playbackInfo.data.signal.all.url,
          success: response => {
            const data = response.data;
            eventEmitter.trigger(
              eventEmitter.PLAYBACK_SIGNAL_FETCH_END, {
                response: data
              }
            );
            resolve(data);
          }
        });
      }).then(category).then(init);
    }
  }).catch((e) => {
    if (e.msg) {
      eventEmitter.trigger(
        eventEmitter.PLAYBACK_INFO_FETCH_FAILED,
        e
      );
    }
    return false;
  });
}

/**
 * 回放SDK主入口
 * @param params 输入参数
 * env: 0 || 1, // 标识是否是pro环境（可被apiOrigin覆盖）
 * apiOrigin: 'https://www.baijiayun.com', // 标识个性化域名（省略时调用百家云默认域名）
 * token: 'T4Ivx-DIWjgmvvoNNdcydzf3LcMMPzYEc4GNHnOv-QuVbTLv8dzJe_eqCFuUfaIw0nPLBgfsrQMKp0fXMnVKLQ',
 * class: {
 *   id: '18070683424562',
 *   sessionId: 201807200
 * },
 * user: {
 *   number: '13147056',
 *   avatar: 'http://static.sunlands.com/newUserImagePath/13147056/40_40/13147056.jpg',
 *   name: 'xxx',
 *   type: 0
 * }
 */
playback.init = function(params) {

  const env = params.env;

  // 存入request origin
  apiOrigin = params.apiOrigin || config[env ? 'PLAYBACK_REQUEST_PRO' : 'PLAYBACK_REQUEST']


  console.log(params);
  console.log(apiOrigin);
  // 获取回放房间信息
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiOrigin}/m/playback/getWxSdkRoomInfo`,
      data: {
        room_id: params.class.id,
        session_id: params.class.sessionId,
        token: params.token,
        version: params.version
      },
      complete: res => {
        if (res.data.code !== 0) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          });
          eventEmitter.trigger(eventEmitter.PLAYBACK_ROOM_INFO_FETCH_FAILED, res.data);
          reject(res.data);
        } else {
          const data = camelCaseObject(res.data.data) || {};
          params.partner = data.partnerConfig;
          initData(params).then(resolve);
        }
      }
    });
  });
};

/**
 * 外界传入媒体的信息（供上报用）
 * @param mediaInfo
 */
playback.sendMediaInfo = function(mediaInfo) {
  reportMediaInfo = mediaInfo || {};
};

playback.start = function(startTime = 0) {

  playback.currentTime = startTime;

  return new Promise(resolve => {

    // 等前面的组件 afterMount
    wx.nextTick(() => {
      clearDocData();
      clearUserData();
      // 提前将doc添加到docData中去
      dispatchMessages(docMessages, 500);
      playByTime(0, startTime);
      resolve();
    });
  });

};

playback.play = function() {
  if (playback.paused) {
    playback.paused = false;
  }
  sendLog('play');
};


playback.pause = function() {
  if (!playback.paused) {
    playback.paused = true;
  }
  sendLog('pause');
};

playback.setMessageFilter = function(func, time) {
  playback.messageFilter = func;

  time = time || playback.currentTime;

  const chatMessagesToDispatch = [];
  chatMessages.forEach(message => {
    if (message.offset_timestamp > time) {
      return false;
    }
    if (!func ||
      (func && func(message))
    ) {
      chatMessagesToDispatch.push(message);
    }
  });

  dispatchChatMessageFromBeginning(chatMessagesToDispatch, MAX_MESSAGE_COUNT);
};

playback.stop = function() {
  playback.paused = true;
  clearDocData();
  clearUserData();
  clearChatData();
  playByTime(0, 0);
};

playback.getSpeed = function() {
  return playSpeed;
};

playback.setSpeed = function(speed) {

  playSpeed = speed;
};

/**
 * @param {number} seconds seek到的时间
 * @param {boolean} force 是否强制seek，为true则不判断时间是否相同且全部重载
 */
playback.seek = function(seconds, force) {

  seconds = Math.floor(seconds);
  // 相同时间且非强制则直接返回，防止频繁调用
  if (!force && playback.currentTime === seconds) {
    return;
  }
  eventEmitter.trigger(
    eventEmitter.PLAYBACK_SEEK_START, {
      currentTime: seconds
    }
  );


  // 时间向前，则加载时间段内的数据
  if (!force && seconds > playback.currentTime) {
    playByTime(playback.currentTime, seconds);
  }
  // 其他情况重新全部加载
  else {
    clearUserData();
    playByTime(0, seconds);
  }

  !force && sendLog('seek', seconds);


  playback.currentTime = seconds;


  eventEmitter.trigger(
    eventEmitter.PLAYBACK_SEEK_END, {
      currentTime: seconds
    }
  );

};

/**
 * 清空PPT数据
 */
const clearDocData = function() {

  docData.clear();
  docData.add(whiteboardMessage);
};


/**
 * 清空用户及用户列表 && 主讲人数据
 */
const clearUserData = function() {
  userData.all().forEach(user => userData.remove(user.id));

  Object.assign(store, {
    presenterId: null,
    presenter: null
  });
};

/**
 * 清空聊天消息
 */
const clearChatData = function() {
  eventEmitter.trigger(
    eventEmitter.MESSAGE_LIST_CLEAR, {
      channel: 'chat'
    }
  );
};

playback.timeIndex = 0;


function findMessageIndex(list, time) {
  return list.filter(message => message.offset_timestamp < time).length;
}


function isTwoMessagesTheSame(message1, message2) {
  return JSON.stringify(message1) === JSON.stringify(message2);
}

// 聊天消息容易闪，此处保存上次发送的聊天消息。
// 比较前后两次数据更新，如果消息数据相同则不清空不发送
let lastDispatchedChatMessages = [];

/**
 * 从头开播聊天消息
 * @param chatMessagesToDispatch 待发送消息
 * @param maxDispatchCount 最大发送数目 设置后会只发送最新的maxDispatchCount数量的消息
 */
function dispatchChatMessageFromBeginning(chatMessagesToDispatch, maxDispatchCount) {

  // 截取最新maxDispatchCount条数据集
  const currentChatMessageList = chatMessagesToDispatch.slice(-maxDispatchCount);
  const currentLength = currentChatMessageList.length;

  // 从头开播，无消息，则清空消息列表
  if (!currentLength) {
    clearChatData();
    lastDispatchedChatMessages = [];
    return;
  }

  const lastLength = lastDispatchedChatMessages.length;
  // 当前待发消息包含于上次发送过的消息
  // 且两数组最后一条消息相同且当前数组不大于上次数组
  // 则认为消息重复，直接返回
  if (currentLength <= lastLength &&
    isTwoMessagesTheSame(
      currentChatMessageList[currentLength - 1],
      lastDispatchedChatMessages[lastLength - 1]
    )) {
    return;
  }

  // 从头开播，清空聊天消息
  clearChatData();

  lastDispatchedChatMessages = currentChatMessageList;
  dispatchMessages(currentChatMessageList, 0);
}


const shapeClearMessage = {
  message_type: 'shape_del',
  record_clean: 1
};
let lastPageChangeMessage = {};

/**
 * 获取要发送的白板数据
 * @param messages 消息数组
 * @return {Array}
 */
function filterWhiteboardMessage(messages) {
  const list = [];
  let isInSameDoc = false;

  let locked = false;
  let docId = null;
  let page = null;
  // 逆序遍历,从最新数据开始
  const length = messages.length;
  for (let i = length - 1; i >= 0; i--) {
    const message = messages[i];
    // 有其他页面的pagechange则不发送wb消息
    if (locked && docId !== '0' && isWhiteboardMessage(message)) {
      continue;
    }

    // isInSameDoc用来剔除doc_all_res等doc_add类消息
    if (!isPageChangeMessage(message) && !isShapeMessage(message) && !isInSameDoc) {
      list.push(message);
    } else if (!locked || (message.doc_id === docId && message.page === page)) {
      // 动态PPT必须从头发送pagechange事件，不然会存在找不到document的问题，因此需要保存所有pagechange
      list.push(message);
    }

    if (!locked && isPageChangeMessage(message)) {

      // 动态PPT的pagechange是相同的，通过step来实现动画
      // 两次消息发送，时间及step一致，说明在同一页，只需要发送shape信息，之前的消息不必发送
      if (JSON.stringify(lastPageChangeMessage) === JSON.stringify(message) && !message.step) {
        // 删除上方push进来的page_change消息
        list.pop();
        break;
      }

      isInSameDoc = lastPageChangeMessage.doc_id === message.doc_id;

      lastPageChangeMessage = message;

      docId = message.doc_id;
      page = message.page;
      locked = true;
    }
  }

  return list;
}

let lastToWhiteboardIndex = 0;

/**
 * 检查并发送截止时间之前的所有白板数据
 * @param startTime
 * @param endTime
 */
function checkAndDispatchWhiteboardMessages(startTime, endTime) {

  if (startTime === 0) {
    lastToWhiteboardIndex = 0;
    lastPageChangeMessage = {}
  }

  const toWhiteboardIndex = findMessageIndex(whiteboardMessages, endTime);

  // 正常顺序播放
  const isForward = toWhiteboardIndex >= lastToWhiteboardIndex;

  if (toWhiteboardIndex && lastToWhiteboardIndex !== toWhiteboardIndex) {

    // 前进,则只筛选未发出的消息
    const startIndex = isForward ? lastToWhiteboardIndex : 0;

    // 回退时需要清空画板重绘shape
    if (!isForward) {
      shapeData.clear(lastPageChangeMessage.doc_id, lastPageChangeMessage.page);
      dispatchMessage(shapeClearMessage);
      eventEmitter.trigger(eventEmitter.CLEAR_CANVAS);
    }

    const whiteboardDispatchMessages = filterWhiteboardMessage(whiteboardMessages.slice(
      startIndex,
      toWhiteboardIndex
    ));

    const count = whiteboardDispatchMessages.length;

    if (!count) {
      return;
    }
    whiteboardDispatchMessages.reverse().find(message => {
      dispatchMessage(message);
      // page_change消息发出时会触发SHAPE_ALL_RES，获取当前页对应时间内的所有的shape信息，所以不需要继续发送shape消息了
      return isPageChangeMessage(message);
    });

    lastToWhiteboardIndex = toWhiteboardIndex;
  }
}

/**
 * 消息数据更新发送
 * @param startTime 开始时间
 * @param endTime 截止时间
 */
function playByTime(startTime, endTime) {

  checkAndDispatchWhiteboardMessages(startTime, endTime);

  // 从头开始播聊天消息
  let toMessageIndex = findMessageIndex(chatMessages, endTime);
  if (!startTime) {
    // 有过滤器则从过滤器中发聊天消息
    if (playback.messageFilter) {
      playback.setMessageFilter(playback.messageFilter, endTime);
    } else {

      dispatchChatMessageFromBeginning(chatMessages.slice(0, toMessageIndex), MAX_MESSAGE_COUNT);
    }

  } else {
    toMessageIndex = null;
  }

  let tempChatMessageList = [];
  let tempNoticeMessage;

  // 逆序取数据
  for (let i = endTime - 1; i >= startTime; i--) {

    // 直接播放最后一个公告,发送消息后不再查找
    if (!tempNoticeMessage && noticeTimes[i] && noticeTimes[i].length) {
      tempNoticeMessage = noticeTimes[i][noticeTimes[i].length - 1];
      dispatchMessage(tempNoticeMessage);
    }


    // 只取最新MAX_MESSAGE_COUNT条聊天数据
    if (!toMessageIndex && tempChatMessageList.length <= MAX_MESSAGE_COUNT && chatTimes[i] && chatTimes[i].length) {
      const tempList = [];
      chatTimes[i].forEach(message => {
        if ((playback.messageFilter && playback.messageFilter(message)) ||
          !playback.messageFilter
        ) {
          tempList.push(message);
        }
      });
      tempChatMessageList = tempList.concat(tempChatMessageList);
    }

    // 满足上面两条筛选后直接设 i 小于 startTime 以跳出循环
    if (tempNoticeMessage && tempChatMessageList.length > MAX_MESSAGE_COUNT) {
      i = startTime - 1;
    }
  }

  // 顺序取数据
  for (let j = startTime; j < endTime; j++) {
    // 用户操作消息与媒体发布消息直接按顺序dispatch

    mediaPublishTimes[j] && mediaPublishTimes[j].forEach(message => dispatchMessage(message));

    // 消息dispatch时可能触发SHAPE_ALL_REQ，此时需要准确的timeIndex，所以在循环内更新timeIndex
    playback.timeIndex = j;
  }

  //截取最后MAX_MESSAGE_COUNT条数据
  const currentChatMessageList = tempChatMessageList.slice(-MAX_MESSAGE_COUNT);

  dispatchMessages(currentChatMessageList, 0);
}

playback.timeupdate = function(time, duration) {

  duration && (reportMediaInfo.totaltime = duration);

  time = Math.floor(time);
  if (time === playback.currentTime) {
    return;
  }

  // 时间向前，则加载时间段内的数据
  if (time > playback.currentTime) {
    playByTime(playback.currentTime, time);
  }
  // 其他情况重新全部加载
  else {
    clearUserData();
    playByTime(0, time);
  }
  playback.currentTime = time;
};

export default playback;