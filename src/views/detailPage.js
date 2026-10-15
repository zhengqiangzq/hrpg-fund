import CollectionBusinessDetail from "@/views/business/collectionBusiness/details.vue";
import BusinessPaymentStatementDetail from "@/views/business/paymentBusiness/businessPaymentStatement/details.vue";
import PayrollStatementDetail from "@/views/business/paymentBusiness/payrollStatement/details.vue";
import RegistrationSocialSecurityFundDetail from '@/views/business/paymentBusiness/registrationSocialSecurityFund/details.vue'
import BankTransferDetail from '@/views/business/debitBusiness/bankTransfer/details.vue'
import CashDepositDetail from '@/views/business/debitBusiness/cashDeposit/details.vue'
import CashWithdrawalDetail from '@/views/business/debitBusiness/cashWithdrawal/details.vue'

export const DetailPage = {
    '4201': CollectionBusinessDetail,
    '4202': BusinessPaymentStatementDetail,
    '4203': PayrollStatementDetail,
    '4204': RegistrationSocialSecurityFundDetail,
    '4205': BankTransferDetail,
    '4206': CashDepositDetail,
    '4207': CashWithdrawalDetail,
}
export const DetailPageName = {
    '4201': '收款业务单详情',
    '4202': '业务付款结算单详情',
    '4203': '薪资结算单详情',
    '4204': '社保公积金登记单详情',
    '4205': '银行划款单详情',
    '4206': '现金缴存单详情',
    '4207': '现金支取单详情',
}
