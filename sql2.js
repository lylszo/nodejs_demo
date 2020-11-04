var mysql = require('mysql');

var enObj = process.env;
var db_host = enObj.DB_HOST; // 服务器数据库地址
var db_port = enObj.DB_PORT; // 服务器数据库端口
var db_user = enObj.DB_USER; // mysql账号
var db_pw = enObj.DB_PW ; // mysql密码

var database = 'baiyi';

let options = {
  host: db_host || 'localhost',
  port: db_port || 3306,
  user: db_user || 'root',
  password: db_pw || '123456',
  database: database
}

const client = mysql.createConnection(options)

client.connect();

query('use ' + database);
query('alter table banner add seo varchar(600) not null default ""');
query('alter table news add seo varchar(600) not null default ""');
query('alter table news modify content longtext not null');

console.log('已添加字段');

client.end();

// 执行操作打印日志
function query(cmd) {
  client.query(cmd, err => {
    if (err) {
      console.log(err);
    }
  })
}
