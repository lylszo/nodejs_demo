/* 链接接口模块 */
module.exports =  function (app, common) {
    var qy = common.qy;
    var pageData = common.pageData;
    var needIt = common.needIt;
    
    // 修改链接类别
    app.post('/api/link/type', (req, res) => {
      var params = req.body || []
      if (!params.length) {
        res.status(400).send({message: '链接类别不能为空'});
        return;
      }
      var paramsObj = {}
      params.forEach(v => {
        paramsObj[v.name] = 1
      })
      qy('select * from link', (err, result) => {
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
            qy('delete from linkType where id > 0', err => {
              if (err) {
                res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
              } else {
                let str = 'insert into linkType (name, sort) values ';
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
    
    // 获取链接类别列表
    app.get('/api/link/type', (req, res) => {
      qy('select * from linkType order by sort', (err, result) => {
        if (err) {
          res.status(502).send({message: '连接数据库失败，请稍后重试', description: err});
        } else {
          res.json(result);
        }
      })
    })
    
    // 获取链接列表
    app.get('/api/link/list', (req, res) => {
      var params = req.query || {}
      var params2 = {
        page: +params.page || 1,
        pageSize: +params.pageSize || 10,
        status: params.status || ''
      }
      pageData('link', 'sort',
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

    // 新增链接
    app.post('/api/link/add', (req, res) => {
      var params = req.body || {}
      if (needIt(params.type, '类别', res)) {
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
        type: params.type || '', // 链接类型
        name: params.name || '', // 链接名称
        sort: params.sort || 0, // 排序码
        link: params.link || '', // 跳转链接
        status: 1, // 链接状态1=>启用 0=>停用
        createTime: new Date().getTime(), // 创建时间,时间戳表示
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'insert into link (type, name, sort, link, status, createTime, updateTime) values';
      str += ` ("${params2.type}", "${params2.name}", ${params2.sort}, "${params2.link}", ${params2.status}, ${params2.createTime}, ${params2.updateTime})`;
      qy(str, (err, result) => {
        if (err) {
          res.status(502).send({message: '添加链接失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })

    // 编辑链接
    app.put('/api/link/edit', (req, res) => {
      var params = req.body || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      if (needIt(params.type, '类别', res)) {
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
        type: params.type || '', // 链接类别名称
        name: params.name || '', // 链接名称
        sort: params.sort || 0, // 排序码
        link: params.link || '', // 跳转链接
        updateTime: new Date().getTime(), // 更新时间
      }
      let str = 'update link set ';
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
          res.status(502).send({message: '编辑数据失败，请稍后重试', description: err})
        } else {
          res.end();
        }
      })
    })

    // 修改链接状态
    app.put('/api/link/status', (req, res) => {
      var params = req.body || {}
      if (needIt(params.id, 'id', res)) {
        return;
      }
      if (params.status !== 0 && params.status !== 1) {
        res.status(400).send({message: '状态只能是0或1'});
        return
      }
      var params2 = {
        status: params.status, // 链接状态
        updateTime: new Date().getTime(), // 更新时间
      }
      if (params2.status === 1) {
        qy('select * from linkType', (err, result) => {
          if (err) {
            res.status(502).send({message: '连接数据库失败，请稍后重试', description: err})
          }
          let typeList = result || [];
          let typeObj = {};
          typeList.forEach(v => {
            typeObj[v.name] = 1
          })
          qy('select * from link', (err, result) => {
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
              let str = 'update link set status=1 where id=' + params.id;
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
        let str = 'update link set status=0 where id=' + params.id;
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