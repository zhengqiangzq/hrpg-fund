<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {
  cancelUnitJournal, confirmUnitJournal,
  deleteUnitJournal, exportUnitJournal, mergeUnitJournal,
  pageUnitJournal,
  updateUnitJournal
} from "@/api/reconciliationOfFunds/unitJournal";
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
const PERMISSION_CODE = 'unitJournal'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageUnitJournal,
  delete: deleteUnitJournal,
  update: updateUnitJournal,
  confirm: confirmUnitJournal,
  cancel: cancelUnitJournal,
  merge: mergeUnitJournal,
  export: exportUnitJournal,
  download: exportTemplateExcel,
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'accountingBillRecordTemplate', '/record/accountingBillRecord/importExcel/after', () => getList(), 'unitJournal:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14008',
  params: {
    businessParams: 'after'
  },
  action: '/record/accountingBillRecord/import/excelRecord'
})

const defaultDate1 = props.startDate ?? `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = props.endDate ?? `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    certificateTimeStart: defaultDate1,
    certificateTimeEnd: defaultDate2,
    fundsCompareAccountId: props.accountId,
    fundsCompareAccountName: props.orderNo,
    idIn: props.orderId,
  },
  copyQuery: {},
  listTypeInfo: {
    dataType: [{ key: '人工', value: '2' }, { key: '采集', value: '1' }],
  },
  list: [
    { label: '账户信息', value: 'fundsCompareAccountName', showLabel: true, required: true, type: 'slot' },
    { label: '凭证开始日期', value: 'certificateTimeStart', required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '凭证结束日期', value: 'certificateTimeEnd', required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '摘要', value: 'summary', type: 'input' },
    { label: '数据来源', value: 'dataSource', type: 'select', clearable: true, list: 'dataType' },
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
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('单位日记账导入模板', 'unitJournal:download'), },
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
    { label: '凭证日期', value: 'certificateTime', formatter: (val) => moment(val.certificateTime).format('YYYY-MM-DD') },
    // { label: '凭证类型', value: 'certificateTypeName' },
    { label: '凭证号', value: 'certificateNum' },
    { label: '分录号', value: 'certificateDetailNum' },
    { label: '摘要', value: 'summary' },
    { label: '科目编码', value: 'accountSubjectCode' },
    { label: '科目名称', value: 'accountSubjectName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '数据来源', value: 'dataSourceValue' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    { label: '借方发生', value: 'inMoney', align: 'right' },
    { label: '贷方发生', value: 'outMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right' },
    { label: '是否单位银行对账', value: 'compareBankValue', width: 160 },
    { label: '单位银行对账批次码', value: 'compareBankBatchCode', width: 170 },
    { label: '是否出纳单位对账', value: 'compareCashValue', width: 160 },
    { label: '出纳单位对账批次码', value: 'compareCashBatchCode', width: 170 },
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
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => !!row.id
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
const downloadInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '下载',
  visible: false,
  fieldList: [
    { label: '账户信息', value: 'fundsCompareAccountName', span: 12, type: 'slot' },
    { label: '凭证开始时间', value: 'businessTimeStart', span: 12, type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '凭证结束时间', value: 'businessTimeEnd', span: 12, type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
  ],
  rules: {
    fundsCompareAccountName: [{ required: true, message: '请选择账户信息', trigger: 'change' }],
    businessTimeStart: [{ required: true, message: '请选择凭证开始时间', trigger: 'change' }, {
      validator: (rule, value, callback) => {
        if (value && new Date(value) > downloadInfo.row.businessTimeEnd) {
          callback(new Error('凭证开始时间必须小于凭证结束时间'));
        } else {
          callback();
        }
      }
    }],
    businessTimeEnd: [{ required: true, message: '请选择凭证结束时间', trigger: 'change' }, {
      validator: (rule, value, callback) => {
        if (value && new Date(value) < downloadInfo.row.businessTimeStart) {
          callback(new Error('凭证结束时间必须大于凭证开始时间'));
        } else {
          callback();
        }
      }
    }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => downloadInfo.visible = false},
    { type: 'primary', label: '确定', event: downloadConfirm }
  ]
})
const filterRef = ref()

const addInfo = reactive({
  visible: false,
  form: null
})

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('unit_account')

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
  const time1 = filterInfo.query.certificateTimeStart;
  const time2 = filterInfo.query.certificateTimeEnd;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    certificateTimeStart: time1 ? time1 + ' 00:00:00' : '',
    certificateTimeEnd: time2 ? time2 + ' 23:59:59' : '',
    settlementMethodName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    certificateTimeStart: defaultDate1,
    certificateTimeEnd: defaultDate2,
    fundsCompareAccountId: props.accountId,
    fundsCompareAccountName: props.orderNo,
    idIn: props.orderId,
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
  addInfo.title = row ? '修改单位日记账' : "新增单位日记账"
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

function downloadData() {
  downloadInfo.row = {
    fundsCompareAccountId: filterInfo.query.fundsCompareAccountId,
    fundsCompareAccountName: filterInfo.query.fundsCompareAccountName,
  }
  downloadInfo.visible = true
}

async function downloadConfirm() {
  let isValid = true
  await downloadInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  API.merge(downloadInfo.row).then(res => {
    if (res.success) {
      proxy.$message.success('下载成功')
      downloadInfo.visible = false
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
    if (mark === 'download') {
      downloadInfo.row.fundsCompareAccountId = data.id
      downloadInfo.row.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
    } else {
      filterInfo.query.fundsCompareAccountId = data.id
      filterInfo.query.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
    }
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
  title: '单位日记账详情',
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
            :rowClassName="tableInfo.rowClassName"
            :query="filterInfo.copyQuery"
            rowKey="uuid"
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
    <ModifyFormDialog v-model:dialog-info="downloadInfo">
      <template #form-fundsCompareAccountName>
        <el-input
            v-model="downloadInfo.row.fundsCompareAccountName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择账户信息"
        >
          <template #append>
            <el-icon @click="selectFundsCompareAccount('download')"
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
