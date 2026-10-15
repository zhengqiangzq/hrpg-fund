<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch, computed} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {
  bankBillRecordDownload,
  cancelBankStatement, confirmBankStatement,
  deleteBankStatement, downloadBMPBankStatement, exportBankStatement,
  pageBankStatement,
  updateBankStatement
} from "@/api/reconciliationOfFunds/bankStatement";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import Modify from "./modify.vue";
import {requiredPageFilter} from "@/utils";
import {useDownloadLog} from "@/components/DownloadLog/useDownloadLog";
import Details from "./details.vue";
import customModelDialog from "@/components/TransferTabDialog/customModelDialog";

const props = defineProps({
  orderId: null,
  orderNo: null,
  accountId: null,
  startDate: null,
  endDate: null,
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'bankStatement'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageBankStatement,
  delete: deleteBankStatement,
  update: updateBankStatement,
  confirm: confirmBankStatement,
  down: bankBillRecordDownload,
  cancel: cancelBankStatement,
  export: exportBankStatement,
  download: exportTemplateExcel,
  downloadBMP: downloadBMPBankStatement
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'bankBillRecordTemplate', '/record/bankBillRecord/import/excelRecord', () => getList(), 'bankStatement:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14009',
  params: {
    businessParams: 'after'
  },
  action: '/record/bankBillRecord/import/excelRecord'
})
const { customBtns } = customModelDialog({
  PERMISSION_CODE: PERMISSION_CODE,
  title: '',
  categoryId: '',
  apiExport: API.export,
  bizType: '14015',
  disabled: false,
  // 点击「自定义导出」时实时获取列表接口的查询参数（getList 组装后的参数）
  query: () => ({ ...filterInfo.copyQuery }),
  // 勾选数据：当前表格勾选的 id
  idIn: () => tableInfo.sectionRows.map(it => it.id).join(),
  // 分页参数：由 table-container 的 pageInfo 事件同步
  page: () => ({ ...tableInfo.pageInfo }),
})
const defaultDate1 = props.startDate ? moment(props.startDate).format('YYYY-MM-DD 00:00:00') : `${moment().startOf('month').format('YYYY-MM-DD 00:00:00')}`
const defaultDate2 = props.endDate ? moment(props.endDate).format('YYYY-MM-DD 23:59:59') : `${moment().endOf('month').format('YYYY-MM-DD 23:59:59')}`

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
    { label: '交易开始日期', value: 'businessTimeStart', required: true, type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '交易结束日期', value: 'businessTimeEnd', required: true, type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '创建人', value: 'createUserName', showLabel: true, type: 'slot' },
    { label: '往来单位', value: 'tradeObj', type: 'input' },
    { label: '摘要', value: 'summary', type: 'input' },
    { label: '数据来源', value: 'dataSource', type: 'select', list: 'dataType' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), disabled: computed(() => tableInfo.data.length === 0), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载', show: proxy.$permission(`${PERMISSION_CODE}:down`), event: () => downloadData(), },
    { type: 'button', label: '下载日志', show: proxy.$permission(`${PERMISSION_CODE}:downlog`), event: () => openDownloadLog(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('银行对账单导入模板', 'bankStatement:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
      if(Object.keys(filterInfo.copyQuery).length === 0) return proxy.$message.warning('请先查询数据');
      exportData(filterInfo.copyQuery)
      }, },
      ...customBtns,
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
    { label: '往来单位', value: 'tradeObj' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    // { label: '凭证号', value: 'certificateNum' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right' },
    // { label: '交易对象户名', value: 'tradeObj' },
    { label: '创建人', value: 'createUserName' },
    // { label: '确认状态', value: 'statusValue' },
    { label: '创建日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
    { label: '数据来源', value: 'dataSourceValue' },
    { label: '是否单位银行对账', value: 'compareAccountingValue', width: 160 },
    { label: '单位银行对账批次码', value: 'compareAccountingBatchCode', width: 170 },
    { label: '是否出纳银行对账', value: 'compareCashValue', width: 160 },
    { label: '出纳银行对账批次码', value: 'compareCashBatchCode', width: 170 },
  ],
  data: [],
  pageInfo: {},
  rowClassName: ({ row }) => {
    return row.classColor == '1' ? 'warning-style' : ''
  },
  summaryFieldList: [
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
        ifRender: (row) => !!row.id && row.dataSource != 1
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => !!row.id
      },
    ]
  },
  sectionRows: []
})
const collectInfo = reactive({
  title: '下载',
  refObj: null,
  row: {},
  visible: false,
  fieldList: [
    { label: '账户信息', span: 12, value: 'accountName', type: 'slot' },
    { label: '业务开始日期', span: 12, value: 'startDate', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '业务结束日期', span: 12, value: 'endDate', type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
  ],
  rules: {
    accountName: [{ required: true, message: '请选择账户信息', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    endDate: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => collectInfo.visible = false},
    { type: 'primary', label: '确定', event: saveCollectData }
  ]
})
const filterRef = ref()

const addInfo = reactive({
  visible: false,
  form: null
})

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('bmp_compare')

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')

  deleteBtn.disabled = !rows.length
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
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
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
  getList()
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
  addInfo.title = row ? '修改银行对账单' : "新增银行对账单"
  addInfo.visible = true
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

function downloadData() {
  collectInfo.row = {
    accountId: filterInfo.query.bankAccountId,
    accountName: filterInfo.query.fundsCompareAccountName,
    fundsCompareAccountId: filterInfo.query.fundsCompareAccountId,
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
  API.downloadBMP(_row).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('下载成功')
      collectInfo.visible = false
      getList()
    }
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
      collectInfo.row.accountId = data.bankAccountId
      collectInfo.row.fundsCompareAccountId = data.id
      collectInfo.row.accountName = data.bankAccountName || data.cashAccountName
    } else {
      filterInfo.query.fundsCompareAccountId = data.id
      filterInfo.query.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
      filterInfo.query.bankAccountId = data.bankAccountId
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
  title: '银行对账单详情',
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
            @pageInfo="info => tableInfo.pageInfo = info"
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
      <template #form-accountName>
        <el-input
            v-model="collectInfo.row.accountName"
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
