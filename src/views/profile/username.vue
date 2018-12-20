<template>
	<div class="username-wrapper">
        <input v-model="username" maxlength="20" type="text" placeholder="请输入昵称">
        <p>昵称长度为2-20个字符，有汉字、字母、数字、“_”、“-”组成</p>
        <div class="btn" @click="saveUserName">完成</div>
    </div>
</template>

<script>
	import { User } from '@/apis/';
	import { mapState, mapMutations } from 'vuex';
	import * as types from '@/store/mutations-type';
	import Indicator from '@/components/common/indicator';
	import Toast from '@/components/common/toast';

	export default {
		data() {
			return {
                username: ''
			}
		},
		computed:{
			...mapState(['usrInfo', 'shopId']),
			
		},
		methods : {
			...mapMutations([types.USRINFO_SAVE]),
            
            saveUserName() {
                let reg = /^[\u4e00-\u9fa5_a-zA-Z0-9\-]{2,20}$/;
                if(!reg.test(this.username)) {
                    Toast('昵称长度为2-20个字符，有汉字、字母、数字、“_”、“-”组成');
                    return false;
                }
                Indicator.show('保存中...');
                User.saveUsrInfo({
                    modtype: 2,
                    content: this.username
                }).then(res => {
					Indicator.close();
                    if(res.code === this.$ERR.NORMAL) {
				        const parent = this.$parent;
                        if (parent && parent.getUsrInfo) {
                            parent.getUsrInfo();
                        }
                        this.$router.go(-1);
                    }else {
                        Toast(res.message)
                    }
                }).catch(err=>{
                    Indicator.close();
				});
            },
        },
        mounted(){
			this.username = this.$route.query.username
        }

	}
</script>
<style lang="postcss" scoped>	
	@import '../../assets/styles/mixins.css';

    .username-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99;
        background-color: #f5f5f5;
        input {
            width: 100%;
            height: .88rem;
            line-height: .88rem;
            box-sizing: border-box;
            background-color: #fff;
            padding-left: .34rem;
        }
        p {
            font-size: .24rem;
            color: #999;
            margin-top: .2rem;
            padding-left: .32rem;
            box-sizing: border-box;
        }
        .btn {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: .96rem;
            line-height: .96rem;
            text-align: center;
            font-size: .36rem;
            color: #fff;
            background-color: #FF681D;
        }
    }
</style>