<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyTabs from "@/components/ModifyPage/ModifyTabs.vue";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import cloneDeep from "lodash/cloneDeep";
import {exportTemplateExcel} from "@/api/pub";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {
  addRegistrationSocialSecurityFund,
  allDetailRegistrationSocialSecurityFund,
  exportDetailRegistrationSocialSecurityFund,
  oneRegistrationSocialSecurityFund,
  updateRegistrationSocialSecurityFund
} from "@/api/business/registrationSocialSecurityFund";

const { proxy } = getCurrentInstance();
const store = useStore()
const API = {
  one: oneRegistrationSocialSecurityFund,
  add: addRegistrationSocialSecurityFund,
  detail: allDetailRegistrationSocialSecurityFund,
  batchAdd: null,
  update: updateRegistrationSocialSecurityFund,
  download: exportTemplateExcel,
  export: exportDetailRegistrationSocialSecurityFund
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

const {
  uploadInfo, beforeUpload, uploadError, uploadSuccess, downloadTemplate, exportData
} = useUpload(API, '社保公积金登记单明细导入模板', `/business/socialOrderDetail/import/excel/${props.id}`, (resp) => {
  tableInfo.data.push(...resp.data)
  sumTotalMoney()
}, 'registrationSocialSecurityFund:import')

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
  title: '社保公积金登记',
  labelWidth: '120px',
  listType: {
  },
  fieldList: [
    { label: '单据号', value: 'orderNo', type: 'input', disabled: true, show: !!props.id },
    { label: '业务日期', value: 'orderTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '结算方式', value: 'settlementMethodName', type: 'slot' },
    { label: '单位现金账户', value: 'cashAccountName', type: 'slot', show: false },
    { label: '单位银行账户', value: 'bankAccountName', type: 'slot', show: false },
    { label: '收付款类型', value: 'type', type: 'select-model', code: 'funds_payment_type', disabled: true },
    { label: '收支项目', value: 'itemName', type: 'slot' },
    { label: '登记金额', value: 'money', type: 'money', disabled: true },
    { label: '结算状态', value: 'settlementStatus', type: 'select-model', code: 'funds_settle_status', disabled: true, show: !!props.id },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    orderTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    settlementMethodName: [{ required: true, message: '请选择结算方式', trigger: 'change' }],
    cashAccountName: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    bankAccountName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    type: [{ required: true, message: '请选择收付款类型', trigger: 'change' }],
    money: [{ required: true, message: '请输入登记金额', trigger: 'blur' }],
  },
  data: {
    type: 1,
    orderTime: moment().format('YYYY-MM-DD 00:00:00')
  }
})
const tableInfo = reactive({
  query: {
    tradeType: 3
  },
  btnList: [
    { type: 'button', label: '添加明细', event: () => openModify() },
    { type: 'button', label: '删除', event: () => deleteData() },
    { type: 'button', label: '下载模板', show: !!props.id, event: () => downloadTemplate(undefined, 'registrationSocialSecurityFund:download') },
    { type: 'slot', value: 'uploadFile', show: !!props.id, label: '导入' },
    { type: 'button', label: '导出Excel', show: !!props.id, event: () => exportData({orderId: props.id}) },
    { type: 'select-model', showLabel: true, label: '交易对象类型', value: 'tradeType', code: 'funds_trade_type', onlyShowOptions: ['3'], disabled: true},
    { type: 'slot', showLabel: true, label: '交易对象', value: 'tradeObjectName' },
    { type: 'button', label: '查询', btType: 'primary', event: filterData, },
    { type: 'button', label: '重置', event: resetData, },
  ],
  fieldList: [
    { label: '摘要', value: 'remark' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '收支项目', value: 'itemName' },
    { label: '交易日期', value: 'tradeTime', align: 'center', formatter: (row) => moment(row.tradeTime).format('YYYY-MM-DD') },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '身份证号', value: 'idCard' },
    { label: '任职科室', value: 'deptName' },
    { label: '登记金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '是否归集', value: 'isCollectionValue' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: true,
        event: openModify,
        ifRender: (row) => row.isCollection != 1
      },
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
  sectionRows: []
})
const dialogInfo = reactive({
  refObj: null,
  index: null,
  row: {
    tradeType: 3
  },
  title: '付款信息',
  visible: false,
  labelWidth: '120px',
  fieldList: [
    { label: '交易日期', span: 12, value: 'tradeTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '交易对象类型', span: 12, value: 'tradeType', type: 'select-model', code: 'funds_trade_type', onlyShowOption: ['3'], disabled: true, event: (val) => {
        dialogInfo.row.tradeObjectId = ''
        dialogInfo.row.tradeObjectName = ''
      }
    },
    { label: '交易对象', span: 12, value: 'tradeObjectName', type: 'slot' },
    { label: '身份证号', span: 12, value: 'idCard', type: 'input', disabled: true },
    { label: '登记金额', span: 12, value: 'money', type: 'money' },
    { label: '摘要', span: 12, value: 'remark', type: 'textarea' },
  ],
  rules: {
    tradeTime: [{ required: true, message: '请选择交易日期', trigger: 'change' }],
    remark: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
    // tradeObjectName: [{ required: true, message: '请选择交易对象', trigger: 'change' }],
    money: [{ required: true, message: '请输入登记金额', trigger: 'blur' }, { type: 'number', min: 0, message: '登记金额不能小于零' }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => dialogInfo.visible = false},
    { label: '确定', type: 'primary', event: saveData }
  ]
})

const { fileFormInfo } = useAttachUpload()

