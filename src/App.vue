<template>
  <!-- <div
    :style="{ height: clientHeight + 'px' }"
    :class="$store.state.settings.app_status"
  >
    <router-view />
  </div> -->
  <div :class="$store.state.settings.app_status">
    <router-view />
  </div>
</template>
<script setup name="app">
import 'element-plus/theme-chalk/index.css'
import '@/styles/index.scss'
import { useRoute } from 'vue-router'
import qs from 'qs'
const route = useRoute()
const { proxy } = getCurrentInstance()
const clientHeight = ref(document.body.clientHeight)
const router = useRouter()

const visitedViews = computed(() => {
  return proxy.$store.state.tabsView.visitedViews
})

onMounted(async () => {
  initMicroAppEvent()
  // window.onresize 事件可用于检测页面是否触发了放大或缩小。
  window.addEventListener('resize', function () {
    isScale()
  })
  // 阻止pc端浏览器缩放js代码
  // 由于浏览器菜单栏属于系统软件权限，没发控制，我们着手解决ctrl/cammond + +/- 或 Windows下ctrl + 滚轮 缩放页面的情况，只能通过js来控制了
  document.addEventListener(
    'DOMContentLoaded',
    function (event) {
      // chrome 浏览器直接加上下面这个样式就行了，但是ff不识别
      document.body.style.zoom = 'reset'
      document.addEventListener(
        'keydown',
        function (event) {
          if (
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.which === 61 ||
              event.which === 107 ||
              event.which === 173 ||
              event.which === 109 ||
              event.which === 187 ||
              event.which === 189)
          ) {
            event.preventDefault()
          }
        },
        false
      )
      var scrollFunc = function (event) {
        event = event || window.event
        if (event.wheelDelta) {
          //判断浏览器IE，谷歌滑轮事件
          if (event.ctrlKey === true || event.metaKey) {
            event.preventDefault()
          }
        }
      }
      //给页面绑定滑轮滚动事件
      if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollFunc, false)
      }
      //滚动滑轮触发scrollFunc方法
      window.onmousewheel = document.onmousewheel = scrollFunc
    },
    false
  )
  window.onresize = () => {
    proxy.$store.dispatch(
      'settings/updateScreen',
      document.body.clientWidth > 1000 ? 3 : 1
    )
    proxy.$store.dispatch(
      'settings/updateBodyHeight',
      document.body.clientHeight
    )
    clientHeight.value = document.body.clientHeight
    proxy.$store.dispatch('settings/updateMenuStatus', true)
  }
})

onUnmounted(() => {
  console.log('子服务事件销毁')
  window.$wujie?.bus.$off('syncSubSystemRoute', syncSubSystemRouteFun)
  window.$wujie?.bus.$off('toChildView', toChildViewFun)
  window.$wujie?.bus.$off('changeTagView', changeTagViewFun)
  window.$wujie?.bus.$off('toTurnHomePageView', toTurnHomePageViewFun)
  window.$wujie?.bus.$off('checkoutSystem', closeAllTags)
})

