/* 轮播图接口模块 */
module.exports =  function (app, common) {
    var qy = common.qy;
    var pageData = common.pageData;
    var needIt = common.needIt;
    
    // 获取轮播图列表
    app.get('/api/banner/list', (req, res) => {
      var params = req.query || {}
      var params2 = {
        page: +params.page || 1,
        pageSize: +params.pageSize || 10,
        status: params.status ? +params.status : ''
      }
      pageData('banner', 'sort',
        [{name: 'status', value: params2.status}], 
        params2.page, 
        params2.pageSize
      ).then(result => {
        let data = {
          items: result[1],
          page: params2.page,
          pageSize: params2.pageSize,
          totalCount: result[0]
        }
        res.json(data)
      }).catch(err => {
        res.status(502).send({message: '连接数据库失败，请稍后重试', description: err})
      })
    })

    // 新增轮播图
    app.post('/api/banner/add', (req, res) => {
      var params = req.body || {}
      if (needIt(params.url, '图片', res)) {
        return;
      }
      if (needIt(params.name, '名称', res)) {
        return;
      } else if (params.name.length && params.name.length > 20) {
        res.status(400).send({message: '名称不能超过20个字'});
        return;
      }
      if (needIt(params.sort, '排序号', res)) {
        return;
      }
      if (params.link && params.link.length && params.link.length > 600) {
        res.status(400).send({message: '链接长度不能超过600'});
        return;
      }
      var params2 = {
        url: params.url || '', // 图片链接
        name: params.name || '', // 轮播图名称
        sort: params.sort || 0, // 排序码
        seo: params.seo || '', // seo文案
        link: params.link || '', // 跳转链接
        status: 1, // 轮播图状态1=>启用 0=>停用
        createTime: new Date().getTime(), // 创建时间,时间戳表示
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'insert into banner (url, name, sort, seo, link, status, createTime, updateTime) values';
      str += ` ("${params2.url}", "${params2.name}", ${params2.sort}, "${params2.seo}", "${params2.link}", ${params2.status}, ${params2.createTime}, ${params2.updateTime})`;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '新增轮播图失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })

    // 编辑轮播图
    app.put('/api/banner/edit', (req, res) => {
      var params = req.body || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      if (needIt(params.url, '图片', res)) {
        return;
      }
      if (needIt(params.name, '名称', res)) {
        return;
      } else if (params.name.length && params.name.length > 20) {
        res.status(400).send({message: '名称不能超过20个字'});
        return;
      }
      if (needIt(params.sort, '排序号', res)) {
        return;
      }
      if (params.link.length && params.link.length > 600) {
        res.status(400).send({message: '链接长度不能超过600'});
        return;
      }
      var params2 = {
        url: params.url || '', // 图片链接
        name: params.name || '', // 轮播图名称
        sort: params.sort || 0, // 排序码
        seo: params.seo || '', // seo文案
        link: params.link || '', // 跳转链接
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'update banner set ';
      let arr = []
      for (let i in params2) {
        if (i === 'sort' || i === 'updateTime') {
          arr.push(i + '=' + params2[i]);
        } else {
          arr.push(i + '="' + params2[i] + '"');
        }
      }
      str += arr.join(', ') + ' where id=' + params.id;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '编辑轮播图失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })

    // 修改轮播图状态
    app.put('/api/banner/status', (req, res) => {
      var params = req.body || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      if (params.status !== 0 && params.status !== 1) {
        res.status(400).send({message: '状态只能是0或1'});
        return
      }
      var params2 = {
        status: params.status, // 轮播图状态
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'update banner set status=' + params2.status;
      str += ' where id=' + params.id;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '修改状态失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })
}