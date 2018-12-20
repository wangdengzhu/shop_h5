<template>
	<div class="category-wrapper" v-if="pageLoaded"> 
		<header @click="hdNavToSearch" class="category-hd search-hd tb1px">
			<form class="search-hd-form">
				<i class="search-hd-icon"></i>
				<input class="search-hd-inp" readonly type="search" placeholder="请输入商品名称">
			</form>
			<span class="search-hd-btn disabled">搜索</span>
		</header>
		<main class="category-main">
			<div class="cate-cntnr">
				<section class="cate-list" id="cateList">
					<ul class="cl-ul tb1px">
						<li @click="switchCategory(cate,idx,$event)" :key="idx" v-for="(cate,idx) in cateArr" :class="{active:idx==cateIdx}" class="cl-item tb1px">{{cate.catename}}</li>
					</ul>
				</section>
				<section class="cate-cnt">
					<div class="cate-cnt-banner" v-if="curBanners.length">
						<div class="swiper-container" >
							<div class="swiper-wrapper" @click="bannerNav">
								<div v-for="banner in curBanners" class="swiper-slide">
									<img  class="swiper-image" :src="banner.pic">
								</div>
							</div>
							<div class="swiper-pagination"></div>
						</div>
					</div>
					<div class="cate-cnt-box" v-if="curCate.subcate.length">
						<div class="ccb-tit">{{ curCate.catename }}</div>
						<div class="ccb-list">
							<ul class="ccb-ul">
								<li @click="navToMore(subcate)" v-for="(subcate,idx) in curCate.subcate" :key="idx" class="ccb-item">
									<div class="ccb-item-pic">
										<!-- <img class="" :src=" subcate.pic" alt=""> -->
										<img v-lazy="{src: subcate.pic, loading: require('../../assets/images/loading/category.png') }" :key="subcate.pic">
									</div>
									<span class="ccb-item-name">{{ subcate.catename }}</span>
								</li>
							</ul>
						</div>
					</div>					
				</section>
			</div>
		</main>
		<myFooter></myFooter>
	</div>
</template>

<script>
	import { Goods } from '@/apis/';
	import Swiper from 'swiper/dist/js/swiper.min';
	import IScroll from 'iscroll/build/iscroll-lite';
	import Toast from '@/components/common/toast';
	import myFooter from '@/components/footer/footer';
	import Indicator from '@/components/common/indicator';
	import iosWxShareFix from '@/plugins/iosWxShareFix';
	import '@/assets/styles/swiper.css';
	import '@/assets/styles/empty.css';
	export default {
		data(){
			return {
				pageLoaded:!1,
				
				cateIdx:0,
				cateArr:[],
				curCate:{
					banner:[],
					cateid:0,
					catename:'',
					subcate:[]
				},
				curBanners:[],
				
				menuHeight:0,
				myIScroll:null,
				mySwiper:null,
				iScrollClicked:null
			}
		},
		methods:{
			switchCategory(cate,idx,evt){
				this.cateIdx = idx;
				this.curCate = cate;
				this.adjustCatePos(evt);
				this.initBanner();
			},
			adjustCatePos(evt){
				let selfElem = evt.target,
					menuWrap = selfElem.parentNode.parentNode;

				let menuWrapHeight = menuWrap.clientHeight,
					menuHeight = this.menuHeight,
					selfHeight = selfElem.clientHeight,
					selfOffsetTop = selfElem.offsetTop,
					maxOffsetTop = menuHeight - menuWrapHeight;

				if(menuHeight<=menuWrapHeight){
					return;
				}

				if(menuHeight-selfOffsetTop>menuWrapHeight){
					this.myIScroll.scrollTo(0, -selfOffsetTop,300);
				}else{
					this.myIScroll.scrollTo(0, -maxOffsetTop,300);
				}
			},
			setScrollWrapHeight(){
				let menuList= document.querySelector('.cl-ul'),
					menuItems = menuList.querySelectorAll('.cl-item');
				let totalHeight = 0;
				const getStyle = window.getComputedStyle;

				([]).slice.call(menuItems).forEach((item) => {
					let h = parseFloat(getStyle(item,!1).height);
					totalHeight+=h;
				});
				menuList.style.height = totalHeight + 'px';
				this.menuHeight = totalHeight;
			},
			initIScroll(){
				this.$nextTick(() => {
					this.setScrollWrapHeight();
					this.myIScroll = new IScroll('#cateList', {
						click:this.iScrollClicked,
						preventDefault:!0,
						disablePointer:!0,
						scrollX: !1,
						scrollY: !0,
						bindToWrapper:!0
					});
				})
			},
			initBanner(){
				this.curBanners = this.curCate.topcatepic;
				if(this.mySwiper instanceof Swiper){
					this.mySwiper.destroy();
					this.mySwiper = null;
				}
				if (!this.curBanners.length) {
					return;
				}
				this.$nextTick(() => {
					this.mySwiper = new Swiper('.swiper-container', {
						loop: true,
						pagination: {
							el: '.swiper-pagination'
						},
						autoplay: {
							delay: 5000,
							disableOnInteraction:!1
						}
					});
				});
			},
			navToMore(subcate){
				const cname = subcate.catename;
				const sid = subcate.refvalue;
				const cid = subcate.cateid;
				const t = subcate.type;
				this.redirect('/more',{
					cname,
					sid,
					cid,
					t
				});
			},
			hdNavToSearch(){
				this.redirect('/search');
			},
			bannerNav(){
				//item.type,item.bannerlink
				const realIndex = this.mySwiper.realIndex;
				const curBanners = this.curBanners;
				const t = curBanners[realIndex].type;
				const page = curBanners[realIndex].refvalue;
				const skuId = curBanners[realIndex].skuid;

				if (t == 2) {
					if(page.indexOf('http')==0){
						location.assign(page);
					}
				} else if (t == 1) {
					this.redirect('/detail',{
						skuId: skuId,
						spuId: page
					});
				}
			},
			loadCategory(){
				Indicator.show('加载中...');
				Goods.getCatalogue(1).then((res) => {
					if (res.code === this.$ERR.NORMAL) {
						Indicator.close();
						this.pageLoaded = !0;
						this.cateArr = res.data;
						this.curCate = this.cateArr[0];
						this.initIScroll();
						this.initBanner();
					} else {
						Indicator.close();
						Toast(`获取商品分类失败，请刷新页面重试！[${res.code}]`);
					}
				}).catch((err) => {
					console.log('获取商品分类异常：' + err);
				});
			},
			iScrollClick(){
				const ua = navigator.userAgent;
				if (/iPhone|iPad|iPod|Macintosh/i.test(ua)) return !1;
				if (/Chrome/i.test(ua)) return (/Android/i.test(ua));
				if (/Silk/i.test(ua)) return !1;
				if (/Android/i.test(ua)) {
					var s = ua.substr(ua.indexOf('Android') + 8, 3);
					return parseFloat(s[0] + s[3]) < 44 ? !1 : !0
				}
			},
			init(){
				this.iScrollClicked = this.iScrollClick();
				this.loadCategory();
			}
		},
		components:{
			myFooter
		},
		mixins:[iosWxShareFix],
		mounted(){
			this.init();
		}
	}
