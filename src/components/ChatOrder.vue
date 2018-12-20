<template>
	<div class="order-popup-wrapper">
		<transition name="popup-fade" @touchmove.prevent>
			<div @click="hideOrderPopup" class="order-popup-overlay" v-show="show" @touchmove.prevent></div>
		</transition>
		<transition name="popup-slide">
			<div class="order-popup" v-show="show">
				<div class="op-hd tb1px">
					<div class="op-hd-tab">
						<div @click="switchTab(1)" class="tab-item" :class="{active: tabIdx == 1}">
							<span>我的订单</span>
						</div>
						<div @click="switchTab(2)" class="tab-item" :class="{active: tabIdx == 2}">
							<span>售后订单</span>
						</div>
						<div @click="switchTab(3)" class="tab-item" :class="{active: tabIdx == 3}">
							<span>我的浏览</span>
						</div>
					</div>
					<div @click="hideOrderPopup" class="op-hd-close"></div>
				</div>
				<div class="op-bd" v-loadmore="loadMoreData" is-enable-scroll="isDataLoading">
					<div v-if="isShowEmpty" class="empty-icon empty-icon-goods">
						<span>抱歉，暂无相关{{ tabIdx == 3 ? '商品' : '订单' }}哦~</span>
					</div>
					<div v-else class="order-list">
						<ul class="order-box">
							<li @click="change(order)" class="order-item tb1px" v-for="order in orderList">
								<div class="oi-tit" v-if="tabIdx == 1 || tabIdx == 2">
									<span class="oi-tit-num">{{ tabIdx==1 ? '订单号' : '售后单' }}：{{ order.bizno }}</span>
									<span v-if="tabIdx == 1" class="oi-tit-time">{{ order.biztime && order.biztime.slice(0, -4) }}</span>
								</div>
								<div class="oi-media">
									<div class="oi-media-pic">
										<img :src="order.goodspic" >
									</div>
									<div class="oi-media-info">
										<div class="oimi-name">
											<span>{{ order.goodsname }}</span>
										</div>
										<div class="oimi-price">
											<span class="oimi-price-txt">¥ {{ order.goodsprice.toFixed(2) }}</span>
											<span v-if="tabIdx==1" class="oimi-price-lbl" :class="{close:order.orderstatus == 60}">{{ order.orderstatus | transformStatus }}</span>
										</div>
									</div>
								</div>
							</li>
						</ul>
						<div class="loading-container" v-if="isShowMore">
							<template v-if="!isLoadOver">
								<span class="loading-icon"></span>
								<span class="loading-txt">加载中...</span>
							</template>
							<template v-else>
								<span class="loading-txt">没有更多{{ tabIdx == 3 ? '商品' : '订单' }}了</span>
							</template>
						</div>
					</div>
				</div>
				<transition name="indicator-fade">
					<div class="indicator" v-show="isLoading">
						<i class="indicator-icon"></i>
					</div>
				</transition>
			</div>
		</transition>
	</div>
</template>

