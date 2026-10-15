<template>
  <div
      class="table-wrapper"
      :id="tableId"
      :class="className"
      :style="{ height: isDynamic ? tableContainerHeight + 'px' : '100%' }"
  >
    <!-- 表格 -->
    <vxe-table
        ref="table"
        :data="data"
        :border="border"
        :row-config="{
        keyField: rowKey,
        isHover: true,
        useKey: true,
        isCurrent: highlightRow,
      }"
        :tree-config="tree ? treeConfig : undefined"
        height="100%"
        :cell-config="{ height: rowHeight, showOverflow: true, tooltip: true }"
        :virtual-y-config="{ enabled: true, gt: 20, mode: 'scroll' }"
        :virtual-x-config="{ enabled: true }"
        :optimize="true"
        :keep-source="false"
        :show-footer="summary"
        :footer-method="getSummaries"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        :column-config="{ resizable: true }"
        @current-row-change="clickRow"
        @checkbox-change="handleSelectionChange"
        @checkbox-all="handleSelectionChange"
        @sort-change="sortChange"
        @row-dblclick="rowDblclick"
    >
      <!-- 选择框列 -->
      <vxe-column
          v-if="checkBox"
          type="checkbox"
          fixed="left"
          width="40"
          align="center"
          :reserve-checkbox="reserveSelection"
      />

      <!-- 序号列 -->
      <vxe-column
          v-if="tabIndex && !tree"
          type="seq"
          fixed="left"
          width="60"
          align="left"
          title="序号"
      />

      <!-- 动态列 -->
      <vxe-column
          v-for="(item, index) in visibleFieldList"
          :key="index"
          :field="item.value"
          :title="item.label"
          :fixed="item.fixed"
          :align="item.align || 'left'"
          :width="item.width"
          :min-width="item.minWidth || 120"
          :formatter="item.formatter"
          :tree-node="tree && index === 0"
      >
        <template #header="scope">
          <div>
            <el-tooltip
                placement="top"
                :content="item.label"
            >
              <div :ref="'parent' + item.value" class="ellipse-text">
                <span style="color: var(--el-color-danger); margin-right: 4px;" v-if="item.required || !!item.rules?.find(it => it.required)">*</span>
                <span :ref="item.value">{{ item.label }}</span>
              </div>
            </el-tooltip>
          </div>
        </template>
        <template #default="scope">
          <!-- 插槽自定义列 -->
          <template v-if="item.type === 'slot'">
            <slot
                :name="'col-' + item.value"
                :row="scope.row"
                :item="item"
                :$index="scope.rowIndex"
            />
          </template>
            <el-form-item
                v-if="item.type === 'number'"
                :prop="`data.${scope.$rowIndex}[${item.value}]`"
                :rules="item.rules ? item.rules : numberRules"
            >
              <el-input-number
                  v-model="scope.row[item.value]"
                  style="width: 100px; margintop: 18px"
                  controls-position="right"
                  :precision="item.precision || 0"
                  :min="item.min || 0"
                  :step="1"
                  :max="item.max || 9999999"
                  :disabled="item.editControl ? item.editControl(scope.row) : false"
              />
            </el-form-item>
            <!--金额-->
            <el-form-item
                v-else-if="item.type === 'money'"
                class="input-money"
                :prop="`data.${scope.$rowIndex}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
            >
              <el-input-number
                  v-model.lazy="scope.row[item.value]"
                  type="number"
                  style="minwidth: 100px; margintop: 18px"
                  controls-position="right"
                  :min="item.min || -99999999999999"
                  :step="1"
                  :precision="item.precision ? item.precision : 2"
                  :disabled="item.editControl ? item.editControl(scope.row) : false"
                  :max="item.max || 999999999999999"
                  @change="changePrice(scope.row, item)"
              >
              </el-input-number>
            </el-form-item>
            <el-form-item
                v-else-if="item.type === 'date'"
                class="input-money"
                :prop="`data.${scope.$rowIndex}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
            >
              <!-- 日期选择框 -->
              <el-date-picker
                  v-model="scope.row[item.value]"
                  :value-format="item.valueFormat ? item.valueFormat : 'YYYY-MM-DD'"
                  :type="item.dateType ? item.dateType : 'date'"
                  :disabled="item.editControl ? item.editControl(scope.row) : false"
              />
            </el-form-item>
            <el-form-item
                v-else-if="item.type === 'input'"
                class="input-money"
                :prop="`data.${scope.$rowIndex}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
            >
              <el-input
                  v-model="scope.row[item.value]"
                  :maxlength="item.maxlength || 50"
                  :disabled="item.editControl ? item.editControl(scope.row) : false"
                  @input="(e) => (scope.row[item.value] = validSe(e))"
              />
            </el-form-item>
            <el-form-item
                v-else-if="item.type === 'select-model'"
                class="input-money"
                :prop="`data.${scope.$rowIndex}[${item.value}]`"
                :rules="item.rules ? item.rules : []"
            >
              <select-model
                  v-model="scope.row[item.value]"
                  :type-code="item.code"
                  :only-show-option="item.onlyShowOption"
                  :clearable="item.clearable === false ? item.clearable : true"
                  :check-default="item.checkDefault ? item.checkDefault : false"
                  :multiple="item.multiple"
                  @change="item.event && item.event(item, scope.row)"
                  :disabled="item.editControl ? item.editControl(scope.row) : false"
              />
            </el-form-item>
            <!-- 普通文本渲染 -->
            <span v-else-if="item.type !== 'slot'" :title="scope.row[item.value]" class="cell-ellipsis">
            {{
                formatCellValue(
                    scope.row,
                    scope.column,
                    item,
                    scope.row[item.value],
                    scope.rowIndex,
                )
              }}
          </span>
        </template>
      </vxe-column>

      <!-- 操作列 -->
      <vxe-column
          v-if="hasHandle"
          fixed="right"
          :title="handle.label || '操作'"
          :width="handle.width"
          align="left"
      >
        <template #default="scope">
          <div class="optionDiv" style="white-space: nowrap">
            <template
                v-if="
                processedHandleLists[tree ? scope.row.id : scope.rowIndex] &&
                processedHandleLists[tree ? scope.row.id : scope.rowIndex].length <= 3
              "
            >
              <template
                  v-for="(item, index) in processedHandleLists[tree ? scope.row.id : scope.rowIndex]"
                  :key="index"
              >
                <el-popconfirm
                    v-if="item.popconfirmText"
                    :title="item.popconfirmText"
                    :key="index"
                    placement="bottom-end"
                    icon="WarningFilled"
                    width="200px"
                    @confirm="item.event(scope.row, scope.rowIndex)"
                >
                  <template #reference>
                    <span class="table-button">
                      {{ item.label }}
                    </span>
                  </template>
                </el-popconfirm>
                <span
                    v-else
                    class="table-button"
                    @click="item.event(scope.row, scope.rowIndex)"
                >
                  {{ item.label }}
                </span>
              </template>
            </template>
            <template v-else-if="processedHandleLists[tree ? scope.row.id : scope.rowIndex]">
              <template
                  v-for="(item, index) in processedHandleLists[
                  tree ? scope.row.id : scope.rowIndex
                ].slice(0, 2)"
                  :key="index"
              >
                <el-popconfirm
                    v-if="item.popconfirmText"
                    :title="item.popconfirmText"
                    :key="index"
                    placement="bottom-end"
                    icon="WarningFilled"
                    @confirm="item.event(scope.row, scope.rowIndex)"
                >
                  <template #reference>
                    <span class="table-button">
                      {{ item.label }}
                    </span>
                  </template>
                </el-popconfirm>
                <span
                    v-else
                    class="table-button"
                    @click="item.event(scope.row, scope.rowIndex)"
                >
                  {{ item.label }}
                </span>
              </template>
              <el-tooltip
                  v-if="processedHandleLists[tree ? scope.row.id : scope.rowIndex] && processedHandleLists[tree ? scope.row.id : scope.rowIndex].slice(2).length"
                  :ref="'tooltipDown' + (tree ? scope.row.id : scope.rowIndex)"
                  trigger="click"
                  placement="bottom"
                  effect="light"
                  popper-class="tooltipDownBox"
              >
                <template #content>
                  <div
                      v-for="(item, index) in processedHandleLists[
                      tree ? scope.row.id : scope.rowIndex
                    ].slice(2)"
                      :key="index"
                      @click="hideTooltipDown(tree ? scope.row.id : scope.rowIndex)"
                  >
                    <div
                        v-if="item.popconfirmText"
                        class="tooltipDownItem"
                        @click="confirmHandle(item, scope)"
                    >
                      {{ item.label }}
                    </div>
                    <div
                        v-else
                        class="tooltipDownItem"
                        @click="item.event(scope.row, scope.rowIndex)"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </template>
                <span class="iconfont more tooltipFont">&#xe617;</span>
              </el-tooltip>
            </template>
          </div>
        </template>
      </vxe-column>
    </vxe-table>
    <!-- 分页组件 -->
    <template v-if="isShowPage && pager">
      <div class="pagination-container">
        <el-pagination
            :background="true"
            :current-page="listInfo.query.pageNo"
            :page-sizes="listInfo.pageSizes"
            :page-size="listInfo.query.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="listInfo.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup name="TableContainerVxe">
