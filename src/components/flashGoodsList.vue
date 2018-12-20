
<template>	
<div>
	<ul class="goods-list__box">
		<li @click="redirect('/detail',{spuId:goods.spuid,skuId:goods.skuid})" v-for="(goods, idx) in goodsArr" :key="goods.spuid" class="goods-list__item">
			<div class="goods-list__pic">
				<!-- <img  :src="goods.goodslistpicurl " alt=""> -->
				<img v-lazy="{src: goods.goodslistpicurl,loading: IMAGE_DEFAULT.I_300
									}" alt="">
				<!-- <div v-if="type==2" class="goods-list__icon" :class="{'goods-list__icon--gray':idx+1>3}">{{idx+1 }}</div> -->
				<div v-if="goods.percentsold == 100" class="goods-list__saleover">
					已抢完
				</div>
			</div>
			<div class="goods-list__info">
				<div class="gli-name-wrap">
					<p class="gli-name">
						<span class="gli-name__txt">{{ goods.goodsname }}</span>
					</p>
					<p class="gli-subname">
						<span class="gli-subname__txt">{{ goods.goodsdescript }}</span>
					</p>
				</div>
				<div :class="statusInfo == 1 ? 'gli-all' : ''">
					<div class="gli-price">
						<span>¥{{ goods.goodsprice.toFixed(2) }}</span>
						<span class="gli-price-small">¥{{ goods.marketprice.toFixed(2) }}</span>	
						<div v-if="goods.percentsold != 100 && statusInfo == 1" class="limit-buy__btn wait__btn">待抢购</div>
						<div v-if="goods.percentsold != 100 && statusInfo == 2" class="limit-buy__btn">抢</div>
						<div v-if="goods.percentsold == 100" class="limit-out__btn out__btn">已抢完</div>
					</div>
					<!--
					<div class="progress-line">
						<div class="progressContainer" v-if="statusInfo != 1">
							<div class="progress" :style="{width:goods.percentsold+'%'}">
								
							</div>
						</div>
						<div class="progress-num" v-if="statusInfo != 1">已售：{{ goods.percentsold }}%</div>
						<div v-if="goods.percentsold != 100 && statusInfo == 1" class="limit-buy__btn">等待抢购</div>
						<div v-if="goods.percentsold != 100 && statusInfo == 2" class="limit-buy__btn">立即抢购</div>
						<div v-if="goods.percentsold == 100" class="limit-out__btn">已抢完</div>
					</div>
					-->
				</div>
			</div>
		</li>
	</ul>
	<div class="limit-tip">
		<h3>温馨提示</h3>
		<p>1. 活动时间：每天 <span>10:00-24:00</span> 限时限量，抢完为止；</p>
		<p>2. 成功抢购商品后，需在15分钟内完成订单支付，超时订单将会自动取消；</p>
		<p>3. 抢购活动内的每款商品，每个用户ID仅限参与抢购一次；</p>
		<p>4. 成功抢购的商品，完成支付后，可在“我的订单”中查看；</p>
	</div>
</div>
</template>
<script>
	export default {
		data(){
			return {
			}
		},
		props:['goodsArr','type','statusInfo'],
		mounted(){
		}
	}
