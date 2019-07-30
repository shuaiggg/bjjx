/**
 * @file 画笔
 * @author zhujialu
 */
import serial from '../../../function/serial';
import eventEmitter from '../../../eventEmitter';
import store from '../../../store';
import docData from '../../../data/doc';
import pageData from '../../../data/page';
import painterConfig from './config';

import Canvas from '../../../painter/src/Canvas';

const Doodle = Canvas.shapes.Doodle;
let drawing = false;


let canvasWidth;
let canvasHeight;

let painter;
let context;

const numberToIdMap = {};
let resizeTask;
let drawTimer;


const shapeMap = {};
shapeMap[painterConfig.toolLine] = Canvas.shapes.Line;
shapeMap[painterConfig.toolRect] = Canvas.shapes.Rect;
shapeMap[painterConfig.toolOval] = Canvas.shapes.Oval;
shapeMap[painterConfig.toolDoodle] = Canvas.shapes.Doodle;
shapeMap[painterConfig.toolPolygon] = Canvas.shapes.Polygon;
shapeMap[painterConfig.toolArrow] = Canvas.shapes.Arrow;
shapeMap[painterConfig.toolText] = Canvas.shapes.Text;
shapeMap[painterConfig.toolStar] = Canvas.shapes.Star;
shapeMap[painterConfig.toolHeart] = Canvas.shapes.Heart;
shapeMap[painterConfig.toolArrows] = function(props) {
  props.double = true;
  return new Canvas.shapes.Arrow(props);
};
shapeMap[painterConfig.toolTriangle] = Canvas.shapes.Polygon;

/**
 * 小数点后保留 4 位，如果少于 4 位，精度不够
 *
 * @inner
 * @param {string|number} value
 * @return {string} 为了保证原样收发，使用字符串类型
 */
function formatDecimal(value) {
  value = '' + value;
  return value.slice(0, 6);
}

function getPainterConfig() {
  return {
    fillStyle: 'transparent',
    strokeStyle: 'red',
    lineWidth: 1,
    strokePosition: 2,

    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: '#8f8f8f',

    radius: 0,
    hasShadow: true,

    // 这里是写死的值
    thickness: 6,
    fontFamily: 'sans-serif',
    caretColor: '#fff',
    hoverColor: '#fff000'
  };
}


/**
 * 序列化图形
 *
 * @inner
 * @param {Object} shape
 * @return {Object}
 */
function serializeShape(shape) {

  const json = shape.toJSON();

  json.id = shape.id;
  json.fillAlpha = 0;
  json.strokeAlpha = 0;

  if (json.name !== 'Oval' &&
    json.name !== 'Text'
  ) {
    json.autoClosePath = json.name !== 'Doodle';
    json.smooth = json.name === 'Doodle';
    json.name = 'Doodle';
  }

  if (shape.x) {
    if (json.name === 'Oval') {
      const leftTopX = shape.x - shape.width / 2;
      json.x = formatDecimal(leftTopX / canvasWidth);
    } else {
      json.x = formatDecimal(shape.x / canvasWidth);
    }
  }
  if (shape.y) {
    if (json.name === 'Oval') {
      const leftTopY = shape.y - shape.height / 2;
      json.y = formatDecimal(leftTopY / canvasHeight);
    } else {
      json.y = formatDecimal(shape.y / canvasHeight);
    }
  }

  if (json.points) {
    const points = [];
    shape.points.forEach(item => points.push({
      x: formatDecimal(item.x / canvasWidth),
      y: formatDecimal(item.y / canvasHeight)
    }));

    json.points = points;
    if (points.length) {
      json.x = points[0].x;
      json.y = points[0].y;
    }

  }

  if (shape.width) {
    json.width = formatDecimal(shape.width / canvasWidth);
  }
  if (shape.height) {
    json.height = formatDecimal(shape.height / canvasHeight);
  }

  if (shape.strokeStyle === 'transparent') {
    json.strokeStyle = '#000000';
  }

  if (shape.fillStyle === 'transparent') {
    json.fillStyle = '#000000';
  }

  if (shape.fontSize) {
    json.fontSize = formatDecimal(shape.fontSize / canvas.clientWidth);
  }
  if (shape.fillStyle !== 'transparent') {
    json.fillAlpha = 1;
  }
  if (shape.strokeStyle !== 'transparent') {
    json.strokeAlpha = 1;
  }
  // 如果没有自动闭合（针对 ios 老版本的兼容）
  if (json.name !== 'Oval' &&
    json.name !== 'Text' &&
    !json.autoClosePath
  ) {
    json.fillAlpha = 0;
    json.fillStyle = '#000000';
  }

  return json;

}

/**
 * 反序列化图形
 *
 * @inner
 * @param {Object} shape
 * @return {Object}
 */
