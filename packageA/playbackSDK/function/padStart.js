/**
 * @file 文本前增
 * @author dujianhao
 * @date 2018/9/26
 */

function padStart(str, padStr, padLength) {
  str += '';
  padStr += '';
  const strLength = str.length;
  const padStrLength = padStr.length;
  if (strLength >= padLength) {
    return str;
  }
  const lengthToPad = padLength - strLength;

  if (lengthToPad <= padStrLength) {
    return padStr.slice(0, lengthToPad) + str;
  }

  let padCount = Math.ceil(lengthToPad / padStrLength);
  let padStrSum = '';
  while (padCount--) {
    padStrSum += padStr;
  }
  padStrSum = padStrSum.slice(0, lengthToPad);
  return padStrSum + str;
}

export default padStart;