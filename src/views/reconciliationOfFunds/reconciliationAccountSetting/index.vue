<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import cloneDeep from "lodash/cloneDeep";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useSelectData} from "@/hooks/useSelectData";
import enableInspection from "./enableInspection.vue";
import ModifyFormDialog from "@/components/ModifyPage/ModifyFormDialog.vue";
import {
  addReconciliationAccountSetting,
  deleteReconciliationAccountSetting, disableReconciliationAccountSetting,
  enableReconciliationAccountSetting,
  exportReconciliationAccountSetting,
  pageReconciliationAccountSetting, updateReconciliationAccountGetById,
  updateReconciliationAccountSetting
} from "@/api/reconciliationOfFunds/reconciliationAccountSetting";
import PageDialog from "@/components/PageDialog/index.vue";
import PageFilter from "@/components/PageFilter/index.vue";
import {pageAccassItem, pageGetAccountAssistFile} from "@/api/finance";
import {allBalanceCheck} from "@/api/reconciliationOfFunds/balanceCheck";

const { proxy } = getCurrentInstance()
const PERMISSION_CODE = 'reconciliationAccountSetting'
defineOptions({
  name: PERMISSION_CODE
})
const API = {
  query: pageReconciliationAccountSetting,
  delete: deleteReconciliationAccountSetting,
  add: addReconciliationAccountSetting,
  detail: updateReconciliationAccountGetById,
  update: updateReconciliationAccountSetting,
  enable: enableReconciliationAccountSetting,
  disable: disableReconciliationAccountSetting,
  export: exportReconciliationAccountSetting,
  download: exportTemplateExcel,
}

const DICT = {
  compareType: {
    '0': '金额',
    '1': '结算方式',
    '2': '票据号'
  },
  accountType: {
    '2': '银行账户',
    '1': '现金账户'
  }
}

const {
  uploadInfo,
  beforeUpload,
  uploadSuccess,
  uploadError,
  exportData,
  downloadTemplate
} = useUpload(API, 'payableChequeTemplate', '/cheque/payableCheque/importExcel/begin', () => getList(), 'reconciliationAccountSetting:import')

