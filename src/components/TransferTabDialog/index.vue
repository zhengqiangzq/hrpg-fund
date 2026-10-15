<template>
  <page-dialog
    :title="dialogInfo.title"
    v-model:visible="shows"
    :width="dialogInfo.width"
    :bt-list="dialogInfo.btList"
  >
    <div class="transfer-draggable">
      <!-- 左侧面板 -->
      <div class="transfer-draggable__panel">
        <div class="transfer-draggable__header">
          <span class="transfer-draggable__header-title">待选择字段</span>
        </div>
        <div class="transfer-draggable__body">
          <div class="transfer-draggable__col-header">
            <span class="col-action">序号</span>
            <span v-for="item in leftFieldInfo.fieldList" class="col-action">
              {{ item.label }}
            </span>
          </div>
          <draggable
            class="draggable-list"
            :list="leftFieldInfo.data"
            tag="ul"
            v-bind="{
              animation: 200,
              group: 'transfer-fields',
            }"
            :disabled="disabled"
            @add="handleLeftAdd"
          >
            <template #item="{ element, index }">
              <li class="draggable-item" :key="element.id || index">
                <span class="col-action">{{ index + 1 }}</span>
                <span
                  v-for="item in leftFieldInfo.fieldList"
                  class="col-action"
                >
                  {{ element[item.value] || '-' }}
                </span>
              </li>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 中间按钮 -->
      <div class="transfer-draggable__buttons">
        <el-button
          type="primary"
          :disabled="disabled || rightFieldInfo.data.length === 0"
          @click="handleMoveLeftAll"
        >
          一键左移
        </el-button>
        <el-button
          type="primary"
          :disabled="disabled || leftFieldInfo.data.length === 0"
          @click="handleMoveRightAll"
        >
          一键右移
        </el-button>
      </div>

      <!-- 右侧面板 -->
      <div class="transfer-draggable__panel">
        <div class="transfer-draggable__header">
          <span class="transfer-draggable__header-title">已选择字段</span>
        </div>
        <div class="transfer-draggable__body">
          <div class="transfer-draggable__col-header">
            <span class="col-action">序号</span>
            <span v-for="item in rightFieldInfo.fieldList" class="col-action">
              {{ item.label }}
            </span>
            <span class="col-action">操作</span>
          </div>
          <draggable
            class="draggable-list"
            :list="rightFieldInfo.data"
            tag="ul"
            v-bind="{
              animation: 200,
              group: 'transfer-fields',
            }"
            filter=".no-drag"
            :move="onMove"
            @add="handleRightAdd"
            @update="handleRightUpdate"
          >
            <template #item="{ element, index }">
              <li class="draggable-item" :key="element.id || index">
                <span class="col-action">{{ index + 1 }}</span>
                <span
                  v-for="item in rightFieldInfo.fieldList"
                  class="col-action"
                >
                  {{ element[item.value] || '-' }}
                </span>
                <span class="col-action">
                  <!-- {{ element.required }} -->
                  <el-button
                    v-if="element.required !== '1'"
                    type="danger"
                    link
                    size="small"
                    @click="delRow(element)"
                    >删除</el-button
                  >
                  <!-- 删除 -->
                </span>
              </li>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </page-dialog>
</template>

<script setup name="transferTabDialog">
import draggable from 'vuedraggable'
import {
  custExcelTemp,
  getExportList,
} from '@/api/transferTabDialog'

const props = defineProps({
  title: {
    type: String,
    default: '自定义模板',
  },
  /** 是否禁用（编辑/详情模式下使用） */
  disabled: {
    type: Boolean,
    default: false,
  },
  showDialog: {
    type: Boolean,
    default: false,
  },
  // 自定义菜单编码
  bizType: {
    type: String,
    default: 'STAFF_IMPORT',
  },
  // 默认导入
  operationType: {
    type: String,
    default: '',
  },
  // 自定义导出 接口
  apiExport: {
    type: Function,
  },

  btnCode: {
    type: String,
    default: '',
  },
  query: {
    type: Object,
    default: () => ({}),
  },
})
const { proxy } = getCurrentInstance()
const emit = defineEmits(['update:showDialog', 'callback', 'reset', 'confirm'])
// 先去数组第一个，以后有多个再改
const sheetName = ref('')
let shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emit('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {
  proxy.$nextTick(() => {
    getList()
  })
})

