const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");
const formatMessage = require("./utils/message")
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require("./utils/users")

// 初始化
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// 静态资源
app.use(express.static(path.join(__dirname, 'public')))


const botName = "菜菜助手"
//监听客户端
io.on('connection', (socket) => {
    // console.log("socket 连接成功")
    // 监听加入房间
    socket.on("joinRoom", ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room)
        //消息一对一
        socket.emit("message", formatMessage(botName, `欢迎加入${user.room}聊天室`))

        //广播消息（除自身以外都能接收到消息）
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `欢迎,${user.username}加入聊天`))
        //发送用户名和房间信息给客户端
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })



    // 客户端返回来的聊天信息
    socket.on('chatMessage', (chat) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, chat))
    })

    //监听客户端是否断开连接
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            //全员都能接收到消息
            io.to(user.room).emit('message', formatMessage(botName, `${user.username},已经下线`))
            //发送用户名和房间信息给客户端
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

app.get("/", (res, rej) => {
    res.send("./public/index.html")
})

// 端口号
const PORT = process.env.PORT || 12306;
//监听端口
server.listen(PORT, () => {
    console.log("服务启动...")
})