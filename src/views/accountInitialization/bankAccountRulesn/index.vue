<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {
  accountControlRuleadd, accountControlRuleDelete, accountControlRuleExcel,
  accountControlRulePage,
  accountControlRuleUpdate
} from "@/api/accountInitialization/cashAccountRulesn";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'bankAccountRulesn'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: accountControlRulePage,
  delete: accountControlRuleDelete,
  add: accountControlRuleadd,
  update: accountControlRuleUpdate,
  export: accountControlRuleExcel,
}

const {
  exportData,
} = useUpload(API)


const filterInfo = reactive({
  query: {
    accountType: 2
  },
  copyQuery: {},
  list: [
    { label: '账户信息', showLabel: true, value: 'bankAccountName', type: 'slot' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:excel`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '银行账户编码', value: 'bankAccountCode', type: 'slot' },
    { label: '银行账户名称', value: 'bankAccountName' },
    { label: '账户类别', value: 'accountTypeName' },
    { label: '最低余额控制', value: 'miniBalanceControlName' },
    { label: '最低余额', value: 'miniAmount', align: 'right' },
    { label: '最低余额控制方案', value: 'miniBalanceControlPlanName', width: 170 },
    { label: '最高余额控制', value: 'maxBalanceControlName' },
    { label: '最高余额', value: 'maxAmount', align: 'right' },
    { label: '最高余额控制方案', value: 'maxBalanceControlPlanName', width: 170 },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime' },
  ],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '账户控制规则',
  visible: false,
  listTypeInfo: {
    control: [{ key: '提示控制', value: 1 }, { key: '严格控制', value: 2 }],
    accountList: [{ key: '银行账户', value: 1 }, { key: '银行账户', value: 2 }],
  },
  fieldList: [
    { label: '银行账户', span: 12, value: 'bankAccountName', type: 'slot' },
    { label: '账户类别', span: 12, value: 'accountType', type: 'select', disabled: true, list: 'accountList' },
    { label: '最低余额控制', span: 12, value: 'miniBalanceControl', type: 'select-model', code: 'yes_or_no' },
    { label: '最低金额', span: 12,value: 'miniAmount', type: 'money', min: -99999 },
    { label: '最低余额控制方案', span: 12, value: 'miniBalanceControlPlan', type: 'select', list: 'control' },
    { label: '最高余额控制', span: 12, value: 'maxBalanceControl', type: 'select-model', code: 'yes_or_no' },
    { label: '最高金额', span: 12,value: 'maxAmount', type: 'money' },
    { label: '最高余额控制方案', span: 12, value: 'maxBalanceControlPlan', type: 'select', list: 'control', event: () => {
        modifyInfo.row.tradeObjId = ''
        modifyInfo.row.tradeObjName = ''
      }
    },
  ],
  rules: {
    bankAccountName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    miniBalanceControl: [{ required: true, message: '请选择最低余额控制', trigger: 'change' }],
    miniBalanceControlPlan: [{ required: true, message: '请选择最低余额控制方案', trigger: 'change' }],
    maxBalanceControl: [{ required: true, message: '请选择最低余额控制', trigger: 'change' }],
    maxBalanceControlPlan: [{ required: true, message: '请选择最高余额控制方案', trigger: 'change' }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => modifyInfo.visible = false},
    { type: 'primary', disabled: true, label: '确定', event: saveData }
  ]
})
const filterRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')
  deleteBtn.disabled = !rows.length
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
    bankAccountName: undefined
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {
    accountType: 2
  }
  getList()
}
function detail(row) {
  modifyInfo.row = cloneDeep(row)
  modifyInfo.title = '账户控制规则详情'
  modifyInfo.visible = true
  modifyInfo.btList[1].disabled = true
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.row = cloneDeep(row) || {
    accountType: 2,
    miniBalanceControl: '0',
    miniBalanceControlPlan: 1,
    maxBalanceControl: '0',
    maxBalanceControlPlan: 1,
  }
  modifyInfo.title = row ? '修改账户控制规则' : '新增账户控制规则'
  modifyInfo.visible = true
  modifyInfo.btList[1].disabled = false
}

async function saveData() {
  let isValid = true
  await modifyInfo.refObj.validate(flag => isValid = flag)
  if (!isValid) return
  const _row = {
    ...modifyInfo.row,
  }
  const api = _row.id ? API.update : API.add
  api(_row).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      modifyInfo.visible = false
      getList()
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

function selectChequeType(mark) {
  selectorInfo.type = 'baseBankAccount'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    if(mark === 'filter') {
      filterInfo.query.bankAccountId = data.id
      filterInfo.query.bankAccountName = data.accName
    } else {
      modifyInfo.row.bankAccountId = data.id
      modifyInfo.row.bankAccountName = data.accName
    }
  }
  selectorInfo.visible = true
}
</script>

<template>
  <div className="app-container">
    <div class="layui-card layui-col-md12">
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
                  <el-icon @click="selectChequeType('filter')"
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
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
            @handleEvent="tableHandler"
        >
          <template #col-bankAccountCode="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.bankAccountCode }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <ModifyFormDialog v-model:dialog-info="modifyInfo">
      <template #form-bankAccountName>
        <el-input
            v-model="modifyInfo.row.bankAccountName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择银行账户"
        >
          <template #append>
            <el-icon @click="selectChequeType"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyFormDialog>

    <select-data ref="selectorRef" />
  </div>
</template>
