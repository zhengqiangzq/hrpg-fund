<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {addNotReachedBank, updateNotReachedBank} from "@/api/reconciliationOfFunds/notReachedBank";
import Modify from "./modify.vue";
const { proxy } = getCurrentInstance();
const API = {
  add: addNotReachedBank,
  update: updateNotReachedBank
}
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
  rules: {},
  data: props.form
})
const tableInfo = reactive({
  title: '未达账明细',
  btnList: [],
  fieldList: [
    { label: '业务日期', value: 'businessTime' },
    { label: '摘要', value: 'summary' },
    { label: '收款金额', value: 'inMoney', align: 'right' },
    { label: '付款金额', value: 'outMoney', align: 'right' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '票据号', value: 'billNum' },
    { label: '票据日期', value: 'billDate', valueFormat: 'YYYY-MM-DD' },
    { label: '往来单位', value: 'tradeObj' },
  ],
  summaryFieldList: [
  ],
  data: props.form.id ? [props.form] : [],
})

const modifyInfo = reactive({
  id: null,
  form: {},
  title: '新增单位未达账',
  visible: false
})

function openModify() {
  modifyInfo.id = props.form.id
  modifyInfo.form = props.form
  modifyInfo.visible = true
}

onMounted(() => {
})
</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" flex v-model:visible="showDialog" :title="title" :noFullButton="true" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              $permission(`notReachedBank:update`)
            "
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑</el-button
      >
    </template>
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
    <ModifyTable class="table-box" title="未达账明细" :checkbox="false" :table-info="tableInfo">
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
