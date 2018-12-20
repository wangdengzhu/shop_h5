<template>
	<div class="wrapper">
		<div v-show="isPageLoaded" class="comments-wrapper" v-loadmore="loadMoreComment" is-enable-scroll="isLoading">
			<div v-if="isShowEmpty" class="comments-empty">暂时还没有评价～</div>
			<template v-else>
				<header class="hd">
					<span class="hd__cnum">评价({{ comments.summary.totalrows }})</span>
					<span class="hd__cpercent">好评度 {{ comments.summary.satisfactionval }}%</span>
				</header>
				<main class="main">
					<div class="comments">
						<ul class="comments__box">
							<li v-for="(comment, idx) in comments.info" :key="idx" class="comments__item">
								<div class="ci__hd">
									<div class="ci__hd-usr">
										<img class="cihu__avatar" :src="comment.usericon" alt="">
										<span class="cihu__name">{{ comment.nickname }}</span>
									</div>
									<div class="ci__hd-ctime">
										<span>{{ comment.createtime }}</span>
									</div>
								</div>
								<div class="ci__bd">
									<div class="ci__bd-stars">
										<i v-for="i in 5" :class="{ 'icon-star--active': i<=comment.stars }" class="icon-star"></i>
									</div>
									<div class="ci__bd-txt" :class="{ellipsis:commentIsTooLong(comment.filtertext) && !comment.isExpand}">
										<span>{{ comment.filtertext }}</span>
									</div>
									<div class="ci__bd-shrink" :class="{collapse:comment.isExpand}" @click="commentShrink(comment)" v-if="commentIsTooLong(comment.filtertext)">
										<i class="icon-shrink"></i>
										<span>{{ comment.isExpand ? '收起': '展开' }}</span>
									</div>
									<div class="ci__bd-pics" v-if="comment.piclist.length">
										<ul class="cibp__list">
											<li @click="showBigBanner(idx, pidx)" v-for="(pic, pidx) in comment.piclist" class="cibp__item">
												<img :src="pic" alt="">
											</li>
										</ul>
									</div>
								</div>
								<div class="ci__ft">
									<span class="ci__ft-spec">{{ comment.spec }}</span>
									<!-- <span class="ci__ft-buytime">购买时间：{{ comment.ordertime }}</span> -->
								</div>
							</li>
						</ul>
						<div class="loading-container" v-if="isShowMore">
							<template v-if="!isLoadOver">
								<span class="loading-icon"></span>
								<span class="loading-txt">加载中...</span>
							</template>
							<template v-else>
								<span class="loading-txt">没有更多评论了</span>
							</template>
						</div>
					</div>
				</main>
				<transition name="fade">
					<div class="comment-big-banner" v-show="isShowBigBanner" @click="closeBigBanner" @touchmove.prevent>
						<div class="swiper-container" id="commentSwiper">
							<div class="swiper-wrapper">
								<div class="swiper-slide" v-for="pic in curCommentPic">
									<img class="swiper-image" :src="pic" >
								</div>
							</div>
							<div class="swiper-pagination swiper-pagination-comment"></div>
						</div>
					</div>
				</transition>	
			</template>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import { Goods } from '@/apis/';
	import Swiper from 'swiper/dist/js/swiper.min';
	import '@/assets/styles/swiper.css';
	import Indicator from '@/components/common/indicator/';
	import loadmore from '@/components/common/loadmore';
	import '@/assets/styles/empty.css';
	
	export default {
		data(){
			return {
				isPageLoaded: !1,
				spuId: '',
				comments: {
					summary:{
						satisfactionval: 0,
						totalrows: 0
					},
					info: []
				},
				activeIdx: -1,
				page: 1,
				perPage: 10,
				isShowMore: !1,
				isLoadOver: !1,
				isLoading: !1,
				isShowEmpty: !1,

				isShowBigBanner: !1,
				curCommentPic: [],
				swiper: null,
				swiperOpts: {
					pagination: {
						el: '.swiper-pagination-comment',
						type: 'fraction'
					},
					observer: !0,
					observeParents: !0,
					initialSlide: 0,
					preloadImages: !0
				}
			}
		},
		methods:{
			commentIsTooLong(comment) {
				return comment.length >= 135;
			},
			commentShrink(comment){
				let bool = !comment.isExpand;
				this.$set(comment, 'isExpand', bool);
			},
			showBigBanner(idx, pidx){
				document.body.classList.add('no-scroll');
				this.isShowBigBanner = !0;
				if(idx === this.activeIdx){
					this.swiper.slideTo(pidx, 0);
					return;
				}
				this.curCommentPic = this.comments.info[idx].piclist;
				this.activeIdx = idx;
				if(this.swiper){
					this.swiper.destroy(); 
				}
				
				this.swiperOpts.initialSlide = pidx;
				this.$nextTick(() => {
					this.swiper = new Swiper('#commentSwiper', this.swiperOpts);
				})	
			},
			closeBigBanner(){
				this.isShowBigBanner = !1;
				document.body.classList.remove('no-scroll');
			},
			fetchComments(){
				const spuId = this.spuId;
				const pageindex = this.page;
				const pagesize = this.perPage;
				
				return Goods.getComment({
					spuId,
					pageindex,
					pagesize
				});
			},
			loadMoreComment(){
				if(this.isLoadOver){
					return;
				}

				this.page++;
				this.isLoading = !0;
				this.fetchComments().then(res => {
					this.isLoading = !1;
					if (res.code !== this.$ERR.NORMAL) {
						return;
					}

					const clist = res.data.info;
					if (clist.length < this.perPage) {
						this.isLoadOver = !0;
					}
					this.comments.info.push(...clist);
				}).catch(err => {
					this.isLoading = !1;
					console.log(err);
				});
			},
			loadComments(){
				this.page = 1;
				Indicator.show('加载中');
				this.fetchComments().then(res => {
					Indicator.close();
					if (res.code !== this.$ERR.NORMAL) {
						return;
					}
					if(!res.data){
						return;
					}
					this.isPageLoaded = !0;
					const clist = res.data.info;
					if (clist.length === 0) {
						this.isShowEmpty = !0;
						return;
					}
					this.isShowMore = !0;
					if (clist.length < this.perPage) {
						this.isLoadOver = !0;
					} else {
						this.isLoadOver = !1;
					}
					this.comments = res.data;
				}).catch(err => {
					Indicator.close();
					console.log(err);
				});
			},
			init(){
				this.$nextTick(() => {
					this.loadComments();
				});
			}
		},
		directives:{
			loadmore
		},
		mounted(){
			this.spuId = this.$route.query.spuId;
			this.init();
		}
	}
