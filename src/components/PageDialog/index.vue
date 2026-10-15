<template>
  <div>
    <el-dialog draggable
      v-model="showDialog"
      :title="title"
      :width="width"
      :close-on-click-modal="closeOnClickModal"
      :before-close="handleClose"
      :append-to-body="appendToBody"
      class="page-dialog"
      :class="className"
      :top="top"
       @close="handleClose"
      :style="{ marginTop: marginTop }"
    >
      <slot />
      <template #footer>
        <div v-if="btList?.length" class="dialog-footer">
          <template v-for="(item, index) in getConfigList()" :key="index">
            <el-button
              v-if="item.type !== 'slot'"
              :icon="item.icon"
              :type="item.type"
              :disabled="item.disabled"
              :loading="btLoading"
              @click="item.event"
              >{{ item.label }}</el-button
            >
            <template v-if="item.type === 'slot'">
              <slot :name="'dialog-' + item.value" />
            </template>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
const emit = defineEmits(['reset', 'update:visible'])
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
    default: '',
  },
  // 弹窗标题
  title: {
    type: String,
    default: '',
  },
  // 弹窗是否显示
  visible: {
    type: Boolean,
    default: false,
  },
  // 弹窗宽度
  width: {
    type: String,
    default: '800px',
  },
  // 按钮加载
  btLoading: {
    type: Boolean,
    default: false,
  },
  // 操作栏配置
  btList: {
    type: Array,
    default: function () {
      return []
    },
  },
  // 插入到body
  appendToBody: {
    type: Boolean,
    default: true,
  },
  //是否可以通过点击 modal 关闭 Dialog
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
  //Dialog CSS 中的 margin-top 值
  top: {
    type: String,
    default: '15vh',
  },
  marginTop: {
    type: String,
    default: '20vh',
  },
})

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue) // 更新父组件shows
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

//关闭弹窗
const handleClose = () => {
  showDialog.value = false
  // emit('update:visible', false)
  emit('reset')
}
</script>
<style lang="scss"></style>
