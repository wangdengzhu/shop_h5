//默认图片域名
const IMAGE_DOMAIN = IMAGE_BASE_URL || 'https://devimg.manjd.net/';

//懒加载默认图片
const IMAGE_DEFAULT_OBJ = {
	I_LOADING: '190-190/2017701.png',
	I_200: '200-200/2017101.png',
	I_300: '300-300/2017201.png',
	I_750_300: '750-300/2017301.png',
	I_750_330: '750-330/2017401.png',
	I_750: '750-750/2017501.png',
	I_800: '800-800/2017601.png'
};

Object.keys(IMAGE_DEFAULT_OBJ).forEach(t=>{
	IMAGE_DEFAULT_OBJ[t] = IMAGE_DOMAIN + 'default/' + IMAGE_DEFAULT_OBJ[t];
});

export const IMAGE_DEFAULT = IMAGE_DEFAULT_OBJ;

//接口返回错误码
export const ERR = {
	NORMAL: 1, //正常结果
	UNAUTHORIZED: 401, //TOKEN失效
	SHOPID_INVALID: 402, //shopid 失效既无此店铺

	VERICODE_INVALID: -621, //验证码失效
	VERICODE_ERR: -620, //验证码错误
	VERICODE_LIMITEDERR: 3101, //验证码达到上限
	VERICODE_IPERR: 3102, //验证码IP达到上限

	USRINFO_GET_FAIL: 3122, //获取用户信息失败

	GOODS_NO_RESULT: 3309, //没找到商品,
	GOODS_NOT_FOUND:3301, //商品不存在

	ADDR_NUM_LIMITED: 3158, //地址达到上限

	CARTS_NUM_LIMIT: 3401, //购物车商品上限，店铺为单位
	SHOP_GET_FAIL: 3402,   //店铺未找到	

	NO_GOODS_ADDR: 3604, //商品不在配送区域
	CANNOT_CHANGE_ADDR: 3605, //不允许修改地址

	ORDER_SKU_ERROR: 3611, //待付款订单支付时，SKU异常

	RETURN_HAS_ALREADY: 3802, //售后单已存在退货单	
	AS_HAS_ALREADY: 3803, //订单已存在售后单	
	AS_MONEY_BIG: 3804,    //售后单申请退款金额不能大于订单的实收金额	
	AS_MONEY_SMALL: 3805,  //售后单申请退款金额不能小于0
	EXPNO_HAS_ALREADY : 3808  //快递单号已使用过	
};

//商品和购物车购买上限
export const GOODS_NUM_LIMIT = 200;
export const CARTS_NUM_LIMIT = 99;