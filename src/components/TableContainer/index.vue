<template>
  <div
    class="table-container"
    :id="tableId"
    :class="[className, state.tableRandom]"
    :style="{ height: isDynamic ? tableContainerHeight + 'px' : 'auto' }"
  >
    <!-- 显示表格 -->
    <el-table
      v-show="fieldList.filter((item) => !item.hidden).length > 0"
      ref="table"
      v-loading="listInfo.loading"
      :data="data"
      :border="border"
      :show-summary="summary"
      :summary-method="getSummaries"
      :row-key="rowKey"
      :tree-props="treeProps"
      :expand-row-keys="!isGroupSearch ? expands : []"
      :highlight-current-row="highlightRow"
      :span-method="defaultSpanMethod"
      :row-class-name="rowClassName"
      @row-click="getAddLisy"
      @current-change="clickRow"
      @select="clickSelect"
      @expand-change="exChange"
      @selection-change="handleSelectionChange"
      @sort-change="sortChange"
      @header-dragend="headerDragend"
      @rowDblclick="rowDblclick"
    >
      <el-table-column
        v-if="checkBox"
        :reserve-selection="reserveSelection"
        type="selection"
        fixed="left"
        width="40"
        align="center"
        :selectable="selectable"
      />
      <el-table-column
        v-if="tabIndex"
        :key="'index'"
        align="center"
        fixed="left"
        label="序号"
        type="index"
        :width="fieldList.length === 0 ? '' : 60"
      >
        <template v-slot="scope">
          <slot name="header-index" v-bind="scope">
            <span>{{
                scope.$index +
                1 +
                (listInfo.query.pageNo - 1) * listInfo.query.pageSize
              }}</span>
          </slot>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isGroupSearch"
        :key="'isGroupSearch'"
        align="left"
        fixed="left"
        :label="groupLabel"
        :prop="groupValue"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column
        v-for="(item, index) in fieldList.filter((item) => {
          if (!isGroupSearch) {
            return !item.hidden;
          } else {
            return !item.hidden && item.value !== props.expandKey;
          }
        })"
        :key="index + item.value || '-'"
        :prop="item.value"
        :label="item.label"
        :fixed="item.fixed"
        :formatter="item.formatter"
        :filters="item.filters"
        :filter-method="item.filterMethod"
        :header-align="item.headerAlign || 'center'"
        :align="item.align === 'right' ? 'right' : 'left'"
        :type="item.columnType"
        :width="item.width"
        :sortable="item.sortable"
        :min-width="item.minWidth || '120px'"
        :show-overflow-tooltip="!item.hiddenTooltip"
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
            <el-input-number
              v-model="scope.row[item.value]"
              :disabled="item.disabled || false"
              style="width: 100px; margintop: 18px"
              controls-position="right"
              :precision="item.precision || 0"
              :min="item.min || 0"
              :step="1"
              :max="item.max || 9999999"
            />
          </el-form-item>
          <el-form-item
            v-else-if="item.type === 'inputNumber'"
            class="margin-bottom"
          >
            <div class="page-table-input-number-wrapper">
              <div class="page-table-input-number-left">
                <div class="page-table-input-number-item">
                  <el-form-item
                    :prop="`data.${scope.$index}[${item.value}]`"
                    :rules="item.largeRules ? item.largeRules : ''"
                  >
                    <el-input-number
                      v-model="scope.row[item.largeUnitQty]"
                      style="width: 100%; margintop: 18px"
                      :disabled="item.disabled"
                      clearable
                      controls-position="right"
                      :precision="
                        scope.row.qtyOperateMode === 0 ||
                        scope.row.qtyOperateMode === 2
                          ? 0
                          : state.systemConfig.qty_show_precision
                      "
                      :min="item.min ? item.min : 0"
                      :max="
                        item.isCalculation
                          ? parseInt(
                              scope.row.needDealCalcQty /
                                scope.row.unitConvertCoefficient
                            )
                          : item.max
                          ? item.max
                          : 999999999999
                      "
                    />
                  </el-form-item>
                  <div
                    v-if="item.showUnitName"
                    class="page-table-input-number-item-unite"
                  >
                    {{ scope.row.unitName }}
                  </div>
                </div>
                <div
                  v-if="
                    scope.row.unitConvertCoefficient > 1 &&
                    scope.row.qtyOperateMode === 2
                  "
                  class="page-table-input-number-item"
                >
                  <el-form-item
                    :prop="`data.${scope.$index}[${item.value}]`"
                    :rules="item.smallRules ? item.smallRules : ''"
                  >
                    <el-input-number
                      v-model="scope.row[item.smallUnitQty]"
                      style="width: 100%; margintop: 18px"
                      :disabled="item.disabled"
                      clearable
                      controls-position="right"
                      :precision="0"
                      :min="item.min ? item.min : 0"
                      :max="
                        item.isCalculation
                          ? parseInt(
                              scope.row[item.smallUnitQty] %
                                scope.row.unitConvertCoefficient
                            )
                          : scope.row.unitConvertCoefficient - 1
                      "
                    />
                  </el-form-item>
                  <div
                    v-if="item.showUnitName"
                    class="page-table-input-number-item-unite"
                  >
                    {{ scope.row.calcUnitName }}
                  </div>
                </div>
              </div>
              <div
                v-if="item.showQty && scope.row.unitConvertCoefficient > 1"
                class="page-table-input-number-right"
              >
                {{ $fn.qtyFormatter(scope.row[item.value]) }}
              </div>
            </div>
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
              :precision="state.systemConfig.price_precision"
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
            @input="(e) => (scope.row[item.value] = validSe(e))"
          />
          <!--校验输入框-->
          <el-form-item
            v-else-if="item.type === 'inputRules'"
            :prop="`data.${scope.$index}[${item.value}]`"
            :rules="item.rules ? item.rules : numberRules"
          >
            <el-input
              v-model="scope.row[item.value]"
              style="margintop: 18px"
              :maxlength="item.maxlength || 50"
              @input="(e) => (scope.row[item.value] = validSe(e))"
            />
          </el-form-item>
          <!-- 日期选择框 -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="scope.row[item.value]"
            :value-format="item.valueFormat ? item.valueFormat : 'YYYY-MM-DD'"
            :type="item.dateType ? item.dateType : 'date'"
            :disabled-date="
              item.TimePickerOptions && item.TimePickerOptions.disabledDate
            "
          />
          <!-- 下拉选择框 -->
          <select-model
            v-else-if="item.type === 'select-model'"
            v-model="scope.row[item.value]"
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
              :src="state.action + scope.row[item.value]"
            ></el-image>
          </div>

          <!-- 其他 -->
          <span v-else>
            <span
              v-if="item.isConsigAndEst && scope.row.isConsignBusiness === 1"
              class="consignBusiness-text"
            >寄</span
            >
            <span
              v-if="
                item.isConsigAndEst && scope.row.isEstimationStockBusiness === 1
              "
              class="estimationStockBusiness-text"
            >暂</span
            >
            {{
              scope.row[item.value] || scope.row[item.value] === 0
                ? formatterText(item, scope.row, scope.row[item.value])
                : isGroupSearch
                ? ''
                : noPlaceHolder ? '' : '-'
            }}</span
          >
        </template>
        <!--表头提示-->
        <template v-if="item.labelTip" #header>
          <span v-if="item.labelTip"
          >{{ item.label
            }}<el-tooltip placement="top" effect="light">
              <template #content>
                <span v-html="item.labelTip"></span>
              </template>
              <el-icon><QuestionFilled /></el-icon></el-tooltip
            ></span>
        </template>
        <template
          v-if="
            item.type === 'multiHeader' && item.children && item.children.length
          "
          v-slot="scope"
        >
          <el-table-column
            v-for="(childItem, childIndex) in item.children"
            :key="childIndex"
            :formatter="childItem.formatter"
            :prop="childItem.value"
            :label="childItem.label"
            header-align="center"
            :align="childItem.center || 'left'"
            :sortable="childItem.sortable"
            :width="childItem.width"
            :min-width="childItem.minWidth || '85px'"
          >
            <template v-if="childItem.type === 'slot'" v-slot="scope">
              <slot
                :name="'col-' + childItem.value"
                :row="scope.row"
                :$index="scope.$index"
                :childIndex="childIndex"
                :index="index"
              />
            </template>
          </el-table-column>
        </template>
      </el-table-column>
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
            class="optionDiv"
            style="white-space: nowrap; display: inline-block"
          >
            <template
                v-if="
                processedHandleLists[scope.$index] &&
                processedHandleLists[scope.$index].length <= 3
              "
            >
              <template
                  v-for="(item, index) in processedHandleLists[scope.$index]"
                  :key="index"
              >
                <el-popconfirm
                    v-if="item.popconfirmText"
                    :title="item.popconfirmText"
                    :key="index"
                    placement="bottom-end"
                    icon="WarningFilled"
                    width="200px"
                    @confirm="item.event(scope.row, scope.$index)"
                >
                  <template #reference>
                      <span class="table-button">
                        {{ item.label }}
                      </span>
                  </template>
                </el-popconfirm>
                <template v-else>
                  <slot
                      v-if="item.slot"
                      :name="'bt-' + item.name"
                      :data="{ item, row: scope.row, $index: scope.$index }"
                  />
                  <span
                      v-else
                      class="table-button"
                      :class="item.label === '删除' ? 'deleteBtn' : ''"
                      @click.stop="item.event(scope.row, scope.$index)"
                  >{{ item.label }}
                  </span>
                </template>
              </template>
            </template>
            <template v-else-if="processedHandleLists[scope.$index]">
              <template
                  v-for="(item, index) in processedHandleLists[
                  scope.$index
                ].slice(0, 2)"
                  :key="index"
              >
                <el-popconfirm
                    v-if="item.popconfirmText"
                    :key="index"
                    placement="bottom-end"
                    :title="item.popconfirmText"
                    icon="WarningFilled"
                    @confirm="item.event(scope.row, scope.$index)"
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
                    @click="item.event(scope.row, scope.$index)"
                >
                  {{ item.label }}
                </span>
              </template>
              <el-tooltip
                  v-if="processedHandleLists[scope.$index].slice(2).length"
                  :ref="'tooltipDown' + scope.$index"
                  trigger="click"
                  placement="bottom"
                  effect="light"
                  popper-class="tooltipDownBox"
              >
                <template #content>
                  <div
                      v-for="(item, index) in processedHandleLists[
                      scope.$index
                    ].slice(2)"
                      :key="index"
                      @click="hideTooltipDown(scope.$index)"
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
                        @click="item.event(scope.row, scope.$index)"
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
      </el-table-column>
    </el-table>
    <!--总汇总-->
    <template
      v-if="
        allSummary &&
        allSummaryData.data.length &&
        fieldList.filter((item) => !item.hidden).length > 0
      "
    >
      <ul class="allSummary">
        <li
          v-for="(item, index) in allSummaryData.fieldList"
          :key="index"
          class="allSummaryItem"
        >
          <div class="allSummaryItemLabel">{{ item.label }}：</div>
          <div v-if="item.type === 'column'" class="allSummaryItemValue">
            {{ item.formatter(allSummaryData.data[0][item.value]) }}
          </div>
          <div v-else class="allSummaryItemValue">
            {{ allSummaryData.data[0][item.value] }}
          </div>
        </li>
      </ul>
    </template>
    <!-- 分页组件 -->
    <template
      v-if="
        isShowPage &&
        pager &&
        fieldList.filter((item) => !item.hidden).length > 0
      "
    >
      <div v-show="!listInfo.loading" class="pagination-container">
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
    <EleGallery
      v-if="dialogInfo.visible"
      v-model:show-dialog="dialogInfo.visible"
      :file-list="dialogInfo.list"
      :title="dialogInfo.label"
      :multiple-sheets="false"
    />
  </div>
