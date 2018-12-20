<template>
	<div class="invoice-wrapper">
		<form class="invoice-form">
			<div class="invoice-form__item">
				<p class="item-tit">是否开票</p>
				<div class="item-btns">
					<span @click="isShowIv(!0)" class="item-btn tb1px" :class="{active:isRequireIv}">开票</span>
					<span @click="isShowIv(!1)" class="item-btn tb1px" :class="{active:!isRequireIv }">不开票</span>
				</div>
			</div>
			<div class="invoice-form__cntnr" v-show="isRequireIv">
				<div class="invoice-form__item">
					<p class="item-tit">发票类型</p>
					<div class="item-btns">
						<span class="item-btn active tb1px">普通发票</span>
					</div>
				</div>
				<div class="invoice-form__item invoice-form__item--noPB" >
					<p class="item-tit">发票抬头</p>
					<div class="item-btns">
						<span @click="changeIvType(1)" class="item-btn tb1px" :class="{active:ivType==1}">个人</span>
						<span @click="changeIvType(2)" class="item-btn tb1px" :class="{active:ivType==2}">单位</span>
					</div>
					<div v-if="ivType==1" class="item-box item-person">
						<p class="item-box__para tb1px">
							<input v-model="personName" type="text" class="item-box__inp" placeholder="请填写个人名字">
						</p>
					</div>
					<div v-if="ivType==2" class="item-box item-company">
						<p class="item-box__para tb1px">
							<input v-model="companyName" type="text" class="item-box__inp" placeholder="请填写企业名称">
						</p>
						<p class="item-box__para tb1px">
							<input v-model="companyTaxNo" type="text" class="item-box__inp" placeholder="请填写纳税人识别号">
						</p>
					</div>
				</div>
				<div class="invoice-form__item invoice-form__item--noPB">
					<div class="item-box item-contact">
						<p class="item-box__para tb1px">
							<label for="tel">*手机号</label>
							<input v-model="mobile" type="text" class="item-box__inp" id="tel" placeholder="手机号" maxlength="11">
						</p>
						<p class="item-box__para tb1px">
							<label for="email"><i>*</i>邮箱</label>
							<input v-model="email" type="text" class="item-box__inp" id="email" placeholder="用来接收电子邮件(非必填)">
						</p>
					</div>
				</div>
				<div class="invoice-cnt">
					<p class="invoice-cnt__note">
						<span class="note-txt">发票内容</span>
						<span class="note-txt small">发票内容选项已根据税法调整，具体请已票据</span>
					</p>
					<div class="invoice-cnt__detail">
						<span class="detail-btn active tb1px">商品明细</span>
						<p class="detail-item">发票内容将显示详情商品名称和价格信息</p>
						<p class="detail-item">发票内容将显示本单商品所属类别属性及价格</p>
					</div>
				</div>
			</div>
		</form>
	
		<div class="invoice-ft">
			<span @click="saveInvoice" class="invoice-ft__btn">确认</span>
		</div>
	</div>
</template>


