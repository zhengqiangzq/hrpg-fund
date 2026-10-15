<script setup>
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";

const { proxy } = getCurrentInstance()
const emits = defineEmits(['close', 'done'])

const props = defineProps({
  isDay: false,
  form: { id: '', periodMonth: '', closeDay: '' },
  api: { check: () => {} }
})

const showDialog = ref(false)
const pageBtn = reactive([
  { label: '反结账', disabled: false, show: true, btType: 'primary', event: () => checkout() },
])

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
  fieldList: [
    { label: '子系统', value: 'name' },
    { label: '是否允许反结账', value: 'allowAntiValue' },
  ],
  data: [],
})

onMounted(() => {
  basicForm.data = props.form
  showDialog.value = true
  loadData()
})

function loadData() {
  props.api.reCheck({
    id: props.form.id
  }).then(({ data, success }) => {
    beforeTableInfo.data = data || []
    pageBtn[0].disabled = !!(data || []).filter(it => it.allowAnti == 0).length
  })
}

function checkout() {
  props.api.cancelCloseCheck(props.form).then(({ success, msg }) => {
    if (success) {
      proxy.$message.success('操作成功')
      emits('done')
    }
  })
}

function beforeTableHandle(eventName, raw) {
  if (eventName === 'tableClickRow') {
    beforeTableInfo.currentRow = raw
  }
}

function returnBack() {
  emits('close')
}
</script>

<template>
  <ModifyPage :visible="showDialog" @update:visible="(flag) => !flag && returnBack()" no-full-button :btn-list="pageBtn" title="结账" @returnBack="returnBack">
    <div class="month-checkout-container">
      <ModifyForm :form-info="basicForm"></ModifyForm>
      <ModifyTable class="month-checkout-table" :checkbox="false" :table-info="beforeTableInfo" @handle-event="beforeTableHandle"></ModifyTable>
    </div>
  </ModifyPage>
</template>

<style scoped lang="scss">
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