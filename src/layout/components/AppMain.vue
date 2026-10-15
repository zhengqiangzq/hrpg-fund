<template>
  <section class="app-main">
    <!-- <keep-alive :include="cachedViews">
      <router-view :key="key"></router-view>
    </keep-alive> -->
    <router-view v-slot="{ Component, route }">
      <keep-alive :include="cachedViews">
        <component
          v-if="hasIframe"
          :is="formatComponentInstance(Component, route)"
          :key="key"
        />
      </keep-alive>
    </router-view>
    <!-- iframe页 -->
    <component
      v-for="item in hasOpenComponentsArr"
      :key="item.key"
      :is="item.name"
      v-show="$route.name === item.name"
    ></component>
  </section>
</template>
<script setup name="AppMain">
const { proxy } = getCurrentInstance()
const route = useRoute()
// 用来存已经创建的组件
const wrapperMap = new Map()
// 含有iframe的页面
const componentsArr = ref([])
const _iframeName = computed(() => {
  return proxy.$store.state.template.iframeName
})
const cachedViews = computed(() => {
  return proxy.$store.state.tabsView.cachedViews
})
const visitedViews = computed(() => {
  return proxy.$store.state.tabsView.visitedViews
})
const key = computed(() => {
  return route.path
})
const hasIframe = computed(() => {
  const tempBool = componentsArr.value.some((item) => {
    return item.name === route.name
  })
  return !tempBool
})
// 实现懒加载，只渲染已经打开过（hasOpen:true）的iframe页
const hasOpenComponentsArr = computed(() => {
  return componentsArr.value.filter((item) => item.hasOpen)
})

watch(
  () => route,
  () => {
    // 判断当前路由是否iframe页
    isOpenIframePage()
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => visitedViews.value,
  (val) => {
    // 删除tab标签后清除对应的component组件
    refreshIframe(val)
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => cachedViews.value,
  (val) => {
    // 刷新tab标签后先行清除对应的component组件重新加载，后期有更好方案再改
    refreshIframe(val)
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => proxy.$store.state.template.iframeName,
  (val) => {
    _iframeName.value = val
    initIframe()
  },
  {
    deep: true,
  }
)
// 触发刷新children路由iframe组件
watch(
  () => proxy.$store.state.template.freashIframe,
  (val) => {
    console.log(val)
    val = String(val)
    // 刷新某个ifream
    if (val.includes('@@')) {
      refreshIframeOne(val)
      // 关闭其他ifream
    } else if (val.includes('##')) {
      closeOthersTags(val)
    } else {
      componentsArr.value = []
    }
    setTimeout(() => {
      initIframe()
    }, 0)
  },
  {
    deep: true,
  }
)
onMounted(() => {
  initIframe()
})

function refreshIframeOne(name) {
  name = name.split('@@')[0]
  componentsArr.value.some((item) => {
    if (name === item.name) {
      item.hasOpen = false
    }
  })
}

function closeOthersTags(name) {
  name = name.split('##')[0]
  componentsArr.value.some((item) => {
    if (name !== item.name) {
      item.hasOpen = false
    }
  })
}

function initIframe() {
  // 设置iframe页的数组对象
  componentsArr.value = [...new Set(getComponentsArr())]
  // 判断当前路由是否iframe页
  isOpenIframePage()
}
function refreshIframe(val) {
  // 删除tab标签后清除对应的component组件
  componentsArr.value.some((item) => {
    val.some((el) => {
      if (el.name === item.name || el === item.name) {
        item.hasOpen = true
        return true
      } else {
        item.hasOpen = false
      }
    })
  })
}
// 根据当前路由设置hasOpen
function isOpenIframePage() {
  const target = componentsArr.value.find((item) => {
    return item.name === route.name
  })
  if (target && !target.hasOpen) {
    target.hasOpen = true
  }
}
// 遍历路由的所有页面，把含有iframeComponent标识的收集起来
function getComponentsArr() {
  return _iframeName.value.map((item, index) => {
    return {
      name: item,
      key: item,
      hasOpen: false, // 是否打开过，默认false
      ...(componentsArr.value[index] ? componentsArr.value[index] : {}),
    }
  })
}
// 将router重新换一个新的组件，原组件包里面
function formatComponentInstance(component, route) {
  if (route.path.includes('/baseReportPreview') || route.path.includes('/myPendingDetails')) {
    let wrapper
    if (component) {
      const wrapperName = route.path.split('?')[0]
      if (wrapperMap.has(wrapperName)) {
        wrapper = wrapperMap.get(wrapperName)
      } else {
        wrapper = {
          name: wrapperName,
          render() {
            return h(component)
          },
        }
        wrapperMap.set(wrapperName, wrapper)
      }
      return h(wrapper)
    }
  }
  return component
}
</script>
<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 81px);
  }

  .fixed-header + .app-main {
    padding-top: 81px;
  }
}
</style>
