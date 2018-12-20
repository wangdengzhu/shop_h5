<template>
	<div class="page-wrap">
		<login-box v-if="!$route.meta.isLogin" v-show="showLogin" @closeLogin="closeLogin"></login-box>
		<transition name="router-fade" mode="out-in">
			<keep-alive>
				<router-view v-if="$route.meta.keepAlive"></router-view>
			</keep-alive>
		</transition>
		<transition name="router-fade" mode="out-in">
			<router-view v-if="!$route.meta.keepAlive"></router-view>
		</transition>
	</div>
</template>
<script>
	import { mapState,mapMutations } from 'vuex';
	import localStore from '@/utils/store';
	import { User, Cart } from '@/apis/';
	import route from '@/router';
	import Indicator from '@/components/common/indicator/';
	import { getCookie, setCookie, getQueryParam } from '@/utils/common';
	import store from '@/utils/store';
	export default {
		name:'index',
		data() {
			return {
				isShowLogin: !0,
				isPageLoaded:!1,
				shopId:-1
			}
		},
		methods:{
			...mapMutations(['LOGIN', 'SHOPID_SAVE', 'SHOW_LOGIN', 'USRINFO_SAVE', 'SHOP_CART_SAVE']),
			checkLogin() {
				const qs = getQueryParam(location.search);
				let miniToken = qs('token');

				const token = (miniToken && decodeURIComponent(miniToken)) || localStore.get('token');
				const ERR = this.$ERR;
				if (!token) {
					this.isPageLoaded = !0;
					return;
				}
				this.$store.state.token = token;
				User.getUsrInfo().then((res) => {
					this.isPageLoaded = !0;
					if (res.code === ERR.NORMAL) {
						this.LOGIN(token);
						this.USRINFO_SAVE(res.data);
						this.fetchCartNum();
					}
				}).catch((err) => {
					this.isPageLoaded = !0;
					console.log(err);
				});
			},
			fetchCartNum(){
				Cart.count().then(res => {
					if(res.code !== 1){
						return;
					}
					if(this.$store.state.isCartSync){
						return;
					}
					this.$store.state.shopCartNum = res.data;
				}).catch(err => {
					console.log(err);
				});
			},
			closeLogin() {
				this.SHOW_LOGIN(!1);
			},
			initShopId() {
				const shopId = this.$route.query.shopId;
				const shareSource = this.$route.query.mjd_from;
				if(shareSource){
					store.set('shareSource',shareSource);
				}
				if (!shopId || !/^\d+$/.test(shopId)) {
					this.$router.push({
						path: '/404'
					});
					return;
				}
				this.shopId = shopId;
				this.SHOPID_SAVE({
					shopId,
					shareSource
				});
				const shopCart = this.cartList[shopId];
				shopCart && this.SHOP_CART_SAVE(shopCart);
			}
		},
		computed:{
			...mapState(['showLogin', 'cartList'])
		},
		mounted(){
			if (this.shopId <= 0) {
				return;
			}
    		_mjda.push(['_pageView', 'loginlog', '']);
			const shopCount = getCookie('shopCount');
			if (shopCount && shopCount == this.shopId) {
				return;
			}
			_mjda.push(['_pageView', 'shop', '']);
			setCookie('shopCount', this.shopId, 1 / 24);
		},
		created(){
			this.initShopId();
			this.checkLogin();
		}
	}
</script>
<style>
	.page-wrap{
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		background-color: #f5f5f5;
		color:#333;
		font-size: 0.32rem;
		overflow:hidden;
	}
	.router-fade-enter-active, .router-fade-leave-active {
		transition: opacity .3s;
	}
	.router-fade-enter, .router-fade-leave-to {
		opacity: 0;
	}
</style>