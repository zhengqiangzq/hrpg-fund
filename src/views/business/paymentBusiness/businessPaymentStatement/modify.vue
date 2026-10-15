<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyTabs from "@/components/ModifyPage/ModifyTabs.vue";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import ModifyVxeTable from "@/components/ModifyPage/ModifyVxeTable.vue";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {
  addBusinessPaymentStatement,
  allDetailBusinessPaymentStatement,
  exportDetailBusinessPaymentStatement, modifyBusinessPaymentStatement,
  oneBusinessPaymentStatement,
  submitBusinessPaymentStatement,
  updateBusinessPaymentStatement
} from "@/api/business/businessPaymentStatement";
import {allPayrollRequisitionDetail} from "@/api/business/payrollRequisition";
import {deepClone} from "@/utils";

const { proxy } = getCurrentInstance();
const store = useStore()
const API = {
  one: oneBusinessPaymentStatement,
  add: addBusinessPaymentStatement,
  modify: modifyBusinessPaymentStatement,
  detail: allDetailBusinessPaymentStatement,
  payrollRequisitionDetail: allPayrollRequisitionDetail,
  batchAdd: null,
  submit: submitBusinessPaymentStatement,
  update: updateBusinessPaymentStatement,
  download: exportTemplateExcel,
  export: exportDetailBusinessPaymentStatement
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
  fromBuild: {
    type: Array,
    default: () => []
  },
  flowFormType: ''
})
const BUSINESS_TYPE = 'fundsPaymentOrder'

const {
  uploadInfo, beforeUpload, uploadError, uploadSuccess, downloadTemplate, exportData
} = useUpload(API, '业务付款结算单明细导入模板', `/business/paymentOrderDetail/import/excel/${props.id}`, (resp) => {
  tableInfo.data.push(...resp.data)
  sumTotalMoney()
}, 'businessPaymentStatement:import')

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

