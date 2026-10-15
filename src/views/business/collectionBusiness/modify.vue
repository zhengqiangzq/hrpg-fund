<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import {
  addCollectionBusiness,
  oneCollectionBusiness,
  updateCollectionBusiness,
  allDetailCollectionBusiness,
  exportDetailCollectionBusiness
} from "@/api/business/collectionBusiness";
import ModifyTabs from "@/components/ModifyPage/ModifyTabs.vue";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useUpload} from "@/hooks/useUpload";
import moment from "moment";
import {exportTemplateExcel} from "@/api/pub";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {buildAccountTransactionDetails} from "@/api/business/accountTransactionDetails";

const { proxy } = getCurrentInstance();
const API = {
  one: oneCollectionBusiness,
  add: addCollectionBusiness,
  detail: allDetailCollectionBusiness,
  batchAdd: null,
  update: updateCollectionBusiness,
  download: exportTemplateExcel,
  export: exportDetailCollectionBusiness,
  build: buildAccountTransactionDetails
}
const { selectorInfo, selectorRef } = useSelectData()
const emit = defineEmits(['returnModify'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  batch: false,
  id: '',
  flowFormType: '',
  detailOrders: null
})

const {
  uploadInfo, beforeUpload, uploadError, uploadSuccess, downloadTemplate, exportData
} = useUpload(API, '收款业务明细导入模板', `/business/collectionOrderDetail/import/excel/${props.id}`, (resp) => {
  tableInfo.data.push(...resp.data)
  sumTotalMoney()
}, 'collectionBusiness:import')

const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = reactive({
  modifyFormRef: null,
  title: '基本信息',
  labelWidth: '120px',
  listType: {
    useStatus: [{ key: '未确认', value: '0' }, { key: '已确认', value: '1' }],
  },
  fieldList: [
    { label: '单据号', value: 'orderNo', type: 'input', disabled: true, show: !!props.id },
    { label: '业务日期', value: 'orderTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '结算方式', value: 'settlementMethodName', type: 'slot' },
    { label: '现金账户', value: 'cashAccountName', type: 'slot', show: false },
    { label: '银行账户', value: 'bankAccountName', type: 'slot', show: false },
    { label: '收付款类型', value: 'type', type: 'select-model', code: 'funds_payment_type', disabled: true },
    { label: '收款金额', value: 'money', type: 'money', disabled: true },
    { label: '单据状态', value: 'confirmStatus', type: 'select', list: 'useStatus', disabled: true },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    orderTime: [{ required: true, message: '请选择业务日期', trigger: 'change' }],
    settlementMethodName: [{ required: true, message: '请选择结算方式', trigger: 'change' }],
    cashAccountName: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    bankAccountName: [{ required: true, message: '请选择银行账户', trigger: 'change' }],
    type: [{ required: true, message: '请选择收付款类型', trigger: 'change' }],
    money: [{ required: true, message: '请输入收款金额', trigger: 'blur' }],
  },
  data: {
    type: 2,
    confirmStatus: '0',
    orderTime: moment().format('YYYY-MM-DD 00:00:00')
  }
})
const tableInfo = reactive({
  btnList: [
    { type: 'button', btType: 'primary', label: '增加行', event: () => openModify() },
    { type: 'button', label: '删除行', event: () => deleteData() },
    { type: 'button', label: '下载模板', show: !!props.id, event: () => downloadTemplate(undefined, 'collectionBusiness:download') },
    { type: 'slot', value: 'uploadFile', show: !!props.id, label: '导入' },
    { type: 'button', label: '导出Excel', show: !!props.id, event: () => exportData({orderId: props.id}) },
  ],
  fieldList: [
    { label: '摘要', value: 'remark', type: 'input', rules: [{ required: true, message: '请输入摘要', trigger: 'blur' }] },
    { label: '收支项目', value: 'itemName', type: 'slot' },
    { label: '收款日期', value: 'tradeTime', valueFormat: 'YYYY-MM-DD 00:00:00', type: 'date', rules: [{ required: true, message: '请选择收款日期', trigger: 'change' }] },
    { label: '收款金额', value: 'money', type: 'money', rules: [{ required: true, message: '请输入收款金额', trigger: 'change' }] },
    { label: '交易对象户名', value: 'tradeObjectAccountName', type: 'input' },
    { label: '交易对象开户行', value: 'tradeObjectOpeningBank', type: 'input' },
    { label: '交易对象账号', value: 'tradeObjectNum', type: 'input' },
    { label: '是否归集', value: 'isCollectionValue', type: 'input', disabled: true },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      // {
      //   label: '编辑',
      //   show: true,
      //   event: openModify,
      //   ifRender: (row) => row.isCollection != 1
      // },
      {
        label: '删除',
        show: true,
        event: deleteData,
        ifRender: (row) => row.isCollection != 1
      },
    ]
  },
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  sectionRows: []
})

const { fileFormInfo } = useAttachUpload()

const activeTab = ref('1')

watch(() => tableInfo.sectionRows, (rows) => {
  const btns = tableInfo.btnList
  const deleteBtn = btns.find(it => it.label === '删除行')
  deleteBtn.disabled = !rows.length || !!rows.find(it => it.isCollection == 1)
}, { immediate: true })

