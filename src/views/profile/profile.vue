<template>
	<div>
		<div class="profile-wrapper" v-if="show">
			<div class="profile-page">
				<div class="profile-inner">
					<div class="profile-header">
						<router-link :to="{path: '/profile/setting', query: { shopId: shopId}}" tag="div" class="profile-photo">
							<img :src="usrInfo && usrInfo.photo" alt="">
						</router-link>
						<p class="profile-name">{{usrInfo && usrInfo.username}}</p>
					</div>
					<div class="order-menu">
						<div class="order-top justify-flex tb1px">
							<span>全部订单</span>
							<router-link :to="{path: '/order-list', query: {status : 0, shopId: shopId}}" class="arrow" tag="span">全部</router-link>
						</div>
						<div class="order-map tb1px"> 
							<router-link class="order-state" tag="div" :to="{path: '/order-list', query: {status : 1, shopId: shopId}}">
								<div class="wait-pay">
									<div class="state-num" v-show="paymenttotal > 0"><span>{{paymenttotal}}</span></div>								
								</div>
								<span>待付款</span>
							</router-link>
							<router-link class="order-state" tag="div" :to="{path: '/order-list', query: {status : 10, shopId: shopId}}">
								<div class="wait-deliver">
									<div class="state-num" v-show="pendingshipmenttotal > 0"><span>{{pendingshipmenttotal}}</span></div>								
								</div>
								<span>待发货</span>
							</router-link>
							<router-link class="order-state" tag="div" :to="{path: '/order-list', query: {status : 20, shopId: shopId}}">
								<div class="wait-get">
									<div class="state-num" v-show="receivetotal > 0"><span>{{receivetotal}}</span></div>
								</div>
								<span>待收货</span>
							</router-link>
							<router-link class="order-state" tag="div" :to="{path: '/my-evaluation', query: {status : 0, shopId: shopId}}">
								<div class="evalu">
									<div class="state-num" v-show="pendingcommenttotal > 0"><span>{{pendingcommenttotal}}</span></div>
								</div>
								<span>待评价</span>				
							</router-link>
							<router-link class="order-state" tag="div" :to="{path: '/after-sale', query: {status : 0, shopId: shopId}}">
								<div class="cust-ser">
									<div class="state-num" v-show="iniheaftersaletotal > 0"><span>{{iniheaftersaletotal}}</span></div>
								</div>
								<span>售后</span>				
							</router-link>
						</div>
					</div>
					<router-link class="profile-addr justify-flex tb1px" tag="div" :to="{path: '/profile/address', query: {shopId : shopId}}">
						<div>
							<!-- <i class="addr-icon"></i> -->
							<span>收货地址</span>
						</div>			
						<span class="arrow"></span>
					</router-link>

					<router-link class="tb-router justify-flex tb1px" tag="div" :to="{path: '/help', query: {shopId : shopId}}">
						<div>
							<!-- <i class="addr-icon"></i> -->
							<span>帮助中心</span>
						</div>			
						<span class="arrow"></span>
					</router-link>
					<router-link class="tb-router justify-flex tb1px" tag="div" :to="{path: '/chat', query: {shopId : shopId}}">
						<div>
							<!-- <i class="addr-icon"></i> -->
							<span>客服</span>
						</div>			
						<span class="arrow"></span>
					</router-link>
					<!-- <router-link class="setup-shop justify-flex tb1px" tag="div" :to="{path: '/openshop', query: {shopId : shopId}}">
						<div>
							<i class="shop-icon"></i>
							<span>成为店主</span>
						</div>
						<span class="arrow"></span>
					</router-link> -->
					<div class="star-wrapper">
						<div class="btn tb1px" @click="showCode">关注微信公众号，实时掌握订单动态</div>						
					</div>
					<div class="tel-tip">客服热线：400-8988-111</div>
				</div>									
			</div>						
		</div>
		<div class="wx-code-wrapper" @touchmove.prevent @click="hideCode" v-show="show && showWxCode">
			<div class="wx-code-inner">
				<div class="wx-code-con" @click.stop>
					<div class="code-img tb1px"><img src="../../assets/images/qrcode-for-gh.jpg" alt=""></div>
					<div class="text">
						<p>微信中长按识别二维码</p>
						<p>或在微信公众号中搜索</p>
						<p class="wx-name">满金店</p>
					</div>
				</div>
				<div class="close-btn"></div>
			</div>
		</div>
		<my-footer v-if="show"></my-footer>
		<transition name="slide" mode="out-in">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script>
	import { User, Order, Shop } from '@/apis/';
	import { mapState, mapMutations } from 'vuex';
	import * as types from '@/store/mutations-type';
	import Indicator from '@/components/common/indicator';
	import Toast from '@/components/common/toast';
    import myFooter from '@/components/footer/footer';

	export default {
		data() {
			return {
				// usrInfo : {
				// 	'photo' : '',
				// 	'mobile' : ''
				// },
				paymenttotal : 0,
				receivetotal : 0,
				pendingshipmenttotal: 0,
				pendingcommenttotal: 0,
				iniheaftersaletotal: 0,
				showWxCode : false
			}
		},
        components:{
            myFooter
		},
		computed:{
			...mapState(['usrInfo', 'shopId']),
			show(){
				return this.$route.path.split('/').length <= 2
			}
			// shopId(){
			// 	return this.$route.query.shopId || this.$store.state.shopId;
			// }
		},
		methods : {
			...mapMutations([types.USRINFO_SAVE]),
			//获取待付款和待收货的订单总数
			getTotal(){
				Order.getTotal().then((res) => {
					if(res.code == this.$ERR.NORMAL){
						this.paymenttotal = res.data.pendingpaymenttotal;
						this.receivetotal = res.data.pendingreceivetotal;
						this.pendingcommenttotal = res.data.pendingcommenttotal;
						this.pendingshipmenttotal = res.data.pendingshipmenttotal;
						this.iniheaftersaletotal = res.data.iniheaftersaletotal;
					}
				}).catch((err) => {
					console.log(err);
				})
			},
			//获取用户信息
			getUsrInfo(){
				this.reqStart();
				User.getUsrInfo().then((res) => {
					this.reqEnd();	
					let resCode = res.code;
					if(resCode == this.$ERR.NORMAL){
						this.USRINFO_SAVE(res.data);
					} else if(resCode == this.$ERR.USRINFO_GET_FAIL){
						Toast('获取用户信息失败');
					} else {
						this.reqFailed();
					}					
				}).catch((err) => {
					this.reqEnd();	
					console.log(err);
				})
			},		
			showCode(){
				this.showWxCode = true;
			},
			hideCode(){
				this.showWxCode = false;
			},
			reqStart(text){
				text = text || '加载中...';
				Indicator.show(text);
			},
			reqEnd(){
				Indicator.close();
			},
			reqFailed(){
				Toast('网络异常，请稍候重试');
			},
			init(){
				if(!this.usrInfo){					
					this.getUsrInfo();
				}
				this.getTotal();
			}
        },
        mounted(){
			//this.usrInfo = this.stateUsrInfo;
			this.init();
        }

	}
