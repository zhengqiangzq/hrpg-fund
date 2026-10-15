
export function jumpToDetails(row) {
    const urls = {
        // 费用报销
        '2': {
            '借款': '/fee/personalBusiness/loan',
            '日常': '/fee/personalBusiness/reimbursement',
            '培训': '/fee/personalBusiness/reimbursement',
            '出差': '/fee/personalBusiness/reimbursement',
            '出国': '/fee/personalBusiness/reimbursement',
            '会议': '/fee/personalBusiness/reimbursement',
            '差旅': '/fee/personalBusiness/reimbursement',
            '预付-物资': '/fee/corporateBusiness/prepaymentManage',
            '预付-药品': '/fee/corporateBusiness/prepaymentManage',
            '预付-资产': '/fee/corporateBusiness/prepaymentManage',
            '预付-合同': '/fee/corporateBusiness/prepaymentManage',
            '预付-其他': '/fee/corporateBusiness/prepaymentManage',
            '对公-物资': '/fee/corporateBusiness/corporatePayApplication/materialPayment',
            '对公-药品': '/fee/corporateBusiness/corporatePayApplication/drugPayment',
            '对公-资产': '/fee/corporateBusiness/corporatePayApplication/assetPayment',
            '对公-合同': '/fee/corporateBusiness/corporatePayApplication/contractPayment',
            '对公-其他': '/fee/corporateBusiness/corporatePayApplication/otherPayment',
        }[row.businessType],
        // 应付
        '3': '/fn/BusinessReconciliation/Payment/PaymentDocEntry',
        // 薪酬
        '4': '/hr/SalaryManagement/Issue/SalaryPayment'
    }
    window.$wujie?.bus.$emit('turnMessagePage', {
        businessId: row.otherOrderId,
        urlType: 'detail',
        detailUrl: urls[row.businessSource],
        doNotSwitch: true
    })
}
