<template>
	<div class="as-wrap">
		<ul class="order-menu justify-flex tb1px">
			<li v-for="item in menuList" :key="item.status" class="flex-one"
			@click="changeActive(item.status)" :class="{'active' : item.status == curStatus}">
				<span>{{item.text}}</span>
			</li>
		</ul>
		<div class="as-scroll-wrapper" v-loadmore="loadMore" is-enable-scroll="enableScrollFlag">
			<div class="as-scroll-inner">
				<div class="as-null-wrapper gray9" v-if="noOrder">
					<div class="empty-icon empty-icon-addr">没有相关订单哦</div>
				</div>
				<div class="as-list-wrapper" v-else>
					<div v-if="curStatus == 0">
						<div class="order-item" v-for="item in canAftersaleList" :key="item.id">
							<div class="order-hd">
								<div>订单编号：{{item.orderno}}</div>
								<div>下单时间：{{item.ordertime}}</div>
							</div>
							<div class="goods-item-wrap" v-for="good in item.lines" :key="good.id">
								<div class="goods-item">
									<div class="goods-info" @click="goPage(good.skustatus, good.asorderno, good.skuid, good.activitytype, good.spuid)">
										<div class="goods-pic">
											<img v-lazy="{src: good.skuimage, loading: IMAGE_DEFAULT.I_200}"  alt="">
										</div>
										<div class="goods-desc">
											<div class="goods-top">
												<div class="goods-title">{{good.spuname}}</div>
											</div>
											<div class="goods-sub-title">
												<div class="spec">{{good.spec}}</div>
												<div class="num">x{{good.qty}}</div>
											</div>
										</div>
									</div>
									<div class="btn-wrap">
										<router-link v-if="good.canapplyorderservice && good.skustatus == 1" tag="div" 
											:to="{path: '/after-sale-apply', query: {skuid: good.skuid, orderNo: item.orderno, shopId: shopId}}">
											<div class="apply-aftersale-btn btn">申请售后</div>
										</router-link>
										<router-link v-else-if="good.skustatus == 10" tag="div" 
											:to="{path: '/after-sale-detail', query: {asNo: good.asorderno, orderNo: item.orderno, shopId: shopId}}">
											<div class="btn">售后中</div>
										</router-link>
										<router-link v-else-if="good.canapplyorderservice && /30|40|50/.test(good.skustatus)" tag="div" 
											:to="{path: '/after-sale-apply', query: {skuid: good.skuid, orderNo: item.orderno, shopId: shopId}}">
											<div class="btn">再次售后</div>
										</router-link>
              							<div class="goods-tips" v-else>该商品无法售后或售后已完成，有问题请联系客服</div>
									</div>
								</div>
							</div>
						</div>
						<div class="as-list-loading gray9" v-show="!page1IsLoading && !data1IsLoadend">
							<div class="loading-container">
								<div class="loading-icon"></div>
								<div class="loading-text">正在加载中...</div>
							</div>
						</div>
						<div class="as-list-loadend gray9" v-show="data1IsLoadend">没有更多了</div>		
					</div>
					<div class="aftersale-list" v-else>
						<div class="order-item" v-for="item in aftersaleList" :key="item.id">
							<div class="order-hd">
								<div>售后编号：{{item.asorderno}}</div>
								<div class="order-status" v-if="item.astype == 2 && item.asstatus == 505">已退款</div>
								<div class="order-status" v-else-if="item.astype == 1 && !item.fullname">退款 {{stateText[item.asstatus]}}</div>
								<div class="order-status" v-else>{{typeText[item.astype]}} {{stateText[item.asstatus]}}</div>          
							</div>
							<div class="goods-item-wrap">
								<div class="goods-item">
									<router-link tag="div" class="goods-info"
										:to="{path: '/after-sale-detail', query: {asNo : item.asorderno, shopId: shopId, orderNo: item.orderno}}">
										<div class="goods-pic">
											<img v-lazy="{src: item.skuimage, loading: IMAGE_DEFAULT.I_200}"  alt="">
										</div>
										<div class="goods-desc">
											<div class="goods-top">
												<div class="goods-title">{{item.spuname}}</div>
												<div class="goods-price">￥{{item.salesprice}}</div>
											</div>
											<div class="goods-sub-title">
												<div class="spec">{{item.spec}}</div>
												<div class="num">x{{item.qty}}</div>
											</div>
										</div>
									</router-link>
									<div class="btn-wrap" v-if="item.asstatus == 501 || item.asstatus == 502 || item.asstatus == 504 || item.asstatus == 507">
										<div class="apply-aftersale-btn btn" @click="cancelAftersaleFn(item.asorderno)">撤销申请</div>
										<router-link v-if="item.permission && item.asstatus == 502" tag="div"
											:to="{path: '/after-sale-detail', query: {asNo : item.asorderno, shopId: shopId}}">
											<div class="apply-aftersale-btn btn">录入快递单</div>
										</router-link>
									</div>
								</div>
							</div>
						</div>
						<div class="as-list-loading gray9" v-show="!page2IsLoading && !data2IsLoadend">
							<div class="loading-container">
								<div class="loading-icon"></div>
								<div class="loading-text">正在加载中...</div>
							</div>
						</div>
						<div class="as-list-loadend gray9" v-show="data2IsLoadend">没有更多了</div>	
					</div>
				</div>
			</div>
		</div>
		<transition name="router-slid" mode="out-in">
            <router-view></router-view>
        </transition>
	</div>
