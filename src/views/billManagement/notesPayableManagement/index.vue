<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectData} from "@/hooks/useSelectData";
import {
  addNotesPayableManagement,
  cancelNotesPayableManagement,
  confirmNotesPayableManagement,
  deleteNotesPayableManagement,
  exportNotesPayableManagement,
  pageNotesPayableManagement,
  updateNotesPayableManagement
} from "@/api/billManagement/notesPayableManagement";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {requiredPageFilter} from "@/utils";

const props = defineProps({
  orderId: null
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'notesPayableManagement'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageNotesPayableManagement,
  delete: deleteNotesPayableManagement,
  add: addNotesPayableManagement,
  update: updateNotesPayableManagement,
  confirm: confirmNotesPayableManagement,
  cancel: cancelNotesPayableManagement,
  export: exportNotesPayableManagement,
  download: exportTemplateExcel,
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'payableChequeTemplate', '/cheque/payableCheque/importExcel/after', () => getList(), 'notesPayableManagement:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14007',
  params: {
    businessParams: 'after'
  },
  action: '/cheque/payableCheque/import/excelRecord'
})

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    issueTimeStart: defaultDate1,
    issueTimeEnd: defaultDate2,
    idIn: props.orderId
  },
  copyQuery: {},
  list: [
    { label: '签发开始日期', value: 'issueTimeStart', required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '签发结束日期', value: 'issueTimeEnd', required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '交易对象类型', value: 'tradeObjType', type: 'select-model', code: 'funds_trade_type', onlyShowOption: ['1', '2', '3', '4'], event: () => {
        filterInfo.query.tradeObjectId = ''
        filterInfo.query.tradeObjectName = ''
      }
    },
    { label: '交易对象', value: 'tradeObjName', showLabel: true, type: 'slot' },
    { label: '承兑银行', value: 'promiseBankName', showLabel: true, type: 'slot' },
    { label: '到期开始日期', value: 'endTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '到期结束日期', value: 'endTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '票据号', value: 'chequeNum', type: 'input' },
    { label: '领用科室', value: 'useDeptName', showLabel: true, type: 'slot', event: getList },
    { label: '领用人', value: 'useStaffName', showLabel: true, type: 'slot', event: getList },
    // { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot', event: getList },
    { label: '结算单号', value: 'settlementMethodDocNum', type: 'input' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => confirmData(), },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => cancelData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('应付票据导入模板', 'notesPayableManagement:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '票据类型', value: 'chequeTypeName' },
    { label: '票据号', value: 'chequeNum', type: 'slot' },
    { label: '摘要', value: 'summary' },
    { label: '交易对象类型', value: 'tradeObjTypeValue' },
    { label: '交易对象', value: 'tradeObjName' },
    { label: '承兑银行', value: 'promiseBankName' },
    { label: '签发日期', value: 'issueTime', align: 'center', formatter: (val) => moment(val.issueTime).format('YYYY-MM-DD') },
    { label: '票面金额', value: 'chequeMoney', align: 'right' },
    { label: '票面利率(%)', value: 'chequeRate' },
    { label: '到期日期', value: 'endTime', align: 'center', formatter: (val) => moment(val.endTime).format('YYYY-MM-DD') },
    { label: '领用科室', value: 'useDeptName' },
    { label: '领用人员', value: 'useStaffName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '结算单据号', value: 'settlementMethodDocNums' },
    { label: '结算金额', value: 'settlementMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right' },
    { label: '登记人', value: 'createUserName' },
    { label: '登记日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
    { label: '确认状态', value: 'statusValue' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'chequeMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'settlementMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'balance', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.status == 0
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status == 0
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '票据信息',
  visible: false,
  fieldList: [
    { label: '票据类型', span: 12, value: 'chequeTypeName', type: 'slot' },
    { label: '票据编号', span: 12, value: 'chequeNum', type: 'input' },
    { label: '承兑银行', span: 12, value: 'promiseBankName', type: 'slot' },
    { label: '交易对象类型', span: 12, value: 'tradeObjType', type: 'select-model', code: 'funds_trade_type', onlyShowOption: ['1', '2', '3', '4'], event: () => {
        modifyInfo.row.tradeObjId = ''
        modifyInfo.row.tradeObjName = ''
      }
    },
    { label: '交易对象', span: 12, value: 'tradeObjName', type: 'slot' },
    { label: '签发日期', span: 12, value: 'issueTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '票据金额', span: 12, value: 'chequeMoney', type: 'money', min: 0.01 },
    { label: '票据利率', span: 12, value: 'chequeRate', type: 'number', precision: 2 },
    { label: '到期日期', span: 12, value: 'endTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '结算方式', span: 12, value: 'settlementMethodName', type: 'slot' },
    { label: '领用科室', span: 12, value: 'useDeptName', type: 'input', disabled: true },
    { label: '领用人员', span: 12, value: 'useStaffName', type: 'slot' },
    { label: '摘要', value: 'summary', type: 'textarea' },
  ],
  rules: {
    chequeTypeName: [{ required: true, message: '请选择票据类型', trigger: 'change' }],
    promiseBankName: [{ required: true, message: '请选择承兑银行', trigger: 'change' }],
    issueTime: [{ required: true, message: '请选择签发日期', trigger: 'change' }],
    tradeObjType: [{ required: true, message: '请选择交易对象类型', trigger: 'change' }],
    tradeObjName: [{ required: true, message: '请选择交易对象', trigger: 'change' }],
    chequeMoney: [{ required: true, message: '请输入票据金额', trigger: 'blur' }, { type: 'number', min: 0, message: '票据金额不能小于零' }],
    chequeNum: [{ required: true, message: '请输入票据编号', trigger: 'blur' }],
    endTime: [{
      validator: (rule, value, callback) => {
        if (value && new Date(value) < new Date(modifyInfo.row.issueTime)) {
          callback(new Error('到期日期需要晚于签发日期'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => modifyInfo.visible = false},
    { label: '确定', disabled: true, type: 'primary', event: saveData }
  ]
})
const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除'),
        confirmBtn = btns.find(btn => btn.label === '确认'),
        cancel = btns.find(btn => btn.label === '取消确认')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status != 0)
  confirmBtn.disabled = !rows.length || !!rows.find(it => it.status != 0)
  cancel.disabled = !rows.length || !!rows.find(it => it.status == 0)
}, { immediate: true })

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  const time1 = filterInfo.query.issueTimeStart;
  const time2 = filterInfo.query.issueTimeEnd;
  const time3 = filterInfo.query.endTimeStart;
  const time4 = filterInfo.query.endTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    issueTimeStart: time1 ? time1 + ' 00:00:00' : '',
    issueTimeEnd: time2 ? time2 + ' 23:59:59' : '',
    endTimeStart: time3 ? time3 + ' 00:00:00' : '',
    endTimeEnd: time4 ? time4 + ' 23:59:59' : '',
    bankAccountName: undefined,
    cashAccountName: undefined,
    settlementMethodName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    issueTimeStart: defaultDate1,
    issueTimeEnd: defaultDate2,}
  getList()
}
function detail(row) {
  modifyInfo.row = cloneDeep(row)
  modifyInfo.title = '票据信息详情'
  modifyInfo.visible = true
  modifyInfo.btList[1].disabled = true
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.row = cloneDeep(row) || {
    isBegin: 0
  }
  modifyInfo.title = row ? '修改票据信息' : '新增票据信息'
  modifyInfo.visible = true
  modifyInfo.btList[1].disabled = false
}

async function saveData() {
  let isValid = true
  await modifyInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const _row = {
    ...modifyInfo.row,
  }
  const api = _row.id ? API.update : API.add
  api(_row).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      modifyInfo.visible = false
      getList()
    }
  })
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.delete(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function confirmData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.confirm(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('保存成功')
        getList()
      }
    })
  })
}
function cancelData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.cancel(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('保存成功')
        getList()
      }
    })
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectChequeType() {
  selectorInfo.type = 'billType'
  selectorInfo.query = {
    status: null,
    enableStatus: '1'
  }
  selectorInfo.callback = (data) => {
    modifyInfo.row.chequeTypeId = data.id
    modifyInfo.row.chequeTypeName = data.name
  }
  selectorInfo.visible = true
}
function selectPromiseBank(mark) {
  selectorInfo.type = 'bankDoc'
  selectorInfo.title = '承兑银行'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    if (mark === 'query') {
      filterInfo.query.promiseBankId = data.id
      filterInfo.query.promiseBankName = data.name
    } else {
      modifyInfo.row.promiseBankId = data.id
      modifyInfo.row.promiseBankName = data.name
    }
  }
  selectorInfo.visible = true
}
function selectTradeObject(mark) {
  selectorInfo.type = ['', 'supplier', 'customer', 'staff', 'outsideStaff', ''][mark === 'query' ? filterInfo.query.tradeObjType : modifyInfo.row.tradeObjType]
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    if (mark === 'query') {
      filterInfo.query.tradeObjId = data.id
      filterInfo.query.tradeObjName = data.name
    } else {
      modifyInfo.row.tradeObjId = data.id
      modifyInfo.row.tradeObjName = data.name
    }
  }
  selectorInfo.visible = true
}