<script>
	import { Invoice, Order } from '@/apis/';
	import Toast from '@/components/common/toast';
	import Indicator from '@/components/common/indicator/';
	export default {
		data(){
			return {
				ivType: 0,
				mobile: '',
				email: '',
				personName: '个人',
				companyName: '',
				companyTaxNo: '',
				isRequireIv: !1,
				isNeedInvoice: !1,

				isSubmiting: !1,

				lastInvoice: []
			}
		},
		computed:{
			orderNo(){  // url 中的 订单号
                return this.$route.query.orderNo;
			},
		},
		methods:{
			saveInvoice(){
				if(!this.isRequireIv){
					this.ivType = 0;
					this.redirectToOrder();
					return;
				}

				let invoiceFormData = this.getInvoiceFormData();

				if(!invoiceFormData){
					return;
				}

				if(this.isSubmiting){
					return;
				}

				this.isSubmiting = !0;
				//如果没有订单号就保存发票信息，否则先保存再开票
				if (!this.orderNo){
					this.saveCartInvoice(invoiceFormData).then((res) => {
						if (res.data) {
							this.redirectToOrder(res.data);
						}
					});
				} else {
					this.openOrderInvoice(invoiceFormData);
				}							
			},
			//保存发票, 用于购物车提交订单之前
			saveCartInvoice(params){
				Indicator.show('保存中...');
				return Invoice.save(params).then(res => {
					this.isSubmiting = !1;
					Indicator.close();
					if (res.code !== this.$ERR.NORMAL) {
						Toast(`${res.message}.[${res.code}]`);
						return;
					}					
					return res;
				}).catch(err => {
					this.isSubmiting = !1;
					Indicator.close();
				});
			},
			//用于已生成的订单，申请开票, 需要先保存发票
			openOrderInvoice(params){
				Indicator.show('申请中...');
				let invoiceFormData = params;
				this.saveCartInvoice(invoiceFormData).then((res) => {						
					let transArr = [NaN, 10, 1];
					invoiceFormData = this.transformData(invoiceFormData);					
					invoiceFormData.orderNo = this.orderNo;	
					//因为erp数据库不一致的原因，需要转换数据
					//invoiceFormData.invoicetitletype 等于 1 时， 转为为 10，
					//invoiceFormData.invoicetitletype 等于 2 时， 转为为 1，
					invoiceFormData.invoicetitletype = transArr[invoiceFormData.invoicetitletype];				
					return Order.invoice(invoiceFormData);
				}).then((res) => {
					this.openInvoiceCb(res);
				}).catch(err => {
					this.isSubmiting = !1;
					Indicator.close();
				});	
			},
			openInvoiceCb(res){
				Indicator.close();
				if (res.code !== this.$ERR.NORMAL) {
					Toast(`申请开票失败.[${res.code}]`);
				} else {
					Toast('申请开票成功');
					setTimeout(this.redirectToOrderDetail.bind(this), 1500);
				}
			},
			getInvoiceFormData(){
				const InvoiceType = 1;
				const InvoiceTitleType = this.ivType;
				const isPersonal = InvoiceTitleType == 1;
				const InvoiceContentType = 1;
				const Mobile = this.mobile;
				const Email = this.email;
				const CompanyName =  isPersonal ? this.personName : this.companyName;
				const CompanyTax = this.companyTaxNo;

				const telRE = /^\d{11}$/;
				const emailRE = /[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;

				let err = '';

				if(CompanyName == ''){
					err = isPersonal ? '请输入个人名称' : '请输入企业名称';
				}

				if(isPersonal && CompanyName){
					err = CompanyName.indexOf('公司') > -1 ? '个人名称中不能包含公司' : '';
				}

				if (CompanyName && InvoiceTitleType == 2) {
					err = this.checkTaxIDentifier(CompanyTax);
				}
				
				if(!telRE.test(Mobile)){
					err = '请输入正确的手机号码';
				}else if(Email && !emailRE.test(Email)){
					err = '请输入正确的电子邮箱';
				}

				if(err){
					Toast(err);
					return null;
				}

				return {
					InvoiceType,
					InvoiceTitleType,
					InvoiceContentType,
					Mobile,
					Email,
					CompanyName,
					CompanyTax
				};
			},
			checkTaxIDentifier(tax){
				let err = '';
				let regArr = [/^[\da-z]{10,15}$/i, /^\d{6}[\da-z]{10,12}$/i, /^[a-z]\d{6}[\da-z]{9,11}$/i, /^[a-z]{2}\d{6}[\da-z]{8,10}$/i, /^\d{14}[\dx][\da-z]{4,5}$/i, /^\d{17}[\dx][\da-z]{1,2}$/i, /^[a-z]\d{14}[\dx][\da-z]{3,4}$/i, /^[a-z]\d{17}[\dx][\da-z]{0,1}$/i, /^[\d]{6}[\da-z]{13,14}$/i];
				
				if(tax == ''){
					err = '请输入纳税人识别号';
				}else{
					err = regArr.some(re => re.test(tax)) ? '' : '纳税人识别号格式错误';
				}

				return err;
			},
			transformData(data){
				let filterTable = {
					InvoiceType: 'invoicetype',
					InvoiceTitleType: 'invoicetitletype',
					InvoiceContentType: 'invoicecontenttype',
					Mobile: 'tel',
					Email: 'email',					
					CompanyName: 'fullname',
					CompanyTax: 'tin'
				}
				let deepCopyData = JSON.parse(JSON.stringify(data));
				let resultData = {},
					newKey = '';
				Object.keys(deepCopyData).forEach(key => {
					newKey = filterTable[key];
					resultData[newKey] = deepCopyData[key];
				});			
				return resultData;
			},
			redirectToOrder(datetime){
				const data = {
					ivType:this.ivType
				};
				if(datetime){
					data.ct = datetime;
				}
				this.redirect('/order',Object.assign({},this.$route.query,data));
			},
			redirectToOrderDetail(){
				this.redirect('/order-detail', {orderNo: this.orderNo});
			},
			fillFormData(){
				if(this.lastInvoice.length===0){
					return;
				}
				let invoiceData = this.ivType == 1 ? this.lastInvoice.find(item=>item.invoicetitletype==1) : this.lastInvoice.find(item=>item.invoicetitletype==2);

				invoiceData = invoiceData || {
					mobile: '',
					email:'',
					companyname:'',
					companytax:''
				};
				this.mobile = invoiceData.mobile;
				this.email = invoiceData.email;
				
				if(this.ivType == 1){
					this.personName = invoiceData.companyname || '个人';
				}

				if (this.ivType == 2) {
					this.companyName = invoiceData.companyname;
					this.companyTaxNo = invoiceData.companytax;
				}
			},
			getLastInvoice(){
				Invoice.getLast(0).then(res=>{
					if(res.code !== this.$ERR.NORMAL){
						return;
					}
					this.lastInvoice = res.data;
					this.ivType && this.fillFormData();
				}).catch(err=>{
					console.log(`获取最近发票出现异常.`);
				});
			},
			changeIvType(t){
				this.ivType = t;
				this.fillFormData();
			},
			isShowIv(isShow){
				// if(!isShow && this.isNeedInvoice){
				// 	return;
				// }
				this.isRequireIv = isShow;
				this.ivType = this.ivType ? this.ivType : 1;
				this.fillFormData();
			},
			init(){
				this.ivType = ~~this.$route.query.ivType || 0;
				this.mobile = this.$route.query.mobile || '';
				this.isRequireIv = this.ivType != 0;
				this.isNeedInvoice = this.$route.query.isNeedInvoice;
				this.getLastInvoice();
			}
		},
	
		mounted(){
			this.init();
		}
	}
</script>


<style scoped>
	@import '../../../assets/styles/mixins';
	.invoice-wrapper{
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		z-index: 20;
		background-color: #f5f5f5;
	}

	.invoice-form{
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		padding-bottom: 2.0rem;
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling:touch;
	}

	.item-btn,.detail-btn{
		display: inline-block;
		width: 1.5rem;
		/*height: 0.64rem;*/
		line-height: 0.66rem;
		text-align: center;
		border: 1px solid #999;
		border-radius: 0.04rem;
		font-size: 0.26rem;
		margin-right: 0.5rem;

		&.active{
			color:$main-color;
			border-color: currentColor;
		}

		&.disabled{
			color: #ccc;
			border-color: currentColor;
		}
	}

	.invoice-form__item{
		padding: 0.32rem;
		padding-top: 0;
		background-color: #fff;
		margin-bottom: 0.12rem;
		
		.item-tit{
			font-size: 0.3rem;
			padding-top: 0.32rem;
			margin-bottom:  0.28rem;
		}

		.item-box__para{
			display: flex;
			align-items: center;
			border-top: 1px solid #e5e5e5;
			margin: 0 -0.32rem;
			padding: 0 0.32rem; 

			label{
				font-size: 0.3rem;
				margin-right: 0.24rem;

				i{
					visibility: hidden;
				}
			}

			.item-box__inp{
				flex: 1;
				height: 0.4rem;
				width: 100%;

				padding: 0.24rem 0;
				
				color:#333;
				font-size: 0.28rem;

				&::-webkit-input-placeholder{
					font-size: 0.28rem;
					color:#ccc;
				}
			}
		}

		.item-company, .item-person{
			margin-top: 0.24rem;
		}

		.item-contact .item-box__para:first-of-type{
			border-top: 0;
		}
	}

	.invoice-form__item--noPB{
		padding-bottom: 0;
	}

	.invoice-cnt{		
		.invoice-cnt__note{
			padding: 0.18rem 0.32rem;
			margin-bottom: 0.12rem; 
			background-color: #fff;
			font-size: 0.28rem;
			color:#999;

			.note-txt.small{
				font-size: 0.24rem;
			}
		}

		.invoice-cnt__detail{
			padding: 0.32rem;
			background-color: #fff;
			
			.detail-item{
				margin-top: 0.2rem;
				font-size: 0.24rem;
				color:#999;
			}
		}
	}

	.invoice-ft__btn{
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1.0rem;
		line-height: 1.0rem;
		color:#fff;
		font-size: 0.36rem;
		text-align: center;
		background-color: $main-color;
	}

</style>