</script>
<style lang="postcss" scoped>	
	@import '../../assets/styles/mixins.css';

	$white: #fff;
	$orange: #ff681d;
	$state-icon-list: wait-pay, wait-deliver, wait-get, cust-ser, evalu;
	$item-icon-list: addr-icon, shop-icon;
	$pad-num : 0 0.24rem;	

	.profile-wrapper{
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		bottom: 0;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}
	.profile-page{
		padding-bottom: 1rem;
	}	
	.arrow{
		position: relative;
		display: block;
		padding-right: 0.32rem;
		color: $color-80;

		&::after{
			content: '';
			position: absolute;
			// top: -0.02rem;
			right: 0;
			width: 6px;
			height: 100%;
			background: url(../../assets/images/list-icon.png) no-repeat center right;
			background-size: 6px 12px;
		}
	}

	.profile-header {
		width: 100%;
		height: 2.9rem;
		padding-top: 0.5rem;
		background: url("../../assets/images/profile/user-h@2x.png") no-repeat;
		background-size: cover;
		text-align: center;
		box-sizing: border-box;

		.profile-photo{
			width: 1.3rem;
			height: 1.3rem;
			margin: 0 auto;
			background: rgb(255,243,237);
			border-radius: 50%;
			overflow: hidden;

			> img{
				display: block;
				width: 100%;
				height: 100%;
			}
		}
		.profile-name{
			padding-top: $mg-30;
			font-size: $fs-32;
			color: #fff;
			white-space: nowrap;				
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}  
		
	@define-extend order-state-icon{
		position: relative;
		width: 20px;
		height: 20px;
		margin: 0 auto 0.28rem;
		background-repeat: no-repeat;
		background-position: bottom center;
		background-size: contain;		
	}
	@define-extend single-icon{
		display: inline-block;		
		width: 0.4rem;
		height: 1rem;
		margin-right: $mg-20;
		vertical-align: -38%;     
		background-repeat: no-repeat;    
		background-position: center;
		background-size: contain;
	}
	@define-extend line-item{
		height: 1rem;
		line-height: 1rem;
		font-size: 0.28rem;
		background-color: $white;
	}

	.order-menu{
		// padding: $pad-num;
		background-color: $white;
	
		.order-top{
			@extend line-item;
			padding: 0.02rem $mg-30 0;
			border-bottom: 1px solid $color-d9;
			box-sizing: border-box;
		}		

		.order-map{
			display: flex;
			justify-content: space-around;
			height: 1.8rem;
			padding: 0.4rem 0 0.3rem;
			// border-bottom: 1px solid $color-d9;
			box-sizing: border-box;
			text-align: center;	

			.order-state{
				padding: 0 $mg-20;	
				font-size: $fs-28;
				color: $color-33;				
				white-space: nowrap;	
				box-sizing: border-box;
    			width: 1.24rem;					
				
				@each $icon in ($state-icon-list){
					.$(icon){
						@extend order-state-icon;	
						background-image: url('../../assets/images/profile/$(icon)@2x.png');
					}
				}

				.state-num{
					position: absolute;
					min-width: 12px;
					right: -7px;
					top: -5px;
					width:15px;
					height: 15px;
					// right: -0.15rem;
					// top: -0.15rem;
					line-height: 0.3rem;
					text-align: center;			
					font-size: 9px;													
					color: $white;
					// background-color: $orange;
					// border-radius: 50%;
					
					&::before{
						content: '';
						display: block;						
						padding-top: 100%;
						background-color: $orange;
						border-radius: 50%;	
					}

					span{
						display: block;
						padding: 0 2px;		
						margin-top: -50%;
						transform: translateY(-50%);
					}
				}
			}
		}
	}

	.profile-addr{
		margin-top: $mg-20;
	}
	.tb-router {
		border-top: 1px solid #e5e5e5;
	}
	.profile-addr, .tb-router, .setup-shop{
		@extend line-item;
		padding: 0 $mg-30;	
		// border-bottom: 1px solid $color-d9;		
	}
	.star-wrapper{	
		margin-top: $mg-20;
		padding: $mg-40;
		text-align: center;
		background-color: $white;

		.btn{
			width: 6.7rem;
			height: 1rem;
			line-height: 1rem;
			color: $main-color;
			font-size: $fs-32;
			border: 1px solid currentColor;
			border-radius: $radius-10;	
			box-sizing: border-box;		
		}
		// height: 0.78rem;
		// margin-top: $mg-20;
		// padding: 0 $mg-20;
		// line-height: 0.78rem;
		// text-align: center;		
		// color: $orange;
	}	
	.tel-tip{
		padding: .32rem 0;
        color: $color-80;
		font-size: 0.28rem;	
		text-align: center;	
		line-height: 1;
	}	

	@each $icon in ($item-icon-list){
		.$(icon){
			@extend single-icon;	
			background-image: url('../../assets/images/profile/$(icon)@2x.png');
		}
	}

	.wx-code-wrapper{
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background-color: rgba(0,0,0,.6);
		z-index: 1000;

		.wx-code-inner{
			position: absolute;
			width: 5.58rem;
			top: 50%;
			left: 50%;			
			transform: translate(-50%, -50%);
			background-color: #fff;
			border-radius: $radius-20;
		}
		.wx-code-con{
			padding-top: 0.45rem;
		}
		.code-img{
			width: 3.6rem;
			height: 3.6rem;
			margin: 0 auto;
			padding: 1px;
			border: 1px dashed $color-80;
			box-sizing: border-box;

			img{
				display: block;
				width: 100%;
				height: 100%;
				user-select: none;
			}
		}
		.text{
			font-size: $fs-28;
			color: $color-33;
			line-height: 0.4rem;
			text-align: center;
			padding: 0.1rem 0 0.4rem;

			.wx-name{
				padding-top: 0.3rem;
				line-height: 0.44rem;
				font-size: $fs-36;
				color: $main-color;				
			}
		}
		.close-btn{
			position: absolute;
			width: 20px;
			height: 20px;
			top: .2rem;
			right: .2rem;
			transform: rotate(-45deg);

			&::before, &::after{
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				background-color: $color-33;
				transform: translate(-50%, -50%);
			}
			&::before{
				width: 100%;
				height: 1px;
			}
			&::after{
				width: 1px;
				height: 100%;
			}
		}
	}

	.slide-enter-active,.slide-leave-active{
		transition: all .3s ease-in-out;
	}
	.slide-enter,.slide-leave-to{
		transform: translate3d(100%,0,0);
	}
</style>