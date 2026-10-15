/**
 * table表头数据
 */
import {treeOutsideStaffClass} from "@/api/basicConfiguration/outsideStaffType";
import {
    pageBankDoc,
    pageSettlementMethod,
    pageInOutItem,
    pageSupplier,
    pageCustomer,
    pageOutsideStaff,
    pageStaff,
    getDeptTree,
    pageCashAccount,
    pageBankAccount,
    pageAccountingPeriod,
    pageBankType, periodyearList, pagePeriodMonth
} from "@/api/base";
import {pageContract} from "@/api/contractApi";
import {pageBankAccountInitialization} from "@/api/accountInitialization/bankAccountInitialization";
import {pageCashAccountInitialization} from "@/api/accountInitialization/cashAccountInitialization";
import {pageBillType} from "@/api/billManagement/billType";
import moment from "moment/moment";
import {pageNotesPayable} from "@/api/billManagement/notesPayableManagement";
import {getCurrentInstance} from "vue";
import { getUserList } from "@/api/user.js"
import {allAccountBook, pageAccassItem, pageAccountingSubject, pageVoucherType} from "@/api/finance";
import {
    pageDistinctReconciliationAccountSetting
} from "@/api/reconciliationOfFunds/reconciliationAccountSetting";
import {pagePayrollRequisition} from "@/api/business/payrollRequisition";
import {pagePlanProject} from "@/api/fundPlan/planProject";

