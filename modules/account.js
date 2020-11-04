/* 账号相关接口模块 */
var jwt = require('jsonwebtoken');

var jwt_key = 'baiyi2020'; // JWT秘钥

module.exports =  function (app) {
  // 登录
  app.post('/api/login', (req, res) => {
    var params = req.body || {}
    var params2 = {
      account: 'admin',
      password: '@baiyi896!'
    }
    if (params.account === params2.account && params.password === params2.password) {
      var token = jwt.sign(params2, jwt_key, {
        expiresIn: 10800 // 有效期3小时
      });
      res.json({success: 1, token: token})
    } else {
      res.status(400).send({message: '用户名或密码错误!'});
    }
  })

  // 注销账号
  app.post('/api/logout', (req, res) => {
    res.end()
  })

  // 获取账户信息
  app.get('/api/info', (req, res) => {
    var token = req.headers.authorization;

    jwt.verify(token || '', jwt_key, function(err, decoded) {
      if (err) {
        res.status(403).send({message: '登录失效，请重新登录！'});
      } else {
        res.json({name: 'admin'})
      }
    })
  })
}