const originalData = ref('')
const formInfo = reactive({
  modifyFormRef: null,
  title: '付款信息',
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
    { label: '现金账户', value: 'cashAccountName', type: 'slot', show: false },
    { label: '银行账户', value: 'bankAccountName', type: 'slot', show: true },
    { label: '附件张数', value: 'attachCount', type: 'number' },
    { label: '是否网银', value: 'netPay', type: 'select-model', code: 'yes_or_no', disabled: true },
    { label: '网银开通状态', value: 'netBankOpenStatus', type: 'select', list: 'activateList', disabled: true },
    // { label: '收付款类型', value: 'type', type: 'select-model', code: 'funds_payment_type', disabled: true },
    { label: '付款金额', value: 'money', type: 'money', disabled: true },
    { label: '关联合同', value: 'isRelateContract', type: 'radio-model', code: 'fee_yes_or_no' },
    { label: '合同编号', value: 'contractNos', type: 'slot', show: computed(() => formInfo.data.isRelateContract === '1') },
    { label: '合同名称', value: 'contractNames', type: 'input', show: computed(() => formInfo.data.isRelateContract === '1'), disabled: true },
    { label: '单据状态', value: 'status', type: 'select-model', code: 'funds_order_status', disabled: true, show: !!props.id },
    { label: '结算状态', value: 'settlementStatus', type: 'select-model', code: 'funds_settle_status', disabled: true, show: !!props.id },
    { label: '付款事由', value: 'remark', type: 'textarea' },
    { label: '付款说明', value: 'payRemark', type: 'textarea' },
  ],
  rules: {
    contractNos: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
    orderTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    createUserDeptName: [{ required: true, message: '请选择职能部门', trigger: 'change' }],
    settlementMethodName: [{ required: true, message: '请选择结算方式', trigger: 'change' }],
    cashAccountName: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    bankAccountName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    payRemark: [{ required: true, message: '请输入付款说明', trigger: 'change' }],
    money: [{ required: true, message: '请输入收款金额', trigger: 'blur' }],
  },
  data: {
    type: 1,
    isRelateContract: '0',
    createUserDeptName: userInfo.deptName,
    createUserDeptId: userInfo.deptId,
    createUserName: userInfo.name,
    createUser: userInfo.id,
    netBankOpenStatus: '1',
    orderTime: moment().format('YYYY-MM-DD 00:00:00')
  }
})
const tableInfo = reactive({
  query: {},
  btnList: [
    { type: 'button', btType: 'primary', label: '增加行', event: () => openModify() },
    { type: 'button', label: '删除行', event: () => deleteData() },
    // { type: 'button', label: '添加请款单', event: () => addPayOrder() },
    { type: 'button', label: '下载模板', show: !!props.id, event: () => downloadTemplate(undefined, 'businessPaymentStatement:download') },
    { type: 'slot', value: 'uploadFile', show: !!props.id, label: '导入' },
    { type: 'button', label: '导出Excel', show: !!props.id, event: () => exportData({orderId: props.id}) },
    { type: 'select-model', showLabel: true, label: '交易对象类型', value: 'tradeType', code: 'funds_trade_type', event: () => {
        tableInfo.query.tradeObjectId = ''
        tableInfo.query.tradeObjectName = ''
      }
    },
    { type: 'slot', showLabel: true, label: '交易对象', value: 'tradeObjectName' },
    { type: 'button', label: '查询', btType: 'primary', event: filterData, },
    { type: 'button', label: '重置', event: resetData, },
  ],
  fieldList: [
    { label: '请款单号', value: 'payOrderNo' },
    { label: '摘要', value: 'remark', width: 150, type: 'input', rules: [{ required: true, message: '请填写摘要', trigger: 'change' }] },
    { label: '收支项目', value: 'itemName', width: 150, type: 'slot', rules: [{ required: true, message: '请选择收支项目', trigger: 'blur' }] },
    { label: '交易日期', value: 'tradeTime', width: 150, type: 'date', editControl: (row) => !!row.payOrderNo, valueFormat: 'YYYY-MM-DD 00:00:00', rules: [{ required: true, message: '请选择交易日期', trigger: 'change' }] },
    { label: '金额', value: 'money', type: 'money', width: 150, editControl: (row) => !!row.payOrderNo, rules: [{ required: true, message: '请填写金额', trigger: 'blur' }] },
    { label: '交易对象类型', value: 'tradeType', width: 130, clearable: true,
      editControl: (row) => !!row.payOrderNo,
      formatter: (val) => (store.state.permission.dict['funds_trade_type'].find(it => it.code == val.tradeType)?.name),
      type: 'select-model', code: 'funds_trade_type',
      event: (val, row) => handletradeType(val, row), },
    { label: '交易对象', value: 'tradeObjectName', width: 150, type: 'slot', rules: [{ required: true, message: '请填写交易对象', trigger: 'blur' }] },
    { label: '卡类型', value: 'staffCardType', type: 'select-model', editControl: (row) => row.tradeType != '3' || !!row.payOrderNo, code: 'funds_staff_bank_card_type' },
    { label: '交易对象银行类别', value: 'bankDocTypeName', type: 'input', width: 170 },
    { label: '交易对象开户行', value: 'bankDocName', type: 'input', width: 160 },
    { label: '交易对象联行号', value: 'interBankNum', type: 'input', width: 160 },
    { label: '交易对象户名', value: 'tradeBankAccountName', type: 'input' },
    { label: '交易对象银行账号', value: 'accNum', type: 'input', width: 170 },
    { label: '票据号', value: 'payBillNum', type: 'slot', width: 140 },
    { label: '汇票类型', value: 'billTypeName' },
    { label: '支付状态', value: 'payStatusValue' },
    { label: '业务来源', value: 'businessSourceValue' },
    { label: '业务类型', value: 'businessType' },
    { label: '是否归集', value: 'isCollectionValue' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '100',
    btList: [
      {
        label: '删除',
        show: true,
        event: deleteData,
        ifRender: (row) => row.isCollection != 1
      },
    ]
  },
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  filtered: [],
  sectionRows: []
})

const { fileFormInfo } = useAttachUpload()

const activeTab = ref('1')

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = tableInfo.btnList
  const deleteBtn = btns.find(it => it.label === '删除行')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.isCollection == 1)
}, { immediate: true })