</script>
<style>
	.swiper-container{
		.swiper-pagination-bullet{
			width: 6px;
			height: 6px;
			background-color: #ccc;
			opacity: 1;
		}
		.swiper-pagination-bullet-active{
			background-color: #ff681d;
		}
	}
</style>
<style scoped>
	@import '../../assets/styles/mixins.css';
	.search-hd{
		position: absolute;
		top:0;
		left:0;
		right: 0;
		padding: 0.2rem 0 0.2rem 0.3rem ;
		border-bottom: 1px solid  $color-d9;
		display: flex;
		font-size: $fs-28;
		background-color: $color-fa;
		z-index: 20;
		.search-hd-form{
			position: relative;
			display: flex;
			align-items: center;
			flex:1;
			padding: 0 0.26rem 0 0.68rem;	
			border-radius: $radius-10;		
			background-color: #ededed;
			.search-hd-icon{
				position: absolute;
				top: 0;
				left: 0;
				width: 0.68rem;
				height: 100%;
				background: url(../../assets/images/icon-small-search.png) center center/0.28rem 0.28rem no-repeat;
			}
			.search-hd-inp{
				flex:1;				
				display: block;
				width: 100%;
				height: 0.4rem;
				padding: 0.12rem 0;
				font-size: $fs-28;
				color:$333;
				background-color: transparent;
				box-sizing: content-box;
			}
			.search-hd-inp::-webkit-input-placeholder{
				font-size: $fs-28;
				color:$color-b2;
			}
		}
		.search-hd-btn{
			line-height: 0.64rem;
			padding: 0 0.3rem;
			&.disabled{
				color: #999;
			}
		}
	}
	
	.category-main{
		position: absolute;
		top: 1.04rem;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: #fff;
		.cate-cntnr{
			position: absolute;
			top: 0;
			right: 0;
			bottom: 1.0rem;
			left: 0;
			overflow: hidden;
		}
		.cate-list{
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			width: 2.0rem;
			
			color: #333;
			font-size: $fs-28;
			.cl-ul{
				min-height: 100%;
				border-right: 1px solid $color-d9;
				background-color: #f5f5f5;
			}
			.cl-item{
				height: 1.0rem;
				line-height: 0.98rem;
				text-align: center;
				border-bottom: 1px solid $color-d9;
				box-sizing: border-box;
				margin-right: -1px;
				overflow: hidden;
				&.active{
					
					color:$main-color;
					background-color: #fff;
					border-right:none;
				}
				&:last-of-type{
					border-bottom:none;
				}
			}
		}
		.cate-cnt{
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 2.0rem;
			padding: 0.4rem;
			overflow-y:auto;
			-webkit-overflow-scrolling:touch; 
			.cate-cnt-banner{
				width: 4.7rem;
				height: 2.07rem;
				margin-bottom: 0.5rem;
			}
			.cate-cnt-box{
				.ccb-tit{
					font-size: $fs-28;
					margin-bottom: 0.4rem;
				}
				.ccb-ul{
					margin-left: -0.7rem;
				}
				.ccb-item{
					float: left;
					width: 1.1rem;
					color:#666;
					font-size: $fs-24;
					text-align: center;
					margin-left: 0.7rem;
					margin-bottom: 0.6rem;
					.ccb-item-pic{
						width: 100%;
						height: 1.1rem;
						overflow: hidden;
						img{
							display: block;
							width: 100%;
							height: auto;
							border-radius: 50%;
						}
					}
					.ccb-item-name{
						display: block;
						height: 0.26rem;
						margin-top: 0.2rem;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
				}
			}
		}
	}
	
	.swiper-container {
		width: 100%;
		height: 100%;
		.swiper-image{
			display: block;
			width: 100%;
			height: auto;
		}
	}

</style>