<template>
  <div class="checkBox">
<!--    <el-dialog-->
<!--        draggable-->
<!--        :append-to-body="true"-->
<!--        :title="title"-->
<!--        v-model="state.dialogVisible"-->
<!--        custom-class="dialogBox"-->
<!--        :close-on-click-modal="false"-->
<!--        @close="cancel"-->
<!--    >-->
      <page-dialog
          v-if="state.dialogVisible"
          :title="title"
          v-model:visible="state.dialogVisible"
          :width="state.width"
          :bt-list="state.btList"
          @reset="cancel"
      >
      <page-form
          class="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="state.ref"
          :data="state.formData"
          :field-list="state.fieldList"
          :rules="state.rules"
          :label-width="state.labelWidth"
      >
      </page-form>
    </page-dialog>
  </div>
</template>
<script setup name="vehicleAddEdit">
import {useStorage} from "@vueuse/core";
import PageDialog from "@/components/PageDialog/index.vue";

const setting = useStorage('setting', {}, sessionStorage)
const props = defineProps({
  title: {
    type: String,
    default: '新增汇票类型'
  },
  tableRow: {
    type: Object,
    default: {},
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()
const state = reactive({
  ref: null,
  dialogVisible: false,
  formData: {

  },
  btList: [
    { label: '取消', event: cancel, show: true },
    {
      label: '确定',
      type: 'primary',
      event: userUpdate,
      show: true,
    },
  ],
  fieldList: [
    { label: '计划子项目', span: 12, disabled: props.tableRow?.businessIds, value: 'planChildItem', type: 'input' },
    { label: '编制数', span: 12, disabled: props.tableRow?.businessIds, min: -99999999, value: 'amount', type: 'money' },
    { label: '备注', span: 24, value: 'remark', type: 'textarea' },
  ],
  rules: {
    planChildItem: [{ required: true, message: '请填写计划子项目' }],
    amount: [{ required: true, message: '请填写编制数' }],
  },
})

const emit = defineEmits()

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      if (val) {
        if (props.tableRow) {
          state.formData = { ...props.tableRow }
        } else {
          state.formData = {}
        }
      } else {
        state.formData = {}
      }
    },
    {
      immediate: true,
    }
  )

function cancel() {
  state.dialogVisible = false
  state.formData = {}
  emit('callback', false)
}
function userUpdate() {
  state.ref.validate((valid) => {
    if (valid) {
      state.dialogVisible = false
      emit('callback', true, state.formData)
    } else {
      return false
    }
  })
}
</script>
