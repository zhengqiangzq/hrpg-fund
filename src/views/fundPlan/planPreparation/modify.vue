<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import ModifyVxeTable from "@/components/ModifyPage/ModifyVxeTable.vue";
import {useSelectData} from "@/hooks/useSelectData";
import AddEdit from "./AddEdit.vue";
import {useStorage} from "@vueuse/core";
import {deepClone} from "@/utils";
import Introduce from "./Introduce.vue";
import {
  fundsPlanPreparedetail,
  fundsPlanPrepareinsert,
  fundsPlanPreparelinkedCalculation,
  fundsPlanPrepareupdate
} from "@/api/fundPlan/planPreparation";
import {pagePlanProject} from "@/api/fundPlan/planProject";

const { proxy } = getCurrentInstance();
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

const API = {
  detail: fundsPlanPreparedetail,
  add: fundsPlanPrepareinsert,
  update: fundsPlanPrepareupdate,
  link: fundsPlanPreparelinkedCalculation,
}

const setting = useStorage('setting', {}, sessionStorage)
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

const { selectorInfo, selectorRef } = useSelectData()
const formInfo = reactive({
  modifyFormRef: null,
  title: '基本信息',
  labelWidth: '120px',
  options: {
    compareStatus: [
      { key: '已确认', value: '1' },
      { key: '未确认', value: '0' },
    ],
  },
  fieldList: [
    { label: '编制组织', value: 'orgName', type: 'input', disabled: true },
    { label: '计划期间', value: 'monthName', showLabel: true, type: 'slot' },
    { label: '单据状态', value: 'status', type: 'select', list: 'compareStatus', disabled: true, show: !!props.id },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    monthName: [{ required: true, message: '请选择计划期间', trigger: 'change' }],
  },
  data: {
    orgId: setting.value.hospitalId,
    orgName: setting.value.hospitalName,
  }
})

const tableInfo = reactive({
  query: {
    levelStart: '1',
    levelEnd: '6',
    onlyLeaf: false,
    onlySubItem: false,
    planItem: '',
  },
  refresh: 0,
  highlightRow: true,
  options: {
    levelList: [
      { key: '1', value: '1' },
      { key: '2', value: '2' },
      { key: '3', value: '3' },
      { key: '4', value: '4' },
      { key: '5', value: '5' },
      { key: '6', value: '6' },
      { key: '7', value: '7' },
      { key: '8', value: '8' },
    ],
  },
  btnList: [
    { type: 'button', btType: 'primary', label: '联动计算', event: linkCalculate },
    { type: 'slot', showLabel: true, label: '项目级次', value: 'levelStart' },
    { type: 'checkbox', label: '仅显示末级项目和子项', value: 'onlyLeaf' },
    { type: 'checkbox', label: '仅显示子项', value: 'onlySubItem' },
    { type: 'input', label: '计划子项', value: 'planItem' },
    { type: 'button', label: '查询', btType: 'primary', event: queryDetailData },
  ],
  fieldList: [
    { label: '计划项目编码', value: 'planItemCode' },
    { label: '计划项目名称', value: 'planItemName' },
    { label: '计划子项目', value: 'planChildItem' },
    { label: '项目属性', value: 'itemAttrName' },
    { label: '取值方式', value: 'valueTypeName' },
    { label: '编制数', value: 'amount', type: "money", min: -99999999, editControl: (row) => handleMoney(row), align: 'right' },
    { label: '备注', value: 'remark', type: "input" },
  ],
  handle: {
    fixed: 'right',
    label: '操作栏',
    width: '230',
    btList: [
      {
        label: '增加子项',
        show: true,
        event: addSubItem,
        ifRender: (row) => {
          return !row.planChildItem && row.isLastLevel === '1' && row.valueType === '1' && (row.itemAttr === '1' || row.itemAttr === '2')
        }
      },
      {
        label: '引入子项',
        show: true,
        event: introduceData,
        ifRender: (row) => {
          return !row.planChildItem && row.isLastLevel === '1' && row.itemAttr === '2' && row.valueType === '1'
        }
      },
      {
        label: '删除子项',
        show: true,
        event: deleteSubItem,
        ifRender: (row) => {
          return !row.planChildItem && row.isLastLevel === '1' && row.valueType === '1' && (row.itemAttr === '1' || row.itemAttr === '2')
        }
      },
      {
        label: '编辑',
        show: true,
        event: editSubItem,
        ifRender: (row) => {
          return row.planChildItem
        }
      },
      {
        label: '删除',
        show: true,
        event: deleteData,
        ifRender: (row) => {
          return row.planChildItem
        },
      },
      {
        label: '上移',
        show: true,
        event: moveUp,
        ifRender: (row) => {
          return row.planChildItem
        },
      },
    ]
  },
  originalData: [

  ],
  data: [],
  sectionRows: []
})