onMounted(async () => {
  tableInfo.data = props.fromBuild
  sumTotalMoney()
  if (props.id) {
    await getMain()
  }
})

async function getMain() {
  const {code, data} = await API.one(props.id)
  if (code === 200) {
    formInfo.data = data
    await getDetail()
    await getAttach()
    settleMethodEffect(data.cash)
    let from = {
      ...JSON.parse(JSON.stringify(formInfo.data)),
      orderDetail: JSON.parse(JSON.stringify(tableInfo.data)),
      annexUploadVOS: JSON.parse(JSON.stringify(fileFormInfo.data.filePathList)),
    }
    originalData.value = JSON.stringify(deepClone(from))
  }
}

async function getDetail() {
  const {code, data} = await API.detail({ orderId: props.id })
  if (code === 200) {
    tableInfo.data = data
  }
}

async function getAttach() {
  const { data, code } = await annexUploadAll({ relativeId: props.id })
  if (code === 200) {
    fileFormInfo.data.filePathList = data
  }
}

function handletradeType(val, row) {
  if(val.value === 'tradeType') {
    row.tradeObjectId = ''
    row.tradeObjectName = ''
    row.staffCardType = ''
    const tradeObject = tableInfo.fieldList.filter(it => it.value === 'tradeObjectName')[0]
    tradeObject.type = row.tradeType ? 'slot' : 'input'
  }

}
function splitByFilter(data, filters) {
  return data.reduce(
      (acc, row) => {
        const match = Object.entries(filters).every(([key, value]) =>
            !value || row[key] === value   // !value 覆盖 '' / null / undefined
        );
        acc[match ? 'passed' : 'removed'].push(row);
        return acc;
      },
      { passed: [], removed: [] }
  );
}

function filterData() {
  tableInfo.data = tableInfo.data.concat(tableInfo.filtered)
  const { passed, removed } = splitByFilter(tableInfo.data, tableInfo.query);
  tableInfo.filtered = removed;
  tableInfo.data = passed;
}
function resetData() {
  tableInfo.query = {}
  tableInfo.data = tableInfo.data.concat(tableInfo.filtered)
  tableInfo.filtered = []
}

function buildForm() {
  let data = JSON.parse(JSON.stringify(formInfo.data))
  if (data.isRelateContract !== '1') {
    delete data.contractNos
    delete data.contractName
    delete data.contractNames
    delete data.contractIds
    delete data.contractType
    fileFormInfo.data.filePathList = fileFormInfo.data.filePathList.filter(it => !it.contactId)
  }
  data.orderDetail = tableInfo.data
  data.annexUploadVOS = JSON.parse(JSON.stringify(fileFormInfo.data.filePathList))
  return data
}

