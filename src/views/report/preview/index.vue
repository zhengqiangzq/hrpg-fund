<template>
  <div>
    <IFrame v-model:src="url" />
  </div>
</template>

<script setup name="PreviewReportManager">
import qs from 'qs'
const store = useStore()
const route = useRoute()
const { proxy } = getCurrentInstance()
const ureportURL = import.meta.env.VITE_APP_UREPORT_URL
const ureportStore = store.state.template.ureportUrl
let query = qs.stringify(route.query)
console.log(8989889)
watch(
  () => route.query,
  () => {
    let clickDomA = sessionStorage.getItem('clickDomA')
    let clickDomABefore = sessionStorage.getItem('clickDomABefore')
    let clickDomName = ''
    if (clickDomA) {
      // 判断是点击页面跳转报表（同一表报不同参数需要刷新，回到其他报表或者当前报表不刷新，保持缓存状态）
      clickDomA = decodeURIComponent(clickDomA)
      let params_u = '_u='
      if (clickDomA.includes(params_u)) {
        clickDomName = getReportName(clickDomA)
      }
      if (decodeURIComponent(clickDomABefore) !== clickDomA) {
        proxy.$store.commit(
          'FREASHIFRAME',
          clickDomName + '@@' + new Date().getTime()
        )
        sessionStorage.setItem(
          'clickDomABefore',
          sessionStorage.getItem('clickDomA')
        )
      }
    }
  },
  {
    immediate: true,
  }
)
const url = ref(ureportURL + '/ureport/preview?' + query)
const localDesigner = localStorage.getItem('ureportDesigner')
if (!ureportStore && localDesigner && !route.query._u) {
  url.value = ureportURL + localDesigner
}
function getReportName(path) {
  let params_u = '_u=slip-',
    reprotSuffix = '.ureport.xml'
  return path.split(params_u)[1].split(reprotSuffix)[0]
}
</script>