const states = reactive({
  visible: false,
  row: null,
  rowIndex: 0,
  parentRow: null,
  isEdit: false,
  title: '',
})
const introduceInfo = reactive({
  visible: false,
  id: '',
  title: '引入子项',
})

onMounted(() => {
  if (props.id) {
    getMain()
  } else {
    queryFlanProject()
  }
})

function queryFlanProject() {
  pagePlanProject({enableStatus: 1}).then(res => {
    tableInfo.originalData = res.data && res.data.map((it, index) => {
      return {
        planItemCode: it.code,
        planItemName: it.name,
        itemLevel: it.itemLevel,
        planItemId: it.id,
        parentId: it.parentId,
        childOrder: index + 1,
        planChildItem: '',
        isLastLevel: it.isLastLevel,
        itemAttr: it.itemAttr,
        itemAttrName: it.itemAttrName,
        valueType: it.valueType,
        valueTypeName: it.valueTypeName,
        amount: 0,
        remark: '',
      }
    })
    tableInfo.data = deepClone(tableInfo.originalData)
  })
}

function getMain() {
  API.detail({prepareId: props.id}).then(res => {
    formInfo.data = res.data
    tableInfo.originalData = res.data.detailVOList.map((it, index) => {
      return {
        ...it,
        childOrder: index + 1,
        parentId: it.planChildItem ? it.planItemId : it.parentId,
      }
    })
    tableInfo.data = deepClone(tableInfo.originalData)
  })
}

function linkCalculate() {
  API.link(tableInfo.originalData).then(res => {
    tableInfo.data = []
    tableInfo.originalData = []
    tableInfo.originalData = res.data.map((it, index) => {
      return {
        ...it,
        childOrder: index + 1,
        parentId: it.planChildItem ? it.planItemId : it.parentId,
      }
    })
    tableInfo.data = deepClone(tableInfo.originalData)
  })
}

function deleteSubItem(row) {
  states.parentRow = row
  const children = tableInfo.data.filter(it => it.parentId === row.planItemId)
  if (children.length === 0) {
    proxy.$message.warning('没有子项可删除')
    return
  }
  proxy.$confirm('是否全部删除子项目', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    row.amount = 0
    tableInfo.data = tableInfo.data.filter(it => it.parentId !== row.planItemId)
    tableInfo.originalData = tableInfo.originalData.filter(it => it.parentId !== row.planItemId)
    calculateChildren(tableInfo.data)
    calculateChildren(tableInfo.originalData)
    calculateAmount(tableInfo.data)
    calculateAmount(tableInfo.originalData)
  })
}

function addSubItem(row) {
  states.isEdit = false
  states.title = '增加子项'
  states.parentRow = row
  states.rowIndex = tableInfo.originalData.findIndex(it => it.childOrder === row.childOrder)

  states.row = null
  states.visible = true
}

function editSubItem(row) {
  states.isEdit = true
  states.title = '编辑子项'
  states.row = row
  states.rowIndex = tableInfo.originalData.findIndex(it => it.childOrder === row.childOrder)
  states.parentRow = deepClone(row)
  states.visible = true
}


function deleteData(row) {
  states.parentRow = row
  states.rowIndex = tableInfo.originalData.findIndex(it => it.childOrder === row.childOrder)
  if (!row) {
    proxy.$message.warning('请选择要删除的数据')
    return
  }
  proxy.$confirm('确定删除选中的数据？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const dataIndex = tableInfo.data.indexOf(row)
    if (dataIndex > -1) {
      tableInfo.data.splice(dataIndex, 1)
    }
    tableInfo.originalData.splice(states.rowIndex, 1)
    calculateChildren(tableInfo.data)
    calculateChildren(tableInfo.originalData)
    calculateAmount(tableInfo.data)
    calculateAmount(tableInfo.originalData)
  })
}