export const dataTemplate = {
    staffClass: {
        title: '人员类别',
        component: 'tree',
        api: treeOutsideStaffClass,
    },
    dept: {
        title: '科室',
        component: 'tree',
        api: getDeptTree,
    },
    accountingBook: {
        title: '账簿',
        api: allAccountBook,
        component: 'tree',
    },
    accountingPeriod: {
        title: '会计年度',
        api: pageAccountingPeriod,
        pager: false,
        fieldList: [
            { label: '会计年度', value: 'periodYear' },
            { label: '开始日期', value: 'beginDate', formatter: (row) => moment(row.beginDate).format('YYYY-MM-DD') },
            { label: '结束日期', value: 'endDate', formatter: (row) => moment(row.endDate).format('YYYY-MM-DD') },
        ]
    },
    accountingSubject: {
        title: '会计科目',
        api: pageAccountingSubject,
        pager: false,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
            { label: '全称', value: 'fullName' },
        ]
    },
    accassItem: {
        title: '辅助核算项',
        api: pageAccassItem,
        pager: false,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
        ]
    },
    bankDocType: {
        title: '银行类别',
        api: pageBankType,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        fieldList: [
            { label: '银行类别编码', value: 'code' },
            { label: '银行类别名称', value: 'name' },
        ]
    },
    bankDoc: {
        title: '开户银行',
        api: pageBankDoc,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
            { label: '银行类别编码', value: 'bankTypeCode' },
            { label: '银行类别名称', value: 'bankTypeName' },
            { label: '联行号', value: 'combineNum' },
        ]
    },
    baseCashAccount: {
        title: '现金账户',
        query: {
        },
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        api: pageCashAccount,
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
        ]
    },
    baseBankAccount: {
        title: '银行账户',
        query: {
        },
        filters: [
            { label: '编码', value: 'accCodeLike', type: 'input' },
            { label: '名称', value: 'accNameLike', type: 'input' },
        ],
        api: pageBankAccount,
        fieldList: [
            { label: '编码', value: 'accCode' },
            { label: '名称', value: 'accName' },
        ]
    },
    planProject: {
        title: '计划项目',
        query: {
        },
        filters: [
            { label: '编码', value: 'code', type: 'input' },
            { label: '名称', value: 'name', type: 'input' },
        ],
        pager: false,
        api: pagePlanProject,
        fieldList: [
            { label: '计划项目编码', value: 'code' },
            { label: '计划项目名称', value: 'name' },
        ]
    },
    cashAccount: {
        title: '现金账户',
        query: {
            enableStatus: '1',
            status: undefined,
        },
        filters: [
            { label: '编码/名称', value: 'keywords', type: 'input' },
        ],
        api: pageCashAccountInitialization,
        fieldList: [
            { label: '编码', value: 'cashAccountCode' },
            { label: '名称', value: 'cashAccountName' },
        ]
    },
    bankAccount: {
        title: '银行账户',
        query: {
            enableStatus: '1',
            status: undefined,
        },
        filters: [
            { label: '编码/名称', value: 'keywords', type: 'input' },
        ],
        api: pageBankAccountInitialization,
        fieldList: [
            { label: '银行账户编码', value: 'bankAccountCode' },
            { label: '银行账户名称', value: 'bankAccountName' },
            { label: '网银开通状态', value: 'netBankOpenStatusName' },
        ]
    },
    users: {
        title: '人员',
        query: {
        },
        filters: [
            { label: '名称', value: 'name', type: 'input' },
        ],
        api: getUserList,
        fieldList: [
            { label: '名称', value: 'name' },
            { label: '账号', value: 'accountNo' },
            { label: '部门', value: 'deptName' },
        ]
    },
    settlementMethod: {
        title: '结算方式',
        api: pageSettlementMethod,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        query: {
            status: 1
        },
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
            { label: '是否现金', value: 'cashName' },
            { label: '是否网银', value: 'netPayName' },
        ]
    },
    inOutItem: {
        title: '收支项目',
        api: pageInOutItem,
        component: 'tree',
    },
    supplier: {
        title: '供应商',
        api: pageSupplier,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        query: {
            status: 1
        },
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
            { label: '银行账号', value: 'accountNo' },
        ]
    },
    customer: {
        title: '客户',
        api: pageCustomer,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        query: {
            status: 1
        },
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
            { label: '银行账号', value: 'accountNo' },
        ]
    },
    outsideStaff: {
        title: '院外人员',
        api: pageOutsideStaff,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        query: {
            status: 1
        },
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
            { label: '银行账号', value: 'bankCardNumber' },
        ]
    },
    staff: {
        title: '院内人员',
        api: pageStaff,
        filters: [
            { label: '编码', value: 'userCodeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        query: {
            status: 1
        },
        fieldList: [
            { label: '编码', value: 'userCode' },
            { label: '名称', value: 'name' },
            { label: '银行账号', value: 'gzBankCardCode' },
        ]
    },
    billType: {
        title: '票据类型',
        api: pageBillType,
        filters: [
            { label: '编码', value: 'codeLike', type: 'input' },
            { label: '名称', value: 'nameLike', type: 'input' },
        ],
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
        ]
    },
    chequeNum: {
        title: '应付票据',
        api: pageNotesPayable,
        query: {
            status: '1',
            settlementMethodStatusIn: '1,2'
        },
        filters: [
            { label: '编码', value: 'chequeNum', type: 'input' },
        ],
        fieldList: [
            { label: '票据类型', value: 'chequeTypeName' },
            { label: '票据编码', value: 'chequeNum' },
            { label: '摘要', value: 'summary' },
            { label: '交易对象类型', value: 'tradeObjTypeValue' },
            { label: '交易对象', value: 'tradeObjName' },
            { label: '承兑银行', value: 'promiseBankName' },
            { label: '签发日期', value: 'issueTime', align: 'center', formatter: (val) => moment(val.issueTime).format('YYYY-MM-DD') },
            { label: '票面金额', value: 'chequeMoney', align: 'right', formatter: (val) => getCurrentInstance().proxy.$fn.TripartiteMethod(val.chequeMoney) },
            { label: '票面利率', value: 'chequeRate' },
            { label: '到期日期', value: 'endTime', align: 'center', formatter: (val) => moment(val.endTime).format('YYYY-MM-DD') },
            { label: '领用科室', value: 'useDeptName' },
            { label: '领用人员', value: 'useStaffName' },
        ]
    },
    fundsCompareAccount: {
        title: '账户信息',
        api: pageDistinctReconciliationAccountSetting,
        filters: [
            { label: '账户编码/名称', value: 'cashBankName', type: 'input' },
        ],
        fieldList: [
            { label: '银行账户编码', value: 'bankAccountCode' },
            { label: '银行账户名称', value: 'bankAccountName' },
            { label: '现金账户编码', value: 'cashAccountCode' },
            { label: '现金账户名称', value: 'cashAccountName' },
            { label: '账户设置状态', value: 'statusValue' },
        ]
    },
    voucherType: {
        title: '凭证类型',
        api: pageVoucherType,
        pager: false,
        fieldList: [
            { label: '编码', value: 'code' },
            { label: '名称', value: 'name' },
        ]
    },
    payrollRequisition: {
        title: '请款单',
        api: pagePayrollRequisition,
        query: {
            useStatusIn: '0,1'
        },
        pager: true,
        fieldList: [
            { label: '业务单号', value: 'orderNo' },
            { label: '业务日期', value: 'orderTime', align: 'center', formatter: (val) => moment(val.orderTime).format('YYYY-MM-DD') },
            { label: '业务来源', value: 'businessTypeValue' },
            { label: '业务类型', value: 'businessSource' },
            { label: '发票号', value: 'invoiceNum' },
            { label: '交易对象类型', value: 'tradeTypeValue' },
            { label: '交易对象', value: 'tradeObjectName' },
            { label: '支付金额', value: 'money', align: 'right', formatter: (val) => getCurrentInstance().proxy.$fn.TripartiteMethod(val.money) },
            { label: '使用状态', value: 'useStatusValue' },
        ]
    },
    contract: {
        title: '合同',
        api: pageContract,
        query: {
            status: 6,
            isEffect: 1,
            businessType: 1
        },
        filters: [
            { label: '合同编码', value: 'code', type: 'input' },
            { label: '合同名称', value: 'name', type: 'input' },
            { label: '合同业务类型', value: 'businessType', type: 'select-model', code: 'contract_business_type_new', clearable: false },
            { label: '对方单位', value: 'oppositeOrgName', type: 'input' },
            { label: '金额', value: 'amount', type: 'numberrange' },
        ],
        fieldList: [
            { label: '合同编码', value: 'code' },
            { label: '合同名称', value: 'name' },
            { label: '合同类型', value: 'contractCategoryName' },
            { label: '对方单位', value: 'oppositeOrgName' },
            { label: '合同金额', value: 'amount', align: 'right' },
            { label: '采购部门', value: 'signDeptName' },
            { label: '承办部门', value: 'responseDeptName' },
            { label: '状态', value: 'statusValue' },
            { label: '合同生效日期', value: 'contractStartDate' },
            { label: '合同失效日期', value: 'contractEndDate' },
            { label: '来源合同编号', value: 'sourceOrderNo' },
            { label: '归档状态', value: 'archiveStatusValue' },
        ]
    },
    accountingPeriodMonth: {
        title: '会计期间',
        api: periodyearList,
        query: {
            sort: 'begin_date desc'
        },
        component: 'treeTable',
        pager: true,
        filters: null,
        fieldList: [
            { label: '会计期间', value: 'periodYearAndMonth' },
            { label: '开始日期', value: 'beginDate', formatter: (row) => moment(row.beginDate).format('YYYY-MM-DD') },
            { label: '结束日期', value: 'endDate', formatter: (row) => moment(row.endDate).format('YYYY-MM-DD') },
        ]
    }
}

