<template>
  <page-dialog
      v-if="shows"
      :title="dialogInfo.title"
      v-model:visible="shows"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
      @reset="handleClose"
  >
    <select-tree v-if="selectorInfo.component === 'tree'" v-model="selectRow" :info="selectorInfo" />
    <SelectTreeTable v-if="selectorInfo.component === 'treeTable'" v-model="selectRow" :info="selectorInfo" />
    <select-table v-else-if="selectorInfo.fieldList" v-model="selectRow" :info="selectorInfo" />
  </page-dialog>
</template>

<script setup>
import PageDialog from '../PageDialog/index'
import {ref, watch} from "vue";
import SelectTable from "./selectTable.vue";
import SelectTreeTable from "./selectTreeTable.vue";
import SelectTree from "./selectTree.vue";

const { proxy } = getCurrentInstance()

const shows = ref(false)

// 弹窗相关
const dialogInfo = reactive({
  title: '选择数据',
  btLoading: false,
  btList: [
    { label: '取消', event: handleClose, show: true },
    {
      label: '确定',
      type: 'primary',
      disabled: true,
      event: save,
      show: true,
    },
  ],
})
const selectRow = ref('')
const saveEmpty = ref(true)
const check = ref(true)
const selectorInfo = ref(null)
let callback = null
let onClose = null

watch(() => selectRow.value, (val) => {
  if (!saveEmpty.value) {
    dialogInfo.btList[1].disabled = Array.isArray(val) ? !val.length : val === {}
  }
}, { immediate: true })

function save() {
  if(check.value) {
    handleClose()
  }
  callback && callback(selectRow.value)
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  onClose && onClose()
}

function show(info) {
  dialogInfo.title = info.title || '选择数据'
  selectRow.value = info.checkBox ?? false ? [] : {}
  saveEmpty.value = info.saveEmpty ?? true
  check.value = info.check ?? true
  dialogInfo.btList[1].disabled = !saveEmpty.value
  onClose = info.onClose
  callback = info.callback
  selectorInfo.value = info
  shows.value = true
}

function hide() {
  handleClose()
}

defineExpose({
  show,
  hide
})
</script>

<style scoped>
:deep(.el-dialog__body) {
  height: 355px;
  display: flex;
  flex-direction: column;
}
</style>
