<template>
    <div>
        <div class="about-img">
            <img src="../../assets/images/entrance.png" alt="" v-show="imgLoaded" @load="imgLoadFun">
            <img src="../../assets/images/entrance-loading.jpg" alt="" v-show="!imgLoaded">
        </div>
    </div>
</template>

<script>
    export default {
        data(){
            return{
                imgLoaded : false
            }
        },
        methods: {
            imgLoadFun(){
                this.imgLoaded = true;
            }
        },
        created(){

        },
        mounted(){

        }
    }
</script>

<style lang="postcss" scoped>
    .about-img{
        width: 100%;        

        img{
            display: block;
            width: 100%;
        }
    }
</style>

