<template>
  <div>
    <page-dialog
        :title="dialogInfo.title"
        v-model:visible="shows"
        :width="dialogInfo.width"
        :bt-loading="dialogInfo.btLoading"
        :bt-list="dialogInfo.btList"
    >
      <!-- 条件栏 -->
      <page-filter
          v-model:query="filterInfo.query"
          :filter-list="filterInfo.list"
      />
      <table-container
          v-model:data="tableInfo.data"
          :field-list="tableInfo.fieldList"
          :tabIndex="true"
          :check-box="false"
          :pager="false"
          :addHeight="-100"
          :isDynamic="true"
      />
      <ModifyForm no-title style="margin-top: 10px;" :form-info="extraFormInfo" />
    </page-dialog>
  </div>
</template>

<script setup name="selectDept">
import PageDialog from '@/components/PageDialog'
import PageFilter from '@/components/PageFilter'
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {allBalanceCheck} from "@/api/reconciliationOfFunds/balanceCheck";
import {enableReconciliationAccountSetting} from "@/api/reconciliationOfFunds/reconciliationAccountSetting";
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: Boolean,
    default: '启用校验',
  },
  showDialog: {
    type: Boolean,
  },
  query: {
    type: Object,
    default: function () {
      return {}
    },
  },
  filterInfoList: {
    type: Array,
    default: function () {
      return []
    },
  },
})

// 过滤相关配置
const filterInfo = ref({
  query: {
    sort: 'create_time desc',
    status: 1,
    ...props.query,
  },
  list: [],
})

const extraFormInfo = reactive({
  data: {},
  fieldList: [
    { label: '单位日记账余额', span: 8, value: 'accountingBalance', type: 'money', disabled: true },
    { label: '调整后余额', span: 8, value: 'accountingAdjustBalance', type: 'money', disabled: true },
    { label: '对账单余额', span: 8, value: 'bankBalance', type: 'money', disabled: true },
    { label: '调整后余额', span: 8, value: 'bankAdjustBalance', type: 'money', disabled: true },
    { label: '差额', span: 8, value: 'differenceBalance', type: 'money', disabled: true },
  ]
})

// 表格相关
const tableInfo = ref({
  data: [],
  fieldList: [
    { label: '项目', value: 'accountingName' },
    { label: '金额', value: 'accountingMoney', align: 'right' },
    { label: '项目', value: 'bankName' },
    { label: '金额', value: 'bankMoney', align: 'right' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: props.title,
  btLoading: false,
  width: 1200,
  btList: [
    { label: '取消', event: handleClose, show: true },
    {
      label: '确定',
      type: 'primary',
      event: save,
      show: true,
    },
  ],
})
const selectRow = ref('')

const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {
  // hack, 在table创建出来之后再去调用
  proxy.$nextTick(() => {
    getList()
    fullQuery()
  })
})
function fullQuery() {
  if (props.filterInfoList.length) {
    filterInfo.value.list = props.filterInfoList
    filterInfo.value.query = {
      ...filterInfo.value.query,
      ...props.query,
    }
  }
}

// 获取列表
function getList() {

  allBalanceCheck(filterInfo.value.query).then(res => {
    tableInfo.value.data = res.data.list
    extraFormInfo.data = res.data.data
  })
}

function save() {
  enableReconciliationAccountSetting([filterInfo.value.query.id]).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('启用成功')
      handleClose()
      emits('callback', selectRow.value)
    }
  })
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>

<style scoped></style>
