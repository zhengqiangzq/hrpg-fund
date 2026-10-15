<template>
  <div class="table-container" :class="[className, tableRandom]">
    <!-- 显示表格 -->
    <el-table
      ref="table"
      v-loading="listInfo.loading"
      :data="data"
      border
      :show-summary="summary"
      :summary-method="getSummaries"
      :row-key="rowKey"
      :row-class-name="rowClassName"
      :max-height="maxHeight"
      :highlight-current-row="highlightRow"
      :span-method="defaultSpanMethod"
      @current-change="clickRow"
      @select="clickSelect"
      @row-click="getAddLisy"
      @selection-change="handleSelectionChange"
      @row-dblclick="handelTableRowDbClick"
    >
      <el-table-column
        v-if="checkBox"
        :fixed="checkBoxFixed"
        :reserve-selection="reserveSelection"
        type="selection"
        align="center"
        width="40"
        :selectable="selectable"
      />
      <el-table-column
        v-if="tabIndex"
        :key="'index'"
        align="center"
        fixed="left"
        label="序号"
        :width="fieldList.length === 0 ? '' : 70"
      >
        <template v-slot="scope">
          <span>{{
            scope.$index +
            1 +
            (listInfo.query.pageNo - 1) * listInfo.query.pageSize
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in fieldList.filter((item) => !item.hidden)"
        :key="index"
        :prop="item.value"
        :label="item.label"
        :fixed="item.fixed"
        :formatter="item.formatter"
        :filters="item.filters"
        :filter-method="item.filterMethod"
        :align="item.align === 'right' ? 'right' : 'left'"
        :width="item.width"
        :min-width="item.minWidth || '120px'"
        show-overflow-tooltip
      >
        <template slot="header" #header="scope">
          <div @mouseover="onMouseOverTable(item.value)">
            <el-tooltip
              placement="top"
              :disabled="isShowTooltip"
              :content="scope.column.label"
            >
              <div :ref="'parent' + item.value" class="ellipse-text">
                <span :ref="item.value">{{ scope.column.label }}</span>
              </div>
            </el-tooltip>
          </div>
        </template>
        <template v-if="item.type !== 'column'" v-slot="scope">
          <!-- solt 自定义列-->
          <template v-if="item.type === 'slot'">
            <slot
              :name="'col-' + item.value"
              :row="scope.row"
              :$index="scope.$index"
            />
          </template>
          <!-- 数字输入框带校验规则 -->
          <!--<el-input-number v-else-if="item.type === 'number'"  v-model="scope.row[item.value]" :precision="2"-->
          <!--:min="item.min || 0" :max="item.max || 99999999"/>-->
          <el-form-item
            v-else-if="item.type === 'number'"
            :prop="`data.${scope.$index}[${item.value}]`"
            :rules="item.rules ? item.rules : numberRules"
          >
            <el-input
              v-model.number.trim="scope.row[item.value]"
              v-enterNumber
              type="number"
              style="width: 100px; margintop: 18px"
              :precision="0"
              :min="item.min || 0"
              :step="1"
              :max="item.max || 9999999"
              @input="(e) => (scope.row[item.value] = validSe(e))"
            />
          </el-form-item>
          <!--金额-->
          <el-form-item
            v-else-if="item.type === 'money'"
            class="input-money"
            :prop="`data.${scope.$index}[${item.value}]`"
            :rules="item.rules ? item.rules : moneyRules"
          >
            <el-input-number
              v-model.lazy="scope.row[item.value]"
              type="number"
              style="minwidth: 100px; margintop: 18px"
              controls-position="right"
              :precision="systemConfig.price_precision"
              :min="item.min || 0"
              :step="1"
              :max="item.max || 999999999999999"
              @change="changePrice(`data.${scope.$index}[${item.value}]`)"
            >
            </el-input-number>
          </el-form-item>
          <!-- 普通输入框 -->
          <el-input
            v-else-if="item.type === 'input'"
            v-model="scope.row[item.value]"
            :maxlength="item.maxlength || 50"
            :placeholder="item.placeholder || '请输入' + item.label"
            @input="(e) => (scope.row[item.value] = validSe(e))"
          />
          <!--校验输入框-->
          <el-form-item
            v-else-if="item.type === 'inputRules'"
            :prop="`data.${scope.$index}[${item.value}]`"
            :rules="item.rules ? item.rules : numberRules"
            style="margintop: 14px"
          >
            <el-input
              v-model="scope.row[item.value]"
              style="margintop: 18px"
              :placeholder="item.placeholder || '请输入' + item.label"
              :maxlength="item.maxlength || 50"
              @input="(e) => (scope.row[item.value] = validSe(e))"
            />
          </el-form-item>
          <el-form-item
            v-else-if="item.type === 'password'"
            :prop="`data.${scope.$index}[${item.value}]`"
            :rules="item.rules ? item.rules : ''"
            style="margintop: 14px"
          >
            <el-input
              v-model="scope.row[item.value]"
              style="margintop: 18px"
              type="password"
              auto-complete="new-password"
              :placeholder="item.placeholder || '请输入' + item.label"
              :maxlength="item.maxlength || 50"
              @input="(e) => (scope.row[item.value] = validSe(e))"
            />
          </el-form-item>
          <!-- 日期选择框 -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="scope.row[item.value]"
            value-format="YYYY-MM-DD"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
          />
          <!-- 下拉选择框 -->
          <select-model
            v-else-if="item.type === 'select-model'"
            v-model="scope.row[item.asValue ? item.asValue : item.value]"
            :type-code="item.code"
            :disabled="item.disabled"
            :only-show-option="item.onlyShowOption"
            :clearable="item.clearable === false ? item.clearable : true"
            :check-default="item.checkDefault ? item.checkDefault : false"
            :multiple="item.multiple"
          />
          <!-- 标签 -->
          <el-tag v-else-if="item.type === 'tag'">{{
            scope.row[item.value]
          }}</el-tag>
          <!-- 图片 -->
          <!-- v-imgAlart -->
          <img
            v-else-if="item.type === 'image' && scope.row[item.value]"
            height="50px"
            :src="scope.row[item.value]"
          />
          <div
            v-else-if="item.type === 'showImage'"
            class="showImage"
            :class="!scope.row[item.value] ? 'bgimg' : ''"
            @click="handleShowImage(scope.row[item.value], item.label)"
          >
            <el-image
              v-if="scope.row[item.value]"
              class="image"
              :src="action + scope.row[item.value]"
            ></el-image>
          </div>
          <!-- 其他 -->
          <span v-else>{{
            scope.row[item.value] || scope.row[item.value] === 0
              ? formatterText(item, scope.row, scope.row[item.value])
              : "-"
          }}</span>
        </template>
        <template
          v-if="
            item.type === 'multiHeader' && item.children && item.children.length
          "
        >
          <el-table-column
            v-for="(childItem, childIndex) in item.children"
            :key="childIndex"
            :formatter="childItem.formatter"
            :prop="childItem.value"
            :label="childItem.label"
            align="center"
            :width="childItem.width"
            :min-width="childItem.minWidth || '85px'"
          >
            <template v-if="childItem.type === 'slot'" v-slot="scope">
              <slot
                :name="'col-' + childItem.value"
                :row="scope.row"
                :$index="scope.$index"
              />
            </template>
          </el-table-column>
        </template>
      </el-table-column>
<!--      // :width="handle.width || '100'"-->
      <el-table-column
        v-if="handle"
        :key="'handle'"
        :fixed="handle.fixed"
        align="center"
        :label="handle.label"
        :width="initWidth"
        class="fix-right-table"
      >
        <template v-slot="scope">
          <div
            class="optionDivDialogTable"
            style="white-space: nowrap; display: inline-block"
          >
            <template v-for="(item, handleIndex) in handle.btList">
              <!-- 自定义操作类型 -->
              <slot
                v-if="item.slot"
                :name="'bt-' + item.name"
                :data="{ item, row: scope.row, $index: scope.$index }"
              />
              <el-popconfirm
                v-if="item.popconfirmText"
                :key="handleIndex"
                placement="bottom-end"
                :title="item.popconfirmText"
                icon="WarningFilled"
                width="200px"
                @confirm="item.event(scope.row, scope.$index)"
              >
                <template #reference>
                  <!-- 操作按钮 -->
                  <span
                    v-if="
                      !item.slot &&
                      item.show &&
                      (!item.ifRender || item.ifRender(scope.row, scope.$index))
                    "
                    :key="handleIndex + Math.random()"
                    class="table-button"
                  >{{ item.label }}</span
                  >
                </template>
              </el-popconfirm>
              <span
                v-if="
                  !item.popconfirmText &&
                  !item.slot &&
                  item.show &&
                  (!item.ifRender || item.ifRender(scope.row, scope.$index))
                "
                :key="handleIndex + Math.random()"
                class="table-button"
                @click="item.event(scope.row, scope.$index)"
                >{{ item.label }}</span
              >
            </template>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <template v-if="pager">
      <div v-show="!listInfo.loading" class="pagination-container">
        <el-pagination
          :background="true"
          v-model:current-page="listInfo.query.pageNo"
          :page-sizes="listInfo.pageSizes"
          :page-size="listInfo.query.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="listInfo.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
    <EleGallery
      v-if="dialogInfo.visible"
      v-model:show-dialog="dialogInfo.visible"
      :file-list="dialogInfo.list"
      :title="dialogInfo.label"
      :multiple-sheets="false"
    />
  </div>
</template>

<script setup name="DialogTable">
import SelectModel from "../SelectModel/index";
import EleGallery from "../UploadImg/eleGallery";
import _ from "lodash";
import axios from "axios";
const { proxy } = getCurrentInstance();
const emits = defineEmits();
const store = useStore();
const props = defineProps({
  // 自定义类名
  className: {
    type: String,
  },
  checkBoxFixed: {
    type: String,
    default: "left",
  },
  // 刷新
  refresh: {
    type: Number,
  },
  // 获取数据的接口
  api: {
    type: Function,
  },
  // 是否显示序号
  tabIndex: {
    type: Boolean,
    default: false,
  },
  rowClassName: {
    type: Function,
  },
  // 是否有选择框
  checkBox: {
    type: Boolean,
    default: true,
  },
  rowKey: {
    type: String,
    default: "id",
  },
  // 选中列表
  checkedList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 复选框是否可以勾选回调函数
  selectable: {
    type: Function,
  },
  // 单选行
  highlightRow: {
    type: Boolean,
    default: false,
  },
  // 表格字段配置
  fieldList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 操作栏配置
  handle: {
    type: Object,
  },
  // 是否分页
  pager: {
    type: Boolean,
    default: true,
  },
  // 重置当前页
  initCurpage: {
    type: Number,
  },
  // 查询条件
  query: {
    type: Object,
    default: () => {
      return {};
    },
  },
  // 列表数据
  data: {
    type: Array,
    default: () => {
      return [];
    },
  },
  // 监听高度
  listenHeight: {
    type: Boolean,
    default: true,
  },
  isCompareChecked: {
    //针对selectDepotStorage做兼容
    type: Boolean,
    default: false,
  },
  loadData: {
    type: Boolean,
    default: true,
  },
  spanMethod: {
    type: Function,
  },
  //是否合计数据
  summary: {
    type: Boolean,
    default: false,
  },
  //合计的字段，为空则合计所有数字字段
  summaryFieldList: {
    type: Array,
    default: function () {
      return [];
    },
  },
  mergeFiled: {
    type: Array,
    default: function () {
      return [];
    },
  },
  mergeData: {
    type: Object,
    default: function () {
      return {};
    },
  },
  reserveSelection: {
    type: Boolean,
    default: false,
  },
  refObj: {
    type: Object,
    default: function () {
      return {};
    },
  },
  maxHeight: {
    type: Number,
    default: 365,
  },
  isRowClickSelect: {
    type: Boolean,
    default: true,
  },
  hasRowTableClickCallback: {
    type: Boolean,
    default: false,
  },
});
const systemConfig = ref(store.state.permission.systemConfig);
const tableHeight = ref("365px");
// 列表相关
const listInfo = ref({
  // tableHeight: tableHeight.value - 62, // 表格最大高度
  total: 0, // 总条数
  loading: false, // 加载动画
  pageSizes: [10, 20, 50, 100, 300, 500, 1000], // 分页数量列表
  query: {
    // 查询条件
    pageNo: 1, // 当前页
    pageSize: 20, // 每页条数
  },
});
const tableRandom = ref("tableNum" + Math.random() * 1000);
const numberRules = ref({
  validator: proxy.$validate.positive,
  trigger: "blur,change",
});
const moneyRules = ref({
  validator: proxy.$validate.positiveMoney,
  trigger: "blur,change",
});
const action = ref(axios.defaults.baseURL + "/pub");
const dialogInfo = ref({
  visible: false,
  title: "",
  list: [],
})
const isShowTooltip = ref(false)

function formatterText(column, row, val) {
  // 自定义格式化
  if (column.formatter) return column.formatter(row)
  // 数字类型 居右 转换千分位
  if(column.align === "right") return proxy.$fn.TripartiteMethod(val)
  return val
}
watch(
  () => props.initCurpage,
  (val) => {
    listInfo.value.query.pageNo = 1
  }
);
watch(
  () => props.refresh,
  (val) => {
    console.log(val)
    if (!props.api) return
    getList(props.api).catch()
  },
  {
    // 避免页面初次进入重复请求接口的问题，影响较大，大部分页面都会在页面中进行调用，少部分页面无调用请求列表方法推荐在页面中进行调用而不是在组件中调用
    // immediate: true,
  }
);
const isShowRenderHeader = ref(false);
watch(
  () => JSON.parse(JSON.stringify(props.data || [])),
  (newData, oldData = []) => {
    const newDataCopy = proxy.$fn.deepClone(newData);
    const oldDataCopy = proxy.$fn.deepClone(oldData);
    const newDataCopyFilterUuid = newDataCopy.map((item) => {
      delete item.uuid;
      return item;
    });
    const oldDataCopyFilterUuid = oldDataCopy.map((item) => {
      delete item.uuid;
      return item;
    });
    if (
      JSON.stringify(newDataCopyFilterUuid) !=
      JSON.stringify(oldDataCopyFilterUuid)
    ) {
      flexColumnWidth(newData.length);
    }
    // 将table实例返回到父级
    emits("update:refObj", proxy.$refs.table);
  },
  {
    deep: true, // 深度监听
  }
);

const initWidth = ref(120);
function flexColumnWidth(length) {
  if (props.handle && length > 0) {
    proxy.$nextTick(() => {
      setTimeout(() => {
        //查找出操作栏内带class为operation的dom元素
        const operations = document.getElementsByClassName(
          "optionDivDialogTable"
        );
        // console.log(operations)
        if (!operations.length) return;
        let maxValue = 46;
        operations.forEach((item) => {
          if (item.offsetWidth > maxValue) {
            maxValue = item.offsetWidth;
          }
        });
        initWidth.value = maxValue + 26;
      }, 300);
    });
  }
}


function handleSetWidth() {
  resizeObserver1.value = new ResizeObserver((entries) => {
    proxy.$nextTick(() => {
      if(props.handle) {
        setWidth();
      }
    });
  });
  resizeObserver1.value.observe(
    document.getElementsByClassName("table-container")[0]
  );
}
function setWidth() {
  const operations = document.getElementsByClassName("optionDivDialogTable");
  // console.log(operations)
  if (!operations.length) return;
  let maxValue = 46;
  operations.forEach((item) => {
    if (item.offsetWidth > maxValue) {
      maxValue = item.offsetWidth;
    }
  });
  console.log(maxValue);
  initWidth.value = maxValue + 26;
}

function handleShowImage(url, label) {
  //查看图片
  if (!url) return;
  dialogInfo.value.visible = true;
  dialogInfo.value.list = [
    {
      name: url,
      url: action.value + url,
      uid: new Date().getTime() + (1 + Math.random()),
    },
  ];
  dialogInfo.value.label = label;
}
// 处理参数200
function handleParams() {
  const obj = {};
  for (const key in props.query) {
    if (
      props.query[key] ||
      props.query[key] === 0 ||
      props.query[key] === false
    ) {
      obj[key] = proxy.$fn.isString(props.query[key])
        ? proxy.$fn.setTrim(props.query[key])
        : proxy.$fn.setTrimObj(props.query[key], key);
      if (
        key === "queryDtoList" &&
        props.query.queryDtoList &&
        props.query.queryDtoList.length
      ) {
        obj.queryMap = {};
      }
    }
  }
  // 如果不需要分页，则无分页相关参数
  return props.pager
    ? { ...obj, ...listInfo.value.query, curPage: listInfo.value.query.pageNo }
    : { ...obj, pageNo: 1, pageSize: 999999 }
}
function getList(api) {
  // listInfo.value.loading = true
  return new Promise((resolve, reject) => {
    // 每次调用接口时都自动绑定最新的数据
    api(handleParams())
      .then((res) => {
        // listInfo.value.loading = false
        if (res.success) {
          // 使外面可以访问到表格数据
          const arr = Array.isArray(res.data) ? res.data : res.data.result;
          emits("update:data", arr);
          if (props.pager) {
            listInfo.value.total = res.total
            listInfo.value.query.pageNo = res.pageNo - 0
            listInfo.value.query.pageSize = res.pageSize - 0
          }
          emits("pageInfo", {
            total: res.total,
            pageNo: res.pageNo,
            pageSize: res.pageSize,
          });
          console.log(props.checkedList);
          // 设置当前选中项
          const rows = arr.filter(
            (row) => props.checkedList.includes(row.id) || row.disabled
          );
          console.log(rows)
          if (rows.length) {
            proxy.$nextTick(() => {
              rows.forEach((row) =>
                proxy.$refs.table.toggleRowSelection(row, true)
              );
            });
          }
          resolve(res);
          emits("handleEvent", "list", arr);
        } else {
          // proxy.$message({
          //   showClose: true,
          //   message: res.message,
          //   type: "error",
          //   duration: 3500
          // });
          reject();
        }
      })
      .catch(() => {
        reject();
        // listInfo.value.loading = false
      });
  });
}
function getAddLisy(row) {
  if (!props.isRowClickSelect || !props.checkBox) return;
  if (!row.disabled) {
    // 利用回调完成合并单元格的点击
    props.hasRowTableClickCallback
      ? emits("handleEvent", "rowTableClick", row)
      : proxy.$refs.table.toggleRowSelection(row);
  } else {
    console.log("已添加了");
  }
}
function handleSizeChange(val) {
  const query = listInfo.value.query
  query.pageSize = val // 每页条数
  query.pageNo = 1 // 每页条数切换，重置当前页
  getList(props.api).catch()
}
function handleCurrentChange(val) {
  listInfo.value.query.pageNo = val // 当前页
  getList(props.api).catch()
}
// // 派发按钮点击事件
//function  handleClick(event, data) {
//     emits('handleClick', event, data)
// },
function clickSelect(rows, row) {
  if (props.isCompareChecked) {
    emits("handleEvent", "compareChecked", { rows: rows, row: row });
  } else {
    emits("handleEvent", "tableCheckSelect", rows);
  }
}
// 复选框发生变化时触发
function handleSelectionChange(rows) {
  emits("handleEvent", "tableCheck", rows);
}
// 行双击事件
function handelTableRowDbClick(row, event, column) {
  emits("dbClick", row, event, column);
}
// 选中行
function clickRow(row) {
  if (props.highlightRow) {
    emits("handleEvent", "tableClickRow", row);
  } else {
    return;
  }
}
//合计数据
function getSummaries({ columns, data }) {
  const sums = [];
  if (props.summaryFieldList.length === 0) return sums;
  columns.forEach((column, index) => {
    let arrIndex = -1;
    let priceIndex = -1;
    if (typeof props.summaryFieldList[0] === "string") {
      arrIndex = _.findIndex(props.summaryFieldList, column.property);
    } else if (typeof props.summaryFieldList[0] === "object") {
      arrIndex = _.findIndex(props.summaryFieldList, function (o) {
        if (o.value === column.property && o.show === "false") {
          priceIndex = index;
        }
        return o.value === column.property;
      });
    }
    if (arrIndex !== -1) {
      const values = data.map((item) => Number(item[column.property]));
      let formatter = props.summaryFieldList[arrIndex].formatter || "";
      if (!values.every((value) => isNaN(value))) {
        sums[index] = values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!isNaN(value)) {
            if (formatter) {
              return proxy.$fn.accAdd(
                proxy.$fn.TripartiteReturnNumber(formatter(prev)),
                proxy.$fn.TripartiteReturnNumber(formatter(curr))
              );
            } else {
              return proxy.$fn.accAdd(prev, curr);
            }
          } else {
            return prev;
          }
        }, 0);
        if (formatter) {
          sums[index] = formatter(sums[index]);
        }
      } else {
        sums[index] = "";
      }
    }
    if (priceIndex != -1) {
      sums[priceIndex] = "";
    }
  });
  if (props.checkBox) {
    sums[1] = "合计";
  } else {
    sums[0] = "合计";
  }
  return sums;
}
function defaultSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (props.spanMethod) {
    return props.spanMethod({ row, column, rowIndex, columnIndex });
  } else {
    if (props.mergeFiled.length === 0) {
      return [1, 1];
    }
    if (props.mergeFiled.includes(column.property)) {
      const detailCellsMergeData = props.mergeData[row.productId];
      if (detailCellsMergeData) {
        if (rowIndex === detailCellsMergeData.startIndex) {
          return {
            rowspan: detailCellsMergeData.rowspan,
            colspan: 1,
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
      }
    }
  }
}
// 根据页面的头部, 功能框, 分页组件等高度，计算出table的高度
function getTableHeight() {
  // 当表格存在的时候才执行操作
  if (document.getElementsByClassName("el-table").length === 0) {
    return;
  }
  if (document.getElementsByClassName("table-height").length === 0) {
    return;
  }
  const boxH = document.getElementsByClassName("table-height")[0].clientHeight;
  const searchH = document.getElementsByClassName("page-filter")[0]
    ? document.getElementsByClassName("page-filter")[0].clientHeight
    : 0;
  const pagerH = document.getElementsByClassName("pagination-container")[0] || {
    clientHeight: 0,
  };
  const bottomH = pagerH.clientHeight ? pagerH.clientHeight : 0;
  return boxH - searchH - bottomH - 40;
}
function changePrice(str) {
  emits("handleEvent", "changePrice", str);
}
function toggleRowSelection(row, target) {
  proxy.$refs.table.toggleRowSelection(row, target);
}
function setCurrentRow(row, target) {
  proxy.$refs.table.setCurrentRow(row, target);
}
function clearSelection() {
  proxy.$refs.table.clearSelection();
}
function setListInfoTotal(val) {
  listInfo.total = val;
}
function onMouseOverTable(refName) {
  let parentWidth = proxy.$refs["parent" + refName][0].offsetWidth;
  let contentWidth = proxy.$refs[refName][0].offsetWidth;
  // 判断是否开启tooltip功能
  if (contentWidth > parentWidth) {
    isShowTooltip.value = false;
  } else {
    isShowTooltip.value = true;
  }
}
const resizeObserver1 = ref(null);
onMounted(() => {
  // window.onresize = () => {
  //   tableHeight.value = document.body.clientHeight - 224
  // };
  handleSetWidth();
});

onActivated(() => {
  handleSetWidth();
});
onUpdated(() => {
  handleSetWidth();
});


defineExpose({
  toggleRowSelection,
  setCurrentRow,
  clearSelection,
  setListInfoTotal,
});
</script>

<style lang="scss" scoped>
// 自定义表格相关
.table-container {
  //   height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  > .el-table {
    flex: 1;
  }
  > .el-table::before {
    display: none;
  }
  .pagination-container {
    padding: 15px 0 0;
  }
  // :deep(.el-table-fixed-column--right) {
  //   min-width: 68px;
  //   display: block;
  // }
}
.showImage {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  .image {
    max-width: 40px !important;
    max-height: 40px !important;
  }
}
.bgimg {
  background-image: url(../../assets/image/no-img.png);
  background-repeat: no-repeat;
  background-size: 20px 20px;
  background-position: 50% 50%;
}
.reprotTable {
  justify-content: space-around;
  height: 90%;
}
</style>
