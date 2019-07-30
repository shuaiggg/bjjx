/**
 * @file 格式化 秒 为 日，时，分秒
 * @author dujianhao
 */

import padStart from './padStart';

export default function(second, option = {
  splitChar: ':', // 分隔符
  shortMode: true, // 是否只显示短时间
}) {
  second = +second || 0;

  if (second < 0) {
    second = 0;
  }

  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  // 天数
  const days = Math.floor(second / DAY);
  second = second % DAY;

  // 小时数
  const hours = Math.floor(second / HOUR);
  second = second % HOUR;

  // 分钟数
  const minutes = Math.floor(second / MINUTE);

  // 秒数
  const seconds = Math.floor(second % MINUTE);

  const list = [
    padStart(minutes, '0', 2),
    padStart(seconds, '0', 2)
  ];

  // shortMode = true 时，小时为0时不显示
  if (!option.shortMode || hours) {
    list.unshift(padStart(hours, '0', 2));
  }

  return list.join(option.splitChar);
};