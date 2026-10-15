<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import Modify from './modify.vue'
import Details from './details.vue'
import moment from "moment";
import {useSelectData} from "@/hooks/useSelectData";
import {getBusinessKeyById} from "@/api/flowable";
import {
  approvedBankTransfer,
  deleteBankTransfer, exportBankTransfer, invalidBankTransfer,
  pageBankTransfer, refuseBankTransfer, rejectBankTransfer,
  revokeBankTransfer,
  submitBankTransfer
} from "@/api/business/bankTransfer";
import store from "@/store";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {requiredPageFilter} from "@/utils";

const props = defineProps({
  orderNo: null
})
const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'bankTransfer'
const BUSINESS_TYPE = 'fundsBankOrder'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageBankTransfer,
  delete: deleteBankTransfer,
  submit: submitBankTransfer,
  revoke: revokeBankTransfer,
  invalid: invalidBankTransfer,
  approved: approvedBankTransfer,
  reject: rejectBankTransfer,
  refuse: refuseBankTransfer,
  export: exportBankTransfer,
}
// 流程系统配置
const APPROVAL = String(
    store.state.permission.systemConfig.fund_bank_order_audit_type
)


const {
  exportData,
  downloadTemplate
} = useUpload(API, 'bankTransferImportTemplate', '/business/bankOrder/import/excel', () => getList(), `${PERMISSION_CODE}:import`)

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14011',
  action: '/business/bankOrder/import/excelRecord'
})

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const filterInfo = reactive({
  query: {
    orderTimeEqAndGre: defaultDate1,
    orderTimeEqAndLes: defaultDate2,
    orderNoLike: props.orderNo
  },
  copyQuery: {},
  list: [
    { label: '业务开始日期', value: 'orderTimeEqAndGre', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'orderTimeEqAndLes', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'orderNoLike', type: 'input' },
    { label: '转出账户', value: 'bankAccountOutName', showLabel: true, type: 'slot', event: getList },
    { label: '转入账户', value: 'bankAccountInName', showLabel: true, type: 'slot', event: getList },
    { label: '经办人', value: 'createUserName', showLabel: true, type: 'slot', event: getList },
    { label: '单据状态', value: 'status', type: 'select-model', code: 'funds_order_status', event: getList },
    { label: '结算状态', value: 'settlementStatus', type: 'select-model', code: 'funds_settle_status', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate('银行划款导入模板', 'bankTransfer:download'), },
    ...uploadExcelBtns,
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '单据号', value: 'orderNo', width: 155, type: 'slot' },
    { label: '业务日期', value: 'orderTime', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
    { label: '经办人', value: 'createUserName' },
    { label: '职能部门', value: 'createUserDeptName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '是否网银', value: 'netPayName' },
    { label: '转出银行账户', value: 'bankAccountOutName' },
    { label: '网银开通状态', value: 'netBankOpenStatusName' },
    // { label: '转出银行账号', value: 'bankAccountOutNum' },
    { label: '转入银行账户', value: 'bankAccountInName' },
    // { label: '转入银行账号', value: 'bankAccountInNum' },
    { label: '转账金额', value: 'money', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.money) },
    { label: '附件张数', value: 'attachCount' },
    { label: '备注', value: 'remark' },
    { label: '单据状态', value: 'statusValue' },
    { label: '结算状态', value: 'settlementStatusValue' },
    { label: '创建日期', value: 'createTime', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
    { label: '支付状态', value: 'payStatusValue' },
    { label: '支付日期', value: 'payTime', formatter: (val) => moment(val.payTime).format('YYYY-MM-DD') },
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
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
        ifRender: (row) => row.status === '1' || row.status === '4'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '1' || row.status === '4'
      },
      {
        label: '提交',
        show: proxy.$permission(`${PERMISSION_CODE}:submit`),
        event: submitData,
        ifRender: (row) => row.status === '1' || row.status === '4'
      },
      {
        label: '批准',
        show: proxy.$permission(`${PERMISSION_CODE}:approved`),
        event: (row) => approved(row),
        ifRender: checkIfRenderBtnFlow,
      },
      {
        label: '撤回',
        show: proxy.$permission(`${PERMISSION_CODE}:revoke`),
        event: revokeData,
        ifRender: (row) => row.status === '2'
      },
      {
        label: '拒绝',
        show: proxy.$permission(`${PERMISSION_CODE}:refuse`),
        event: (row) => refuse(row),
        ifRender: checkIfRenderBtnFlow,
      },
      {
        label: '驳回',
        show: proxy.$permission(`${PERMISSION_CODE}:reject`),
        event: (row) => reject(row),
        ifRender: checkIfRenderBtnFlow,
      },
      {
        label: '作废',
        show: proxy.$permission(`${PERMISSION_CODE}:invalid`),
        event: invalidData,
        ifRender: (row) => row.status === '5' && row.settlementStatus === '1'
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '银行划款',
  visible: false
})
const detailsInfo = reactive({
  visible: false,
  title: '银行划款详情',
  id: null
})
const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status != 1)
}, { immediate: true })

watch(
    () => proxy.$router.currentRoute.value.name,
    (to, from) => {
      if (to === PERMISSION_CODE) {
        getList()
      }
      if (!from) return
      if (
          from.includes('myPendingDetail') ||
          from.includes('myFinishedDetail') ||
          from.includes('myApplyDetail')
      ) {
        getList()
      }
    },
    {
      deep: true,
    }
)

