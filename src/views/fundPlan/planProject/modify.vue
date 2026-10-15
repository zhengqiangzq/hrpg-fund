<script setup>
import {computed, getCurrentInstance, onMounted, reactive,watch, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import DialogFormula from "./dialogFormula.vue";
import {addPlanProject, PlanProjectDetail, updatePlanProject} from "@/api/fundPlan/planProject";

const { proxy } = getCurrentInstance();
const API = {
  detail: PlanProjectDetail,
  add: addPlanProject,
  update: updatePlanProject,
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
  id: '',
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
const formInfo = reactive({
  modifyFormRef: null,
  title: '基本信息',
  labelWidth: '120px',
  listType: {
    projectAttributeList: [
      { key: '期初', value: '0' },
      { key: '收入', value: '1' },
      { key: '支出', value: '2' },
      { key: '期末', value: '3' },
      { key: '其他', value: '4' },
    ],
    parentCompileTypeList: [
      { key: '下级汇总', value: 1 },
    ],
    enableStatusList: [
      { key: '已启用', value: '1' },
      { key: '已停用', value: '0' },
    ],
    valueTypeList: [
      { key: '录入项', value: '1' },
      { key: '联动项', value: '2' },
    ],
  },
  fieldList: [
    { label: '计划项目编码', value: 'code', type: 'input', disabled: computed(() => !!props.id) },
    { label: '计划项目名称', value: 'name', type: 'input', required: true },
    { label: '所属上级项目', value: 'parentName', type: 'slot', required: true },
    { label: '项目属性', value: 'itemAttr', type: 'select', disabled: computed(() => !!formInfo.data.parentName), list: 'projectAttributeList', required: true },
    { label: '上级项目编制', value: 'parentPrepare', type: 'select', disabled: true, list: 'parentCompileTypeList' },
    { label: '启用状态', value: 'enableStatus', type: 'select-model', disabled: true, code: 'enabled_type' },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    code: [{ required: true, message: '请填写项目编码', trigger: 'blur' }],
    name: [{ required: true, message: '请填写项目名称', trigger: 'blur' }],
    itemAttr: [{ required: true, message: '请选择项目属性', trigger: 'change' }],
  },
  data: {
    enableStatus: '1',
    parentPrepare: 1,
    valueType: '1',
  }
})

const valueFormInfo = reactive({
  modifyFormRef: null,
  title: '取值方式',
  labelWidth: '120px',
  fieldList: [
    { label: '取值方式', value: 'valueType', type: 'select', disabled: computed(() => formInfo.data.itemAttr === '1' || formInfo.data.itemAttr === '2'), event: (val) => handleSelect(val), list: 'valueTypeList' },
    { label: '联动公式', value: 'valueFormula', type: 'slot', show: false },
  ],
  rules: {
    valueFormula: [{ required: true, message: '请选择联动公式', trigger: 'change' }],
  },
  data: formInfo.data
})

watch(
    () => formInfo.data.valueType,
    (val) => {
      if(val === '1') {
        formInfo.data.valueFormula = ''
      }
    },
    {
      immediate: true,
    }
)
watch(
    () => formInfo.data.itemAttr,
    (val) => {
      if(val === '1' || val === '2') {
        formInfo.data.valueType = '1'
        formInfo.data.valueFormula = ''
        valueFormInfo.fieldList[1].show = false
      }
    },
    {
      immediate: true,
    }
)

onMounted(() => {
  if (props.id) {
    getMain()
  }
})

function getMain() {
  API.detail(props.id).then(res => {
    formInfo.data = res.data
    valueFormInfo.data = res.data
    valueFormInfo.fieldList[1].show = res.data.valueType === '2'
  })
}

function handleSelect(val) {
  valueFormInfo.fieldList[1].show = val === '2'
}

const save = (err, close = true) => {
  if (err) return
  const api = props.id ? API.update : API.add
  const params = {
    ...formInfo.data,
  }
  api(params).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.data = {
          enableStatus: '1',
          parentPrepare: 1,
          valueType: '1',
        }
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function selectParentProject() {
  selectorInfo.type = 'planProject'
  selectorInfo.check = false
  selectorInfo.query = {
    enableStatus: '1'
  }
  selectorInfo.callback = (data) => {
    if(data.itemAttr === '0' || data.itemAttr === '3' || data.itemAttr === '4'){
      formInfo.data.parentId = ''
      formInfo.data.parentName = ''
      formInfo.data.itemAttr = ''
      return proxy.$message.warning('期初，期末，其他不可增加下级项目')
    }
    selectorInfo.visible = false
    formInfo.data.parentId = data.id || '-2'
    formInfo.data.parentName = data.name
    formInfo.data.itemAttr = data.itemAttr
  }
  selectorInfo.visible = true
}

const formulaInfo = reactive({
  formula: null,
  visible: false
})

function openFormula() {
  formulaInfo.visible = true
  formulaInfo.formula = formInfo.data.valueFormula

}

function callbaskformula(flag, data) {
  formulaInfo.visible = false
  if(!flag) return
  formInfo.data.valueFormula = data
}

</script>

<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-parentName>
        <el-input
            v-model="formInfo.data.parentName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择所属上级项目"
        >
          <template #append>
            <el-icon @click="selectParentProject">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyForm :form-info="valueFormInfo" :listTypeInfo="formInfo.listType">
      <template #form-valueFormula>
        <el-input
            v-model="formInfo.data.valueFormula"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择联动公式"
        >
          <template #append>
            <el-icon @click="openFormula">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
  <select-data ref="selectorRef" />
  <dialog-formula
      v-if="formulaInfo.visible"
      v-model:visible="formulaInfo.visible"
      :formula="formulaInfo.formula"
      @callback="callbaskformula"
  />
</template>
