<template>
	<div class="rank-wrapper" v-if="pageLoaded">
		<cMyHeader :title="titleName"></cMyHeader>
		<cFilterBar @filter="reLoadData"></cFilterBar>
		<div class="goods-list" v-loadmore="loadMoreNewGoodsData" is-enable-scroll="isLoading">
			<cGoodsList :goodsArr="goodsArr" type="1"></cGoodsList>
			<div class="loading-container" v-if="isShowMore" >
				<template v-if="!isLoadOver">
					<span class="loading-icon"></span>
					<span class="loading-txt">加载中...</span>
				</template>
				<template v-else>
					<span class="loading-txt">没有更多商品了</span>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import { Goods } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import cMyHeader from '@/components/header/header';
	import cGoodsList from '@/components/goodsList';
	import cFilterBar from '@/components/filterBar';
	import loadmore from '@/components/common/loadmore';

	export default {
		data(){
			return {
				tagid:0,
				titleName:'',
				pageLoaded:!1,

				goodsArr: [],

				isShowMore: !1,
				isLoadOver: !1,
				isLoading: !1,

				page: 1,
				perPage: 10,

				params:{
					orderfield: 4, // 1.价格排序 2.收益排序 3.销量排序 4.综合排序 5.新品优先
					orderform: 0, // 1.升序 2.降序 
					lowerprice: 0,
					upperprice: 0
				}
			}
		},
		methods:{
			reLoadData(filterParams){
				const data = this.params;
				Object.assign(data, filterParams);
				this.isShowMore = !1;
				document.querySelector('.goods-list').scrollTop = 0;
				this.loadNewGoodsData();
			},
			fetchNewGoodsData(){
				const pageindex = this.page;
				const pagesize = this.perPage;
				const tagid = this.$route.query.tagid
				const params = Object.assign({}, this.params, {
					tagid,
					pageindex,
					pagesize
				});
				return Goods.getGoodsPersonnalMore(params);
			},
			loadMoreNewGoodsData(){
				if(this.isLoadOver){
					return;
				}

				this.page++;
				this.isLoading = !0;
				
				this.fetchNewGoodsData().then(res => {
					this.isLoading = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}

					if(res.data.length<this.perPage){
						this.isLoadOver = !0;
					}
					
					this.goodsArr = this.goodsArr.concat(res.data);
				}).catch(err => {
					this.isLoading = !1;
					console.log(`新品推荐加载更多异常[${err}]`);
				});
			},
			loadNewGoodsData(){
				this.page = 1;
				Indicator.show('加载中...');
				this.fetchNewGoodsData().then(res=>{
					this.pageLoaded = !0;
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						Toast(`新品推荐加载失败，请刷新重试`);
						return;
					}
					const data = res.data;

					this.isShowMore = !0;

					if (data.length < this.perPage) {
						this.isLoadOver = !0;
					} else {
						this.isLoadOver = !1;
						this.isShowMore = !0;
					}
					this.goodsArr = res.data;
				}).catch(err=>{
					console.log(`新品推荐加载异常[${res.code}]`);
					Indicator.close();
				});
			},
			init(){
				this.loadNewGoodsData();
			}
		},
		components:{
			cMyHeader,
			cGoodsList,
			cFilterBar
		},
		directives:{
			loadmore
		},
		mounted(){
			this.init();
			this.titleName = this.$route.query.name
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins.css';
	
	.goods-list{
		@extend page;
		top: 1.76rem;
		bottom: 0;
		background-color: #fff;
	}

	.loading-container{
		padding-top: 0.2rem;
	}

</style>