async function validator() {
  if (!tableInfo.data.length) {
    proxy.$message.warning('请至少添加一行付款信息')
    return false
  }
  if (tableInfo.data.find(it => !it.itemName?.length)) {
    proxy.$message.warning('请检查明细信息收支项目')
    return false
  }
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

  tableInfo.data = tableInfo.data.concat(tableInfo.filtered);
  if (!tableInfo.data.length) {
    proxy.$message.warning('请至少添加一行付款信息')
    return
  }
  if (tableInfo.data.find(it => !it.itemName?.length)) {
    proxy.$message.warning('请检查明细信息收支项目')
    return
  }
  if (tableInfo.data.find(it => !it.tradeObjectName?.length)) {
    proxy.$message.warning('请检查明细信息交易对象')
    return
  }
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

function addPayOrder() {
  selectorInfo.type = 'payrollRequisition'
  selectorInfo.checkBox = true
  selectorInfo.query = {
    businessSourceIn: '2',
  }
  selectorInfo.callback = (rows) => {
    const promises = rows.map(it => {
      return API.payrollRequisitionDetail({
        orderId: it.id,
        useStatus: 0,
        idNotIn: tableInfo.data.map(it => it.payOutOrderDetailId).toString()
      })
    })
    Promise.all(promises).then(res => {
      const details = res.map(it => it.data).reduce((prev, cur) => prev.concat(cur), []).map(it => {
        return {
          payOutOrderDetailId: it.id,
          payOrderNo: it.orderNo,
          money: it.money,
          settlementMethod: formInfo.data.settlementMethod,
          settlementMethodName: formInfo.data.settlementMethodName,
          tradeObjectId: it.tradeObjectId,
          tradeObjectName: it.tradeObjectName,
          tradeType: it.tradeType,
          tradeTypeValue: it.tradeTypeValue,
        }
      })
      tableInfo.data.push(...details)
    })
  }
  selectorInfo.visible = true
}

function openModify() {
  let row = {
    index: tableInfo.data.length + 1,
    tradeType: '3',
    settlementMethod: formInfo.data.settlementMethod,
    settlementMethodName: formInfo.data.settlementMethodName,
    businessType: "手工录入",
    businessTypeValue: '手工录入',
    businessSource: '1',
    businessSourceValue: '手工录入'
  }
  tableInfo.data.push(row)
}

function sumTotalMoney() {
  formInfo.data.money = tableInfo.data.reduce((prev, cur) => prev + Number(cur.money), 0)
}

async function handleRowData(newRow, row) {
  const extraData = {}
    const _data = newRow
    // 人员工资、奖金、公务卡类型字段前缀
    const staffCardTypePrefix = ['', 'gz', 'jj', 'gw'][row.staffCardType || 0]
    // 字段映射
    let keys = [
      {},
      {
        bankDocTypeName: 'bankTypeName', bankDocName: 'bankDocName', interBankNum: 'combineNum',
        tradeBankAccountName: 'accountName', accNum: 'accountNo'
      },
      {
        bankDocTypeName: 'bankTypeName', bankDocName: 'bankDocName', interBankNum: 'combineNum',
        tradeBankAccountName: 'accountName', accNum: 'accountNo'
      },
      {
        bankDocTypeName: `${staffCardTypePrefix}BankTypeName`, bankDocName: `${staffCardTypePrefix}BankDocName`,
        interBankNum: `${staffCardTypePrefix}BankCardLineNumber`, tradeBankAccountName: `${staffCardTypePrefix}BankCardUsername`,
        accNum: `${staffCardTypePrefix}BankCardCode`
      },
      {
        bankDocTypeName: 'bankTypeName', bankDocName: 'bankDocName',
        interBankNum: 'combineNum', tradeBankAccountName: 'bankCardUsername',
        accNum: 'bankCardNumber'
      },
    ][row.tradeType]
    extraData.bankDocTypeName = _data[keys['bankDocTypeName']]
    extraData.bankDocName = _data[keys['bankDocName']]
    extraData.interBankNum = _data[keys['interBankNum']]
    extraData.tradeBankAccountName = _data[keys['tradeBankAccountName']]
    extraData.accNum = _data[keys['accNum']]
  return {
    // ...newRow,
    ...extraData,
    tradeTypeValue: store.state.permission.dict['funds_trade_type'].find(it => it.code == row.tradeType)?.name
  }
}

function deleteData(row) {
  const sections = row ? [row] : tableInfo.sectionRows
  const ids = sections.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('相同单号的单据会同步删除,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    proxy.$message.success('删除成功')
    let dels = {}
    sections.forEach(it => {
      if(it.payOrderNo && !dels[it.payOrderNo]) {
        dels[it.payOrderNo] = true;
      }
    })
    if(Object.keys(dels).length > 0) {
      const noPayOrderNo = sections.filter(it => !it.payOrderNo)
      if(noPayOrderNo.length > 0) {
        tableInfo.data = tableInfo.data.filter(it => (sections.indexOf(it) == -1) && !dels[it.payOrderNo])
      } else {
        tableInfo.data = tableInfo.data.filter(it => !dels[it.payOrderNo])
      }
    } else {
      tableInfo.data = tableInfo.data.filter(it => sections.indexOf(it) == -1)
    }
    sumTotalMoney()
  })
}