const { selectorInfo, selectorRef } = useSelectData()

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function submitData(row) {
  let from = {
    flowTaskCommentDto: { approvalType: 'submit' },
    processDefinitionKey: BUSINESS_TYPE,
    orderId: row.id,
  }
  API.submit(from).then(({ code, data }) => {
    if (code === 200) {
      if(!data) {
        proxy.$message.success('提交成功')
      } else {
        proxy.$message.warning(data)
      }
      getList()
    }
  })
}

// 批准
function approved(row = undefined) {
  let params = {
    orderId: row.id,
  }
  API.approved(params).then(({ code, data }) => {
    if (code === 200) {
      if(data) {
        proxy.$message.warning(data)
      }
      getList()
    }
  })
}
function revokeData(row) {
  API.revoke([row.id]).then(({ code, data }) => {
    if (code === 200) {
      if(!data) {
        proxy.$message.success('撤回成功')
      } else {
        proxy.$message.warning(data)
      }
      getList()
    }
  })
}
function invalidData(rows) {
  const ids = rows ? [rows.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.invalid(ids).then(({ code, data }) => {
      if (code === 200) {
        if(!data) {
          proxy.$message.success('作废成功')
        } else {
          proxy.$message.warning(data)
        }
        getList()
      }
    })
  })
}

// 查询
function getList() {
  const required = requiredPageFilter(filterInfo.list, filterInfo.query)
  if(!required) return;
  const time1 = filterInfo.query.orderTimeEqAndGre;
  const time2 = filterInfo.query.orderTimeEqAndLes;
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
    orderTimeEqAndGre: time1 ? time1 + ' 00:00:00' : '',
    orderTimeEqAndLes: time2 ? time2 + ' 23:59:59' : '',
    orderTime: undefined,
    createUserName: undefined,
    bankAccountInName: undefined,
    bankAccountOutName: undefined,
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    orderTimeEqAndGre: defaultDate1,
    orderTimeEqAndLes: defaultDate2,}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = row ? '修改银行划款' : "新增银行划款"
  modifyInfo.visible = true
}
const localPermission = computed(() => {
  return APPROVAL === undefined
})
// 批准/驳回/拒绝 按钮展示
function checkIfRenderBtnFlow(row) {
  return (
      (localPermission.value || APPROVAL === '1') &&
      row.status === '2'
  )
}

function detail(row) {
  getBusinessKeyById({
    businessKey: row.orderNo,
    businessType: BUSINESS_TYPE,
  }).then((res) => {
    if (res.success) {
      sessionStorage.setItem('storeRowId', row.id)
      if (res.data?.processInstanceId) {
        proxy.$fn.setFlowData({
          item: res.data,
          view: '',
          route: proxy.$route,
          systemCode: '/funds',
        })
      } else {
        detailsInfo.id = row.id
        detailsInfo.visible = true
      }
    }
  })
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

function selectBankAccount(mark) {
  selectorInfo.type = 'bankAccount'
  selectorInfo.title = mark === 'out' ? '转出账户' : '转入账户'
  selectorInfo.callback = (data) => {
    if (mark === 'in') {
      filterInfo.query.bankAccountInId = data.bankAccountId
      filterInfo.query.bankAccountInName = data.bankAccountName
    } else {
      filterInfo.query.bankAccountOutId = data.bankAccountId
      filterInfo.query.bankAccountOutName = data.bankAccountName
    }
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

function refuse(row = undefined) {
  btnFlow(row, 'refuse')
}

function reject(row = undefined) {
  btnFlow(row, 'reject')
}

// 按钮审批原因弹窗
function btnFlow(row, code) {
  let currentBtnFlow = {
    title: '',
    api: null,
  }
  if (code === 'reject') {
    currentBtnFlow.title = '驳回'
    currentBtnFlow.api = API.reject
  } else if (code === 'refuse') {
    currentBtnFlow.title = '拒绝'
    currentBtnFlow.api = API.refuse
  }
  proxy
      .$prompt('请输入' + currentBtnFlow.title + '理由', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: proxy.$fn.maxString200,
        inputErrorMessage: currentBtnFlow.title + '理由不能超过200字符',
      })
      .then(({ value }) => {
        const data = {
          orderId: row.id,
          checkOpt: value,
          processDefinitionKey: BUSINESS_TYPE,
          flowTaskCommentDto: { approvalType: code },
        }
        currentBtnFlow.api(data).then((resp) => {
          if (resp && resp.success) {
            getList()
          }
        })
      })

}

</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailsInfo.visible">
      <div class="layui-card-body">
        <div class="filter-wrapper">
          <NewPageFilter
              ref="filterRef"
              v-model:query="filterInfo.query"
              :filter-list="filterInfo.list"
              :filter-btn="filterInfo.filterbtn"
          >
            <template #filter-bankAccountInName>
              <el-input
                  v-model="filterInfo.query.bankAccountInName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择转入账户"
              >
                <template #append>
                  <el-icon @click="selectBankAccount('in')"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #filter-bankAccountOutName>
              <el-input
                  v-model="filterInfo.query.bankAccountOutName"
                  style="width: 100%"
                  class="not-mongolia"
                  type="input"
                  :required="true"
                  :disabled="true"
                  placeholder="请选择转出账户"
              >
                <template #append>
                  <el-icon @click="selectBankAccount('out')"
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
    <Modify
        v-if="modifyInfo.visible"
        v-model:visible="modifyInfo.visible"
        :id="modifyInfo.id"
        :batch="modifyInfo.batch"
        :title="modifyInfo.title"
        @returnModify="getList"
    />
    <Details
        v-if="detailsInfo.visible"
        :title="detailsInfo.title"
        :id="detailsInfo.id"
        v-model:visible="detailsInfo.visible"
        @returnBack="getList"
    ></Details>
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
