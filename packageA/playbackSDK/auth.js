import store from './store';
import config from './config';
import userData from './data/user';

/**
 * 用户是否是老师
 *
 * @param {?number} userType
 * @return {boolean}
 */
function isTeacher(userType) {
    if (userType == null) {
        userType = store.get('user').type;
    }
    return userType === config.ROLE_TYPE_TEACHER;
}

/**
 * 用户是否是主讲人
 *
 * @param {?number} userId
 * @return {boolean}
 */
function isPresenter(userId) {
    return store.get('presenterId') === userId;
}

/**
 * 用户是否是助教
 *
 * @param {?number} userType
 * @return {boolean}
 */
function isAssistant(userType) {
    if (userType == null) {
        userType = store.get('user').type;
    }
    return userType === config.ROLE_TYPE_ASSISTANT;
}

/**
 * 用户是否是学生
 *
 * @param {?number} userType
 * @return {boolean}
 */
function isStudent(userType) {
    if (userType == null) {
        userType = store.get('user').type;
    }
    return userType === config.ROLE_TYPE_STUDENT;
}

/**
 * 用户是否是游客
 *
 * @param {?number} userType
 * @return {boolean}
 */
function isGuest(userType) {
    if (userType == null) {
        userType = store.get('user').type;
    }
    return userType === config.ROLE_TYPE_GUEST;
}

/**
 * 用户是否是自己
 *
 * @param {string} userId
 * @return {boolean}
 */
function isSelf(userId) {
    return store.get('user.id') === userId;
}

/**
 * 是否是给自己分配的辅助摄像头的id
 *
 * @param {string} userId
 * @return {boolean}
 */
function isSelfAssist(userId) {
    return store.get('user.id2') === userId;
}

/**
 * 是否隐身
 *
 * @param {string} userId
 * @return {boolean}
 */
function isVisible(userId) {

    const user = userData.find(userId) || store.get('user');

    return user.status === config.USER_STATUS_ONLINE;

}

exports.isTeacher = isTeacher;
exports.isPresenter = isPresenter;
exports.isStudent = isStudent;
exports.isAssistant = isAssistant;
exports.isGuest = isGuest;
exports.isSelf = isSelf;
exports.isSelfAssist = isSelfAssist;
exports.isVisible = isVisible;


export default {
    isTeacher,
    isPresenter,
    isStudent,
    isAssistant,
    isGuest,
    isSelf,
    isSelfAssist,
    isVisible,
}