const filterInfo = reactive({
  query: {},
  copyQuery: {},
  list: [
    { label: '账户信息', value: 'cashBankName', showLabel: true, type: 'input' },
  ],
  filterbtn: [
    { type: 'button', label: '查询', btType: 'primary', event: getList, },
    { type: 'button', label: '重置', event: reset, },
  ],
  btnList: [
    { type: 'button', label: '新增', show: proxy.$permission(`${PERMISSION_CODE}:add`), event: () => openModify(), },
    { type: 'button', label: '删除', show: proxy.$permission(`${PERMISSION_CODE}:delete`), event: () => deleteData(), },
    // { type: 'button', label: '启用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => enableData(), },
    // { type: 'button', label: '停用', show: proxy.$permission(`${PERMISSION_CODE}:enable`), event: () => disableData(), },
    { type: 'button', label: '导出Excel', show: proxy.$permission(`${PERMISSION_CODE}:export`), event: () => exportData(filterInfo.copyQuery), },
  ]
})
const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '组织信息', value: 'orgName' },
    { label: '账户类型', value: 'accountType', type: 'slot', formatter: val => (val.accountType === '2' ? '银行账户' : '现金账户') },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '会计账簿', value: 'accountingBookName' },
    { label: '启用日期', value: 'enableTime', align: 'center', formatter: (val) => moment(val.enableTime).format('YYYY-MM-DD') },
    { label: '单位账余额', value: 'accountingBalance', align: 'right' },
    { label: '单位未达账', value: 'accountingBeginMoney', align: 'right' },
    { label: '资金账余额', value: 'cashBalance', align: 'right' },
    { label: '银行账余额', value: 'bankBalance', align: 'right' },
    { label: '银行未达账', value: 'bankBeginMoney', align: 'right' },
    { label: '启用状态', value: 'statusValue' },
    { label: '停用日期', value: 'disableTime', align: 'center', formatter: (val) => moment(val.disableTime).format('YYYY-MM-DD') },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime', align: 'center', formatter: (val) => moment(val.createTime).format('YYYY-MM-DD') },
  ],
  data: [],
  summaryFieldList: [
    { value: 'accountingBalance', formatter: proxy.$fn.TripartiteMethod },
    { value: 'bankBeginMoney', formatter: proxy.$fn.TripartiteMethod },
    { value: 'cashBalance', formatter: proxy.$fn.TripartiteMethod },
    { value: 'bankBalance', formatter: proxy.$fn.TripartiteMethod },
    { value: 'accountingBeginMoney', formatter: proxy.$fn.TripartiteMethod },
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
        ifRender: (row) => row.status === '0'
      },
      {
        label: '启用',
        show: proxy.$permission(`${PERMISSION_CODE}:enable`),
        event: enableData,
        ifRender: (row) => row.status === '0'
      },
      {
        label: '停用',
        show: proxy.$permission(`${PERMISSION_CODE}:enable`),
        event: disableData,
        ifRender: (row) => row.status === '1'
      },
      {
        label: '删除',
        show: proxy.$permission(`${PERMISSION_CODE}:delete`),
        event: deleteData,
        ifRender: (row) => row.status === '0'
      },
    ]
  },
  sectionRows: []
})
const modifyInfo = reactive({
  refObj: null,
  index: null,
  row: {},
  title: '对账账户设置',
  visible: false,
  listTypeInfo: {
    compareType: Object.keys(DICT.compareType).map(it => ({ key: DICT.compareType[it], value: it, disabled: it == '0' })),
    accountType: Object.keys(DICT.accountType).map(it => ({ key: DICT.accountType[it], value: it })),
  },
  fieldList: [
    { label: '账户类型', span: 12, value: 'accountType', type: 'select', disabled: computed(() => modifyInfo.row.id), filterable: true, list: 'accountType', event: () => {
        modifyInfo.row.bankAccountId = ''
        modifyInfo.row.bankAccountName = ''
        modifyInfo.row.cashAccountId = ''
        modifyInfo.row.cashAccountName = ''
        modifyInfo.row.detailVOS = [{ accItemVOS: [] }]
      }
    },
    { label: '银行账户', span: 12, value: 'bankAccountName', type: 'slot', show: computed(() => modifyInfo.row.accountType == 2) },
    { label: '现金账户', span: 12, value: 'cashAccountName', type: 'slot', show: computed(() => modifyInfo.row.accountType == 1) },
    { label: '核算账簿', span: 12, value: 'accountingBookName', type: 'slot' },
    { label: '启用日期', span: 12, value: 'enableTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '会计科目信息', span: 24, value: 'detailVOS', type: 'slot' },
    // { label: '辅助核算', span: 8, value: 'accassItemNames', type: 'slot' },
    { label: '包含未记账', span: 24, value: 'iscontally', filterable: true, type: 'checkbox' },
    { label: '出纳账余额', span: 12, value: 'cashBalance', type: 'money' },
    { label: '单位账余额', span: 12, value: 'accountingBalance', type: 'money', disabled: true },
    { label: '银行账余额', span: 12, value: 'bankBalance', type: 'money' },
    { label: '默认对账方式', span: 24, value: 'compareType', type: 'checkboxgroup', list: 'compareType' },
  ],
  rules: {
    accountType: [{ required: true, message: '请选择账户类型', trigger: 'change' }],
    enableTime: [{ required: true, message: '请选择启用日期', trigger: 'change' }],
    bankAccountName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    cashAccountName: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    accountingBookName: [{ required: true, message: '请选择总账账簿', trigger: 'change' }],
    compareType: [{ required: true, message: '请选择默认对账方式', trigger: 'change' }],
    cashBalance: [{ required: true, message: '请输入出纳账余额', trigger: 'blur' }, { type: 'number', min: 0, message: '出纳账余额不能小于零' }],
    bankBalance: [{ required: true, message: '请输入银行账余额', trigger: 'blur' }, { type: 'number', min: 0, message: '银行帐余额不能小于零' }],
  },
  btList: [
    { type: 'button', show: true, label: '取消', event: () => modifyInfo.visible = false},
    { type: 'primary', disabled: true, label: '确定', event: saveData }
  ]
})
const filterRef = ref()
const dialogTableRef = ref()

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = filterInfo.btnList
  const deleteBtn = btns.find(btn => btn.label === '删除')

  deleteBtn.disabled = !rows.length || !!rows.find(it => it.status == 1)
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
  })
  tableInfo.refresh = Math.random()
}

