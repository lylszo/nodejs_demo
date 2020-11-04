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
  password: db_pw || '123456'
}

const client = mysql.createConnection(options)

client.connect();

query('create database if not exists ' + database);
query('use ' + database);

// 轮播图
createTable('banner', [
  'url LONGTEXT not null', // 图片链接
  'name varchar(20) not null', // 轮播图名称
  'sort int not null', // 轮播图排序号
  'link varchar(600) not null', // 轮播图跳转链接
  'status int not null', // 轮播图状态 0=>停用 1=> 启用
  'createTime BIGINT not null', // 创建时间
  'updateTime BIGINT not null', // 更新时间
])

// 链接
createTable('link', [
  'type varchar(20) not null', // 链接类别
  'name varchar(20) not null', // 链接名称
  'sort int not null', // 排序号
  'link varchar(600) not null', // 链接地址
  'status int not null', // 链接状态 0=>停用 1=> 启用
  'createTime BIGINT not null', // 创建时间
  'updateTime BIGINT not null', // 更新时间
])

// 链接类别
createTable('linkType', [
  'name varchar(20) not null', // 类别名称
  'sort int not null', // 排序号
])

// 新闻
createTable('news', [
  'url LONGTEXT not null', // 图片链接
  'type varchar(20) not null', // 新闻类别
  'title varchar(50) not null', // 新闻标题
  'sort int not null', // 排序号
  'content MEDIUMTEXT not null', // 新闻内容
  'status int not null', // 新闻状态 0=>停用 1=> 启用
  'createTime BIGINT not null', // 创建时间
  'updateTime BIGINT not null', // 更新时间
])

// 新闻类别
createTable('newsType', [
  'name varchar(20) not null', // 类别名称
  'sort int not null', // 排序号
])

console.log('已初始化表结构');

client.end();

// 执行操作打印日志
function query(cmd) {
  client.query(cmd, err => {
    if (err) {
      console.log(err);
    }
  })
}

// 创建表
function createTable(table_name, clumnsArr) {
  let str = 'create table if not exists ' + table_name + ' ( id int auto_increment, ' + clumnsArr.join() + ', primary key (`id`))';
  client.query(str);
}