function settleMethodEffect(cash) {
  formInfo.fieldList.find(it => 'cashAccountName'=== it.value).show = cash == 1
  formInfo.fieldList.find(it => 'bankAccountName' === it.value).show = cash == 0
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  } else if (eventName === 'changePrice') {
    sumTotalMoney()
  }
}

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  if(!formInfo.data.settlementMethod) return proxy.$message.warning('请选择结算方式')
  selectorInfo.callback = (data) => {
    formInfo.data.bankAccountId = data.bankAccountId
    formInfo.data.bankAccountName = data.bankAccountName
    formInfo.data.netBankOpenStatus = data.netBankOpenStatus
    formInfo.data.netBankOpenStatusName = data.netBankOpenStatusName
  }
  selectorInfo.visible = true
}
function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.callback = (data) => {
    formInfo.data.cashAccountId = data.cashAccountId
    formInfo.data.cashAccountName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectSettlementMethod() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    formInfo.data.settlementMethod = data.id
    formInfo.data.settlementMethodName = data.name
    formInfo.data.netPay = data.netPay
    settleMethodEffect(data.cash)
    formInfo.data.bankAccountId = undefined
    formInfo.data.bankAccountName = undefined
    formInfo.data.cashAccountId = undefined
    formInfo.data.cashAccountName = undefined
  }
  selectorInfo.visible = true
}
function selectItem(row) {
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    row.itemId = data.id
    row.itemName = data.name
  }
  selectorInfo.visible = true
}
function selectTradeObject(mark, row) {
  selectorInfo.type = ['', 'supplier', 'customer', 'staff', 'outsideStaff', ''][mark === 'tableQuery' ? tableInfo.query.tradeType : row.tradeType]
  selectorInfo.title = ['', '供应商', '客户', '院内人员', '院外人员', ''][mark === 'tableQuery' ? tableInfo.query.tradeType : row.tradeType]
  selectorInfo.query = {}
  if(!mark && row.tradeType == 3) {
    if(!row.staffCardType) {
      return proxy.$message.warning('院内人员需先选择卡类型')
    }
  }
  selectorInfo.callback = async (data) => {
    if (mark === 'tableQuery') {
      tableInfo.query.tradeObjectId = data.id
      tableInfo.query.tradeObjectName = data.name
    } else {
      row.tradeObjectId = data.id
      row.tradeObjectName = data.name
      const handle = await handleRowData(data, row)
      Object.assign(row, handle)
      sumTotalMoney()
    }
  }
  selectorInfo.visible = true
}
function selectPayBillNum(row) {
  selectorInfo.type = 'chequeNum'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    row.payBillId = data.id
    row.payBillNum = data.chequeNum
    row.billTypeName = data.chequeTypeName
    row.billTypeId = data.chequeTypeId
  }
  selectorInfo.visible = true
}

function selectdeptUser() {
  selectorInfo.type = 'dept'
  selectorInfo.query = {

  }
  selectorInfo.callback = (data) => {
    formInfo.data.createUserDeptId = data?.id === '0' ? '' : data.id
    formInfo.data.createUserDeptName = data?.id === '0' ? '' : data.name
  }
  selectorInfo.visible = true
}


function openContractSelector() {
  selectorInfo.type = 'contract'
  selectorInfo.checkBox = true
  selectorInfo.query = {
    businessType: '1',
  }
  selectorInfo.defaultSelected = formInfo.data.contractIds ? formInfo.data.contractIds.split(',') : []
  selectorInfo.callback = (data) => {
    formInfo.data.contractIds = data?.map(it => it.id).join(',');
    formInfo.data.contractNos = data?.map(it => it.code).join(',');
    formInfo.data.contractNames = data?.map(it => it.name).join(',');
    formInfo.data.contractType = data[0]?.businessType;
  //   处理附件
    handleFile(data)
  }
  selectorInfo.visible = true
}
function handleFile(data) {
  let files = fileFormInfo.data.filePathList.filter(it => !it.contactId)
  let mergeFiles = []
  data.forEach(it => {
    if(it.filePathList?.length > 0) {
      mergeFiles = mergeFiles.concat(handleMain(it.filePathList))
    }
  })
  fileFormInfo.data.filePathList = files.concat(mergeFiles)
}