// 重置查询
function reset() {
  filterInfo.query = {}
  getList()
}

function detail(row) {
  modifyInfo.title = "对账账户设置详情"
  modifyInfo.btList[1].disabled = true;
  API.detail({id: row.id}).then(({ code, data }) => {
    if (code === 200) {
      data.detailVOS.forEach(it => it.accItemVOS = it.accItemVOS || []);
      modifyInfo.row = data;
      modifyInfo.row.compareType = data.compareType.split(',');
      modifyInfo.row.iscontally = data.iscontally === '1';
      modifyInfo.visible = true
    }
  })
}

// 打开编辑页
// 当row不存在时，则打开的是新增页面
function openModify(row) {
  modifyInfo.row = {
    compareType: ['0'],
    accountType: '2',
  }
  modifyInfo.btList[1].disabled = false;
  modifyInfo.title = row ? '修改对账账户设置' : "新增对账账户设置"
  if(!row) {
    return modifyInfo.visible = true
  }
  API.detail({id: row.id}).then(({ code, data }) => {
    if (code === 200) {
      data.detailVOS.forEach(it => it.accItemVOS = it.accItemVOS || []);
      modifyInfo.row = data;
      modifyInfo.row.compareType = data.compareType.split(',');
      modifyInfo.row.iscontally = data.iscontally === '1';
      modifyInfo.visible = true
    }
  })
}