</template>

<script setup nmae="TableContainer">
import SelectModel from '../SelectModel/index'
import EleGallery from '@/components/UploadImg/eleGallery'
import _ from 'lodash'
import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import {onBeforeUnmount} from "vue";

const emits = defineEmits();
const { proxy } = getCurrentInstance();
const props = defineProps({
  pageTotal: {
    type: Number,
    default: 0,
  },
  // 自定义类名
  className: {
    type: String,
    default: "",
  },
  // 展开列key字段
  expandKey: {
    type: String,
    default: "",
  },
  treeProps: {
    type: Object,
    default: function () {
      return {};
    },
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
  border: {
    type: Boolean,
    default: true,
  },
  // 是否显示序号
  tabIndex: {
    type: Boolean,
    default: false,
  },
  // 是否有选择框
  checkBox: {
    type: Boolean,
    default: true,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  noPlaceHolder: {
    type: Boolean,
    default: false,
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
  // 是否分组查询
  isGroupSearch: {
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
  //总汇总
  allSummary: {
    type: Boolean,
    default: false,
  },
  allSummaryData: {
    type: Object,
    default: () => {
      return {};
    },
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
  checkedRowList: {
    type: Array,
    default: () => {
      return [];
    },
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
  },
  rowClassName: {
    type: Function,
  },
  tableHeight: {
    type: Number,
    default: 0,
    //default() {
    //  return document.body.clientHeight - 260 - (props.allSummary ? 30 : 0);
    //},
  },
  isRowClickSelect: {
    type: Boolean,
    default: false,
  },
  isDynamic: {
    type: Boolean,
    default: true,
  },
  // 同步调用api，等外部通知加载列表
  sync: {
    type: Boolean,
    default: false,
  },
  addHeight: {
    type: Number,
    default: 64,
  },
})

// 列表相关
const listInfo = reactive({
  tableHeight:
    (props.tableHeight > 0
      ? props.tableHeight
      : document.body.clientHeight - 234 - (props.allSummary ? 30 : 0)) - 0, // 表格最大高度
  total: 0, // 总条数
  loading: false, // 加载动画
  pageSizes: [10, 20, 50, 100, 300, 500, 1000], // 分页数量列表
  query: {
    // 查询条件
    pageNo: 1, // 当前页
    pageSize: 20, // 每页条数
  },
});

const numberRules = reactive({
  validator: proxy.$validate.positive,
  trigger: "blur,change",
});
const moneyRules = reactive({
  validator: proxy.$validate.positiveMoney,
  trigger: "blur,change",
});

const dialogInfo = reactive({
  visible: false,
  title: "",
  list: [],
});
// 不使用reactive和ref，避免table展开不了的问题
const state = ref({
  systemConfig: proxy.$store.state.permission.systemConfig,
  action: axios.defaults.baseURL + "/pub",
  tableRandom: "tableNum" + _.uniqueId(),
});
const isShowTooltip = ref(false);
const expands = ref([]);
function formatterText(column, row, val) {
  // 自定义格式化
  if (column.formatter) return column.formatter(row)
  // 数字类型 居右 转换千分位
  if(column.align === "right") return proxy.$fn.TripartiteMethod(val)
  return val
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
      if (key === 'pageNo') {
        listInfo.query.pageNo = props.query['pageNo'] || 1
        listInfo.query.pageSize = props.query['pageSize'] || 20
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
  return props.pager ? { ...listInfo.query, ...obj, curPage: listInfo.query.pageNo } : obj
}
const getList = (api) => {
  // listInfo.loading = true
  return new Promise((resolve, reject) => {
    // 每次调用接口时都自动绑定最新的数据
    //console.log(handleParams())
    api &&
    api(handleParams())
      .then((res) => {
        // listInfo.loading = false
        if (res.success) {
          // 使外面可以访问到表格数据
          const arr = Array.isArray(res.data)
            ? res.data
            : res.data.result
              ? res.data.result
              : res.data.list
          emits('update:data', arr)
          if (props.pager) {
            listInfo.total = res.total
            listInfo.query.pageNo = res.pageNo - 0
            listInfo.query.pageSize = res.pageSize - 0
            emits('pageInfo', {
              total: listInfo.total,
              pageNo: listInfo.query.pageNo,
              pageSize: listInfo.query.pageSize,
            });
            if (!arr.length && res.pageNo > 1) {
              if (res.pageNo > res.totalPages) {
                listInfo.query.pageNo = res.totalPages
              } else {
                listInfo.query.pageNo = res.pageNo - 1
              }
              getList(api);
            }
          }
          // 设置当前选中项
          const rows = arr.filter(
            (row) => props.checkedList.includes(row.id) || row.disabled
          );
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
        // listInfo.loading = false
      });
  });
};

//树形数据显示字段
const groupLabel = computed(() => {
  return props.fieldList.find((item) => item.value === props.expandKey)?.label;
});

//树形数据显示值
const groupValue = computed(() => {
  return props.fieldList.find((item) => item.value === props.expandKey)?.value;
});

watch(
  () => props.initCurpage,
  () => {
    listInfo.query.pageNo = 1
  }
);
watch(
  () => props.refresh,
  () => {
    if (!props.api) return
    if (props.sync) {
      props.refresh && getList(props.api)
    } else {
      getList(props.api)
    }
  },
  {
    immediate: true,
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
    emits("update:refObj", proxy.$refs.table);
  },
  {
    deep: true,
  }
);

const initWidth = ref(120);
function flexColumnWidth(length) {
  if (props.handle && length > 0) {
    proxy.$nextTick(() => {
      setTimeout(() => {
        //查找出操作栏内带class为operation的dom元素
        const operations = document.getElementsByClassName("optionDiv");
        console.log(operations);
        if (!operations.length) return;
        let maxValue = 46;
        operations.forEach((item) => {
          if (item.offsetWidth > maxValue) {
            maxValue = item.offsetWidth;
          }
        })
        initWidth.value = maxValue + 26
      }, 300)
    })
  }
}

watch(
  () => props.checkedRowList,
  (val) => {
    if (val.length) {
      proxy.$nextTick(() => {
        val.forEach((row) => proxy.$refs.table.toggleRowSelection(row, true));
      });
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
watch(
  () => props.pageTotal,
  (val) => {
    if (val > 0) {
      listInfo.total = val;
    } else {
      listInfo.total = 0;
    }
  },
  {
    deep: true,
  }
);

const tableContainerHeight = ref(600);
const topHeight = ref("");
const tableId = ref(`table-container-height-${_.uniqueId()}`);
const resizeObserver = ref(null);
const resizeObserver1 = ref(null);
onMounted(() => {
  handelStyle();
  handleSetWidth();
});

// 切换多tab
onActivated(() => {
  handelStyle();
  handleSetWidth();
});
onUpdated(() => {
  // handelStyle()
  handleSetWidth();
});

onBeforeUnmount(() => {
  // 清理 ResizeObserver 实例
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
  }
  if (resizeObserver1.value) {
    resizeObserver1.value.disconnect();
  }
});

// 展开收起过滤条件
watch(
  () => proxy.$store.state.app.openFilter,
  () => {
    setStyle();
  }
);
const isShowPage = ref(false);
// 处理设置表格自适应样式
function handelStyle() {
  if (!props.isDynamic) {
    return;
  }
  resizeObserver.value = new ResizeObserver((entries) => {
    setTimeout(() => {
      // 暂时解决明细页面table高度计算有误，分页组件被遮挡，update生命周期里面的更新不能打开否则可能会内存溢出
      isShowPage.value = true;
      setStyle();
    }, 800);
  });
  resizeObserver.value.observe(
    document.getElementsByClassName('app-container')[0]
  )
  // setStyle()
  // window.onresize = () => {
  //   setStyle()
  // }
}

function handleSetWidth() {
  resizeObserver1.value = new ResizeObserver((entries) => {
    proxy.$nextTick(() => {
      if (props.handle) {
        setWidth();
      }
    });
  });
  resizeObserver1.value.observe(
    document.getElementsByClassName('table-container')[0]
  )
}
function setWidth() {
  const operations = document.getElementsByClassName("optionDiv");
  // console.log(operations)
  if (!operations.length) return;
  let maxValue = 46;
  operations.forEach((item) => {
    if (item.offsetWidth > maxValue) {
      maxValue = item.offsetWidth;
    }
  })
  initWidth.value = maxValue + 26
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
    tableContainerHeight.value =
      document.body.clientHeight - topHeight.value + props.addHeight;
  });
}
function hideTooltipDown(index) {
  proxy.$refs['tooltipDown' + index].hide()
}
function confirmHandle(item, scope) {
  ElMessageBox.confirm(item.popconfirmText, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      item.event(scope.row, scope.$index);
    })
    .catch((e) => {});
}
const headerDragend = () => {
  //当拖动表头改变了列的宽度的时候会触发该事件
  proxy.$refs.table.doLayout();
};
const handleShowImage = (url, label) => {
  //查看图片
  if (!url) return;
  dialogInfo.visible = true;
  dialogInfo.list = [
    {
      name: url,
      url: state.value.action + url,
      uid: new Date().getTime() + (1 + Math.random()),
    },
  ];
  dialogInfo.label = label;
};
const getAddLisy = (row) => {
  if (!props.isRowClickSelect || !props.checkBox) return;
  if (!row.disabled) {
    proxy.$refs.table.toggleRowSelection(row);
  } else {
    console.log("已添加了");
  }
};
const handleSizeChange = (val) => {
  const query = listInfo.query
  query.pageSize = val // 每页条数
  query.pageNo = 1 // 每页条数切换，重置当前页
  emits('pageInfo', { pageSize: val, pageNo: 1 })
  getList(props.api)
}
const handleCurrentChange = (val) => {
  // this.$nextTick(() => {
  //   let fullScreen =
  //     document.getElementsByClassName("box-scroll-y")[0] || "";
  //   if (fullScreen) {
  //     document.getElementsByClassName("box-scroll-y")[0].scrollTop = 0;
  //   } else {
  //     document.getElementsByClassName(
  //       "dialog_full_scroll_y"
  //     )[0].scrollTop = 0;
  //   }
  //   let eltable = document.getElementsByClassName("el-table")[0] || "";
  //   if (eltable) {
  //     document.getElementsByClassName("el-table")[0].scrollTop = 0;
  //   }
  // });
  listInfo.query.pageNo = val // 当前页
  getList(props.api)
  let overflowY = proxy.$el.getElementsByClassName('el-table__body-wrapper')[0]
  if (!overflowY) {
    return;
  }
  overflowY.scrollTop = 0;
};
const clickSelect = (rows, row) => {
  if (props.isCompareChecked) {
    emits("handleEvent", "compareChecked", { rows: rows, row: row });
  } else {
    emits("handleEvent", "tableCheckSelect", rows);
  }
};
// 复选框发生变化时触发
const handleSelectionChange = (rows) => {
  emits("handleEvent", "tableCheck", rows);
};
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
              return proxy.$fn.accAdd(prev, curr)
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
};
const defaultSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
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
};
// 根据页面的头部, 功能框, 分页组件等高度，计算出table的高度
const getTableHeight = () => {
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
};
const exChange = (data, expandedRows, expanded) => {
  expands.value = expandedRows.length ? [data[props.rowKey]] : []
  emits("exChange", data, expandedRows, expanded);
};
const sortChange = (column, prop, order) => {
  emits("sortChange", column, prop, order);
};
const rowDblclick = (row) => {
  emits("rowDblclick", row);
};
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
// 在模板中使用计算属性替代方法调用
const processedHandleLists = computed(() => {
  // 这里我们创建一个映射来存储每行数据的处理结果
  const result = {};
  if (props.handle && props.handle.btList && props.data) {
    props.data.forEach((row, index) => {
      result[index] = processHandleList(props.handle.btList, row);
    });
  }
  return result;
});
const getHanleList = (list, scope, str = "") => {
  if (list.length) {
    let handles = proxy.$store.state.handle.handles;
    let newList = list.filter((item, index) => {
      let isShow = item.show && (!item.ifRender || item.ifRender(scope.row));
      if (isShow) {
        if (
          handles[item.label] &&
          !Object.prototype.hasOwnProperty.call(item, "weight")
        ) {
          item.weight = handles[item.label];
        }
      }
      return isShow;
    });
    // 根据按钮权重排序
    newList.sort(function (a, b) {
      return b.weight - a.weight;
    });
    if (str === "more") {
      return newList.slice(2, newList.length);
    } else {
      return newList;
    }
  } else {
    return [];
  }
};
function onMouseOverTable(refName) {
  if (!refName) return
  let parentWidth = proxy.$refs["parent" + refName][0].offsetWidth;
  let contentWidth = proxy.$refs[refName][0].offsetWidth;
  // 判断是否开启tooltip功能
  if (contentWidth > parentWidth) {
    isShowTooltip.value = false;
  } else {
    isShowTooltip.value = true;
  }
}
const changePrice = (str) => {
  emits("handleEvent", "changePrice", str);
};
// 选中行
function clickRow(row) {
  if (props.highlightRow) {
    emits("handleEvent", "tableClickRow", row);
  } else {
    return;
  }
}
function toggleRowSelection(row, bool = true) {
  proxy.$refs["table"]
    ? proxy.$refs["table"].toggleRowSelection(row, bool)
    : "";
}
function toggleCurrentRow(row, bool = true) {
  proxy.$refs["table"] ? proxy.$refs["table"].setCurrentRow(row, bool) : "";
}
// 暴露属性，否则在线上环境父组件获取不到子组件内的方法
defineExpose({
  toggleRowSelection,
  toggleCurrentRow,
  setStyle,
});
</script>

<style lang="scss" scoped>
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
  // :deep(.el-table-fixed-column--right) {
  //   min-width: 68px;
  //   display: block;
  // }
}
.allSummary {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  box-sizing: border-box;
  background: #f5f7fa;
  .allSummaryItem {
    padding-right: 20px;
    display: flex;
    align-items: center;
  }
}
.el-dropdown-menu--mini .el-dropdown-menu__item {
  padding: 0;
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

.get-more {
  display: inline-block;
}
</style>
