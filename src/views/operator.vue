<template>
	<div class="wrapper">
		<span class="btn" @click="actionHandler(1)">删除SN</span>
		<span class="btn" @click="actionHandler(2)">查看SN</span>
		<span class="btn" @click="actionHandler(3)">删除TOKEN</span>
		<span class="btn" @click="actionHandler(4)">查看TOKEN</span>
	</div>
</template>

<script>
	import Store from '@/utils/store';
	import { removeCookie,setCookie,getCookie } from '@/utils/common';
	export default {
		data(){
			return {

			}
		},
		methods:{
			actionHandler(action){
				if(action == 1){
					this.$store.state.openid = '';
				}else if(action == 2){
					alert(this.$store.state.openid);
				}else if(action == 3){
					this.$store.commit('LOGOUT');
				}else if(action == 4){
					const localToken = Store.get('token');
					const cookieToken = getCookie('token');
					alert(`localToken:${localToken};\r\ncookieToken:${cookieToken}`);
				}
			}
		}
	}
</script>

<style scoped>
	.wrapper{
		margin: 10px auto;
		width: 120px;
	}
	.btn{
		display: block;
		width: 100px;
		height: 32px;
		border-radius: 3px;
		background-color: #ff681d;
		margin-bottom: 40px;
		font-size: 14px;
		line-height: 32px;
		text-align: center;
		color:#fff;
	}
</style>