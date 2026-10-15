import {defineAsyncComponent} from "vue";

export default {
    'collectionOrder': loadComponent(import('@/views/business/collectionBusiness')), // 收款业务
    'paymentOrder': loadComponent(import('@/views/business/paymentBusiness/businessPaymentStatement')), // 业务付款结算单
    'payrollOrder': loadComponent(import('@/views/business/paymentBusiness/payrollStatement')), // 薪资结算单
    'socialOrder': loadComponent(import('@/views/business/paymentBusiness/registrationSocialSecurityFund')), // 社保公积金登记
    'bankOrder': loadComponent(import('@/views/business/debitBusiness/bankTransfer')), // 银行划款
    'cashDepositOrder': loadComponent(import('@/views/business/debitBusiness/cashDeposit')), // 现金缴存
    'cashDrawOrder': loadComponent(import('@/views/business/debitBusiness/cashWithdrawal')), // 现金支取
    'payableChequeBegin': loadComponent(import('@/views/billManagement/initialNotesPayable')), // 期初应付票据
    'payableChequeAfter': loadComponent(import('@/views/billManagement/notesPayableManagement')), // 应付票据管理
    'linkSettlement': loadComponent(import('@/views/directlyConnectBankAndHospital/paymentAndSettlement')), // 付款结算
    'linkSettlementOnline': loadComponent(import('@/views/directlyConnectBankAndHospital/onlinePayment')), // 网上支付
    'eBankPayRecord': loadComponent(import('@/views/directlyConnectBankAndHospital/onlineBankingPaymentInstructionStatusSheet')), // 网银支付指令状态单
    'eBankPayConfirm': loadComponent(import('@/views/directlyConnectBankAndHospital/ebankReceipt')), // 网银支付确认单
    'accountingBillRecord': loadComponent(import('@/views/reconciliationOfFunds/billManagement/unitJournal')), // 单位日记账
    'bankBillRecord': loadComponent(import('@/views/reconciliationOfFunds/billManagement/bankStatement')), // 银行对账单
    'cashBillRecord': loadComponent(import('@/views/reconciliationOfFunds/billManagement/cashiersJournal')), // 出纳日记账
    'balanceAdjust': loadComponent(import('@/views/reconciliationOfFunds/reconciliationStatement')), // 余额调节表

    // 票据编码组
    billPageCode: ['payableChequeBegin', 'payableChequeAfter'],
    // 对账账户编码组
    accountPageCode: ['accountingBillRecord', 'bankBillRecord', 'cashBillRecord', 'balanceAdjust']
}

function loadComponent(source) {
    return defineAsyncComponent(() => source)
}