import _ from "lodash";
import { ElMessageBox } from "element-plus";
import SelectModel from "@/components/SelectModel/index.vue";

const emits = defineEmits([
  "update:data",
  "pageInfo",
  "handleEvent",
  "sizeAndCurrentChange",
  "sortChange",
  "rowDblclick",
]);

const { proxy } = getCurrentInstance();
const props = defineProps({
  className: { type: String, default: "" },
  border: { type: Boolean, default: true },
  rowKey: { type: String, default: "index" },
  align: { type: String, default: "center" },
  fieldList: { type: Array, default: () => [] },
  pager: { type: Boolean, default: true },
  pageTotal: { type: Number, default: 0 },
  query: { type: Object, default: () => ({}) },
  data: { type: Array, default: () => [] },
  checkBox: { type: Boolean, default: true },
  tabIndex: { type: Boolean, default: false },
  reserveSelection: { type: Boolean, default: false },
  handle: {
    type: Object,
    default: () => ({
      label: "操作",
      width: 150,
      btList: [],
    }),
  },
  // 选中列表
  checkedList: {
    type: Array,
    default: () => {
      return [];
    },
  },
  checkedKey: {
    type: [String, Boolean],
    default: () => {
      return "id";
    },
  },
  tableHeight: { type: Number, default: 0 },
  // 若无插槽展示输入框校验，默认为32，否则默认为0自适应
  rowHeight: { type: Number, default: 32 },
  refresh: { type: Number },
  // 重置当前页
  initCurpage: {
    type: Number,
  },
  api: { type: Function },
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
  isDynamic: {
    type: Boolean,
    default: false,
  },
  addHeight: {
    type: Number,
    default: 54,
  },
  rowClassName: {
    type: Function,
  },
  cellClassName: {
    type: Function,
  },
  // 单选行
  highlightRow: {
    type: Boolean,
    default: false,
  },
  // 是否开启点击行选中/取消选中功能
  isRowClickSelect: {
    type: Boolean,
    default: false,
  },
  btnCode: {
    type: String,
    default: "",
  },
  tree: {
    type: Boolean,
    default: false,
  },
  expandTree: {
    type: Boolean,
    default: false,
  },
});
const listInfo = ref({
  total: props.pageTotal || 0,
  pageSizes: [10, 20, 50, 100, 300, 500, 1000],
  query: { pageNo: 1, pageSize: 20 },
});
const resizeObserver = ref(null);
const topHeight = ref("");
const tableId = ref(`table-container-height-${_.uniqueId()}`);
const tableContainerHeight = ref(600);
const isShowPage = ref(false);

