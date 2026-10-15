<script setup>
import {getCurrentInstance, onMounted, computed, watch, reactive} from "vue";
import {useUpload} from "@/hooks/useUpload";
import {
  accountDetailbyDelete,
  downloadAccountTransactionDetails, exportAccountTransactionDetails,
  pageAccountTransactionDetails
} from "@/api/business/accountTransactionDetails";
import moment from "moment/moment";
import cloneDeep from "lodash/cloneDeep";
import {useSelectData} from "@/hooks/useSelectData";
import BuildCollectionBusiness from "../collectionBusiness/modify.vue";
import {requiredPageFilter} from "@/utils";
import {useDownloadLog} from "@/components/DownloadLog/useDownloadLog";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'accountTransactionDetails'

defineOptions({
  name: PERMISSION_CODE
})

const API = {
  query: pageAccountTransactionDetails,
  download: downloadAccountTransactionDetails,
  export: exportAccountTransactionDetails,
  del: accountDetailbyDelete
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD 00:00:00')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD 23:59:59')}`

const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    tradeTimeEqAndGre: defaultDate1,
    tradeTimeEqAndLes: defaultDate2,
  },
  copyQuery: {},
  list: [
    { label: '交易开始日期', value: 'tradeTimeEqAndGre', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '交易结束日期', value: 'tradeTimeEqAndLes', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '银行账户', value: 'bankAccountName', required: true, showLabel: true, type: 'slot', event: getList },
    { label: '收付款类型', value: 'type', type: 'select-model', code: 'funds_payment_type', event: getList },
    { label: '交易对象户名', value: 'tradeBankNameLike', type: 'input' },
    { label: '摘要', value: 'remarkLike', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '下载', btType: 'primary', show: proxy.$permission(`${PERMISSION_CODE}:down`), event: () => downloadData(), },
    { type: 'button', label: '下载日志', show: proxy.$permission(`${PERMISSION_CODE}:downlog`), event: () => openDownloadLog(), },
    { type: 'button', label: '删除', btType: 'primary', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '生成收款单', btType: 'primary', disabled: computed(() => {
      return !tableInfo.sectionRows.length || !!tableInfo.sectionRows.find(it => it.createFlag == 1 || it.type != 2)
      }), show: proxy.$permission(`${PERMISSION_CODE}:build`), event: () => buildData(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '账户信息', value: 'bankAccountName' },
    { label: '交易日期', value: 'tradeTime', formatter: (val) => moment(val.tradeTime).format('YYYY-MM-DD') },
    { label: '摘要', value: 'remark' },
    { label: '收付款性质', value: 'typeValue' },
    { label: '交易金额', value: 'tradeMoney', align: 'right' },
    { label: '交易对象名称', value: 'tradeBankName' },
    { label: '交易对象开户行', value: 'tradeBankDoc' },
    { label: '交易对象账号', value: 'tradeBankAccount' },
    { label: '是否生成收款单', width: '180px', value: 'createFlag', formatter: val => (val.createFlag == 1 ? '是' : '否') },
    { label: '下载人', value: 'updateUserName' },
    { label: '下载日期', value: 'updateTime', align: 'center', formatter: (val) => moment(val.updateTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [
    { value: 'tradeMoney', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})

const buildInfo = reactive({
  visible: false,
  detailOrders: null,
})

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('bmp_detail')

watch(() => tableInfo.sectionRows, (rows) => {
  const deleteBtn = filterInfo.btnList.find(btn => btn.label === '删除');
      deleteBtn.disabled = rows.length === 0
}, { immediate: true })
onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    bankAccountName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    tradeTimeEqAndGre: defaultDate1,
    tradeTimeEqAndLes: defaultDate2,
  }
  getList()
}

function downloadData() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  API.download({
    accountId: filterInfo.query.bankAccountId,
    startDate: filterInfo.query.tradeTimeEqAndGre,
    endDate: filterInfo.query.tradeTimeEqAndLes,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('操作成功，请稍后刷新列表')
      getList()
    }
  })
}

// 删除数据
function deleteData() {
  const ids = tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.del(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getList()
      }
    })
  })
}

function buildData() {
  buildInfo.detailOrders = tableInfo.sectionRows
  buildInfo.visible = true
}

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (row) => {
    filterInfo.query.bankAccountId = row.bankAccountId
    filterInfo.query.bankAccountName = row.bankAccountName
  }
  selectorInfo.visible = true
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-show="!buildInfo.visible">
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
              :checkBox="true"
              :field-list="tableInfo.fieldList"
              :handle="tableInfo.handle"
              @handleEvent="tableHandler"
          >
          </table-container>
          <select-data ref="selectorRef" />
        </div>
      </div>
      <BuildCollectionBusiness
          v-if="buildInfo.visible"
          title="生成收款单"
          v-model:visible="buildInfo.visible"
          :detail-orders="buildInfo.detailOrders"
          @returnModify="getList"/>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
