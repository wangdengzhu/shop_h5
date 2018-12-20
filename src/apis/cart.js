import { fetch,post } from '@/utils/fetch';

const cartPrefix = '/cart/m/';

const sourceURLs = {
	ADD: cartPrefix + 'add',
	BUY: cartPrefix + 'buy',
	UPDATE_CHECKED: cartPrefix + 'checked',
	UPDATE_BUYNUM: cartPrefix + 'updatenum',
	DEL: cartPrefix + 'del',
	CREATE: cartPrefix + 'createorder',
	LIST: cartPrefix + 'info',
	MODIFY: cartPrefix + 'change',
	COUNT: cartPrefix + 'count',
	FLASHLIST: cartPrefix + 'actbuyinfo',
	FLASHCREATE: cartPrefix + 'createactorder',
	JUDGEFLASHLIST: cartPrefix + 'checkflashsalebyuser',
};

const add = (data) => {
	if(typeof data !== 'object'){
		return;
	}
	return post(sourceURLs.ADD,data);
};

const buy = (data) => {
	if(typeof data !== 'object'){
		return;
	}
	return post(sourceURLs.BUY,data);
};

const getList = (data) => {
	if(typeof data !== 'object'){
		return;
	}
	return post(sourceURLs.LIST,data);
};

const updateChecked = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.UPDATE_CHECKED, data);
};

const updateNum = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.UPDATE_BUYNUM, data);
};

const del = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.DEL, data);
};

const modify = (data) => post(sourceURLs.MODIFY, data);

const createOrder = (addressid, invinfo, notelist) => {
	const resourceURL = sourceURLs.CREATE;
	return post(resourceURL, {
		addressid,
		invinfo,
		notelist
	});

};

const count = () => fetch(sourceURLs.COUNT);

//限时特惠商品订单结算页列表
const getFlashList = (skuid ,shopnum ) => {
	return post(sourceURLs.FLASHLIST,{
		skuid,
		shopnum
	});
};

//限时特惠商品判断是否已经购买
const judgeFlashList = (activityId , skuid) => {
	return post(sourceURLs.JUDGEFLASHLIST,{
		activityId,
		skuid
	});
};

//限时特惠商品订单结算
const createFlashOrder = (addressId, invinfo, skuid, shopNum, note, useincome, pwdtoken) => {
	const resourceURL = sourceURLs.FLASHCREATE;
	return post(resourceURL,{
		addressId,
		invinfo,
		skuid,
		shopNum,
		note,
		useincome,
		pwdtoken
	});
};

export default {
	add,
	buy,
	getList,
	updateChecked,
	updateNum,
	del,
	createOrder,
	modify,
	count,
	getFlashList,
	createFlashOrder,
	judgeFlashList
};