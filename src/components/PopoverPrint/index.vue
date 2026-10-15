<template>
  <el-popover
    ref="popoverShow"
    v-model:visible="_popoverVisible"
    placement="bottom"
    :width="160"
    popper-class="popoverBox"
    trigger="click"
  >
    <template #reference>
      <el-button type="primary" v-if="canPrint" @click="print">{{ title }}</el-button>
    </template>
    <div v-if="templateArr && templateArr.length > 1" class="selectBox">
      <span
        v-for="item in templateArr"
        :key="item.id"
        :title="item.tplName"
        @click="tempClick(item)"
        class="col"
        >{{ item.tplName }}</span
      >
    </div>
  </el-popover>
</template>
<script setup>
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: function () {
      return '打印'
    },
  },
  canPrint: {
    type: Boolean,
    default: false,
  },
  popoverVisible: {
    type: Boolean,
    default: false,
  },
  templateArr: {
    type: Boolean,
    default: function () {
      return []
    },
  },
})
const _popoverVisible = computed({
  get() {
    return props.popoverVisible
  },
  set(newValue) {
    proxy.$emit('update:popoverVisible', newValue) // 更新父组件visible
  },
})
function print() {
  proxy.$emit('print')
}
function tempClick(item) {
  proxy.$emit('tempClick', item)
  _popoverVisible.value = false
}
function hidePopover() {
  proxy.$refs.popoverShow.hide()
}
defineExpose({
  hidePopover,
})
</script>
<style lang="scss">
.el-popper.is-light{
  border:none;
}
</style>