async function saveData() {
  let isValid = true
  let isValids = true
  await modifyInfo.refObj.validate(flag => isValid = flag)
  await dialogTableRef.value.validate(flag => isValids = flag)
  if (!isValid) return
  if (!isValids) return
  const _row = {
    ...modifyInfo.row,
    iscontally: modifyInfo.row.iscontally ? '1' : '0',
    compareType: modifyInfo.row.compareType.join(',')
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

function enableData(row) {
  enableDialogInfo.query.compareAccountId = row.firstId;
  enableDialogInfo.query.id = row.id;
  enableDialogInfo.query.compareAccountName = row.bankAccountName || row.cashAccountName;
  enableDialogInfo.query.expirationDate = row.expirationDate;
  enableDialogInfo.visible = true;
  // proxy
  //     .$confirm('操作后将改变数据,是否继续?', '提示', {
  //       confirmButtonText: '确定',
  //       cancelButtonText: '取消',
  //       type: 'warning',
  //     }).then(() => {
  //   API.enable([row.id]).then(({ code }) => {
  //     if (code === 200) {
  //       proxy.$message.success('保存成功')
  //       getList()
  //     }
  //   })
  // })
}
function disableData(row) {
  proxy
      .$confirm('操作后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    API.disable([row.id]).then(({ code }) => {
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

function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
      modifyInfo.row.cashAccountId = data.cashAccountId
      modifyInfo.row.cashAccountName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
      modifyInfo.row.bankAccountId = data.bankAccountId
      modifyInfo.row.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}
function selectAccountBook() {
  selectorInfo.type = 'accountingBook'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    modifyInfo.row.accountingBookName = data.name
    modifyInfo.row.accountingBookId = data.id
    modifyInfo.row.accChartId = data.accChartId

    modifyInfo.row.detailVOS = [{ accItemVOS: [] }]
  }
  selectorInfo.visible = true
}
function selectAccountingSubject(row) {
  selectorInfo.type = 'accountingSubject'
  selectorInfo.checkBox = false
  const arr = modifyInfo.row.detailVOS.map(it => it.accountId) || []
  let ids = [...new Set(arr.filter(item => item !== null))]
  selectorInfo.query = {
    accChartId: modifyInfo.row.accChartId,
    accountType: modifyInfo.row.accountType,
    excludeAccountIds: ids.toString()
  }
  selectorInfo.callback = (data) => {
    row.accountName = data.name
    row.accountId = data.id

    row.accItemVOS = []
  }
  selectorInfo.visible = true
}
function selectAccassItem(row) {
  const fromData = {
    status: '1',
    accChartId: modifyInfo.row.accChartId,
    accountIds: row.accountId
  }
  dialogInfo.rowIndex = modifyInfo.row.detailVOS.findIndex(it => it === row)
  dialogInfo.tableInfo.data = row.accItemVOS || [];
  dialogInfo.filters.query = {
    accountingBookName: modifyInfo.row.accountingBookName,
    accountName: row.accountName,
  }
  pageAccassItem(fromData).then(({ code, data }) => {
    if (code === 200) {
      dialogInfo.tableInfo.fieldList = []
      if(data?.length !== 0) {
        data.forEach(it => {
          dialogInfo.tableInfo.fieldList.push({
            label: it.name,
            value: it.id,
            code: it.code,
            type: 'slot'
          })
        })
        if(dialogInfo.tableInfo.data.length === 0) {
          detailAdd()
        }
        dialogInfo.visible = true;
      }
    }
  })

}

const dialogInfo = reactive({
  visible: false,
  title: '选择辅助核算值',
  rowIndex: 0,
  filters: {
    query: {},
    list: [
      { type: 'input', label: '核算账簿', value: 'accountingBookName', disabled: true },
      { type: 'input', label: '会计科目', value: 'accountName', disabled: true },
    ]
  },
  filterBtn: [
    { type: 'button', btType: 'primary', label: '添加行', show: true, event: (row) => detailAdd(row) }
  ],
  tableInfo: {
    data: [],
    rowIndex: 0,
    fieldList: [],
    handle: {
      fixed: 'right',
      label: '操作',
      width: '100',
      btList: [
        {
          label: '删除',
          show: () => modifyInfo.row.detailVOS.length > 1,
          event: (row) => detailDel(row),
        },
      ]
    }
  },
  btList: [
    { type: 'button', label: '取消', show: true, event: closeVosDialog },
    { type: 'primary', label: '确定', show: true, event: openVosDialog },
  ]
})

function selectAccountDetail(row, item) {
  selectorInfo.type = null;
  selectorInfo.pager = false;
  selectorInfo.checkBox = true;
  selectorInfo.title = '辅助核算项值';
  selectorInfo.filters = [
    { label: '编码/名称', value: 'keywords', type: 'input' },
  ];
  selectorInfo.fieldList = [
    { label: '辅助核算项编码', value: 'code' },
    { label: '辅助核算项名称', value: 'name' },
  ];
  selectorInfo.api = pageGetAccountAssistFile;
  selectorInfo.query = {
    itemCode: item.code
  };
  dialogInfo.tableInfo.rowIndex = dialogInfo.tableInfo.data.findIndex(it => it === row)
  selectorInfo.visible = true
  console.log('辅助想选项索引', dialogInfo.tableInfo.rowIndex)
  selectorInfo.callback = (data) => {
    let modeData = data && data.filter(it => it.children.length === 0)
    const newData = handleDetail(row, item, modeData)
    dialogInfo.tableInfo.data.splice(dialogInfo.tableInfo.rowIndex, 1,...newData)
    console.log('选择后表格数据', dialogInfo.tableInfo.data)
  }
}

function handleDetail(row,item, data) {
  let newAddtable = []
  data && data.forEach((it) => {
    row[item.value]['itemValueId'] = it.id;
    row[item.value]['itemValueCode'] = it.code;
    row[item.value]['itemValueName'] = it.name;
    newAddtable.push(cloneDeep(row))
  })
  return newAddtable;
}

function detailAdd() {
  let addrow = {}
  dialogInfo.tableInfo.fieldList.forEach(it => {
    addrow[it.value] = {
      itemId: it.value,
      itemCode: it.code,
      itemName: it.label,
      itemValueId: '',
      itemValueCode: '',
      itemValueName: '',
    }
  })
  dialogInfo.tableInfo.data.push(addrow)
}

function detailDel(row) {
  dialogInfo.tableInfo.data = dialogInfo.tableInfo.data.filter(it => it != row)
}

function openVosDialog() {
  modifyInfo.row.detailVOS[dialogInfo.rowIndex].accItemVOS = dialogInfo.tableInfo.data;
  dialogInfo.visible = false;
}

function closeVosDialog() {
  dialogInfo.visible = false;
}

const enableDialogInfo = reactive({
  visible: false,
  title: '启用检查',
  query: {},
  filterList: [
    { type: 'input', label: '对账账户', value: 'compareAccountName', disabled: true },
    { type: 'date', label: '启用日期', value: 'expirationDate', disabled: true, valueFormat: 'YYYY-MM-DD' },
  ],
})

function enableCallback(data) {
  enableDialogInfo.visible = false;
  getList()
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
          />
        </div>
        <div class="filter-wrapper">
          <!-- 条件栏 -->
          <NewPageFilter :filter-btn="filterInfo.btnList">
            <template v-slot:filter-uploadFile>
              <el-upload
                  :headers="uploadInfo.headers"
                  :show-file-list="false"
                  :data="uploadInfo.data"
                  :on-error="uploadError"
                  :on-success="uploadSuccess"
                  :before-upload="beforeUpload"
                  :action="uploadInfo.action"
              >
                <el-button>导入</el-button>
              </el-upload>
            </template>
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
          <template #col-accountType="{ row }">
            <span class="slip-edit" @click="detail(row)">{{ row.accountType === '2' ? '银行账户' : '现金账户' }}</span>
          </template>
        </table-container>
      </div>
    </div>
    <ModifyFormDialog v-model:dialog-info="modifyInfo">
      <template #form-cashAccountName>
        <el-input
            v-model="modifyInfo.row.cashAccountName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择现金账户"
        >
          <template #append v-if="!modifyInfo.row.id">
            <el-icon @click="selectCashAccount('modify')"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
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
          <template #append v-if="!modifyInfo.row.id">
            <el-icon @click="selectBankAccount('modify')"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-accountingBookName>
        <el-input
            v-model="modifyInfo.row.accountingBookName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择账簿"
        >
          <template #append>
            <el-icon @click="selectAccountBook"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
      <template #form-detailVOS>
        <el-form style="width: 100%;" ref="dialogTableRef" :model="{ data: modifyInfo.row.detailVOS }">
          <page-table
              class="dialog-table"
              style="padding: 0;"
              :is-dynamic="false"
              :pager="false"
              :checkBox="false"
              :field-list="[
                { label: '会计科目', value: 'accountName', type: 'slot', rules: [{ required: true, message: '请选择会计科目' }] },
                { label: '辅助核算', value: 'accItemVOS', type: 'slot' },
            ]"
              :handle="{
              fixed: 'right',
              label: '操作',
              width: '130',
              btList: [
                {
                  label: '添加行',
                  show: modifyInfo.title !== '对账账户设置详情',
                  event: (row) => {
                    modifyInfo.row.detailVOS.splice(modifyInfo.row.detailVOS.findIndex(it => it == row) + 1, 0, { accItemVOS: [] })
                  },
                },
                {
                  label: '删除',
                  show: modifyInfo.row.detailVOS?.length > 1 && modifyInfo.title !== '对账账户设置详情',
                  event: (row) => {
                    modifyInfo.row.detailVOS = modifyInfo.row.detailVOS.filter(it => it != row)
                  },
                },
              ]
            }"
              v-model:data="modifyInfo.row.detailVOS"
          >
            <template #col-accountName="{ row }">
              <el-input
                  v-model="row.accountName"
                  style="width: 100%"
                  readonly
              >
                <template #append v-if="!!modifyInfo.row.accountingBookId && !!modifyInfo.row.accountType">
                  <el-icon @click="selectAccountingSubject(row)"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
            <template #col-accItemVOS="{ row }">
              <el-input
                  :value="Object.values(row.accItemVOS[0] || [])?.map(it => it.itemName).join(',')"
                  style="width: 100%"
                  readonly
              >
                <template #append v-if="!!row.accountId">
                  <el-icon @click="selectAccassItem(row)"
                  ><Search
                  /></el-icon>
                </template>
              </el-input>
            </template>
          </page-table>
        </el-form>
      </template>
    </ModifyFormDialog>
    <!-- 辅助核算 -->
    <page-dialog
        v-if="dialogInfo.visible"
        :title="dialogInfo.title"
        width="1000px"
        v-model:visible="dialogInfo.visible"
        :bt-list="dialogInfo.btList"
        @reset="closeVosDialog"
    >
      <page-filter
          v-model:query="dialogInfo.filters.query"
          :filter-list="dialogInfo.filters.list"
          :isAddFlag="true"
      />
      <NewPageFilter :filter-btn="dialogInfo.filterBtn" />
      <el-table
          class="dialog-table"
          :data="dialogInfo.tableInfo.data"
          :checkBox="false"
          :height="400"
          :handle="dialogInfo.tableInfo.handle"
          :field-list="dialogInfo.tableInfo.fieldList"
      >
      <el-table-column
          v-for="(item, index) in dialogInfo.tableInfo.fieldList"
          :key="index"
          :prop="item.value"
          :label="item.label"
          :min-width="175"
          >
        <template v-slot="scope">
          <el-input
              v-model="scope.row[item.value]['itemValueName']"
              style="width: 100%"
              readonly
          >
            <template #append>
              <el-icon @click="selectAccountDetail(scope.row, item)"
              ><Search
              /></el-icon>
            </template>
          </el-input>
        </template>
      </el-table-column>
      <el-table-column
          :key="'handle'"
          fixed="right"
          align="center"
          label="操作"
          width="100"
          class="fix-right-table"
      >
        <template v-slot="scope">
          <template
              v-for="(item, index) in dialogInfo.tableInfo.handle.btList"
              :key="index"
          >
             <span
                 class="table-button"
                 :class="item.label === '删除' ? 'deleteBtn' : ''"
                 @click.stop="item.event(scope.row, scope.$index)"
             >{{ item.label }}
                  </span>
          </template>
        </template>
      </el-table-column>
      </el-table>
    </page-dialog>
    <!-- 启用检查 -->
    <enableInspection
        v-if="enableDialogInfo.visible"
        v-model:showDialog="enableDialogInfo.visible"
        :query="enableDialogInfo.query"
        :filterInfoList="enableDialogInfo.filterList"
        @callback="enableCallback"
    >

    </enableInspection>
    <select-data ref="selectorRef" />
  </div>
</template>

<style scoped lang="scss">
.error-style {
  color: #f56c6c;
}
.dialog-table :deep(.el-form-item:not(.not-br)) {
  min-width: unset !important;
}
</style>
