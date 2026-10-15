<template>
  <div id="flowBox">
    <!-- 涉及到流程的组件页面请保持一致，统一改造业务单据用ID进行传值，不再使用tableRow,orderId等进行传参 -->
    <component
      v-if="detailInfo.id"
      ref="detailInfoComponent"
      :key="detailInfo.id"
      :is="detailInfo.name"
      :id="detailInfo.id"
      :visible="true"
      v-bind="detailInfo"
      :flowFormType="detailInfo.bussinessType"
      @returnModify="onClose"
    ></component>
  </div>
</template>

<script setup name="flowDetails">
const {proxy} = getCurrentInstance()
const route = useRoute()
//明细相关
const detailInfo = ref({
  // 表单ID 通过获取表单ID回显表单具体信息
  id: '',
  // 组件名称
  name: '',
  // 表单不同节点类型
  bussinessType: '',
})
const containerHeight = ref(600)

onMounted(() => {
  // handelStyle()
  console.log('流程框架组件加载')
  console.log(window.$wujie)
  if (window.$wujie?.props.flowData) {
    detailInfo.value = window.$wujie?.props.flowData
  }
  // 监听主应用流程展示子应用详情或列表传参事件
  window.$wujie?.bus.$on('flowParentSetChange', parentSetChange)
})
// 切换多tab
onActivated(() => {
  console.log('进入流程缓存了');
  // 监听主应用流程展示子应用详情或列表传参事件
  window.$wujie?.bus.$on('flowParentSetChange', parentSetChange)
  // handelStyle()
})
onUnmounted(() => {
  console.log('子事件销毁')
  window.$wujie?.bus.$off('flowParentSetChange', parentSetChange)
})
onDeactivated(() => {
  console.log('离开流程缓存了');
  window.$wujie?.bus.$off('flowParentSetChange', parentSetChange)
})

async function parentSetChange(sysCode, event, data) {
  if (checkSysCode(sysCode)) {
    if (event === 'handlerOperation') {
      handlerOperation()
    } else if (event === 'submitAndSaveForm') {
      submitAndSaveForm(data)
    } else if (event === 'getFlowFormInfo') {
      const formInfoData = (await proxy.$refs.detailInfoComponent
        .getFlowFormInfo)
        ? await proxy.$refs.detailInfoComponent.getFlowFormInfo()
        : null
      console.log('获取formInfoData', formInfoData)
      await window.$wujie?.bus.$emit(
        'flowSonSetChange',
        'flowInfo',
        formInfoData
      )
    } else if (event === 'setComponentInfo') {
      proxy.$nextTick(() => {
        detailInfo.value = data
      })
      console.log('切换流程组件')
    }
    console.log('监听主应用流程展示子应用详情或列表传参事件', event)
  }
}

// 处理设置表格自适应样式
function handelStyle() {
  setStyle()
  window.onresize = () => {
    console.log('浏览器滚动事件')
    setStyle()
  }
}

// 计算表格自适应高度
function setStyle() {
  proxy.$nextTick(() => {
    const topHeight = document
      .getElementById('flowBox')
      ?.getBoundingClientRect().top
    console.log('流程详情盒子距离上边距', topHeight)
    if (!topHeight.value) {
      return
    }
    containerHeight.value = document.body.clientHeight - topHeight + 63
  })
}

// 检查系统code是否当前系统
function checkSysCode(sysCode) {
  return sysCode && sysCode === import.meta.env.VITE_APP_SYSCODE
}

// 自定义操作按钮执行事项
async function handlerOperation() {
  console.log('子应用handlerOperation事件触发')
  let tempBool = proxy.$refs.detailInfoComponent.submitForm
    ? await proxy.$refs.detailInfoComponent.submitForm()
    : true
  if (!tempBool) {
    proxy.$message.warning('请按照提示填写所有数据')
    return
  }
  console.log('流程通知主服务继续操作', tempBool)
  window.$wujie?.bus.$emit('flowSonSetChange', 'submitForm')
}

// 点击操作按钮执行方法(保存和提交按钮)
async function submitAndSaveForm(data) {
  console.log(data)
  if (data.btnType === 'save') {
    if (!proxy.$refs.detailInfoComponent.save) {
      proxy.$message.warning('请检查流程设计表单绑定是否正确，该表单无保存方法')
      return
    }
    proxy.$refs.detailInfoComponent.save()
  } else if (data.btnType === 'submit') {
    if (!proxy.$refs.detailInfoComponent.saveAndSubmit) {
      proxy.$message.warning('请检查流程设计表单绑定是否正确，该表单无提交方法')
      return
    }
    proxy.$refs.detailInfoComponent.saveAndSubmit(data)
  }
}

function onClose() {
  console.log('通知主服务关闭流程弹窗')
  proxy.$fn.setFlowPath(proxy)
}
</script>

<style lang="scss" scoped>
#flowBox {
  height: calc(100vh - 170px);

  .app-container {
    height: 100%;
  }
}
</style>
