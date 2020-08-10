const users =[];

//用户加入聊天
function userJoin(id,username,room){
    const user ={id,username,room};
    users.push(user)
    return user
}

//获取当前用户
function getCurrentUser(id){
    return users.find(user => user.id == id)
}

//离开房间
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index != -1){
        return users.splice(index,1)[0]
    }
}

//获取每个房间用户
function getRoomUsers(room){
    return users.filter(user => user.room === room)
}

module.exports ={
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}