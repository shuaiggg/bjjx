const logger = require('./logger');
let guid = 0;

function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Cannot call a class as a function');
  }
}

function parseType(type, namespace) {
  const result = {
    name: type,
    space: ''
  };
  if (namespace) {
    const index = type.indexOf('.');
    if (index >= 0) {
      result.name = slice(type, 0, index);
      result.space = slice(type, index + 1);
    }
  }
  return result;
}


const execute = function(fn, context, args) {
  if (typeof fn === 'function') {
    return Array.isArray(args) ? fn.apply(context, args) : fn.call(context, args);
  }
};

/**
 * 截取字符串
 *
 * @param {string} str
 * @param {number} start
 * @param {?number} end
 * @return {string}
 */
function slice(str, start, end) {
  return typeof end === 'number' ? str.slice(start, end) : str.slice(start);
}

const Emitter = function() {

  /**
   *
   * @param {boolean} namespace 是否需要命名空间
   */
  function Emitter(namespace) {
    classCallCheck(this, Emitter);

    this.namespace = namespace;
    this.listeners = {};
  }

  Emitter.prototype.fire = function(type, data, context) {
    const namespace = this.namespace,
      listeners = this.listeners;

    const _parseType = parseType(type, namespace),
      name = _parseType.name,
      space = _parseType.space;

    let isComplete = true,
      list = listeners[name];
    if (list) {

      let event = Array.isArray(data) ? data[0] : data,
        isEvent = Event.is(event),
        fireId = guid++,
        i = -1,
        j,
        item,
        result;

      while (item = list[++i]) {

        // 当前执行 id
        item.id = fireId;

        if (space && item.space && space !== item.space) {
          continue;
        }

        result = execute(item.func, context !== undefined ? context : item.context, data);

        // 执行次数
        if (item.count > 0) {
          item.count++;
        } else {
          item.count = 1;
        }

        // 注册的 listener 可以指定最大执行次数
        if (item.count === item.max) {
          list.splice(i, 1);
        }

        // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
        if (isEvent) {
          if (result === false) {
            event.prevent().stop();
          } else if (event.isStoped) {
            result = false;
          }
        }

        if (result === false) {
          return isComplete = false;
        }

        // 解绑了一些 event handler
        // 则往回找最远的未执行的 item
        if (i >= 0 && item !== list[i]) {
          j = i;
          while (item = list[i]) {
            if (item.id !== fireId) {
              j = i;
            }
            i--;
          }
          i = j - 1;
        }
      }

      if (!list.length) {
        delete listeners[name];
      }
    }

    return isComplete;
  };

  Emitter.prototype.has = function(type, listener) {
    const namespace = this.namespace,
      listeners = this.listeners,
      _parseType2 = parseType(type, namespace),
      name = _parseType2.name,
      space = _parseType2.space;
    let result = true;

    const each$$1 = function(list) {
      list.find(item => {
        if ((!space || space === item.space) && (!listener || listener === item.func)) {
          result = false;
          return true;
        }
      });
      return result;
    };

    if (name) {
      const list = listeners[name];
      if (list) {
        each$$1(list);
      }
    } else if (space) {
      Object.values(listeners).forEach(each$$1);
    }

    return !result;
  };

  return Emitter;
}();


Object.assign(Emitter.prototype, {
  on: on(),
  once: on({
    max: 1
  }),
  off: function off(type, listener) {

    if (type == null) {
      this.listeners = {};
    } else {
      const _parseType3 = parseType(type, this.namespace),
        name = _parseType3.name,
        space = _parseType3.space;
      const _listeners = this.listeners;

      const each$$1 = function(list, name) {
        for (let index = list.length - 1; index >= 0; index--) {
          const item = list[index];
          if ((!space || space === item.space) && (!listener || listener === item.func)) {
            list.splice(index, 1);
          }
        }
        if (!list.length) {
          delete _listeners[name];
        }
      };


      if (name) {
        const list = _listeners[name];
        if (list) {
          each$$1(list, name);
        }
      } else if (space) {
        Object.entries(_listeners).forEach(([key, value]) => {
          each$$1(value, key);
        });
      }
    }
  }
});

