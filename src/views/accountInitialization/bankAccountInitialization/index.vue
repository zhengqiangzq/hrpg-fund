<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import Modify from './modify.vue'
import {
  confirmBankAccountInitialization,
  deleteBankAccountInitialization, enableBankAccountInitialization, exportBankAccountInitialization,
  pageBankAccountInitialization
} from "@/api/accountInitialization/bankAccountInitialization";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import useUploadExcel from "@/components/UploadExcel/useUploadExcel";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'bankAccountInitialization'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageBankAccountInitialization,
  delete: deleteBankAccountInitialization,
  confirm: confirmBankAccountInitialization,
  enable: enableBankAccountInitialization,
  export: exportBankAccountInitialization,
  download: exportTemplateExcel,
}

const {
  exportData,
} = useUpload(API, '银行账户初始账导入模板', )

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    // { label: '现金账户编码', value: 'cashAccountCodeLike', type: 'input' },
    { label: '现金账户名称', value: 'cashAccountNameLike', type: 'input' },
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', btType: 'primary', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    // { type: 'button', label: '确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => confirmData(), },
    // { type: 'button', label: '取消确认', show: proxy.$permission(`${PERMISSION_CODE}:confirm`), event: () => confirmData('cancel'), },
    { type: 'button', label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(), },
    { type: 'button', label: '停用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData('disabled'), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '银行账户编码', value: 'bankAccountCode' },
    { label: '银行账户名称', value: 'bankAccountName' },
    { label: '账户类别', value: 'bankDocTypeName' },
    { label: '期初余额', value: 'openingMoney', align: 'right', formatter: (val) => proxy.$fn.TripartiteMethod(val.openingMoney) },
    { label: '备注', value: 'remark' },
    { label: '启用状态', value: 'enableStatusValue' },
    { label: '启用人', value: 'enableUserName' },
    { label: '启用日期', value: 'enableTime', align: 'center', formatter: (val) => moment(val.enableTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [
    { value: 'openingMoney', formatter: proxy.$fn.TripartiteMethod },
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
        ifRender: (row) => row.enableStatus != 1
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.enableStatus != 1
      },
      // {
      //   label: '确认',
      //   show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
      //   event: (row) => confirmData(null, row),
      //   ifRender: (row) => row.status != 1
      // },
      // {
      //   label: '取消确认',
      //   show: proxy.$permission(`${PERMISSION_CODE}:confirm`),
      //   event: (row) => confirmData('cancel', row),
      //   ifRender: (row) => row.status == 1 && row.enableStatus != 1
      // },
      {
        label: '启用',
        show: proxy.$permission(`${PERMISSION_CODE}:enable`),
        event: (row) => enableData(null, row),
        ifRender: (row) => row.enableStatus != 1
      },
      {
        label: '停用',
        show: proxy.$permission(`${PERMISSION_CODE}:enable`),
        event: (row) => enableData('disabled', row),
        ifRender: (row) => row.enableStatus == 1
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  id: null,
  title: '银行账户初始账',
  visible: false
})

const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  const enableBtn = btns.find(btn => btn.label === '启用')
  const disabledBtn = btns.find(btn => btn.label === '停用')
  enableBtn.disabled = !rows.length || !!rows.find(it => it.enableStatus == 1)
  disabledBtn.disabled = !rows.length || !!rows.find(it => it.enableStatus != 1)
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.enableStatus == 1)
}, { immediate: true })

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function confirmData(flag, data) {
  const ids = data ? [data.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.confirm(flag, ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('保存成功')
        getList()
      }
    })
  })
}
function enableData(flag, data) {
  const ids = data ? [data.id] : tableInfo.sectionRows.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.enable(flag, ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('保存成功')
        getList()
      }
    })
  })
}

// 查询
function getList() {
  filterInfo.copyQuery = cloneDeep({
    ...filterInfo.query,
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
  modifyInfo.title = row ? '修改银行账户初始账' : "新增银行账户初始账"
  modifyInfo.visible = true
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
</script>

<template>
  <div className="app-container">
    <div class="app-container-flex">
    <div class="layui-card layui-col-md12" v-if="!modifyInfo.visible">
      <div class="layui-card-body">
<!--        <div class="filter-wrapper">-->
<!--          <PageFilter-->
<!--              ref="filterRef"-->
<!--              v-model:query="filterInfo.query"-->
<!--              :filter-list="filterInfo.list"-->
<!--          >-->
<!--          </PageFilter>-->
<!--        </div>-->
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
  </div>
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
</style>
