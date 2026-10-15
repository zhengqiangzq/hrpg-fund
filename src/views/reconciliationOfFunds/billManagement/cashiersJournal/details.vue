<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watchEffect} from "vue";
import cloneDeep from "lodash/cloneDeep";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {useSelectData} from "@/hooks/useSelectData";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import Modify from "./modify.vue";
import {addCashiersJournal, updateCashiersJournal} from "@/api/reconciliationOfFunds/cashiersJournal";
const { proxy } = getCurrentInstance();
const API = {
  add: addCashiersJournal,
  update: updateCashiersJournal,
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
    { label: '账户信息', value: 'fundsCompareAccountName', type: 'input', disabled: true },
    { label: '期初金额', value: 'balance', type: 'input', disabled: true },
  ],
  rules: {
  },
  data: props.form
})
const tableInfo = reactive({
  btnList: [],
  fieldList: [
    { label: '交易日期', value: 'businessTime' },
    { label: '摘要', value: 'summary' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '余额', value: 'balance', align: 'right'},
    { label: '内部对方账户', value: 'innerAccountName' },
    { label: '往来单位', value: 'businessPartners' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate' },
  ],
  summaryFieldList: [
  ],
  data: props.form.id ? [props.form] : [],
  sectionRows: []
})
onMounted(() => {
})

watchEffect(() => {
  tableInfo.data.forEach((row, index) => {
    const prev = tableInfo.data[index - 1]
    let balance = prev?.balance
    if (!prev) {
      balance = formInfo.data.balance || 0
    }
    row.balance = balance + Number(row.inMoney || 0) - Number(row.outMoney || 0)
  })
})

const modifyInfo = reactive({
  id: null,
  form: {},
  title: '新增资金日记账',
  visible: false
})

function openModify() {
  modifyInfo.id = props.form.id
  modifyInfo.form = cloneDeep(props.form)
  modifyInfo.visible = true
}
</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" flex v-model:visible="showDialog" :title="title" :noFullButton="true" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              $permission(`cashiersJournal:update`)
            "
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑</el-button
      >
    </template>
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
    </ModifyForm>
    <ModifyTable class="table-box" title="日记账明细" :checkbox="false"  :table-info="tableInfo">
    </ModifyTable>
  </ModifyPage>
  <modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :form="modifyInfo.form"
      :title="modifyInfo.title"
  />
</template>

<style scoped lang="scss">
:deep(.model-panel-body) {
  padding: 10px!important;
}
</style>
