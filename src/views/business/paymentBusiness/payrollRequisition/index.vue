<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  allPayrollRequisitionDetail,
  cancelPayrollRequisition, confirmPayrollRequisition,
  exportPayrollRequisition,
  pagePayrollRequisition
} from "@/api/business/payrollRequisition";
import BusinessPayStatementModify from '../businessPaymentStatement/modify.vue'
import PayrollStatementModify from '../payrollStatement/modify.vue'
import BusinessPayStatementDetail from '../businessPaymentStatement/details.vue'
import PayrollStatementDetail from '../payrollStatement/details.vue'
import {pageBusinessPaymentStatement} from "@/api/business/businessPaymentStatement";
import {pagePayrollStatement} from "@/api/business/payrollStatement";
import {requiredPageFilter} from "@/utils";
import {jumpToDetails} from "@/hooks/jumpDetails";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'payrollRequisition'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pagePayrollRequisition,
  detail: allPayrollRequisitionDetail,
  confirm: confirmPayrollRequisition,
  cancel: cancelPayrollRequisition,
  export: exportPayrollRequisition,
}

const BuildOrderComponents = {
  '2': BusinessPayStatementModify,
  '3': BusinessPayStatementModify,
  '4': PayrollStatementModify,
}

const DetailOrderComponents = {
  '2': BusinessPayStatementDetail,
  '3': BusinessPayStatementDetail,
  '4': PayrollStatementDetail,
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    orderTimeEqAndGre: defaultDate1,
    orderTimeEqAndLes: defaultDate2,
  },
  copyQuery: {

  },
  options: {
    payStatus: [{ key: '未生成', value: '1' }, { key: '已生成', value: '2' }]
  },
  list: [
    { label: '业务开始日期', value: 'orderTimeEqAndGre', required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'orderTimeEqAndLes', required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务单号', value: 'orderNoLike', type: 'input' },
    { label: '业务来源', value: 'businessSource', type: 'select-model', code: 'funds_business_type', onlyShowOption: ['2', '3', '4'], event: getList },
    { label: '业务类型', value: 'businessTypeLike', type: 'input' },
    { label: '交易对象类型', value: 'tradeType', type: 'select-model', code: 'funds_trade_type', onlyShowOption: ['1', '2', '3'], event: () => {
        filterInfo.query.tradeObjectId = ''
        filterInfo.query.tradeObjectName = ''
      }
    },
    { label: '交易对象', value: 'tradeObjectName', showLabel: true, type: 'slot' },
    { label: '发票号', value: 'invoiceNumLike', type: 'input' },
    { label: '创建人', value: 'createUserName', showLabel: true, type: 'slot' },
    { label: '生成状态', value: 'useStatus', type: 'select', list: 'payStatus' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '生成结算单', show: proxy.$permission(`${PERMISSION_CODE}:create`), event: () => buildOrderData(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '业务单号', width: 175, value: 'orderNo', type: 'slot' },
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
    { label: '业务来源', value: 'businessSourceValue' },
    { label: '业务类型', value: 'businessType' },
    { label: '发票号', value: 'invoiceNum' },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '总金额', value: 'money', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.money) },
    { label: '结算单号', width: 155, value: 'businessOrderNo', type: 'slot' },
    { label: '结算状态', value: 'settlementStatusValue' },
    { label: '生成状态', value: 'useStatusValue' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: null,
  sectionRows: []
})

const filterRef = ref()

const buildOrderInfo = ref({
  visible: false
})
const detailOrderInfo = ref({
  visible: false
})

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const createBtn = btns.find(btn => btn.label === '生成结算单')
  const val = rows.reduce((prev, cur) => {
    if (prev.includes(cur.businessSource)) {
      return prev
    }
    return prev.concat([cur.businessSource])
  }, [])
  const use = rows.filter(it => it.useStatus === '2')
  const flag = val.includes('4') && val.some(v => v !== '4')
  const pels = hasDifference(rows)
  createBtn.disabled = !rows.length || use.length > 0 || flag || pels
}, { immediate: true })

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function hasDifference(selected) {
  if (selected.length <= 1) return false  // 0或1条，天然相同，返回false

  const first = selected[0]
  return !selected.every(item =>
      item.tradeType === first.tradeType &&
      item.tradeObjectId === first.tradeObjectId
  )
}

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  const time1 = filterInfo.query.orderTimeEqAndGre;
  const time2 = filterInfo.query.orderTimeEqAndLes;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    tradeTimeEqAndGre: time1 ? time1 + ' 00:00:00' : '',
    tradeTimeEqAndLes: time2 ? time2 + ' 23:59:59' : '',
    tradeObjectName: undefined,
  })
  delete filterInfo.copyQuery.createUserName
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    orderTimeEqAndGre: defaultDate1,
    orderTimeEqAndLes: defaultDate2,
  }
  getList()
}

