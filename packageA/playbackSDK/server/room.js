/**
 * @file websocket 封装
 * @author ansen(anchen@baijiahulian.com)
 */
import docData from '../data/doc';
import userData from '../data/user';
import store from '../store';
import auth from '../auth';
import config from '../config';
import eventEmitter from '../eventEmitter';

import camelCaseObject from '../function/camelCaseObject';
import inflatePoints from '../function/inflatePoints';

const tasks = [];


function executeByBuffer(operatorId, fn) {
    if (operatorId === store.get('user.id')) {
        return fn();
    }
    else {
        let buffer = +store.get('class.playBuffer') || 0;
        if (buffer > 0) {
            buffer *= 1000;
            const action = function () {
                fn();
                const index = tasks.indexOf(task);
                if (~index) {
                    tasks.splice(index, 1);
                }
            };
            const task = {
                action: action,
                buffer: buffer,
                timestamp: Date.now(),
                timer: setTimeout(action, buffer)
            };
            tasks.push(task);
        }
        else {
            return fn();
        }
    }
}


function updateProperty(source, sourceName, target, targetName) {
    if (sourceName in source) {
        target[targetName] = source[sourceName];
    }
}

/**
 * 信令处理
 *
 * @inner
 * @type {Object}
 */
var messageTypes = {

    /**
     * 登录返回
     *
     * @param {Object} data
     * @property {number} data.code
     * @property {string} data.user_id
     * @property {boolean} data.started
     * @property {number} data.speak_state
     * @property {number} data.user_count
     */
    login_res: function (data) {
        if (data.code === 0) {

            store.set({
                'class.started': data.started,
                'class.totalUserCount': data.accumulative_user_count,
                'class.userCount': data.user_count,
                'class.speakState': data.speak_state,
                'class.loginTime': data.timestamp * 1000,
                'class.diffNTP': data.timestamp * 1000 - Date.now(),
                'class.isFree': data.speak_state === config.SPEAK_STATE_FREE,
                'class.teacherSwitchable': data.teacher_switchable == 1,
                'class.classSwitch': data.class_switch == 1
            });


            roomServer.startHeartbeat();

            eventEmitter.trigger(
                eventEmitter.ROOM_SERVER_LOGIN_SUCCESS
            );

        }
    },

    /**
     * 重复登录被踢
     *
     * @param {Object} data
     * @property {Object} data.end_type 终端类型
     */
    login_conflict: function (data) {
        eventEmitter.trigger(
            eventEmitter.LOGIN_CONFLICT,
            {
                endType: data.end_type
            }
        );
    },

    /**
     * 上课
     */
    class_start: function (data) {
        eventEmitter.trigger(
            eventEmitter.CLASS_START
        );
    },

    /**
     * 下课
     */
    class_end: function (data) {
        executeByBuffer(
            data.user_id,
            function () {
                eventEmitter.trigger(
                    eventEmitter.CLASS_END
                );
            }
        );
    },

    /**
     * 首次进入，会将当前活跃用户信息传递过来
     *
     * @param {Object} data
     * @property {string} data.presenter_id
     * @property {Array} data.user_list
     */
    user_active_res: function (data) {
        console.log('user_active_res');

        const userList = (data.user_list || []).map(user => {
            user = camelCaseObject(user);
            if (user.mediaExt) {
                user.mediaExt = user.mediaExt.map(item => camelCaseObject(item));
            }
            return user;
        });

        // 因为 presenterId 是异步触发 watcher
        // 因此 USER_ACTIVE_RES 也改成异步
        const presenterId = data.presenter_id;
        store.set('presenterId', presenterId);
        eventEmitter.trigger(
            eventEmitter.USER_ACTIVE_RES,
            {
                userList: userList
            }
        );
        if (presenterId) {
            store.set('presenter', userData.find(presenterId));
        }

    },

    /**
     * 用户进入教室
     *
     * @param {Object} data
     * @property {Object} data.user
     * @property {boolean} data.override 是否覆盖别人进入
     */
    user_in: function (data) {

        // 判断该用户是否已在教室
        // 如果在，先自行触发 USER_OUT 和 音视频全关 信令
        // 如果依赖服务器做这件事，时序无法保证

        var user = data.user;
        if (auth.isSelf(user.id)) {
            return;
        }

        user = camelCaseObject(user);

        var trigger = function () {
            eventEmitter.trigger(
                eventEmitter.USER_IN,
                {
                    user: user
                }
            );
        };

        var oldUser;
        if (auth.isTeacher(user.type)) {
            var teacherId = store.get('teacher.id');
            if (teacherId) {
                oldUser = userData.find(teacherId);
            }
        }
        else {
            oldUser = userData.findByNumber(user.number);
        }

        trigger();

    },

    /**
     * 用户离开教室
     *
     * @param {Object} data
     * @property {string} data.user_id
     */
    user_out: function (data) {
        var userId = data.user_id;
        var user = userData.find(userId);
        if (user) {
            eventEmitter.trigger(
                eventEmitter.USER_OUT,
                {
                    user: user
                }
            );
        }
    },

    /**
     * 返回更多用户
     *
     * @param {Object} data
     * @param {boolean} data.has_more
     * @param {Array} data.user_list
     */
    user_more_res: function (data) {

        const userList = (data.user_list || []);
        map(user => camelCaseObject(user));

        eventEmitter.trigger(
            eventEmitter.USER_MORE_RES,
            {
                hasMore: data.has_more,
                userList: userList
            }
        );
    },

    /**
     * 用户总人数发生改变
     *
     * @param {Object} data
     * @property {number} data.user_count
     */
    user_count_change: function (data) {
        eventEmitter.trigger(eventEmitter.USER_COUNT_CHANGE, data);
        store.set({
            'class.totalUserCount': data.accumulative_user_count,
            'class.userCount': data.user_count
        });

    },

    /**
     * 公告栏内容发生改变
     *
     * @param {Object} data
     * @property {number} data.content
     */
    notice_change: function (data) {

        eventEmitter.trigger(
            eventEmitter.NOTICE_CHANGE,
            {
                content: data.content,
                link: data.link
            }
        );

    },

    /**
     * 获取公告栏内容
     *
     * @param {Object} data
     * @property {number} data.content
     */
    notice_res: function (data) {

        eventEmitter.trigger(
            eventEmitter.NOTICE_RES,
            {
                content: data.content,
                link: data.link
            }
        );

    },

    /**
     * 收到礼物的通知
     *
     * @param {Object} data
     * @property {Object} data.from 谁送的
     * @property {Object} data.to 送给谁
     * @property {Object} data.gift 礼物对象
     * @property {number} data.gift.type 礼物类型
     * @property {number} data.gift.amount 礼物金额
     * @property {number} data.gift.timestamp 赠送礼物的时间戳，由服务器生成
     */
    gift_receive: function (data) {

        eventEmitter.trigger(
            eventEmitter.GIFT_RECEIVE,
            {
                from: camelCaseObject(data.from),
                to: camelCaseObject(data.to),
                gift: data.gift
            }
        );

    },

    /**
     * 我收到的礼物列表
     *
     * @param {Object} data
     * @property {Array} data.history
     */
    my_gift_res: function (data) {

        const history = data.history.map(item => ({
            from: camelCaseObject(item.from),
            gift: item.gift
        }));

        eventEmitter.trigger(
            eventEmitter.MY_GIFT_RES,
            {
                history: history
            }
        );

    },

    /**
     * 广播谁被禁言了
     *
     * @param {Object} data
     * @property {Object} data.from 谁发出的禁言命令
     * @property {Object} data.to 要禁止谁发言
     * @property {number} data.duration 禁言时长
     */
    message_send_forbid: function (data) {

        var from = camelCaseObject(data.from);
        var to = camelCaseObject(data.to);

        eventEmitter.trigger(
            eventEmitter.MESSAGE_SEND_FORBID,
            {
                from: from,
                to: to,
                forbidSelf: auth.isSelf(to.id),
                duration: data.duration
            }
        );

    },

    /**
     * 返回所有文档
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     * @property {Array} data.doc_list
     */
    doc_all_res: function (data) {

        var docList = (data.doc_list || []).map(doc => camelCaseObject(doc));

        // 转换为老接口
        docList.forEach(doc => {
            // 转化为老接口
            const pageArr = [];
            let number = 0;
            const pageInfo = doc.pageInfo;

            const docWidth = pageInfo.width;
            const docHeight = pageInfo.height;
            const urlPrefix = pageInfo.urlPrefix;
            const totalPages = +pageInfo.totalPages;
            const isDoc = pageInfo.isDoc;
            const url = pageInfo.url;


            // 上传的是文档类型
            if (isDoc) {
                while (number < totalPages) {
                    pageArr[number] = {
                        width: docWidth,
                        height: docHeight,
                        url: urlPrefix + '_' + (++number) + '.png'
                    };
                }
            }
            // 上传的是单张图片
            else {
                pageArr[number] = {
                    width: docWidth,
                    height: docHeight,
                    url: url
                };
            }

            doc.pageList = pageArr;
        });

        eventEmitter.trigger(
            eventEmitter.DOC_ALL_RES,
            {
                docList: docList
            }
        );

        var eventData = {
            docId: data.doc_id,
            page: data.page,
        };
        if (typeof data.step === 'number') {
            eventData.step = data.step;
        }

        eventEmitter.trigger(
            eventEmitter.SERVER_PAGE_CHANGE,
            eventData
        );

    },

    /**
     * 添加文档
     *
     * @param {Object} data
     * @property {Object} data.doc
     */
    doc_add: function (data) {
        var pageInfo = data.doc.page_info;
        var totalPage = pageInfo.total_pages;
        var isDoc = pageInfo.is_doc;

        var number = 0;

        data.doc.page_list = [];
        // doc新接口，转换成之前的接口
        // 是文档类型，需要遍历一下
        if (isDoc) {
            while (number < totalPage) {
                data.doc.page_list[number] = {
                    width: pageInfo.width,
                    height: pageInfo.height,
                    url: pageInfo.url_prefix + '_' + (++number) + '.png'
                };
            }
        }
        // 不是文档类型，直接取url
        else {
            data.doc.page_list[number] = {
                width: pageInfo.width,
                height: pageInfo.height,
                url: pageInfo.url
            };
        }

        executeByBuffer(
            data.user_id,
            function () {
                eventEmitter.trigger(
                    eventEmitter.DOC_ADD,
                    {
                        fromId: data.user_id,
                        doc: camelCaseObject(data.doc)
                    }
                );
            }
        );

    },

    doc_update: function (data) {
        eventEmitter.trigger(
            eventEmitter.DOC_UPDATE,
            {
                fromId: data.user_id,
                docId: data.doc_id,
                extra: camelCaseObject(data.extra)
            }
        );
    },

    /**
     * 删除文档
     *
     * @param {Object} data
     * @property {string} data.doc_id
     */
    doc_del: function (data) {
        executeByBuffer(
            data.user_id,
            function () {
                var doc = docData.remove(data.doc_id);
                eventEmitter.trigger(
                    eventEmitter.DOC_REMOVE,
                    {
                        fromId: data.user_id,
                        docId: doc.id,
                        docNumber: doc.number
                    }
                );
            }
        );
    },

    /**
     * 绑定文档
     *
     * @param {Object} data
     * @property {number} data.code
     */
    doc_attach_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.DOC_ATTACH_RES,
            {
                code: data.code
            }
        );
    },

    /**
     * 解绑文档
     *
     * @param {Object} data
     * @property {number} data.code
     */
    doc_detach_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.DOC_DETACH_RES,
            {
                code: data.code
            }
        );
    },

    /**
     * 已绑定文档列表
     *
     * @param {Object} data
     * @property {Array} data.doc_list
     */
    doc_library_list_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.DOC_LIBRARY_LIST_RES,
            {
                docList: data.doc_list
            }
        );
    },

    /**
     * 翻页
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     */
    page_change: function (data) {
        executeByBuffer(
            data.user_id,
            function () {
                var eventData = {
                    docId: data.doc_id,
                    page: data.page,
                };
                if (typeof data.step === 'number') {
                    eventData.step = data.step;
                }
                eventEmitter.trigger(
                    eventEmitter.SERVER_PAGE_CHANGE,
                    eventData
                );
            }
        );
    },

    /**
     * 清除所有画笔
     *
     */
    record_shape_clean_res: function () {

        eventEmitter.trigger(
            eventEmitter.RECORD_SHAPE_CLEAN
        );

    },

    /**
     * 返回某页的全部标注
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     * @property {Array} data.shape_list
     */
    shape_all_res: function (data) {

        const shapeList = data.shape_list || [];

        shapeList.forEach(shape => {
            shape.points = inflatePoints(shape);
        });

        eventEmitter.trigger(
            eventEmitter.SHAPE_ALL_RES,
            {
                docId: data.doc_id,
                page: data.page,
                shapeList: shapeList
            }
        );
    },

    /**
     * 添加标注
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     * @property {Array} data.shape
     */
    shape_add: function (data) {
        executeByBuffer(
            data.user_id,
            function () {
                const shape = data.shape;

                shape.points = inflatePoints(shape);

                eventEmitter.trigger(
                    eventEmitter.SHAPE_ADD,
                    {
                        fromId: data.user_id,
                        docId: data.doc_id,
                        page: data.page,
                        shape: shape
                    }
                );
            }
        );
    },

    /**
     * 删除标注
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     * @property {string} data.shape_id
     */
    shape_del: function (data) {
        if (data.record_clean) {
            eventEmitter.trigger(
                eventEmitter.RECORD_SHAPE_CLEAN
            );
            return;
        }
        executeByBuffer(
            data.user_id,
            function () {
                eventEmitter.trigger(
                    eventEmitter.SHAPE_REMOVE,
                    {
                        fromId: data.user_id,
                        docId: data.doc_id,
                        page: data.page,
                        shapeId: data.shape_id || ''
                    }
                );
            }
        );
    },

    /**
     * 更新标注
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     * @property {Array.<Object>} data.shape_list
     */
    shape_update: function (data) {

        executeByBuffer(
            data.user_id,
            function () {
                var shapeList = data.shape_list;

                shapeList.forEach(shape => {
                    shape.points = inflatePoints(shape);
                });

                eventEmitter.trigger(
                    eventEmitter.SHAPE_UPDATE,
                    {
                        fromId: data.user_id,
                        docId: data.doc_id,
                        page: data.page,
                        shapeList: shapeList
                    }
                );
            }
        );

    },

    /**
     * 激光笔
     *
     * @param {Object} data
     * @property {string} data.doc_id
     * @property {number} data.page
     * @property {Object} data.shape
     */
    shape_laser: function (data) {

        executeByBuffer(
            data.user_id,
            function () {
                eventEmitter.trigger(
                    eventEmitter.SHAPE_LASER,
                    {
                        fromId: data.user_id,
                        docId: data.doc_id,
                        page: data.page,
                        shape: data.shape
                    }
                );
            }
        );

    },

    /**
     * 音视频开关状态发生改变
     *
     * @param {Object} data
     * @property {boolean} data.video_on
     * @property {boolean} data.audio_on
     * @property {number} data.publish_index
     * @property {Object} data.publish_server
     * @property {Object} data.user
     */
    media_publish: function (data) {

        var mediaPublish = function () {
            var user = camelCaseObject(data.user);
            if (!userData.find(user.id)) {
                return false;
            }

            var params = {};

            if (typeof data.video_on === 'boolean') {
                params.videoOn =
                    user.videoOn = data.video_on;
            }

            if (typeof data.audio_on === 'boolean') {
                params.audioOn =
                    user.audioOn = data.audio_on;
            }
            if (typeof data.audio_mixed === 'number') {
                params.audioMixed =
                    user.audioMixed = data.audio_mixed;
            }
            if (typeof data.skip_release === 'number') {
                params.skipRelease = data.skip_release == 1;
            }
            if (typeof data.support_mute_stream === 'number') {
                params.supportMuteStream = user.supportMuteStream = data.support_mute_stream == 1;
            }
            if (typeof data.is_screen_sharing === 'number') {
                params.isScreenSharing = user.isScreenSharing = data.is_screen_sharing == 1;
            }
            if (typeof data.support_black_stream === 'number') {
                params.supportBlackStream = user.supportBlackStream = data.support_black_stream == 1 ? true : false;
            }
            if (typeof data.action_type === 'number') {
                params.actionType = data.action_type;
            }
            if (typeof data.offset_timestamp == 'number') {
                params.offsetTimestamp = data.offset_timestamp;
            }

            updateProperty(data, 'publish_index', user, 'publishIndex');
            updateProperty(data, 'publish_server', user, 'publishServer');
            updateProperty(data, 'link_type', user, 'linkType');

            params.user = userData.update(user) || user;
            params.linkType = user.linkType;
            params.user.canPlay = true;


            eventEmitter.trigger(
                eventEmitter.MEDIA_PUBLISH,
                params
            );

            return true;
        };

        return executeByBuffer(
            data.user_id,
            mediaPublish
        );

    },

    /**
     * 辅助摄像头发布
     *
     * @param data
     */
    media_publish_ext: function (data) {

        var user = camelCaseObject(data.user);

        var params = {};

        if (typeof data.video_on === 'boolean') {
            params.videoOn =
                user.assistVideoOn = data.video_on;
        }

        if (typeof data.audio_on === 'boolean') {
            params.audioOn = user.assistAudioOn = data.audio_on;
        }

        updateProperty(data, 'publish_index', user, 'publishIndex');
        updateProperty(data, 'publish_server', user, 'publishServer');
        updateProperty(data, 'link_type', user, 'linkType');

        params.user = Object.assign({}, userData.update(user) || user);
        params.user.videoOn = params.videoOn;
        params.user.audioOn = false;
        params.linkType = user.linkType;
        params.mediaId = data.media_id;

        eventEmitter.trigger(
            eventEmitter.ASSIST_MEDIA_PUBLISH,
            params
        );
    },

    /**
     * 音视频关了再开
     *
     * @param {Object} data
     * @property {boolean} data.video_on
     * @property {boolean} data.audio_on
     * @property {number} data.publish_index
     * @property {Object} data.publish_server
     * @property {Object} data.user
     */
    media_republish: function (data) {

        var mediaRepublish = function () {
            var user = camelCaseObject(data.user);

            var params = {};

            if (data.video_on === true) {
                params.videoOn =
                    user.videoOn = true;
            }

            if (data.audio_on === true) {
                params.audioOn =
                    user.audioOn = true;
            }
            if (typeof data.audio_mixed === 'number') {
                params.audioMixed =
                    user.audioMixed = data.audio_mixed;
            }

            var currentUser = userData.find(user.id);
            if (currentUser && user.publishIndex > currentUser.publishIndex) {
                params.switchServer = true;
            }
            if (typeof data.support_mute_stream === 'number') {
                params.supportMuteStream = user.supportMuteStream = data.support_mute_stream == 1;
            }
            if (typeof data.is_screen_sharing === 'number') {
                params.isScreenSharing = user.isScreenSharing = data.is_screen_sharing == 1;
            }
            if (typeof data.support_black_stream === 'number') {
                params.supportBlackStream = user.supportBlackStream = data.support_black_stream == 1;
            }
            if (typeof data.action_type === 'number') {
                params.actionType = data.action_type;
            }

            updateProperty(data, 'publish_index', user, 'publishIndex');
            updateProperty(data, 'publish_server', user, 'publishServer');
            updateProperty(data, 'link_type', user, 'linkType');

            params.user = userData.update(user) || user;
            params.user.canPlay = true;
            params.linkType = user.linkType;
            params.mediaId = data.media_id;
            eventEmitter.trigger(
                eventEmitter.MEDIA_REPUBLISH,
                params
            );
        };
        executeByBuffer(
            data.user_id,
            mediaRepublish
        );
    },


    /**
     * 辅助摄像头音视频关了再开
     */
    media_republish_ext: function (data) {

        var user = camelCaseObject(data.user);

        var params = {};

        if (data.video_on === true) {
            params.videoOn =
                user.assitVideoOn = true;
        }

        if (data.audio_on === true) {
            params.audioOn =
                user.assitAudioOn = true;
        }

        var currentUser = userData.find(user.id);
        if (currentUser && user.publishIndex > currentUser.publishIndex) {
            params.switchServer = true;
        }

        updateProperty(data, 'publish_index', user, 'publishIndex');
        updateProperty(data, 'publish_server', user, 'publishServer');
        updateProperty(data, 'link_type', user, 'linkType');

        params.user = userData.update(user) || user;
        params.linkType = user.linkType;
        params.mediaId = data.media_id;

        eventEmitter.trigger(
            eventEmitter.ASSIST_MEDIA_REPUBLISH,
            params
        );
    },

    /**
     * 举手模式下学生申请发言
     *
     * @param {Object} data
     * @property {Object} data.from
     */
    speak_apply_req: function (data) {
        eventEmitter.trigger(
            eventEmitter.SPEAK_APPLY_REQ,
            {
                user: camelCaseObject(data.from)
            }
        );
    },

    /**
     * 老师回应学生举手模式下的申请
     *
     * @param {Object} data
     * @property {Object} data.user
     * @property {number} data.speak_state
     */
    speak_apply_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.SPEAK_APPLY_RES,
            {
                speakState: data.speak_state,
                user: camelCaseObject(data.user),
                fromId: data.user_id
            }
        );
    },

    /**
     * 收到用户当前状态
     *
     * @param {Object} data
     * @property {string} data.user_number
     * @property {Object} data.user_state
     */
    user_state_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.USER_STATE_RES,
            {
                userNumber: data.user_number,
                userState: camelCaseObject(data.user_state)
            }
        );
    },

    /**
     * 收到分组人数
     *
     * @param {Object} data
     * @property {string} data.group_size
     */
    group_size_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.GROUP_SIZE_RES,
            data.group_size
        );
    },

    /**
     *
     * @param {Object} data
     * @property {string} data.key
     * @property {*} data.value
     */
    broadcast_cache_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.BROADCAST_CACHE_RES,
            {
                key: data.key,
                value: data.value,
                fromId: data.user_id
            }
        );
    },


    /**
     * 搜索用户的结果
     *
     * @param {Object} data
     * @property {Object} data.result
     */
    user_search_res: function (data) {

        const result = (data.result || []).map(user => camelCaseObject(user));

        eventEmitter.trigger(
            eventEmitter.USER_SEARCH_RES,
            {
                result: result
            }
        );
    },

    command_receive: function (data) {

        eventEmitter.trigger(
            eventEmitter.COMMAND_RECEIVE,
            {
                fromId: data.from,
                command: data.data
            }
        );

    },

    /**
     * 接收广播
     *
     * @param {Object} data
     * @property {string} data.user_id
     * @property {string} data.key
     * @property {Object} data.value
     */
    broadcast_receive: function (data) {

        eventEmitter.trigger(
            eventEmitter.BROADCAST_RECEIVE,
            {
                fromId: data.user_id,
                key: data.key,
                value: data.value
            }
        );

    },

    /**
     * 返回之前的小测题目信息
     *
     * @param  {Object} data
     * @property {Array} survey_list
     * @property {number} survey_list.order
     * @property {string} survey_list.question
     * @property {boolean} survey_list.answer_cout
     * @property {Array} survey_list.option_list
     * @property {string} survey_list.option_list.key
     * @property {string} survey_list.option_list.value
     * @property {boolean} survey_list.option_list.is_answer
     * @property {number} survey_list.option_list.user_count
     */
    survey_prev_res: function (data) {
        var surveyList = data.survey_list;
        var goldMedalCount = data.gold_medal_count;
        var silverMedalCount = data.silver_medal_count;

        if (surveyList.length) {
            surveyList = camelCaseObject(surveyList);
        }

        eventEmitter.trigger(
            eventEmitter.SURVEY_PREV_RES,
            {
                surveyList: surveyList,
                goldMedalCount: goldMedalCount,
                silverMedalCount: silverMedalCount
            }
        );
    },

    /**
     * 接收老师题目模块
     *
     * @param  {Object} data
     * @property {Array} survey_list
     * @property {number} survey_list.order
     * @property {string} survey_list.question
     * @property {boolean} survey_list.answer_cout
     * @property {Array} survey_list.option_list
     * @property {string} survey_list.option_list.key
     * @property {string} survey_list.option_list.value
     * @property {boolean} survey_list.option_list.is_answer
     */
    survey_receive: function (data) {

        var surveyList = data.survey_list;

        if (surveyList) {
            surveyList = camelCaseObject(surveyList);
        }

        eventEmitter.trigger(
            eventEmitter.SURVEY_QUESTION_RECEIVE,
            {
                surveyList: surveyList
            }
        );
    },

    /**
     * 答题结果数据
     *
     * @param  {Object} data
     * @property {Object} survey_list
     * @property {number} survey_list.order      题号
     * @property {Object} survey_list.result
     * @property {number} survey_list.result.A   A选项人数
     * @property {number} survey_list.result.B   B选项人数
     * @property {number} survey_list.right_count 正确人数
     * @property {number} survey_list.wrong_count 错误人数
     * @property {number} survey_list.free_count  没有答案人数
     */
    survey_answer_count: function (data) {
        var surveyList = data.survey_list;

        if (surveyList) {
            surveyList = camelCaseObject(surveyList);
        }

        eventEmitter.trigger(
            eventEmitter.SURVEY_ANSWER_COUNT,
            {
                surveyList: surveyList
            }
        );
    },

    /**
     * 答题结果数据
     *
     * @param  {Object} data
     * @property {Object} survey_list
     * @property {number} survey_list.order      题号
     * @property {Object} survey_list.result
     * @property {Array} survey_list.result.A   A选项人名
     * @property {Array} survey_list.result.B   B选项人名
     */
    survey_answer_user: function (data) {
        var surveyList = data.survey_list;

        if (surveyList) {
            surveyList = camelCaseObject(surveyList);
        }

        eventEmitter.trigger(
            eventEmitter.SURVEY_ANSWER_USER,
            {
                surveyList: surveyList
            }
        );
    },

    /**
     * 到课名单数据
     *
     * @param {Object} data
     * @property {Array} students
     * @property {string} students.number           用户id
     * @property {string} students.name             用户昵称
     * @property {number} students.first_login_time 最早进入时间
     * @property {number} students.last_logout_time 最后退出时间
     */
    student_list_res: function (data) {
        var studentList = data.students;

        eventEmitter.trigger(
            eventEmitter.STUDENT_LIST_RES,
            {
                studentList: camelCaseObject(studentList)
            }
        );
    },

    cloud_record_stop: function (data) {
        eventEmitter.trigger(
            eventEmitter.CLOUD_RECORD_END_TRIGGER
        );
    },

    /**
     * 教师内是否已经发奖
     * @param  {Object} data
     * @property {boolean} lottery_complete
     */
    lottery_complete_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.LOTTERY_COMPLETE_RES,
            {
                complete: data.complete,
                lotteryCode: data.lottery_code,
                lotteryNumber: data.lottery_number,
                lotteryName: data.lottery_name
            }
        );
    },

    /**
     * 接收中奖信息
     * @param  {Object} data
     * @property {string} lottery_name
     * @property {number} lottery_number
     */
    lottery_receive: function (data) {

        eventEmitter.trigger(
            eventEmitter.LOTTERY_RECEIVE,
            {
                lotteryName: data.lottery_name,
                lotteryNumber: data.lottery_number
            }
        );
    },


    /**
     * 开奖结果
     * @param {Object} data
     * @property {boolean} win
     */
    lottery_draw_res: function (data) {

        eventEmitter.trigger(
            eventEmitter.LOTTERY_DRAW_RES,
            {
                isWin: data.win,
                lotteryCode: data.lottery_code
            }
        );
    },

    /**
     * 中奖列表信息
     * @param  {Object} data [description]
     * @property {string} data.lottery_name
     * @property {number} data.lottery_number
     * @property {Array} data.winnerList
     */
    lottery_result_res: function (data) {
        var winnerList = data.winner_list;

        if (winnerList.length) {
            winnerList = camelCaseObject(winnerList);
        }

        eventEmitter.trigger(
            eventEmitter.LOTTERY_RESULT_RES,
            {
                winnerList: winnerList,
                lotteryName: data.lottery_name,
                lotteryNumber: data.lottery_number
            }
        );
    },

    /**
     * 点名
     *
     * @param {Object} data
     * @property {number} data.duration 倒计时
     */
    roll_call: function (data) {
        eventEmitter.trigger(
            eventEmitter.ROLL_CALL,
            {
                duration: data.duration,
            }
        );
    },

    /**
     * 点名结果
     *
     * @param {Object} data
     */
    roll_call_result: function (data) {
        eventEmitter.trigger(
            eventEmitter.ROLL_CALL_RESULT,
            {
                sessionId: data.session_id,
                ackList: data.ack_list,
                nackList: data.nack_list,
            }
        );
    },

    /**
     * 邀请发言
     *
     * @param {Object} data
     * @property {string} data.to 目标用户 id
     * @property {number} data.invite 1 邀请 0 取消
     */
    speak_invite_req: function (data) {
        eventEmitter.trigger(
            eventEmitter.SPEAK_INVITE_REQ,
            {
                to: data.to,
                invite: data.invite,
            }
        );
    },

    /**
     * 学生回复老师的发言邀请
     *
     * @param {Object} data
     * @property {number} data.confirm
     */
    speak_invite_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.SPEAK_INVITE_RES,
            {
                confirm: data.confirm,
                fromId: data.user_id
            }
        );
    },

    /**
     * 老师进教室会发的当前正在邀请的学生列表
     *
     * @param {Object} data
     * @property {Array.<string>} data.user_list
     */
    speak_invite_pending_list: function (data) {
        var userIdList = data.user_list;
        if (userIdList) {
            eventEmitter.trigger(
                eventEmitter.SPEAK_INVITE_PENDING_LIST,
                {
                    userIdList: userIdList
                }
            );
        }
    },

    /**
     * 后端转发确认
     *
     * @param {Object} data
     * @property {string} message_type
     * @property {string} command
     */
    cloud_record_command_accept: function (data) {
        eventEmitter.trigger(
            eventEmitter.CLOUD_RECORD_COMMAND_ACCEPT,
            data.command
        );
    },

    /**
     * 切换主讲人
     *
     * @param {Object} data
     * @property {string} data.presenter_id
     */
    presenter_change: function (data) {
        var presenterId = data.presenter_id;
        store.set({
            presenterId: presenterId,
            presenter: userData.find(presenterId)
        });
        eventEmitter.trigger(
            eventEmitter.PRESENTER_CHANGE,
            {
                presenterId: presenterId
            }
        );
    },

    /**
     * 修改分辨率
     *
     * @param {Object} data
     * @property {number} data.width
     * @property {number} data.height
     * @property {number} data.user_id
     * @return {Object}
     */
    video_resolution_change: function (data) {
        var userId = data.user_id;
        var user = userData.find(userId);
        if (user) {
            user.videoResolution = {
                width: data.width,
                height: data.height,
            };
            eventEmitter.trigger(
                eventEmitter.VIDEO_RESOLUTION_CHANGE,
                {
                    width: data.width,
                    height: data.height,
                    userId: userId
                }
            );
        }
    },

    /**
     * 切换教室
     */
    class_switch: function (data) {
        eventEmitter.trigger(
            eventEmitter.CLASS_SWITCH
        );
    },

};


const roomServer = {

    messageTypes: messageTypes,

};

module.exports = roomServer;

export default roomServer;

