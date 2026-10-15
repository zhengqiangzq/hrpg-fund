<script setup>
import {computed} from "vue";

const emits = defineEmits(['update:dialogInfo'])
const props = defineProps({
  dialogInfo: {
    type: Object,
    default: () => ({})
  }
})
const _dialogInfo = computed({
  get: () => props.dialogInfo,
  set: (val) => emits('update:dialogInfo', val)
})

function formEventHandler(event, data) {
  if (typeof event === 'function') {
    event(data)
  } else if (typeof event?.event === 'function') {
    event.event(data)
  }
  emits('handleEvent', event, data)
}
</script>

<template>
  <dialog-form :width="_dialogInfo.width" :title="_dialogInfo.title" :btList="_dialogInfo.btList" v-model:visible="_dialogInfo.visible">

    <div class="model-panel-body paddingBox order-model-formBox">
    <page-form
        v-model:ref-obj="_dialogInfo.refObj"
        :label-width="_dialogInfo.labelWidth"
        :data="_dialogInfo.row"
        :listTypeInfo="_dialogInfo.listTypeInfo"
        :field-list="_dialogInfo.fieldList"
        :rules="_dialogInfo.rules"
        @handleEvent="formEventHandler"
    >
      <template
          v-for="(slotKey, index) in Object.keys($slots).filter(key => /^form-.+/.test(key))"
          #[slotKey]="scope"
          :key="index">
        <slot :name="slotKey" v-bind="scope" />
      </template>
    </page-form>
    </div>
  </dialog-form>
</template>

<style scoped lang="scss">

</style>
