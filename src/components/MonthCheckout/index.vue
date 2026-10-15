<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import HandlePages from "@/components/MonthCheckout/handlePages";
import moment from "moment";

const { proxy } = getCurrentInstance()
const emits = defineEmits(['close', 'done'])

const props = defineProps({
  isDay: false,
  PERMISSION_CODE: '',
  form: { id: '', periodmonth: '', closeDay: '' },
  api: { check: () => {} }
})

const startDate = computed(() => props.form.beginDate ? moment(props.form.beginDate).format('YYYY-MM-DD') : null)
const endDate = computed(() => props.form.endDate ? moment(props.form.endDate).format('YYYY-MM-DD') : null)

const showDialog = ref(false)
const pageBtn = reactive([
  { label: '结账', disabled: true, show: true, btType: 'primary', event: () => checkout() },
])
const handlePage = ref(null)

const basicForm = reactive({
  title: '基本信息',
  fieldList: [
    { label: '会计期间', value: 'periodmonth', type: 'input', disabled: true, show: !props.isDay },
    { label: '结账日期', value: 'closeDay', type: 'input', disabled: true, show: props.isDay },
  ],
  data: []
})
const beforeTableInfo = reactive({
  title: '结账前检查单据类型',
  highlightRow: true,
  currentRow: null,
  btnList: [
    { label: '刷新数据', type: 'button', event: loadData }
  ],
  fieldList: [
    { label: '单据类型', value: 'orderTypeValue' },
    { label: '检查状态', value: 'checkStatusValue' },
    { label: '检查失败条数', value: 'checkFailNum' },
  ],
  summaryFieldList: [
    { value: 'checkFailNum' }
  ],
  data: [],
})
const failTableInfo = reactive({
  title: '检查失败单据明细',
  fieldList: [
    { label: '单据类型', value: 'orderTypeValue' },
    { label: '检查状态', value: 'checkStatusValue' },
    { label: '单号', value: 'orderNo' },
    { label: '状态', value: 'statusValue' },
    { label: '创建人', value: 'createUserName' },
    { label: '创建日期', value: 'createTime' },
  ],
  sourceData: [],
  data: [],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '80',
    btList: [
      {
        label: '处理',
        show: proxy.$permission(props.PERMISSION_CODE),
        event: (row) => handleData(row),
      }
    ]
  }
})

const handlePageComp = computed(() => {
  return HandlePages[handlePage.value.orderType]
})

onMounted(() => {
  basicForm.data = props.form
  showDialog.value = true
  loadData()
})

function loadData() {
  props.api.check({
    id: props.form.id
  }).then(({ data, success }) => {
    beforeTableInfo.data = data || []
    pageBtn[0].disabled = !!(data || []).reduce((prev, cur) => prev + cur.checkFailNum, 0)
  })
}

function handleData(row) {
  handlePage.value = {
    ...row,
    detailPageTitle: row.orderTypeValue
  }
}

function checkout() {
  props.api.closeCheck(props.form).then(({ success, msg }) => {
    if (success) {
      proxy.$message.success('操作成功')
      emits('done')
    }
  })
}

function beforeTableHandle(eventName, raw) {
  if (eventName === 'tableClickRow') {
    beforeTableInfo.currentRow = raw
    failTableInfo.data = raw.detailVOList || []
    const fieldName = HandlePages.accountPageCode.includes(raw.orderType) ? '对账账户' : HandlePages.billPageCode.includes(raw.orderType) ? '票据编号' : '单号'
    failTableInfo.fieldList = [
      { label: '单据类型', value: 'orderTypeValue' },
      { label: '检查状态', value: 'checkStatusValue' },
      { label: fieldName, value: 'orderNo' },
      { label: '状态', value: 'statusValue' },
      { label: '创建人', value: 'createUserName' },
      { label: '创建日期', value: 'createTime' },
    ]
  }
}

function returnBack() {
  emits('close')
}
</script>

<template>
  <ModifyPage class="month-check-out" :visible="showDialog" @update:visible="(flag) => !flag && returnBack()" no-full-button :btn-list="pageBtn" title="结账" @returnBack="returnBack">
    <div class="month-checkout-container">
      <ModifyForm :form-info="basicForm"></ModifyForm>
      <ModifyTable class="month-checkout-table" :checkbox="false" :table-info="beforeTableInfo" @handle-event="beforeTableHandle"></ModifyTable>
      <ModifyTable class="month-checkout-table" :checkbox="false" :table-info="failTableInfo"></ModifyTable>
    </div>
  </ModifyPage>
  <NewFullScreen class="handle-page" :title="handlePage.detailPageTitle" v-if="!!handlePage" @returnBack="handlePage = null">
    <component :is="handlePageComp" :startDate="startDate" :endDate="endDate" :accountId="handlePage.accountId" :orderNo="handlePage.orderNo" :orderId="handlePage.orderId"></component>
  </NewFullScreen>
</template>

<style scoped lang="scss">
.month-check-out {
  position: relative !important;
}
.month-checkout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.month-checkout-table {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.month-checkout-table :deep(.model-panel-body),
.month-checkout-table :deep(.page-table) {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.handle-page {
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 14px 24px !important;
  :deep(#newFullScreenScroll) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  :deep(.app-container) {
    flex: 1;
    padding: 0;
  }
}
</style>