</script>
<style>
	.swiper-container{
		width: 100%;
		height: 100%;
		.swiper-slide{
			display: flex;
			justify-content: center;
			align-items: center;
		}
		img{
			display: block;
			width: 100%;
			height: auto;
		}
	}
	.swiper-pagination-fraction{
		top:1.25rem;
		bottom:auto;
		color:#fff;
		span{
			font-size: 0.32rem;
			color:inherit;
			&.swiper-pagination-current{
				font-size: 0.32rem;
			}
		}
	}
</style>
<style scoped>
	@import '../../../assets/styles/mixins';
	.comments-wrapper{
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		z-index: 120;
		background-color: #f5f5f5;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.wrapper{
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		z-index: 2100;
		background-color: #f5f5f5;
	}

	.comments-empty{
		padding-top: 2.8rem;
		color: #999;
		font-size: 0.34rem;
		text-align: center;
		line-height: 0.48rem;

		&:before{
			content:'';
			display: block;
			width: 1.4rem;
			height: 1.28rem;
			margin: 0 auto 0.4rem;
			background: url(../../../assets/images/icon-comment-empty.png) 0 0/ contain no-repeat;
		}
	}

	.comment-big-banner{
		position: fixed;
		top: 0;
		left: 0;
		bottom:0;
		right: 0;
		background-color: #000;
		z-index: 999999;
	}
	
	.hd{
		display: flex;
		justify-content: space-between;
		height: 0.8rem;
		line-height: 0.8rem;
		padding: 0 0.32rem;
		margin-bottom: 0.2rem;
		font-size: 0.28rem;
		background-color: #fff;
	}

	.hd__cnum{
		color: #666;
	}

	.hd__cpercent{
		color: $main-color;
		font-size: 0.26rem;
	}

	.comments__item{
		padding: 0.24rem 0.32rem 0.36rem;
		margin-bottom: 0.2rem;
		background-color: #fff;
		/*&:last-of-type{
			margin-bottom: 0;
		}*/
	}

	.ci__hd{
		display: flex;
		align-items: center;
		justify-content: space-between;

		font-size: 0.26rem;
		line-height: 0.37rem;
		color: #999;
	}

	.ci__hd-usr{
		display: flex;
		align-items: center;
		flex: 1;
		width: 1%;
	}

	.cihu__avatar{
		display: block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		margin-right: 0.16rem;
		background-color: #e5e5e5;
	}

	.cihu__name{
		color: #333;
	}

	.ci__hd-ctime{
		color: #999;
	}

	.ci__bd-stars{
		display: flex;
		margin-top: 0.2rem;
		margin-bottom: 0.34rem;
	}

	.icon-star{
		width: 22px;
		height: 16px;
		background: url(../../../assets/images/icon-star.png) 0 0/contain no-repeat;
	}
	.icon-star--active{
		background-image: url(../../../assets/images/icon-star-active.png);
	}

	.ci__bd-txt{
		line-height: 0.4rem;
		color: #666;
		font-size: 0.26rem;
		white-space: pre-wrap;
		word-break: break-all;

		&.ellipsis{
			display: -webkit-box;
			-webkit-line-clamp: 5;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.ci__bd-shrink{
		position: relative;
		padding-left: 0.37rem;
		margin-top: 0.18rem;
		font-size: 0.26rem;
		color: $main-color;
		line-height: 0.37rem;

		.icon-shrink{
			position: absolute;
			left: 0;
			top: 50%;

			width: 13px;
			height: 8px;
			margin-top: -4px;
			background: url(../../../assets/images/icon-expand.png) 0 0/contain no-repeat;
		}

		&.collapse .icon-shrink{
			background-image: url(../../../assets/images/icon-collapse.png);
		}
	}

	.ci__bd-pics{
		margin-top: 0.24rem;
		margin-bottom: -0.2rem;
	}

	.cibp__list{
		margin-left: -0.22rem;
		margin-right: -0.02rem;
		overflow: hidden;
	}

	.cibp__item{
		display: flex;
		justify-content: center;
		align-items: center;
		float: left;
		width: 2.16rem;
		height: 2.16rem;
		margin-left: 0.2rem;
		margin-bottom: 0.2rem;
		overflow: hidden;
		img{
			display: block;
			width: 100%;
			height: auto;
		}
	}

	.ci__ft{
		margin-top: 0.2rem;
		font-size: 0.22rem;
		color: #999;
		line-height: 0.3rem;
	}

	.ci__ft-buytime{
		margin-left: 0.16rem;
	}

	.fade-enter-active,.fade-leave-active{
		transition: opacity .3s;
	}

	.fade-enter,.fade-leave-to{
		opacity: 0;
	}

</style>
