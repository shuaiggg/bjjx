export default {

  WHITEBOARD_DOM_CHANGE: 'whiteboard_dom_change',
  WHITEBOARD_LAYOUT_CHANGE: 'whiteboard_layout_change',

  PAGE_PREV_TRIGGER: 'page_prev_trigger',
  PAGE_NEXT_TRIGGER: 'page_next_trigger',

  PAINTER_CREATE_START: 'painter_create_start',
  PAINTER_CREATE_END: 'painter_create_end',

  PAINTER_DISPOSE_START: 'painter_dispose_start',
  PAINTER_DISPOSE_END: 'painter_dispose_end',

  /**
   * 文档图片加载开始
   *
   * @type {string}
   */
  DOC_IMAGE_LOAD_START: 'doc_image_load_start',

  CURRENT_DOC_IMAGE_LOAD_START: 'current_doc_image_load_start',

  /**
   * 文档图片加载完成
   *
   * @type {string}
   */
  DOC_IMAGE_LOAD_END: 'doc_image_load_end',
  CURRENT_DOC_IMAGE_LOAD_END: 'current_doc_image_load_end',

  /**
   * 文档图片加载成功
   *
   * @type {string}
   */
  DOC_IMAGE_LOAD_SUCCESS: 'doc_image_load_success',
  CURRENT_DOC_IMAGE_LOAD_SUCCESS: 'current_doc_image_load_success',

  /**
   * 文档图片加载中止
   *
   * @type {string}
   */
  DOC_IMAGE_LOAD_ABORT: 'doc_image_load_abort',
  CURRENT_DOC_IMAGE_LOAD_ABORT: 'current_doc_image_load_abort',

  /**
   * 文档图片加载错误
   *
   * @type {string}
   */
  DOC_IMAGE_LOAD_FAIL: 'doc_image_load_fail',
  CURRENT_DOC_IMAGE_LOAD_FAIL: 'current_doc_image_load_fail',

  /**
   * 文档图片加载超时
   *
   * @type {string}
   */
  DOC_IMAGE_LOAD_TIMEOUT: 'doc_image_load_timeout',
  CURRENT_DOC_IMAGE_LOAD_TIMEOUT: 'current_doc_image_load_timeout',

  /**
   * 文档图片没有找到
   *
   * @type {string}
   */
  DOC_IMAGE_NOT_FOUND: 'doc_image_not_found',

  /**
   * 当前页标注加载开始
   *
   * @type {string}
   */
  PAGE_SHAPE_LOAD_START: 'page_shape_load_start',

  /**
   * 当前页标注加载结束
   *
   * @type {string}
   */
  PAGE_SHAPE_LOAD_END: 'page_shape_load_end',
  CURRENT_PAGE_SHAPE_LOAD_END: 'current_page_shape_load_end',


  /**
   * 画笔鼠标移动
   *
   * @type {string}
   */
  PAINTER_CURSOR_MOVE: 'painter_cursor_move',

  /**
   * 切换课件自适应方式（触发）
   *
   * @type {string}
   */
  DOC_FIT_CHANGE_TRIGGER: 'doc_fit_change_trigger',

  /**
   * 切换课件自适应方式
   *
   * @type {string}
   */
  DOC_FIT_CHANGE: 'doc_fit_change',

  /**
   * 切换课件质量方式（触发）
   *
   * @type {string}
   */
  DOC_QUALITY_CHANGE_TRIGGER: 'doc_quality_change_trigger',

  /**
   * 切换课件质量方式
   *
   * @type {string}
   */
  DOC_QUALITY_CHANGE: 'doc_quality_change',

  /**
   * 切换画笔工具
   *
   * @type {string}
   */
  TOOL_CHANGE: 'tool_change',

  /**
   * 开始涂鸦
   *
   * @type {string}
   */
  DOODLE_DRAW_START: 'doodle_draw_start',

  /**
   * 正在涂鸦
   *
   * @type {string}
   */
  DOODLE_DRAWING: 'doodle_drawing',

  /**
   * 结束涂鸦
   *
   * @type {string}
   */
  DOODLE_DRAW_END: 'doodle_draw_end',

  /**
   * 涂鸦的光标移动
   *
   * @type {string}
   */
  DOODLE_CURSOR_MOVING: 'doodle_cursor_moving',

  PPT_SIZE_CHANGE: 'ppt_size_change',

  PPT_READY: 'ppt_ready',

  PPT_PAGE_CHANGE: 'ppt_page_change',

  PPT_STEP_CHANGE: 'ppt_step_change',

  STEP_PREV_TRIGGER: 'step_prev_trigger',

  STEP_NEXT_TRIGGER: 'step_next_trigger',
};