function on(data) {
  return function(type, listener) {
    const namespace = this.namespace,
      listeners = this.listeners;


    const addListener = function(item, type) {
      if (typeof item === 'function') {
        item = {
          func: item
        };
      }
      if (item && typeof item.func === 'function') {
        if (data) {
          Object.assign(item, data);
        }

        const _parseType4 = parseType(type, namespace);
        const name = _parseType4.name;

        item.space = _parseType4.space;

        listeners[name] = listeners[name] || [];
        listeners[name].push(item);
      }
    };

    if (type && typeof type === 'object') {
      Object.entries(type).forEach(([key, value]) => {
        addListener(value, key);
      });
    } else if (typeof type === 'string') {
      addListener(listener, type);
    }
  };
}


const Event = function() {
  function Event(event) {
    classCallCheck(this, Event);

    if (event.type) {
      this.type = event.type;
      this.originalEvent = event;
    } else {
      this.type = event;
    }
  }

  Event.prototype.prevent = function() {
    if (!this.isPrevented) {
      const originalEvent = this.originalEvent;

      if (originalEvent) {
        if (typeof originalEvent.prevent === 'function') {
          originalEvent.prevent();
        } else if (typeof originalEvent.preventDefault === 'function') {
          originalEvent.preventDefault();
        }
      }
      this.isPrevented = true;
    }
    return this;
  };

  Event.prototype.stop = function() {
    if (!this.isStoped) {
      const originalEvent = this.originalEvent;

      if (originalEvent) {
        if (typeof originalEvent.stop === 'function') {
          originalEvent.stop();
        } else if (typeof originalEvent.stopPropagation === 'function') {
          originalEvent.stopPropagation();
        }
      }
      this.isStoped = true;
    }
    return this;
  };

  return Event;
}();

Event.is = function(target) {
  return target instanceof Event;
};

const emitterInstance = new Emitter(true);
module.exports.trigger = function(type, data) {
  // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
  // 内部为了保持格式统一
  // 需要转成 Event，这样还能知道 target 是哪个组件
  let event = type;
  if (typeof type === 'string') {
    event = new Event(type);
  }

  if (!event.target) {
    event.target = this;
  }

  const args = [event];
  if (data && typeof data === 'object') {
    args.push(data);
  }

  const isComplete = emitterInstance.fire(event.type, args, this);

  return isComplete;
};
module.exports.on = function(name, listener) {
  if (name) {
    emitterInstance.on(name, listener);
  } else {
    logger.warn('eventEmitter.on(name) name is undefined');
  }
  return module.exports;
};

module.exports.one = function(name, listener) {
  if (name) {
    emitterInstance.once(name, listener);
  } else {
    logger.warn('eventEmitter.one(name) name is undefined');
  }
  return exports;
};

module.exports.off = function(name, listener) {
  emitterInstance.off(name, listener);
  return exports;
};

module.exports.has = function(name) {
  return emitterInstance.has(name);
};

/**
 * 跟 trigger 的区别是它会返回 Event 对象，便于做 isPrevented() 等判断
 *
 * @param {string} name
 * @param {Object} data
 * @return {Event}
 */
module.exports.emit = function(name, data) {

  const event = new Event(name);

  if (data) {
    emitterInstance.fire(event, data);
  } else {
    emitterInstance.fire(event);
  }

  return event;

};

/**
 * 连接教室成功
 *
 * @type {string}
 */
exports.CLASSROOM_CONNECT_SUCCESS = 'classroom_connect_success';

/**
 * 广播开始上课事件
 *
 * @type {string}
 */
exports.CLASS_START = 'class_start';

/**
 * 广播结束上课事件
 *
 * @type {string}
 */
exports.CLASS_END = 'class_end';

/**
 * 搜索用户返回
 *
 * @type {string}
 */
exports.USER_SEARCH_RES = 'user_search_res';

/**
 * 当前发言用户（返回）
 *
 * @type {string}
 */
exports.USER_ACTIVE_RES = 'user_active_res';

/**
 * 学生列表增加人数
 *
 * @type {string}
 */
exports.USER_ADD = 'user_add';

/**
 * 学生下线，学生列表减少人数
 *
 * @type {string}
 */
exports.USER_REMOVE = 'user_remove';

/**
 * 更新用户状态
 *
 * @type {string}
 */
exports.USER_UPDATE = 'user_update';

/**
 * 添加老师
 *
 * @type {string}
 */
exports.TEACHER_ADD = 'teacher_add';