<script>
	import { CustomService } from  '@/apis';
	import loadmore from '@/components/common/loadmore';
	import '@/assets/styles/empty.css';
	export default {
		data(){
			return {
				tabIdx: 1,
				isLoading: !1,

				orderList: [],
				curPage: 1,
				perPage: 21,

				isShowEmpty: !1,
				isShowMore: !1,
				isLoadOver: !1,
				isDataLoading: !1,

				cache: {},
				state: {}
			}
		},
		props: {
			show: {
				type: Boolean,
				default: !1
			}
		},
		methods:{
			change(order){
				this.$emit('change', Object.assign({
					type: this.tabIdx
				}, order));
				this.hideOrderPopup();
			},
			switchTab(idx){
				if(this.isDataLoading || this.isLoading){
					return;
				}
				document.querySelector('.op-bd').scrollTop = 0;
				this.orderList.splice(0);
				this.tabIdx = idx;
				this.setCurTabState();
				this.initData();
			},
			initData(){
				const data = this.cache[this.tabIdx];
				if(data){
					this.orderList = data.slice(0);
				}else{
					(!this.state[this.tabIdx].isLoadOver) && this.loadCurData();
				}
			},
			loadCurData(){
				if(this.tabIdx == 1 || this.tabIdx == 2){
					this.initOrderData();
				}else if(this.tabIdx == 3){
					this.initGoodsBrowse();
				}
			},
			loadMoreData(){
				const idx = this.tabIdx;
				const state = this.state[idx];
				if(state.isLoadOver || this.isLoading){
					return;
				}
				this.curPage++;
				state.page++;
				this.isDataLoading = !0;
				let method = idx == 3 ? 'fetchGoodsBrowse' : 'fetchOrderData';
				this[method]().then(res => {
					this.isDataLoading = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					const data = res.data;
					if(data.length<this.perPage){
						this.isLoadOver = !0;
						state.isLoadOver = !0;
					}
					this.cache[idx] = this.cache[idx].concat(data);
					this.orderList = this.orderList.concat(data);
				}).catch(err => {
					console.log(err)
					this.isDataLoading = !1;
				});
			},
			initGoodsBrowse(){
				this.curPage = 1;
				this.isLoading = !0;
				this.fetchGoodsBrowse().then(res => {
					this.isLoading = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					const data = res.data;
					this.recordCurTabState(data);
					this.setCurTabState();
				}).catch(err => {
					this.isLoading = !1;
					console.log(err);
				});
			},
			
			fetchGoodsBrowse(){
				return CustomService.getGoodsBrowse(this.curPage, 21);
			},
			fetchOrderData(){
				let type = this.tabIdx;
				let pageindex = this.curPage;
				let pagesize = this.perPage;

				return CustomService.getOrderList({
					type,
					pageindex,
					pagesize
				});
			},
			initOrderData(){
				this.curPage = 1;
				this.isLoading = !0;
				this.fetchOrderData().then(res => {
					this.isLoading = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					let data = res.data;

					this.recordCurTabState(data);
					this.setCurTabState();
				}).catch(err => {
					this.isLoading = !1;
					console.log(err);
				})
			},
			setCurTabState(){
				let idx = this.tabIdx;
				let state = this.state[idx];
				this.isShowEmpty = state.isShowEmpty;
				this.isShowMore = state.isShowMore;
				this.isLoadOver = state.isLoadOver;
				this.curPage = state.page;
			},
			recordCurTabState(data){
				let idx = this.tabIdx;
				let len = data.length;
				let state = this.state[idx];
				state.isShowMore = !0;
				state.isShowEmpty = !1;
				
				if(!data || len <= 0){
					state.isShowMore = !1;
					state.isShowEmpty = !0;
					state.isLoadOver = !0;
					this.orderList.splice(0);
					return;
				}
				
				state.isLoadOver = len < this.perPage;
				this.orderList = data.slice(0);
				this.cache[idx] = data;
			},

			initState(){
				for(let i = 1; i <= 3; i++){
					this.state[i] = {
						page: 1,
						isShowEmpty: !0,
						isShowMore: !1,
						isLoadOver: !1
					};
				}
			},
			hideOrderPopup(){
				this.$emit('close');
			}
		},
		filters:{
			transformStatus(status){
				const statusObj = {
					'10':'待付款',
					'20':'待发货',
					'30':'待收货',
					'40':'已完成',
					'50':'退款中',
					'60':'已关闭'
				};
				return statusObj[status];
			}
		},
		directives:{
			loadmore
		},
		watch:{
			show(val){
				if(Object.keys(this.cache).length>0){
					return;
				}
				this.tabIdx = 1;
				val && this.initOrderData();
			}
		},
		mounted(){
			this.initState();
		}
	}
</script>

