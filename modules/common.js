var mysql = require('mysql');

var enObj = process.env;
var db_host = enObj.DB_HOST; // 服务器数据库地址
var db_port = enObj.DB_PORT; // 服务器数据库端口
var db_user = enObj.DB_USER; // mysql账号
var db_pw = enObj.DB_PW ; // mysql密码

var options = {
  host: db_host || 'localhost',
  port: db_port || 3306,
  user: db_user || 'root',
  password: db_pw || '123456',
  database: 'baiyi'
}

// 执行操作打印日志
function qy(cmd, callback) {
  const client = mysql.createConnection(options);
  client.connect();
  client.query(cmd, (err, result) => {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(err, result);
    }
  })
  client.end();
}

// 分页查询数据(排序+查询条件+页码+每页条数) 
// queryArr: [{name: 'status', value: 1, like: false, str: false}] 表示查询表中status为1的数据, like为true表示模糊查询, str为true表示该数据是字符串，可多个条件
function pageData (table, order, queryArr=[], page=1, pageSize=10) {
  queryArr = queryArr.filter(v => v.value !== undefined && v.value !== '')
  let str = `select * from ${table}`;
  if (queryArr.length) {
    str += ` where ${queryArr.map(v => {
      let str = v.name;
      if (v.like) {
        str += ' like "%' + v.value + '%"';
      }
      if (v.str) {
        str += '="' + v.value + '"';
      }
      if (!v.like && !v.str) {
        str += '=' + v.value;
      }
      return str;
    }).join(' and ')}`
  }
  if (order) {
    str += ` order by ${order}`
  }
  str += ` limit ${pageSize} offset ${(page - 1)*pageSize}`
  var a = new Promise((resolve, reject) => {
    let str2 = str.replace(/^select \*/, 'select count(*) as count');
    qy(str2, (err, result) => {
      err ? reject(err) : resolve(result[0].count);
    });
  })

  var b = new Promise((resolve, reject) => {
    qy(str, (err, result) => {
      err ? reject(err) : resolve(result);
    });
  })

  return Promise.all([a,b]);
}

// 判断字段不能为空
function needIt(param, name, res) {
  if (!param) {
    res.status(400).send({message: name + '不能为空'});
    return true;
  }
}

module.exports = {qy, pageData, needIt};