import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import local from '@/utils/store';
import { wxShare } from '@/utils/wxShare';
import { isWXBrowser, getCookie, getQueryParam, setCookie, removeCookie } from '@/utils/common';
import Index from '@/views/index';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({
	showSpinner:!1
});

const Home = () => import('@/views/home/home.vue');
const Category = () => import('@/views/category/category.vue');
const More = () => import('@/views/more/more.vue');
const Shop = () => import('@/views/shop/shop.vue');
const Search = () => import('@/views/search/search.vue');
const SearchResult = () => import('@/views/search/search-result.vue');
const Login = () => import('@/components/Login');
const Agreement = () => import('@/views/agreement/agreement.vue');
const GoodsDetail = ()=> import('@/views/goods-detail/goods-detail.vue');
const Cart = ()=> import('@/views/cart/cart.vue');
const Order = ()=> import('@/views/order/order.vue');
const AddrSelect = ()=> import('@/views/order/children/order-detail-addr.vue');
const Invoice = ()=> import('@/views/order/children/invoice.vue');
const Payment = ()=>import('@/views/payment/payment.vue');
const PayResult = () => import('@/views/pay-result/pay-result.vue');
const Addr = () => import('@/views/order/children/address.vue');
const AddrTag = () => import('@/views/address/addr-tags.vue');
const NewAddr = ()=> import('@/views/order/children/children/new-address.vue');
const EditAddr = ()=> import('@/views/order/children/children/edit-address.vue');
const PubAddr = () => import('@/views/address/address.vue');
const PubNewAddr = ()=> import('@/views/address/children/new-address.vue');
const PubEditAddr = ()=> import('@/views/address/children/edit-address.vue');
const Profile = ()=> import('@/views/profile/profile.vue');
const ProfileSetting = ()=> import('@/views/profile/setting.vue');
const ProfileUsername = ()=> import('@/views/profile/username.vue');
const OpenShop = ()=> import('@/views/openshop/openshop.vue');
const About = ()=> import('@/views/about/about.vue');
const OrderList = ()=> import('@/views/order-list/order-list.vue');
const OrderDetail = ()=> import('@/views/order-detail/order-detail.vue');
const ExpressDetail = ()=> import('@/views/order-detail/children/express-detail.vue');
const OrderDetailAddr = ()=> import('@/views/order-detail/children/order-detail-addr.vue');
const ApplyAfterAddr = ()=> import('@/views/order-detail/children/apply-after-sale.vue');
const AfterSale = ()=> import('@/views/after-sale/after-sale-list.vue');
const AfterSaleDetail = ()=> import('@/views/after-sale/after-sale-detail.vue');
const AfterSaleExpress = ()=> import('@/views/after-sale/after-sale-express.vue');
const AfterSaleApply = ()=> import('@/views/after-sale/after-sale-apply.vue');
const AfterSaleAddress = ()=> import('@/views/after-sale/after-sale-address.vue');
const NotFound404 = ()=> import('@/views/404/404.vue');
const Operate = ()=> import('@/views/operator.vue');

const Brand = () => import('@/views/brand/brand.vue');
const BrandHot = () => import('@/views/brand/brand-hot.vue');
const MonthTop = () => import('@/views/rank/month-top.vue');
const GoodsTop = () => import('@/views/rank/goods-top.vue');
const SingleHot = () => import('@/views/rank/single-hot.vue');
const GoodsNew = () => import('@/views/rank/goods-new.vue');

const BrandGoods = () => import('@/views/brand/brand-goods.vue');

const GoodsComments = () => import('@/views/goods-detail/children/comments.vue');

const Help = () => import('@/views/help/help.vue');
const HelpCateList = () => import('@/views/help/children/list.vue');
const HelpDetail = () => import('@/views/help/children/children/detail.vue');

const MyEvaluation = () => import('@/views/evaluate/my-evaluation.vue');
const Evaluate = () => import('@/views/evaluate/evaluate.vue');

const Chat = () => import('@/views/cs-chat/cs-chat.vue');

const Activity = () => import('@/views/activity/activity.vue');

const FlashSale = () => import('@/views/flash-sale/flash-sale.vue');

const Personnal = () => import('@/views/rank/goods-personnal.vue');
const Recommend = () => import('@/views/rank/goods-recommend.vue');
const Introduce = () => import('@/views/introduce/introduce.vue');


Vue.use(Router);

NProgress.inc(0.2)
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false });

window.onpageshow = function(event) {
    if (event.persisted) {
        // window.location.reload() 
        NProgress.done();
    }
};

const scrollBehavior = (to, from, savedPosition)=>{
	if (savedPosition) {
		return savedPosition
	} else {
		const position = {x:0,y:0}
		if (to.hash) {
			position.selector = to.hash
		}
		if (to.matched.some(m => m.meta.scrollToTop)) {
			position.x = 0
			position.y = 0
		}
		if (from.meta.keepAlive) {
			from.meta.savedPosition = document.body.scrollTop;
		}
		if(to.meta.savedPosition){
			position.y = to.meta.savedPosition;
		}
		return position;
	}
};

