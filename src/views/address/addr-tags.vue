<template>
	<transition name="slide-right">
		<div class="addrtags-wrapper" v-if="show">
			<div class="addrtags-cntnr">
				<div class="addr-tags">
					<span  v-for="(tag,idx) in tagsArr" class="addr-tags__item tb1px">
						<em>{{ tag.label_name }}</em>
						<i @click="delTag(idx,tag.addr_label_id)" v-if="tag.addr_label_id>2" class="icon-del">x</i>
					</span>
				</div>
				<div class="tag-input_box tb1px">
					<input v-model="tagName" type="text" name="tag" maxlength="5" placeholder="请输入标签名称（最多五个字）">
				</div>
			</div>
			<div class="tag-save-btn" @click="saveTag">保存</div>
		</div>
	</transition>
</template>

<script>
	import { AddrTag } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator/';
	export default {
		data(){
			return {
				// tagsArr:[]
				isSubmiting:!1,
				isDeleting:!1,
				tagName:''
			}
		},
		props:{
			show:{
				type:Boolean,
				default:!1
			},
			tags:{
				type:Array
			}
		},
		methods:{
			loadAddrTagData(){
				AddrTag.getList().then((res) => {
					if (res.code !== this.$ERR.NORMAL) {
						console.log(`获取地址标签失败：[${res.code}]`);
						return;
					}
					this.tagsArr = res.data;
				}).catch(err => {
					console.log(`获取地址标签出现异常：${err.message}`);
				});
			},
			saveTag(){
				if(this.tags.length>=6){
					Toast('最多可以有6个地址标签');
					return;
				}
				
				if (this.isSubmiting) {
					return;
				}				

				const tagName = this.tagName;

				if (tagName == '') {
					Toast('标签名不能为空');
					return;
				}

				if(tagName.length>5){
					Toast('标签名不能多余5个字');
					return;
				}
				this.isSubmiting = !0;
				AddrTag.add(tagName).then(res => {
					this.isSubmiting = !1;
					if(res.code !== this.$ERR.NORMAL){
						Toast('标签保存失败，请重试');
						return;
					}
					this.tagName = '';
					this.$emit('save',{tagName,tagId:res.data});
				}).catch(err => {
					this.isSubmiting = !1;
					Toast(`标签保存异常，请重试[${res.code}]`);
				});
			},
			delTag(idx,tagId){
				if (this.isDeleting) {
					return;
				}

				this.isDeleting = !0;
				
				AddrTag.del(tagId).then(res => {
					this.isDeleting = !1;
					if(res.code !== this.$ERR.NORMAL){
						Toast('标签删除失败，请重试');
						return;
					}
					this.$emit('del',{idx,tagId});
				}).catch(err => {
					this.isDeleting = !1;
					Toast(`标签删除异常，请重试[${res.code}]`);
				});
			},
			init(){
				this.loadAddrTagData();
			}
		},
		computed:{
			tagsArr(){
				return this.tags.slice(0);
			}
		},
		mounted(){
			// this.init();
		}
	}
</script>

<style scoped>
	@import '../../assets/styles/mixins.css';
	.addrtags-wrapper{
		@extend page;
		position: fixed;
		bottom: 0;
		background-color: #f5f5f5;
	}
	.addrtags-cntnr{
		background-color: #fff;
	}
	.addr-tags{
		display: flex;
		flex-wrap: wrap;
		padding: 0.3rem 0.32rem;
		padding-bottom: 0; 

		.addr-tags__item{
			position: relative;
			min-width: 0.8rem;
			height: 0.36rem;
			line-height: 0.36rem;
			padding: 0 0.18rem;
			margin-right: 0.48rem;
			margin-bottom: 0.3rem;

			border: 1px solid currentColor;
			border-radius: 0.04rem;
			box-sizing: border-box;

			color: #999;
			font-size: 0.22rem;
			text-align: center;
		}

		.icon-del{
			position: absolute;
			right: -0.16rem;
			top: -0.16rem;
			width: 0.32rem;
			height: 0.32rem;
			line-height: 0.32rem;
			text-align: center;
			border-radius: 50%;
			background-color: #e5e5e5;
			color: #999;
		}

		.addr-tags__item--active{
			color:$main-color;
		}
	}

	.tag-input_box{
		padding: 0 0.32rem;
		border-top: 1px solid #e5e5e5;

		input{
			width: 100%;
			height: 0.4rem;
			padding: 0.24rem 0;
			color: #333;

			&::-webkit-input-placeholder{
				font-size: 0.28rem;
				color: #ccc;
			}
		}
	}

	.tag-save-btn{
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;

		height: 1.0rem;
		line-height: 1.0rem;
		text-align: center;
		font-size: 0.36rem;
		color: #fff;
		background-color: $main-color;
	}

	.slide-right-enter-active,.slide-right-leave-active{
		transition: all .3s linear;
	}
	.slide-right-enter,.slide-right-leave-to{
		transform: translate3d(100%,0,0);
	}
</style>