<template>
  <div class="checkBox">
    <page-dialog
        v-if="state.dialogVisible"
        :title="title"
        v-model:visible="state.dialogVisible"
        :width="state.width"
        :bt-list="state.btList"
        @reset="cancel"
    >
      <div class="flex-1 h-full">
        <el-input ref="formulaRef" v-model="formula" type="textarea" :rows="6" resize="none" @blur="formulaBlur" />
        <el-button style="margin: 5px 0 5px 0" type="primary" @click="checkFormula">公式校验</el-button>
      </div>
      <!-- 计算器输入 -->
      <div class="flex">
        <!-- 函数名称 -->
        <div class="functionValue">
          <label class="funlabel">函数名称</label>
          <el-tree
              ref="menuTree"
              :data="treeInfo.data"
              highlight-current
              :props="treeInfo.defaultProps"
              node-key="id"
              :default-expand-all="true"
              :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <!-- 直接在显示标签的span上监听dblclick事件 -->
                <span @dblclick.stop="handleNodeDblclick(data, node)">
                  {{ node.label }}
                </span>
              </span>
            </template>
          </el-tree>
        </div>
        <!-- 操作 -->
        <div class="functionValue functionBtn">
          <label class="funlabel">操作数</label>
          <div class="classbox">
            <div v-for="num in NUM" :key="num" class="classbtn">
              <el-button plain class="w-full mx-5px" @click="calcButtonClick(num)">
                {{ num }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </page-dialog>
  </div>
</template>
<script setup name="vehicleAddEdit">
import {useStorage} from "@vueuse/core";
import { getCurrentInstance, reactive, ref } from "vue";
import PageDialog from "@/components/PageDialog/index.vue";
import {fundsPlanItemformulaCheck, pagePlanProject} from "@/api/fundPlan/planProject";

const setting = useStorage('setting', {}, sessionStorage)
const props = defineProps({
  title: {
    type: String,
    default: '联动公式'
  },
  formula: {
    type: String,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})
const { proxy } = getCurrentInstance()
const state = reactive({
  ref: null,
  dialogVisible: false,
  btList: [
    { label: '取消', event: cancel, show: true },
    {
      label: '确定',
      type: 'primary',
      event: userUpdate,
      show: true,
    },
  ],
  fieldList: [
    { label: '计划子项目', span: 12, value: 'planSubItem', type: 'input' },
    { label: '编制数', span: 12, value: 'planData', type: 'money' },
    { label: '备注', span: 24, value: 'remark', type: 'textarea' },
  ],
  rules: {
    planSubItem: [{ required: true, message: '请填写计划子项目' }],
    planData: [{ required: true, message: '请填写编制数' }],
  },
})

const emit = defineEmits()
const treeInfo = reactive({
  defaultProps: {
    children: 'children',
    label: (data, node) => { return data.code ? `${data.code} ${data.name}` : data.name },
  },
  data: [
    {
      id: 1,
      code: '',
      name: '计划项目',
      children: []
    },
  ]
})

const formula = ref('')
const formulaSelectionStartIndex = ref(0)
const formulaSelectionEndIndex = ref(0)
const NUM = reactive(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '*', '/', '.', '(', ')', 'C', '退'])

watch(
    () => props.visible,
    (val) => {
      state.dialogVisible = val
      if (val) {
        getTree()
      }
    },
    {
      immediate: true,
    }
)
watch(
    () => props.formula,
    (val) => {
      formula.value = val
    },
    {
      immediate: true,
    }
)

async function getTree() {
  const { code, data } = await pagePlanProject({
    enableStatus: 1,
    valueType: '1'
  })
  if( code === 200 ) {
    treeInfo.data[0].children = data || [];
  }
}

async function checkFormula() {
  const { code } = await fundsPlanItemformulaCheck({
    formual: formula.value
  })
  if( code === 200 ) {
    proxy.$message.success('校验成功')
  }
}

function handleNodeDblclick(data, node) {
  if(data.children) return;
  const value = `[${data.code}]+`
  // 插入公式
  insertIntoFormula(value)
}

function formulaBlur() {
  formulaSelectionStartIndex.value = proxy.$refs.formulaRef.$el.querySelector('textarea').selectionStart || 0
  formulaSelectionEndIndex.value = proxy.$refs.formulaRef.$el.querySelector('textarea').selectionEnd || 0

}

function calcButtonClick(value) {
  if(value === 'C') return formula.value = '';
  if(value === '退') return backspace();
  // 插入公式
  insertIntoFormula(value)
}

function insertIntoFormula(insertValue) {
  const StartIndex = formulaSelectionStartIndex.value
  const EndIndex = formulaSelectionEndIndex.value
  const __formula = formula.value || ''
  formula.value = `${__formula.slice(0, StartIndex)}${insertValue}${__formula.slice(EndIndex)}`
  formulaSelectionEndIndex.value = formulaSelectionStartIndex.value = StartIndex + insertValue.length
}

function backspace() {
  const StartIndex = formulaSelectionStartIndex.value - 1
  const EndIndex = formulaSelectionEndIndex.value
  const __formula = formula.value || ''
  formula.value = `${__formula.slice(0, StartIndex)}${__formula.slice(EndIndex)}`
  formulaSelectionEndIndex.value = formulaSelectionStartIndex.value = StartIndex
}

function cancel() {
  state.dialogVisible = false
  emit('callback', false)
}
async function userUpdate() {
  if(!formula.value) {
    state.dialogVisible = false
    return emit('callback', true, '')
  }
  const { code } = await fundsPlanItemformulaCheck({
    formual: formula.value
  })
  if( code === 200 ) {
    proxy.$message.success('校验成功')
    emit('callback', true, formula.value)
    state.dialogVisible = false
  }
}
</script>

<style lang="scss" scoped>
.flex {
  display: flex;
}
.functionValue {
  display: flex;
  width: 380px;
  flex-direction: column;
  border: 1px solid #eee;
  margin: 0 4px;
  border-radius: 4px;
  .funlabel {
    font-size: 16px;
    padding: 4px;
    margin: 0 10px;
    border-bottom: 1px solid #eee;
  }
  .el-tree {
    height: 300px;
    overflow: auto;
  }
  .classbox {
    display: flex;
    flex-wrap: wrap;
    .classbtn {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-basis: 25%;
      .el-button {
        border: 1px solid #46BD9B;
        background-color: rgb(237, 248, 245);
        margin: 5px 8px;
        width: 70px;
      }
    }
    .classBox_span {
      width: 100%;
      padding: 10px;
      cursor: pointer;
    }
  }
  .functionBtn {
    width: 280px;
  }
}


</style>
