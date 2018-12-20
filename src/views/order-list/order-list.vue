<template>
	<div class="order-wrapper">
		<ul class="order-menu justify-flex tb1px">
			<li v-for="item in menuList" :key="item.status" class="flex-one"
			@click="getByStatus(item.status)" :class="{'active' : item.status == curStatus}">
				<span>{{item.text}}</span>
			</li>
		</ul>
		<div class="order-scroll-wrapper">
			<div class="order-scroll-inner" v-loadmore="loadMore" is-enable-scroll="dataIsLoading">
				<div class="order-list-wrapper" v-if="pageIsLoading || orderList.length > 0">
					<div class="order-item tb1px" v-for="item in orderList" :key="item.orderno">
						<div class="order-state justify-flex tb1px">
							<span>订单号：{{item.orderno}}</span>
							<strong>{{item.statustext}}</strong>
						</div>
						<div class="order-item-inner">
							<router-link tag="div" class="order-list-item flex tb1px" v-for="child in item.lines" :key="child.id"
							:to="{path : 'order-detail', query : { orderNo : item.orderno, shopId: shopId}} ">
								<div class="goods-pic tb1px"><img v-lazy="{src: child.skuimage, loading: IMAGE_DEFAULT.I_200}" alt=""> </div>									
								<div class="goods-info flex-one">
									<div class="justify-flex">
										<div class="info-l">
											<p class="name">{{child.spuname}}</p>
											<span class="spec">{{child.spec}}</span>
										</div>
										<div class="info-r">
											<span class="money-symbol">{{child.salesprice.toFixed(2)}}</span>
											<p class="num">x&nbsp;{{child.qty}}</p>
										</div>
									</div>
									<div class="proceeds" v-if="child.skustatus != 1">{{child.skustatustext}}</div>
								</div>
							</router-link>							
						</div>		
						<div class="order-money">	
							<div class="order-total">
								<span>共{{getBuyNum(item.lines)}}件商品</span><span>合计<strong class="money-symbol">{{item.dueamount && item.dueamount.toFixed(2)}}</strong></span>							
							</div>									
							<div class="order-count" v-if="item.status == 1">
								<count-down-timer @timeend="timeEndCancel(item.orderno)" :seconds="item.paymentendtime"></count-down-timer>
								<span class="tips">后订单取消，请尽快付款</span>
								<a href="javascript:;" class="pay-btn" @click="checkPay(item.id, item.orderno, item.dueamount)">付款 </a>					
							</div>
						</div>
					</div>	
					<div class="order-list-loading gray9" v-show="!pageIsLoading && !dataIsLoadend">
						<div class="loading-container">
							<div class="loading-icon"></div>
							<div class="loading-text">正在加载中...</div>
						</div>
					</div>
					<div class="order-list-loadend gray9" v-show="dataIsLoadend && this.orderList.length > this.pageSize">没有更多了</div>				
				</div>
				<div class="order-null-wrapper gray9" v-else>
					<div class="empty-icon empty-icon-addr">没有相关订单哦</div>	
				</div>	
			</div>					
		</div>
	</div>
</template>

