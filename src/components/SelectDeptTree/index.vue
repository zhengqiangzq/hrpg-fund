<template>
  <page-dialog
    :title="fillTitle||title"
    v-model:visible="shows"
    :width="extraFieldList && extraFieldList.length ? '1200px' : width"
    :bt-loading="dialogInfo.btLoading"
    :bt-list="dialogInfo.btList"
  >
    <!-- 条件栏 -->
    <page-filter
      v-model:query="filterInfo.query"
      :filter-list="filterInfo.list"
    />
    <div class="tree-box">
      <el-tree
        :data="tableInfo.data"
        ref="treeRef"
        :show-checkbox="checkBox"
        node-key="id"
        :check-strictly="checkStrictly"
        :highlight-current="highlightCurrent"
        default-expand-all
        :expand-on-click-node="false"
        :check-on-click-node="true"
        :filter-node-method="filterNode"
        @node-click="nodeClick"
        @check="checkChange"
      >
        <template #default="{ node, data }">
          <!-- <el-tooltip placement="right" effect="light">
          <template #content>
            <span>名称：{{ data.name }}</span>
            <span> / 编码：{{ data.code }}</span>
            <span> / 备注：{{ data.remark }}</span>
          </template>
          <span>{{ data.code }} - {{ data.name }}</span>
        </el-tooltip> -->
          <div class="custom-tree-node">
            <div class="left">
              <span>{{ data.code || '' }}</span>
              <span v-if="data.code && data.name"> - </span>
              <span>{{ data.name || '' }}</span>
            </div>
            <div class="right" v-if="extraFieldList && extraFieldList.length">
              <div v-for="(item, index) in extraFieldList" :key="index">
                {{ item.label }}：
                <el-tooltip
                  v-if="data.currentObj[item.value]"
                  effect="light"
                  :content="data.currentObj[item.value]"
                  placement="top"
                >
                  <span>{{ data.currentObj[item.value] }}</span>
                </el-tooltip>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
  </page-dialog>
</template>

<script setup name="selectTreeData">
import PageDialog from '../PageDialog/index'
import PageFilter from '../PageFilter/index'
import {getDeptTree} from '@/api/base'

const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  str: {
    type: String,
    default: '',
  },
  checkBox: {
    type: Boolean,
    default: false,
  },
  checkStrictly: {
    //是否不关联勾选子节点
    type: Boolean,
    default: true,
  },
  api: {
    type: Function,
    default: undefined,
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
  checkedList: {
    //多选回显
    type: Array,
    default: function () {
      return []
    },
  },
  treenName: {
    //作为查询条件时区分是哪一个弹窗
    type: String,
    default: '',
  },
  checkedKey: {
    //单选回显
    type: String,
    default: '',
  },
  extraFieldList: {
    type: Array,
    default: () => {
      return []
    },
  },
  highlightCurrent: {
    //高亮代表单选
    type: Boolean,
    default: false,
  },
  saveEmpty: {
    type: Boolean,
    default: true,
  },
  isLeaf: {
    //是否只选叶子节点
    type: Boolean,
    default: false,
  },
  isMaterialDrug: {
    //是否同时支持物资和药品
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '640px',
  },
})
const fillTitle = ref('')
// 过滤相关配置
const filterInfo = ref({
  query: {
    ...props.query,
  },
  list: [
    {
      type: 'input',
      label: '名称/编码',
      value: 'keyword',
      event: search,
    },
    { type: 'button', label: '查询', event: search },
  ],
})
// 表格相关
const tableInfo = ref({
  data: [],
  fieldList: [
    { label: '名称', value: 'name' },
    { label: '编码', value: 'code' },
    { label: '备注', value: 'remark' },
  ],
})
// 弹窗相关
const dialogInfo = ref({
  title: '分类',
  width: '640px',
  btLoading: false,
  btList: [
    { label: '关闭', event: handleClose, show: true },
    {
      label: '保存',
      type: 'primary',
      disabled: !props.saveEmpty,
      event: save,
      show: true,
    },
    // { label: '重置', event: handleClear, show: props.highlightCurrent },
  ],
})

