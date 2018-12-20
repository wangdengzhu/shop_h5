<template>
	<div>		
		<div class="home-wrapper">
			<div class="home-inner">
				<div class="home-top">
					<img :src="shopObj.signpic" alt="" class="shop-signpic">
					<div class="shop-info">
						<div class="align-flex">
							<img :src="shopObj.logopic" alt="" class="shop-logo">
							<div class="shop-text flex-one">
								<p class="shop-name">{{shopObj.storename}}</p>
								<p class="shop-desc">{{shopObj.description}}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="home-list">
					<div class="home-list-title"><span>店主精选</span></div>
					<div class="home-list-container">
						<router-link class="goods-item" tag="div" v-for="item in goodsList" :key="item.relateid"
						:to="{ path: 'detail' , query: { spuId: item.spuid, shopId: shopId }}">
							<div class="goods-pic">
								<img v-lazy="{src: item.spulargerpic,loading: IMAGE_DEFAULT.I_750_300}">
								<div class="item-saleover-overlay" v-if="item.goodstatus != 1">
									<div class="item-saleover">
										<span class="item-saleover-txt">/ 已售完 /</span>
									</div>
								</div>
							</div>
							<div class="goods-info">
								<div class="goods-name">
									<strong class="goods-tip" v-if="item.prefix">{{item.prefix}}</strong>
									<span class="goods-title">{{item.title}}</span>
								</div>
								<div class="goods-price">
									<strong class="now-price">¥{{item.skupricemin.toFixed(2)}}</strong>
									<!-- <del class="del-price">¥{{item.marketpricemin.toFixed(2)}}</del> -->
									<span class="buy-btn tb1px" :class="[item.goodstatus != 1 ? 'disabled' : '']">立即购买</span>
								</div>		
							</div>					
						</router-link>
					</div>
					<div class="empty-wrapper" v-if="pageLoaded && goodsList.length == 0">
						<div class="empty-icon empty-icon-goods">店铺里没有商品，去更多看看吧</div>
					</div>
					<div class="data-loadend gray9" v-if="pageLoaded && goodsList.length > showTipSize">没有更多商品了</div>
				</div>	
			</div>		
		</div>
		<my-footer/> 
	</div>	
</template>
<script>
	import { Shop } from '@/apis/';	
	import Indicator from '@/components/common/indicator';
	import myFooter from '@/components/footer/footer';
	import Toast from '@/components/common/toast';
	import '@/assets/styles/empty.css';	
	import iosWxShareFix from '@/plugins/iosWxShareFix';
	const SHOW_TIP_SIZE = 4;
	export default {
		data(){
			return {
				shopObj : {
					signpic : '',
					logopic : '',
					storename : '',
					description : ''
				},
				goodsList : [],
				pageLoaded : false,
				showTipSize : SHOW_TIP_SIZE,
				pageScrollTop : 0,
				pageElement : null
			}
		},
		computed: {
			shopId(){
				return (this.$route.path.query && this.$route.path.query.shopId) || this.$store.state.shopId;
			}
		},
		components:{
			myFooter
		},
		methods:{	
			//获取店铺信息		
			getShop(){
				Shop.getShop().then((res) => {
					let resCode = res.code;
					if(resCode == this.$ERR.NORMAL){
						this.shopObj  = res.data;
						if(!!this.shopObj.storename){
							document.title = this.shopObj.storename;  //设置店铺名称
						}
						this.weiXinShare(res.data);					
					} else if(resCode == this.$ERR.SHOP_GET_FAIL){
						//this.reqFailed();
						Toast('未找到店铺');
					} else {
						Toast(res.message + resCode);
					}	
				}).catch((err) => {
					console.log(err);
				})
			},
			//获取店铺商品
			getShopGoods(){
				this.reqStart();
				Shop.getShopGoods().then((res) => {
					this.reqEnd();	
					if(res.code == this.$ERR.NORMAL){
						this.pageLoaded = true;
						this.goodsList  = res.data;									
					} else {
						//this.reqFailed();
						Toast('未获取到店铺商品');
					}				
				}).catch((err) => {
					this.reqEnd();	
					console.log(err);
				})
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
				this.getShop();
				this.getShopGoods();
			},
			weiXinShare(shop) {
				const href = location.href;
				const tit = shop.storename;
				const img = shop.logopic;
				const desc = '这里有个好店值得一看';
				this.wxShare(tit, href, img, desc);
			}
		},
		created(){			
			this.init();
		},
		mixins:[iosWxShareFix],
		mounted(){
			this.pageElement = document.querySelector('.home-wrapper');
		},
		activated(){			
			this.pageElement.scrollTop = this.pageScrollTop;
			if(!!this.shopObj.storename && document.title != this.shopObj.storename){
				document.title = this.shopObj.storename;  //设置店铺名称
			}
			if (Object.keys(this.shopObj).length > 0 && !!this.shopObj.storename) {
				this.weiXinShare(this.shopObj);
			}
		},
		deactivated(){
			this.pageScrollTop = this.pageElement.scrollTop;
		}
	}	