<script>
	import { Order, Pay } from '@/apis/';	
	import { mapState } from 'vuex';
	import { Base64 } from 'js-base64';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import loadmore from '@/components/common/loadmore';
	import CountDownTimer from '@/components/CountDownTimer';
	import confirmBox from '@/components/common/confirm-box';
	import '@/assets/styles/empty.css';

	const PAGE_SIZE = 10;
	export default {
		data(){
            return {
				menuList : [
					{
						'text' : '全部',
						'status' : 0						
					},
					{
						'text' : '待付款',
						'status' : 1
					},
					{
						'text' : '待发货',
						'status' : 10
					},
					{
						'text' : '待收货',
						'status' : 20
					}
				],
				orderList : [],
				paramObj : {
					'0' : {
						'keyWord' : '',
						'pageIndex' : 1,
						'pageSize' : PAGE_SIZE,
						'status' : 0
					},
					'1' : {
						'keyWord' : '',
						'pageIndex' : 1,
						'pageSize' : PAGE_SIZE,
						'status' : 1
					},
					'10' : {
						'keyWord' : '',
						'pageIndex' : 1,
						'pageSize' : PAGE_SIZE,
						'status' : 10
					},
					'20' : {
						'keyWord' : '',
						'pageIndex' : 1,
						'pageSize' : PAGE_SIZE,
						'status' : 20
					}
				},
				pageSize : PAGE_SIZE,
				statusArr : ['0', '1', '10', '20'], 
				pageIsLoading : true,
				dataIsLoading : false,
				dataIsLoadend : false,
				pageScrollTop : 0,
				pageElement : null
            }
		},
		computed:{	
			...mapState(['shopId']),
			curStatus(){
				let status = this.$route.query.status && this.$route.query.status.toString();
				status = this.statusArr.indexOf(status) > -1 ? status : 0;
				return status;
			}
		},
		methods:{
			refreshPage(){
                this.$router.go(0);
			},
			//获取订单列表数据
			getOrderList(params){
				this.pageIsLoading && this.reqStart();   //第一次加载的时候才需要显示 加载中... ，加载更多的时候，则不需要显示了
                return Order.getList(params).then((res) => {
					this.pageIsLoading && this.reqEnd();
					if(res.code === this.$ERR.NORMAL){	
						this.pageIsLoading = false;											
						this.orderList = this.orderList.concat(res.data.list);
						if(this.orderList.length >= res.data.totalcount){   //如果大于等于总数
							this.dataIsLoading = true;
							this.dataIsLoadend = true;
						} else {
							this.dataIsLoading = false;	
						}						
					} else {
						Toast('获取订单数据失败');
						//this.reqFailed();
					}				
					return res;
                }).catch((err) => {
					this.pageIsLoading && this.reqEnd();
                    console.log(err);
                })
			},
			//加载更多
			loadMore() {
				this.dataIsLoading = true;				
				this.paramObj[this.curStatus].pageIndex++;				
				this.getOrderList(this.paramObj[this.curStatus]);
			},
			//tab切换	
			getByStatus(status = 0){					
				this.dataReset();				
				this.$router.replace({
					query : {
						'status' : status,
						'shopId' : this.shopId
					}
				});
				this.getOrderList(this.paramObj[this.curStatus]);
			},
			//倒计时完成后 关闭订单
			timeEndCancel(orderNo){
				Order.cancel({
					orderNo : orderNo,
					closeType : 2
				}).then((res) => {
					if(res.code === this.$ERR.NORMAL){
						this.refreshPage();
					} else {
						//Toast('订单超时关闭失败, 请刷新');
						//this.reqFailed();
					}
				}).catch((err) => {	
					this.reqFailed();				
					console.log(err);
				});
			},
			//检测库存
			checkPay(orderId, orderNo, orderAmount){
				this.reqStart('提交中...');
				Pay.check(orderNo).then((res) => {
					this.reqEnd();
					let resCode = res.code;
					if(resCode === this.$ERR.NORMAL){
						this.goPay(orderId, orderNo, orderAmount);
					} else if(resCode == this.$ERR.ORDER_SKU_ERROR){   //SKU异常
						confirmBox.alert({
							'message' : '商品库存不足，请重新下单',
							'cnfrmBtnTxt' : '去看更多商品'
						}).then(
							resolve => {
								this.$router.push({
									path : '/category',
									query : {
										shopId : this.shopId
									}
								})
							},
							reject => {}
						)
					} else if(/-2|3601|3602|3603|3610/.test(resCode)){
						Toast(res.message + '' + resCode);
					}
				}).catch((err) => {
					this.reqEnd();
					this.reqFailed();
				})
			},
			//跳转支付页面
			goPay(orderId, orderNo, orderAmount){
				let orderStr = Base64.encode([orderId,orderNo,orderAmount].join('|'));
				orderStr = orderStr.split('').map(s=>(String.fromCharCode(s.charCodeAt(0)+0Xa))).join('');
				this.$router.push({
					path: '/pay',
					query : {
						shopId: this.shopId,
						cnt: window.encodeURIComponent(orderStr)
					}
				})
			},
			//获取列表每个item的商品总数
			getBuyNum(arr){
				if(!arr || arr.length === 0){
					return;
				}
				return arr.reduce((prev, cur) => prev + cur.qty, 0);
			},
			//数据重置	
			dataReset(){
				this.orderList = [];				
				this.paramObj[this.curStatus].pageIndex = 1;				
				this.dataIsLoading = this.dataIsLoadend = false;
				this.pageIsLoading = true;		
				document.querySelector('.order-scroll-wrapper').scrollTop = 0;	
			},
			visibilityHandler(){	
				if(!document[this.hidden]){
					let hasWaitPay = this.orderList.some( (item, index, arr) => item.status === 1); //检测列表是否有待付款状态的订单
					if(hasWaitPay){   //刷新数据
						this.dataReset();
						this.init();	
					}				
				}							
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
				this.getOrderList(this.paramObj[this.curStatus]);					
            }
        },
        created(){
			this.init();			
		},
		mounted(){
			if (typeof document.hidden !== "undefined") { 
				this.hidden = "hidden";
				this.visibilityChange = "visibilitychange";
			} else if (typeof document.webkitHidden !== "undefined") {
				this.hidden = "webkitHidden";
				this.visibilityChange = "webkitvisibilitychange";
			}

			document.addEventListener(this.visibilityChange, this.visibilityHandler, false);		
		},
		activated(){						
			//this.pageElement.scrollTop = this.pageScrollTop;			
		},
		updated(){
		},
		deactivated(){				
			//this.pageScrollTop = this.pageElement.scrollTop;
		},
		beforeDestroy(){
			document.removeEventListener(this.visibilityChange, this.visibilityHandler, false);
		},
		directives:{
			loadmore
		},
		components:{
			CountDownTimer
		}
	}
