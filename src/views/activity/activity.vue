<template>
	<div class="activity" v-if="pageLoaded">
		<div class="activity-bg">
			<!--<img src="../../assets/images/activity1.png" alt="">-->
			<img v-lazy="{src: imgOne ,loading: IMAGE_DEFAULT.I_300}" alt="" onclick="return false">
			<img v-for="item in imgtwoArray" v-lazy="{src: item ,loading: IMAGE_DEFAULT.I_300}" alt="" style="4.84rem" onclick="return false">
			<img v-lazy="{src: imgThree ,loading: IMAGE_DEFAULT.I_300}" alt="" onclick="return false">
		</div>
		<div class="activity-content">
			<router-link :to="{path:'/detail',query:{shopId:shopId,spuId:goods.spuid}}" tag="div" v-for="goods in activityGoods" :key="goods.spuid" class="activity-list">
				<div class="activity-pic">
					<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300}" alt="">
				</div>
				<div class="activity-title">{{goods.goodsname}}</div>
				<div class="activity-price">￥{{goods.goodsprice.toFixed(2)}}<span class="activity-subprice" v-if="goods.marketprice != 0">￥{{goods.marketprice.toFixed(2)}}</span></div>
			</router-link>
		</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import { Goods } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator';
	import myFooter from '@/components/footer/footer';
	import cGoodsList from '@/components/goodsList';
	import '@/assets/styles/empty.css';
	export default {
		data(){
			return {
				pageLoaded: !1,
                activityGoods: [],
				imgOne:'',
				imgTwo:'',
				imgThree:'',
				productSum:0,     //商品数量
				imgtwoArray:[]    //第二张背景图循环
			}
		},

		methods:{
			//获取数据
			loadIndexData(){
				const NORMAL = this.$ERR.NORMAL;
				const activityid = this.$route.query.activityid
				
				Promise.all([Goods.getActivityGoods(activityid),Goods.getH5page(activityid)]).then(res=>{
					const isTrue = res[0].code == NORMAL && res[1].code == NORMAL;
					if(!isTrue){
						Toast('首页数据获取失败，请刷新重试');
						return;
					}
					this.pageLoaded = !0;

					this.activityGoods = res[0].data;
					this.productSum = Math.round(res[0].data.length/2);

					this.imgOne = res[1].data.h5backgroundpic[0];
					this.imgTwo = res[1].data.h5backgroundpic[1];
					this.imgThree = res[1].data.h5backgroundpic[2];
					document.title = res[1].data.h5headtitle;


					for(let i=0;i<this.productSum;i++){
						this.imgtwoArray.push(this.imgTwo);
					}

				}).catch(err=>{
					console.log('获取推荐页面数据异常')
				});
			}

		},
		computed:{
			...mapState(['shopId']),
		},
        created(){
			this.loadIndexData();
		}
	}
</script>
<style scoped>
	.activity-bg img{
		display:block;
		float:left;
	}
	.activity{
		position: absolute;
   		top: 0;
		bottom: 0rem;
		overflow-x: hidden;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
	.activity-bg{
		background-size:100%;	
	}
	.activity-bg img{
    	width: 100%;
		height:100%;
		display:block;
	}
	.activity-content{
		position:absolute;
		top:8.38rem;
	    left:0.32rem;
		background:#fff;
		border-radius:0.08rem;
		width:6.85rem;
		display:flex;
		flex-wrap: wrap;
		padding-top:0.3rem;
		margin-bottom:0.48rem;
	}
	.activity-list{
		width:3rem;
		margin-left:0.3rem;
		height:4.84rem;
	}
	.activity-pic{
		width:3rem;
		height:3rem;
	}
	.activity-pic img{
		width:100%;
		height:100%;
	}
	.activity-title{
		margin-top:0.24rem;
		margin-bottom:0.24rem;
		font-size:0.26rem;
		color:#333;
		display: -webkit-box;  
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-height: 0.34rem;
		word-wrap: break-word;
		text-overflow: ellipsis;
		overflow: hidden;
		height:0.68rem;
	}
	.activity-price{
		font-size:0.26rem;
		color:#333;
		margin-bottom:0.01rem;
	}
	.activity-price span{
		font-size:0.22rem;
		color:#999;
		margin-left:0.26rem;
		text-decoration:line-through
	}
</style>