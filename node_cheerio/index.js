const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")
const url = require('url')
const path = require("path")

//延迟函数
async function waitTime(s){
    return new Promise((res,rej)=>{
        setTimeout(() => {
            res()
        }, s);
    })
}

//请求总页数
async function getNum() {
    let httpUrl = 'https://www.doutula.com/article/list/?page=1';
    let res = await axios.get(httpUrl);
    let $ = cheerio.load(res.data)

    let btnLen = $('.pagination li').length
    let allNum = $(".pagination li").eq(btnLen - 2).find('a').text()
    return allNum
}

//初始化
async function spider() {
    let allPageNum = await getNum()
    for(let i = 1 ; i <= allPageNum; i++){
        await waitTime(10000)
        getListPage(i)
    }
}

//请求页面详情
async function getListPage(pageNum) {
    let httpUrl = 'https://www.doutula.com/article/list/?page='+pageNum;
    let res = await axios.get(httpUrl)
    let $ = cheerio.load(res.data);
    $("#home .col-sm-9>a").each((i, ele) => {
        let pageUrl = $(ele).attr('href');
        let title = $(ele).find(".random_title").text();
        let reg = /(.*?)\d/igs;
        title = reg.exec(title)[1]
        fs.mkdir("./img/" + title, (err) => {
            if (err) {
                // console.log(err)
            } else {
                console.log("创建目录:" + './img/' + title)
            }
        })
        parsePage(pageUrl, title)
    })
}

//获取页面图片
async function parsePage(url, title) {
    let res = await axios.get(url);
    let $ = cheerio.load(res.data);
    $(".pic-content img").each((i, ele) => {
        let imgUrl = $(ele).attr("src");
        let extName = path.extname(imgUrl);
        let imgPath = `./img/${title}/${title}${i}${extName}`;
        let ws = fs.createWriteStream(imgPath);
        axios.get(imgUrl, {
                responseType: 'stream'
            })
            .then(res => {
                res.data.pipe(ws)
                console.log("图片加载完成:" + imgPath)
                res.data.on("close", () => {
                    ws.close()
                })
            })
    })
}


spider()