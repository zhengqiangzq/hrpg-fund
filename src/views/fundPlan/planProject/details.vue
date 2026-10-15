<script setup>
import {getCurrentInstance, onMounted, reactive, ref, computed} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyBasicInformation from "@/components/ModifyPage/ModifyBasicInformation.vue";
import Modify from './modify'
import {PlanProjectDetail} from "@/api/fundPlan/planProject";

const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'planProject'
const API = {
  detail: PlanProjectDetail,
}
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
  enableStatus: '',
})

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
  title: '修改计划项目',
  visible: false
})

const formInfo = reactive({
  title: '基本信息',
  fieldList: [
    { label: '计划项目编码', value: 'code' },
    { label: '计划项目名称', value: 'name' },
    { label: '所属上级项目', value: 'parentName' },
    { label: '项目属性', value: 'itemAttrName' },
    { label: '上级项目编制', value: 'parentPrepareName' },
    { label: '启用状态', value: 'enableStatusName' },
    { label: '备注', value: 'remark' },
  ],
  data: {}
})

const valueFormInfo = reactive({
  title: '取值方式',
  fieldList: [
    { label: '取值方式', value: 'valueTypeName' },
    { label: '联动公式', value: 'valueFormula' },
  ],
  data: {}
})

onMounted(() => {
  if (props.id) {
    getMain()
  }
})

function getMain() {
  API.detail(props.id).then(res => {
    formInfo.data = res.data
    valueFormInfo.data = res.data
  })
}

function openModify() {
  modifyInfo.id = props.id
  modifyInfo.title = '修改计划项目'
  modifyInfo.visible = true
}

function reloadPageData() {
  getMain()
  emit('returnBack')
}

</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" no-full-button flex v-model:visible="showDialog" :title="title" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              $permission(`${PERMISSION_CODE}:update`) && props.enableStatus === '0'
          "
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑</el-button
      >
    </template>
    <ModifyBasicInformation :info="formInfo"></ModifyBasicInformation>
    <ModifyBasicInformation :info="valueFormInfo"></ModifyBasicInformation>
  </ModifyPage>
  <Modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :title="modifyInfo.title"
      @returnModify="reloadPageData"
  ></Modify>
</template>