function moveUp(row) {
  const parentRow = findParentRow(tableInfo.data, row)
  if (!parentRow) {
    proxy.$message.warning('无法上移')
    return
  }
  const index = tableInfo.data.indexOf(row)
  if (index <= 0) {
    proxy.$message.warning('已经是第一个')
    return
  }
  const temp = tableInfo.data[index]
  tableInfo.data[index] = tableInfo.data[index - 1]
  tableInfo.data[index - 1] = temp
  tableInfo.data = [...tableInfo.data]

  const originalIndex = tableInfo.originalData.findIndex(it => it.childOrder === row.childOrder)
  if (originalIndex > 0) {
    const originalTemp = tableInfo.originalData[originalIndex]
    tableInfo.originalData[originalIndex] = tableInfo.originalData[originalIndex - 1]
    tableInfo.originalData[originalIndex - 1] = originalTemp
    tableInfo.originalData = [...tableInfo.originalData]
  }

  tableInfo.refresh++
}

function handleMoney(row) {
  if(!row.planChildItem && row.isLastLevel === '1' && row.valueType === '1') {
    const flag = tableInfo.originalData.filter(it => it.parentId === row.planItemId)
    return (flag.length !== 0) || (row.itemAttr === '1' || row.itemAttr === '2')
  } else {
    return row.itemAttr === '1' || row.itemAttr === '2' || row.isLastLevel === '0' || row.valueType === '2';
  }
}
// function handleRemark(row) {
  // if(row.itemAttr === '1' || row.itemAttr === '2') {
  //   return true
  // } else {
  //   return false;
  // }
// }