</template>

<script>
	// 注释内容为前一版本   当前内容从小程序移植过来
	import { AfterSale, Order } from '@/apis/';
	import loadmore from '@/components/common/loadmore';
	import { mapState } from 'vuex';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import '@/assets/styles/empty.css';
    import confirmBox from '@/components/common/confirm-box';
	
	const PAGE_SIZE = 10;
	export default {
		data() {
			return {
				pageSize: PAGE_SIZE,
				menuList: [
					{
						'text': '售后申请',
						'status': 0
					},
					{
						'text': '申请记录',
						'status': 1
					}
				],
				statusArr: ['0', '1'],
				data1IsLoading: false,
				page1IsLoading: true,
				data1IsLoadend: false,
				data2IsLoading: false,
				page2IsLoading: true,
				data2IsLoadend: false,
				pageIndex: 1,
				noOrder: false,

				typeText: {
					'1': '退货退款',
					'2': '退款',
					'3': '退货退款',
					'4': '换货',
					'5': '维修'
				},
				stateText: {
					'501': '待审核',
					'502': '请寄回',
					'503': '待商家收货',
					'504': '待平台处理',
					'505': '退款中',
					'506': '退款完成',
					'507': '商家拒绝',
					'508': '已关闭',
					'509': '待商家发货',
					'510': '商家已发货',
					'511': '完成'
				},

				canAftersaleList: [],
				aftersaleList: [],
			}
		},
		computed:{	
			...mapState(['shopId']),
			curStatus() {
				let status = this.$route.query.status && this.$route.query.status.toString();
				status = this.statusArr.indexOf(status) > -1 ? status : 0;
				return status;
			},
			enableScrollFlag() {
				if(this.curStatus == 0) {
					return this.data1IsLoading;
				}else {
					return this.data2IsLoading;
				}
			}
		},
		methods: {
			// 撤销申请
            cancelAftersaleFn(asOrderNo) {
                let that = this;
                confirmBox.open({
                    'message' : '您将撤销该申请，确定继续吗？'
                }).then(
                    (resolve) => {
                        this.reqStart('正在关闭...');
                        return AfterSale.cancel({asOrderNo});
                    }, 
                    reject => {}
                ).then(                    
                    (res) => {
                        this.reqEnd();
                        if(!res) return;
                        if(res.code === this.$ERR.NORMAL){
							this.dataReset();
                            this.init()
                        } else {
                            Toast('商家（平台）已处理该售后。');
                            setTimeout(() => {
                                that.init();
                            }, 1000);
                        }
                    }			
                ).catch((err) => {
                    console.log(err);
                });
            },

			goPage(skustatus, asorderno, skuid, activitytype, spuid) {
				let url = '';
				if(skustatus == 10) {
					url = `/after-sale-detail?asNo=${asorderno}&shopId=${this.shopId}`;
				}else {
					url = activitytype == 2 ? `/detail?skuId=${skuid}&shopId=${this.shopId}&spuId=${spuid}` 
						: `/detail?skuId=${skuid}&shopId=${this.shopId}`;
				}
				this.$router.push({path: url});
			},

			changeActive(status = 0) {
				this.$router.replace({
					query : {
						'status' : status,
						'shopId' : this.shopId
					}
				});
				this.dataReset();
				this.init();
			},
			
			reqStart(text){
				text = text || '加载中...';
				Indicator.show(text);
			},
			reqEnd(){
				Indicator.close();
			},

			// 加载更多
			loadMore() {
				// 因为切换tab时内容清空的瞬间可能会触发loadmore这里加上length判断
				if(this.curStatus == 0 && this.canAftersaleList.length != 0) {
					this.pageIndex++;
					this.data1IsLoading = true;
					this.showCanAftersaleList();
				}else if(this.curStatus == 1 && this.aftersaleList.length != 0) {
					this.pageIndex++;
					this.data2IsLoading = true;
					this.showAftersaleList();
				}			
			},

			// 重置
			dataReset: function () {
				this.canAftersaleList = [];
				this.aftersaleList = [];
				this.data1IsLoading = false;
				this.page1IsLoading = true;
				this.data1IsLoadend = false;
				this.data2IsLoading = false;
				this.page2IsLoading = true;
				this.data2IsLoadend = false;
				this.pageIndex = 1;
				this.noOrder = false;
				document.querySelector('.as-scroll-wrapper').scrollTop = 0;
			},

			// 售后申请列表
			showCanAftersaleList(status = 0, payStatus = 1, loadAsOrderNo = true) {
				this.page1IsLoading && this.reqStart();   //第一次加载的时候才需要显示 加载中... ，加载更多的时候，则不需要显示了
                return Order.getList({
					status: status,
					payStatus: payStatus,
					loadAsOrderNo: loadAsOrderNo,
					pageindex: this.pageIndex,
					pageSize: this.pageSize
				}).then((res) => {
					this.page1IsLoading && this.reqEnd();
					if(res.code === this.$ERR.NORMAL){	
						console.log(res.data)
						this.page1IsLoading = false;
						if(res.data.list.length == 0 && this.canAftersaleList.length == 0) {
							this.noOrder = true;
						}
						this.canAftersaleList = this.canAftersaleList.concat(res.data.list);
						if(this.canAftersaleList.length >= res.data.totalcount){   //如果大于等于总数
							this.data1IsLoading = true;
							this.data1IsLoadend = true;
						} else {
							this.data1IsLoading = false;	
						}
					} else {
						Toast('获取订单数据失败');
					}				
					return res;
                }).catch((err) => {
					this.page1IsLoading && this.reqEnd();
                    console.log(err);
                })
			},

			// 售后申请记录
			showAftersaleList(status = 0) {
				this.page2IsLoading && this.reqStart();
				return AfterSale.getList({
					status: status,
					pageindex: this.pageIndex,
					pageSize: this.pageSize
				}).then((res) => {						
					this.page2IsLoading && this.reqEnd();
					if(res.code === this.$ERR.NORMAL){
						console.log(res.data);
						this.page2IsLoading = false;
						if(res.data.list.length == 0 && this.aftersaleList.length == 0) {
							this.noOrder = true;
						}										
						this.aftersaleList = this.aftersaleList.concat(res.data.list);
						if(this.aftersaleList.length >= res.data.totalcount){   //如果大于等于总数
							this.data2IsLoading = true;
							this.data2IsLoadend = true;
						} else {
							this.data2IsLoading = false;	
						}						
					} else {
						Toast('未获取售后数据，请稍候重试');
					}		
					return res;			
				}).catch((err) => {
					this.page2IsLoading && this.reqEnd();
                    console.log(err);
                })
			},

			init() {
				if(this.curStatus == 0) {
					this.showCanAftersaleList();
				}else {
					this.showAftersaleList();
				}
			}
		},
		directives: {
			loadmore
		},
		created() {
			this.init();			
		},
	}