/**
 * 删除老师
 *
 * @type {string}
 */
exports.TEACHER_REMOVE = 'teacher_remove';

/**
 * 更新老师
 *
 * @type {string}
 */
exports.TEACHER_UPDATE = 'teacher_update';

/**
 * 添加助教
 *
 * @type {string}
 */
exports.ASSISTANT_ADD = 'assistant_add';

/**
 * 删除助教
 *
 * @type {string}
 */
exports.ASSISTANT_REMOVE = 'assistant_remove';

/**
 * 更新助教
 *
 * @type {string}
 */
exports.ASSISTANT_UPDATE = 'assistant_update';

/**
 * 添加学生
 *
 * @type {string}
 */
exports.STUDENT_ADD = 'student_add';

/**
 * 删除学生
 *
 * @type {string}
 */
exports.STUDENT_REMOVE = 'student_remove';

/**
 * 更新学生
 *
 * @type {string}
 */
exports.STUDENT_UPDATE = 'student_update';

/**
 * 增加游客
 *
 * @type {string}
 */
exports.GUEST_ADD = 'guest_add';

/**
 * 删除游客
 *
 * @type {string}
 */
exports.GUEST_REMOVE = 'guest_remove';

/**
 * 更新游客
 *
 * @type {string}
 */
exports.GUEST_UPDATE = 'guest_update';

/**
 * 广播远程用户登录
 *
 * @type {string}
 */
exports.USER_IN = 'user_in';

/**
 * 广播远程用户退出
 *
 * @type {string}
 */
exports.USER_OUT = 'user_out';

/**
 * 得到更多用户信息
 *
 * @type {string}
 */
exports.USER_MORE_RES = 'user_more_res';

/**
 * 获得所有文档列表
 *
 * @type {string}
 */
exports.DOC_ALL_RES = 'doc_all_res';

/**
 * 绑定文档（返回）
 *
 * @type {string}
 */
exports.DOC_ATTACH_RES = 'doc_attach_res';

/**
 * 解绑文档（返回）
 *
 * @type {string}
 */
exports.DOC_DETACH_RES = 'doc_detach_res';

/**
 * 获取资料库文档列表（返回）
 *
 * @type {string}
 */
exports.DOC_LIBRARY_LIST_RES = 'doc_library_list_res';

/**
 * 增加文档
 *
 * @type {string}
 */
exports.DOC_ADD = 'doc_add';

/**
 * 更新文档
 *
 * @type {string}
 */
exports.DOC_UPDATE = 'doc_update';

/**
 * 删除文档
 *
 * @type {string}
 */
exports.DOC_REMOVE = 'doc_remove';

/**
 * 是否可以使用翻页的权限发生变化
 *
 * @type {string}
 */
exports.PAGE_AUTH_CHANGE = 'page_auth_change';

/**
 * 是否可以使用白板的权限发生变化
 *
 * @type {string}
 */
exports.PAINT_AUTH_CHANGE = 'paint_auth_change';

/**
 * 请求全部标注
 *
 * @type {string}
 */
exports.SHAPE_ALL_REQ = 'shape_all_req';

/**
 * 返回全部标注
 *
 * @type {string}
 */
exports.SHAPE_ALL_RES = 'shape_all_res';

/**
 * 添加标注
 *
 * @type {string}
 */
exports.SHAPE_ADD = 'shape_add';

/**
 * 删除标注
 *
 * @type {string}
 */
exports.SHAPE_REMOVE = 'shape_remove';

/**
 * 更新标注
 *
 * @type {string}
 */
exports.SHAPE_UPDATE = 'shape_update';

/**
 * 激光笔
 *
 * @type {string}
 */
exports.SHAPE_LASER = 'shape_laser';

/**
 * 接受消息事件
 *
 * @type {string}
 */
exports.MESSAGE_RECEIVE = 'message_receive';

/**
 * 通过点击用户浮层的私聊按钮向某人发送私聊消息
 *
 * @type {string}
 */
exports.WHISPER_TO = 'whisper_to';

/**
 * 拉取历史消息
 *
 * @type {string}
 */
exports.MESSAGE_PULL_REQ = 'message_pull_req';

/**
 * 拉取历史消息的返回
 *
 * @type {string}
 */
exports.MESSAGE_PULL_RES = 'message_pull_res';

