var bodyParser = require('body-parser');
var fs = require('fs');

var common = require('./modules/common.js');
var account = require('./modules/account.js');
var banner = require('./modules/banner.js');
var link = require('./modules/link.js');
var news = require('./modules/news.js');

var express = require('express');
let https = require("https");
var app = express();

var multer = require('multer');
var upload = multer();

var port = 555; // 当前监听端口
app.use(bodyParser.json({limit: '10mb'})); // 解析 application/json
app.use(bodyParser.urlencoded({limit: '10mb', extended: true})); // 解析 application/x-www-form-urlencoded

// 解决本地跨域
var cors = require('cors');
app.use(cors());

app.listen(port, () => {
  var msg = "服务启动，port:" + port
  console.log(msg)
})

// 所有请求
app.all('/api/*', (req, res, next) => {
  if (req.originalUrl.indexOf('login') < 0 && !req.headers.authorization && req.method !== "GET") {
    res.status(403).send({message: '无权限'});
  }
  next()
})

// 上传图片
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({url: 'data:image/png;base64,' + req.file.buffer.toString("base64")});
})

// 执行模块接口
account(app, common);
banner(app, common);
link(app, common);
news(app, common);

