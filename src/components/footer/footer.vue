<template>
	<footer class="footer tb1px" @touchmove.prevent>
		<div class="footer-menu">
			<a @click="navTo('home')" href="javascript:;" class="menu-item home" :class="activeCls('home')">
				<i class="icon"></i>
				<span class="item-txt">店铺首页</span>
			</a>
			<a @click="navTo('category')" href="javascript:;" class="menu-item more" :class="activeCls('category')">
				<i class="icon"></i>
				<span class="item-txt">店铺商品</span>
			</a>
			<a @click="navTo('cart')" href="javascript:;" class="menu-item cart" :class="activeCls('cart')">
				<i class="icon"></i>
				<span class="item-txt">购物车</span>
				<span v-if="cartNum > 0" class="item-num" :class="classCartNum">{{ cartNum > 99 ? '99+' : cartNum }}</span>
			</a>
			<a @click="navTo('profile',!0)" href="javascript:;" class="menu-item profile" :class="activeCls('profile')">
				<i class="icon"></i>
				<span class="item-txt">我的</span>
			</a>
		</div>
	</footer>
</template>

<script>
	import { mapState,mapMutations } from 'vuex';
	export default {
		name: 'footer',
		data(){
			return {
				pageLinks:{
					home:'/home',
					category:'/category',
					cart:'/cart',
					profile:'/profile'
				}
			}
		},
		methods: {
			...mapMutations(['SHOW_LOGIN']),
			activeCls(curPath) {
				return this.$route.path.indexOf(curPath) > -1 ? 'active' : '';
			},
			navTo(type, isRquireAuth = !1) {
				const targetURL = this.pageLinks[type];
				if (!isRquireAuth) {
					this.$router.push({
						path: targetURL,
						query: {
							shopId:this.shopId
						}
					})
					return;
				}
				if (!this.isLogin) {
					this.loginCfg.cb = () => {
						this.loginCfg.cb = null;
						this.navToHasAuthPage(targetURL);
					};
					this.SHOW_LOGIN(!0);
				}else{
					this.navToHasAuthPage(targetURL);
				}
			},
			navToHasAuthPage(url){
				this.$router.push({
					path: url,
					query: {
						shopId:this.shopId
					}
				})
			}
		},
		computed:{
			...mapState(['isLogin', 'shopId', 'shopCart', 'shopCartNum']),
			cartNum(){
				return this.shopCartNum + this.shopCart.reduce((prev, cur, idx, arr) => prev + cur.shopnum , 0);
			},
			classCartNum(){
				return {
					one: this.cartNum < 10,
					two: this.cartNum >= 10 && this.cartNum <= 99,
					three: this.cartNum > 99
				}
			}
		},
		mounted(){
			
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins.css';
	.footer{
		position: fixed;
		left: 0;
		bottom:0;
		right: 0;
		
		height: 1.0rem;
		/*border-top: 1px solid $color-d9;*/
		background-color: $color-fa;
		z-index: 999;
		/*box-shadow: 0 0 0.1rem 0 rgba(155,143,143,0.6);*/
		
	}
	.footer-menu{
		display: flex;
		justify-content: space-between;
		flex-wrap: nowrap;
		height: 100%;
	}
	.menu-item{
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex:1;
		color:$color-80;
		font-size: 0.22rem;
		height: 100%;
		.item-txt{
			margin-top: 0.1rem;
		}
		&.active .item-txt{
			color:$main-color;
		}
		.icon-wrap{
			position: relative;
		}
		.icon{
			display: block;
			width: 0.4rem;
			height: 0.4rem;
			@extend bg;
		}
		.item-num{
			position: absolute;
			/*right: 0.16rem;*/
			left: 53%;
			top: 0.08rem;
			width: 0.3rem;
			height: 0.3rem;
			line-height: 0.32rem;
			color: #fff;
			font-size: 10px;
			text-align: center;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: 0 0;
			
			&.one{
				background-image: url(../../assets/images/footer/home_bar_cart_normal_one.png);
			}
			&.three{
				width: 0.5rem;
				background-image: url(../../assets/images/footer/home_bar_cart_normal_threes.png);
			}
			&.two{
				width: 0.4rem;
				background-image: url(../../assets/images/footer/home_bar_cart_normal_two.png);
			}
		}

		&.active .item-num{
			color: $main-color;
			&.one{
				background-image: url(../../assets/images/footer/home_bar_cart_select_one.png);
			}
			&.three{
				background-image: url(../../assets/images/footer/home_bar_cart_select_three.png);
			}
			&.two{
				background-image: url(../../assets/images/footer/home_bar_cart_select_two.png);
			}
		}

	}
	
	$imgPre:../../assets/images/footer;
	
	@each $icon in (home, more, cart, profile) {
		.menu-item.$(icon) .icon {
			background-image:url('$imgPre/$(icon).png');
		}
		.menu-item.$(icon).active .icon {
			background-image: url('$imgPre/$(icon)-active.png');
		}
	}
	

</style>