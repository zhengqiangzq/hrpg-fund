<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {
  addCashWithdrawal, modifyCashWithdrawal,
  oneCashWithdrawal,
  submitCashWithdrawal,
  updateCashWithdrawal
} from "@/api/business/cashWithdrawal";
import moment from "moment/moment";
import {deepClone} from "@/utils";

const { proxy } = getCurrentInstance();
const store = useStore()
const API = {
  one: oneCashWithdrawal,
  add: addCashWithdrawal,
  modify: modifyCashWithdrawal,
  submit: submitCashWithdrawal,
  batchAdd: null,
  update: updateCashWithdrawal
}
const { selectorInfo, selectorRef } = useSelectData()
const emit = defineEmits(['returnModify'])
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

const BUSINESS_TYPE = 'fundsCashDrawOrder'
const originalData = ref('')
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
const userInfo = JSON.parse(localStorage.getItem('userInfoStore'))?.userAndPermissionInfo?.userInfoDTO || {}

const formInfo = reactive({
  modifyFormRef: null,
  title: '收款信息',
  labelWidth: '120px',
  listType: {
  },
  fieldList: [
    { label: '机构名称', value: 'orgName', type: 'input', disabled: true, show: proxy.$fn.getIsOtherOrg() },
    { label: '单据号', value: 'orderNo', type: 'input', disabled: true, show: !!props.id },
    { label: '业务日期', value: 'orderTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '经办人', value: 'createUserName', type: 'input', disabled: true },
    { label: '职能部门', value: 'createUserDeptName', type: 'slot' },
    { label: '银行账户', value: 'bankAccountOutName', type: 'slot' },
    { label: '现金账户', value: 'cashAccountInName', type: 'slot'},
    { label: '附件张数', value: 'attachCount', type: 'number' },
    { label: '支取金额', value: 'money', type: 'money', min: 0.01 },
    { label: '结算状态', value: 'settlementStatus', type: 'select-model', code: 'funds_settle_status', disabled: true },
    { label: '单据状态', value: 'status', type: 'select-model', code: 'funds_order_status', disabled: true },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    orderTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    cashAccountInName: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    createUserDeptName: [{ required: true, message: '请选择职能部门', trigger: 'change' }],
    bankAccountOutName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    money: [{ required: true, message: '请输入转账金额', trigger: 'blur' }],
  },
  data: {
    status: '1',
    createUserDeptName: userInfo.deptName,
    createUserDeptId: userInfo.deptId,
    createUserName: userInfo.name,
    createUser: userInfo.id,
    settlementStatus: '1',
    orderTime: moment().format('YYYY-MM-DD 00:00:00')
  }
})

const { fileFormInfo } = useAttachUpload()

onMounted(async () => {
  if (props.id) {
    await getMain()
  }
})

async function getMain() {
  const {code, data} = await API.one(props.id)
  if (code === 200) {
    formInfo.data = data
    await getAttach()
    let from = {
      ...JSON.parse(JSON.stringify(formInfo.data)),
      annexUploadVOS: JSON.parse(JSON.stringify(fileFormInfo.data.filePathList)),
    }
    originalData.value = JSON.stringify(deepClone(from))
  }
}

async function getAttach() {
  const { data, code } = await annexUploadAll({ relativeId: props.id })
  if (code === 200) {
    fileFormInfo.data.filePathList = data
  }
}

function buildForm() {
  let data = JSON.parse(JSON.stringify(formInfo.data))
  data.annexUploadVOS = JSON.parse(JSON.stringify(fileFormInfo.data.filePathList))
  return data
}

async function validator() {
  await pageRef.value.validate()
  return true
}


async function submitForm() {
  return !!await validator()
}
function getFlowFormInfo() {
  let data = buildForm()
  if (JSON.stringify(data) == originalData.value) {
    return null
  }
  data.oldOrder = JSON.parse(originalData.value)
  return data
}

async function saveAndSubmit(flowData) {
  const flag = await validator()
  if (!flag) return
  saveAndSubmitData(formInfo.data.id, buildForm(), flowData)
}

async function modify(flowData) {
  if (formInfo.data.status == 1 || formInfo.data.status == 4) {
    save()
  } else {
    const flag = await validator()
    if (!flag) return
    saveData(formInfo.data.id, getFlowFormInfo() || buildForm(), flowData)
  }
}

function saveData(orderId, orderData, flowData) {
  const data = {
    orderId: orderId,
    orderData: orderData,
    flowTaskCommentDto: { approvalType: 'save' },
    processDefinitionKey: BUSINESS_TYPE,
    processInstanceId: flowData?.processInstanceId,
    taskId: flowData?.taskId
  }
  // 流程中保存并提交
  API.modify(data).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      if (proxy.$route.query.processInstanceId) {
        proxy.$fn.setFlowPath(proxy)
      }
    }
  })
}


function saveAndSubmitData(orderId, orderData, flowData) {
  let from = {
    flowTaskCommentDto: { approvalType: 'submit' },
    processDefinitionKey: BUSINESS_TYPE,
    orderId: orderId,
    processInstanceId: flowData?.processInstanceId,
    taskId: flowData?.taskId
  }
  API.submit(from).then(({ code, data }) => {
    if (code === 200) {
      proxy.$message.success('操作成功')
      if (proxy.$route.query.processInstanceId) {
        proxy.$fn.setFlowPath(proxy)
        return
      }
    }
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
  api(buildForm()).then(({ code }) => {
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

function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.callback = (data) => {
    formInfo.data.cashAccountInId = data.cashAccountId
    formInfo.data.cashAccountInName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    formInfo.data.bankAccountOutId = data.bankAccountId
    formInfo.data.bankAccountOutName = data.bankAccountName
  }
  selectorInfo.visible = true
}
function selectItem() {
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    formInfo.data.itemId = data.id
    formInfo.data.itemName = data.name
  }
  selectorInfo.visible = true
}

function selectdeptUser() {
  selectorInfo.type = 'dept'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    formInfo.data.createUserDeptId = data?.id === '0' ? '' : data.id
    formInfo.data.createUserDeptName = data?.id === '0' ? '' : data.name
  }
  selectorInfo.visible = true
}

defineExpose({
  getFlowFormInfo,
  submitForm,
  saveAndSubmit,
  save: modify
})

</script>

<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :flowFormType="flowFormType" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-itemName>
        <el-input
            v-model="formInfo.data.itemName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择收支项目"
        >
          <template #append>
            <el-icon @click="selectItem"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-cashAccountInName>
        <el-input
            v-model="formInfo.data.cashAccountInName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择现金账户"
        >
          <template #append>
            <el-icon @click="selectCashAccount"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>

      <template #form-bankAccountOutName>
        <el-input
            v-model="formInfo.data.bankAccountOutName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择银行账户"
        >
          <template #append>
            <el-icon @click="selectBankAccount"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-createUserDeptName>
        <el-input
            v-model="formInfo.data.createUserDeptName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择职能部门"
        >
          <template #append>
            <el-icon @click="selectdeptUser"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyForm :form-info="fileFormInfo">
      <template v-slot:form-filePathList>
        <UploadImg
            v-model:value="fileFormInfo.data.filePathList"
            multiple
            :action="fileFormInfo.fileAction"
            list-type="text"
            title="附件"
            :file-type="fileFormInfo.fileType"
            :response-fn="(response, file) => file"
        />
      </template>
    </ModifyForm>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">
</style>
