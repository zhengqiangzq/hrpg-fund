<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyVxeTable from "@/components/ModifyPage/ModifyVxeTable.vue";
import Modify from './modify.vue'
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {fundsPlanPreparedetail} from "@/api/fundPlan/planPreparation";

const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'planPreparation'
const emit = defineEmits(['returnBack'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  id: '',
  tableRow: {
    type: Object,
    default: () => ({}),
  },
})

const API = {
  detail: fundsPlanPreparedetail,
}

const pageBtn = ref([])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    emit('update:visible', newValue)
  },
})

const modifyInfo = reactive({
  id: null,
  title: '修改计划编制',
  visible: false
})

const formInfo = reactive({
  modifyFormRef: null,
  title: '基础信息',
  labelWidth: '120px',
  listType: {},
  fieldList: [
    {label: '编制组织', value: 'orgName', type: 'text'},
    {label: '计划期间', value: 'monthName', type: 'text'},
    {label: '单据状态', value: 'statusName', type: 'text'},
    {label: '备注', value: 'remark', type: 'text'},
  ],
  data: {}
})

const tableInfo = reactive({
  btnList: [],
  checkBox: false,
  fieldList: [
    {label: '计划项目编码', value: 'planItemCode'},
    {label: '计划项目名称', value: 'planItemName'},
    {label: '计划子项目', value: 'planChildItem'},
    {label: '项目属性', value: 'itemAttrName'},
    {label: '取值方式', value: 'valueTypeName'},
    {label: '编制数', value: 'amount', align: 'right'},
    {label: '备注', value: 'remark'},
  ],
  data: [],
})

onMounted(() => {
  if (props.id) {
    getMain()
  }
})

function reloadPageData() {
  getMain()
}

function openModify() {
  modifyInfo.id = props.id
  modifyInfo.visible = true
}

function getMain() {
  API.detail({prepareId: props.id}).then(res => {
    formInfo.data = res.data
    tableInfo.data = res.data.detailVOList || []
  })
}
</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" no-full-button flex v-model:visible="showDialog" :title="title"
              :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              $permission(`planPreparation:update`) &&
              (formInfo.data.status === '0')
            "
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑
      </el-button
      >
    </template>
    <ModifyForm :form-info="formInfo">
    </ModifyForm>
    <ModifyVxeTable class="table-box" className="vxePreWrap" title="编制明细" :checkbox="false" :table-info="tableInfo">
    </ModifyVxeTable>
  </ModifyPage>
  <Modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      @returnModify="reloadPageData"
  />
</template>
