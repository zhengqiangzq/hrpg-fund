<script setup>
import {getCurrentInstance, inject, onMounted, onUnmounted, ref} from "vue";

const { proxy } = getCurrentInstance()

const on = inject('on')
const off = inject('off')

const emits = defineEmits([])

const props = defineProps({
  formInfo: {
    type: Object,
    required: true
  },
  noTitle: {
    type: Boolean,
    default: false
  },
  listTypeInfo: {
    type: Object
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const formRef = ref()
const pageFormRef = ref()

const validate = () => {
  return new Promise((resolve, reject) => {
    formRef.value.validate((valid, data) => {
      if (!valid) {
        reject(data)
      }
      resolve(true)
    })
  })
}

function handleEvent(event, data) {
  typeof event?.event === 'function' && event?.event(data)
}
onMounted(() => {
  on && on('validate', validate)
  props.formInfo.formRef = pageFormRef.value
})
onUnmounted(() => off && off('validate', validate))
</script>

<template>
  <div class="model-panel">
    <div class="model-panel-title" v-if="!noTitle">
      <p>{{ formInfo.title ?? '基础信息' }}</p>
    </div>
    <div class="model-panel-body paddingBox order-model-formBox">
      <page-form
          ref="pageFormRef"
          v-model:ref-obj="formRef"
          :data="formInfo.data"
          :field-list="formInfo.fieldList"
          :rules="formInfo.rules"
          :disabled="disabled"
          :listTypeInfo="listTypeInfo"
          :label-width="formInfo.labelWidth"
          @handleEvent="handleEvent"
      >
        <template
            v-for="(slotKey, index) in Object.keys($slots)"
            #[slotKey]="scope"
            :key="index">
          <slot :name="slotKey" v-bind="scope" />
        </template>
      </page-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.model-panel {
  padding: 0 !important;
}
</style>
