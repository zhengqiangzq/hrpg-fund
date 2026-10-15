<template>
  <div class="app-container">
    <!-- 条件栏 -->
    <div class="filter-wrapper mt10">
      <NewPageFilter
        v-model:query="filterInfo.query"
        :filter-list="filterInfo.list"
        :filter-btn="filterInfo.btn"
      >
      </NewPageFilter>
    </div>
    <div :style="{ height: containerHeight + 'px' }" id="todoTaskBox">
      <div v-for="(item, i) in todoTaskList" :key="i" class="tips-list-item">
        <span class="itemBox">
          <span class="flCol">
            <span class="title mb5">
              {{ item.title }}
            </span>
            <span :title="item.subTitle" class="subTitle span-ellipsis">
              {{ item.subTitle }}
            </span>
          </span>
          <div class="flCol">
            <span class="arrivalTime mb5">{{
              moment(item.arrivalTime).format('YYYY-MM-DD HH:mm')
            }}</span>
            <span v-if="filterInfo.query.status === '1'">
              <el-button
                size="small"
                style="float: right"
                v-if="item.taskType === '1'"
                @click="setFlowData(item, 'myPending')"
                >{{ item.auditStatus === '4' ? '处理' : '审批' }}</el-button
              >
              <el-button
                size="small"
                style="float: right"
                v-if="item.taskType === '2'"
                @click="checkCalend(item)"
                >处理</el-button
              >
            </span>
            <span v-if="filterInfo.query.status === '3'">
              <el-button
                size="small"
                style="float: right"
                v-if="item.taskType === '1'"
                @click="setFlowData(item, '')"
                >详情</el-button
              >
              <el-button
                size="small"
                style="float: right"
                v-if="item.taskType === '2'"
                @click="checkCalend(item)"
                >详情</el-button
              >
            </span>
          </div>
        </span>
      </div>
    </div>
    <div class="pagination-container">
      <el-pagination
        :background="true"
        :current-page="filterInfo.query.pageNo"
        :page-sizes="pageSizes"
        :page-size="filterInfo.query.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup name="allPendingTask">
import { getScheduleTaskList } from '@/api/core'
const { proxy } = getCurrentInstance()
const route = useRoute()
import moment from 'moment'
const total = ref(0)
const pageSizes = ref([10, 20, 50, 100, 300, 500, 1000])
// 过滤相关配置
const filterInfo = ref({
  query: {
    pageNo: 1,
    pageSize: 10,
    sort: 'arrival_time desc',
    status: '1',
  },
  copyQuery: {},
  list: [
    {
      componentType: 'select-model',
      label: '状态',
      value: 'status',
      event: getList,
      code: 'schedule_task_status',
      onlyShowOption: ['1', '3'],
      clearable: false,
    },
    {
      label: '发起人',
      value: 'submitUserNames',
      asValue: 'submitUserIds',
      componentType: 'select-user',
      highlightRow: false,
      checkBox: true,
    },
    {
      componentType: 'input',
      label: '标题',
      value: 'titleLike',
      event: getList,
    },
    {
      componentType: 'input',
      label: '描述内容',
      value: 'subTitle',
      event: getList,
    },
    // {
    //   componentType: 'datetimerange',
    //   label: '接收时间',
    //   value: 'createTime',
    //   event: getList,
    //   timeArr: ['arrivalStartTime', 'arrivalEndTime'],
    // },
    {
      componentType: 'dateTime',
      label: '开始接收时间',
      value: 'arrivalStartTime',
      event: getList,
    },
    {
      componentType: 'dateTime',
      label: '结束接收时间',
      value: 'arrivalEndTime',
      event: getList,
      defaultTime: new Date(2000, 1, 1, 23, 59, 59),
    },
  ],
  btn: [
    { type: 'button', label: '查询', event: getList },
    { type: 'button', label: '重置', event: clearSearch },
  ],
})
const todoTaskList = ref([])
// const clearType = ref(true)
const showDialog = ref(true)
const containerHeight = ref(600)
const resizeObserver = ref(null)

onMounted(() => {
  // 监听主应用流程展示子应用详情或列表传参事件
  window.$wujie?.bus.$on('flowParentSetChange', parentSetChange)
  resizeObserver.value = new ResizeObserver((entries) => {
    proxy.$nextTick(() => {
      setStyle()
    })
  })
  resizeObserver.value.observe(document.getElementById('todoTaskBox'))
  filterInfo.value.copyQuery = proxy.$fn.deepClone(filterInfo.value.query)
  getList()
})
onBeforeUnmount(() => {
  window.$wujie?.bus.$off('flowParentSetChange', parentSetChange)
})
async function parentSetChange(sysCode, event, data) {
  if (event === 'refreshView') {
    getList()
  }
}
// 计算表格自适应高度
function setStyle() {
  let topHeight
  proxy.$nextTick(() => {
    topHeight = document
      .getElementById('todoTaskBox')
      ?.getBoundingClientRect().top
    if (!topHeight) {
      return
    }
    containerHeight.value = document.body.clientHeight - topHeight + 26
  })
}
function clearSearch() {
  filterInfo.value.query = proxy.$fn.deepClone(filterInfo.value.copyQuery)
  // clearType.value = !clearType.value
  getList()
}
// 搜索
function getList() {
  todoTaskList.value = []
  let params = proxy.$fn.deepClone(filterInfo.value.query)
  if (params.status === '1') {
    params.status = '1,2'
  }
  getScheduleTaskList(params).then((res) => {
    todoTaskList.value = res.data || []
    total.value = res.pageInfo.total
  })
}
function handleSizeChange(val) {
  filterInfo.value.query.pageSize = val
  getList()
}
function handleCurrentChange(val) {
  filterInfo.value.query.pageNo = val
  getList()
}
function setFlowData(val, view) {
  window.$wujie?.bus.$emit('flowSonSetChange', 'setFlowData', {
    item: val,
    view: view,
    route: route,
    systemCode: '/spdBase',
  })
}
function checkCalend(val) {
  if (window.__POWERED_BY_WUJIE__) {
    console.log('通知主服务切换菜单', val)
    window.$wujie?.bus.$emit('turnMessagePage', val)
  } else {
    proxy.$message.warning('通知主服务错误，请联系管理员')
  }
}
</script>

<style lang="scss" scoped>
#todoTaskBox {
  overflow: auto;
}
.tips-list-item {
  height: 60px;
  border: 1px solid #ccc;
  border-bottom: none;
  padding: 0 10px;
  .itemBox {
    display: flex;
    justify-content: space-between;
    .title {
      font-weight: 700;
    }
  }
  .flCol {
    display: flex;
    flex-direction: column;
  }
  .subTitle {
    font-size: 12px;
  }
}
.tips-list-item:nth-last-child(1) {
  border-bottom: 1px solid #ccc;
}
</style>
