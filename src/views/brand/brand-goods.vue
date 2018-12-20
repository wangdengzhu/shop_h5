<template>
	<div class="rank-wrapper" v-if="pageLoaded">
		<cMyHeader :title="brandName"></cMyHeader>
		<cFilterBar @filter="reLoadData"></cFilterBar>
		<div class="goods-list" v-loadmore="loadMoreGoodsData" is-enable-scroll="isLoading">
			<div v-if="isShowEmpty" class="empty-icon empty-icon-goods">
				<span>该分类下没有商品</span>
			</div>
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
	import '@/assets/styles/empty.css';

	export default {
		data(){
			return {
				pageLoaded:!1,
				brandName: '品牌商品',

				goodsArr: [],

				isShowMore: !1,
				isLoadOver: !1,
				isLoading: !1,
				isShowEmpty: !1,

				page: 1,
				perPage: 10,

				params:{
					orderfield: 4, // 1.价格排序 2.收益排序 3.销量排序 4.综合排序 5.新品优先
					orderform: 0, // 1.升序 2.降序 
					lowerprice: 0,
					upperprice: 0,
					provinceid: 0,
					cityid: 0,
					brandid: ''
				}
			}
		},
		methods:{
			reLoadData(filterParams){
				const data = this.params;
				const params = Object.assign(data, filterParams);
				this.isShowMore = !1;
				document.querySelector('.goods-list').scrollTop = 0;
				this.loadBrandGoodsData();
			},
			fetchBrandGoodsData(){
				const pageindex = this.page;
				const pagesize = this.perPage;
				const params = Object.assign({}, this.params, {
					pageindex,
					pagesize
				});
				return Goods.getGoodsByBrand(params);
			},
			loadMoreGoodsData(){
				if(this.isLoadOver){
					return;
				}

				this.page++;
				this.isLoading = !0;
				
				this.fetchBrandGoodsData().then(res => {
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
					console.log(`品牌商品加载更多异常[${err}]`);
				});
			},
			loadBrandGoodsData(){
				this.page = 1;
				Indicator.show('加载中...');
				this.fetchBrandGoodsData().then(res=>{
					this.pageLoaded = !0;
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						Toast(`品牌商品加载失败，请刷新重试`);
						return;
					}
					const data = res.data;

					if (!data || data.length <= 0) {
						this.isShowEmpty = !0;
						this.isShowMore = !1;
						this.goodsArr.splice(0);
						return;
					}

					this.isShowMore = !0;
					this.isShowEmpty = !1;

					if (data.length < this.perPage) {
						this.isLoadOver = !0;
					} else {
						this.isLoadOver = !1;
						this.isShowMore = !0;
					}
					this.goodsArr = res.data;
				}).catch(err=>{
					console.log(`品牌商品异常[${res.code}]`);
					Indicator.close();
				});
			},
			init(){
				const brandId = this.$route.query.brandId;
				const brandName = this.$route.query.brandName;
				if (!brandId) {
					return;
				}
				this.params.brandid = brandId;
				this.brandName = brandName;
				document.title = brandName;
				this.loadBrandGoodsData();
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

	.empty-icon-goods{
		padding-top: 1.5rem;
	}

</style>