function initMicroAppEvent() {
  console.log('子服务事件销毁---------------')
  if (window.__POWERED_BY_WUJIE__) {
    console.log(window.$wujie?.bus)
    // 刷新加载子应用当前页面
    goRoute(window.parent.location.href)
    // 监听主应用菜单切换
    window.$wujie?.bus.$on('syncSubSystemRoute', syncSubSystemRouteFun)
    // 监听主应用系统切换
    // window.$wujie?.bus.$on('checkoutSystem', closeAllTags)
    // 监听主应用消息中心跳转子应用详情或列表传参事件
    window.$wujie?.bus.$on('toChildView', toChildViewFun)
    // 监听主应用添加tagView实现缓存
    window.$wujie?.bus.$on('changeTagView', changeTagViewFun)
    window.$wujie?.bus.$emit('microAppReady', '/funds')
    // 设置主应用登录用户信息
    let userInfo = window.$wujie?.props?.spdUserInfo
    if (userInfo) {
      proxy.$store.dispatch('user/setMicroUserInfo', userInfo)
    }
  }
}
function syncSubSystemRouteFun(sysCode, path, query) {
  console.log('funds---------' + sysCode)
  if (checkSysCode(sysCode)) {
    //goRoute(path)
    /* if (!tagView.path.includes('/baseReportPreview')) {
    } */
    proxy.$store.commit('ISOPENIFRAMEPAGE', path)
    router.replace({
      path,
      query,
    })
  }
}
function toChildViewFun(sysCode, data) {
  if (checkSysCode(sysCode)) {
    proxy.$store.dispatch('settings/toPage', data)
  }
  console.log('监听主应用消息中心跳转funds子应用详情或列表传参事件', data)
}
function changeTagViewFun(sysCode, type, tagView) {
  const hasSystemArr = ['add', 'remove', 'refresh']
  const hasNotSystemArr = ['removeOther', 'removeAll']
  if (
    // 流程页面
    tagView.path.includes('/myPendingDetails') ||
    // 其他系统操作
    hasNotSystemArr.includes(type) ||
    // 自己系统操作
    (hasSystemArr.includes(type) && checkSysCode(tagView.microName)))
  {
    busEventHandle(type, tagView)
  }
}
function toTurnHomePageViewFun(data) {
  console.log('？？？？？？？？？？？？？监听首页跳转传参funds-----------------', data)
  router.push({
    path: data.url,
    query: {
      // 不切换系统
      // doNotSwitch: true,
    },
  })
}
function busEventHandle(type, tagView) {
  switch (type) {
    case 'remove':
      closeTags(tagView)
      break
    case 'refresh':
      refreshSelectedTag(tagView)
      break
    case 'add':
      addTags(tagView)
      break
    case 'removeOther':
      closeOthersTags(tagView)
      break
    case 'removeAll':
      closeAllTags()
      break
    default:
      console.error('Cannot match the bus event type')
      break
  }
}
function getVisitedViews() {
  let _visitedViews = visitedViews.value
  if (!_visitedViews.length) {
    _visitedViews =
      JSON.parse(localStorage.getItem('routeStore'))?.routesTagViews || []
  }
  return _visitedViews
}
function closeTags(tagView) {
  let path = window.parent.location.href
  let sysCode = '/' + path.split('/microApp')[1].split('/')[1]
  proxy.$store.dispatch('settings/toPage', '')
  proxy.$store.dispatch('tabsView/delView', tagView)
  if (tagView.microName !== sysCode || proxy.$route.path === tagView.path) {
    proxy.$router.replace({
      path: '/',
    })
  }
}
//刷新
function refreshSelectedTag(tagView) {
  proxy.$store.dispatch('settings/toPage', '')
  const view = getView(tagView.path)
  proxy.$store.dispatch('tabsView/delCachedView', view).then(() => {
    const { path, query } = view
    proxy.$nextTick(() => {
      proxy.$router.replace({
        path: '/redirect' + path,
        query,
      })
      setTimeout(() => {
        addTags(view)
      }, 200)
    })
  })
}
function getView(path) {
  const _path = decodeURIComponent(path)
  const view = getVisitedViews().find((element) => {
    return _path.split('?')[0] === element.path.split('?')[0]
  })
  if (!view) return
  return view
}
// 新增tag
function addTags(tagView) {
  if (!tagView) return
  const { label, name } = tagView
  if (tagView.path.includes('/baseReportPreview') || tagView.path.includes('/myPendingDetails')) {
    tagView.label = tagView.path.split('?')[0]

    /* let iframeName = proxy.$store.state.template.iframeName
    iframeName.push(item.name)
    proxy.$store.commit('SET_IFRAMENAME', [...new Set(iframeName)]) */
  }
  if (label || name) {
    proxy.$store.dispatch('tabsView/addView', tagView)
  }
  return false
}
function closeOthersTags(tagView) {
  //proxy.$router.push(selectedTag.value)
  let { path, query } = tagView
  if (path.includes('?')) {
    query = { ...query, ...qs.parse(path.split('?')[1]) }
  }
  proxy.$nextTick(() => {
    proxy.$router.replace({
      path: path,
      query,
    })
  })
  proxy.$store.dispatch('tabsView/delOthersViews', tagView).then(() => {})
}
function closeAllTags() {
  proxy.$store.dispatch('settings/toPage', '')
  // proxy.$store.dispatch('tabsView/delAllViews').then(() => {})
}
function goRoute(path) {
  console.log('windows-funds路径--------', path)
  let sysCode = '/' + path.split('/microApp')[1].split('/')[1]
  let view = ''
  if (checkSysCode(sysCode)) {
    let _path = path.split(sysCode)[1]
    proxy.$router.replace({
      path: _path,
      query: qs.parse(_path.split('?')[1]),
    })
    view = getView(_path)
  } else if (sysCode === '/flow') {
    let _path = path.split('/microApp')[1]
    const decodePath = decodeURIComponent(_path.split('?')[0])
    proxy.$router.replace({
      path: decodePath,
      query: {
        ...window.$wujie?.props.routeQuery,
        ...qs.parse(_path.split('?')[1]),
      },
    })
    view = getView(_path)
  } else if (sysCode === '/controlDesk') {
    let _path = '/homePage'
    proxy.$router.replace({
      path: _path,
    })
    view = getView(_path)
  }
  addTags(view)
}
// 检查系统code是否当前系统
function checkSysCode(sysCode) {
  return sysCode && sysCode === import.meta.env.VITE_APP_SYSCODE
}
// 判断pc浏览器是否缩放，若返回100则为默认无缩放，如果大于100则是放大，否则缩小
function detectZoom() {
  let ratio = 0,
    screen = window.screen,
    ua = navigator.userAgent.toLowerCase()

  if (window.devicePixelRatio !== undefined) {
    ratio = window.devicePixelRatio
  } else if (~ua.indexOf('msie')) {
    if (screen.deviceXDPI && screen.logicalXDPI) {
      ratio = screen.deviceXDPI / screen.logicalXDPI
    }
  } else if (
    window.outerWidth !== undefined &&
    window.innerWidth !== undefined
  ) {
    ratio = window.outerWidth / window.innerWidth
  }

  if (ratio) {
    ratio = Math.round(ratio * 100)
  }
  // console.log(window.devicePixelRatio, 123);
  return ratio
}
function isScale() {
  let rate = detectZoom(),
    isMac = /macintosh|mac os x/i.test(navigator.userAgent) // Mac默认缩放值为200，windows默认为100，需要分开判断
  if ((isMac && rate !== 200) || (!isMac && rate !== 100)) {
    //如何让页面的缩放比例自动为100,'transform':'scale(1,1)'没有用，又无法自动条用键盘事件，目前只能提示让用户如果想使用100%的比例手动去触发按ctrl+0
    // alert(
    //   "当前页面不是100%显示，请按键盘ctrl/command + 0恢复100%显示标准，以防页面显示错乱！"
    // );
  }
}
</script>
