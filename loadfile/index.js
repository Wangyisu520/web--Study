const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongodb = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const url = require("url");
const {
    get
} = require("http");

const app = express();

//设置中间件
app.set(bodyParser.json())
app.set('view engine', 'ejs')
app.use(methodOverride('_method'));

// 静态资源
app.use(express.static(path.join(__dirname, 'public')))

//数据库
const mongoURL = 'mongodb://test:123123w@ds159661.mlab.com:59661/filedownload';

// 数据库连接
const conn = mongodb.createConnection(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// 初始化gfs
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongodb.mongo);
    gfs.collection('uploads')
})

//实例化storage对象
const storage = new GridFsStorage({
    url: mongoURL,
    file: (req, file) => {
        return new Promise((res, rej) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return rej(err)
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                }
                res(fileInfo)
            })

        })
    }
})

const upload = multer({
    storage
})

app.get("/", (req, res) => {
    // res.render("index")
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            res.render("index", {
                files: false
            })
        } else {
            files.map((file) => {
                if (file.contentType === 'image/png' || file.contentType === 'image/jpeg' || file.contentType === 'image/jpg') {
                    file.isImage = true;
                } else {
                    file.isImage = false
                }
            })
            res.render("index", {
                files: files,
                url: req.headers.host
            })
        }
    })
})

//@roter post /upload
app.post("/upload", upload.single("file"), (req, res) => {
    res.redirect("/")
})

//获取所有上传数据 get /files
app.get("/files", (req, res) => {
    gfs.files.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: '文件不存在'
            })
        }
        return res.json(files)
    })
})

//获取单个数据 get /fiels/:filename
app.get("/files/:filename", (req, res) => {
    gfs.files.findOne({
        filename: req.params.filename
    }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: "文件不存在"
            })
        }
        return res.json({
            file
        })
    })
})

//获取单个图片
app.get("/image/:filename", (req, res) => {
    gfs.files.findOne({
        filename: req.params.filename
    }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: "文件不存在"
            })
        }
        //验证图片
        if (file.contentType === 'image/png' || file.contentType === 'image/jpeg' || file.contentType === 'image/jpg') {
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: '不是图片！',
            });
        }
    })
})

//删除文件
app.delete('/files/:id', (req, res) => {
    gfs.remove({
        _id: req.params.id,
        root: 'uploads'
    }, (err, gridStore) => {
        if (err) {
            return res.status(404).json({
                err: err
            });
        }
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("服务器启动...")
})