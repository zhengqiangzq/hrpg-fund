<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import DetailList from './detailList.vue'
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {
  cancelSignPaymentAndSettlement, exportPaymentAndSettlement,
  pagePaymentAndSettlement,
  signPaymentAndSettlement
} from "@/api/directlyConnectBankAndHospital/paymentAndSettlement";
import {DetailPage, DetailPageName} from '@/views/detailPage'

const props = defineProps({
  orderNo: null
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'paymentAndSettlement'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pagePaymentAndSettlement,
  sign: signPaymentAndSettlement,
  cancelSign: cancelSignPaymentAndSettlement,
  export: exportPaymentAndSettlement,
}

const {
  exportData,
} = useUpload(API)

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD 00:00:00')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD 23:59:59')}`

const filterInfo = reactive({
  query: {
    timeStart: defaultDate1,
    timeEnd: defaultDate2,
    orderNo: props.orderNo
  },
  copyQuery: {},
  list: [
    { label: '业务开始日期', value: 'timeStart', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '业务结束日期', value: 'timeEnd', type: 'date', valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '单据号', value: 'orderNo', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot', event: getList },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot', event: getList },
    { label: '经办人', value: 'createUserName', showLabel: true, type: 'slot', event: getList },
    { label: '职能部门', value: 'createUserDeptName', showLabel: true, type: 'slot', event: getList },
    { label: '签字状态', value: 'signStatus', type: 'select-model', code: 'funds_sign_status', event: getList },
    { label: '结算状态', value: 'settlementStatus', type: 'select-model', code: 'funds_settle_status', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '签字', show: proxy.$permission(`${PERMISSION_CODE}:sign`), event: () => signData(), },
    { type: 'button', label: '取消签字', show: proxy.$permission(`${PERMISSION_CODE}:sign`), event: () => cancelSignData(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '单据号', value: 'orderNo', width: 155, type: 'slot' },
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
    { label: '经办人', value: 'createUserName' },
    { label: '职能部门', value: 'createUserDeptName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '是否网银', value: 'netPayName' },
    { label: '附件张数', value: 'attachCount' },
    { label: '网银开通状态', value: 'netBankOpenStatusName' },
    { label: '收付类型', value: 'typeValue' },
    { label: '付款金额', value: 'money', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.money) },
    { label: '签字人', value: 'signUserName' },
    { label: '签字日期', value: 'signTime' },
    { label: '结算状态', value: 'settlementStatusValue' },
    { label: '结算人', value: 'settlementUserName' },
    { label: '结算日期', value: 'settlementTime', align: 'center', formatter: (val) => moment(val.settlementTime).format('YYYY-MM-DD') },
    { label: '单据状态', value: 'statusValue' },
    { label: '创建日期', value: 'createTime' },
    { label: '备注', value: 'remark' },
  ],
  data: [],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '签字',
        show: proxy.$permission(`${PERMISSION_CODE}:sign`),
        event: signData,
        ifRender: (row) => row.signStatus == 1 && row.settlementStatus == 1
      },
      {
        label: '取消签字',
        show: proxy.$permission(`${PERMISSION_CODE}:sign`),
        event: cancelSignData,
        ifRender: (row) => row.signStatus == 2 && row.settlementStatus == 1
      },
    ]
  },
  sectionRows: []
})
const detailsInfo = reactive({
  visible: false,
  title: '',
  id: null
})
const detailListInfo = reactive({
  visible: false
})
const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const signBtn = btns.find(btn => btn.label === '签字'),
      cancelSignBtn = btns.find(btn => btn.label === '取消签字')
  signBtn.disabled = !rows.length || !!rows.find(it => it.signStatus != 1)
  cancelSignBtn.disabled = !rows.length || !!rows.find(it => it.signStatus == 1)
}, { immediate: true })

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    bankAccountName: undefined,
    cashAccountName: undefined,
    createUserName: undefined,
    createUserDeptName: undefined,
    settlementMethodName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    timeStart: defaultDate1,
    timeEnd: defaultDate2,}
  getList()
}

function detail(row) {
  detailsInfo.id = row.id
  detailsInfo.component = DetailPage[row.orderType]
  detailsInfo.title = DetailPageName[row.orderType]
  detailsInfo.visible = true
}

function signData(row) {
  const rows = row ? [row] : tableInfo.sectionRows
  if (rows.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.sign(rows.map(it => ({ id: it.id, orderType: it.orderType }))).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('保存成功')
        getList()
      }
    })
  })
}
function cancelSignData(row) {
  const rows = row ? [row] : tableInfo.sectionRows
  if (rows.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.cancelSign(rows.map(it => ({ id: it.id, orderType: it.orderType }))).then(({ code }) => {
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

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.bankAccountId = data.bankAccountId
    filterInfo.query.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}
function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.cashAccountId = data.cashAccountId
    filterInfo.query.cashAccountName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectSettlementMethod() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.settlementMethod = data.id
    filterInfo.query.settlementMethodName = data.name
  }
  selectorInfo.visible = true
}
function selectCreateUser() {
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
function selectdeptUser() {
  selectorInfo.type = 'dept'
  selectorInfo.query = {

  }
  selectorInfo.callback = (data) => {
    filterInfo.query.createUserDeptId = data.id
    filterInfo.query.createUserDeptName = data.name
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-if="!detailListInfo.visible && !detailsInfo.visible">
        <div class="layui-card-body">
          <div class="titleTab">
            <div class="tab currentTab">列表页</div>
            <div class="tab otherTab" @click="detailListInfo.visible = true">明细页</div>
          </div>
          <div>
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
                <template #filter-cashAccountName>
                  <el-input
                      v-model="filterInfo.query.cashAccountName"
                      style="width: 100%"
                      class="not-mongolia"
                      type="input"
                      :required="true"
                      :disabled="true"
                      placeholder="请选择现金账户"
                  >
                    <template #append>
                      <el-icon @click="selectCashAccount"
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
                      placeholder="请选择经办人"
                  >
                    <template #append>
                      <el-icon @click="selectCreateUser"
                      ><Search
                      /></el-icon>
                    </template>
                  </el-input>
                </template>
                <template #filter-createUserDeptName>
                  <el-input
                      v-model="filterInfo.query.createUserDeptName"
                      style="width: 100%"
                      class="not-mongolia"
                      type="input"
                      :required="true"
                      :disabled="true"
                      placeholder="请选择职能部门"
                  >
                    <template #append>
                      <el-icon @click="selectdeptUser"
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
                :field-list="tableInfo.fieldList"
                :handle="tableInfo.handle"
                @handleEvent="tableHandler"
            >
              <template #col-orderNo="{ row }">
                <span class="slip-edit" @click="detail(row)">{{ row.orderNo }}</span>
              </template>
            </table-container>
          </div>
        </div>
      </div>
      <component
          :is="detailsInfo.component"
          v-if="detailsInfo.visible"
          :title="detailsInfo.title"
          :id="detailsInfo.id"
          v-model:visible="detailsInfo.visible"
          @returnBack="getList"
      ></component>
      <DetailList
          v-if="detailListInfo.visible"
          v-model:visible="detailListInfo.visible"
          @callback="getList"
      ></DetailList>
      <select-data ref="selectorRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
.layui-card {
  background-color: transparent;
  .layui-card-body {
    padding: 0;
  }
}
</style>
