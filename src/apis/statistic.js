import { fetch, post } from '@/utils/fetch';

const statisticPrefix = '/statistic/m/';

const sourceURLs = {
	SHOP: statisticPrefix + 'viewshop',
	DETAIL: statisticPrefix + 'viewsku',
	LOGINLOG: '/user/m/writeloginlog'
};

const shop = () => fetch(sourceURLs.SHOP);

const detail = (skuId, spuId) => fetch(sourceURLs.DETAIL, {
	skuId: skuId,
	spuId: spuId
});

const loginLog = () => post(sourceURLs.LOGINLOG);

export default {
	shop,
	detail,
	loginLog
}