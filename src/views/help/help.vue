<template>
	<div class="help-wrapper">		
		<ul class="main-list" v-if="pageLoaded">
            <router-link class="tb1px" tag="li"
                :to="{path: '/help/list', query:{ sortid: 0, shopId: shopId, sortname: '常见问题' }}">
                <span>常见问题</span>
                <i></i> 
            </router-link>
            <router-link class="tb1px" tag="li" v-for="item in list" :key="item.qa_sort_id"
                :to="{path: '/help/list', query:{ sortid: item.qa_sort_id, shopId: shopId, sortname: item.sort_name }}">
                <span>{{item.sort_name}}</span>
                <i></i> 
            </router-link>
        </ul>
        <transition name="slide">
            <router-view></router-view>
        </transition>
	</div>	
</template>
<script>
	import { Help } from '@/apis/';
	import { mapState } from 'vuex';
	import Indicator from '@/components/common/indicator';
	const BUYER_FLAG = 0;
	export default {
		data(){
			return {
				pageLoaded: !1,
                buyerFlag: BUYER_FLAG,
                list: [],
			}
		},
		computed:{
			...mapState(['shopId'])
		},
		methods:{
            getFirstcate() {
				Indicator.show('加载中...');
                Help.getFirstcate({
                    flag: this.buyerFlag
                }).then(res => {
                    console.log('一级列表', res);
					this.pageLoaded = !0;
					Indicator.close();
                    if(res.code === this.$ERR.NORMAL) {
                        this.list = res.data;
                    }
                }).catch(err=>{
					console.log(`获取帮助一级列表出现异常.`, err);
					Indicator.close();
				});
            }
        },
        mounted(){
			this.getFirstcate();
		}
	}	
</script>

<style lang="postcss" scoped>
	@import '../../assets/styles/mixins.css';

    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: .88rem /* 88/100 */;
        padding: 0 .32rem /* 32/100 */;
        background-color: #fff;
        line-height: .88rem;
        box-sizing: border-box;
        &:not(:last-child) {
            border-bottom: 1px solid #E5E5E5;
        }
        span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: .3rem /* 30/100 */;
            color: #333;
        }
        i {
            display: block;
            width: .15rem /* 15/100 */;
            height: .24rem /* 24/100 */;
            background-image: url(../../assets/images/list-icon.png);
            background-size: 100%;
            background-repeat: no-repeat;
        }
    }

    .help-wrapper {
        position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background-color: #f5f5f5;
		z-index: 10;
		overflow-x: hidden;
    	overflow-y: auto;
    	-webkit-overflow-scrolling: touch;
        .main-list {
            position: relative;
            z-index: 10;
        }
    }
    .slide-enter-active,.slide-leave-active{
		transition: all .3s ease-in-out;
	}
	.slide-enter,.slide-leave-to{
		transform: translate3d(100%,0,0);
	}
</style>