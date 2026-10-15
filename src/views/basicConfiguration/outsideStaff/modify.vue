<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {addOutsideStaff, oneOutsideStaff, updateOutsideStaff} from "@/api/basicConfiguration/outsideStaff";
import {useSelectData} from "@/hooks/useSelectData";

const { proxy } = getCurrentInstance();
const API = {
  one: oneOutsideStaff,
  add: addOutsideStaff,
  batchAdd: null,
  update: updateOutsideStaff
}

const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  batch: false,
  id: '',
  flowFormType: ''
})
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = reactive({
  modifyFormRef: null,
  title: '院外人员',
  labelWidth: '120px',
  listType: {
  },
  fieldList: [
    { label: '人员编码', value: 'code', type: 'input', disabled: !!Number(props.id) },
    { label: '人员名称', value: 'name', type: 'input' },
    { label: '院外人员类别编码', value: 'staffClassCode', type: 'slot' },
    { label: '院外人员类别名称', value: 'staffClassName', type: 'input', disabled: true },
    { label: '证件号码', value: 'idCard', type: 'input' },
    { label: '开户银行', value: 'bankDocName', type: 'slot' },
    { label: '银行类别', value: 'bankTypeName', type: 'input', disabled: true },
    { label: '联行号', value: 'combineNum', type: 'input', disabled: true },
    { label: '银行户名', value: 'bankCardUsername', type: 'input' },
    { label: '银行账号', value: 'bankCardNumber', type: 'input' },
    { label: '银行性质', value: 'accountType', type: 'select-model', code: 'account_type' },
    { label: '启用状态', value: 'status', type: 'select-model', code: 'enabled_type', show: !!Number(props.id) },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请输入人员编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入人员名称', trigger: 'blur' }],
    staffClassCode: [{ required: true, message: '请选择院外人员类别编码', trigger: 'change' }],
    idCard: [{ required: true, message: '请输入证件号码', trigger: 'blur' }],
    bankDocName: [{ required: true, message: '请选择开户银行', trigger: 'change' }],
    bankCardUsername: [{ required: true, message: '请输入银行户名', trigger: 'blur' }],
    bankCardNumber: [{ required: true, message: '请输入银行账号', trigger: 'blur' }],
    accountType: [{ required: true, message: '请选择银行性质', trigger: 'change' }],
  },
  data: {}
})

const { selectorInfo, selectorRef } = useSelectData()


onMounted(() => {
  if (props.id) {
    getMain()
  }
})

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
  })
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.data,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.data = {}
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function selectStaffClass() {
  selectorInfo.type = 'staffClass'
  selectorInfo.query = {}
  selectorInfo.callback = (row) => {
    formInfo.data.staffClassId = row.id
    formInfo.data.staffClassCode = row.code
    formInfo.data.staffClassName = row.name
  }
  selectorInfo.visible = true
}
function selectBankDoc() {
  selectorInfo.type = 'bankDoc'
  selectorInfo.query = {}
  selectorInfo.callback = (row) => {
    formInfo.data.bankDocId = row.id
    formInfo.data.bankDocCode = row.code
    formInfo.data.bankDocName = row.name
    formInfo.data.bankTypeId = row.bankTypeId
    formInfo.data.bankTypeName = row.bankTypeName
    formInfo.data.combineNum = row.combineNum
  }
  selectorInfo.visible = true
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-staffClassCode>
        <el-input
            v-model="formInfo.data.staffClassCode"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择院外人员类别"
        >
          <template #append>
            <el-icon @click="selectStaffClass"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-bankDocName>
        <el-input
            v-model="formInfo.data.bankDocName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择开户银行"
        >
          <template #append>
            <el-icon @click="selectBankDoc"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">

</style>
