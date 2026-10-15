<script setup>
import {computed, getCurrentInstance, ref} from "vue";

const { proxy } = getCurrentInstance()

const emit = defineEmits()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  noFullButton: {
    type: Boolean,
    default: false
  },
  flex: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  btnList: {
    type: Array,
    default: () => ([])
  },
  flowFormType: {
    type: String
  },
  affairTableInfo: {
    type: Object
  }
})

const fullInfo = ref({
  btnList: [{ label: '保存', event: () => save(), show: !props.flowFormType }],
})

const fullInfoBtnList = computed(() => [...props.btnList, ...(props.noFullButton ? [] : fullInfo.value.btnList)])

const listeners = {}

const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})

const save = async () => {
  try {
    await trigger('validate')
    emit('save')
  } catch(e) {
    console.error('校验报错', e)
    emit('save', e)
  }
}

const on = (eventName, callback) => {
  if (!listeners[eventName]) {
    listeners[eventName] = []
  }
  listeners[eventName].push(callback)
}
const off = (eventName, callback) => {
  if (listeners[eventName]) {
    listeners[eventName] = listeners[eventName].filter(cb => cb !== callback)
  }
}

const trigger = async (eventName, data) => {
  if (listeners[eventName]) {
    for (const callback of listeners[eventName]) {
      await callback(data)
    }
  }
}

const validate = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await trigger('validate')
      resolve()
    } catch(e) {
      reject(e)
    }
  })
}
// // 绑定的相关事件
function returnBack() {
  emit('returnBack')
}

provide('on', on)
provide('off', off)

defineExpose({
  validate
})
</script>

<template>
  <NewFullScreen
      v-if="showDialog"
      v-model="showDialog"
      :title="title"
      :btn-list="fullInfoBtnList"
      :needOperateAffair="flowFormType && !!affairTableInfo?.query"
      :operateAffairData="affairTableInfo"
      :needReturn="!flowFormType"
      :class="{ 'modify-page-flex': flex }"
      @returnBack="returnBack"
  >
    <template #full-button>
      <slot name="full-button" />
    </template>
    <slot />
  </NewFullScreen>
</template>

<style scoped lang="scss">
.modify-page-flex :deep(#newFullScreenScroll) {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}
</style>