function unserializeShape(shape) {

  const name = shape.name === 'Doodle' ?
    shape.autoClosePath ? 'Polygon' : 'Doodle' :
    shape.name;

  const result = {
    points: [],
    lineWidth: shape.lineWidth,
    strokeStyle: shape.strokeStyle,
    fillStyle: shape.fillStyle,
    name: name,
    id: shape.id,
    number: shape.number,
    text: shape.text,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    fontSize: shape.fontSize,
    fontWeight: shape.fontWeight,
    fontItalic: shape.fontItalic,
    fontFamily: shape.fontFamily
  };


  if (shape.strokeAlpha === 0) {
    result.strokeStyle = 'transparent';
  }

  if (shape.fillAlpha === 0) {
    result.fillStyle = 'transparent';
  }

  const points = [];
  if (shape.points && shape.points.length) {
    shape.points.forEach(item => points.push({
      x: Math.floor(item.x * canvasWidth),
      y: Math.floor(item.y * canvasHeight)
    }));
  }
  result.points = points;

  if (shape.width) {
    result.width = Math.floor(shape.width * canvasWidth);
  }
  if (shape.height) {
    result.height = Math.floor(shape.height * canvasHeight);
  }

  if (shape.x) {
    let realX = shape.x * canvasWidth;
    if (result.name === 'Oval') {
      realX = realX + result.width / 2;
    }
    result.x = Math.floor(realX);
  }
  if (shape.y) {
    let realY = shape.y * canvasHeight;
    if (result.name === 'Oval') {
      realY = realY + result.height / 2;
    }
    result.y = Math.floor(realY);
  }

  if (shape.fontSize) {
    result.computeFontSize = Math.floor(shape.fontSize * canvasWidth);
    result.fontSize = result.computeFontSize < 1.5 ? 1.5 : result.computeFontSize;
  }

  return result;

}

/**
 * 把信令传来的 shape 加入白板
 *
 * @inner
 * @param {Shape} shape
 */
function addShape(shape) {

  painter.addShape(
    unserializeShape(shape)
  );

}


function stopDrawTimer() {
  if (drawTimer) {
    drawTimer();
    drawTimer = null;
  }
}

function addShapes(shapes, silent) {

  const list = [];

  shapes.forEach(shape => {
    numberToIdMap[shape.number] = shape.id;
    const config = unserializeShape(shape);
    const toolPainter = config.name ?
      config.name.toLowerCase() :
      painterConfig.toolDoodle;

    list.push(
      new shapeMap[toolPainter](config)
    );
  });
  painter.addShapes(list, true);
}

exports.init = function(canvasContext, width, height) {
  let isPaging;


  drawing = false;

  context = canvasContext;
  canvasWidth = width;
  canvasHeight = height;

  painter = new Canvas(context, canvasWidth, canvasHeight);

  painter.apply(
    getPainterConfig()
  );


  // 监听painter的shape_add事件并绘制（addShapes时使用了silent参数，不会自动绘制，自动绘制时只会全局重绘）
  painter.emitter.on(Canvas.Emitter.SHAPE_ADD, function({
    shapes
  }) {
    shapes.forEach(shape => {
      shape.draw(painter.painter)
    })
  });

  eventEmitter
    .on(
      eventEmitter.SERVER_PAGE_CHANGE,
      function() {
        painter.clear();
      }
    )
    .on(
      eventEmitter.CLIENT_PAGE_CHANGE,
      function() {
        painter.clear();
      }
    )
    .on(
      eventEmitter.SHAPE_ADD,
      function(event, data) {

        if (isPaging) {
          return;
        }

        const page = pageData.getClientPage();
        const pageInfo = docData.getComplexPage(page);
        if (data.docId === pageInfo.docId && data.page === pageInfo.page) {
          addShapes([data.shape], true);
        }
      }
    )
    .on(
      eventEmitter.SHAPE_REMOVE,
      function(event, data) {
        if (store.get('user.id') === data.fromId) {
          return;
        }
        if (data.shapeId === '') {
          painter.clear();
          return;
        }
        const shapeIds = data.shapeId.split(',');
        const shapes = painter.getShapes().slice(0);
        shapes.reverse().forEach(shape => {
          if (shape.id && ~shapeIds.indexOf(shape.id)) {
            painter.removeShape(shape);
            delete(numberToIdMap[shape.number]);
          }
        });

      }
    )
    .on(
      eventEmitter.SHAPE_UPDATE,
      function(event, data) {

        const shapeList = data.shapeList;
        if (store.get('user.id') === data.fromId) {
          return;
        }
        const idShapeMap = {};
        shapeList.forEach(shape => idShapeMap[shape.id] = shape);

        painter.getShapes().forEach(shape => {
          if (shape.id && idShapeMap[shape.id]) {
            const config = unserializeShape(idShapeMap[shape.id]);
            Object.assign(shape, config);
            painter.refresh();
          }
        });
      }
    );


};

exports.draw = function(value) {
  if (value === true) {
    painter.drawing(Doodle);
  } else {
    painter.drawing(false);
  }

  drawing = !!value;
};

exports.create = function(shapeList) {
  stopDrawTimer();
  if (shapeList.length) {
    if (shapeList.length > 100) {
      const list = [];
      shapeList.forEach(shape => {
        list.push(
          function() {
            addShapes([shape]);
          }
        );
      });
      this.stopDrawTimer = serial(list, 20);
    } else {
      addShapes(shapeList);
    }
  }
};


exports.clear = function() {
  painter.clear();
};

exports.resize = function(width, height) {
  canvasHeight = height;
  canvasWidth = width;

  if (width > 0 && height > 0) {
    const fn = function() {
      if (painter) {
        painter.resize(width, height);
      }
    };

    if (painter) {
      fn();
    } else {
      resizeTask = fn;
    }

  }

};