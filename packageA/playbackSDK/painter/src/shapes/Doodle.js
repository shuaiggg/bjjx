/**
 * @file 涂鸦
 * @author musicode
 */

import Shape from './Shape'
import smoothPoints from '../algorithm/smoothPoints';

/**
 * points 点数组
 */
export default class Doodle extends Shape {

  setLineStyle(painter) {
    painter.setLineJoin('round')
    painter.setLineCap('round')
  }

  /**
   * 正在绘制
   *
   * @param {Canvas} painter
   * @param {number} startX 起始点 x 坐标
   * @param {number} startY 起始点 y 坐标
   * @param {number} endX 结束点 x 坐标
   * @param {number} endY 结束点 y 坐标
   */
  drawing(painter, startX, startY, endX, endY) {

    const points = this.points || (this.points = [ { x: startX, y: startY } ])

    painter.disableShadow()
    painter.begin()

    if (points.length === 1) {
      this.setLineStyle(painter)
      painter.setLineWidth(this.lineWidth)
      painter.setStrokeStyle(this.strokeStyle)
    }
    points.push(
      {
        x: endX,
        y: endY,
      })
    const order = 3;
    const tailSize = 3;
    // 平滑处理最后的点在每次绘图均会重新计算，因此动态绘图时需剔除
    var reservedPointsLength = Math.pow(2, order) * (tailSize - 1);
    var pointsToDraw = smoothPoints(this.points, {
      order,
      tailSize
    });
    painter.drawPoints(
      pointsToDraw.slice(0, -reservedPointsLength)
    )
    painter.stroke()
    painter.draw(true)

  }

  /**
   * 绘制路径
   *
   * @param {Canvas} painter
   */
  drawPath(painter) {
    painter.drawPoints(this.points, true)
  }

  toJSON() {
    return super.toJSON({
      name: 'Doodle',
    })
  }

}