// 缓存可见列配置
const visibleFieldList = computed(() => {
  return props.fieldList.filter((item) => !item.hidden);
});

// 缓存是否有操作列
const hasHandle = computed(() => {
  return props.handle?.btList && props.handle.btList.length > 0;
});

const treeConfig = computed(() => {
  if (!props.tree) return null;
  return {
    children: "children",
    keyField: "id",
    indent: 20,
    expandAll: props.expandTree,
  };
});
// 将 getHanleList 转换为接收参数并返回处理后数据的纯函数
const processHandleList = (list, rowData) => {
  if (!list || !list.length) return [];
  let newList = list.filter((item) => {
    let isShow = item.show && (!item.ifRender || item.ifRender(rowData));
    return isShow;
  });
  // 根据按钮权重排序
  return newList;
};
const buildHandleMap = (data, result) => {
  if (!data || !data.length) return;
  data.forEach((row) => {
    const key = props.tree ? row.id : row[props.rowKey];
    if (key) {
      result[key] = processHandleList(props.handle.btList, row);
    }
    if (row.children && row.children.length > 0) {
      buildHandleMap(row.children, result);
    }
  });
};

const processedHandleLists = computed(() => {
  const result = {};
  if (props.handle && props.handle.btList && props.data) {
    if (props.tree) {
      buildHandleMap(props.data, result);
    } else {
      props.data.forEach((row, index) => {
        result[index] = processHandleList(props.handle.btList, row);
      });
    }
  }
  return result;
});

// 监听刷新
watch(
    () => props.refresh,
    () => {
      if (props.api) getList();
    },
    { immediate: true },
);