</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';

	.order-wrapper{	
		.order-menu{
			position: absolute;
			width: 100%;
			height: 0.8rem;
			top: 0;
			left: 0;
			line-height: 0.8rem;
			font-size: $fs-28;	
			background-color: #fff;
			border-bottom: 1px solid $color-d9;
			z-index: 1;

			li{
				height: 100%;				
				text-align: center;
				white-space: nowrap;

				span{
					display: inline-block;									
					height: 100%;
					color: $color-33;
					box-sizing: border-box;
					border-bottom: 2px solid transparent;
				} 

				&.active{
					span{
						color: $main-color;
						border-bottom-color: currentColor;
					}
				}
			}
		}	
		.order-scroll-wrapper{
			position: absolute;
			top: 0.8rem;
			left: 0;
			right: 0;
			bottom: 0;
			overflow: auto;
			-webkit-overflow-scrolling: touch;

			&::-webkit-scrollbar{
				display: none;
			}
			
			.order-null-wrapper, .order-loading-wrapper{
				text-align: center;
				padding-top: 2rem;
			}
			.order-list-loading, .order-list-loadend{
				padding: $mg-40 0;
				font-size: 0.26rem;
				text-align: center;
			}
		}		
		.order-list-wrapper{
			.order-item{
				margin-top: 0.2rem;
				padding: 0 $mg-30;
				border-bottom: 1px solid $color-d9;
				background-color: #fff;
			}
			.order-state{
				height: 0.9rem;				
				line-height: 0.9rem;	
				font-size: $fs-28;
				color: $color-80;
				border-bottom: 1px solid $color-d9;

				strong{
					color: $main-color;
				}
			}
			.order-money{
				.order-total:last-child{
					height: 0.9rem;
					line-height: 0.9rem;
					padding-top: 0;					
				}
			}
			.order-total{		
				padding-top: $mg-40;			
				text-align: right;
				line-height: 1.15;
				font-size: $fs-28;
				color: $color-80;

				span + span{
					padding-left: $mg-40;
					font-size: $fs-32;
				}
				strong{
					padding-left: $mg-20;
					color: $color-33;					

					&::before{
						font-size: $fs-32;
					}
				}
			}			
			.order-count{
				height: 0.6rem;
				padding: $mg-40 0;
				line-height: 0.6rem;				
				font-size: $fs-28;
				color: $color-80;	
				text-align: right;	

				span:first-child{
					color: $main-color;
				}	

				.tips{
					padding: 0 $mg-30 0 $mg-12;
				}		

				.pay-btn{
					display: inline-block;
					width: 1.2rem;
					height: 0.6rem;	
					line-height: 0.62rem;				
					color: #fff;	
					background-color: $main-color;					
					vertical-align: middle;
					text-align: center;
					border-radius: $radius-10;
				}
			}
			.order-item-inner{
				// background-color: #f9f9f9;
			}			
		}
		.order-list-item{
			min-height: 1.6rem;
			padding: $mg-40 0;
			border-bottom: 1px solid $color-d9;

			.goods-pic{				
				width: 1.6rem;
				height: 1.6rem;
				padding: 1px;
				border: 1px solid $color-d9;				
				box-sizing: border-box;
				overflow: hidden;
				border-radius: $radius-6;

				> img{
					display: block;
					width: 100%;
					height: 100%;
				}
			},
			.goods-info{
				position: relative;
				padding-left: $mg-20;

				.opt-btn{
					position: absolute;
					bottom: 0.06rem;
					right: 0;
					padding: 0.06rem 0.18rem;
					background-color: #fff;
					font-size: 0.26rem;	
				}
				.info-l{
					width: 3.2rem;		

					.name{
						display: -webkit-box;
						max-height: 0.88rem;
						margin-bottom: $mg-30;
						line-height: 0.44rem;
						font-size: $fs-28;
						color: $color-33;
						overflow: hidden;
						word-break: break-all;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
					}
					.spec{
						font-size: $fs-24;
						color: $color-80;
					}
				}
				.info-r{					
					text-align: right;
					font-size: $fs-28;
					color: $color-33;
					white-space: nowrap;

					span{
						line-height: 0.44rem;
					}
					.num{
						padding-top: $mg-20;
						color: $color-80;						
					}
				}
				.proceeds{
					position: absolute;
					bottom: 0;
					right: 0;					
					font-size: $fs-28;
					color: $color-80;
				}
			}
		}
	}
</style>