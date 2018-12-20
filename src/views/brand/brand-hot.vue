<template>
	<div class="brand-wrapper" v-if="pageLoaded">
		<myHeader title="品牌热销榜"></myHeader>
		<div class="brand-list" >
			<brandList :brandArr="brandArr" type="2"></brandList>
			<div class="no-more">没有更多品牌了</div>
		</div>
	</div>
</template>

<script>
	import { Goods } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import myHeader from '@/components/header/header';
	import brandList from '@/components/brandList';

	export default {
		data(){
			return {
				pageLoaded:!1,

				brandArr: []
			}
		},
		methods:{
			loadBrandData(){
				Indicator.show('加载中...');
				Goods.getBrandHot().then(res=>{
					this.pageLoaded = !0;
					Indicator.close();
					if(res.code !== this.$ERR.NORMAL){
						Toast(`品牌热销榜加载失败，请刷新重试`);
						return;
					}
					this.brandArr = res.data;
				}).catch(err=>{
					console.log(`品牌热销榜加载异常[${res.code}]`);
					Indicator.close();
				});
			},
			init(){
				this.loadBrandData();
			}
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

	.no-more{
		padding-bottom: 0.2rem;
		color: #999;
		font-size: 14px;
		text-align: center;
	}
</style>