function selectDept() {
  selectorInfo.type = 'dept'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.useDeptId = data.id
    filterInfo.query.useDeptName = data.name
  }
  selectorInfo.visible = true
}
function selectStaff(mark) {
  selectorInfo.type = 'staff'
  selectorInfo.query = {
    departmentId: filterInfo.query.useDeptId
  }
  selectorInfo.callback = (data) => {
    if (mark === 'query') {
      filterInfo.query.useStaffId = data.id
      filterInfo.query.useStaffName = data.name
    } else {
      modifyInfo.row.useStaffId = data.id
      modifyInfo.row.useStaffName = data.name
      modifyInfo.row.useDeptId = data.departmentId
      modifyInfo.row.useDeptName = data.departmentName
    }
  }
  selectorInfo.visible = true
}
function selectSettlementMethod(mark) {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    if (mark === 'modify') {
      modifyInfo.row.settlementMethodId = data.id
      modifyInfo.row.settlementMethodName = data.name
    } else {
      filterInfo.query.settlementMethodId = data.id
      filterInfo.query.settlementMethodName = data.name
    }
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #form-promiseBankName>
              <el-input
                  v-model="modifyInfo.row.promiseBankName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择承兑银行"
              >
                <template #append>
                  <el-icon @click="selectPromiseBank"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-tradeObjName>
              <el-input
                  v-model="filterInfo.query.tradeObjName"
                  style="width: 100%"
                  :class="{ 'not-mongolia': !!filterInfo.query.tradeObjType }"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择交易对象"
              >
                <template #append v-if="!!filterInfo.query.tradeObjType">
                  <el-icon @click="selectTradeObject('query')"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-settlementMethodName>
              <el-input
                  v-model="filterInfo.query.settlementMethodName"
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
            <template #filter-promiseBankName>
              <el-input
                  v-model="filterInfo.query.promiseBankName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择承兑银行"
              >
                <template #append>
                  <el-icon @click="selectPromiseBank('query')"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-useDeptName>
              <el-input
                  v-model="filterInfo.query.useDeptName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择领用科室"
              >
                <template #append>
                  <el-icon @click="selectDept"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-useStaffName>
              <el-input
                  v-model="filterInfo.query.useStaffName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择领用人员"
              >
                <template #append>
                  <el-icon @click="selectStaff('query')"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
          </NewPageFilter>
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
          </NewPageFilter>
        </div>
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-chequeNum="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.chequeNum }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <ModifyFormDialog v-model:dialog-info="modifyInfo">
      <template #form-chequeTypeName>
        <el-input
            v-model="modifyInfo.row.chequeTypeName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择票据类型"
        >
          <template #append>
            <el-icon @click="selectChequeType"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-promiseBankName>
        <el-input
            v-model="modifyInfo.row.promiseBankName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择承兑银行"
        >
          <template #append>
            <el-icon @click="selectPromiseBank"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-tradeObjName>
        <el-input
            v-model="modifyInfo.row.tradeObjName"
            style="width: 100%"
            :class="{ 'not-mongolia': !!modifyInfo.row.tradeObjType }"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择交易对象"
        >
          <template #append v-if="!!modifyInfo.row.tradeObjType">
            <el-icon @click="selectTradeObject"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-useStaffName>
        <el-input
            v-model="modifyInfo.row.useStaffName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择领用人员"
        >
          <template #append>
            <el-icon @click="selectStaff"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-settlementMethodName>
        <el-input
            v-model="modifyInfo.row.settlementMethodName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择结算方式"
        >
          <template #append>
            <el-icon @click="selectSettlementMethod('modify')"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyFormDialog>

    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