/**
 * 窗口大小发生改变
 *
 * @type {string}
 */
exports.WINDOW_RESIZE = 'window_resize';

/**
 * 翻页触发事件
 *
 * @type {string}
 */
exports.PAGE_CHANGE_TRIGGER = 'page_change_trigger';

/**
 * 文档翻页开始
 *
 * @type {string}
 */
exports.PAGE_CHANGE_START = 'page_change_start';

/**
 * 文档翻页结束
 *
 * @type {string}
 */
exports.PAGE_CHANGE_END = 'page_change_end';

/**
 * 服务器翻页（广播）
 *
 * @type {string}
 */
exports.SERVER_PAGE_CHANGE = 'server_page_change';

/**
 * 客户端翻页
 *
 * @type {string}
 */
exports.CLIENT_PAGE_CHANGE = 'client_page_change';

/**
 * 最大可翻页页码变化
 *
 * @type {string}
 */
exports.MAX_PAGE_CHANGE = 'max_page_change';

/**
 * 学生向老师或助教发出发言请求（触发）
 *
 * @type {string}
 */
exports.SPEAK_APPLY_REQ_TRIGGER = 'speak_apply_trigger';

/**
 * 老师或助教处理学生的发言请求（触发）
 *
 * @type {string}
 */
exports.SPEAK_APPLY_RES_TRIGGER = 'speak_apply_res_trigger';

/**
 * 学生向老师或助教发出发言请求
 *
 * @type {string}
 */
exports.SPEAK_APPLY_REQ = 'speak_apply_req';

/**
 * 老师或助教处理学生的发言请求
 *
 * @type {string}
 */
exports.SPEAK_APPLY_RES = 'speak_apply_res';

/**
 * 音视频开关（触发）
 *
 * @type {string}
 */
exports.MEDIA_SWITCH_TRIGGER = 'media_switch_trigger';
exports.ASSIST_MEDIA_SWITCH_TRIGGER = 'assist_media_switch_trigger';

/**
 * 重新发布（触发）
 *
 * @type {string}
 */
exports.MEDIA_REPUBLISH_TRIGGER = 'media_republish_trigger';
exports.ASSIST_MEDIA_REPUBLISH_TRIGGER = 'media_republish_ext_trigger';

/**
 * 重新发布（广播）
 *
 * @type {string}
 */
exports.MEDIA_REPUBLISH = 'media_republish';
exports.ASSIST_MEDIA_REPUBLISH = 'media_republish_ext';

/**
 * 音视频发布（触发）
 *
 * @type {string}
 */
exports.MEDIA_PUBLISH_TRIGGER = 'media_publish_trigger';
exports.ASSIST_MEDIA_PUBLISH_TRIGGER = 'media_publish_ext_trigger';

/**
 * 音视频发布（广播）
 *
 * @type {string}
 */
exports.MEDIA_PUBLISH = 'media_publish';
exports.ASSIST_MEDIA_PUBLISH = 'media_publish_ext';

/**
 * 老师改变学生状态（老师向服务器端）
 *
 * @type {string}
 */
exports.MEDIA_REMOTE_CONTROL_TRIGGER = 'media_remote_control_trigger';

/**
 * 服务器端转发给学生状态被改变
 *
 * @type {string}
 */
exports.MEDIA_CONTROL_TRIGGER = 'media_remote_control';

/**
 * 发送命令
 *
 * @type {string}
 */
exports.COMMAND_SEND = 'command_send';

/**
 * 接受命令
 *
 * @type {string}
 */
exports.COMMAND_RECEIVE = 'command_receive';

/**
 * 发送广播
 *
 * @type {string}
 */
exports.BROADCAST_SEND = 'broadcast_send';

/**
 * 接受广播
 *
 * @type {string}
 */
exports.BROADCAST_RECEIVE = 'broadcast_receive';

/**
 * 收到缓存的广播
 *
 * @type {string}
 */
exports.BROADCAST_CACHE_RES = 'broadcast_cache_res';

/**
 * 打印日志
 *
 * @type {string}
 */
exports.TRACE_LOG = 'trace_log';

/**
 * 获取公告栏内容（请求）
 *
 * @type {string}
 */
exports.NOTICE_REQ = 'notice_req';

/**
 * 获取公告栏内容（返回）
 *
 * @type {string}
 */