</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';
	.order-menu {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 9;
		height: .72rem;
		background-color: #fff;
		box-sizing: border-box;
		border-bottom: .02rem solid #e5e5e5;
		font-size: .3rem;
		li {
			text-align: center;
			line-height: .72rem;
			span {
				display: inline-block;
				height: 100%;
				box-sizing: border-box;
				color: #333;
				border-bottom: .04rem solid transparent;
			}
		}
		.active {
			span {
				color: #ff681d;
				border-bottom: .04rem solid #ff681d;
			}
		}
	}
	.as-scroll-wrapper {
		position: absolute;
		top: .72rem;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: auto;
		-webkit-overflow-scrolling: touch;

		&::-webkit-scrollbar{
			display: none;
		}
		
		.as-null-wrapper, .as-loading-wrapper{
			text-align: center;
			padding-top: 2rem;
		}
		.as-list-loading, .as-list-loadend{
			padding: $mg-40 0;
			font-size: 0.26rem;
			text-align: center;
		}
	}

	.order-item {
		background-color: #fff; 
		margin-bottom: .2rem;
	}
	.order-hd {
		margin: 0 .32rem;
		height: .8rem;
		display: flex;
		align-items: center;
		font-size: .22rem;
		color: #999;
		border-bottom: .02rem solid #e5e5e5;
	}
	.order-hd div:first-child {
		margin-right: .48rem;
	}

	.goods-item-wrap {
		padding: 0 .32rem;
	}
	.goods-item-wrap:not(:last-child) {
		border-bottom: .02rem solid #e5e5e5;
	}
	.btn-wrap {
		display: flex;
		justify-content: flex-end;
		padding: .24rem 0;
		border-top: .02rem solid #e5e5e5;
	}
	.btn-wrap .btn {
		width: 1.4rem;
		height: .54rem;
		line-height: .54rem;
		text-align: center;
		font-size: .24rem;
		color: #ff681d;
		border: .02rem solid #ff681d;
		border-radius: .06rem;
		margin-left: .2rem;
	}
	.goods-info {
		display: flex;
		justify-content: space-between;
		padding: .32rem 0;
	}
	.goods-info .goods-pic {
		width: 1.6rem;
		height: 1.6rem;
	}
	.goods-info .goods-pic img {
		display: block;
		width: 100%;
		height: 100%;
	}
	.goods-desc {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex: 1;
		margin-left: .24rem;
	}

	.goods-top {
		display: flex;
		justify-content: space-between;
		font-size: .26rem;
		color: #333;
	}
	.goods-title {
		flex: 1;
		font-size: .26rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		color: #333;
		line-height: .36rem;
	}
	.goods-price {
		margin-left: .54rem;
	}

	.goods-sub-title {
		flex: 1;
		display: flex;
		justify-content: space-between;
		margin-top: .24rem;
	}
	.spec {
		font-size: .22rem;
		color: #999;
	}
	.num {
		font-size: .26rem;
		color: #333;
	}

	.goods-tips {
		font-size: .24rem;
		color: #666;
		text-align: right;
	}

	.aftersale-list .order-hd {
		justify-content: space-between;
	}
	.aftersale-list .order-hd .order-status {
		font-size: .26rem;
		color: #ff681d;
	}

</style>

