/**
 * @file 获取文档图片的显示宽高
 * @author zhujialu
 */

import config from '../config';

/**
 *
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @param {number} imageWidth
 * @param {number} imageHeight
 * @param {number} fit  config.DOC_FIT_VIEW 或 config.DOC_FIT
 * @param {boolean} keepSize 当图片小于容器大小时，是否要保持原尺寸
 * @param {number} threshold 是否出现滚动条的阈值
 * @return {number}
 */
export default function (containerWidth, containerHeight, imageWidth, imageHeight, fit, keepSize, threshold) {

    const imageRatio = imageWidth / imageHeight;

    const scaleX = imageWidth / containerWidth;
    const scaleY = imageHeight / containerHeight;

    // 图片大于容器需要裁剪
    if (scaleX > 1 || scaleY > 1) {

        // 特别宽的图，先把宽度缩小到容器的宽度
        if (scaleX > 1) {
            imageWidth = containerWidth;
            imageHeight = imageWidth / imageRatio;
        }

        // 再次计算高度是否超过容器
        if (imageHeight > containerHeight) {
            if (fit === config.DOC_FIT_VIEW) {
                imageHeight = containerHeight;
                imageWidth = imageHeight * imageRatio;
            }
            else if (threshold > 0 && imageHeight / containerHeight < threshold) {
                imageHeight = containerHeight;
                imageWidth = imageHeight * imageRatio;
            }
        }

    }
    else {
        if (fit === config.DOC_FIT_VIEW) {
            if (!keepSize) {
                const scale = Math.max(scaleX, scaleY);
                imageWidth = imageWidth / scale;
                imageHeight = imageHeight / scale;
            }
        }
        else {
            imageWidth = containerWidth;
            imageHeight = imageWidth / imageRatio;
        }
    }

    return {
        width: Math.floor(imageWidth),
        height: Math.floor(imageHeight)
    };

};

