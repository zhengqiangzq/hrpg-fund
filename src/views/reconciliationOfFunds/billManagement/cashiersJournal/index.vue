<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch, computed} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {
  cancelCashiersJournal, collectCashiersJournal, confirmCashiersJournal,
  deleteCashiersJournal, exportCashiersJournal,
  pageCashiersJournal,
  updateCashiersJournal
} from "@/api/reconciliationOfFunds/cashiersJournal";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import Modify from "./modify.vue";
import {requiredPageFilter} from "@/utils";
import {useDownloadLog} from "@/components/DownloadLog/useDownloadLog";
import Details from "./details.vue";

const props = defineProps({
  orderId: null,
  orderNo: null,
  accountId: null,
  startDate: null,
  endDate: null,
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'cashiersJournal'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageCashiersJournal,
  delete: deleteCashiersJournal,
  update: updateCashiersJournal,
  confirm: confirmCashiersJournal,
  cancel: cancelCashiersJournal,
  collect: collectCashiersJournal,
  export: exportCashiersJournal,
  download: exportTemplateExcel,
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'CashBillRecordTemplate', '/record/cashBillRecord/importExcel', () => getList(), 'cashiersJournal:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14010',
  action: '/record/cashBillRecord/import/excelRecord'
})

const filterInfo = reactive({
  query: {
    businessTimeStart: defaultDate1,
    businessTimeEnd: defaultDate2,
    fundsCompareAccountId: props.accountId,
    fundsCompareAccountName: props.orderNo,
    idIn: props.orderId
  },
  copyQuery: {},
  listTypeInfo: {
    dataType: [{ key: '人工', value: '2' }, { key: '采集', value: '1' }],
  },
  list: [
    { label: '账户信息', value: 'fundsCompareAccountName', showLabel: true, required: true, type: 'slot' },
    { label: '交易开始日期', value: 'businessTimeStart', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '交易结束日期', value: 'businessTimeEnd', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '确认状态', value: 'status', type: 'select-model', code: 'cost_document_status' },
    { label: '创建人', value: 'createUserName', showLabel: true, type: 'slot' },
    { label: '往来单位', value: 'businessPartners', type: 'input' },
    { label: '摘要', value: 'summary', type: 'input' },
    { label: '数据来源', value: 'dataSource', type: 'select', clearable: true, list: 'dataType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), disabled: computed(() => tableInfo.data.length === 0), event: () => openModify(''), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '归集', show: proxy.$permission(`${PERMISSION_CODE}:collect`), event: () => collectData(), },
    { type: 'button', label: '归集日志', show: proxy.$permission(`${PERMISSION_CODE}:collectlog`), event: () => openDownloadLog(), },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => confirmData(), },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => cancelData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('资金日记账导入模板', 'cashiersJournal:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
        if(Object.keys(filterInfo.copyQuery).length === 0) return proxy.$message.warning('请先查询数据');
        exportData(filterInfo.copyQuery)
      }, },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '账户信息', value: 'fundsCompareAccountName', type: 'slot' },
    { label: '交易日期', value: 'businessTime', align: 'center', formatter: (val) => moment(val.businessTime).format('YYYY-MM-DD') },
    { label: '摘要', value: 'summary' },
    { label: '往来单位', value: 'businessPartners' },
    { label: '内部对方账户', value: 'innerAccountName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right' },
    { label: '确认人', value: 'sureUserName' },
    { label: '确认状态', value: 'statusValue' },
    { label: '确认日期', value: 'sureTime', align: 'center', formatter: (val) => moment(val.sureTime).format('YYYY-MM-DD') },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
    { label: '数据来源', value: 'dataSourceValue' },
    { label: '是否出纳单位对账', value: 'compareAccountingValue', width: 160 },
    { label: '出纳单位对账批次码', value: 'compareAccountingBatchCode', width: 170 },
    { label: '是否出纳银行对账', value: 'compareBankValue', width: 160 },
    { label: '出纳银行对账批次码', value: 'compareBankBatchCode', width: 170 },
  ],
  data: [],
  rowClassName: ({ row }) => {
    return row.classColor == '1' ? 'warning-style' : ''
  },
  summaryFieldList: [
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '150',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => !!row.id && row.status == 0
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => !!row.id && row.status == 0
      },
      {
        label: '确认',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: confirmData,
        ifRender: (row) => row.status == 0
      },
      {
        label: '取消确认',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: cancelData,
        ifRender: (row) => row.status == 1
      },
    ]
  },
  sectionRows: []
})

const collectInfo = reactive({
  title: '归集',
  refObj: null,
  row: {},
  visible: false,
  fieldList: [
    { label: '账户信息', span: 12, value: 'fundsCompareAccountName', type: 'slot' },
    { label: '业务开始日期', span: 12, value: 'businessTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '业务结束日期', span: 12, value: 'businessTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
  ],
  rules: {
    fundsCompareAccountName: [{ required: true, message: '请选择账户信息', trigger: 'change' }],
    businessTimeStart: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    businessTimeEnd: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => collectInfo.visible = false},
    { type: 'primary', label: '确定', event: saveCollectData }
  ]
})
const filterRef = ref()

