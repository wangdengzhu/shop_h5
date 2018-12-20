<template>
	<transition name="indicator-fade">
		<div v-show="visible" class="indicator-overlay">
			<div class="indicator">
				<img src="../../../assets/images/loading.gif" />
				<!-- <i class="indicator-icon"></i>
				<p class="indicator-txt" v-if="title">{{ title }}</p> -->
			</div>
		</div>
	</transition>
</template>

<script>
	export default {
		data(){
			return {
				visible:!1
			}
		},
		props:{
			title:{
				type:String,
				default:''
			}
		}
	}
</script>

<style scoped>
	.indicator-overlay{
		position: fixed;
		top:0;
		right: 0;
		bottom: 0;
		left: 0;

		display: flex;
		justify-content: center;
		align-items: center;
		
		background-color: rgba(0,0,0,.04);
		transition: opacity .3s;

		z-index: 99999;
	}
	.indicator{
		padding: 0.2rem;
		border-radius: 0.24rem;
		color:#fff;
		font-size: 0.28rem;
		text-align: center;
		background-color:  rgba(255,255,255,.9);
		img{
			width: 1.2rem;
			height: 1.2rem;
		}
		.indicator-icon{
			display: block;
			width:20px;
			height:20px;
			margin: 0 auto;
			border:2px solid #fff;
			border-top-color:transparent;
			border-radius: 50%;
			animation: spinner-rotate 1s linear infinite;
		}
		.indicator-txt{
			max-width: 6em;
			margin-top: 0.2rem;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	@keyframes  spinner-rotate{
		to{
			transform:rotate(1turn);
		}
	}

	.indicator-fade-enter,.indicator-fade-leave-to{
		opacity: 0;
	}
</style>

