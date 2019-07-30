/**
 * @file 存储用户数据
 * @author zhujialu
 */

import config from '../config';
import store from '../store';
import eventEmitter from '../eventEmitter'

/**
 * id -> user 映射表，用于保证唯一
 *
 * @inner
 * @type {Object}
 */
const idToUserMap = {};

/**
 * number -> user 映射表，用于保证唯一
 *
 * @inner
 * @type {Object}
 */
const numberToUserMap = {};

function isValidUserId(userId) {
    return userId || userId === 0;
}

function getValidUser(userId) {
    const user = idToUserMap[userId];
    if (user && user === numberToUserMap[user.number]) {
        return user;
    }
}

function updateUser(user) {

    const isTeacher = user.type === config.ROLE_TYPE_TEACHER;
    const isSelf = user.id === store.get('user.id');

    const newUser = {};
    if (isTeacher) {
        Object.assign(newUser, store.get('teacher'));
    }
    if (isSelf) {
        Object.assign(newUser, store.get('user'));
    }
    Object.assign(newUser, user);
    if (isTeacher) {
        store.set('teacher', newUser);
    }
    if (isSelf) {
        store.set('user', newUser);
    }
    const presenterId = store.get('presenterId');
    if (presenterId) {
        if (user.id === presenterId) {
            store.set('presenter', newUser);
        }
    }
    else if (isTeacher) {
        store.set('presenterId', newUser.id);
        store.set('presenter', newUser);
    }

    return newUser;

}

function diff(obj1, obj2) {

    let differences = [];

    Object.entries(obj1).forEach(([key, value]) => {
        if (JSON.stringify(value) !== JSON.stringify(obj2[key])) {
            differences.push(key);
        }
    });

    return differences;

}

/**
 * 添加用户
 *
 * @param {Array|Object} userList
 * @param {boolean} fromUpdate
 */
const add = function (userList, fromUpdate) {

    if (!Array.isArray(userList)) {
        userList = [userList];
    }

    const newUserList = [];
    userList.forEach(user => {
        if (user) {
            const userId = user.id;
            const userNumber = user.number;
            if (isValidUserId(userId)) {

                if (getValidUser(userId)) {
                    update(user);
                    return;
                }

                if (userNumber != 0) {
                    const oldUser = numberToUserMap[user.number];
                    if (oldUser && isValidUserId(oldUser.id)) {
                        remove(oldUser.id);
                    }
                }

                user = updateUser(user);

                idToUserMap[userId] =
                    numberToUserMap[userNumber] = user;

                newUserList.push(user);

            }
        }
    });
    const groupData = group(newUserList);

    const teacherList = groupData.teacherList;
    if (teacherList.length === 1) {
        store.set('teacher', teacherList[0]);
        eventEmitter.trigger(
            eventEmitter.TEACHER_ADD,
            {
                userList: teacherList
            }
        );
    }

    const assistantList = groupData.assistantList;
    if (assistantList.length > 0) {
        eventEmitter.trigger(
            eventEmitter.ASSISTANT_ADD,
            {
                userList: assistantList
            }
        );
    }

    const studentList = groupData.studentList;
    if (studentList.length > 0) {
        eventEmitter.trigger(
            eventEmitter.STUDENT_ADD,
            {
                userList: studentList
            }
        );
    }


    if (newUserList.length > 0) {
        eventEmitter.trigger(
            eventEmitter.USER_ADD,
            {
                userList: newUserList
            }
        );
    }

};

/**
 * 删除用户
 *
 * @param {string} id 用户 id
 * @return {boolean}
 */
const remove = function (id) {

    const user = getValidUser(id);
    if (user) {

        user.videoOn =
            user.audioOn = null;

        let eventName;

        switch (user.type) {

            case config.ROLE_TYPE_TEACHER:
                eventName = eventEmitter.TEACHER_REMOVE;
                break;

            case config.ROLE_TYPE_ASSISTANT:
                eventName = eventEmitter.ASSISTANT_REMOVE;
                break;

            case config.ROLE_TYPE_STUDENT:
                eventName = eventEmitter.STUDENT_REMOVE;
                break;

            case config.ROLE_TYPE_GUEST:
                eventName = eventEmitter.GUEST_REMOVE;
                break;

        }

        delete idToUserMap[id];
        delete numberToUserMap[user.number];

        eventEmitter.trigger(
            eventName,
            {
                user: user
            }
        );

        eventEmitter.trigger(
            eventEmitter.USER_REMOVE,
            {
                user: user
            }
        );

        return true;

    }

    return false;
};



/**
 * 更新用户，比如切换音视频
 *
 * @param {Object} user
 */
const update = function (user) {
    const oldUser = getValidUser(user.id);
    if (oldUser != null) {

        // 判断是否有属性变化了
        // 如果所有属性都没变化，则不往下走
        const differences = diff(user, oldUser);
        if (differences.length === 0) {
            return;
        }

        const updateData = {};

        differences.forEach(key => {
            updateData[key] = user[key];
        });


        const newUser = updateUser(user);

        idToUserMap[user.id] =
            numberToUserMap[user.number] = newUser;

        let eventName;

        switch (user.type) {
            case config.ROLE_TYPE_TEACHER:
                eventName = eventEmitter.TEACHER_UPDATE;
                break;

            case config.ROLE_TYPE_ASSISTANT:
                eventName = eventEmitter.ASSISTANT_UPDATE;
                break;

            case config.ROLE_TYPE_STUDENT:
                eventName = eventEmitter.STUDENT_UPDATE;
                break;

            case config.ROLE_TYPE_GUEST:
                eventName = eventEmitter.GUEST_UPDATE;
                break;
        }

        // 这里要保证发出去的 user 是旧引用，这样全局才是相同的引用
        const eventData = {
            user: newUser,
            update: updateData
        };

        eventEmitter.trigger(
            eventName,
            eventData
        );

        eventEmitter.trigger(
            eventEmitter.USER_UPDATE,
            eventData
        );

        return newUser;

    }
    else if (!numberToUserMap[user.number]) {
        add(user);
    }
};

/**
 * 获取指定 id 的 user
 *
 * @param {string} userId
 * @return {Object?}
 */
const find = function (userId) {
    return getValidUser(userId);
};

/**
 * 通过 number 查找用户
 *
 * @param {string} userNumber
 * @return {Object?}
 */
const findByNumber = function (userNumber) {
    const user = numberToUserMap[userNumber];
    return user && getValidUser(user.id);
};

/**
 * 获取当前发言用户
 */
const active = function () {
    return all().filter(user => !!(user.videoOn || user.audioOn));
};

/**
 * 当前存储的用户
 */
const all = function () {

    const list = [];

    for (let userId in idToUserMap) {
        const user = getValidUser(userId);
        if (user) {
            list.push(user);
        }
    }

    return list;

};

/**
 * 用户角色分组
 *
 * @param {Array} userList
 * @return {Object}
 */
const group = function (userList) {

    const teacherList = [];
    const assistantList = [];
    const studentList = [];

    const group = userList || idToUserMap;
    for (let i in group) {
        const user = group[i];
        switch (user.type) {
            case config.ROLE_TYPE_TEACHER:
                teacherList.push(user);
                break;

            case config.ROLE_TYPE_ASSISTANT:
                assistantList.push(user);
                break;

            case config.ROLE_TYPE_STUDENT:
                studentList.push(user);
                break;

        }
    }

    return {
        teacherList: teacherList,
        assistantList: assistantList,
        studentList: studentList
    };
};

export default {
    add,
    remove,
    update,
    find,
    findByNumber,
    active,
    all,
    group,
}