</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';

	.home-wrapper{		 
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		overflow: auto;
    	-webkit-overflow-scrolling: touch;
		transform: translateZ(0);
	}
	.home-inner{
		padding-bottom: 1rem;
	}
	.home-top{
		position: relative;
		height: 2.9rem;
		// background: #666;
		overflow: hidden;
		
		> img {			
			display: block;
			width: 100%;
			height: auto;
		}

		.shop-info{
			position: absolute;
			height: 1.2rem;
			bottom: 0.4rem;
			left: $mg-30;
			right: $mg-30;

			.shop-logo{				
				width: 1.2rem;
				height: 1.2rem;
				border-radius: $radius-6;
			}
			.shop-text{
				padding-left: $mg-20;
				color: #fff;
				font-weight: bold;

				p{
					white-space: nowrap;				
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: normal;
					text-shadow: .02rem .03rem .02rem #000;
				}
				.shop-name{
					font-size: $fs-36;	
				}
				.shop-desc{
					padding-top: $mg-12;
					font-size: $fs-28;					
					
					&:empty{
						padding-top:0;
					}
				}
			}
		}
	}
	.home-list{
		.home-list-title{			
			height: 1rem;
			line-height: 1rem;
			text-align: center;
			font-size: $fs-32;
			color: $color-33;
			background-color: #fff;

			> span{
				&::before, &::after{
					content: '／';
				}
				&::before{
					padding-right: 0.04rem;
				}
				&::after{
					padding-left: 0.04rem;
				}
			}
		}
		.home-list-container{

			.goods-item{
				margin-top: $mg-20;

				&:first-child{
					margin-top: 0;
				}

				.goods-pic{
					position: relative;
					width: 100%;
					height: 3rem;
					overflow: hidden;

					> img{
						display: block;
						width: 100%;						
					}

					.item-saleover-overlay{
						position: absolute;
						left: 0;
						top:0;

						@extend flex-center;

						width: 100%;
						height: 100%;
						background-color: rgba(0,0,0,.6);
					}
					.item-saleover{
						position: relative;
						width: 4.0rem;
						height: 2.0rem;
						border:2px solid rgba(255,255,255,.5);
						.item-saleover-txt{
							position: absolute;
							left:50%;
							top:50%;

							width: 3.6rem;
							height: 1.6rem;
							line-height: 1.6rem;

							font-size: 0.4rem;
							color:#fff;
							text-align: center;
							
							background-color: rgba(255,255,255,.4);
							transform:translate3d(-50%,-50%,0);
						}
					}
				}
				.goods-info{
					padding: $mg-40 $mg-30;
					background-color: #fff;
				}
				.goods-name{	
					display: -webkit-box;				
					max-height: 0.88rem;
					line-height: 0.44rem;
					font-size: $fs-28;													
					color: $color-33;
					overflow: hidden;
					-webkit-line-clamp: 2; 
					-webkit-box-orient: vertical;
					.goods-tip{
						font-weight: bold;
					}
					.goods-title{											
						word-break: break-all;							
					}
				}
				.goods-price{						
					height: 0.6rem;
					line-height: 0.6rem;		
					font-size: $fs-28;
					padding-top: $mg-30;
					.now-price{
						color: $main-color;
					}
					.del-price{
						margin-left: $mg-30;
						font-size: $fs-28;
						color: $color-80;												
					}
				}
				.buy-btn{
					float: right;
					width: 1.6rem;
					height: 0.6rem;		
					margin-top: -1px;	
					line-height: 0.62rem;
					text-align: center;
					font-size: $fs-28;
					color: $color-33;
					border: 1px solid $color-80;						
					border-radius: $radius-6;
					user-select: none;

					&.disabled{
						color: $color-b2;
						border-color: currentColor;			
					}		
					&:not(.disabled):active{
						color: $main-color;
						border-color: currentColor;	
					}							
				}
			}				
		}
		.data-loadend{
			padding: $mg-40 0;
			font-size: 0.26rem;
			text-align: center;
		}
	}
	.empty-wrapper{
		padding-top: 1rem;
	}	
</style>