const activeTab = ref('1')

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = tableInfo.btnList
  const deleteBtn = btns.find(it => it.label === '删除')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.isCollection == 1)
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    getMain()
    getDetail()
    getAttach()
  }
})

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
    settleMethodEffect(res.data.cash)
  })
}

function getDetail() {
  API.detail({ orderId: props.id }).then(res => {
    if (res.success) {
      tableInfo.data = res.data
    }
  })
}

function getAttach() {
  annexUploadAll({ relativeId: props.id }).then(res => {
    fileFormInfo.data.filePathList = res.data
  })
}

function filterData() {
  const filterFun = row => {
    return Object.keys(tableInfo.query).reduce((prev, cur) => {
      if (!tableInfo.query[cur]?.length) {
        return true
      }
      return prev && row[cur] == tableInfo.query[cur]
    }, true)
  }
  tableInfo.filtered = tableInfo.data.filter(row => !filterFun(row))
  tableInfo.data = tableInfo.data.filter(filterFun)
}
function resetData() {
  tableInfo.query = {
    tradeType: 3
  }
  tableInfo.data = tableInfo.data.concat(tableInfo.filtered)
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
  if (!tableInfo.data.length) {
    proxy.$message.warning('请至少添加一行付款信息')
    return
  }
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.data,
    orderDetail: tableInfo.data,
    annexUploadVOS: fileFormInfo.data.filePathList
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

function openModify(row) {
  dialogInfo.isAdd = !row
  dialogInfo.row = cloneDeep(row) || {
    tradeType: 3,
    settlementMethod: formInfo.data.settlementMethod,
    settlementMethodName: formInfo.data.settlementMethodName,
    itemId: formInfo.data.itemId,
    itemName: formInfo.data.itemName,
  }
  dialogInfo.index = tableInfo.data.indexOf(row)
  dialogInfo.visible = true
}

function sumTotalMoney() {
  formInfo.data.money = tableInfo.data.reduce((prev, cur) => prev + Number(cur.money), 0)
}

async function saveData() {
  let isValid = true
  await dialogInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const isAdd = dialogInfo.isAdd
  const _row = {
    ...dialogInfo.row,
    tradeTypeValue: store.state.permission.dict['funds_trade_type'].find(it => it.code == dialogInfo.row.tradeType)?.name
  }
  if (isAdd) {
    tableInfo.data.push(_row)
  } else {
    tableInfo.data[dialogInfo.index] = _row
  }
  sumTotalMoney()
  dialogInfo.visible = false
}

function deleteData(row) {
  const sections = row ? [row] : tableInfo.sectionRows
  const ids = sections.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    proxy.$message.success('删除成功')
    tableInfo.data = tableInfo.data.filter(it => sections.indexOf(it) == -1)
    sumTotalMoney()
  })
}

function settleMethodEffect(cash) {
  formInfo.fieldList.find(it => 'cashAccountName'=== it.value).show = cash == 1
  formInfo.fieldList.find(it => 'bankAccountName' === it.value).show = cash == 0
  tableInfo.data.forEach(it => {
    it.settlementMethod = formInfo.data.settlementMethod
    it.settlementMethodName = formInfo.data.settlementMethodName
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    formInfo.data.bankAccountId = data.bankAccountId
    formInfo.data.bankAccountName = data.bankAccountName
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
    settleMethodEffect(data.cash)
    formInfo.data.bankAccountId = undefined
    formInfo.data.bankAccountName = undefined
    formInfo.data.cashAccountId = undefined
    formInfo.data.cashAccountName = undefined
  }
  selectorInfo.visible = true
}
function selectItem() {
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    formInfo.data.itemId = data.id
    formInfo.data.itemName = data.name
    tableInfo.data.forEach(it => {
      it.itemId = formInfo.data.itemId
      it.itemName = formInfo.data.itemName
    })
  }
  selectorInfo.visible = true
}
function selectTradeObject(mark) {
  selectorInfo.type = ['', 'supplier', 'customer', 'staff', 'outsideStaff', ''][mark === 'tableQuery' ? tableInfo.query.tradeType : dialogInfo.row.tradeType]
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    if (mark === 'tableQuery') {
      tableInfo.query.tradeObjectId = data.id
      tableInfo.query.tradeObjectName = data.name
    } else {
      dialogInfo.row.tradeObjectId = data.id
      dialogInfo.row.tradeObjectName = data.name
      dialogInfo.row.idCard = data.perIdCard
      dialogInfo.row.deptName = data.departmentName
    }
  }
  selectorInfo.visible = true
}
</script>

<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
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
    <ModifyTabs title="明细信息" v-model="activeTab">
      <ModifyTab label="付款信息" name="1" required>
        <ModifyTable no-title isDynamic :table-info="tableInfo" @handleEvent="tableHandler">
          <template #filter-tradeObjectName>
            <el-input
                v-model="tableInfo.query.tradeObjectName"
                style="width: 100%"
                :class="{ 'not-mongolia': !!tableInfo.query.tradeType }"
                type="input"
                :required="true"
                :disabled="true"
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
        </ModifyTable>
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
    <ModifyFormDialog v-model:dialog-info="dialogInfo">
      <template #form-tradeObjectName>
        <el-input
            v-model="dialogInfo.row.tradeObjectName"
            style="width: 100%"
            :class="{ 'not-mongolia': !!dialogInfo.row.tradeType }"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择交易对象"
        >
          <template #append v-if="!!dialogInfo.row.tradeType">
            <el-icon @click="selectTradeObject"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyFormDialog>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">
</style>
