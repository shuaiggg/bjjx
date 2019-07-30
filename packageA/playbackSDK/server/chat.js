/**
 * @file chat server 信令处理
 * @author zhujialu
 */

'use strict';

import eventEmitter from '../eventEmitter';
import camelCaseObject from '../function/camelCaseObject'

/**
 * 信令处理
 *
 * @inner
 * @type {Object}
 */
const messageTypes = {

    /**
     * 登录返回
     *
     * @param {Object} data
     * @property {number} data.code
     */
    login_res: function (data) {

        chatServer.startHeartbeat();

        if (data.code === 0) {
            eventEmitter.trigger(
                eventEmitter.CHAT_SERVER_LOGIN_SUCCESS,
                {
                    messageList: camelCaseObject(data.message_list)
                }
            );
        }
        else {
            eventEmitter.trigger(
                eventEmitter.CHAT_SERVER_LOGIN_FAIL
            );
        }

    },

    /**
     * 收到聊天信息
     *
     * @param {Object} data 内容的封装
     * @property {string} data.id
     * @property {number} data.time
     * @property {string} data.content 内容
     * @property {string} data.channel 频道
     * @property {Object} data.from 发送方的信息
     * @property {string} data.from.id
     * @property {string} data.from.name
     * @property {number} data.from.type
     * @property {string} data.from.number
     * @property {string} data.from.avatar
     * @property {number} data.from.end_type
     */
    message_receive: function (data) {
        var from = camelCaseObject(data.from);
        eventEmitter.trigger(
            eventEmitter.MESSAGE_RECEIVE,
            {
                id: data.id,
                time: data.time,
                content: data.content,
                channel: data.channel,
                data: data.data,
                from: {
                    id: from.id,
                    number: from.number,
                    name: from.name,
                    type: from.type,
                    status: from.status,
                    endType: from.endType,
                    avatar: from.avatar
                }
            }
        );
    },

    /**
     * 收到私聊聊天信息
     *
     * @param {Object} data 内容的封装
     * @property {number} data.time
     * @property {string} data.content 内容
     * @property {string} data.to 接收方的id
     * @property {Object} data.from 发送方的信息
     * @property {string} data.from.id
     * @property {string} data.from.name
     * @property {number} data.from.type
     * @property {string} data.from.number
     * @property {string} data.from.avatar
     * @property {number} data.from.end_type
     */
    message_whisper_receive: function (data) {
        var from = camelCaseObject(data.from);
        eventEmitter.trigger(
            eventEmitter.MESSAGE_RECEIVE,
            {
                time: data.time,
                content: data.content,
                data: data.data,
                to: data.to,
                from: {
                    id: from.id,
                    number: from.number,
                    name: from.name,
                    type: from.type,
                    status: from.status,
                    endType: from.endType,
                    avatar: from.avatar
                }
            }
        );
    },

    /**
     * 拉取聊天信息
     *
     * @param {Object} data 内容的封装
     * @property {string} data.id
     * @property {number} data.time
     * @property {string} data.content 内容
     * @property {string} data.channel 频道
     * @property {Object} data.from 发送方的信息
     * @property {string} data.from.id
     * @property {string} data.from.name
     * @property {number} data.from.type
     * @property {string} data.from.number
     * @property {string} data.from.avatar
     * @property {number} data.from.end_type
     */
    message_pull_res: function (data) {
        eventEmitter.trigger(
            eventEmitter.MESSAGE_PULL_RES,
            {
                next: data.next,
                channel: data.channel,
                hasMore: data.has_more,
                messageList: camelCaseObject(data.message_list)
            }
        );
    }
};

const chatServer = {

    messageTypes: messageTypes,

};
module.exports = chatServer;

export default chatServer;
