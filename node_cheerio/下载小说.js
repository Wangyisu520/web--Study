const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")
const url = require('url')
const path = require("path")

//延迟函数
async function waitTime(s) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res()
        }, s);
    })
}


// 获取列表
async function getPage() {

    try {
        let res = await axios.get("http://www.tianxiabachang.cn/2_2041/")
        let $ = cheerio.load(res.data);
        let ddArr = $("#list dd")
        let xsTitle = $("#maininfo #info h1").text();
        ddArr = Array.from(ddArr).slice(9);
        for (let i = 0; i < ddArr.length; i++) {
            let title = $(ddArr[i]).find('a').text();
            let txtUrl = $(ddArr[i]).find('a').attr('href');
            await waitTime(1000)
            pageInfo(txtUrl, title,xsTitle)
        }
    } catch (error) {

    }


}

//获取详情
async function pageInfo(url, title,xsTitle) {
    try {
        let infoUrl = "http://www.tianxiabachang.cn/" + url;
        let res = await axios.get(infoUrl)
        let $ = cheerio.load(res.data);
        let info = await $("#content").text();
        let content = `${title}\n${info}\n`;
        let path = xsTitle+".txt";
        fs.appendFile(path, content,{flag:"a",encoding:"utf-8"},(err)=>{
            if(!err){
                console.log("小说章节写入成功:"+title)
            }
        })
    } catch (error) {
        console.log(error)
    }

}

getPage()
