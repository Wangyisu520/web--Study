const moment = require("moment")

function formatMessage(username='匿名',text){
    return{
        username:username,
        text:text,
        time:moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
    }
}

module.exports =formatMessage