exports.NOTICE_RES = 'notice_res';

/**
 * 公告栏的内容发生变化（触发）
 *
 * @type {string}
 */
exports.NOTICE_CHANGE_TRIGGER = 'notice_change_trigger';

/**
 * 公告栏的内容发生变化
 *
 * @type {string}
 */
exports.NOTICE_CHANGE = 'notice_change';

/**
 * 我收到的礼物（请求）
 *
 * @type {string}
 */
exports.MY_GIFT_REQ = 'my_gift_req';

/**
 * 我收到的礼物（返回）
 *
 * @type {string}
 */
exports.MY_GIFT_RES = 'my_gift_res';

/**
 * 送出礼物
 *
 * @type {string}
 */
exports.GIFT_SEND = 'gift_send';

/**
 * 收到礼物
 *
 * @type {string}
 */
exports.GIFT_RECEIVE = 'gift_receive';

/**
 * 禁止某人发言（触发）
 *
 * @type {string}
 */
exports.MESSAGE_SEND_FORBID_TRIGGER = 'message_send_forbid_trigger';

/**
 * 禁止某人发言（广播）
 *
 * @type {string}
 */
exports.MESSAGE_SEND_FORBID = 'message_send_forbid';

/**
 * 禁止所有人发言状态改变（触发）
 *
 * @type {string}
 */
exports.MESSAGE_SEND_FORBID_ALL_CHANGE_TRIGGER = 'message_send_forbid_all_change_trigger';

/**
 * 禁止所有人发言状态改变（广播）
 *
 * @type {string}
 */
exports.MESSAGE_SEND_FORBID_ALL_CHANGE = 'message_send_forbid_all_change';

/**
 * 禁止所有人举手（触发）
 *
 * @type {string}
 */
exports.SPEAK_APPLY_FORBID_ALL_CHANGE_TRIGGER = 'speak_apply_forbid_all_change_trigger';

/**
 * 禁止所有人举手状态改变（广播）
 *
 * @type {string}
 */
exports.SPEAK_APPLY_FORBID_ALL_CHANGE = 'speak_apply_forbid_all_change';

/**
 * 当前人数发生变化
 *
 * @type {string}
 */
exports.USER_COUNT_CHANGE = 'user_count_change';

/**
 * 总人数发生变化
 *
 * @type {string}
 */
exports.TOTAL_USER_COUNT_CHANGE = 'total_user_count_change';

/**
 * 请求之前的题目信息
 *
 * @type {string}
 */
exports.SURVEY_PREV_REQ = 'survey_prev_req';

/**
 * 服务器返回之前的题目信息
 *
 * @type {string}
 */
exports.SURVEY_PREV_RES = 'survey_prev_res';

/**
 * 老师发送小测题目
 *
 * @type {string}
 */
exports.SURVEY_QUESTION_SEND = 'survey_question_send';

/**
 * 学生接收老师题目
 *
 * @type {string}
 */
exports.SURVEY_QUESTION_RECEIVE = 'survey_question_receive';

/**
 * 学生发送答案
 *
 * @type {string}
 */
exports.SURVEY_ANSWER_SEND = 'survey_answer_send';

/**
 * 答案人数统计
 *
 * @type {string}
 */
exports.SURVEY_ANSWER_COUNT = 'survey_answer_count';

/**
 * 答案名单统计
 *
 * @type {string}
 */
exports.SURVEY_ANSWER_USER = 'survey_answer_user';

/**
 * 请求到课名单
 *
 * @type {string}
 */
exports.STUDENT_LIST_REQ = 'student_list_req';

/**
 * 返回到课名单
 *
 * @type {string}
 */
exports.STUDENT_LIST_RES = 'student_list_res';

/**
 * 结束云端录制触发
 *
 * @type {string}
 */
exports.CLOUD_RECORD_END_TRIGGER = 'cloud_record_end_trigger';

/**
 * 生成卡顿客服工单
 *
 * @type {string}
 */
exports.BLOCK_TASK_CREATE = 'block_task_create';

/**
 * 请求用户在教室的状态
 *
 * @type {string}
 */
exports.USER_STATE_REQ = 'user_state_req';

/**
 * 返回用户在教室的状态
 *
 * @type {string}
 */
exports.USER_STATE_RES = 'user_state_res';

/**
 * 请求分组人数
 *
 * @type {string}
 */
