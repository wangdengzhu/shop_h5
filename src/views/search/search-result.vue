<template>
	<div class="page">
		<div class="search-container">
			<div class="search-main">
				<section class="search tb1px">
					<div @click="$router.back()" class="search-back"></div>
					<form @submit.prevent="search" class="search-form">
						<i class="search-icon"></i>
						<input ref="inp" v-model="keywords" @focus="focusHandler" @blur="blurHander" class="search-inp" type="search" maxlength="25" placeholder="请输入商品名称">
						<i v-show="keywords.length && isFocus" @click="keywords=''" class="icon clear"></i>
					</form>
					<div v-if="isShowHistory" @click="search" class="search-btn" :class="{disabled:keywords.length<=0}">搜索</div>
					<div @click="changeLayout" v-else class="layout-btn" :class="{'grid-btn': isGridLayout}"></div>
				</section>
				<div v-show="isShowHistory">
					<section class="history sec" v-show="historyResult.length">
						<div class="history-hd sec-hd">
							<span class="tit">历史搜索</span>
							<i @click="delHistory" class="icon del"></i>
						</div>
						<ul class="history-list sec-list">
							<li @click="searchByHistoryKW(item)" v-for="item in historyResult" class="history-item sec-item tb1px">{{ item }}</li>
						</ul>
					</section>
					<section class="hot sec">
						<div class="hot-hd sec-hd">
							<span class="tit">热门搜索</span>
						</div>
						<ul class="hot-list sec-list">
							<li @click="searchByHistoryKW(item)" v-for="item in hotResult" class="hot-item sec-item tb1px">{{ item }}</li>
						</ul>
					</section>
				</div>
			</div>
		
			<section class="search-result-wrap" v-if="!isShowHistory">
				<cFilterBar v-if="searchResult.length" @filter="filterSearchData" :hasHeader="false" :hasFilter="true" :isSearch="true" :filterList="filterList"></cFilterBar>
				<section v-if="isShowEmpty" class="empty-icon empty-icon-goods">
					<span>抱歉，没有找到相关商品</span>
				</section>
				<div ref="container" class="result-list search-result" :class="{ grid: isGridLayout }" v-loadmore="loadMore" is-enable-scroll="isLoading"  v-else-if="searchResult.length">
					<cGoodsList :goodsArr="searchResult" type="1"></cGoodsList>
					<div class="loading-container" v-if="isShowMore">
						<template v-if="!isLoadOver">
							<span class="loading-icon"></span>
							<span class="loading-txt">加载中...</span>
						</template>
						<template v-else>
							<span class="loading-txt">没有更多商品了</span>
						</template>
					</div>
				</div>				
			</section>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import store from '@/utils/store';
	import { Goods } from '@/apis/';
	import loadmore from '@/components/common/loadmore';
	import Indicator from '@/components/common/indicator';
	import Toast from '@/components/common/toast';
	import '@/assets/styles/empty.css';
	import iosWxShareFix from '@/plugins/iosWxShareFix';
	import cGoodsList from '@/components/goodsList';
	import cFilterBar from '@/components/filterBar';
	export default {
		data(){
			return {
				isShowHistory:!0,
				isShowEmpty:!1,
				isFocus:!1,

				isLoading:!1,
				isLoadOver:!1,
				isShowMore:!1,
				
				searchResult:[],
				filterList: {},
				historyResult:[],
				hotResult:[],
				
				keywords:'',
				curPage:1,
				perPage:10,
				
				paramsData: {
					orderfield: 4, // 1.价格排序 2.收益排序 3.销量排序 4.综合排序 5.新品优先
					orderform: 0, // 1.升序 2.降序 
					// lowerprice: 0,
					// upperprice: 0
					filtersortid: 0,
					filterbrandids: ''
				},

				isGridLayout: !1
			}
		},
		methods:{
			focusHandler(){
				this.isFocus = !0;
				this.isShowHistory = !0;
			},
			
			blurHander(){
				this.isFocus = !1;
			},
			
			search(){
				if(!this.keywords){
					this.$refs.inp.focus();
					return;
				}
				this.$refs.inp.blur();
				this.getSearchResult();
			},
			
			searchByHistoryKW(kw){
				this.keywords = kw;
				this.getSearchResult();
			},
			
			getSearchResult(){
				this.$router.replace({
					path: '/search-result',
					query: {
						kw: this.keywords,
						shopId: this.shopId
					}
				})
				this.isShowHistory = !1;
				this.isShowEmpty = !1;
				this.searchResult.splice(0);
				this.recordSearch(this.keywords);
				this.curPage = 1;
				this.loadSearchData();
			},
			
			filterSearchData(data){
				const params = this.paramsData;
								
				this.curPage = 1;
				Object.assign(params, data);
				this.loadSearchData();
			},
			
			loadMore(){
				if(this.isLoadOver){
					return;
				}
				this.isLoading =!0;
				this.isShowMore = !0;
				this.curPage++;
				this.fetchSearchData().then((res) => {
					this.isLoading =!1;
					this.dealMoreResult(res);
				}).catch((err) => {
					this.isLoading =!1;
					Indicator.close();
				});
			},
			
			loadSearchData(){
				Indicator.show('搜索中...');
				this.fetchSearchData().then((res) => {
					Indicator.close();
					this.dealSearchResult(res);
				}).catch((err) => {
					console.log(err);
					Indicator.close();
				});
			},
			
			dealSearchResult(res){
				const ERR = this.$ERR;
				if(res.code === ERR.NORMAL){
					this.isShowHistory = !1;
					const goods = res.data.goods;
					
					if (!goods || goods.length === 0) {
						this.isShowEmpty = !0;
						return;
					}
					
					this.isShowEmpty = !1;
					this.isShowMore = !0;
					this.isLoadOver = goods.length < this.perPage ? !0 : !1;
					this.searchResult = goods;
					this.filterList = {
						brandlist: res.data.brandlist,
						catelist: res.data.catelist
					}
					this.$nextTick(()=>{
						this.$refs.container.scrollTop = 0;
					})
				}else if(res.code === ERR.GOODS_NO_RESULT){
					this.searchResult.splice(0);
					this.isShowEmpty = !0;
					this.isShowHistory = !1;
				}else{
					Toast(`服务器繁忙，请重试 [${res.code}]`);
				}
			},
			
			dealMoreResult(res){
				const ERR = this.$ERR;
				const list = res.data.goods;
				if(res.code === ERR.NORMAL){
					if (list.length <= 0) {
						this.isLoadOver = !0;
						return;
					}
					this.searchResult = this.searchResult.concat(list);
					if(list.length < this.perPage){
						this.isLoadOver = !0;
					}else{
						this.isLoadOver = !1;
					}
				}else{
					this.isLoadOver = !0;
					Toast(`服务器繁忙，请重试 [${res.code}]`);
				}
			},
			
			fetchSearchData(){
				let search = this.keywords,
					pageindex = this.curPage,
					pagesize = this.perPage;

				const params = Object.assign({}, this.paramsData, {
					search,
					pageindex,
					pagesize
				});
				console.log(params)
				return Goods.getSearchData(params);
			},
			
			delHistory(){
				this.historyResult.splice(0);
				store.set('searchHistory','');
			},
			
			recordSearch(kw){
				const sr = this.historyResult;
				const MAX_RECORDS = 10;
				if (!kw) {
					return;
				}
				
				if (!sr) {
					store.set('searchHistory', kw);
					sr.push(kw);
					return;
				}
				
				const sidx = sr.indexOf(kw);
				
				if ( sidx > -1) {
					sr.splice(sidx,1);
					sr.unshift(kw);
				}else{
					if (sr.length >= MAX_RECORDS) {
						sr.shift();
					}
					sr.push(kw);
				}
				
				store.set('searchHistory', sr.join('|'));
			},
			
			initSearchHistory(){
				const searchHistory = store.get('searchHistory');
				if(!searchHistory){
					return;
				}
				this.historyResult = searchHistory.split('|');
			},
			
			initHotSearchData(){
				Goods.getHotSearch().then(res => {
					if (res.code !== this.$ERR.NORMAL) {
						return;
					}
					this.hotResult = res.data;
				}).catch(err => {
					console.log(`加载热门搜索词异常[${err}]`);
				});
			},

			changeLayout(){
				this.isGridLayout = !this.isGridLayout;
			},

			init(){
				this.initHotSearchData();
				this.initSearchHistory();
				this.keywords = this.$route.query.kw;
				if(this.keywords){
					this.getSearchResult();
				}
				/*this.$nextTick(()=>{
					this.$refs.inp.focus();
				})*/
			}
		},
		components:{
			cGoodsList,
			cFilterBar
		},
		computed:{
			...mapState(['shopId'])
		},
		directives:{
			loadmore
		},
		watch: {
			'$route' (to, from) {
				let curKW = to.query.kw;
				if(curKW != this.keywords && to.path.indexOf('search-result') > -1 ){
					this.searchByHistoryKW(curKW);
				}
			}
		},
		activated(){
			const page = this.$refs.container;
			page && (page.scrollTop = this.lastScrollTop);
		},
		
		deactivated(){
			const page = this.$refs.container;
			page && (this.lastScrollTop = page.scrollTop);
		},
		mounted(){
			this.init();
		},
		destroyed() {
			console.log(1111)
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins.css';
	.search-container{
		position: absolute;
		top:0;
		right: 0;
		bottom: 0;
		left: 0;
		font-size: $fs-28;
		overflow-x:hidden;
		overflow-y: auto;
		background-color: #fff;
	}
	.search-result-wrap{
		position: absolute;
		top:1.04rem;
		right: 0;
		bottom: 0;
		left: 0;
	}
	.search-main{
		position: relative;
		padding:1.04rem 0.3rem 0; 
		background-color: #fafafa;
		z-index: 1001;
	}
	
	.icon{
		display: block;
	}

	.icon.clear {
		position: relative;
		height: 0.34rem;
		width: 0.34rem;
		border-radius: 50%;
		background-color: #dedede;
		background: url(../../assets/images/search-delete.png) 0 0/contain no-repeat;
	}

	/* .icon.clear:before,.icon.clear:after{
		content:'';
		position: absolute;
		left:50%;
		top:50%;
		
		width: 70%;
		height: 1px;
		margin-left: -35%;
		background-color: #fff;
	}
	
	.icon.clear:before{
		transform:rotate(45deg);;
	}
	.icon.clear:after{
		transform:rotate(-45deg);;
	} */
	
	.search{
		position: fixed;
		top:0;
		left:0;
		right: 0;

		display: flex;
		align-items: center;

		padding: 0.2rem 0 0.2rem 0.3rem ;
		border-bottom: 1px solid  $color-d9;
		
		font-size: $fs-28;
		background-color: #fafafa;
		z-index: 20;
		.search-back{
			position: relative;
			width: 0.4rem;
			height: 0.4rem;
			margin-right: 0.3rem;
			background: url(../../assets/images/shop/icon-arrow-left.png) 0 0/contain no-repeat;
			&:before{
				content:'';
				position: absolute;
				top: -0.2rem;
				right: -0.2rem;
				bottom: -0.2rem;
				left: -0.2rem;
			}
		}
		.search-form{
			position: relative;
			display: flex;
			align-items: center;
			flex:1;
			padding: 0 0.26rem 0 0.68rem;	
			border-radius: $radius-10;		
			background-color: #ededed;
			.search-icon{
				position: absolute;
				top: 0;
				left: 0;
				width: 0.68rem;
				height: 100%;
				background: url(../../assets/images/icon-small-search.png) center center/0.28rem 0.28rem no-repeat;
			}
			.search-inp{
				flex:1;				
				display: block;
				width: 100%;
				height: 0.4rem;
				padding: 0.14rem 0 0.1rem;
				font-size: $fs-28;
				color:$333;
				background-color: transparent;
				box-sizing: content-box;
			}
			.search-inp::-webkit-input-placeholder{
				font-size: $fs-28;
				color:$color-b2;
			}
		}
		.search-btn{
			line-height: 0.64rem;
			padding: 0 0.3rem;
			&.disabled{
				color: #999;
			}
		}
		.layout-btn{
			width: 1.16rem;
			height: 0.4rem;

			background: url(../../assets/images/icon-search-normal.png) center center/0.4rem 0.4rem no-repeat;

			&.grid-btn{
				background-image: url(../../assets/images/icon-search-grid.png);
			}
		}
	}
	.sec{
		margin-top: $mg-40;
		overflow: hidden;
		.sec-hd{
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: $fs-28;
			padding-bottom: $mg-30;
			.icon.del{
				position:relative;
				width: 0.27rem;
				height: 0.3rem;
				background: url(../../assets/images/icon-search-del.png) 0 0/cover;
				&:before{
					content:'';
					position: absolute;
					left:-0.1rem;
					top:-0.1rem;
					bottom:-0.1rem;
					right:-0.1rem;
				};
			}
		}
		.sec-list{
			margin-left: -0.3rem;
			.sec-item{
				float: left;
				height: 0.50rem;
				line-height: 0.50rem;
				border-radius: 0.04rem;
				padding: 0 0.15rem;
				border:1px solid #e5e5e5;
				margin-bottom: $mg-30;
				margin-left: $mg-30;
				font-size: $fs-24;
				color:#666;
			}
		}
	}

	.search-result{
		position: absolute;
		top: 0.88rem;
		left:0;
		right:0;
		bottom:0;
		overflow-y: auto;
		background-color: #fff;
		-webkit-overflow-scrolling:touch;
	}
	
	.search-result.grid{
		/deep/ ul{
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			padding: 0 0.32rem;
		}
		
		/deep/ .goods-list__item{
			display: flex;
			flex-direction: column;
			align-items: initial;
			width: 3.28rem;
			padding: 0;
			border: none;
			margin-top: 0.4rem;

			.goods-list__pic{
				width: 100%;
				height: 3.28rem;
			}

			.gli-name{
				display: -webkit-box;
				-webkit-line-clamp:2;
				-webkit-box-orient: vertical;
				text-overflow: ellipsis;
				overflow : hidden;
				margin-top: 0.2rem ;
			}


			.goods-list__info{
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				width: 100%;
				padding: 0;
				margin-left: 0;
				margin-top: 0;
			}

			.gli-price{
				position: relative;
				margin-top: 0.24rem;
			}
			
			@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) {
				.gli-name{
					margin-bottom: 0.42rem;
				}
				.gli-price__btn{
					position: absolute;
					top: 50%;
					right: 0;
					transform: translateY(-50%);
				}
			}
			
		}
	}

	.empty-icon-goods{
		padding-top: 1.8rem;
	}

	.loading-container{
		margin-top: 0.4rem;
	}

</style>