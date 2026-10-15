import request from '@/utils/request'

const basicHost = `${import.meta.env.VITE_APP_BASIC_API}`
const baseURL = `/api/contract`

let cacheCustomerConfig = null

function getCustomerConfig(code) {
    return request({
        url: basicHost + '/customize/user/getSetting',
        params: { tableKey: code }
    })
}

/**
 * 请求合同系统分页接口
 * @param params
 * @returns {*}
 */
export async function pageContract(params) {
    if (!cacheCustomerConfig) {
        const { data } = await getCustomerConfig('payContractList-com.slip.hrp.vo.CoreContractVO')
        cacheCustomerConfig = data
    }
    return request({
        baseURL,
        url: '/contract/customizeList/page',
        method: 'post',
        data: {
            ...params,
            customizeUserVO: cacheCustomerConfig,
            queryMap: {
                status: {
                    "queryType": "IN",
                    "value": "6"
                },
                isEffect: {
                    "queryType": "IN",
                    "value": "1",
                    "queryCategory": "AND",
                    "asTbName": "core_contract",
                    "columnName": "is_effect"
                },
                amount: {
                    "queryType": "BETWEEN",
                    "value": [params.amount[0] ?? 0, params.amount[1] ?? 99999999999].join(',')
                },
                code: {
                    "queryType": "ALL_LIKE",
                    "value": params.code,
                    "queryCategory": "AND",
                    "asTbName": "core_contract",
                    "columnName": "code"
                },
                name: {
                    "queryType": "ALL_LIKE",
                    "value": params.name,
                    "queryCategory": "AND",
                    "asTbName": "core_contract",
                    "columnName": "name"
                },
                oppositeOrgType: {
                    "queryType": "IN",
                    "value": params.oppositeOrgType,
                    "queryCategory": "AND",
                    "asTbName": "core_contract",
                    "columnName": "opposite_org_type"
                },
                oppositeOrgId: {
                    "queryType": "IN",
                    "value": params.oppositeOrgId,
                    "queryCategory": "AND",
                    "asTbName": "core_contract",
                    "columnName": "opposite_org_id"
                },
                oppositeOrgName: {
                    "queryType": "ALL_LIKE",
                    "value": params.oppositeOrgName,
                    "queryCategory": "AND",
                    "asTbName": "core_contract",
                    "columnName": "opposite_org_name"
                },
                businessType: {
                    "queryType": "IN",
                    "value": params.businessType,
                    "queryCategory": "AND",
                    "asTbName": "core_contract_category",
                    "columnName": "business_type"
                }
            },
        }
    })
}
