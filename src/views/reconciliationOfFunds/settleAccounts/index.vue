<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useSelectData} from "@/hooks/useSelectData";
import moment from "moment";
import {
  closeCheckSettleAccounts,
  closeSettleAccounts,
  listSettleAccounts, reCloseCheckSettleAccounts,
  reCloseSettleAccounts
} from "@/api/reconciliationOfFunds/settleAccounts";
import useMonthCheckout from "@/components/MonthCheckout/useMonthCheckout";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {periodyearList} from "@/api/base";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'settleAccounts'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: listSettleAccounts,
  close: closeSettleAccounts,
  reClose: reCloseSettleAccounts
}

const { openCheckout, openReCheckout } = useMonthCheckout({
  PERMISSION_CODE: `${PERMISSION_CODE}:confirm`,
  api: {
    check: closeCheckSettleAccounts,
    reCheck: reCloseCheckSettleAccounts,
    closeCheck: API.close,
    cancelCloseCheck: API.reClose
  }
})

const filterInfo = reactive({
  query: {
  },
  copyQuery: {},
  listType: {
    yearList: []
  },
  list: [
    { label: '会计年度', value: 'periodId', required: true, type: 'select', list: 'yearList', showLabel: true },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '会计期间', value: 'periodmonth' },
    { label: '结账状态', value: 'isCloseName' },
    { label: '结账人', value: 'closeUserName' },
    { label: '结账日期', value: 'closeTime', align: 'center', formatter: (val) => moment(val.closeTime).format('YYYY-MM-DD') },
    { label: '反结账人', value: 'recloseUserName' },
    { label: '反结账日期', value: 'recloseTime', align: 'center', formatter: (val) => moment(val.recloseTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '结账',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: closeData,
        ifRender: (row) => row.isClose == '0'
      },
      {
        label: '反结账',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: reCloseData,
        ifRender: (row) => row.isClose == '1'
      },
    ]
  },
  sectionRows: []
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getYear()
})

// 查询
function getList() {
  if(!filterInfo.query.periodId) {
    return proxy.$message.warning('请选择会计年度')
  }
  filterInfo.copyQuery = {
    ...filterInfo.query,
  }
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
  }
  getList()
}

async function getYear() {
  filterInfo.listType.yearList = []
  const { data, code } = await periodyearList({})
    if (code === 200) {
      filterInfo.listType.yearList = data.map(it => {
        return {
          key: it.periodYear,
          value: it.id,
        }
      })
    }
}
function closeData(row) {
  openCheckout(row, getList)
  // if (!tableInfo.currentRow?.id) {
  //   proxy.$message.warning('请选择数据')
  //   return
  // }
  // API.close(tableInfo.currentRow.id).then(res => {
  //   if (res.success) {
  //     proxy.$message.success('操作成功')
  //     getList()
  //   }
  // })
}
function reCloseData(row) {
  openReCheckout(row, getList)
  // if (!tableInfo.currentRow?.id) {
  //   proxy.$message.warning('请选择数据')
  //   return
  // }
  // API.reClose(tableInfo.currentRow.id).then(res => {
  //   if (res.success) {
  //     proxy.$message.success('操作成功')
  //     getList()
  //   }
  // })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableClickRow') {
    tableInfo.currentRow = raw
  }
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
            :listTypeInfo="filterInfo.listType"
          >
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
            :check-box="false"
            highlightRow
            :pager="false"
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
