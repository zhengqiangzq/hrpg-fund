<template>
  <div class="checkBox">
    <el-dialog
        draggable
        :append-to-body="true"
        :title="title"
        v-model="state.dialogVisible"
        custom-class="dialogBox"
        :close-on-click-modal="false"
        :modal="false"
        @close="cancel"
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
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="userUpdate('ruleForm')">{{
              $t('btn_confirm')
            }}</el-button>
          <el-button @click="cancel">{{ $t('btn_cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="vehicleAddEdit">
import {addBillType} from "@/api/billManagement/billType";
import {useStorage} from "@vueuse/core";

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
    enableStatus: '1',
    orgId: setting.value.hospitalId,
    orgName: setting.value.hospitalName,
  },
  fieldList: [
    { label: '票据类型编码', span: 12, value: 'code', type: 'input' },
    { label: '票据类型名称', span: 12, value: 'name', type: 'input' },
    { label: '启用状态', span: 12, value: 'enableStatus', type: 'select-model', code: 'enabled_type', disabled: true },
    { label: '创建组织', span: 12, value: 'orgName', type: 'input', disabled: true },
    { label: '备注', span: 24, value: 'remark', type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写票据类型编码' }],
    name: [{ required: true, message: '请填写票据类型名称' }],
  },
})

const emit = defineEmits()

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
    },
    {
      immediate: true,
    }
)
watch(
    () => props.tableRow,
    (val) => {
      state.formData = Object.assign(state.formData, val)
      console.log(state.formData)
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
function userUpdate(formName) {
  //新增or编辑用户
  const api = addBillType
  state.ref.validate((valid) => {
    if (valid) {
      api(state.formData).then((resp) => {
        if (resp.code === 200) {
          state.dialogVisible = false
          emit('callback', true)
        }
      })
    } else {
      return false
    }
  })
}
</script>

<style scoped lang="scss">
:deep(.dialogBox .el-dialog__body) {
  margin: 0;
}
</style>