const save = (err) => {
  if (err) return
  updateChildOrder(tableInfo.originalData)
  const api = props.id ? API.update : API.add
  api({
    ...formInfo.data,
    detailVOList: tableInfo.originalData,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function tableHandler(eventName, raw) {
  console.log('11111111111111', eventName, raw)
  if (eventName === 'tableClickRow') {
    states.parentRow = raw
  } else if (eventName === 'changePrice') {
    states.rowIndex = tableInfo.originalData.findIndex(it => it.childOrder === raw.childOrder)
    tableInfo.originalData[states.rowIndex].amount = raw.amount
  }
}
function selectPlanPeriod() {
  selectorInfo.type = 'accountingPeriodMonth'
  selectorInfo.callback = (data) => {
    formInfo.data.monthId = data.id
    formInfo.data.monthName = data.periodYearAndMonth
  }
  selectorInfo.visible = true
}
function findParentRow(data, targetRow) {

  const Index = data.indexOf(targetRow)
  if (Index <= 0) return false
  return data[Index - 1].parentId === targetRow.parentId;

}

function calculateAmount(Alldata) {
  const childrenMap = new Map()
  const data = Alldata.filter(it => !it.planChildItem)
  data.forEach(row => {
    if (row.parentId && row.parentId !== '-2') {
      if (!childrenMap.has(row.parentId)) {
        childrenMap.set(row.parentId, [])
      }
      childrenMap.get(row.parentId).push(row)
    }
  })

  const calculate = (planItemId) => {
    const children = childrenMap.get(planItemId) || []
    if (children.length === 0) {
      const row = data.find(r => r.planItemId === planItemId)
      return row ? parseFloat(row.amount) || 0 : 0
    }
    let total = 0
    children.forEach(child => {
      total += calculate(child.planItemId)
    })
    const row = data.find(r => r.planItemId === planItemId)
    if (row) {
      row.amount = total
    }
    return total
  }

  data.forEach(row => {
    if (row.parentId === '-2') {
      calculate(row.planItemId)
    }
  })
}

function updateChildOrder(data) {
  data.forEach((row, index) => {
    row.childOrder = index + 1
  })
}

function diaLogeCallback(flag, formData) {
  states.visible = false
  if (flag && formData) {
    if (states.isEdit && states.parentRow) {
      Object.assign(states.row, formData)
      Object.assign(tableInfo.originalData[states.rowIndex], formData)
    } else if (!states.isEdit && states.parentRow) {
      const newRow = {
        parentId: states.parentRow.planItemId,
        planItemId: states.parentRow.planItemId,
        planItemCode: '',
        planItemName: '',
        planChildItem: formData.planChildItem,
        itemAttr: states.parentRow.itemAttr || '',
        itemLevel: states.parentRow.itemLevel || '',
        itemAttrName: states.parentRow.itemAttrName || '',
        valueType: states.parentRow.valueType || '',
        valueTypeName: states.parentRow.valueTypeName || '',
        amount: formData.amount,
        childOrder: 0,
        remark: formData.remark || '',
      }

      let Index = 0
      for (let i = 0; i < tableInfo.data.length; i++) {
        tableInfo.data[i].childOrder = i + 1
        if (tableInfo.data[i] === states.parentRow) {
          Index = i;
        }
        if (tableInfo.data[i].parentId === states.parentRow.planItemId) {
          Index = i;
        }
      }
      tableInfo.data.splice(Index+1, 0, newRow)

      let originalIndex = 0
      for (let i = 0; i < tableInfo.originalData.length; i++) {
        tableInfo.originalData[i].childOrder = i + 1
        if (tableInfo.originalData[i].planItemId === states.parentRow.planItemId) {
          originalIndex = i;
        }
        if (tableInfo.originalData[i].parentId === states.parentRow.planItemId) {
          originalIndex = i;
        }
      }
      tableInfo.originalData.splice(originalIndex+1, 0, newRow)
      updateChildOrder(tableInfo.originalData)
    }
    calculateChildren(tableInfo.data)
    calculateChildren(tableInfo.originalData)
    calculateAmount(tableInfo.data)
    calculateAmount(tableInfo.originalData)
    tableInfo.refresh++
  }
}

// 计算子项总金额
function calculateChildren(data) {
  const row = data.filter(it => (it.planItemId === states.parentRow.planItemId) && !it.planChildItem)[0]
  const tatolData = data.filter(it => (it.planItemId === states.parentRow.planItemId) && it.planChildItem)
  const total = tatolData.reduce((sum, row) => {
    return sum + Number(row.amount);
  }, 0);
  if(row) {
    row.amount = total.toFixed(2);
  }
  tableInfo.refresh++
}

// 引入子项
function introduceData(row) {
  introduceInfo.id = row.planItemId;
  states.parentRow = deepClone(row)
  states.rowIndex = tableInfo.originalData.findIndex(it => it.childOrder === row.childOrder)
  introduceInfo.visible = true;
}

function introduceCallback(data) {
  introduceInfo.visible = false;
  if(!data) return;
  const newData = []
  const filters = tableInfo.originalData.filter(it => it.parentId === states.parentRow.planItemId)
  data.forEach(it => {
     const flag = filters.filter(item => item.planChildItem === it.planChildItem)[0]
    if(!flag) {
      newData.push({
        parentId: states.parentRow.planItemId,
        planItemId: states.parentRow.planItemId,
        planItemCode: '',
        planItemName: '',
        planChildItem: it.planChildItem,
        businessIds: it.businessIds,
        itemAttr: states.parentRow.itemAttr || '',
        itemLevel: states.parentRow.itemLevel || '',
        itemAttrName: states.parentRow.itemAttrName || '',
        valueType: states.parentRow.valueType || '',
        valueTypeName: states.parentRow.valueTypeName || '',
        amount: it.amount,
        childOrder: 0,
        remark: it.remark || '',
      })
    }
  })

  if(newData.length === 0) return;

  let Index = 0
  for (let i = 0; i < tableInfo.data.length; i++) {
    tableInfo.data[i].childOrder = i + 1;
    if (tableInfo.data[i].planItemId === states.parentRow.planItemId) {
      Index = i;
    }
    // if (tableInfo.data[i].parentId === states.parentRow.id) {
    //   Index = i;
    // }
  }
  tableInfo.data.splice(Index+1, 0, ...newData)

  let originalIndex = 0
  for (let i = 0; i < tableInfo.originalData.length; i++) {
    tableInfo.originalData[i].childOrder = i + 1;
    if (tableInfo.originalData[i].planItemId === states.parentRow.planItemId) {
      originalIndex = i;
    }
    if (tableInfo.originalData[i].parentId === states.parentRow.planItemId) {
      originalIndex = i;
    }
  }
  tableInfo.originalData.splice(originalIndex+1, 0, ...newData)
  updateChildOrder(tableInfo.originalData)

  calculateChildren(tableInfo.data)
  calculateChildren(tableInfo.originalData)
  calculateAmount(tableInfo.data)
  calculateAmount(tableInfo.originalData)
}

function queryDetailData() {
  const { levelStart, levelEnd, onlyLeaf, onlySubItem, planItem } = tableInfo.query
  let filteredData = deepClone(tableInfo.originalData)
  if (levelStart && levelEnd) {
    const start = parseInt(levelStart)
    const end = parseInt(levelEnd)
    const tempFiltered = filteredData.filter(row => {
      // if (row.planChildItem) {
      //   return true
      // }
      const rowLevel = parseInt(row.itemLevel)
      return rowLevel >= start && rowLevel <= end
    })
    const preservedIds = new Set(tempFiltered.map(item => item.planItemId))
    filteredData = tempFiltered.filter(row => {
      if (row.parentId === '-2') {
        return true
      }
      return preservedIds.has(row.parentId)
    })
  }

  if (onlyLeaf) {
    const tempFiltered = filteredData.filter(row => {
      return row.isLastLevel === '1' || row.planChildItem
    })
    const preservedIds = new Set(filteredData.map(item => item.planItemId))
    filteredData = tempFiltered.filter(row => {
      if (row.parentId === '-2') {
        return true
      }
      return preservedIds.has(row.parentId)
    })
  }

  if (onlySubItem) {
    filteredData = filteredData.filter(row => {
      return row.planChildItem
    })
  }

  if (planItem) {
    const keyword = planItem.trim().toLowerCase()
    const tempFiltered = filteredData.filter(row => {
      const subItem = String(row.planChildItem || '').toLowerCase()
      return subItem.includes(keyword)
    })
    const preservedIds = new Set(filteredData.map(item => item.planItemId))
    filteredData = tempFiltered.filter(row => {
      if (row.parentId === '-2') {
        return true
      }
      return preservedIds.has(row.parentId)
    })
  }

  tableInfo.data = filteredData
  tableInfo.refresh++
}

function visibleChange(val) {

}

</script>

<template>
  <ModifyPage ref="pageRef" flex v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.options">
      <template #form-monthName>
        <el-input
            v-model="formInfo.data.monthName"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :disabled="true"
            placeholder="请选择计划期间"
        >
          <template #append>
            <el-icon @click="selectPlanPeriod"><Search /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
    <ModifyVxeTable
        class="table-box"
        className="vxePreWrap"
        :table-info="tableInfo"
        :addHeight="60" :isDynamic="true" :checkbox="false"
        :expandTree="false" :tableTree="false"
        :listTypeInfo="tableInfo.options"
        @handleEvent="tableHandler">
      <template v-slot:filter-levelStart>
        <el-select
            style="width: 80px"
            v-model="tableInfo.query.levelStart"
            @change="visibleChange()"
        >
          <el-option
              v-for="(it) in tableInfo.options.levelList"
              :key="it.key"
              :label="it.value"
              :value="it.value"
          />
        </el-select>
        -
        <el-select
            style="width: 80px"
            v-model="tableInfo.query.levelEnd"
            @change="visibleChange()"
        >
          <el-option
              v-for="(it) in tableInfo.options.levelList"
              :key="it.key"
              :label="it.value"
              :value="it.value"
          />
        </el-select>
      </template>
    </ModifyVxeTable>
  </ModifyPage>
  <select-data ref="selectorRef" />
  <add-edit
      v-if="states.visible"
      :title="states.title"
      :visible="states.visible"
      :table-row="states.isEdit ? states.row : null"
      @callback="diaLogeCallback"
  />
  <introduce
      v-if="introduceInfo.visible"
      :title="introduceInfo.title"
      :id="introduceInfo.id"
      :visible="introduceInfo.visible"
      @callback="introduceCallback"
  />
</template>
