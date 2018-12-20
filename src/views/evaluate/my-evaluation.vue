<template>
	<div class="evaluation-wrapper">		
		<ul class="evaluation-menu justify-flex tb1px">
			<li v-for="item in menuList" :key="item.id" class="flex-one"
			    @click="switchTabs(item.index)" :class="{'active' : item.index == curStatus}">
				<span>{{item.text}}</span>
			</li>
		</ul>
        <div class="evaluation-scroll-wrapper">
            <div class="waiting-evaluation-wrap" v-show="curStatus == 0" v-loadmore="loadMore" is-enable-scroll="data1IsLoading">
                <div class="wating-evaluation-content" v-if="pendingComment.length > 0">
                    <router-link v-for="item in pendingComment" :key="item.id" tag="div" class="evaluation-item tb1px"
                        :to="{path : 'order-detail', query : { orderNo : item.orderno, shopId: shopId}} ">
                        <div class="goods-pic tb1px">
                            <img v-lazy="{src: item.goodslistpicurl, loading: IMAGE_DEFAULT.I_200}" alt="">
                        </div>
                        <div class="goods-info">
                            <div class="goods-top">
                                <p class="goods-name">{{item.title}}</p>
                                <p class="goods-spec">{{item.spec}}</p>
                            </div>
                            <div class="goods-bot">
                                <div class="left">
                                    <p class="price">￥{{item.salesprice}}</p>
                                    <p class="num">x{{item.qty}}</p>
                                </div>
                                <router-link class="right btn" tag="div" 
                                    :to="{path: '/evaluate', query:{
                                        title: item.title,
                                        spec: item.spec,
                                        qty: item.qty,
                                        goodslistpicurl: item.goodslistpicurl,
                                        price: item.salesprice,
                                        spuid: item.spuid,
                                        orderlineid: item.orderlineid,
                                        status: 0,
                                        shopId: shopId 
                                    }}">
                                    立即评价
                                </router-link>
                            </div>
                        </div>
                    </router-link>
                    <div class="waiting-evaluation-loading gray9" v-show="!page1IsLoading && !data1IsLoadend">
                        <div class="loading-container">
                            <div class="loading-icon"></div>
                            <div class="loading-text">正在加载中...</div>
                        </div>
                    </div>
                    <div class="waiting-evaluation-loadend gray9" v-show="data1IsLoadend">没有更多了</div>
                </div>
                <div class="waiting-eavluation-null" v-else>
                    <img src="../../assets/images/evaluation/icon-no-order.png" alt="">
                    <p>您暂时没有可评价商品~</p>
                    <router-link tag="div" class="btn tb1px" :to="{path : '/home', query : {shopId: shopId}} ">
                        随便逛逛
                    </router-link>
                </div>
            </div>
            <div class="evaluated-wrap" v-show="curStatus == 1" v-loadmore="loadMore" is-enable-scroll="data2IsLoading">
                <div class="evaluated-content" v-if="commented.length > 0">
                    <div class="evaluated-item" v-for="item in commented" :key="item.id">
                        <div class="top-wrap">
                            <div class="user">
                                <img class="avatar" v-lazy="{src: item.usericon, loading: IMAGE_DEFAULT.I_200}" alt="">
                                <p class="user-name">{{item.nickname}}</p>
                            </div>
                            <div class="evaluated-time">
                                {{item.createtime}}
                            </div>
                        </div>
                        <div class="star-wrap">
                            <span v-for="(star, index) in starnum" :key="star.id"  :class="{'active': index < item.stars}"></span>
                        </div>
                        <div class="evaluated tb1px">
                            <div class="ci__bd-txt">
                                <span class="evaluated-text" :class="{ellipsis:commentIsTooLong(item.filtertext) && !item.isExpand}">{{ item.filtertext || '默认好评' }}</span>
                            </div>
                            <div class="ci__bd-shrink" :class="{collapse:item.isExpand}" @click="commentShrink(item)" v-if="commentIsTooLong(item.filtertext)">
                                <i class="icon-shrink"></i>
                                <span>{{ item.isExpand ? '收起': '展开' }}</span>
                            </div>
                            <div class="flex-imgs-wrap" @click="showImgView($event, item.piclist)">
                                <div v-for="img in item.piclist" :key="img.id" class="img-item">
                                    <img v-lazy="{src: img, loading: IMAGE_DEFAULT.I_200}" alt="">
                                </div>
                            </div>
                            <div class="spec-wrap">
                                <p class="spec">{{item.spec}}</p>
                                <!-- <p class="order-time">购买时间：{{item.ordertime}}</p> -->
                            </div>
                        </div>
                        <router-link tag="div" class="goods-wrap" :to="{path : '/detail', query : {shopId: shopId, skuId: item.skuid}} ">
                            <div class="goods-pic tb1px">
                                <img v-lazy="{src: item.picurl, loading: IMAGE_DEFAULT.I_200}" alt="">
                            </div>
                            <div class="goods-info">
                                <div class="goods-top">
                                    <p class="goods-name">{{item.title}}</p>
                                    <p class="goods-spec">{{item.spec}}</p>
                                </div>
                                <div class="goods-bot">
                                    <div class="left">
                                        <p class="price">￥{{item.salesprice}}</p>
                                        <p class="num">x{{item.qty}}</p>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </div>
                    <div class="evaluated-loading gray9" v-show="!page2IsLoading && !data2IsLoadend">
                        <div class="loading-container">
                            <div class="loading-icon"></div>
                            <div class="loading-text">正在加载中...</div>
                        </div>
                    </div>
                    <div class="evaluated-loadend gray9" v-show="data2IsLoadend">没有更多了</div>
                </div>
                <div class="evaluated-null" v-else>
                    <img src="../../assets/images/evaluation/icon-no-comment.png" alt="">
                    <p>暂时还没有评价～</p>
                    <router-link tag="div" class="btn tb1px" :to="{path : '/home', query : {shopId: shopId}} ">
                        随便逛逛
                    </router-link>
                </div>
            </div>
        </div>
        <div class="img-view-wrapper" @touchmove.prevent @click="hideImgView" v-show="showBigImg">
            <div class="img-view-inner">
                <div class="swiper-container">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide" v-for="item in imageUrls" :key="item">
                            <img :src="item" alt="">
                        </div>
                    </div>					
                </div>
            </div>		
            <div class="swiper-pagination"></div>	
        </div>
	</div>	