</script>
<style scoped>
	.goods-list__box {
		padding-bottom: .32rem;
	}
	.limit-tip{
		padding:0.4rem 0.32rem;
		background:#f8f8f8;
		color:#666;
		font-size:0.26rem;
		line-height:0.37rem;
	}
	.limit-tip h3{
		color:#333;
		font-size:0.26rem;
		margin-bottom:0.24rem;
		font-family:PingFangSC-Regular;
	}
	.limit-tip p{
		margin-bottom:0.2rem;
		font-family:PingFangSC-Light;
	}
	.limit-tip p span {
		color: #FF681D;
	}
	.progress-line{
		display:flex;
		flex-direction:row;
		justify-content:space-between;
		margin-top:0.13rem;
	}
	.progress-num{
		font-size:0.2rem;
		color:#FF681D;
		margin-left:-0.15rem;
		margin-top:0.09rem;
	}
	div.progressContainer{
		position:relative;
        height: 0.1rem;
        width: 1.6rem;
        border-radius: 0.15rem;
        background-color: #FFE3D5;
        margin-top: 0.17rem;
		border:1px solid #FFAF87;
	}
	div.progress{
		float:left;
		width:30%;
		position:absolute;
		height:0.1rem;
		background:linear-gradient(90deg,rgba(255,176,93,1),rgba(255,131,69,1));
		border-radius:0.15rem 0.1rem 0.1rem 0.15rem;
	}
	@import '../assets/styles/mixins.css';
	.goods-list__item{
		position: relative;
		display: flex;
		align-items: center;
		height: 2rem;
		margin: .32rem .32rem 0;
		padding-left: .13rem;
		padding-right: .13rem;
		background-color: #fff;
		border-radius: .06rem;
		box-sizing: border-box;
	}

	.goods-list__pic{
		position: relative;
		width: 1.75rem;
		height: 1.75rem;
		/*border: 1px solid #e6e6e6;*/
		border-radius: 0.04rem;
		overflow: hidden;
		/*background-color: #f5f5f5;*/

		img{
			display: block;
			width: 100%;
		}

		.goods-list__icon{
			position: absolute;
			top: 0;
			left: 0.16rem;

			width: 0.26rem;
			height: 0.34rem;
			line-height: 0.34rem;

			color: #fff;
			font-size: 0.16rem;
			text-align: center;

			background: url(../assets/images/icon-rank.png) center center/0.26rem 0.34rem no-repeat transparent;
		}

		.goods-list__icon--gray{
			background-image: url(../assets/images/icon-rank-gray.png);
		}
	}

	.goods-list__saleover{
		position: absolute;
		width:1.6rem;
		height:1.6rem;
		line-height:1.6rem;
		background:rgba(0,0,0,0.5);
		left: 0;
		top:0;
		right:0;
		bottom:0;
		margin:auto;
		border-radius:1rem;
		text-align:center;
		font-size:0.32rem;
		font-family:PingFangSC-Regular;
		color:rgba(255,255,255,1);
	}

	.goods-list__info{
		width:4.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex: 1;
		margin-left: 0.3rem;
		line-height: 0.36rem;
		color: #333;
		font-size: 0.28rem;

		.gli-name{
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.gli-subname{
			margin-top: 0.1rem;
			color: #999999;
			font-size: 0.24rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.gli-all{
			display: flex;
			flex-direction: row;
			justify-content: space-between;
		}
		.gli-price{
			display: flex;
			align-items: center;
			line-height: 1;
			color: #FB4A1C;
			font-size:0.36rem;
			margin-top:0.24rem;
		}
		.gli-price-small{
			color: #999;
			font-size:0.22rem;
			margin-left:0.22rem;
			text-decoration:line-through;
		}
		
		.limit-buy__btn{
			position: absolute;
			right: -.3rem;
			bottom: 0;
			width: 1.46rem;
			height: 1rem;
			padding-left: .68rem;
			background-image: url(../assets/images/flashsale/flash-buy.png);
			background-size: 108%;
			background-repeat: no-repeat;
			font-size: .36rem;
			color: #fff;
			line-height: .82rem;
    	box-sizing: border-box;
			&.wait__btn {
				padding-left: .4rem;
				font-size: .28rem;
				line-height: .78rem;
			}
		}
		.limit-out__btn{
			position: absolute;
			right: -.28rem;
			bottom: 0;
			width: 1.46rem;
			height: 1rem;
			padding-left: .4rem;
			background-image: url(../assets/images/flashsale/flash-soldout.png);
			background-size: 108%;
			background-repeat: no-repeat;
			font-size: .28rem;
			color: #959595;
			line-height: .78rem;
			box-sizing: border-box;
		}

	}
</style>