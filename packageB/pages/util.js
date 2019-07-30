var bjy = require('../sdk/bjy');
function init(str) {

    bjy.init({
      env: '',
      sign: str.live_sign,
      hasDefaultTip: true,
      class: {
        id: str.id,
        name: str.name,
        startTime: str.startTime,
        endTime: str.endTime
      },
        user: {
          number: str.number,
          avatar: str.avatar,
          name: str.user_name,
          type: 0
        }
    })
}
module.exports.init = init;
