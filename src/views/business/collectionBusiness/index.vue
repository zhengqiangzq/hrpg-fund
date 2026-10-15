<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import Modify from './modify.vue'
import DetailList from './detailList.vue'
import Details from './details.vue'
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {pageCollectionBusiness, exportCollectionBusiness, deleteCollectionBusiness, cancelCollectionBusiness, confirmCollectionBusiness} from "@/api/business/collectionBusiness";
import {useSelectData} from "@/hooks/useSelectData";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";
import {requiredPageFilter} from "@/utils";

const props = defineProps({
  orderNo: null
})

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'collectionBusiness'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageCollectionBusiness,
  delete: deleteCollectionBusiness,
  confirm: confirmCollectionBusiness,
  cancel: cancelCollectionBusiness,
  export: exportCollectionBusiness,
  download: exportTemplateExcel,
}

const defaultDate1 = `${moment().startOf('month').format('YYYY-MM-DD')}`
const defaultDate2 = `${moment().endOf('month').format('YYYY-MM-DD')}`

const {
  exportData,
  downloadTemplate
} = useUpload(API, '收款业务导入模板', '/business/collectionOrder/import/excel', () => getList(), 'collectionBusiness:import')

const { uploadExcelBtns } = useUploadExcel({
  PERMISSION_CODE: PERMISSION_CODE,
  type: '14003',
  action: '/business/collectionOrder/import/excelRecord'
})

const filterInfo = reactive({
  query: {
    orderTimeEqAndGre: defaultDate1,
    orderTimeEqAndLes: defaultDate2,
    orderNoLike: props.orderNo
  },
  copyQuery: {},
  options: {
    compareStatus: [
      { key: '已确认', value: '1' },
      { key: '未确认', value: '0' },
    ],
  },
  list: [
    { label: '业务开始日期', value: 'orderTimeEqAndGre', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '业务结束日期', value: 'orderTimeEqAndLes', type: 'date', required: true, valueFormat: 'YYYY-MM-DD' },
    { label: '单据号', value: 'orderNoLike', type: 'input' },
    { label: '结算方式', value: 'settlementMethodName', showLabel: true, type: 'slot', event: getList },
    { label: '银行账户', value: 'bankAccountName', showLabel: true, type: 'slot', event: getList },
    { label: '现金账户', value: 'cashAccountName', showLabel: true, type: 'slot', event: getList },
    { label: '单据状态', value: 'confirmStatus', type: 'select', list: 'compareStatus', event: getList },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => confirmData(), },
    { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => cancelData(), },
    { type: 'button', label: '下载模板', show: proxy.$permission(`${PERMISSION_CODE}:download`), event: () => downloadTemplate(undefined, 'collectionBusiness:download'), },
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
    { label: '业务日期', value: 'orderTime', align: 'center', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },

    { label: '银行账户', value: 'bankAccountName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '收付类型', value: 'typeValue' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '收款金额', value: 'money', align: 'right' },
    { label: '备注', value: 'remark' },
    { label: '单据状态', value: 'confirmStatusValue' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
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
        ifRender: (row) => row.confirmStatus !== '1'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.confirmStatus !== '1'
      },
      {
        label: '确认',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: confirmData,
        ifRender: (row) => row.confirmStatus !== '1'
      },
      {
        label: '取消确认',
        show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
        event: cancelData,
        ifRender: (row) => row.confirmStatus === '1'
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '收款业务',
  visible: false
})
const detailsInfo = reactive({
  visible: false,
  title: '收款业务详情',
  id: null
})
const detailListInfo = reactive({
  visible: false
})
const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除'),
      confirmBtn = btns.find(btn => btn.label === '确认'),
      cancelBtn = btns.find(btn => btn.label === '取消确认')
  confirmBtn.disabled = !rows.length || !!rows.find(it => it.confirmStatus === '1')
  cancelBtn.disabled = !rows.length || !!rows.find(it => it.confirmStatus !== '1')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.confirmStatus === '1')
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

function confirmData(rows) {
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
    API.confirm(ids).then(({ code, data }) => {
      if(code === 200) {
        if(!data) {
          proxy.$message.success('提交成功')
        } else {
          proxy.$message.warning(data)
        }
      }
      getList()
    })
  })
}
function cancelData(rows) {
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
    API.cancel(ids).then(({ code, data }) => {
      if(code === 200) {
        if(!data) {
          proxy.$message.success('提交成功')
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
    bankAccountName: undefined,
    cashAccountName: undefined,
    settlementMethodName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.id = row?.id
  modifyInfo.title = row ? '修改收款业务' : "新增收款业务"
  modifyInfo.visible = true
}

function detail(row) {
  detailsInfo.id = row.id
  detailsInfo.visible = true
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
</script>

<template>
  <div class="app-container">
    <div class="app-container-flex">
    <div class="layui-card layui-col-md12" v-show="!modifyInfo.visible && !detailListInfo.visible && !detailsInfo.visible">
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
                :listTypeInfo="filterInfo.options"
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
