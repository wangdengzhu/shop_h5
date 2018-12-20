import { fetch,post } from '@/utils/fetch';

const goodsPrefix = '/goods/m/';
const detailPrefix = '/goodsdetail/m/';

const sourceURLs = {
	GOODS_CATALOG: goodsPrefix + 'cate',
	GOODS_LIST: goodsPrefix + 'navi/goods',
	GOODS_LIST_BY_BRAND: goodsPrefix+ 'getgoodslistbyid',
	GOODS_SEARCH: goodsPrefix + 'search',
	GOODS_SEARCH_HOT: goodsPrefix + 'gethotsearch',
	GOODS_DETAIL: detailPrefix + 'info',
	GOODS_SPU: detailPrefix + 'skulist',
	SHOP_HANDLEPICKED: goodsPrefix + 'mychoices',
	INDEX_MOD: goodsPrefix + 'main',
	BRAND_LIST: goodsPrefix + 'getbrandlist',
	GUESS_LIKE: goodsPrefix + 'getlikelist',
	BRAND_HANDLEPICKED: goodsPrefix + 'getchosenbrandlist',
	BRAND_HOT: goodsPrefix + 'gethotbrandlist',
	MONTH_HOT: goodsPrefix + 'getmonthpopularlist',
	GOODS_HOT: goodsPrefix + 'gethotsalelist',
	SINGLE_HOT: goodsPrefix + 'hot',
	NEW_GOODS: goodsPrefix + 'new',
	ACTIVITY_GOODS:goodsPrefix + 'activities/goods',
	ACTIVITY_PAGE:goodsPrefix + 'activities/h5page',
	COMMENT: '/comment/m/list',
	FLASH_GOODS:'/activity/m/flashsalegoods',
	FLASH_GOODS_DETAIL:'/activity/m/flashsalegoodsspu',
	SORT_GOODS: goodsPrefix + 'sort/goods',
	AGGRE_GOODS: goodsPrefix + 'sort/aggre',
	PERSONNAL_GOODS: goodsPrefix + 'personnal',
	PERSONNAL_GOODS_MORE: goodsPrefix + 'personnal/more',
};

// 个性化商品
const getGoodsPersonnal = (provinceid = 0, cityid = 0) => fetch(sourceURLs.PERSONNAL_GOODS, {
	provinceid,
	cityid
});

// 个性化商品更多
const getGoodsPersonnalMore = (data, provinceid = 0, cityid = 0) => {
	const params = Object.assign(data, {
		provinceid,
		cityid
	});
	return post(sourceURLs.PERSONNAL_GOODS_MORE, params);
};

const getSortAggreGoods = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.AGGRE_GOODS, data);
}

const getSortGoods = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.SORT_GOODS, data);
}

const getCatalogue = (type = 0) => fetch(sourceURLs.GOODS_CATALOG, {
	type
});

const getListByCatalogId = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.GOODS_LIST, data);
};

const getGoodsByBrand = (data) => {
	if (typeof data !== 'object') {
		return;
	}
	return post(sourceURLs.GOODS_LIST_BY_BRAND, data);
};

const getSearchData = (data) => {
	if(typeof data !== 'object'){
		return;
	}
	return post(sourceURLs.GOODS_SEARCH,data);
};

const getHotSearch = ()=> fetch(sourceURLs.GOODS_SEARCH_HOT);

const getDetailInfo = (skuid=0, spuid,sign) => {
	return post(sourceURLs.GOODS_DETAIL, {
		skuid: skuid,
		spuid: spuid,
		sign:sign
	});
};

const getGoodsSpu = (spuid,sign) => {
	if (!spuid) {
		return;
	}
	return fetch(sourceURLs.GOODS_SPU, {
		spuid,
		sign
	});
};

const getShopHandpicked = (pageindex,pagesize, actiontype) => post(sourceURLs.SHOP_HANDLEPICKED, {
	pageindex,
	actiontype,
	pagesize
});

const getIndexMod = (provinceid = 0, cityid = 0) => fetch(sourceURLs.INDEX_MOD, {
	provinceid,
	cityid
});

const getBrandList = (pageindex, pagesize, provinceid = 0, cityid = 0) => post(sourceURLs.BRAND_LIST, {
	pageindex,
	pagesize,
	provinceid,
	cityid
});

const getGuessLike = (provinceid = 0, cityid = 0) => fetch(sourceURLs.GUESS_LIKE, {
	provinceid,
	cityid
});

const getBrandHandpicked = (pageindex, pagesize, provinceid = 0, cityid = 0)=> post(sourceURLs.BRAND_HANDLEPICKED,{
	pageindex,
	pagesize,
	provinceid,
	cityid
});

// 品牌热销榜
const getBrandHot = (provinceid = 0, cityid = 0) => fetch(sourceURLs.BRAND_HOT, {
	provinceid,
	cityid
});

// 本月爆款
const getMonthHot = (provinceid = 0, cityid = 0) => fetch(sourceURLs.MONTH_HOT, {
	provinceid,
	cityid
});

// 热销榜
const getGoodsHot = (provinceid = 0, cityid = 0) => fetch(sourceURLs.GOODS_HOT, {
	provinceid,
	cityid
});

// 火爆单品
const getSingleHot = (data, provinceid = 0, cityid = 0) => {
	const params = Object.assign(data, {
		provinceid,
		cityid
	});
	return post(sourceURLs.SINGLE_HOT, params);
};

// 新品推荐
const getNewGoods = (data, provinceid = 0, cityid = 0) => {
	const params = Object.assign(data, {
		provinceid,
		cityid
	});
	return post(sourceURLs.NEW_GOODS, params);
};

// 活动专题背景图片
const getH5page = (activityid) => {
	return fetch(sourceURLs.ACTIVITY_PAGE, {activityid});
};

// 活动专题
const getActivityGoods = (activityid) => {
	return fetch(sourceURLs.ACTIVITY_GOODS, {activityid});
};

const getComment = (params) => {
	return post(sourceURLs.COMMENT, params)
};

//限时抢购列表
const getFlashGoods = (type) => {
	return fetch(sourceURLs.FLASH_GOODS, {type});
};

//限时抢购详情
const getFlashDetailInfo = (spuid) => {
	if (!spuid) {
		return;
	}
	return fetch(sourceURLs.FLASH_GOODS_DETAIL, {
		spuid
	});
};

export default {
	getCatalogue,
	getListByCatalogId,
	getSearchData,
	getHotSearch,
	getDetailInfo,
	getGoodsSpu,
	getShopHandpicked,
	getIndexMod,
	getBrandList,
	getGuessLike,
	getGoodsByBrand,
	getBrandHandpicked,
	getBrandHot,
	getMonthHot,
	getGoodsHot,
	getSingleHot,
	getNewGoods,
	getComment,
	getActivityGoods,
	getH5page,
	getFlashGoods,
	getFlashDetailInfo,
	getSortGoods,
	getSortAggreGoods,
	getGoodsPersonnal,
	getGoodsPersonnalMore
};