const router = new Router({
	routes: [{
		path: '/',
		component: Index,
		children: [{
			path: '',
			redirect: 'home'
		}, {
			path: 'home',
			component: Shop,
			meta: {
				title: '满金店',
				keepAlive: !0
			}
		},{
			path:'introduce',
			component: Introduce,
			meta:{
				title:'了解满金店'
			}
		},{
			path:'goods-recommend',
			component: Recommend,
			meta:{
				title:'店主精选'
			}
		},{
			path:'goods-personnal',
			component: Personnal,
			meta:{
				title:'更多商品'
			}
		},{
			path: 'flash-sale',
			component: FlashSale,
			meta: {
				title: '限时抢购',
			}
		},{
			path: 'activity',
			component: Activity,
			meta: {
				title: '专题活动'
			}
		},{
			path: 'category',
			component: Category,
			meta: {
				title:'店铺商品',
				keepAlive: !0
			}
		},{
			path: 'shop',
			component: Shop,
			meta: {
				title:'满金店',
				keepAlive: !0
			}
		},{
			path: 'more',
			component: More,
			meta: {
				title:'更多商品',
			}
		}, {
			path: 'search',
			component: Search,
			meta:{
				title:'搜索',
			}
		},{
			path: 'search-result',
			component: SearchResult,
			meta:{
				title:'搜索结果',
				// keepAlive: !0
			}
		}, {
			path: 'chat',
			component: Chat,
			meta:{
				title:'满金店客服',
				requireAuth: !0
			}
		} ,{
			path: 'detail',
			component: GoodsDetail,
			meta:{
				title:'商品详情'
			},
			children:[{
				path:'comments',
				component:GoodsComments,
				meta: {
					title: '全部评价'
				}
			}]
		},{
			path:'comments',
			component:GoodsComments,
			meta: {
				title: '全部评价'
			}
		},{
			path:'cart',
			component:Cart,
			meta:{
				title:'购物车'
			}
		},{
			path:'addr-tags',
			component:AddrTag,
			meta:{
				title:'管理标签'
			}
		},{
			path:'brand',
			component:Brand,
			meta:{
				title:'精选大牌'
			}
		},{
			path:'brand-hot',
			component:BrandHot,
			meta:{
				title:'品牌热销榜'
			}
		},{
			path:'month-top',
			component:MonthTop,
			meta:{
				title:'本月爆款'
			}
		},{
			path:'goods-top',
			component: GoodsTop,
			meta:{
				title:'热销榜'
			}
		},{
			path:'single-hot',
			component: SingleHot,
			meta:{
				title:'火爆单品'
			}
		},{
			path:'goods-new',
			component: GoodsNew,
			meta:{
				title:'新品推荐'
			}
		},{
			path:'brand-goods',
			component: BrandGoods,
			meta:{
				title:'品牌商品'
			}
		},{
			path:'order',
			component:Order,
			meta:{
				title:'确认订单',
				requireAuth:!0
			},
			children:[{
				path:'addr-select',
				component:AddrSelect,
				meta: {
					title: '选择收货地址',
					requireAuth: !0
				},
				children:[{
					path:'new',
					title:'',
					component:NewAddr,
					meta: {
						title: '新增地址',
						requireAuth: !0
					}
				},{
					path:'edit',
					component:EditAddr,
					meta: {
						title: '修改地址',
						requireAuth: !0
					}
				}]
			},{
				path:'invoice',
				component:Invoice,
				meta: {
					title: '发票信息',
					requireAuth: !0
				}
			}]
		},{
			path:'pay',
			component:Payment,
			meta: {
				title: '订单支付',
				requireAuth: !0
			}
		},{
			path:'pay-result',
			component:PayResult,
			meta: {
				title: '支付结果',
				requireAuth: !0
			}
		},{
			path: 'profile',
			component: Profile,
			meta: {
				title: '个人中心',
				requireAuth: !0
			},
			children : [
				{
					path: 'address', //PubAddr
					component: PubAddr,
					meta: {
						title: '收货地址',
						requireAuth: !0
					},
					children: [
						{
							path: 'edit',
							component: PubEditAddr,
							meta: {
								title: '编辑收货地址',
								requireAuth: !0
							}							
						},
						{
							path: 'new',
							component: PubNewAddr,
							meta: {
								title: '新增收货地址',
								requireAuth: !0
							}
						}
					]
				},
				{
					path: 'setting',
					component: ProfileSetting,
					meta: {
						title: '个人资料',
						requireAuth: !0
					},
					children: [
						{
							path: 'username',
							component: ProfileUsername,
							meta: {
								title: '修改昵称',
								requireAuth: !0
							}	
						}
					]
				}
			]
		},{
			path: 'order-list',
			component: OrderList,
			meta: {
				title: '订单列表',
				//keepAlive: !0,
				requireAuth: !0
			}
		},{
			path: 'order-detail',
			component: OrderDetail,
			meta: {
				title: '订单详情',
				requireAuth: !0
			},
			children: [
				{
					path: 'addr-detail',
					component: OrderDetailAddr,
					meta: {
						title: '选择地址',
						requireAuth: !0
					},
					children: [
						{
							path: 'edit',
							component: PubEditAddr,
							meta: {
								title: '编辑收货地址',
								requireAuth: !0
							}							
						},
						{
							path: 'new',
							component: PubNewAddr,
							meta: {
								title: '新增收货地址',
								requireAuth: !0
							}
						}
					]
				},
				{
					path: 'express-detail',
					component: ExpressDetail,
					meta: {
						title: '物流详情',
						requireAuth: !0
					},
				},
				{
					path: 'apply-service',
					component: ApplyAfterAddr,
					meta: {
						title: '申请售后',
						requireAuth: !0
					},
				}
			]
		},{
			path: 'after-sale',
			component: AfterSale,
			meta: {
				title: '售后列表',
				requireAuth: !0
			}
		},{
			path: 'after-sale-express',
			component: AfterSaleExpress,
			meta: {
				title: '物流详情',
				requireAuth: !0
			}
		},{
			path: 'after-sale-detail',
			component: AfterSaleDetail,
			meta: {
				title: '售后详情',
				requireAuth: !0
			}
		},{
			path: 'after-sale-apply',
			component: AfterSaleApply,
			meta: {
				title: '申请售后',
				requireAuth: !0
			}
		},{
			path: 'after-sale-address',
			component: AfterSaleAddress,
			meta: {
				title: '修改地址',
				requireAuth: !0
			}
		},{
			path: '/login',
			component: Login,
			meta: {
				title: '登录',
				isLogin:!0
			}
		},{
			path: '/agreement',
			component: Agreement,
			meta: {
				title: '用户协议'
			}
		},{
			path: '/help',
			component: Help,
			meta: {
				title: '帮助中心'
			},
			children: [
				{
					path: 'list',
					component: HelpCateList,
					meta: {
						title: '问题列表'
					},
					children: [
						{
							path: 'detail',
							component: HelpDetail,
							meta: {
								title: '问题详情'
							},
						}
					]
				}
			]
		},{
			path: '/my-evaluation',
			component: MyEvaluation,
			meta: {
				title: '我的评价',
				requireAuth: !0
			}
		},{
			path: '/evaluate',
			component: Evaluate,
			meta: {
				title: '评价',
				requireAuth: !0
			}
		}]
	}, {
		path: '/404',
		component: NotFound404,
		meta: {
			title: '页面找不到'
		}
	}, {
		path: '/openshop',
		component: OpenShop,
		meta: {
			title: '成为店主'
		},
	}, {
		path: '/about',
		component: About,
		meta: {
			title: '满金店'
		},
	}, {
		path: '*',
		redirect:'/404'
	}],
	scrollBehavior,
	mode:'history',
	base:'/buyer/'
});

