const axios = require("axios");
const fs = require('fs');
const path = require("path");

//延迟函数
async function waitTime(s) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res()
        }, s);
    })
}

//获取数据列表
async function getPage(num) {
    let httpUrl = "http://www.app-echo.com/api/recommend/sound-day?page=" + num;
    let res = await axios.get(httpUrl);
    if (res.data.list.length > 0) {
        res.data.list.forEach((item, i) => {
            let title = item.sound.name;
            let source = item.sound.source;
            let filename = path.parse(source).name;
            let content = `${title},${source},${filename}\n`;
            fs.writeFile("music.txt", content, {
                flag: 'a'
            }, () => {
                console.log("写入完成:" + title)
            })
            download(source, filename)
        })
    }else{
        return 200
    }
}

// getPage(1)

//下载音乐
async function download(url, title) {
    let res = await axios.get(url, {
        responseType: "stream"
    })
    let ws = fs.createWriteStream("./mp3/" + title + '.mp3')
    res.data.pipe(ws)
    res.data.on("close", () => {
        ws.close()
    })
}

async function init() {
    for (let i = 1; i < 9999; i++) {
        await waitTime(10000)
        let result = getPage(i);
        if (result == 200) {
            break;
        }
    }
}

init()