// 监听总条数
watch(
    () => props.pageTotal,
    (val) => {
      listInfo.value.total = val > 0 ? val : 0;
    },
);
watch(
    () => props.initCurpage,
    () => {
      listInfo.value.query.pageNo = 1;
    },
);
watch(() => props.checkedList, (val) => {
  if(!props.api) {
    setDefaultChecked(props.data)
  }
})
watch(() => props.data, (val) => {
  proxy.$nextTick(() => {
    proxy.$refs.table?.updateFooter()
    if (props.tree && proxy.$refs.table) {
      proxy.$refs.table?.refreshColumn('handle')
    }
  })
}, {deep: true})

onMounted(() => {
  handleStyle();
});
// 切换多tab
onActivated(() => {
  handleStyle();
});
onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
});

const numberRules = reactive({
  validator: proxy.$validate.positive,
  trigger: "blur,change",
});
const moneyRules = reactive({
  validator: proxy.$validate.positiveMoney,
  trigger: "blur,change",
});

// 处理设置表格自适应样式
function handleStyle() {
  if (!props.isDynamic) return;
  try {
    // 使用 ref 获取元素更安全
    const targetElement = document.getElementById("fundBox");
    if (!targetElement) return;
    // 创建 ResizeObserver 实例
    resizeObserver.value = new ResizeObserver((entries) => {
      setTimeout(() => {
        isShowPage.value = true;
        setStyle();
      }, 0);
    });
    resizeObserver.value.observe(targetElement);
    document.querySelectorAll(".page-filter").forEach((elem) => {
      resizeObserver.value.observe(elem);
    });
  } catch (error) {
    console.error("Failed to observe element resize:", error);
  }
}
// 计算表格自适应高度
function setStyle() {
  proxy.$nextTick(() => {
    topHeight.value = document
        .getElementById(tableId.value)
        ?.getBoundingClientRect().top;
    if (!topHeight.value) {
      return;
    }
    if (document.body.clientHeight - topHeight.value + props.addHeight < 250) {
      tableContainerHeight.value = 250;
    } else {
      tableContainerHeight.value =
          document.body.clientHeight - topHeight.value + props.addHeight;
    }
    if (proxy.$refs.table) {
      // 使用 setTimeout 确保 DOM 更新完成后再刷新
      setTimeout(() => {
        proxy.$refs.table?.refreshColumn();
      }, 0);
    }
  });
}
// 单元格值格式化
function formatCellValue(row, column, item, cellValue, index) {
  // 空值处理
  if (cellValue === null || cellValue === undefined || cellValue === "") {
    return "-";
  }
  // 优先使用列配置的 formatter 函数
  if (typeof item.formatter === "function") {
    return item.formatter(row, column, cellValue, index);
  }
  // 数字类型 居右 转换千分位
  if(item.align === "right") return proxy.$fn.TripartiteMethod(cellValue)
  return cellValue;
}
// 处理参数200
const handleParams = () => {
  const obj = {};
  for (const key in props.query) {
    if (
        props.query[key] ||
        props.query[key] === 0 ||
        props.query[key] === false
    ) {
      if (key === "pageNo") {
        listInfo.value.query.pageNo = props.query["pageNo"] || 1;
        listInfo.value.query.pageSize = props.query["pageSize"] || 20;
      }
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
  return props.pager ? { ...listInfo.value.query, ...obj } : obj;
};
// 获取列表
function getList() {
  if (!props.api) return;
  props
      .api(handleParams(), props.btnCode)
      .then((res) => {
        if (res.success) {
          // 使外面可以访问到表格数据
          const arr = Array.isArray(res.data)
              ? res.data
              : res.data.result
                  ? res.data.result
                  : res.data.list;
          emits("update:data", arr);
          if (props.pager) {
            listInfo.value.total = res.total;
            listInfo.value.query.pageNo = res.pageNo - 0;
            listInfo.value.query.pageSize = res.pageSize - 0;
            emits("pageInfo", {
              total: listInfo.value.total,
              pageNo: listInfo.value.query.pageNo,
              pageSize: listInfo.value.query.pageSize,
            });
            if (!arr.length && res.pageNo > 1) {
              if (res.pageNo > res.totalPages) {
                listInfo.value.query.pageNo = res.totalPages;
              } else {
                listInfo.value.query.pageNo = res.pageNo - 1;
              }
              getList(api);
            }
          }
          setDefaultChecked(arr);
          emits("handleEvent", "list", arr);
        }
      })
      .catch((err) => {
        console.error("获取列表失败:", err);
      })
      .finally(() => {});
}
function setDefaultChecked(arr) {
  if (props.checkedKey) {
    if(!props.checkedList.length) {
      clearCheckbox()
      return
    }
    const rows =
        arr.filter(
            (row) =>
                props.checkedList.includes(row[props.checkedKey]) || row.disabled,
        ) || [];
    if (rows.length) {
      proxy.$nextTick(() => {
        rows.forEach((row) => toggleRowSelection(row, true));
      });
    }
  }
}
function hideTooltipDown(index) {
  proxy.$refs["tooltipDown" + index].hide();
}
function confirmHandle(item, scope) {
  ElMessageBox.confirm(item.popconfirmText, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
      .then(() => {
        item.event(scope.row, scope.$rowIndex);
      })
      .catch((e) => {});
}
// 分页大小变化
function handleSizeChange(val) {
  listInfo.value.query.pageSize = val;
  listInfo.value.query.pageNo = 1;
  emits("pageInfo", { pageSize: val, pageNo: 1 });
  emits("sizeAndCurrentChange");
  if (props.api) getList();
}
// 页码变化
function handleCurrentChange(val) {
  listInfo.value.query.pageNo = val;
  emits("sizeAndCurrentChange");
  if (props.api) getList();
}
// 选中行
function clickRow({ row }) {
  if (props.isRowClickSelect && props.checkBox) {
    toggleRowSelection(row);
  } else if (props.highlightRow) {
    emits("handleEvent", "tableClickRow", row);
  } else {
    return;
  }
}
const changePrice = (row, item) => {
  emits("handleEvent", "changePrice", row, item);
};
// 复选框发生变化时触发
function handleSelectionChange() {
  const $table = proxy.$refs.table;
  if ($table) {
    const records = $table.getCheckboxRecords();
    console.log(23232323);
    console.log(records);
    emits("handleEvent", "tableCheck", records);
  }
}
// 排序变化
function sortChange(column, prop, order) {
  emits("sortChange", column, prop, order);
}
// 双击行
function rowDblclick(row) {
  emits("rowDblclick", row);
}
function clearCheckbox() {
  proxy.$refs.table?.clearCheckboxRow();
}
function getCheckboxRecords() {
  return proxy.$refs.table?.getCheckboxRecords() || [];
}
function clearSort() {
  proxy.$refs.table?.clearSort();
}
function reloadData() {
  if (props.api) getList();
}
// 现有的 toggleRowSelection 方法 (保持原有逻辑或微调)
function toggleRowSelection(row, bool) {
  const $table = proxy.$refs.table;
  if ($table) {
    // 如果传入了 bool，则设置为指定状态；否则切换状态
    if (bool !== undefined) {
      $table.setCheckboxRow(row, bool);
    } else {
      // VXETable 没有直接的 toggle 方法，需要获取当前状态取反
      const isChecked = $table.isCheckedByCheckboxRow(row);
      $table.setCheckboxRow(row, !isChecked);
    }
  }
}
//合计数据
const getSummaries = ({ columns, data }) => {
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
      let summaryNum = props.summaryFieldList[arrIndex].summaryNum;
      if (summaryNum) {
        sums[index] = summaryNum;
      } else {
        if (!values.every((value) => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              if (formatter) {
                return proxy.$fn.accAdd(
                    proxy.$fn.TripartiteReturnNumber(
                        formatter(prev, column, "", "", true),
                    ),
                    proxy.$fn.TripartiteReturnNumber(
                        formatter(curr, column, "", "", true),
                    ),
                );
              } else {
                return proxy.$fn.accAdd(prev, curr);
              }
            } else {
              return prev;
            }
          }, 0);
          if (formatter) {
            sums[index] = formatter(sums[index], column, column, "", "", true);
          }
        } else {
          sums[index] = "";
        }
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
  return [sums];
};
defineExpose({
  toggleRowSelection,
  clearCheckbox,
  getCheckboxRecords,
  clearSort,
  handleStyle,
  setStyle,
});
</script>

<style lang="scss" scoped>
.table-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  box-sizing: border-box;

  > .vxe-table {
    flex: 1;
    min-height: 0;
  }

  .pagination-container {
    padding: 8px 0;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .optionDiv {
    .el-button + .el-button {
      margin-left: 8px;
    }
  }
}
.table-wrapper {
  // ... 原有样式
  :deep(.vxe-table--footer) {
    background-color: #f5f7fa;
    font-weight: bold;

    .vxe-table--footer-cell {
      background-color: #f5f7fa;
    }
  }
}
.cell-ellipsis {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
// 自定义表格相关
.table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 16px 8px;
  background-color: #fff;
  box-sizing: border-box;
  > .el-table {
    flex: 1;
  }
  > .el-table::before {
    display: none;
  }
  .pagination-container {
    padding: 1px 0;
  }
}
</style>
