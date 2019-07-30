/**
 * 回放config
 * @author dujianhao
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;


export default {

  SECOND: SECOND,
  MINUTE: MINUTE,

  /**
   *==============================================================
   * 课件相关配置
   *==============================================================
   */

  /**
   * 课件图片质量 低
   *
   * @type {number}
   */
  DOC_QUALITY_LOW: 1,

  /**
   * 课件图片质量 高
   *
   * @type {number}
   */
  DOC_QUALITY_HIGH: 2,

  /**
   * 课件图片低质量获取比例
   *
   * @type {number}
   */
  DOC_QUALITY_LOW_RATIO: 0.6,


  /**
   * 课件图片自适应视图
   *
   * @type {number}
   */
  DOC_FIT_VIEW: 1,

  /**
   * 课件图片自适应宽度
   *
   * @type {number}
   */
  DOC_FIT_WIDTH: 2,

  /**
   * 课件是否可见(已打开)
   *
   * @type {number}
   */
  DOC_VISIBLE_TRUE: 1,

  /**
   * 课件是否可见(未打开)
   *
   * @type {number}
   */
  DOC_VISIBLE_FALSE: 0,

  /**
   *==============================================================
   * 服务器相关配置
   *==============================================================
   */

  /**
   * WebSocket 最大重连次数
   *
   * @type {number}
   */
  WEBSOCKET_TRY_CONNECT_COUNT: 1,

  /**
   * 发送心跳的时间间隔
   *
   * @type {number}
   */
  HEARTBEAT_INTERVAL: 10 * SECOND,

  /**
   * Master Server 连接超时时间
   *
   * @type {number}
   */
  MASTER_SERVER_CONNECT_TIMEOUT: 20 * SECOND,

  /**
   * 拉取服务器信息的超时时间
   *
   * @type {number}
   */
  SERVER_INFO_FETCH_TIMEOUT: SECOND,

  /**
   * Room Server 连接超时时间
   *
   * @type {number}
   */
  ROOM_SERVER_CONNECT_TIMEOUT: 20 * SECOND,

  /**
   * Chat Server 连接超时时间
   *
   * @type {number}
   */
  CHAT_SERVER_CONNECT_TIMEOUT: 20 * SECOND,

  /**
   * Server 重连延时
   *
   * @type {number}
   */
  SERVER_CONNECT_DELAY: 10 * SECOND,

  /**
   *==============================================================
   * 客户端相关配置
   *==============================================================
   */

  /**
   * 终端类型 电脑版网页
   *
   * @type {number}
   */
  END_TYPE_PC_BROWSER: 0,

  /**
   * 终端类型 电脑版客户端
   *
   * @type {number}
   */
  END_TYPE_PC_CLIENT: 1,

  /**
   * 终端类型 手机版网页
   *
   * @type {number}
   */
  END_TYPE_MOBILE_BROWSER: 2,

  /**
   * 终端类型 苹果 app
   *
   * @type {number}
   */
  END_TYPE_MOBILE_APPLE: 3,

  /**
   * 终端类型 安卓 app
   *
   * @type {number}
   */
  END_TYPE_MOBILE_ANDROID: 4,

  /**
   * 终端类型 mac直播助手
   *
   * @type {number}
   */
  END_TYPE_MAC_CLIENT: 5,

  END_TYPE_WEIXIN_XIAOCHENGXU: 6,

  /**
   *==============================================================
   * 教室相关配置
   *==============================================================
   */

  /**
   * 进入教室的最大尝试次数
   *
   * @type {number}
   */
  CLASSROOM_TRY_ENTER_COUNT: 3,

  /**
   * 进入教室的超时时间
   *
   * @type {number}
   */
  CLASSROOM_CONNECT_TIMEOUT: 155 * SECOND,

  /**
   *==============================================================
   * 音视频课程配置
   *==============================================================
   */

  /**
   * 音频课
   *
   * @type {number}
   */
  MEDIA_TYPE_AUDIO: 1,

  /**
   * 视频课
   *
   * @type {number}
   */
  MEDIA_TYPE_VIDEO: 0,


  /**
   *==============================================================
   * 用户相关配置
   *==============================================================
   */

  /**
   * 用户类型 - 老师
   *
   * @type {number}
   */
  ROLE_TYPE_TEACHER: 1,

  /**
   * 用户类型 - 助教
   *
   * @type {number}
   */
  ROLE_TYPE_ASSISTANT: 2,

  /**
   * 用户类型 - 学生
   *
   * @type {number}
   */
  ROLE_TYPE_STUDENT: 0,

  /**
   * 用户类型 - 游客
   *
   * @type {number}
   */
  ROLE_TYPE_GUEST: 3,

  /**
   * 用户类型 - 百家云公用账号
   *
   * @type {number}
   */
  ROLE_TYPE_PUBLIC: 5,

  /**
   * 每次请求更多用户的数量
   *
   * @type {number}
   */
  MORE_USER_COUNT: 20,

  /**
   * 用户状态 - 在线
   *
   * @type {number}
   */
  USER_STATUS_ONLINE: 0,

  /**
   * 用户状态 - 隐身
   *
   * @type {number}
   */
  USER_STATUS_HIDDEN: 1,

  /**
   *==============================================================
   * 摄像头相关配置
   *==============================================================
   */

  /**
   * 画质 - 流畅
   *
   * @type {number}
   */
  VIDEO_QUALITY_LOW: 0,

  /**
   * 画质 - 清晰
   *
   * @type {number}
   */
  VIDEO_QUALITY_MEDIUM: 1,

  /**
   * 画质 - 高清
   *
   * @type {number}
   */
  VIDEO_QUALITY_HIGH: 2,

  /**
   * 画质 - 超清
   *
   * @type {number}
   */
  VIDEO_QUALITY_SUPER: 3,

  /**
   * 画质 - 720-1M
   *
   * @type {number}
   */
  VIDEO_QUALITY_720P: 4,

  /**
   * 画质 - 1080-2M
   *
   * @type {number}
   */
  VIDEO_QUALITY_1080P: 5,

  /**
   * 画面比例 - 4:3
   *
   * @type {number}
   */
  CAMERA_RATIO_4_3: 0,

  /**
   * 画面比例 - 16:9
   *
   * @type {number}
   */
  CAMERA_RATIO_16_9: 1,

  /**
   * 举手模式
   *
   * @type {number}
   */
  SPEAK_STATE_LIMIT: 1,

  /**
   * 自由发言模式
   *
   * @type {number}
   */
  SPEAK_STATE_FREE: 0,

  /**
   *====================================================
   * 聊天面板
   *====================================================
   */

  /**
   * 弹出 debug 面板的话术
   *
   * @type {Array.<string>}
   */
  MESSAGE_DEBUG: [
    'zhls',
    'sgsx'
  ],

  /**
   *====================================================
   * 聊天
   *====================================================
   */

  /**
   * 2分钟内加一个时间戳
   *
   * @type {number}
   */
  MESSAGE_TIME_GAP: 2 * MINUTE,

  /**
   * 音频编码
   *
   * @type {number}
   */
  AUDIO_CODEC_AAC: 1,


  /**
   *==============================================================
   * 课程相关配置
   *==============================================================
   */

  /**
   * 一对一
   *
   * @type {number}
   */
  CLASS_TYPE_ONE_TO_ONE: 1,

  /**
   * 班课
   *
   * @type {number}
   */
  CLASS_TYPE_ONE_TO_MANY: 2,

  /**
   * 小班课
   *
   * @type {number}
   */
  CLASS_TYPE_MINI_CLASS: 3,

  /**
   * 一对一 和 班课 之外的类型
   *
   * @type {number}
   */
  CLASS_TYPE_UNKNOW: 0,

  /**
   * 机构x课
   * @type {number}
   */
  CLASS_TYPE_X_ONE_TO_MANY: 12,

  CLASS_TYPE_X_ONE_TO_ONE: 11,

  /**
   * 双师课堂
   *
   * @type {number}
   */
  CLASS_TYPE_DOUBLE_TEACHER: 5,

  /**
   * 音频编码
   *
   * @type {number}
   */
  AUDIO_CODEC_SPEEX: 2,

  /**
   * 链路类型 - TCP
   *
   * @type {number}
   */
  LINK_TYPE_TCP: 0,

  /**
   * 链路类型 - UDP
   *
   * @type {number}
   */
  LINK_TYPE_UDP: 1,

  /**
   * 输入音量的最大值
   *
   * @type {number}
   */
  MIC_VOLUME_MAX: 100,

  /**
   * 麦克风的默认音量
   *
   * @type {number}
   */
  MIC_VOLUME_DEFAULT: 100,

  /**
   * 扬声器的流最大音量
   *
   * @type {number}
   */
  SPEAKER_VOLUME_MAX: 100,

  /**
   * 扬声器的默认音量
   *
   * @type {number}
   */
  SPEAKER_VOLUME_DEFAULT: 80,

  /**
   * 允许私聊
   *
   * @type {number}
   */
  CAN_WHISPER: 1,

  /**
   * 向所有人发送发送的消息类型
   *
   * @type {number}
   */
  MESSAGE_TO_ALL: '-1',

  PLAYBACK_REQUEST: 'https://www.baijiayun.com',

  PLAYBACK_REQUEST_PRO: 'https://pro-www.baijiayun.com',

};