<template>
    <span class="time">
        <span>{{timeText}}</span>
        <span class="hour">{{hourText}}</span> :
        <span class="minute">{{minuteText}}</span> :
        <span class="second">{{secondText}}</span>
    </span>
</template>

<script>
    export default{
        data(){
            return{
                timeNum : this.seconds,
                timerId : null,
                hourText:'',
                minuteText:'',
                secondText:''
            }
        },
        props: {
            seconds: [String, Number]
        },
        computed: {
            timeText(){
                return this.timeChange(this.timeNum);
            }
        },
        methods: {
            timeFormat(str){
		    	return str >= 10 ? str : '0' + str;
            },
            timeChange(seconds){
                let that = this;
                let hour=Math.floor((seconds/3600)%24);
                let min=Math.floor((seconds/60)%60);
                let sec=Math.floor(seconds%60);
                let newHour = this.timeFormat(hour);
                let newMin = this.timeFormat(min);
                let newSec = this.timeFormat(sec);

                that.hourText = `${newHour}`;
                that.minuteText = `${newMin}`;
                that.secondText = `${newSec}`;

		    	//return this.timeFormat(min) + ':' + this.timeFormat(sec);
            },
            countDown(){
                if(this.timeNum <= 0){
                    this.$emit('timeend');
                    return;
                }
                this.timerId = setInterval( () => {
                    this.timeNum--;
                    if(this.timeNum == 0){
                        clearInterval(this.timerId);
                        this.$emit('timeend');
                    }
                }, 1000)
            }
        },
        mounted(){
            this.countDown();           
        },
        watch:{
            //监听数据变化
            seconds(val){
                this.timeNum = val;
                this.countDown();
            }
        }
    }
</script>

<style lang="postcss" scoped>
  .time{
      font-size:0.3rem;
  }
</style>