const setPageTitle = (title)=> {
	document.title = title;
	const body = document.body;
	const iframe = document.createElement("iframe");
	iframe.setAttribute("src", "/favicon.ico");

	iframe.addEventListener('load', function() {
		setTimeout(function() {
			iframe.removeEventListener('load');
			body.removeChild(iframe);
		}, 0);
	});
	body.appendChild(iframe);
};

const qs = getQueryParam(location.search);
let miniToken = qs('token');

let token = (miniToken && decodeURIComponent(miniToken)) || local.get('token');

if (isWXBrowser && window.__wxjs_environment !== 'miniprogram') {
	const [wxToken, openid] = [getCookie('token'), getCookie('sn')];
	if (wxToken) {
		token = wxToken;
		store.commit('LOGIN',token);
	}
	if (openid) {
		store.state.openid = openid;
	}
}

if (token) {
	store.state.token = token;
}

router.beforeEach((to, from, next)=>{
	NProgress.start();
	if (to.matched.some(r => r.meta.requireAuth)) {
		if (store.state.token) {
			next();
		} else {
			next({
				path: '/login',
				query:{	
					redirect:to.fullPath,
					shopId:to.query.shopId
				}
			})
		}
	} else {
		store.commit('SHOW_LOGIN',!1);
		next();
	}
});

// const showMenuRE = /(more|home|detail)/g;

router.afterEach((to, from)=>{
	document.title = to.meta.title;
	NProgress.done();
	// showMenuRE.lastIndex=0;
	// if (!showMenuRE.test(to.fullPath)) {
	// 	wxShare('', to.fullPath);
	// }
	
});

export default router;