</template>
<script>
	import { Evaluate } from '@/apis/';
	import { mapState } from 'vuex';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import loadmore from '@/components/common/loadmore';
    const PAGE_SIZE = 10;
    const WAIT_EVALUATE_INDEX = 0;
    const EVALUATED_INDEX = 1;
    const STAR_NUM = 5;
    
	export default {
		data(){
			return {
                firstTabActiveIndex: WAIT_EVALUATE_INDEX,
                starnum: STAR_NUM,
                menuList : [
					{
                        text: '待评价',
                        index: WAIT_EVALUATE_INDEX
					},
					{
                        text: '已评价',
                        index: EVALUATED_INDEX
					},
                ],
                paramObj : {
					'0' : {
						'pageIndex' : 1,
						'pageSize' : PAGE_SIZE
					},
					'1' : {
						'pageIndex' : 1,
						'pageSize' : PAGE_SIZE
					}
				},
				statusArr : ['0','1'], 
				page1IsLoading : true,
                data1IsLoadend : false,
                page2IsLoading : true,
				data2IsLoadend : false,
                pendingComment: [],
                data1IsLoading: false,
				data2IsLoading: false,                
                commented: [],
                starArr: [],
				showBigImg : false,
                mySwiper : null,
                imageUrls: [],
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
        directives:{
			loadmore
		},
		methods:{
            commentIsTooLong(comment) {
				return comment.length >= 135;
			},
			commentShrink(comment){
				let bool = !comment.isExpand;
				this.$set(comment, 'isExpand', bool);
			},
            getPendingComment(params) {
				this.page1IsLoading && Indicator.show('加载中...');
                Evaluate.getPendingComment(params).then(res => {
                    console.log('未评价商品列表', res);
					this.page1IsLoading && Indicator.close();
                    if(res.code === this.$ERR.NORMAL) {
                        this.page1IsLoading = false;	
                        this.pendingComment = this.pendingComment.concat(res.data);
                        if(res.data.length > 0) {
                            if(this.pendingComment.length >= res.data[0].totalrows) {
                                this.data1IsLoading = true;
                                this.data1IsLoadend = true;
                            }else {
                                this.data1IsLoading = false;	
                            }
                        }
                    }else {
                        Toast(res.message);
                    }
                }).catch(err=>{
					console.log('获取未评价商品列表.', err);
					this.page1IsLoading && Indicator.close();
				});
            },
            getCommented(params) {
                this.page2IsLoading && Indicator.show('加载中...');
                Evaluate.getCommented(params).then(res => {
                    console.log('已评价商品列表', res);
					this.page2IsLoading && Indicator.close();
                    if(res.code === this.$ERR.NORMAL) {
                        this.page2IsLoading = false;	
                        this.commented = this.commented.concat(res.data);
                        if(res.data.length > 0) {
                            if(this.commented.length >= res.data[0].totalrows) {
                                this.data2IsLoading = true;
                                this.data2IsLoadend = true;
                            }else {
                                this.data2IsLoading = false;	
                            }
                        }
                    }else {
                        Toast(res.message);
                    }
                }).catch(err=>{
					console.log('获取已评价商品列表.', err);
					this.page2IsLoading && Indicator.close();
				});
            },
            //加载更多
			loadMore() {
				this.data1IsLoading = true;
				this.data2IsLoading = true;
				this.paramObj[this.curStatus].pageIndex++;				
				if(this.curStatus == WAIT_EVALUATE_INDEX) {
                    this.getPendingComment(this.paramObj[this.curStatus]);
                }else {
                    this.getCommented(this.paramObj[this.curStatus]);
                }
			},
            switchTabs(status=WAIT_EVALUATE_INDEX) {
                this.$router.replace({
					query : {
						'status' : status,
						'shopId' : this.shopId
					}
                });
            },
            init() {
                this.getPendingComment(this.paramObj[this.curStatus]);
                this.getCommented(this.paramObj[this.curStatus]);
            },
            showImgView(e, arr){
                this.imageUrls = arr;
				let target = e.target,
                    tagName = target.tagName.toLowerCase();			
				if(!this.imageUrls.length){
					return;
                }			
                let index = Array.from(e.currentTarget.querySelectorAll(tagName)).indexOf(target);
				if(index === -1){
					return;
				}				
				if(this.mySwiper && this.mySwiper.slides.length === this.imageUrls.length){
                    this.mySwiper.slideTo(index);
				} else {
                    this.$nextTick(() => {
                        this.initSwiper(index);
                    })
				}	
				this.showBigImg = true;			
			},
			hideImgView(e){
				this.showBigImg = false;
			},
			initSwiper(index){
				if(this.mySwiper instanceof Swiper){
					this.mySwiper.destroy();
					this.mySwiper = null;
				}
				this.mySwiper = new Swiper('.swiper-container', {
					width: window.innerWidth,
					initialSlide : index,
					pagination : {
						el: '.swiper-pagination',
						type: 'fraction'
					}
				});
			},
        },
        mounted(){
            this.init();
		}
	}	
</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';

    .evaluation-menu{
        position: absolute;
        width: 100%;
        height: 0.72rem;
        top: 0;
        left: 0;
        line-height: 0.72rem;
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
    .evaluation-scroll-wrapper{
        position: absolute;
        top: 0.72rem;
        left: 0;
        right: 0;
        bottom: 0;
        // background-color: #fff;
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

        .wating-evaluation-content {
            padding: .3rem .32rem;
        }
    }
    .waiting-evaluation-wrap,
    .evaluation-list-wrapper {
        background-color: #fff;
    }
    .evaluated-wrap {
        height: 100%;
        overflow-y: auto;
    }
    .waiting-eavluation-null,
    .evaluated-null {
        padding-top: 2.5rem;
        text-align: center;
        background-color: #f5f5f5;
        p {
            margin-top: .42rem;
            font-size: .34rem;
            color: #999;
        }
        .btn {
            width: 2.46rem;
            height: .61rem;
            border-radius: .12rem;
            line-height: .61rem;
            box-sizing: border-box;
            text-align: center;
            color: #FF681D;
            border: 1px solid #FF681D;
            margin: .54rem auto 0;
            font-size: .28rem;
        }
    }
    
    .waiting-eavluation-null img {
        width: 1.5rem;
        height: 1.5rem;
    }
    .evaluated-null img {
        padding-top: .3rem;
        width: 1.4rem;
        height: 1.28rem;
    }
    .evaluation-item {
        display: flex;
        margin-bottom: .4rem;
        height: 2rem;
        .goods-pic {
            width: 2rem /* 200/100 */;
            margin-right: .24rem;
            // border: 1px solid #e5e5e5;
            box-sizing: border-box;
            padding: 1px;
            img {
                display: block;
                width: 100%;
            }
        }
    }
    
    .goods-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        .goods-name {
            margin-bottom: .16rem;
            font-size: .26rem /* 26/100 */;
            line-height: .36rem;
        }
        .goods-spec {
            font-size: .22rem;
            color: #999;
        }
        .goods-bot {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: .54rem /* 54/100 */;
            .left {
                display: flex;
                align-items: center;
                margin-left: -.06rem;
            }
            .price {
                font-size: .26rem;
            }
            .num {
                margin-left: .2rem;
                font-size: .24rem;
                color: #999;
            }
            .btn {
                width: 1.4rem /* 140/100 */;
                height: .54rem;
                font-size: .24rem;
                line-height: .54rem;
                border: 1px solid #FF681D;
                border-radius: .08rem /* 8/100 */;
                text-align: center;
                color: #FF681D;
                box-sizing: border-box;
            }
        }
    }
    .evaluated-content {
        background-color: #f5f5f5;
    }
    .evaluated-item {
        padding: .25rem .32rem;
        background-color: #fff;
        box-sizing: border-box;
        margin-bottom: .2rem;
        .top-wrap {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .user {
                display: flex;
                align-items: center;
            }
            .avatar {
                width: .6rem;
                height: .6rem;
                border-radius: 50%;
            }
            .user-name {
                margin-left: .16rem;
                font-size: .26rem;
            }
            .evaluated-time {
                font-size: .26rem;
                color: #999;
            }
        }
        .star-wrap {
            display: flex;
            align-items: center;
            margin-top: .2rem;
            span {
                width: .32rem;
                height: .32rem;
                margin-right: .12rem;
                background-image: url(../../assets/images/evaluation/icon-star.png);
                background-size: 100%;
                background-repeat: no-repeat;
                &.active {
                    background-image: url(../../assets/images/evaluation/icon-star-active.png);
                }
            }
        }
        .evaluated {
            margin-top: .32rem;
            padding-bottom: .24rem;
            border-bottom: 1px solid #e5e5e5;
            .evaluated-text {
                font-size: .26rem;
                color: #666;
                line-height: 1.4;
                white-space: pre-wrap;
                display: -webkit-box;
                word-break: break-all;
                &.ellipsis {
                    display: -webkit-box;
                    -webkit-line-clamp: 5;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .spec-wrap {
                display: flex;
                font-size: .22rem;
                color: #999;
                .spec {
                    margin-right: .2rem;
                }
            }
            .ci__bd-shrink {
                position: relative;
                padding-left: 0.37rem;
                margin-top: 0.18rem;
                font-size: 0.26rem;
                color: #ff681d;
                line-height: 0.37rem;
                .icon-shrink{
                    position: absolute;
                    left: 0;
                    top: 50%;

                    width: 13px;
                    height: 8px;
                    margin-top: -4px;
                    background: url(../../assets/images/icon-expand.png) 0 0/contain no-repeat;
                }

                &.collapse .icon-shrink{
                    background-image: url(../../assets/images/icon-collapse.png);
                }
            }
        }
        .flex-imgs-wrap {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            margin-top: .25rem;
            .img-item {
                display: flex;
                justify-content: center;
                align-items: center;
                float: left;
                width: 2.12rem;
                height: 2.12rem;
                margin-bottom: 0.25rem;
                overflow: hidden;
                &:nth-child(3n-1)  {
                    margin-left: .25rem;
                    margin-right: .25rem;
                }
                img{
                    display: block;
                    width: 100%;
                    height: auto;
                }
            }
        }
        .goods-wrap {
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding-top: .24rem;
            height: 2rem;
            .goods-pic {
                width: 2rem /* 200/100 */;
                margin-right: .24rem;
                // border: 1px solid #e5e5e5;
                box-sizing: border-box;
                padding: 1px;
                img {
                    display: block;
                    width: 100%;
                }
            }
        }
    }
    .waiting-evaluation-loading,
    .waiting-evaluation-loadend,
    .evaluated-loadend,
    .evaluated-loading {
        font-size: 0.26rem;
        text-align: center;
    }
    .evaluated-loadend {
        padding-bottom: 0.2rem;
    }
    .img-view-wrapper{
		position: absolute;
        top: 0;
        left: 0;
		width: 100%;
		height: 100%;
		padding: 1.2rem 0;
		background-color: #000;
		box-sizing: border-box;		
		z-index: 5;

		.img-view-inner{
			width: 100%;
			height: 100%;
			overflow: hidden;

			img{
				display: block;
				width: 100%;
			}
			.swiper-container, .swiper-wrapper, .swiper-slide{
				height: 100%;
			}
			.swiper-slide{
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
		.swiper-pagination{
			bottom: 0.4rem;
			color: #fff;
		}
	}
</style>