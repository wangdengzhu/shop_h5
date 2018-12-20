<template>
	<div class="page">
		<div class="nf404-wrapper">
			<div class="nf404-icon"></div>
			<div class="nf404-txt">
				<span>抱歉，您要访问的页面找不到了！</span>
			</div>
			<div class="nf404-btn">
				<span class="btn tb1px" @click="nfNav">{{ theShopId ? '返回': '了解满金店' }}</span>
			</div>
		</div>
	</div>
</template>
<script>
	import { mapState } from 'vuex';
 	export default {
		name:'notFound404',
		data(){
			return {

			}
		},
		methods:{
			nfNav(){
				if(this.theShopId){
					this.$router.replace({
						path:'/category',
						query:{
							shopId:this.theShopId
						}
					});
				}else{
					this.$router.replace({
						path:'/about'
					});
				}
			}
		},
		computed:{
			...mapState(['shopId']),
			theShopId(){
				return this.shopId || this.$route.query.shopId;
			}
		}
	}
</script>
<style scoped>
	.page{
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: #fff;
	}
	.nf404-wrapper{
		padding-top: 1.8rem;
		text-align: center;
		.nf404-icon{
			display: block;
			width: 2.56rem;
			height: 1.98rem;
			margin: 0 auto;
			background: url(../../assets/images/404.png) 0 0/cover ;
		}
		.nf404-txt{
			margin: 0.4rem auto 0.5rem;
			font-size: 0.26rem;
			color:#bababa;
		}
		.nf404-btn .btn{
			display: block;
			width: 2.2rem;
			height: 0.6rem;
			margin:0 auto;
			line-height: 0.6rem;
			border:1px solid #ff681d;
			border-radius: 0.4rem;
			font-size: 0.3rem;
			color:#ff681d;
		}
	}
</style>