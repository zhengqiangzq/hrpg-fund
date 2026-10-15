import { defineAsyncComponent } from 'vue'
// 要异步导入的全局组件
const asyncComponentPathArr = [
  // 业务付款结算单-详情页
  {
    name: 'fundsPaymentOrderDetail',
    path: () =>
        import('/src/views/business/paymentBusiness/businessPaymentStatement/details.vue'),
  },
  // 业务付款结算单-编辑页
  {
    name: 'fundsPaymentOrderModify',
    path: () =>
        import('/src/views/business/paymentBusiness/businessPaymentStatement/modify.vue'),
  },
  // 薪资结算单-详情页
  {
    name: 'fundsPayrollOrderDetail',
    path: () =>
        import('/src/views/business/paymentBusiness/payrollStatement/details.vue'),
  },
  // 薪资结算单-编辑页
  {
    name: 'fundsPayrollOrderModify',
    path: () =>
        import('/src/views/business/paymentBusiness/payrollStatement/modify.vue'),
  },
  // 银行划款-详情页
  {
    name: 'fundsBankOrderDetail',
    path: () =>
        import('/src/views/business/debitBusiness/bankTransfer/details.vue'),
  },
  // 银行划款-编辑页
  {
    name: 'fundsBankOrderModify',
    path: () =>
        import('/src/views/business/debitBusiness/bankTransfer/modify.vue'),
  },
  // 现金缴存-详情页
  {
    name: 'fundsCashDepositOrderDetail',
    path: () =>
        import('/src/views/business/debitBusiness/cashDeposit/details.vue'),
  },
  // 现金缴存-编辑页
  {
    name: 'fundsCashDepositOrderModify',
    path: () =>
        import('/src/views/business/debitBusiness/cashDeposit/modify.vue'),
  },
  // 现金支取-详情页
  {
    name: 'fundsCashDraworderDetail',
    path: () =>
        import('/src/views/business/debitBusiness/cashWithdrawal/details.vue'),
  },
  // 现金支取-编辑页
  {
    name: 'fundsCashDraworderModify',
    path: () =>
        import('/src/views/business/debitBusiness/cashWithdrawal/modify.vue'),
  },
]

function installFlow(app) {
  asyncComponentPathArr.forEach((item) => {
    app.component(item.name, defineAsyncComponent(item.path))
  })
}
export { installFlow }
