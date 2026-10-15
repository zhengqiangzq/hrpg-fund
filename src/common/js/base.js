import { showSourceDetail } from '@/api/base.js'

// 库存管理-移库消耗产品和批次选择输入框焦点方法
export function setVal(className) {
  let dom = document
    .getElementsByClassName(className)[0]
    .querySelector('.el-input__inner')
  let val = dom.value
  dom.focus()
  dom.value = ''
  setTimeout(() => {
    dom.value = val
  }, 0)
}

export function setTabindex(proxy) {
  proxy.$nextTick(() => {
    let originalInptDom = document.getElementsByClassName(
      'el-checkbox__original'
    )
    originalInptDom.forEach((element) => {
      element.setAttribute('tabindex', -1)
      element.setAttribute('value', 1)
    })
  })
}

export function toSourceDetail(proxy, id, businessId, routeQuery) {
  showSourceDetail(id).then((res) => {
    if (res && res.success) {
      if (businessId) {
        res.data['businessId'] = businessId
        res.data['orderId'] = businessId
      }
      // 如果接口返回则使用返回orderId
      if (res.data.orderId) {
        res.data['businessId'] = res.data.orderId
        res.data['orderId'] = res.data.orderId
      }
      res.data['orderNo'] = id
      turnPage(proxy, res.data, routeQuery)
    }
  })
}

function turnPage(proxy, data, routeQuery = {}) {
  let url = data.url
  let routes = proxy.$store.state.permission.routes
  let item = urlPermiss(routes, url)
  if (item && item.path) {
    if (window.__POWERED_BY_WUJIE__) {
      window.$wujie?.bus.$emit('subMicroAppRouteChange', {
        name: item.microName,
        path: item.path,
        fullPath: item.fullPath || '',
      })
    }
    proxy.$router.push({
      path: url,
      query: routeQuery,
    })
    proxy.$store.dispatch('settings/toPage', data)
  } else {
    proxy.$message({
      duration: 3500,
      type: 'warning',
      showClose: true,
      message: '你没有相应的菜单权限',
    })
  }
}
// export const getUrlPermiss = (proxy, url, isJump = true, resource = []) => {
//   // let routes = resource || proxy.$store.state.permission.routes
//   let routes = JSON.parse(localStorage.getItem('routeStore'))?.allSpdRoutes
//   console.log(routes)
//   let item = urlPermiss(routes, url)
//   if (item && item.path) {
//     if (isJump && window.__POWERED_BY_WUJIE__) {
//       window.$wujie?.bus.$emit('subMicroAppRouteChange', {
//         name: item.microName,
//         path: item.path,
//         fullPath: item.fullPath || '',
//         doNotSwitch: true,
//       })
//     }
//     return item
//   } else {
//     proxy.$message({
//       duration: 3500,
//       type: 'warning',
//       showClose: true,
//       message: '你没有相应的菜单权限',
//     })
//     return ''
//   }
// }
export const getUrlPermiss = (url, isJump = true, resource = []) => {
  let systemCode = '/' + url.split('/')[1]
  let flatAllRoutes = JSON.parse(
    localStorage.getItem('routeStore')
  )?.flatAllRoutes
  let routes =
    flatAllRoutes[systemCode] ||
    JSON.parse(localStorage.getItem('routeStore'))?.allSpdRoutes
  url = '/' + url.split('/').slice(2, url.split('/').length).join('/')
  let item = urlPermiss(routes, url)
  if (item && item.path) {
    if (isJump && window.__POWERED_BY_WUJIE__) {
      // window.$wujie?.bus.$emit('subMicroAppRouteChange', {
      //   name: item.microName,
      //   path: item.path,
      //   fullPath: item.fullPath || '',
      //   doNotSwitch: true,
      // })
    }
    return item
  }
}
function urlPermiss(arr, url) {
  let name = ''
  arr.map((item) => {
    // console.log(item.path.split('?')[0],url.split('?')[0])
    if (item.path.split('?')[0] === url.split('?')[0]) {
      name = item
    } else {
      let child = findChildren(item.children, url)
      if (child) {
        name = child
      }
    }
  })
  return name
}
function findChildren(list, url) {
  let name = ''
  const _list = list || []
  _list.map((i) => {
    if (i.path === url) {
      name = i
    } else {
      const child = findChildren(i.children, url)
      if (child) {
        name = child
      }
    }
  })
  return name
}

// 限制当前日期 时分秒之前时间禁用
export const disableDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

/* 限制小时 */
export const disabledHour = () => {
  const arrs = []
  for (let i = 0; i < 24; i++) {
    if (new Date().getHours() <= i) continue
    arrs.push(i)
  }
  return arrs
}

/* 限制分 */
export const disabledMinute = () => {
  const arrs = []
  for (let i = 0; i < 60; i++) {
    if (new Date().getMinutes() <= i) continue
    arrs.push(i)
  }
  return arrs
}

/* 限制秒 */
export const disabledSecond = () => {
  const arrs = []
  for (let i = 0; i < 60; i++) {
    if (new Date().getSeconds() <= i) continue
    arrs.push(i)
  }
  return arrs
}
// 设置选中时间之前日期
export function setDisDate(val, row) {
  row.disableDate = (time) => {
    return time.getTime() < new Date(val).getTime() - 8.64e7
  }
  row.disabledHour = () => {
    const arrs = []
    for (let i = 0; i < 24; i++) {
      if (new Date(val).getHours() <= i) continue
      arrs.push(i)
    }
    return arrs
  }

  row.disabledMinute = () => {
    const arrs = []
    for (let i = 0; i < 60; i++) {
      if (new Date(val).getMinutes() <= i) continue
      arrs.push(i)
    }
    return arrs
  }

  row.disabledSecond = () => {
    const arrs = []
    for (let i = 0; i < 60; i++) {
      if (new Date(val).getSeconds() <= i) continue
      arrs.push(i)
    }
    return arrs
  }
}
