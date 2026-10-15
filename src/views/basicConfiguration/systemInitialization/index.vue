<script setup>
import {getCurrentInstance, onMounted, reactive} from "vue";
import {allSystemInitialization, updateTimeSystemInitialization} from "@/api/basicConfiguration/systemInitialization";
import moment from "moment";

const PERMISSION_CODE = 'systemInitialization'
const { proxy } = getCurrentInstance()
defineOptions({
  name: PERMISSION_CODE
})

const API = {
  query: allSystemInitialization,
  update: updateTimeSystemInitialization
}

const tableInfo = reactive({
  initCurPage: 1,
  refresh: 1,
  fieldList: [
    { label: '子系统', value: 'subSys' },
    { label: '功能模块', value: 'func' },
    { label: '启用日期', value: 'startTime', align: 'center', formatter: (data) => moment(data.startTime).format('YYYY-MM-DD') },
    { label: '期初会计期间', value: 'accountingPeriodName' },
  ],
  data: [],
  summaryFieldList: [
  ],
  handle: {
    fixed: 'right',
    label: '操作',
    width: '130',
    btList: [
      {
        label: '编辑',
        show: true,
        // show: proxy.$permission(`${PERMISSION_CODE}:update`),
        event: openModify,
      },
    ]
  },
  sectionRows: []
})

const dialogInfo = reactive({
  visible: false,
  title: '修改数据',
  btLoading: false,
  width: '30%',
  flag: true,
  btList: [
    { label: '取消', event: dialogClose, show: true },
    {
      label: '确定',
      type: 'primary',
      event: dialogSave,
      show: true,
    },
  ],
  formInfo: {
    ref: null,
    data: {},
    fieldList: [
      { label: '启用日期', value: 'startTime', type: 'date', valueFormat: 'YYYY-MM-DD 00:00:00' },
    ],
    rules: {
      yearMonth: [{ required: true, message: '请选择启用日期', trigger: 'change' }],
    },
  }
})

onMounted(() => {
  tableInfo.api = API.query
  getList()
})

function openModify(row) {
  dialogInfo.title = row ? '修改启用日期' : '新增启用日期'
  dialogInfo.formInfo.data = Object.assign({}, row)
  dialogInfo.visible = true
}

function dialogClose() {
  dialogInfo.visible = false
  dialogInfo.formInfo.data = {}
}
function dialogSave() {
  let params = {
    ...dialogInfo.formInfo.data,
  }
  dialogInfo.formInfo.ref.validate((valid) => {
    if (valid) {
      const _API = API.update
      _API(params).then(res => {
        if (res && res.success) {
          dialogClose()
          getList()
        }
      })
    }
  })
}

function getList() {
  tableInfo.refresh = Math.random()
}
</script>

<template>
  <div class="app-container">
    <div class="layui-card layui-col-md12">
      <div class="layui-card-body">
        <table-container
            :refresh="tableInfo.refresh"
            :init-curpage="tableInfo.initCurpage"
            v-model:data="tableInfo.data"
            :api="tableInfo.api"
            :pager="false"
            :check-box="false"
            :query="{}"
            :summary="!!tableInfo.summaryFieldList?.length"
            :summaryFieldList="tableInfo.summaryFieldList"
            :tabIndex="true"
            :field-list="tableInfo.fieldList"
            :handle="tableInfo.handle"
        >
        </table-container>
      </div>
    </div>
    <page-dialog
        v-show="dialogInfo.visible"
        :title="dialogInfo.title"
        v-model:visible="dialogInfo.visible"
        :width="dialogInfo.width"
        :bt-loading="dialogInfo.btLoading"
        :bt-list="dialogInfo.btList"
    >
      <page-form
          class="paddingBox order-model-formBox flex_wrap_start_start"
          v-model:ref-obj="dialogInfo.formInfo.ref"
          :data="dialogInfo.formInfo.data"
          :field-list="dialogInfo.formInfo.fieldList"
          :rules="dialogInfo.formInfo.rules"
          :label-width="dialogInfo.formInfo.labelWidth"
      >
      </page-form>
    </page-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
