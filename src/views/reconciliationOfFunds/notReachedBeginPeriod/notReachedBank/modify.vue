<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {addNotReachedBank, updateNotReachedBank} from "@/api/reconciliationOfFunds/notReachedBank";
const { proxy } = getCurrentInstance();
const API = {
  add: addNotReachedBank,
  update: updateNotReachedBank
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
  form: {
    type: Object,
    default: () => ({}),
  },
})

const pageBtn = ref([
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
  title: '基础信息',
  labelWidth: '120px',
  listType: {
  },
  fieldList: [
    { label: '账户信息', value: 'fundsCompareAccountName', type: 'slot', disabled: true },
  ],
  rules: {
    fundsCompareAccountName: [{ required: true, message: '请选择账户信息', trigger: 'change' }],
  },
  data: props.form
})
const tableInfo = reactive({
  title: '未达账明细',
  btnList: [
    { type: 'button', btType: 'primary', label: '增加行', show: !props.form.id, event: () => {
      tableInfo.data.push({
        fundsCompareAccountId: formInfo.data.fundsCompareAccountId,
        fundsCompareAccountName: formInfo.data.fundsCompareAccountName,
      })
      } },
    { type: 'button', label: '删除行', show: !props.form.id, disabled: computed(() => !tableInfo.sectionRows.length), event: () => deleteData() },
  ],
  fieldList: [
    { label: '业务日期', value: 'businessTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00', rules: [{ required: true, message: '请选择业务日期' }] },
    { label: '摘要', value: 'summary', type: 'input', rules: [{ required: true, message: '请输入摘要', trigger: 'blur' }] },
    { label: '收款金额', value: 'inMoney', type: 'money', align: 'right', required: true, rules: [{required: true, message: '请输入收款金额'},{ validator: (rule, value, callback) => {
          const rowIndex = rule.field.replace(/data\.(\d+)\[inMoney\]/g, '\$1')
          const row = tableInfo.data[rowIndex]
          if (Number(row.outMoney || 0) <= 0 && isNaN(value)) {
            callback('请输入收款金额')
          } else {
            callback()
          }
        }
      }], editControl: (row) => Number(row.outMoney || 0) <= 0 },
    { label: '付款金额', value: 'outMoney', type: 'money', align: 'right', required: true, rules: [{required: true, message: '请输入付款金额'}, { validator: (rule, value, callback) => {
          const rowIndex = rule.field.replace(/data\.(\d+)\[outMoney\]/g, '\$1')
          const row = tableInfo.data[rowIndex]
          if (Number(row.inMoney || 0) && isNaN(value)) {
            callback('请输入付款金额')
          } else {
            callback()
          }
        }
      }], editControl: (row) => Number(row.inMoney || 0) <= 0 },
    { label: '结算方式', value: 'settlementMethodName', type: 'slot' },
    { label: '票据号', value: 'billNum', type: 'input' },
    { label: '票据日期', value: 'billDate', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    { label: '往来单位', value: 'tradeObj', type: 'input' },
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '删除',
        show: !props.form.id,
        event: deleteData,
      },
    ]
  },
  summaryFieldList: [
  ],
  data: props.form.id ? [props.form] : [],
  sectionRows: []
})

onMounted(() => {
})

function deleteData(row) {
  const selections = row ? [row] : tableInfo.sectionRows
  tableInfo.data = tableInfo.data.filter(it => !selections.find(itt => itt === it))
}

const save = (err, close = true) => {
  if (err) return
  if (!tableInfo.data.length) {
    proxy.$message.warning('请至少添加一行账单信息')
    return
  }
  let api = formInfo.data.id ? API.update : API.add
  const form = formInfo.data.id ? {
    ...tableInfo.data[0],
    fundsCompareAccountId: formInfo.data.fundsCompareAccountId,
    fundsCompareAccountName: formInfo.data.fundsCompareAccountName,
  } : tableInfo.data.map(it => {
    return {
      ...it,
      fundsCompareAccountId: formInfo.data.fundsCompareAccountId,
      fundsCompareAccountName: formInfo.data.fundsCompareAccountName,
    }
  })
  api(form).then(({ code }) => {
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

function tableHandler(eventName, raw) {
  if (eventName === 'tableCheck') {
    tableInfo.sectionRows = raw
  }
}

function selectSettlementMethod(row) {
  selectorInfo.type = 'settlementMethod'
  selectorInfo.query = {
  }
  selectorInfo.callback = (data) => {
    row.settlementMethodId = data.id
    row.settlementMethodName = data.name
  }
  selectorInfo.visible = true
}

function selectFundsCompareAccount() {
  selectorInfo.type = 'fundsCompareAccount'
  selectorInfo.query = {
    status: undefined
  }
  selectorInfo.callback = (data) => {
    formInfo.data.fundsCompareAccountId = data.id
    formInfo.data.fundsCompareAccountName = data.bankAccountName || data.cashAccountName
  }
  selectorInfo.visible = true
}
</script>

<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-fundsCompareAccountName>
        <el-input
            v-model="formInfo.data.fundsCompareAccountName"
            style="width: 100%"
            class="not-mongolia"
            placeholder="请选择账户信息"
            :disabled="true"
        >
        </el-input>
      </template>
    </ModifyForm>
    <ModifyTable class="table-box" title="未达账明细" :table-info="tableInfo" @handleEvent="tableHandler">
      <template #col-settlementMethodName="{ row }">
        <el-input
            v-model="row.settlementMethodName"
            style="width: 100%"
            class="not-mongolia"
            :required="true"
            :disabled="true"
            placeholder="请选择结算方式"
        >
          <template #append>
            <el-icon @click="selectSettlementMethod(row)"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyTable>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">
:deep(.model-panel-body) {
  padding: 10px!important;
}
</style>