exports.GROUP_SIZE_REQ = 'group_size_req';

/**
 * 返回分组人数
 *
 * @type {string}
 */
exports.GROUP_SIZE_RES = 'group_size_res';

/**
 * 紧急呼叫 客服电话拨打
 *
 * @type {string}
 */
exports.CALL_CUSTOM_SERVICE_TRIGGER = 'call_custom_service_trigger';

/**
 * 请求是否已经发过奖品
 *
 * @type {string}
 */
exports.LOTTERY_COMPLETE_REQ = 'lottery_complete_req';

/**
 * 返回抽奖是否已经完成
 *
 * @type {string}
 */
exports.LOTTERY_COMPLETE_RES = 'lottery_complete_res';

/**
 * 发送奖品信息
 *
 * @type {string}
 */
exports.LOTTERY_SEND = 'lottery_send';

/**
 * 学生收到老师发送奖品
 *
 * @type {string}
 */
exports.LOTTERY_RECEIVE = 'lottery_receive';

/**
 * 学生抽奖，发送到服务器端
 *
 * @type {string}
 */
exports.LOTTERY_DRAW_REQ = 'lottery_draw_req';

/**
 * 学生抽奖结果
 *
 * @type {string}
 */
exports.LOTTERY_DRAW_RES = 'lottery_draw_res';

/**
 * 请求发奖结果
 *
 * @type {string}
 */
exports.LOTTERY_RESULT_REQ = 'lottery_result_req';

/**
 * 返回发奖结果
 *
 * @type {string}
 */
exports.LOTTERY_RESULT_RES = 'lottery_result_res';

/**
 * 渲染视图
 *
 * @type {string}
 */
exports.VIEW_RENDER_TRIGGER = 'view_render_trigger';


/**
 * 开始云端录制触发
 *
 * @type {string}
 */
exports.CLOUD_RECORD_START_TRIGGER = 'cloud_record_start_trigger';

/**
 * 开始云端录制
 *
 * @type {string}
 */
exports.CLOUD_RECORD_START = 'cloud_record_start';

/**
 * 结束云端录制
 *
 * @type {string}
 */
exports.CLOUD_RECORD_END = 'cloud_record_end';

/**
 * 请求云端录制开始回放
 *
 * @type {string}
 */
exports.CLOUD_RECORD_COMMAND_SEND = 'cloud_record_command_send';

/**
 * 接收云端录制开始回放
 *
 * @type {string}
 */
exports.CLOUD_RECORD_COMMAND_ACCEPT = 'cloud_record_command_accept';


/**
 * 老师触发点名
 *
 * @type {string}
 */
exports.ROLL_CALL_TRIGGER = 'roll_call_trigger';

/**
 * 学生收到老师的点名邀请
 *
 * @type {string}
 */
exports.ROLL_CALL = 'roll_call';

/**
 * 学生应答老师的点名
 *
 * @type {string}
 */
exports.ROLL_CALL_RES = 'roll_call_res';

/**
 * 结束点名
 *
 * @type {string}
 */
exports.ROLL_CALL_FINISH = 'roll_call_finish';

/**
 * 最近一次的点名结果
 *
 * @type {string}
 */
exports.ROLL_CALL_RESULT = 'roll_call_result';

/**
 * 邀请发言请求 - 触发
 *
 * @type {string}
 */
exports.SPEAK_INVITE_REQ_TRIGGER = 'speak_invite_req_trigger';

/**
 * 邀请发言
 *
 * @type {string}
 */
exports.SPEAK_INVITE_REQ = 'speak_invite_req';

/**
 * 邀请发言响应 - 触发
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RES_TRIGGER = 'speak_invite_res_trigger';

/**
 * 当前正在邀请的用户列表
 *
 * @type {string}
 */
exports.SPEAK_INVITE_PENDING_LIST = 'speak_invite_pending_list';

/**
 * 邀请发言响应
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RES = 'speak_invite_res';

/**
 * 切换主讲人
 *
 * @type {string}
 */
exports.PRESENTER_CHANGE_TRIGGER = 'presenter_change_trigger';

/**
 * 切换主讲人
 *
 * @type {string}
 */
exports.PRESENTER_CHANGE = 'presenter_change';

/**
 * 允许发言
 *
 * @type {string}
 */