const selectRow = ref('')
const realApi = ref(props.api || getDeptTree)
const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})

onMounted(() => {

  getList()
})

// 获取列表
function getList() {
  realApi.value(filterInfo.value.query).then((res) => {
    if (res && res.success) {
      if (res.data && res.data.length) {
        tableInfo.value.data = res.data[0].children
        if (props.checkBox) {
          proxy.$nextTick(() => {
            proxy.$refs.treeRef.setCheckedNodes(props.checkedList, false)
            selectRow.value = proxy.$fn.deepClone(props.checkedList)
          })
        }
        if (props.highlightCurrent) {
          if (props.checkedKey && Object.keys(props.checkedKey).length) {
            let timer = setTimeout(() => {
              proxy.$refs.treeRef.setCurrentNode(props.checkedKey)
              clearTimeout(timer)
            }, 300)
          } else {
            let getCurrentNode = proxy.$refs.treeRef.getCurrentNode()
            if (getCurrentNode) {
              proxy.$refs.treeRef.setCurrentKey(null)
            }
          }
          selectRow.value = proxy.$fn.deepClone(props.checkedKey)
        }
        if (props.isLeaf) {
          setDisabled(tableInfo.value.data)
        }
      }
    }
  })
}
function handleClear() {
  proxy.$nextTick(() => {
    proxy.$refs.treeRef.setCurrentKey(null)
  })
  filterInfo.value.query.keyword = ''
  selectRow.value = ''
  if (!props.saveEmpty) {
    dialogInfo.value.btList[1].disabled = !selectRow.value
  }
  search()
}
function setDisabled(treeData) {
  if (treeData && treeData.length) {
    treeData.forEach((item) => {
      if (item.children && item.children.length) {
        item.disabled = true
        setDisabled(item.children)
      }
    })
  }
}
function search() {
  proxy.$refs.treeRef.filter(filterInfo.value.query.keyword)
}
function filterNode(value, data, node) {
  if (!value) return true
  // 如果传入的value和data中的label相同说明是匹配到了
  if (data.name?.includes(value) || data.code?.includes(value)) {
    return true
  }
  // 否则要去判断它是不是选中节点的子节点
  return checkBelongToChooseNode(value, data, node)
}
function checkBelongToChooseNode(value, data, node) {
  const level = node.level
  // 如果传入的节点本身就是一级节点就不用校验了
  if (level === 1) {
    return false
  }
  // 先取当前节点的父节点
  let parentData = node.parent
  // 遍历当前节点的父节点
  let index = 0
  while (index < level - 1) {
    // 如果匹配到直接返回
    if (
      parentData.data.name?.includes(value) ||
      parentData.data.code?.includes(value)
    ) {
      return true
    }
    // 否则的话再往上一层做匹配
    parentData = parentData.parent
    index++
  }
  // 没匹配到返回false
  return false
}
function save() {
  if(props.isLeaf && !selectRow.value) return proxy.$message.warning('请选择末级')
  emits('callback', selectRow.value)
  handleClose()
}
function nodeClick(node) {
  if (props.checkBox) {
  } else {
    if (props.isLeaf && node.disabled) {
      proxy.$refs.treeRef.setCurrentKey(null)
      selectRow.value = ''
      if (!props.saveEmpty) {
        dialogInfo.value.btList[1].disabled = !selectRow.value
      }
      return
    }
    selectRow.value = node
    if (!props.saveEmpty) {
      dialogInfo.value.btList[1].disabled = !selectRow.value
    }
  }
}
function checkChange(node, data) {
  // console.log(node, data)
  if (props.checkBox) {
    selectRow.value = data.checkedNodes
    if (!props.saveEmpty) {
      dialogInfo.value.btList[1].disabled = !selectRow.value.length
    }
  }
}
// 关闭弹窗前的回调
function handleClose() {
  shows.value = false
  emits('reset')
}
</script>
<style lang="scss" scoped>
.tree-box {
  width: 100%;
  height: 350px;
  overflow: hidden;
  overflow-y: auto;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .right {
    font-size: 12px;
    width: 800px;
    display: flex;
    align-items: center;
    div {
      width: 32%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
