<template>
	<div class="brand-wrapper" v-if="pageLoaded">
		<myHeader title="精选大牌"></myHeader>
		<div class="brand-list" v-loadmore="loadMoreBrand" is-enable-scroll="isBrandLoading">
			<brandList :brandArr="brandArr" type="1"></brandList>
			<div class="loading-container" v-if="isBrandShowMore" >
				<template v-if="!isBrandLoadOver">
					<span class="loading-icon"></span>
					<span class="loading-txt">加载中...</span>
				</template>
				<template v-else>
					<span class="loading-txt">没有更多品牌了</span>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import { Goods } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import myHeader from '@/components/header/header';
	import loadmore from '@/components/common/loadmore';
	import brandList from '@/components/brandList';

	export default {
		data(){
			return {
				pageLoaded:!1,

				brandArr: [],
				page: 1,
				perPage: 10,

				isBrandShowMore: !1,
				isBrandLoading: !1,
				isBrandLoadOver: !1,
			}
		},
		methods:{
			fetchBrandData(){
				const page = this.page;
				const perPage = this.perPage;
				return Goods.getBrandHandpicked(page, perPage);
			},
			loadMoreBrand(){
				if(this.isBrandLoadOver){
					return;
				}

				this.page++;
				this.isBrandLoading = !0;
				
				this.fetchBrandData().then(res => {
					this.isBrandLoading = !1;
					if(res.code !== this.$ERR.NORMAL){
						return;
					}

					if(res.data.length<this.perPage){
						this.isBrandLoadOver = !0;
					}
					
					this.brandArr = this.brandArr.concat(res.data);
				}).catch(err => {
					this.isBrandLoading = !1;
					console.log(`首页品牌加载更多异常[${err}]`);
				});
			},
			loadBrandData(){
				Indicator.show('加载中...');
				this.page = 1;
				this.fetchBrandData().then(res=>{
					this.pageLoaded = !0;
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						Toast(`品牌数据加载失败，请刷新重试`);
						return;
					}
					const data = res.data;

					this.isBrandShowMore = !0;

					if (data.length < this.perPage) {
						this.isBrandLoadOver = !0;
					} else {
						this.isBrandLoadOver = !1;
						this.isBrandShowMore = !0;
					}
					this.brandArr = data;
				}).catch(err=>{
					console.log(`品牌数据加载异常[${res.code}]`);
					Indicator.close();
				});
			},
			init(){
				this.loadBrandData();
			}
		},
		directives:{
			loadmore
		},
		components:{
			myHeader,
			brandList
		},
		mounted(){
			this.init();
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins.css';
	
	.brand-list{
		@extend page;
		top: 0.88rem;
		bottom: 0;
		background-color: #fff;

	}
</style>