exports.SPEAK_ENABLE = 'speak_enable';

/**
 * 终止发言
 *
 * @type {string}
 */
exports.SPEAK_DISABLE = 'speak_disable';

/**
 * 进入全屏
 *
 * @type {string}
 */
exports.FULLSCREEN_ENTER = 'fullscreen_enter';

/**
 * 退出全屏
 *
 * @type {string}
 */
exports.FULLSCREEN_EXIT = 'fullscreen_exit';

/**
 * 退出全屏
 *
 * @type {string}
 */
exports.FULLSCREEN_EXIT_TRIGGER = 'fullscreen_exit_trigger';

/**
 * 进入全屏
 *
 * @type {string}
 */
exports.FULLSCREEN_ENTER_TRIGGER = 'fullscreen_enter_trigger';

/**
 * 修改视频分辨率
 *
 * @type {string}
 */
exports.VIDEO_RESOLUTION_CHANGE_TRIGGER = 'video_resolution_change_trigger';

/**
 * 修改视频分辨率
 *
 * @type {string}
 */
exports.VIDEO_RESOLUTION_CHANGE = 'video_resolution_change';

/**
 * 上行链路链路类型改变
 *
 * @type {string}
 */
exports.UPLINK_LINK_TYPE_CHANGE = 'uplink_link_type_change';

/**
 * 下行链路链路类型改变
 *
 * @type {string}
 */
exports.DOWNLINK_LINK_TYPE_CHANGE = 'downlink_link_type_change';

/**
 * 设备设置面板开启
 *
 * @type {string}
 */
exports.DEVICE_SETTINGS_OPEN = 'device_settings_open';

/**
 * 设置设备开始
 *
 * @type {string}
 */
exports.DEVICE_SETTINGS_START = 'device_settings_start';

/**
 * 触发踢出教室
 *
 * @type {string}
 */
exports.KICK_OUT_TRIGGER = 'kick_out_trigger';

/**
 * 踢出教室
 *
 * @type {string}
 */
exports.KICK_OUT = 'kick_out';

/**
 * 触发授权
 *
 * @type {string}
 */
exports.SPEAK_RAISE_TRIGGER = 'speak_raise_trigger';

/**
 * 授权
 *
 * @type {string}
 */
exports.SPEAK_RAISE = 'speak_raise';

/**
 * 触发取消授权
 *
 * @type {string}
 */
exports.SPEAK_LAY_TRIGGER = 'speak_lay_trigger';

/**
 * 取消授权
 *
 * @type {string}
 */
exports.SPEAK_LAY = 'speak_lay';

/**
 * 触发切换教室
 *
 * @type {string}
 */
exports.CLASS_SWITCH_TRIGGER = 'class_switch_trigger';

/**
 * 切换教室
 *
 * @type {string}
 */
exports.CLASS_SWITCH = 'class_switch';

/**
 * 拒绝发布音视频
 *
 * @type {string}
 */
exports.MEDIA_PUBLISH_DENY = 'media_publish_deny';

/**
 * 拒绝重新发布音视频
 *
 * @type {string}
 */
exports.MEDIA_REPUBLISH_DENY = 'media_republish_deny';

/**
 * 拒绝发布辅摄像头音视频
 *
 * @type {string}
 */
exports.MEDIA_PUBLISH_EXT_DENY = 'media_publish_ext_deny';

/**
 * 拒绝重新发布辅摄像头音视频
 *
 * @type {string}
 */
exports.MEDIA_REPUBLISH_EXT_DENY = 'media_republish_ext_deny';

/**
 * 拒绝申请发言
 *
 * @type {string}
 */
exports.SPEAK_APPLY_DENY = 'speak_apply_deny';

/**
 * 拒绝邀请发言
 *
 * @type {string}
 */
exports.SPEAK_INVITE_DENY = 'speak_invite_deny';

/**
 * 清除画笔
 *
 * @type {string}
 */
exports.RECORD_SHAPE_CLEAN = 'record_shape_clean';

/**
 * 开始共享桌面（广播）
 *
 * @type {string}
 */
exports.SCREEN_SHARE_START_BROADCAST = 'screen_share_start_broadcast';

/**
 * 停止共享桌面（广播）
 *
 * @type {string}
 */
exports.SCREEN_SHARE_STOP_BROADCAST = 'screen_share_stop_broadcast';