function handleMain(data) {
  const htfile = data.filter(it => it.annexSubCategory === 'htwb')
  return htfile.map(it => {
      return {
        del: 0,
        id: it.id,
        name: it.name,
        filePath: it.filePath,
        contactId: it.relativeId,
      }
  })
}

function inputContractno() {
  formInfo.data.contractName = ''
  formInfo.data.contractNames = ''
  formInfo.data.contractIds = ''
  formInfo.data.contractType = ''
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
      <template #form-bankAccountName>
        <el-input
            v-model="formInfo.data.bankAccountName"
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
      <template #form-cashAccountName>
        <el-input
            v-model="formInfo.data.cashAccountName"
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
      <template v-slot:form-contractNos>
        <el-tooltip
            :disabled="formInfo.data.contractNos == -2 || !formInfo.data.contractNos"
            effect="dark"
            :content="formInfo.data.contractNos"
            placement="top-start"
        >
          <el-input v-model="formInfo.data.contractNos" @input="inputContractno">
            <template #append><el-icon @click="openContractSelector()"><Search /></el-icon></template>
          </el-input>
        </el-tooltip>
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
    <ModifyTabs title="明细信息" v-model="activeTab">
      <ModifyTab label="付款信息" name="1" required>
        <ModifyVxeTable no-title isDynamic :table-info="tableInfo" @handleEvent="tableHandler">
          <template #filter-tradeObjectName>
            <el-input
                v-model="tableInfo.query.tradeObjectName"
                style="width: 100%"
                :class="{ 'not-mongolia': !!tableInfo.query.tradeType }"
                type="input"
                :required="true"
                placeholder="请选择交易对象"
            >
              <template #append v-if="!!tableInfo.query.tradeType">
                <el-icon @click="selectTradeObject('tableQuery')"
                ><Search
                /></el-icon>
              </template>
            </el-input>
          </template>
          <template v-slot:filter-uploadFile>
            <el-upload
                :headers="uploadInfo.headers"
                :show-file-list="false"
                :data="uploadInfo.data"
                :on-error="uploadError"
                :on-success="uploadSuccess"
                :before-upload="beforeUpload"
                :action="uploadInfo.action"
            >
              <el-button>excel导入</el-button>
            </el-upload>
          </template>
          <template #col-tradeObjectName="{ row, item }">
            <el-input
                v-model="row.tradeObjectName"
                class="not-mongolia"
                type="input"
                :readonly="true"
                placeholder="请选择交易对象"
            >
              <template #append  v-if="!!row.tradeType">
                <el-icon @click="selectTradeObject('', row)"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #col-payBillNum="{ row }">
            <el-input
                v-model="row.payBillNum"
                class="not-mongolia"
                type="input"
                placeholder="请选择票据"
                :readonly="true"
            >
              <template #append>
                <el-icon @click="selectPayBillNum(row)"><Search /></el-icon>
              </template>
            </el-input>
          </template>
          <template #col-itemName="{ row, item }">
            <el-input
                v-model="row.itemName"
                class="not-mongolia"
                type="input"
                :readonly="true"
                placeholder="请选择收支项目"
            >
              <template #append>
                <el-icon @click="selectItem(row)"
                ><Search
                /></el-icon>
              </template>
            </el-input>
          </template>
        </ModifyVxeTable>
      </ModifyTab>
      <ModifyTab label="附件管理" name="2">
        <ModifyForm :form-info="fileFormInfo" no-title>
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
      </ModifyTab>
    </ModifyTabs>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">

</style>