function detail(row) {
  jumpToDetails(row)
}

function businessOrderDetail(businessSource, orderNo) {
  const detailApi = {
    '2': pageBusinessPaymentStatement,
    '3': pageBusinessPaymentStatement,
    '4': pagePayrollStatement
  }
  detailApi[businessSource]({
    orderNo: orderNo
  }).then(({ data }) => {
    if (data.length) {
      const id = data[0].id
      detailOrderInfo.value = {
        visible: true,
        component: DetailOrderComponents[businessSource],
        id
      }
    }
  })
}

function buildOrderData() {
  const rows = tableInfo.sectionRows
  if (rows.length === 0) {
    return
  }
  const promises = rows.map(it => {
    return API.detail({
      orderId: it.id,
    })
  })
  Promise.all(promises).then(res => {
    const details = res.map(it => it.data).reduce((prev, cur) => prev.concat(cur), []).map(it => {
      return {
        ...it,
        payOutOrderDetailId: it.id,
        payOrderNo: it.orderNo,
        bankDocName: it.bankDocName,
        businessSource: it.businessSource,
        businessSourceValue: it.businessSourceValue,
        businessType: it.businessType,
        businessTypeValue: it.businessTypeValue,
        id: undefined
      }
    })
    // tableInfo.sectionRows = []
    buildOrderInfo.value = {
      visible: true,
      component: BuildOrderComponents[rows[0].businessSource],
      data: details
    }
  })
}

// 表格事件处理
const tableHandler = (eventName, raw) => {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectTradeObject() {
  selectorInfo.type = ['', 'supplier', 'customer', 'staff', 'outsideStaff', ''][filterInfo.query.tradeType]
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.tradeObjectId = data.id
    filterInfo.query.tradeObjectName = data.name
  }
  selectorInfo.visible = true
}


function openUserList() {
  selectorInfo.title = '创建人'
  selectorInfo.type = 'users'
  selectorInfo.query = {
    type: "normal",
    userType: '1',
    status: undefined,
  }
  selectorInfo.callback = (row) => {
    filterInfo.query["createUserName"] = row.name;
    filterInfo.query["createUser"] = row.id;
  }
  selectorInfo.visible = true
}

</script>

<template>
  <div className="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-show="!buildOrderInfo.visible && !detailOrderInfo.visible">
        <div class="layui-card-body">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :listTypeInfo="filterInfo.options"
                :filter-btn="filterInfo.filterbtn"
            >
              <template #filter-tradeObjectName>
                <el-input
                    v-model="filterInfo.query.tradeObjectName"
                    style="width: 100%"
                    :class="{ 'not-mongolia': !!filterInfo.query.tradeType }"
                    type="input"
                    :required="true"
                    :disabled="true"
                    placeholder="请选择交易对象"
                >
                  <template #append v-if="!!filterInfo.query.tradeType">
                    <el-icon @click="selectTradeObject"
                    ><Search
                    /></el-icon>
                  </template>
                </el-input>
              </template>
              <template #filter-createUserName>
                <el-input
                    v-model="filterInfo.query.createUserName"
                    style="width: 100%"
                    type="input"
                    placeholder="请选择操作人"
                >
                  <template #append>
                    <el-icon @click="openUserList"
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
            <template #col-orderNo="{ row }">
              <span class="slip-edit" @click="detail(row)">{{ row.orderNo }}</span>
            </template>
            <template #col-businessOrderNo="{ row }">
              <template v-for="(businessOrderNo, index) in row.businessOrderNo?.split(',')" :key="businessOrderNo">
                <span class="slip-edit" @click="businessOrderDetail(row.businessSource, businessOrderNo)">{{ businessOrderNo }}</span>
                <template v-if="index + 1 < row.businessOrderNo?.split(',').length">,</template>
              </template>
            </template>
          </table-container>
        </div>
      </div>
      <select-data ref="selectorRef" />
      <component title="新增结算单" v-if="buildOrderInfo.visible" v-model:visible="buildOrderInfo.visible" @returnModify="getList" :is="buildOrderInfo.component" :from-build="buildOrderInfo.data" />
      <component title="结算单详情" v-if="detailOrderInfo.visible" v-model:visible="detailOrderInfo.visible" @returnModify="getList" :is="detailOrderInfo.component" :id="detailOrderInfo.id" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