<style scoped>
	@import '../assets/styles/mixins';

	.loading-container{
		padding-top: 0.2rem;
	}

	.empty-icon-goods{
		padding-top: 2.2rem;
	}

	.empty-icon.empty-icon-goods:before {
		width: 1.4rem;
		height: 1.4rem;
		background-image: url(../assets/images/chat/icon-empty.png);
	}
	
	.order-popup-overlay{
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: rgba(0,0,0,0.5);
		z-index: 1500;
	}

	.order-popup{
		position: fixed;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 1501
	}

	.op-hd{
		position: relative;
		height: 0.88rem;
		border-bottom: 1px solid #e5e5e5;
		box-sizing: border-box;
		padding: 0 0.32rem;
		background-color: #fff;
		.op-hd-tab{
			display: flex;
			.tab-item{
				margin-left: 0.6rem;
				line-height: 0.84rem;
				border-bottom: 0.04rem solid transparent;

				font-size: 0.28rem;
				color: #333;

				&.active{
					color: $main-color;
					border-bottom-color: $main-color;
				}

				&:first-of-type{
					margin-left: 0;
				}
			}
		}
		.op-hd-close{
			position: absolute;
			top: 0;
			right: 0;

			width: 0.92rem;
			height: 100%;

			background: url(../assets/images/chat/icon-order-close.png) center center/ 0.28rem 0.28rem no-repeat;
		} 
	}
	
	.op-bd{
		position: relative;
		height: 6.46rem;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		background-color: #f5f5f5;
		.order-list{
			min-height: 100%;
			padding: 0 0.32rem;
			background-color: #fff;
		}
		.order-item{
			padding-top: 0.28rem;
			/*border-bottom: 1px solid #e5e5e5;*/
		
			.oi-tit{
				display: flex;
				justify-content: space-between;
				margin-bottom: 0.2rem;
				font-size: 0.22rem;
				color: #333;
				.oi-tit-time{
					color: #999;
				}
			}
			.oi-media{
				display: flex;
				padding-bottom: 0.28rem;
				.oi-media-pic{
					width: 1.4rem;
					height: 1.4rem;
					background-color: #f5f5f5;
					img{
						display: block;
						width: 100%;
						height: 100%;
					}
				}
				.oi-media-info{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					flex: 1;
					width: 1%;
					margin-left: 0.24rem;
					font-size: 0.24rem;
					.oimi-name{
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						text-overflow: ellipsis;
						overflow : hidden;
						line-height: 0.34rem;

					}
					.oimi-price{
						display: flex;
						justify-content: space-between;
						.oimi-price-txt{
							color: #999;
						}
						.oimi-price-lbl{
							color: $main-color;
							&.close{
								color: #999;
							}
						}
					}
				}
			}
		}
	}

	.indicator{
		position: absolute;
		left: 50%;
		top: 50%;

		width: 1rem;
		height: 1rem;
		margin-top: -0.3rem;
		margin-left: -0.3rem;
		border-radius: 0.06rem;

		background-color: rgba(0,0,0,.8);

		.indicator-icon{
			position: absolute;
			left: 50%;
			top: 50%;
			width:20px;
			height:20px;
			margin-top: -10px;
			margin-left: -10px;
			border:2px solid #fff;
			border-top-color:transparent;
			border-radius: 50%;
			box-sizing: border-box;
			animation: spinner-rotate 1s linear infinite;
		}
	}

	@keyframes  spinner-rotate{
		to{
			transform:rotate(1turn);
		}
	}

	.indicator-fade-enter,.indicator-fade-leave-to{
		opacity: 0;
	}
	
	.popup-fade-enter-active,.popup-fade-leave-active{
		transition: all .3s linear;
	}

	.popup-fade-enter,.popup-fade-leave-to{
		opacity: 0;
	}

	.popup-slide-enter-active{
		transition: all .3s ease;
	}

	.popup-slide-leave-active {
		transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
	}

	.popup-slide-enter,.popup-slide-leave-to{
		transform: translate3d(0,100%,0);
		backface-visibility:hidden;
		perspective:1000;
	}
</style>
