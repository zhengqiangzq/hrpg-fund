<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectData} from "@/hooks/useSelectData";
import {
  deleteNotReachedBank, exportNotReachedBank,
  pageNotReachedBank,
} from "@/api/reconciliationOfFunds/notReachedBank";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import customModelDialog from "@/components/TransferTabDialog/customModelDialog";
import Modify from "./modify.vue";
import Details from "./details.vue";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'notReachedBank'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageNotReachedBank,
  delete: deleteNotReachedBank,
  export: exportNotReachedBank,
  download: exportTemplateExcel,
}

const {
  exportData,
  downloadTemplate
} = useUpload(API, 'bankBillRecordBeginTemplate', '/record/bankBillRecord/import/excelRecord', () => getList(), 'notReachedBank:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14008',
  params: {
    businessParams: 'begin'
  },
  action: '/record/bankBillRecord/import/excelRecord'
})
const { customBtns } = customModelDialog({
  PERMISSION_CODE: PERMISSION_CODE,
  title: '',
  categoryId: '',
  apiExport: API.export,
  bizType: '14008',
  disabled: false,
  // 点击「自定义导出」时实时获取列表接口的查询参数（getList 组装后的参数）
  query: () => ({ ...filterInfo.copyQuery }),
  // 勾选数据：当前表格勾选的 id
  idIn: () => tableInfo.sectionRows.map(it => it.id).join(),
  // 分页参数：由 table-container 的 pageInfo 事件同步
  page: () => ({ ...tableInfo.pageInfo }),
})
const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    businessTimeStart: defaultDate1,
    businessTimeEnd: defaultDate2
  },
  copyQuery: {},
  list: [
    { label: '账户名称', value: 'fundsCompareAccountName', showLabel: true, required: true, type: 'slot', event: getList },
    { label: '业务开始日期', value: 'businessTimeStart', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'businessTimeEnd', type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot', event: getList },
    { label: '票据号', value: 'billNum', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('单位未达账导入模板', 'notReachedBank:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
    ...customBtns,
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '账户名称', value: 'fundsCompareAccountName', type: 'slot' },
    { label: '业务日期', value: 'businessTime', align: 'center', formatter: (val) => moment(val.businessTime).format('YYYY-MM-DD') },
    { label: '摘要', value: 'summary' },
    { label: '往来单位', value: 'tradeObj' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', formatter: (val) => moment(val.billDate).format('YYYY-MM-DD') },
    { label: '收款', value: 'inMoney', align: 'right' },
    { label: '付款', value: 'outMoney', align: 'right' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
    { label: '是否单位银行对账', value: 'compareAccountingValue', width: 160 },
    { label: '单位银行对账批次码', value: 'compareAccountingBatchCode', width: 170 },
    { label: '是否出纳银行对账', value: 'compareCashValue', width: 160 },
    { label: '出纳银行对账批次码', value: 'compareCashBatchCode', width: 170 },
  ],
  data: [],
  pageInfo: {},
  summaryFieldList: [
    { value: 'inMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'outMoney', formatter: proxy.$fn.TripartiteMethod },
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
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  form: null,
  visible: false,
})
const filterRef = ref()
const accountInfo = ref()

const { selectorInfo, selectorRef } = useSelectData()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')

  deleteBtn.disabled = !rows.length
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  if (!filterInfo.query.fundsCompareAccountId) {
    proxy.$message.warning('请选择账户名称')
    return
  }
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
  }
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.form = row ? cloneDeep(row) : {
    fundsCompareAccountId: filterInfo.query.fundsCompareAccountId,
    fundsCompareAccountName: filterInfo.query.fundsCompareAccountName,
  }
  modifyInfo.title = row ? '修改单位未达账' : "新增单位未达账"
  if(!row) {
    if(!filterInfo.query.fundsCompareAccountId) return proxy.$message.warning('请选择账户名称')
    if(accountInfo.value === '1') return proxy.$message.warning('请选择未启用的账户名称')
  }
  modifyInfo.visible = true
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

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectFundsCompareAccount() {
  selectorInfo.type = 'fundsCompareAccount'
  selectorInfo.query = {
    status: undefined
  }
  selectorInfo.callback = (data) => {
    accountInfo.value = data.status;
    filterInfo.query.fundsCompareAccountId = data.id
    filterInfo.query.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectSettlementMethod() {
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
  title: '单位未记账详情',
  form: {}
})
function detail(row) {
  detailsInfo.form = cloneDeep(row)
  detailsInfo.visible = true
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
            <template #filter-fundsCompareAccountName>
              <el-input
                  v-model="filterInfo.query.fundsCompareAccountName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择账户名称"
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
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :query="filterInfo.copyQuery"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :pager="false"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
            @pageInfo="info => tableInfo.pageInfo = info"
        >
          <template #col-fundsCompareAccountName="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.fundsCompareAccountName }}</span>
          </template>
        </table-container>
      </div>
      <modify
          v-if="modifyInfo.visible"
          v-model:visible="modifyInfo.visible"
          :form="modifyInfo.form"
          :title="modifyInfo.title"
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

    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