onMounted(() => {
  if (props.id) {
    getMain()
    getDetail()
    getAttach()
  } else {
    if (props.detailOrders) {
      formInfo.data.businessAccountDetailIds = props.detailOrders.map(it => it.id)
      tableInfo.data = props.detailOrders.map(it => {
        return {
          tradeTime: it.tradeTime,
          tradeTypeValue: it.tradeBankName,
          tradeObjectName: it.tradeBankDoc,
          tradeObjectNum: it.tradeBankAccount,
          money: it.tradeMoney,
          remark: it.remark
        }
      })
      formInfo.data.money = tableInfo.data.reduce((prev, cur) => Number(cur.money || 0) + prev, 0)
      delete formInfo.rules.settlementMethodName
      formInfo.fieldList.find(it => 'bankAccountName' === it.value).show = true
    }
  }
})

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
    settleMethodEffect(res.data.cash)
  })
}

function getDetail() {
  API.detail({ orderId: props.id }).then(res => {
    if (res.success) {
      tableInfo.data = res.data
    }
  })
}

function getAttach() {
  annexUploadAll({ relativeId: props.id }).then(res => {
    fileFormInfo.data.filePathList = res.data
  })
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  if (!tableInfo.data.length) {
    proxy.$message.warning('请至少添加一行收款明细')
    return
  }
  let api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  if (props.detailOrders) {
    api = API.build
  }
  api({
    ...formInfo.data,
    orderDetail: tableInfo.data,
    annexUploadVOS: fileFormInfo.data.filePathList
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.data = {}
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function openModify() {
  let row = {
    index: tableInfo.data.length + 1
  }
  tableInfo.data.push(row)
}

function sumTotalMoney() {
  formInfo.data.money = tableInfo.data.reduce((prev, cur) => prev + Number(cur.money), 0)
}

function deleteData(row) {
  const sections = row ? [row] : tableInfo.sectionRows
  const ids = sections.map(it => it.id)
  if (ids.length === 0) {
    return
  }
  proxy
      .$confirm('删除后将改变数据,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
    proxy.$message.success('删除成功')
    tableInfo.data = tableInfo.data.filter(it => sections.indexOf(it) == -1)
    sumTotalMoney()
  })
}

function settleMethodEffect(cash) {
  formInfo.fieldList.find(it => 'cashAccountName'=== it.value).show = cash == 1
  formInfo.fieldList.find(it => 'bankAccountName' === it.value).show = cash == 0
  tableInfo.data.forEach(it => {
    it.settlementMethod = formInfo.data.settlementMethod
    it.settlementMethodName = formInfo.data.settlementMethodName
  })
}

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  } else if (eventName === 'changePrice') {
    sumTotalMoney()
  }
}

function selectBankAccount() {
  selectorInfo.type = 'bankAccount'
  selectorInfo.callback = (data) => {
    formInfo.data.bankAccountId = data.bankAccountId
    formInfo.data.bankAccountName = data.bankAccountName
  }
  selectorInfo.visible = true
}
function selectCashAccount() {
  selectorInfo.type = 'cashAccount'
  selectorInfo.callback = (data) => {
    formInfo.data.cashAccountId = data.cashAccountId
    formInfo.data.cashAccountName = data.cashAccountName
  }
  selectorInfo.visible = true
}
function selectSettlementMethod() {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    formInfo.data.settlementMethod = data.id
    formInfo.data.settlementMethodName = data.name
    formInfo.data.cash = data.cash
    settleMethodEffect(data.cash)
    formInfo.data.bankAccountId = undefined
    formInfo.data.bankAccountName = undefined
    formInfo.data.cashAccountId = undefined
    formInfo.data.cashAccountName = undefined
  }
  selectorInfo.visible = true
}
function selectItem(row) {
  selectorInfo.type = 'inOutItem'
  selectorInfo.query = {}
  selectorInfo.callback = (data) => {
    row.itemId = data.id
    row.itemName = data.name
  }
  selectorInfo.visible = true
}
</script>

<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-bankAccountName>
        <el-input
            v-model="formInfo.data.bankAccountName"
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
      <template #form-cashAccountName>
        <el-input
            v-model="formInfo.data.cashAccountName"
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
      <template #form-settlementMethodName>
        <el-input
            v-model="formInfo.data.settlementMethodName"
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
    </ModifyForm>
    <ModifyTabs title="明细信息" v-model="activeTab">
      <ModifyTab label="收款明细" name="1" required>
        <ModifyTable no-title isDynamic :table-info="tableInfo" @handleEvent="tableHandler">
          <template #col-itemName="{ row }">
            <el-input
                v-model="row.itemName"
                class="not-mongolia"
                type="input"
                placeholder="请选择收支项目"
                :disabled="true"
            >
              <template #append>
                <el-icon @click="selectItem(row)"><Search /></el-icon>
              </template>
            </el-input>
          </template>
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
              <el-button>excel导入</el-button>
            </el-upload>
          </template>
        </ModifyTable>
      </ModifyTab>
      <ModifyTab label="附件管理" name="2">
        <ModifyForm :form-info="fileFormInfo" no-title>
          <template v-slot:form-filePathList>
            <UploadImg
                v-model:value="fileFormInfo.data.filePathList"
                multiple
                :action="fileFormInfo.fileAction"
                list-type="text"
                title="附件"
                :file-type="fileFormInfo.fileType"
                :response-fn="(response, file) => file"
            />
          </template>
        </ModifyForm>
      </ModifyTab>
    </ModifyTabs>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">

</style>
