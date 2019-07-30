/**
 * @file 画笔
 * @author musicode
 */
import smoothPoints from './algorithm/smoothPoints';

export default class Painter {

  constructor(context, width, height) {
    this.context = context;
    this.width = width;
    this.height = height;
  }

  getCanvasSize() {
    const { width, height } = this
    return {
      width: width,
      height: height
    }
  }

  begin() {
    this.context.beginPath()
  }

  close() {
    this.context.closePath()
  }

  drawRect(x, y, width, height) {
    this.context.rect(x, y, width, height)
  }

  drawOval(x, y, width, height) {
    let { context } = this
    if (width === height) {
      const radius = width / 2
      context.moveTo(x + radius, y)
      context.arc(x, y, radius, 0, 2 * Math.PI, true)
    }
    else {
      let { context } = this
      if (width === height) {
        const radius = width / 2
        context.moveTo(x + radius, y)
        context.arc(x, y, radius, 0, 2 * Math.PI, true)
      }
      else {
        const w = (width / 0.75) / 2, h = height / 2
        const points = [
            {
              x: x,
              y: y - h
            },

            {
              x: x + w,
              y: y - h
            },

            {
              x: x + w,
              y: y + h
            },

            {
              x: x,
              y: y + h
            },

            {
              x: x - w,
              y: y + h
            },

            {
              x: x - w,
              y: y - h
            }
        ];
        context.moveTo(points[0].x, points[0].y)
        context.bezierCurveTo(points[1].x, points[1].y, points[2].x, points[2].y, points[3].x, points[3].y)
        context.bezierCurveTo(points[4].x, points[4].y, points[5].x, points[5].y, points[0].x, points[0].y)
      }
      const w = (width / 0.75) / 2, h = height / 2
      context.moveTo(x, y - h)
      context.bezierCurveTo(x + w, y - h, x + w, y + h, x, y + h)
      context.bezierCurveTo(x - w, y + h, x - w, y - h, x, y - h)
    }
  }

  drawPoints(points, smooth) {
    if (points.length > 1) {
      let pointsToDraw = points
      if (smooth) {
        pointsToDraw = smoothPoints(points)
      }
      const point = pointsToDraw[0]
      this.moveTo(point.x, point.y)
      pointsToDraw.forEach(point => {
          this.lineTo(point.x, point.y)
      })
    }
  }

  stroke() {
    this.context.stroke()
  }
  draw(reserve) {
    this.context.draw(reserve)
  }

  fill() {
    this.context.fill()
  }

  strokeRect(x, y, width, height) {
    this.context.strokeRect(x, y, width, height)
  }

  fillRect(x, y, width, height) {
    this.context.fillRect(x, y, width, height)
  }

  strokeText(x, y, text) {
    this.context.strokeText(text, x, y)
  }

  fillText(x, y, text) {
    this.context.fillText(text, x, y)
  }

  measureText(text) {
    return this.context.measureText(text)
  }
  isPointInPath(x, y) {
    return this.context.isPointInPath(x, y)
  }

  clear() {
    let { context } = this
    context.draw();
    //context.clearRect(0, 0, this.width, this.height)
  }

  moveTo(x, y) {
    this.context.moveTo(x, y)
  }

  lineTo(x, y) {
    this.context.lineTo(x, y)
  }

  arc(x, y, radius, startAngle, endAngle, CCW) {
    this.context.arc(x, y, radius, startAngle, endAngle, CCW)
  }

  bezierCurveTo(x1, y1, x2, y2, x, y) {
    this.context.bezierCurveTo(x1, y1, x2, y2, x, y)
  }

  createLinearGradient(x1, y1, x2, y2) {
    return this.context.createLinearGradient(x1, y1, x2, y2)
  }

  enableShadow(offsetX, offsetY, blur, color) {
    return this.context.setShadow(offsetX, offsetY, blur, color);
  }

  disableShadow() {
    // return this.context.setShadow(0, 0, 0, 0);
  }

  save() {
    this.context.save()
  }

  restore(data) {
    this.context.restore()
  }

  setFont(fontSize, fontFamily, fontItalic, fontWeight) {
    let styles = [ ]
    if (fontItalic) {
      styles.push('italic')
    }
    if (fontWeight) {
      styles.push('bold')
    }
    styles.push(`${fontSize}px`, fontFamily)
    //this.context.font = styles.join(' ')
    this.context.setFontSize(fontSize);
  }
  setLineWidth(value) {
    this.context.setLineWidth(value);
  }
  setLineJoin(value) {
    this.context.setLineJoin(value);
  }
  setLineCap(value) {
    this.context.setLineCap(value);
  }
  setStrokeStyle(value) {
    this.context.setStrokeStyle(value);
  }
  setFillStyle(value) {
    this.context.setFillStyle(value);
  }
}