/**
 * 开始录制课程（广播）
 *
 * @type {string}
 */
exports.RECORD_START_BROADCAST = 'record_start_broadcast';

/**
 * 停止录制课程（广播）
 *
 * @type {string}
 */
exports.RECORD_STOP_BROADCAST = 'record_stop_broadcast';

exports.WHITEBOARD_RESIZE = 'ppt_video_switch';

exports.SEND_HEARTBEAT = 'send_heart_beat';

exports.CLEAR_CANVAS = 'clear_canvas';

exports.SWITCH_CAMERA = 'switch_camera';

/**
 * 学生申请发言 - 超时
 *
 * @type {string}
 */
exports.SPEAK_APPLY_RESULT_TIMEOUT = 'speak_apply_result_timeout';

/**
 * 学生申请发言 - 取消
 *
 * @type {string}
 */
exports.SPEAK_APPLY_RESULT_CANCEL = 'speak_apply_result_cancel';

/**
 * 学生申请发言 - 同意
 *
 * @type {string}
 */
exports.SPEAK_APPLY_RESULT_ACCEPT = 'speak_apply_result_accept';

exports.SPEAK_STOP_TRIGGER = 'speak_stop_trigger';

exports.SPEAK_START_TRIGGER = 'speak_start_trigger';

exports.SPEAK_CANCEL_TRIGGER = 'speak_cancel_trigger';

/**
 * 学生申请发言 - 拒绝
 *
 * @type {string}
 */
exports.SPEAK_APPLY_RESULT_REJECT = 'speak_apply_result_reject';

/**
 * 邀请发言 - 讯问式
 *
 * @type {string}
 */
exports.SPEAK_INVITE_CONFIRM = 'speak_invite_confirm';

/**
 * 邀请发言回应强制
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RESULT_FORCE = 'speak_invite_result_force';

/**
 * 邀请发言 取消
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RESULT_CANCEL = 'speak_invite_result_cancel';

/**
 * 邀请发言超时
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RESULT_TIMEOUT = 'speak_invite_result_timeout';

/**
 * 邀请发言接受
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RESULT_ACCEPT = 'speak_invite_result_accept';

/**
 * 邀请发言拒绝
 *
 * @type {string}
 */
exports.SPEAK_INVITE_RESULT_REJECT = 'speak_invite_result_reject';

/**
 * 新增一个正在申请发言
 *
 * @type {string}
 */
exports.SPEAK_APPLYING_ADD = 'speak_applying_add';

/**
 * 删除一个正在申请发言
 *
 * @type {string}
 */
exports.SPEAK_APPLYING_REMOVE = 'speak_applying_remove';

/**
 * 新增一个正在邀请发言
 *
 * @type {string}
 */
exports.SPEAK_INVITING_ADD = 'speak_inviting_add';

/**
 * 删除一个正在邀请发言
 *
 * @type {string}
 */

exports.SPEAK_INVITING_REMOVE = 'speak_inviting_remove';

exports.SPEAK_STATE_CHANGE = 'speak_state_change';

exports.PAGE_HIDE = 'page_hide';

exports.DOWNLINK_SERVER_CHANGE_TRIGGER = 'downlink_server_change_trigger';


/**
 * 清空消息
 *
 * @type {string}
 */
exports.MESSAGE_LIST_CLEAR = 'message_list_clear';

/**
 * playback event
 */

exports.PLAYBACK_INFO_FETCH_START = 'playback_info_fetch_start';
exports.PLAYBACK_INFO_FETCH_END = 'playback_info_fetch_end';
exports.PLAYBACK_INFO_FETCH_FAILED = 'playback_info_fetch_failed';

exports.PLAYBACK_SIGNAL_FETCH_START = 'playback_signal_fetch_start';
exports.PLAYBACK_SIGNAL_FETCH_END = 'playback_signal_fetch_end';

exports.PLAYBACK_SEEK_START = 'playback_seek_start';
exports.PLAYBACK_SEEK_END = 'playback_seek_end';

exports.PLAYBACK_ROOM_INFO_FETCH_FAILED = 'playback_room_info_fetch_failed';

exports.PLAYBACK_MEDIA_SEEK = 'playback_media_seek';

exports.PLAYBACK_VIDEO_FULLSCREEN = 'playback_video_fullscreen';


export default exports;