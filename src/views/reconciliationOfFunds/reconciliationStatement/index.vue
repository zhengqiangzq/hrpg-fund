<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {
  allReconciliationStatement,
  exportReconciliationStatement
} from "@/api/reconciliationOfFunds/reconciliationStatement";
import moment from "moment";

const props = defineProps({
  orderId: null,
  orderNo: null
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'reconciliationStatement'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: allReconciliationStatement,
  export: exportReconciliationStatement,
}

const {
  exportData,
} = useUpload(API)

const defaultDate = moment().format('YYYY-MM-DD')

const filterInfo = reactive({
  query: {
    limit: defaultDate,
    compareAccountId: props.orderId,
    compareAccountName: props.orderName
  },
  copyQuery: {},
  list: [
    { label: '账户信息', value: 'compareAccountName', showLabel: true, required: true, type: 'slot', event: getList },
    { label: '截止日期', value: 'limit', type: 'date', valueFormat: 'YYYY-MM-DD', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', btType: 'primary', label: '打印', show: proxy.$permission(`${PERMISSION_CODE}:print`), event: () => {
        if (!validateFilter()) return
        printData(filterInfo.copyQuery)
      }, },
    { type: 'button', btType: 'primary', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => {
        if (!validateFilter()) return
        exportData(filterInfo.copyQuery)
      }, },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '项目', value: 'accountingName' },
    { label: '金额', value: 'accountingMoney', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.accountingMoney) },
    { label: '项目', value: 'bankName' },
    { label: '金额', value: 'bankMoney', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.bankMoney) },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: undefined,
  sectionRows: []
})
const extraFormInfo = reactive({
  data: {},
  labelWidth: '130px',
  fieldList: [
    { label: '单位日记账余额', value: 'accountingBalance', type: 'money', disabled: true },
    { label: '调整后余额', value: 'accountingAdjustBalance', type: 'money', disabled: true },
    { label: '对账单余额', value: 'bankBalance', type: 'money', disabled: true },
    { label: '调整后余额', value: 'bankAdjustBalance', type: 'money', disabled: true },
    { label: '差额', value: 'differenceBalance', type: 'money', disabled: true },
  ]
})
const filterRef = ref()

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
})

// 查询
function getList() {
  if (!validateFilter()) return
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
  })
  tableInfo.api(filterInfo.copyQuery).then(res => {
    tableInfo.data = res.data.list
    extraFormInfo.data = res.data.data
  })
}
function validateFilter() {
  if (!filterInfo.query.compareAccountId) {
    proxy.$message.warning('请选择账户信息')
  } else {
    return true
  }
  return false
}

// 重置查询
function reset() {
  filterInfo.query = {
    limit: defaultDate
  }
}

function printData() {
  window.print()
}

function selectCompareAccount() {
  selectorInfo.type = 'fundsCompareAccount'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    filterInfo.query.compareAccountId = data.id
    filterInfo.query.compareAccountName = data.bankAccountName || data.cashAccountName
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
            <template #filter-compareAccountName>
              <el-input
                  v-model="filterInfo.query.compareAccountName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择账户信息"
              >
                <template #append>
                  <el-icon @click="selectCompareAccount"
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
            v-model:data="tableInfo.data"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :pager="false"
            :check-box="false"
            className="whitePreWrap"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
        </table-container>
        <ModifyForm no-title style="margin-top: 10px;" :form-info="extraFormInfo" />
      </div>
    </div>

    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
.layui-card {
  height: 100%;
  .layui-card-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    .table-container {
      flex: 1;
    }
    :deep(.order-model-formBox) {
      .flex_wrap_start_start {
        flex-wrap: nowrap;
        div.el-form-item {
          flex: 1;
          min-width: 1px;
        }
      }
    }
  }
}
</style>