// ── 左侧状态 ──
const leftFieldInfo = ref({
  data: [],
  fieldList: [
    { label: '字段编码', value: 'fieldName' },
    { label: '字段名称', value: 'displayName' },
    { label: '是否必填', value: 'requiredValue' },
    { label: '备注', value: 'remark' },
  ],
})

// ── 右侧状态 ──
const rightFieldInfo = ref({
  data: [],
  fieldList: [
    { label: '字段编码', value: 'fieldName' },
    { label: '字段名称', value: 'displayName' },
    { label: '是否必填', value: 'requiredValue' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  width: '1200px',
  // width:props.width,
  title: props.title,
  btList: [
    { label: '取消', event: handleClose, show: true },
    {
      label: '下载文件',
      type: 'primary',
      event: save,
      show: props.operationType === 'IMPORT',
    },
    {
      label: '导出勾选数据',
      type: 'primary',
      event: ()=>save('2'),
      show: props.operationType === 'EXPORT',
    },
    {
      label: '导出当前页数据',
      type: 'primary',
      event: ()=>save('1'),
      show: props.operationType === 'EXPORT' && props.query.curPage,
    },
    {
      label: '导出全部页数据',
      type: 'primary',
      event:()=> save('0'),
      show: props.operationType === 'EXPORT',
    },
  ],
})
function onMove(evt) {
  if (evt.to !== evt.from && evt.draggedContext.element.required == '1') {
    return false
  }
  return true
} // 获取列表
function getList() {
  let params = {
    bizType: props.bizType,
    operationType: props.operationType,
  }
  getExportList(params).then((res) => {
    if (res.success && res.code === 200) {
      leftFieldInfo.value.data = res.data.filter((item) => item.required == '0')
      // 必选字段只能展示在右边不能位移
      rightFieldInfo.value.data = res.data.filter(
        (item) => item.required == '1',
      )
      sheetName.value = res.data[0]?.sheetName || ''
      // leftFieldInfo.value.data = res.data['DEFAULT']
      // localLeftData.value = res.data['DEFAULT']
    }
  })
}

// 删除右侧行，左侧回显初始位置
function delRow(row) {
  // 从右侧移除
  const rightIdx = rightFieldInfo.value.data.findIndex((i) => i.id === row.id)
  if (rightIdx >= 0) {
    rightFieldInfo.value.data.splice(rightIdx, 1)
  }
  // 添加回左侧
  leftFieldInfo.value.data.push({ ...row })
  emitConfirm()
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emit('reset')
}
function save(code) {
  const fieldNames = rightFieldInfo.value.data.map((it) => it.fieldName) || []
  let params = {
    bizType: props.bizType,
    operationType: props.operationType,
    sheetFields: [
      {
        sheetName: sheetName.value,
        fieldNames,
      },
    ],
  }
  if (Object.keys(props.query).length > 0) {
    params['searchParams'] = { ...props.query }
    if (code === '2') {
      // 导出勾选数据：必须有勾选项
      const checkedIds = params.searchParams.idIn || ''
      if (!checkedIds) {
        proxy.$message.warning('请先选择需要要导出的数据！')
        return
      }
    } else if (code === '1') {
      // 导出当前页数据：去掉勾选条件，保留查询条件和分页
      delete params.searchParams.idIn
    } else {
      // 导出全部页数据：去掉勾选条件和分页
      delete params.searchParams.idIn
      delete params.searchParams.pageNo
      delete params.searchParams.curPage
      delete params.searchParams.pageSize
      delete params.searchParams.total
    }
  }
  if (params.operationType === 'IMPORT') {
    custExcelTemp(params).then((resp) => {
      if (resp) {
        proxy.$fn.parseExcel(resp)
      }
    })
  } else if (params.operationType === 'EXPORT') {
    props.apiExport(params).then((resp) => {
      if (resp) {
        proxy.$fn.parseExcel(resp)
      }
    })
  }
  handleClose()
}



// ── 拖拽事件 ──

/** 从右侧拖回左侧时触发 */
function handleLeftAdd() {
  emitConfirm()
}

/** 从左侧拖到右侧时触发 */
function handleRightAdd() {
  emitConfirm()
}

/** 右侧内部拖拽排序后触发 */
function handleRightUpdate() {
  emitConfirm()
}

// ── 中间按钮操作 ──

/** 一键左移：将右侧所有项移回左侧 */
function handleMoveLeftAll() {
  let arr = rightFieldInfo.value.data.filter((it) => it.required === '0')
  let arr2 = rightFieldInfo.value.data.filter((it) => it.required === '1')
  leftFieldInfo.value.data = leftFieldInfo.value.data.concat(arr)
  rightFieldInfo.value.data = arr2
  emitConfirm()
}

/** 一键右移：将左侧所有项移到右侧 */
function handleMoveRightAll() {
  rightFieldInfo.value.data = rightFieldInfo.value.data.concat(
    leftFieldInfo.value.data,
  )
  leftFieldInfo.value.data = []
  emitConfirm()
}

// ── 触发事件 ──
function emitConfirm() {
  emit(
    'confirm',
    rightFieldInfo.value.data.map((item) => ({ ...item })),
  )
}
</script>

<style lang="scss" scoped>
.transfer-draggable {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  height: 400px;

  &__panel {
    display: flex;
    flex-direction: column;
    border: 1px solid #dae2ea;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    flex: 1;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-bottom: 1px solid #dae2ea;
    background: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    flex-shrink: 0;

    &-title {
      flex: 1;
    }
  }
  &__body {
    .col-action {
      flex: 1;
      display: block;
      // padding: 0 10px;
      min-width: 120px;
      text-align: center;
      box-sizing: border-box;
    }
  }

  &__count {
    font-size: 12px;
    color: #000;
    font-weight: normal;
  }

  &__col-header {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #ebeef5;
    background: #fafafa;
    font-size: 12px;
    color: #909399;
    flex-shrink: 0;
    box-sizing: border-box;
    width: max-content;
    min-width: 100%;

    .col-action {
      flex: 1;
      padding: 0 10px;
      min-width: 100px;
      text-align: center;
      box-sizing: border-box;
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    overflow-x: auto;
  }

  &__buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-shrink: 0;
    padding: 10px 0;

    .el-button {
      margin: 0;
    }
  }
}

// 拖拽列表样式
.draggable-list {
  height: 100%;
  list-style: none;
  margin: 0;
  padding: 0;
  width: fit-content;
  min-width: 100%;
}

.draggable-item {
  display: flex;
  align-items: center;
  height: 36px;
  width: fit-content;
  min-width: 100%;
  cursor: pointer;
  border-top: 1px solid #ebeef5;
  padding: 0;
  box-sizing: border-box;
  color: #606266;
  font-size: 13px;

  &:first-child {
    border-top: none;
  }

  .col-action {
    flex: 1;
    min-width: 100px;
    text-align: center;
    box-sizing: border-box;
  }
}
.no-drag {
  cursor: not-allowed; /* 不可拖拽的元素显示普通箭头，而不是抓手 */
}
// vuedraggable 拖拽状态样式
:deep(.sortable-ghost) {
  opacity: 0.4;
  background: #f0f9ff !important;
}

:deep(.sortable-drag) {
  opacity: 0.8;
  background: #fff !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
