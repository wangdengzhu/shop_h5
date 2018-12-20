import { fetch, post } from '@/utils/fetch';

const basePath = '/onlineservice/m/';

const sourceURLs = {
	ASSIGN: basePath + 'getassignservicer',
    GOODS_BROWSE: basePath + 'getgoodsbrowse',
    ORDER_LIST: basePath + 'getorderlist',
    UPLOAD: basePath + 'upload',
    HISTORY: basePath + 'gethistorymessagelist',
    DETAIL: basePath + 'getsku',
    ORDER_DETAIL: basePath + 'getorderdetail',
    COMMENT: basePath + 'setsatisfaction',
    WX_UPLOAD: basePath + 'miniupload'
};

const assignServicer = (serviceType, sessionId) => fetch(sourceURLs.ASSIGN, { serviceType, sessionId });

const getGoodsBrowse = (pageindex = 1, pagesize = 10) => fetch(sourceURLs.GOODS_BROWSE, {
    pageindex,
    pagesize
});

const getOrderList = params => fetch(sourceURLs.ORDER_LIST, params);

const getIMConfig = () => fetch('/im/m/getimgrantconfig');

const uploadImage = (width, height, formData) => {
    const url = sourceURLs.UPLOAD + `?width=${width}&height=${height}`;
    return post(url, formData);
};

const getHistoryMessage = params => fetch(sourceURLs.HISTORY, params);

const getGoodsDetail = skuid => fetch(sourceURLs.DETAIL, { skuid });

// 1.订单列表，2.售后订单
const getOrderDetail = (type, bizno, skuid) => fetch(sourceURLs.ORDER_DETAIL, {
    type,
    bizno,
    skuid
});

const comment = (sessionId, value) => fetch(sourceURLs.COMMENT, {
    sessionId,
    value
});

const downloadImageFromWX = (mediaId) => {
    const url = sourceURLs.WX_UPLOAD + `?mediaId=${mediaId}`;
    return post(url);
}

export default {
    assignServicer,
    getGoodsBrowse,
    getOrderList,
    getIMConfig,
    uploadImage,
    getHistoryMessage,
    getGoodsDetail,
    getOrderDetail,
    comment,
    downloadImageFromWX
};