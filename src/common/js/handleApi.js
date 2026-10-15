import { ElMessage, ElMessageBox } from 'element-plus'

export default (type, api, data) => {
  switch (type) {
    case 'create':
      return new Promise((resolve, reject) => {
        api(data)
          .then((res) => {
            resolve(res)
          })
          .catch((e) => {
            reject(e)
          })
      })
    case 'update':
      return new Promise((resolve, reject) => {
        ElMessageBox.confirm('此操作将更新数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            api(data)
              .then((res) => {
                resolve(res)
              })
              .catch((e) => {
                reject(e)
              })
          })
          .catch((e) => {
            reject(e)
          })
      })
    case 'delete':
      return new Promise((resolve, reject) => {
        ElMessageBox.confirm('删除后将改变数据,是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            api(data)
              .then((res) => {
                resolve(res)
              })
              .catch((e) => {
                reject(e)
              })
          })
          .catch((e) => {
            reject(e)
          })
      })
    default:
      console.log('warning: 未设置的API操作类型')
      return new Promise((resolve, reject) => {
        api(data)
          .then((res) => {
            if (!res) return
            ElMessage({
              showClose: true,
              message: res.message,
              type: res.success ? 'success' : 'error',
              duration: 3500,
            })
            resolve(res)
          })
          .catch((e) => {
            reject(e)
          })
      })
  }
}
