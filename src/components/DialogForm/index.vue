<template>
  <el-dialog draggable
    :title="title"
    v-model="shows"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :before-close="handleClose"
    :append-to-body="appendToBody"
    :class="className"
  >
    <div class="paddingBox order-model-formBox">
      <slot />
    </div>
    <template #footer v-if="btList">
      <div class="dialog-footer">
        <template v-for="(item, index) in getConfigList()">
          <el-button
              v-if="item.show === undefined || item.show"
              :key="index"
              :icon="item.icon"
              :type="item.type"
              :disabled="item.disabled"
              :loading="btLoading"
              @click="item.event"
          >{{ item.label }}</el-button
          >
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="DialogForm">
import {ElDialog} from "element-plus";

const emits = defineEmits()
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
  },
  // 弹窗标题
  title: {
    type: String,
  },
  // 弹窗是否显示
  visible: {
    type: Boolean,
    default: false,
  },
  // 弹窗宽度
  width: {
    type: String,
    default: '60%',
  },
  // 按钮加载
  btLoading: {
    type: Boolean,
    default: false,
  },
  // 操作栏配置
  btList: {
    type: Array,
  },
  // 插入到body
  appendToBody: {
    type: Boolean,
    default: true,
  },
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
})

const shows = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('update:visible', val) // 更新父组件shows
  },
})

// 获取按钮列表
function getConfigList() {
  const reverseBtnlist = [...props.btList]
  return reverseBtnlist.reverse().filter(
    (item) =>
      !item.hasOwnProperty('show') || (item.hasOwnProperty('show') && item.show)
  )
}
// // 绑定的相关事件
function handleClose(done) {
  shows.value = false
  emits('reset')
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: end;
}
.order-model-formBox :deep(.el-form-item):not(.not-br) {
  //width: 45% !important;
}
</style>
