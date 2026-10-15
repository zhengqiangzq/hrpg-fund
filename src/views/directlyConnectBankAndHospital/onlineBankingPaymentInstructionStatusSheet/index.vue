<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {DetailPage, DetailPageName} from '@/views/detailPage'
import {
  exportOnlinePayment,
  pageOnlinePayment,
} from "@/api/directlyConnectBankAndHospital/onlinePayment";
import {requiredPageFilter} from "@/utils";
import {useDownloadLog} from "@/components/DownloadLog/useDownloadLog";
import {
  confirmBankingPaymentInstructionStatusSheet,
  downloadOnlineBankingPaymentInstructionStatusSheet
} from "@/api/directlyConnectBankAndHospital/onlineBankingPaymentInstructionStatusSheet";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";

const props = defineProps({
  orderNo: null
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'onlineBankingPaymentInstructionStatusSheet'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageOnlinePayment,
  download: downloadOnlineBankingPaymentInstructionStatusSheet,
  confirm: confirmBankingPaymentInstructionStatusSheet,
  export: exportOnlinePayment,
}
const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`


const {
  exportData,
} = useUpload(API)

const filterInfo = reactive({
  query: {
    tradeTimeStart: defaultDate1,
    tradeTimeEnd: defaultDate2,
    orderNo: props.orderNo,
    payStatus: '3'
  },
  copyQuery: {},
  listType: {
    proxyList: [{ key: '代发工资', value: '1' }, { key: '代发奖金', value: '2' }, { key: '其他代发', value: '3' }],
    orderList: [{ key: '业务结算单', value: '4202' }, { key: '薪资结算单', value: '4203' }, { key: '银行划款', value: '4205' }],
  },
  list: [
    { label: '业务开始日期', value: 'tradeTimeStart', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '业务结束日期', value: 'tradeTimeEnd', type: 'date', required: true, valueFormat: 'YYYY-MM-DD 23:59:59' },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot', required: true, event: getList },
    { label: '单据类型', value: 'orderType', type: 'select', list: 'orderList', required: true },
    { label: '支付状态', value: 'payStatus', type: 'select-model', code: 'funds_pay_status', onlyShowOption: ['3', '4'] },
    { label: '代发类型', value: 'proxyPayType', type: 'select', list: 'proxyList' },
    { label: '收支项目', value: 'itemName', showLabel: true, type: 'slot' },
    { label: '业务单号', value: 'orderNo', type: 'input' },
    { label: '交易对象户名', value: 'tradeObjectName', type: 'input' },
    { label: '交易流水号', value: 'transSerialNum', type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '状态确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), disabled: computed(() => !tableInfo.sectionRows.length), event: () => confirmData(),
    },
    { type: 'button', label: '支付状态下载', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadData(), },
    { type: 'button', label: '下载日志', show: proxy.$permission(`${PERMISSION_CODE}:downlog`), event: () => openDownloadLog(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData({
        ...filterInfo.copyQuery,
        entrance: 'payStatus'
      }), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '业务单号', value: 'orderNo', width: 155, type: 'slot' },
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
    { label: '交易流水号', value: 'transSerialNum' },
    { label: '支付状态', value: 'payStatusValue' },
    { label: '支付日期', value: 'payTimeStr', align: 'center' },
    { label: '业务来源', value: 'businessSourceValue' },
    { label: '业务类型', value: 'businessTypeValue' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '收付类型', value: 'typeValue' },
    { label: '代发类型', value: 'proxyPayTypeName' },
    { label: '收支项目', value: 'itemName' },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '卡类型', value: 'staffCardTypeValue' },
    { label: '身份证号', value: 'idCard' },
    { label: '任职科室', value: 'deptName' },
    { label: '交易对象银行类别', value: 'bankDocTypeName' },
    { label: '交易对象开户行', value: 'bankDocName' },
    { label: '交易对象联行号', value: 'interBankNum' },
    { label: '交易对象户名', value: 'tradeBankAccountName' },
    { label: '交易对象银行账号', value: 'accNum' },
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
        label: '状态确认',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: confirmData,
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
const filterRef = ref()

const confirmInfo = reactive({
  title: '状态确认',
  width: '400px',
  refObj: null,
  fieldList: [
    { label: '支付状态', value: 'payStatus', type: 'select-model', code: 'funds_pay_status', onlyShowOption: ['1', '3'] },
  ],
  rules: {
    payStatus: [{ required: true, message: '请选择支付状态' }],
  },
  row: {},
  btList: [
    { type: 'button', show: true, label: '取消', event: () => confirmInfo.visible = false},
    { label: '确定', type: 'primary', event: () => {
        confirmInfo.refObj.validate(flag => {
          if (flag) {
            API.confirm(confirmInfo.row).then(({ success }) => {
              if (success) {
                proxy.$message.success('操作成功')
                confirmInfo.visible = false
                getList()
              }
            })
          }
        })
      }
    }
  ]
})

const { selectorInfo, selectorRef } = useSelectData()
const { openDownloadLog } = useDownloadLog('bmp_pay_status')

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
    payStatus: '3',
    tradeTimeStart: defaultDate1,
    tradeTimeEnd: defaultDate2,
  }
  getList()
}


function detail(row) {
  detailsInfo.id = row.orderId
  detailsInfo.component = DetailPage[row.orderType]
  detailsInfo.title = DetailPageName[row.orderType]
  detailsInfo.visible = true
}

function confirmData(row) {
  const rows = row ? [row] : tableInfo.sectionRows
  if (rows.length === 0) {
    return
  }
  confirmInfo.row = {
    orderType: rows[0].orderType,
    ids: rows.map(it => it.id)
  }
  confirmInfo.visible = true
}

function downloadData() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  API.download({
    tradeTimeStart: filterInfo.query.tradeTimeStart,
    tradeTimeEnd: filterInfo.query.tradeTimeEnd,
    accountId: filterInfo.query.bankAccountId,
    orderType: filterInfo.query.orderType
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

function selectItem() {
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    filterInfo.query.itemId = data.id
    filterInfo.query.itemName = data.name
  }
  selectorInfo.visible = true
}
function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    filterInfo.query.bankAccountId = data.bankAccountId
    filterInfo.query.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
      <div class="layui-card layui-col-md12" v-show="!detailsInfo.visible">
        <div class="layui-card-body">
          <div class="filter-wrapper">
            <NewPageFilter
                ref="filterRef"
                v-model:query="filterInfo.query"
                :filter-list="filterInfo.list"
                :filter-btn="filterInfo.filterbtn"
                :listTypeInfo="filterInfo.listType"
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
              <template #filter-itemName>
                <el-input
                    v-model="filterInfo.query.itemName"
                    style="width: 100%"
                    class="not-mongolia"
                    type="input"
                    :required="true"
                    :disabled="true"
                    placeholder="请选择收支项目"
                >
                  <template #append>
                    <el-icon @click="selectItem"
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
            <template #col-orderNo="{ row }">
              <span class="slip-edit" @click="detail(row)">{{ row.orderNo }}</span>
            </template>
          </table-container>
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
      <ModifyFormDialog :dialogInfo="confirmInfo">
      </ModifyFormDialog>
      <select-data ref="selectorRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
