/**
 * @file 把 Date 转为字符串格式
 * @author dujianhao
 * @date 2018/9/17
 */

import padStart from './padStart';

export default function(date, needSecond, separator) {

  if (typeof date === 'number') {
    date = new Date(date);
  }

  if (Object.prototype.toString.call(date) !== '[object Date]') {
    return '';
  }

  date = {
    hour: date.getHours() + '',
    minute: date.getMinutes() + '',
    second: date.getSeconds() + ''
  };

  const list = [
    padStart(date.hour, '0', 2),
    padStart(date.minute, '0', 2),
  ];
  if (needSecond) {
    list.push(
      padStart(date.second, '0', 2));
  }
  return list.join(separator || ':');
}