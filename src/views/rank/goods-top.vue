<template>
	<div class="rank-wrapper" v-if="pageLoaded">
		<cMyHeader title="热销榜"></cMyHeader>
		<div class="goods-list" >
			<cGoodsList :goodsArr="goodsArr" type="2"></cGoodsList>
			<div class="no-more">没有更多商品了</div>
		</div>
	</div>
</template>

<script>
	import { Goods } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import cMyHeader from '@/components/header/header';
	import cGoodsList from '@/components/goodsList';

	export default {
		data(){
			return {
				pageLoaded:!1,
				goodsArr: []
			}
		},
		methods:{
			loadGoodsHotData(){
				Indicator.show('加载中...');
				Goods.getGoodsHot().then(res=>{
					this.pageLoaded = !0;
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						Toast(`热销榜加载失败，请刷新重试`);
						return;
					}
					this.goodsArr = res.data;
				}).catch(err=>{
					console.log(`热销榜加载异常[${res.code}]`);
					Indicator.close();
				});
			},
			init(){
				this.loadGoodsHotData();
			}
		},
		components:{
			cMyHeader,
			cGoodsList
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
		top: 0.88rem;
		bottom: 0;
		background-color: #fff;
	}

	.no-more{
		padding-bottom: 0.2rem;
		color: #999;
		font-size: 14px;
		text-align: center;
	}

</style>