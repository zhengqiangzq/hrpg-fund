<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import {
  downloadEbankReceipt,
  exportEbankReceipt,
  pageEbankReceipt,
} from "@/api/directlyConnectBankAndHospital/ebankReceipt";
import {useDownloadLog} from "@/components/DownloadLog/useDownloadLog";
import {requiredPageFilter} from "@/utils";
import {DetailPage, DetailPageName} from "@/views/detailPage";
import Details from './details.vue'

const props = defineProps({
  orderNo: null
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'ebankReceipt'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageEbankReceipt,
  download: downloadEbankReceipt,
  export: exportEbankReceipt,
}

const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    businessOrderNo: props.orderNo
  },
  copyQuery: {},
  list: [
    { label: '回单开始日期', value: 'tranDateStart', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '回单结束日期', value: 'tranDateEnd', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot', required: true, event: getList },
    { label: '回单单号', value: 'receiptNo', type: 'input', event: getList },
    { label: '交易流水号', value: 'transSerialNum', type: 'input', event: getList },
    { label: '结算单号', value: 'orderNo', type: 'input', event: getList },
    { label: '对方名称', value: 'tradeObjectName', type: 'input', event: getList },
    { label: '对方账号', value: 'tradeObjectAccNum', type: 'input', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '下载', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadData(), },
    { type: 'button', label: '下载日志', show: proxy.$permission(`${PERMISSION_CODE}:downlog`), event: () => openDownloadLog(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '回单单号', value: 'receiptNo', type: 'slot' },
    { label: '回单日期', value: 'tranDateStr' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '柜员交易号', value: 'tranNo' },
    { label: '交易流水号', value: 'transSerialNum' },
    { label: '结算单号', value: 'orderNo', type: 'slot' },
    { label: '对方名称', value: 'tradeObjectName' },
    { label: '对方账号', value: 'tradeObjectAccNum' },
    { label: '收款金额', value: 'collectionAmount', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.collectionAmount) },
    { label: '付款金额', value: 'paymentAmount', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.paymentAmount) },
  ],
  data: [],
  summaryFieldList: [
    { value: 'collectionAmount', formatter: proxy.$fn.TripartiteMethod },
    { value: 'paymentAmount', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})
const receiptDetailsInfo = reactive({
  visible: false,
  id: null
})
const detailsInfo = reactive({
  visible: false,
  title: '',
  id: null
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('bmp_receipt')

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  filterInfo.copyQuery = {
    ...filterInfo.query,
    bankAccountName: undefined,
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function receiptDetail(row) {
  receiptDetailsInfo.id = row.id
  receiptDetailsInfo.visible = true
}

function detail(row) {
  detailsInfo.id = row.orderId
  detailsInfo.component = DetailPage[row.orderType]
  detailsInfo.title = DetailPageName[row.orderType]
  detailsInfo.visible = true
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function downloadData() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  API.download({
    startDate: filterInfo.query.tranDateStart,
    endDate: filterInfo.query.tranDateEnd,
    accountId: filterInfo.query.accountId,
  }).then(({ success }) => {
    if (success) {
      proxy.$message.success('操作成功，请稍后刷新列表')
    }
  })
}

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.accountId = data.bankAccountId
    filterInfo.query.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-show="!detailsInfo.visible && !receiptDetailsInfo.visible">
        <div class="layui-card-body">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :filter-btn="filterInfo.filterbtn"
            >
              <template #filter-bankAccountName>
                <el-input
                    v-model="filterInfo.query.bankAccountName"
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
              :checkBox="false"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
          >
            <template #col-receiptNo="{ row }">
              <span class="slip-edit" @click="receiptDetail(row)">{{ row.receiptNo }}</span>
            </template>
            <template #col-orderNo="{ row }">
              <span class="slip-edit" @click="detail(row)">{{ row.orderNo }}</span>
            </template>
          </table-container>
        </div>
      </div>
      <Details
          v-if="receiptDetailsInfo.visible"
          :title="receiptDetailsInfo.title"
          :id="receiptDetailsInfo.id"
          v-model:visible="receiptDetailsInfo.visible"
          @returnBack="getList"
      ></Details>
    </div>
    <component
        :is="detailsInfo.component"
        v-if="detailsInfo.visible"
        :title="detailsInfo.title"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></component>
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
