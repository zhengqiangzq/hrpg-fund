<template>
  <div class="checkBox">
    <page-dialog
        v-if="state.dialogVisible"
        :title="title"
        v-model:visible="state.dialogVisible"
        :width="state.width"
        marginTop="10vh"
        :bt-list="state.btList"
        @reset="cancel"
    >
      <NewPageFilter
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
        <DialogTable
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :pager="true"
            :api="tableInfo.api"
            :tabIndex="true"
            :check-box="true"
            :query="filterInfo.copyQuery"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            :isDynamic="false"
            @handleEvent="tableHandler"
        >
        </DialogTable>
    </page-dialog>
    <select-data ref="selectorRef" />
  </div>
</template>
<script setup name="vehicleAddEdit">
import {useStorage} from "@vueuse/core";
import moment from "moment";
import cloneDeep from "lodash/cloneDeep";
import PageDialog from "@/components/PageDialog/index.vue";
import DialogTable from "@/components/DialogTable/index.vue";
import {useSelectData} from "@/hooks/useSelectData";
import {deepClone, requiredPageFilter} from "@/utils";
import {pagePayrollRequisition} from "@/api/business/payrollRequisition";
import {fundsPlanPrepareOrder} from "@/api/fundPlan/planPreparation";

const setting = useStorage('setting', {}, sessionStorage)
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()
const state = reactive({
  ref: null,
  width: '90%',
  dialogVisible: false,
  btList: [
    { label: '取消', event: cancel, show: true },
    {
      label: '确定',
      type: 'primary',
      event: userUpdate,
      show: true,
    },
  ],
})

const { selectorInfo, selectorRef } = useSelectData()

const emit = defineEmits()

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    orderTimeEqAndGre: defaultDate1,
    orderTimeEqAndLes: defaultDate2,
  },
  options: {
    payStatus: [{ key: '未生成', value: '1' }, { key: '已生成', value: '2' }]
  },
  list: [
    { label: '业务开始日期', value: 'orderTimeEqAndGre', span: 8, required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'orderTimeEqAndLes', span: 8, required: true, type: 'date', valueFormat: 'YYYY-MM-DD' },
    { label: '业务单号', value: 'orderNoLike', span: 8, type: 'input' },
    { label: '业务类型', value: 'businessType', span: 8, type: 'select-model', code: 'funds_business_type', onlyShowOption: ['2', '3', '4'], event: getList },
    { label: '业务来源', value: 'businessSourceLike', span: 8, type: 'input' },
    { label: '交易对象类型', value: 'tradeType', span: 8, type: 'select-model', code: 'funds_trade_type', onlyShowOption: ['1', '2', '3'], event: () => {
        filterInfo.query.tradeObjectId = ''
        filterInfo.query.tradeObjectName = ''
      }
    },
    { label: '交易对象', value: 'tradeObjectName', span: 8, showLabel: true, type: 'slot' },
    { label: '发票号', value: 'invoiceNumLike', span: 8, type: 'input' },
    { label: '创建人', value: 'createUserName', span: 8, showLabel: true, type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],

})


const tableInfo = reactive({
  refresh: 1,
  initCurpage: 1,
  copyQuery: {},
  data: [],
  sectionRows: [],
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '业务单号', value: 'orderNo' },
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
    { label: '业务来源', value: 'businessSourceValue' },
    { label: '业务类型', value: 'businessType' },
    { label: '发票号', value: 'invoiceNum' },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '支付金额', value: 'money', align: 'right' },
    { label: '创建人', value: 'createUserName' },
  ],
  btnList: [
    { type: 'button', label: '查询', event: getList },
  ],
})

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      if (val) {
        getList()
      }
    },
    {
      immediate: true,
    }
)

function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  tableInfo.api = pagePayrollRequisition
  const time1 = filterInfo.query.orderTimeEqAndGre;
  const time2 = filterInfo.query.orderTimeEqAndLes;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    tradeTimeEqAndGre: time1 ? time1 + ' 00:00:00' : '',
    tradeTimeEqAndLes: time2 ? time2 + ' 23:59:59' : '',
    tradeObjectName: undefined,
    useStatus: '1'
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


function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}
function cancel() {
  state.dialogVisible = false
  emit('callback', false)
}
function userUpdate() {
  if(tableInfo.sectionRows.length === 0) return proxy.$message.warning('请勾选数据')
  fundsPlanPrepareOrder({
    businessIds: tableInfo.sectionRows.map(it => it.id),
    planItemId: props.id,
  }).then(res => {
    state.dialogVisible = false
    emit('callback', res.data)
  })
}
</script>
