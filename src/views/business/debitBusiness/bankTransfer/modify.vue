<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {
  addBankTransfer,
  modifyBankTransfer,
  oneBankTransfer,
  submitBankTransfer,
  updateBankTransfer
} from "@/api/business/bankTransfer";
import moment from "moment";
import {deepClone} from "@/utils";

const { proxy } = getCurrentInstance();
const store = useStore()
const API = {
  one: oneBankTransfer,
  add: addBankTransfer,
  modify: modifyBankTransfer,
  submit: submitBankTransfer,
  batchAdd: null,
  update: updateBankTransfer
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

const BUSINESS_TYPE = 'fundsBankOrder'
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
    activateList: [{ key: '未开通', value: '1' }, { key: '已开通', value: '2' }]
  },
  fieldList: [
    { label: '机构名称', value: 'orgName', type: 'input', disabled: true, show: proxy.$fn.getIsOtherOrg() },
    { label: '单据号', value: 'orderNo', type: 'input', disabled: true, show: !!props.id },
    { label: '业务日期', value: 'orderTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '经办人', value: 'createUserName', type: 'input', disabled: true },
    { label: '职能部门', value: 'createUserDeptName', type: 'slot' },
    { label: '结算方式', value: 'settlementMethodName', type: 'slot' },
    { label: '是否网银', value: 'netPay', type: 'select-model', code: 'yes_or_no', disabled: true },
    { label: '转出银行账户', value: 'bankAccountOutName', type: 'slot'},
    { label: '网银开通状态', value: 'netBankOpenStatus', type: 'select', list: 'activateList', disabled: true },
    { label: '转入银行账户', value: 'bankAccountInName', type: 'slot' },
    { label: '附件张数', value: 'attachCount', type: 'number' },
    { label: '转账金额', value: 'money', type: 'money' },
    { label: '单据状态', value: 'status', type: 'select-model', code: 'funds_order_status', disabled: true },
    { label: '结算状态', value: 'settlementStatus', type: 'select-model', code: 'funds_settle_status', disabled: true },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    orderTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    settlementMethodName: [{ required: true, message: '请选择结算方式', trigger: 'change' }],
    createUserDeptName: [{ required: true, message: '请选择职能部门', trigger: 'change' }],
    bankAccountOutName: [{ required: true, message: '请选择转出银行账户', trigger: 'change' }],
    bankAccountInName: [{ required: true, message: '请选择转入银行账户', trigger: 'change' }],
    money: [{ required: true, message: '请输入转账金额', trigger: 'blur' }],
  },
  data: {
    status: '1',
    createUserDeptName: userInfo.deptName,
    createUserDeptId: userInfo.deptId,
    createUserName: userInfo.name,
    createUser: userInfo.id,
    settlementStatus: '1',
    netBankOpenStatus: '1',
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

function selectBankAccount(mark) {
  selectorInfo.type = 'bankAccount'
  selectorInfo.title = mark === 'out' ? '转出银行账户' : '转入银行账户'
  selectorInfo.callback = (data) => {
    if (mark === 'in') {
      if(formInfo.data.bankAccountOutId === data.bankAccountId) {
        return proxy.$message.warning('转入账户和转出账户不可相同')
      }
      formInfo.data.bankAccountInId = data.bankAccountId
      formInfo.data.bankAccountInName = data.bankAccountName
      formInfo.data.bankAccountInNum = data.accNum
    } else {
      if(formInfo.data.bankAccountInId === data.bankAccountId) {
        return proxy.$message.warning('转入账户和转出账户不可相同')
      }
      formInfo.data.bankAccountOutId = data.bankAccountId
      formInfo.data.bankAccountOutName = data.bankAccountName
      formInfo.data.netBankOpenStatus = data.netBankOpenStatus
      formInfo.data.netBankOpenStatusName = data.netBankOpenStatusName
      formInfo.data.bankAccountOutNum = data.accNum
    }
  }
  selectorInfo.visible = true
}
function selectSettlementMethod() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {
    cash: 0
  }
  selectorInfo.callback = (data) => {
    formInfo.data.settlementMethod = data.id
    formInfo.data.settlementMethodName = data.name
    formInfo.data.netPay = data.netPay
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
      <template #form-bankAccountOutName>
        <el-input
            v-model="formInfo.data.bankAccountOutName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择转出银行账户"
        >
          <template #append>
            <el-icon @click="selectBankAccount('out')"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>

      <template #form-bankAccountInName>
        <el-input
            v-model="formInfo.data.bankAccountInName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择转入银行账户"
        >
          <template #append>
            <el-icon @click="selectBankAccount('in')"
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
      <template #form-settlementMethodName>
        <el-input
            v-model="formInfo.data.settlementMethodName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择结算方式"
        >
          <template #append>
            <el-icon @click="selectSettlementMethod"
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
