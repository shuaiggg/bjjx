function watchNetwork(successCallback, errorCallback) {

  // 监听网络变化
  wx.onNetworkStatusChange(res => {
    if (res.isConnected) {
      wx.showToast({
        title: `网络连接改变，当前网络:${res.networkType.toUpperCase()}`,
        icon: 'none'
      });
      successCallback(res);
    } else {
      wx.showToast({
        title: `网络连接出错`,
        icon: 'none'
      });
      errorCallback(res);
    }
  })
}

function getNetworkStatus () {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      complete: res => {
        if (res.errMsg === 'getNetworkType:ok') {
          wx.showToast({
            title: `当前网络:${res.networkType.toUpperCase()}`,
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: `网络连接出错`,
            icon: 'none'
          });
        }
        resolve(res);
      }
    });
  })
}

export default {
  watchNetwork,
  getNetworkStatus,
}