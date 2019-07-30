/**
 * @file 二分搜索,返回搜索index
 * @author dujianhao
 * @date 2018/9/7
 */

export default function (list, searchBy) {

    let start = 0;
    let end = list.length - 1;

    let result;
    let index;

    if (start === end) {
        return searchBy(list, 0);
    }
    else {
        while (end > start) {
            index = Math.floor((start + end) / 2);
            result = searchBy(list, index);
            // 截取左边
            if (result < 0) {
                end = index;
                if (end === start) {
                    return index - 1;
                }
            }
            // 截取右边
            else if (result > 0) {
                start = index + 1;
                if (end === start) {
                    return result === searchBy(list, start) ? start : index;
                }
            }
            // 命中
            else {
                return index;
            }
        }
    }

    return -1;

};