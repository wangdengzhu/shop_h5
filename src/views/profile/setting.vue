<template>
	<div class="setting-wrapper">
		<ul class="list" v-if="showpage">
            <li class="avatar-item">
                <span>个人头像</span>
                <div>
                    <img :src="usrInfo && usrInfo.photo" alt="">
                    <i></i>
                </div>
                <input type="file" class="file-inp" accept="image/*" @change="uploadImg($event)">
            </li>
            <router-link :to="{path : '/profile/setting/username', query : { shopId: shopId, username: usrInfo && usrInfo.username }}" tag="li">
                <span>昵称</span>
                <div>
                    <p>{{usrInfo && usrInfo.username}}</p>
                    <i></i>
                </div>
            </router-link>
        </ul>
        <div class="cropper-wrap" v-show="showCropper">
            <vueCropper
                ref="cropper"
                :img="imgOption.img"
                :autoCrop="imgOption.autoCrop"
                :autoCropWidth="imgOption.autoCropWidth"
                :autoCropHeight="imgOption.autoCropHeight"
                :fixedBox="imgOption.fixedBox"
                :canMoveBox="imgOption.canMoveBox"              
                :full="imgOption.full"              
                :canScale="imgOption.canScale"              
            ></vueCropper>
            <div class="btn cancel-btn" @click="cancel">取消</div>
            <div class="btn ok-btn" @click="saveAvatar">使用</div>
        </div>
        <transition name="slide">
            <router-view></router-view>
        </transition>
	</div>
</template>

<script>
	import { User } from '@/apis/';
	import { mapState, mapMutations } from 'vuex';
	import * as types from '@/store/mutations-type';
	import Indicator from '@/components/common/indicator';
	import Toast from '@/components/common/toast';
    import myFooter from '@/components/footer/footer';
    import VueCropper from 'vue-cropper';
	import EXIF from 'exif-js';
    import { compressImg, dataURLtoBlob } from '@/utils/imageManage';
    
    const MAX_NUM = 5;
	const MAX_IMG_SIZE = MAX_NUM * 1024 * 1024;

	export default {
		data() {
			return {
                showpage: !1,
                showCropper: !1,
                imgOption: {
                    img: '',
                    autoCrop: true,
                    autoCropWidth: window.innerWidth,
                    autoCropHeight: window.innerWidth,
                    fixedBox: true,
                    canMoveBox: false,
                    full: true,
                    canScale: true,
                },
                upImgName: ''
			}
		},
        components:{
            VueCropper
		},
		computed:{
			...mapState(['usrInfo', 'shopId']),
			
		},
		methods : {
            ...mapMutations([types.USRINFO_SAVE]),
            getUsrInfo(){
				User.getUsrInfo().then((res) => {
					let resCode = res.code;
					if(resCode == this.$ERR.NORMAL){
						this.USRINFO_SAVE(res.data);
					} else if(resCode == this.$ERR.USRINFO_GET_FAIL){
						Toast('获取用户信息失败');
					}		
				}).catch((err) => {
					console.log(err);
				})
			},		
			uploadImg (e) {
                Indicator.show('加载中...');
                //上传图片
                let file = e.target.files[0];
                this.upImgName = file.name;
                let self = this;
                if(file.size > MAX_IMG_SIZE){
                    Indicator.close();
					Toast('头像不能大于' + MAX_NUM +'M');
					return;
                }
                
                let orientation = 0;
				EXIF.getData(file, function(){
					EXIF.getAllTags(this);
					orientation = EXIF.getTag(this, 'Orientation');
                })
                let quality = 0.1;
                let reader = new FileReader();	
                reader.onload = (e) => {
                    let img = new Image();					
					let result = e.target.result;  
					img.addEventListener('load', callback,  false);
					img.src = result;    
					function callback(e){      
                        let newData = compressImg(img, {orientation, quality});    //压图
                        let blob = dataURLtoBlob(newData);				  //转为Blob对象
                        self.showCropper = !0;
                        self.imgOption.img = newData;
                        setTimeout(() => {
                            Indicator.close(); 
                        }, 0);					
					}
                }
                reader.readAsDataURL(file);
            },
            saveAvatar() {
                Indicator.show('保存中...');
                this.cancel();
                let self = this;
                let imageData = new FormData();
                this.$refs.cropper.getCropData((data) => {
                    //获取图片的 Orientation
                    let orientation = 0;
                    EXIF.getData(data, function(){
                        EXIF.getAllTags(this);
                        orientation = EXIF.getTag(this, 'Orientation');
                    });
                    let quality = 0.1;	
                    // do something
                    let img = new Image();
					img.addEventListener('load', callback,  false);
                    img.src = data;
					function callback(e){      
                        let newData = compressImg(img, {orientation, quality});    //压图
                        let blob = dataURLtoBlob(newData);				  //转为Blob对象
                        imageData.append('imagefile', blob, self.upImgName);
                        User.saveUsrPhoto(imageData).then(res => {
                            self.getUsrInfo();
                            Indicator.close();
                            img = null;	
                        }).catch(err=>{
                            Indicator.close();
                        }); 
                    }
                })
                
            },
            cancel() {
                document.querySelector('.file-inp').value = '';
                this.showCropper = !1;
            },
			init(){
                this.showpage = !0;
			}
        },
        mounted(){
			this.init();
        }

	}
</script>
<style lang="postcss">	
	@import '../../assets/styles/mixins.css';

    .setting-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        overflow-y: auto;
        background-color: #f5f5f5;
        .list {
            background-color: #fff;
            li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e5e5e5;
                height: .88rem;
                padding: 0 .32rem;
                box-sizing: border-box;
                div {
                    display: flex;
                    align-items: center;
                }
                i {
                    display: block;
                    width: .12rem;
                    height: .24rem;
                    margin-left: .2rem;
                    background: url(../../assets/images/list-icon.png) no-repeat center right;
			        background-size: .12rem .24rem;
                }
                span {
                    flex: 1;
                    font-size: .3rem;
                    line-height: 1;
                }
                p {
                    color: #666;
                    font-size: .28rem;
                    line-height: 1;
                }
            }
            .avatar-item {
                position: relative;
                height: 1.28rem;
                img {
                    width: .96rem;
                    height: .96rem;
                    border-radius: 50%;
                    vertical-align: middle;
                }
                .file-inp {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                }
            }
        }
        .vue-cropper {
            background: #000;
        }
        .cropper-wrap {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
            .btn {
                position: absolute;
                bottom: .32rem;
                color: #fff;
            }
            .cancel-btn {
                left: .32rem
            }
            .ok-btn {
                right: .32rem
            }
        }
        .crop-info {
            display: none;
        }
        .slide-enter-active,.slide-leave-active{
            transition: all .3s ease-in-out;
        }
        .slide-enter,.slide-leave-to{
            transform: translate3d(100%,0,0);
        }
    }
</style>