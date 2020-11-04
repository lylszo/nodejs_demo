/* 新闻接口模块 */
module.exports =  function (app, common) {
    var qy = common.qy;
    var pageData = common.pageData;
    var needIt = common.needIt;
    
    // 修改新闻类别
    app.post('/api/news/type', (req, res) => {
      var params = req.body || []
      if (!params.length) {
        res.status(400).send({message: '新闻类别不能为空'});
        return;
      }
      var paramsObj = {}
      params.forEach(v => {
        paramsObj[v.name] = 1
      })
      qy('select * from news', (err, result) => {
        if (err) {
          res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
        } else {        
          let list = result || [];
          let flag = false;
          let type = '';
          if (list.length) {
            result.forEach(v => {
              if (!paramsObj[v.type] && v.status === 1) {
                flag = true
                type = v.type
              }
            })          
          }
          if (flag) {
            res.status(400).send({message: '"' + type + '"' + '类型被占用，不能删除'})
          } else {
            qy('delete from newsType where id > 0', err => {
              if (err) {
                res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
              } else {
                let str = 'insert into newsType (name, sort) values ';
                str += params.map(v => `("${v.name}", ${v.sort})`).join();
                qy(str, err => {
                  if (err) {
                    res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
                  } else {
                    res.end()
                  }
                })             
              }
            })
          }  
        }
      })
    })
    
    // 获取新闻类别列表
    app.get('/api/news/type', (req, res) => {
      qy('select * from newsType order by sort', (err, result) => {
        if (err) {
          res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
        } else {
          res.json(result);
        }
      })
    })
    
    // 获取单个新闻详情
    app.get('/api/news/info', (req, res) => {
      var params = req.query || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      var str = 'select * from news where id=' + params.id;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
        } else {
          res.json(result.length ? result[0] : []);
        }
      })
    })
    
    // 获取新闻列表
    app.get('/api/news/list', (req, res) => {
      var params = req.query || {}
      var params2 = {
        page: +params.page || 1,
        pageSize: +params.pageSize || 10,
        type: params.type || '',
        title: params.title || '',
        status: params.status || ''
      }
      pageData('news', 'sort',
        [{name: 'status', value: params2.status}, {name: 'type', value: params2.type, str: true}, {name: 'title', value: params2.title, like: true}], 
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

    // 新增新闻
    app.post('/api/news/add', (req, res) => {
      var params = req.body || {}
      if (needIt(params.url, '图片', res)) {
        return;
      }
      if (needIt(params.type, '类别', res)) {
        return;
      }
      if (needIt(params.title, '标题', res)) {
        return;
      } else if (params.title.length && params.title.length > 30) {
        res.status(400).send({message: '标题不能超过30个字'});
        return;
      }
      if (needIt(params.sort, '排序号', res)) {
        return;
      }
      if (needIt(params.content, '新闻内容', res)) {
        return;
      }
      var params2 = {
        url: params.url || '', // 新闻图片路径
        type: params.type || '', // 新闻类别
        title: params.title || '', // 新闻标题
        sort: params.sort || 0, // 排序码
        content: params.content || '', // 新闻内容
        seo: params.seo || '', // seo文案
        status: 1, // 新闻状态1=>启用 0=>停用
        createTime: new Date().getTime(), // 创建时间,时间戳表示
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'insert into news (url, type, title, sort, content, seo, status, createTime, updateTime) values';
      str += ` ('${params2.url}', '${params2.type}', '${params2.title}', ${params2.sort}, '${params2.content}', '${params2.seo}', ${params2.status}, ${params2.createTime}, ${params2.updateTime})`;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '添加新闻失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })

    // 编辑新闻
    app.put('/api/news/edit', (req, res) => {
      var params = req.body || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      if (needIt(params.url, '图片', res)) {
        return;
      }
      if (needIt(params.type, '类别', res)) {
        return;
      }
      if (needIt(params.title, '标题', res)) {
        return;
      } else if (params.title.length && params.title.length > 20) {
        res.status(400).send({message: '标题不能超过20个字'});
        return;
      }
      if (needIt(params.sort, '排序号', res)) {
        return;
      }
      if (needIt(params.content, '新闻内容', res)) {
        return;
      }
      var params2 = {
        url: params.url || '', // 新闻图片路径
        type: params.type || '', // 新闻类别
        title: params.title || '', // 新闻标题
        sort: params.sort || 0, // 排序码
        seo: params.seo || '', // seo文案
        content: params.content || '', // 新闻内容
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'update news set ';
      let arr = []
      for (let i in params2) {
        if (i === 'sort' || i === 'updateTime') {
          arr.push(i + '=' + params2[i]);
        } else {
          arr.push(i + "='" + params2[i] + "'");
        }
      }
      str += arr.join(', ') + ' where id=' + params.id;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '编辑数据失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })

    // 修改新闻状态
    app.put('/api/news/status', (req, res) => {
      var params = req.body || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      if (params.status !== 0 && params.status !== 1) {
        res.status(400).send({message: '状态只能是0或1'});
        return
      }
      var params2 = {
        status: params.status, // 新闻状态
        updateTime: new Date().getTime(), // 更新时间
      }
      if (params2.status === 1) {
        qy('select * from newsType', (err, result) => {
          if (err) {
            res.status(502).send({message: '连接数据库失败，请稍后重试', description: err})
          }
          let typeList = result || [];
          let typeObj = {};
          typeList.forEach(v => {
            typeObj[v.name] = 1
          })
          qy('select * from news', (err, result) => {
            if (err) {
              res.status(502).send({message: '连接数据库失败，请稍后重试', description: err})
            }
            let list = result;
            var type = ''
            list.forEach(v => {
              if (v.id === params.id) {
                type = v.type
              }
            })
            if (type && !typeObj[type]) {
              res.status(400).send({message: '当前数据所属类别已被删除，无法启用'});
            } else {
              let str = 'update news set status=1 where id=' + params.id;
              qy(str, (err, result) => {
                if (err) {
                  res.status(502).send({message: '修改状态失败，请稍后重试', description: err})
                } else {
                  res.end();
                }
              })
            }
          })
        })
      } else {
        let str = 'update news set status=0 where id=' + params.id;
        qy(str, (err, result) => {
          if (err) {
            res.status(502).send({message: '修改状态失败，请稍后重试', description: err})
          } else {
            res.end();
          }
        })        
      }
    })
}