const addInfo = reactive({
  visible: false,
  title: '',
  form: null
})

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('funds_account', '归集日志')

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除'),
        confirmBtn = btns.find(btn => btn.label === '确认'),
        cancelBtn = btns.find(btn => btn.label === '取消确认')

  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status === '1')
  confirmBtn.disabled = !rows.length || !!rows.find(it => it.status === '1')
  cancelBtn.disabled = !rows.length || !!rows.find(it => it.status !== '1')
}, { immediate: true })


onMounted(() => {
  tableInfo.api = API.query
  if (props.orderId) {
    getList()
  }
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  const time1 = filterInfo.query.businessTimeStart;
  const time2 = filterInfo.query.businessTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    businessTimeStart: time1 ? time1 + ' 00:00:00' : '',
    businessTimeEnd: time2 ? time2 + ' 23:59:59' : '',
    settlementMethodName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    businessTimeStart: defaultDate1,
    businessTimeEnd: defaultDate2,
    fundsCompareAccountId: props.accountId,
    fundsCompareAccountName: props.orderNo,
    idIn: props.orderId
  }
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  const total = tableInfo.data.find(it => it.orgName === '本年累计')
  if (!total) return proxy.$message.error('数据错误，未找到本年累计数据')
  addInfo.form = row ? cloneDeep(row) : {
    fundsCompareAccountId: filterInfo.query.fundsCompareAccountId,
    fundsCompareAccountName: filterInfo.query.fundsCompareAccountName,
    balance: total.balance
  }
  addInfo.title = row ? '修改资金日记账' : "新增资金日记账"
  addInfo.visible = true
}

function collectData() {
  collectInfo.row = {
    fundsCompareAccountId: filterInfo.query.fundsCompareAccountId,
    fundsCompareAccountName: filterInfo.query.fundsCompareAccountName,
  }
  collectInfo.visible = true
}


async function saveCollectData() {
  let isValid = true
  await collectInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const _row = {
    ...collectInfo.row,
  }
  API.collect(_row).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      collectInfo.visible = false
      getList()
    }
  })
}

// 删除数据
function deleteData(row) {
  const ids = row ? [row.id] : tableInfo.sectionRows.filter(it => it.id !== null).map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请选择非合计数据')
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
  const ids = row ? [row.id] : tableInfo.sectionRows.filter(it => it.id !== null).map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请选择非合计数据')
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
  const ids = row ? [row.id] : tableInfo.sectionRows.filter(it => it.id !== null).map(it => it.id)
  if (ids.length === 0) {
    return proxy.$message.warning('请选择非合计数据')
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

function selectFundsCompareAccount(mark) {
  selectorInfo.type = 'fundsCompareAccount'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    if (mark === 'collect') {
      collectInfo.row.fundsCompareAccountId = data.id
      collectInfo.row.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
    } else {
      filterInfo.query.fundsCompareAccountId = data.id
      filterInfo.query.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
    }
  }
  selectorInfo.visible = true
}

function selectUser() {
  selectorInfo.title = '创建人'
  selectorInfo.type = 'users'
  selectorInfo.query = {
    type: "normal",
    userType: '1',
    status: undefined,
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.createUser = data.id
    filterInfo.query.createUserName = data.name
  }
  selectorInfo.visible = true
}

function selectSettlementMethod(mark) {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.settlementMethodId = data.id
    filterInfo.query.settlementMethodName = data.name
  }
  selectorInfo.visible = true
}
const detailsInfo = reactive({
  visible: false,
  title: '资金日记账详情',
  form: {}
})
function detail(row) {
  detailsInfo.form = cloneDeep(row)
  detailsInfo.visible = true
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
    <div class="layui-card layui-col-md12" v-show="!addInfo.visible && !detailsInfo.visible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
              :listTypeInfo="filterInfo.listTypeInfo"
          >
            <template #filter-fundsCompareAccountName>
              <el-input
                  v-model="filterInfo.query.fundsCompareAccountName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择账户信息"
              >
                <template #append>
                  <el-icon @click="selectFundsCompareAccount"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-createUserName>
              <el-input
                  v-model="filterInfo.query.createUserName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择创建人"
              >
                <template #append>
                  <el-icon @click="selectUser"
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
        <TableContainerVxe
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            rowKey="uuid"
            :rowClassName="tableInfo.rowClassName"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :isDynamic="true"
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-fundsCompareAccountName="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.fundsCompareAccountName }}</span>
          </template>
        </TableContainerVxe>
      </div>
    </div>
      <modify
          v-if="addInfo.visible"
          v-model:visible="addInfo.visible"
          :form="addInfo.form"
          :title="addInfo.title"
          @returnModify="getList"
      />
      <Details
          v-if="detailsInfo.visible"
          :title="detailsInfo.title"
          :form="detailsInfo.form"
          v-model:visible="detailsInfo.visible"
          @returnBack="getList"
      ></Details>
  </div>

    <ModifyFormDialog v-model:dialog-info="collectInfo">
      <template #form-fundsCompareAccountName>
        <el-input
            v-model="collectInfo.row.fundsCompareAccountName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择账户信息"
        >
          <template #append>
            <el-icon @click="selectFundsCompareAccount('collect')"
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
:deep(.warning-style) {
  background: #F4D095 !important;
}
.error-style {
  color: #f56c6c;
}
</style>
