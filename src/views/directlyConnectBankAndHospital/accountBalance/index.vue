<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  downloadAccountBalance,
  exportAccountBalance,
  pageAccountBalance
} from "@/api/directlyConnectBankAndHospital/accountBalance";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {useDownloadLog} from "@/components/DownloadLog/useDownloadLog";
import {requiredPageFilter} from "@/utils";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'accountBalance'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageAccountBalance,
  download: downloadAccountBalance,
  export: exportAccountBalance,
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD 00:00:00')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD 23:59:59')}`

const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    usableTimeEqAndGre: defaultDate1,
    usableTimeEqAndLes: defaultDate2,
  },
  copyQuery: {},
  list: [
    { label: '余额开始日期', value: 'usableTimeEqAndGre', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '余额结束日期', value: 'usableTimeEqAndLes', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '银行类别', value: 'bankDocTypeName', showLabel: true, type: 'slot', event: getList },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot', required: true, event: getList },
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
    { label: '单位名称', value: 'orgName' },
    { label: '银行类型', value: 'bankType' },
    { label: '银行账户', value: 'bankUsername' },
    { label: '银行账号', value: 'bankNumber' },
    { label: '余额', value: 'usableMoney', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.usableMoney) },
    { label: '余额日期', value: 'usableTime', align: 'center', formatter: (val) => moment(val.usableTime).format('YYYY-MM-DD') },
    { label: '下载状态', value: 'statusValue' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'usableMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('bmp_balance')

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    usableTimeEqAndGre: defaultDate1,
    usableTimeEqAndLes: defaultDate2,}
  tableInfo.data = []
  getList()
}

function downloadData() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  API.download({
    startDate: filterInfo.query.usableTimeEqAndGre,
    endDate: filterInfo.query.usableTimeEqAndLes,
    accountId: filterInfo.query.accountId,
  }).then(({ success }) => {
    if (success) {
      proxy.$message.success('操作成功，请稍后刷新列表')
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectBankType() {
  selectorInfo.type = 'bankDocType'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.bankDocTypeId = data.id
    filterInfo.query.bankDocTypeName = data.name
  }
  selectorInfo.visible = true
}
function selectBankAccount(mark) {
  selectorInfo.type = 'bankAccount'
  selectorInfo.query = {
    bankDocTypeId: filterInfo.query.bankDocTypeId,
    enableStatus: '1'
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.accountId = data.bankAccountId
    filterInfo.query.bankAccountName = data.bankAccountName
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
            <template #filter-bankDocTypeName>
              <el-input
                  v-model="filterInfo.query.bankDocTypeName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择银行类别"
              >
                <template #append>
                  <el-icon @click="selectBankType"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
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
        </table-container>
      </div>
    </div>
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
