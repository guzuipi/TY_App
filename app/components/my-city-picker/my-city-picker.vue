<template>
	<uni-popup ref="popup" :safeArea="false" type="bottom">
		<view class="popup">
			<view class="picker-btn">
				<view class="left" @click="close">取消</view>
				<view class="right" @click="confirm">确定</view>
			</view>
			<picker-view class="picker-view" :indicator-style="indicatorStyle" :value="valueArr" @change="bindChange">
				<picker-view-column>
					<view class="item" v-for="(item,index) in province" :key="index">{{item.name}}</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item" v-for="(item,index) in city" :key="index">{{item.name}}</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item" v-for="(item,index) in area" :key="index">{{item.name}}</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item" v-for="(item,index) in street" :key="index">{{item.name}}</view>
				</picker-view-column>
			</picker-view>
		</view>		
	</uni-popup>

</template>

<script>
	export default {
		name:"my-city-picker",
		emits:['submit'],
		props: {
			cityCodes:{ //当前选中的省市区街道code码
				type:Array,
				default:()=>[]
			}
		},
		data() {
			return {
				data: this.cityCodes,
				indicatorStyle: `height: ${Math.round(uni.getSystemInfoSync().screenWidth/(750/100))}px;`, //每行的高度
				valueArr: [0, 0, 0, 0], // 当前选中各列的下标
				province: [] // 省市区街道结构树  例如[{code:1,name:'北京',children:[]}]
			};
		},
		computed:{
			city:function(){
				var cityList = [];
				if(this.province.length > 0 && this.province[this.valueArr[0]] && this.province[this.valueArr[0]].children){
					cityList = this.province[this.valueArr[0]].children;
				}
				return cityList;
			},
			area:function(){
				var areaList = [];
				if(this.province.length > 0 && this.province[this.valueArr[0]] && this.province[this.valueArr[0]].children && this.province[this.valueArr[0]].children[this.valueArr[1]] && this.province[this.valueArr[0]].children[this.valueArr[1]].children){
					areaList = this.province[this.valueArr[0]].children[this.valueArr[1]].children;
				}
				return areaList;
			},
			street:function(){
				var streetList = [];
				if(this.province.length > 0 && this.province[this.valueArr[0]] && this.province[this.valueArr[0]].children && this.province[this.valueArr[0]].children[this.valueArr[1]] && this.province[this.valueArr[0]].children[this.valueArr[1]].children && this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]] && this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]].children){
					streetList = this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]].children;
				}
				return streetList;
			}
		},
		watch:{
			cityCodes: {
				deep: true,
				immediate: true,
				handler(newV, oldV){
					this.data = newV;
					this.initLoadArea();
				}
			},
			province: {
				deep: true,
				handler(newV, oldV){
					if(this.data && this.data.length >= 1){
						for(let i=0; i< newV.length; i++){
							let c_p = newV[i]; //当前省
							
							if(c_p.code === this.data[0]){
								this.valueArr[0] = i;
								let c_p_citys = c_p.children || []; //当前省下所有的市
								
								for(let j=0; j<c_p_citys.length; j++){
									let c_p_c = c_p_citys[j]; // 当前市
									
									if(this.data.length >= 2 && c_p_c.code === this.data[1]){
										this.valueArr[1] = j;
										let c_p_c_areas = c_p_c.children || []; //当前市下所有的区
										
										for(let k=0; k<c_p_c_areas.length;k++){
											let c_p_c_a = c_p_c_areas[k]; //当前区
											
											if(this.data.length >= 3 && c_p_c_a.code === this.data[2]){
												this.valueArr[2] = k;
												let c_p_c_a_streets = c_p_c_a.children || []; //当前区下所有的街道
												
												for(let l=0; l<c_p_c_a_streets.length; l++){
													let c_p_c_a_s = c_p_c_a_streets[l]; //当前街道
													
													if(this.data.length >= 4 && c_p_c_a_s.code === this.data[3]){
														this.valueArr[3] = l;
														break;
													}
												}
												
												break;
											}
										}
										break
									}
									
								}
								break;
							}
						}
						this.$emit("submit",this.formatterCityVO());
					}
				}
			}
		},
		created() {
			// this.initLoadArea();
		},
		methods:{
			
			open() {
				this.$refs.popup.open();
			},
			close() {
				this.$refs.popup.close();
			},
			
			// 加载省数据
			initLoadArea() {
				this.$http
					.get('/sysArea/queryProvinceList', {}, true)
					.then(res => {
						this.province = res;
						if(res && res.length > 0){
							let provinceCode = this.data && this.data.length >= 1 ? this.data[0] : this.province[this.valueArr[0]].code ;
							this.loadCity(provinceCode)
						}
					});
			},
			
			// 加载市数据
			loadCity(provinceCode) {
				this.$http
					.get('/sysArea/queryCityList', {province:provinceCode}, true)
					.then(res => {
						if(res && res.length > 0){
							if (this.province[this.valueArr[0]].children === undefined) {
								this.$set(this.province[this.valueArr[0]], 'children', [])
								res.forEach(item => {
									this.province[this.valueArr[0]].children.push(item)
								})
								let cityCode = this.data && this.data.length >= 2 ? this.data[1] : this.province[this.valueArr[0]].children[this.valueArr[1]].code ;
								this.loadArea(cityCode);
							}
						}
					});
			},
			
			// 加载区数据
			loadArea(cityCode) {
				this.$http
					.get('/sysArea/queryDistrictList', {city:cityCode}, true)
					.then(res => {
						if(res && res.length > 0){
							if (this.province[this.valueArr[0]].children[this.valueArr[1]].children === undefined) {
								this.$set(this.province[this.valueArr[0]].children[this.valueArr[1]], 'children', [])
								res.forEach(item => {
									this.province[this.valueArr[0]].children[this.valueArr[1]].children.push(item)
								})
								let areaCode = this.data && this.data.length >= 3 ? this.data[2] : this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]].code ;
								this.loadStreet(areaCode);
							}
						}
					});
			},
			
			// 加载街道数据
			loadStreet(areaCode){
				this.$http
					.get('/sysArea/queryStreetList', {area :areaCode}, true)
					.then(res => {
						if(res && res.length > 0){
							if (this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]].children === undefined) {
								this.$set(this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]], 'children', [])
								res.forEach(item => {
									this.province[this.valueArr[0]].children[this.valueArr[1]].children[this.valueArr[2]].children.push(item)
								})
							}
						}
					});
			},
			
			/**
			 * picker切换回调
			 * @param {Object} e
			 */
			bindChange(e) {
				const val = e.detail.value;
				let c_p = null, c_p_citys = null, c_c = null, c_c_areas = null, c_a = null, c_a_streets = null;
				c_p = this.province[val[0]]; // 当前省
				if(c_p){
					c_p_citys = c_p.children; //当前省下的所有市
					if(c_p_citys){
						c_c = c_p_citys[val[1]]; //当前市
						if(c_c){
							c_c_areas = c_c.children; //当前市下所有的区
							if(c_c_areas){
								c_a = c_c_areas[val[2]]; //当前区
								if(c_a){
									c_a_streets = c_a.children; //当前区下面所有的街道
								}
							}
						}
					}
				}
				
				
				if (this.valueArr[0] !== val[0] && c_p_citys === undefined) {
					this.loadCity(c_p.code)
				} else if (this.valueArr[1] !== val[1] && c_c_areas === undefined) {
					this.loadArea(c_c.code)
				} else if (this.valueArr[2] !== val[2] && c_a_streets === undefined){
					this.loadStreet(c_a.code)
				}
				this.valueArr = val
			},
			
			/**
			 * 格式化要返回给父节点的城市选择器对象
			 */
			formatterCityVO(){
				let province = null;
				let city = null;
				let area = null;
				let street = null;
				
				if(this.province.length > 0){
					province = this.province[this.valueArr[0]];
					if(province && province.children){
						city = province.children[this.valueArr[1]];
						if(city && city.children){
							area = city.children[this.valueArr[2]];
							if(area && area.children){
								street = area.children[this.valueArr[3]];
							}
						}
					}
				}
				let cityVO = {
					provinceCode: province ? province.code : null,
					provinceName: province ? province.name : null,
					cityCode: city ? city.code : null,
					cityName: city ? city.name : null,
					areaCode: area ? area.code : null,
					areaName: area ? area.name : null,
					streetCode: street ? street.code : null,
					streetName: street ? street.name : null
				}
				return cityVO
			},
			
			/**
			 * 确定
			 */
			confirm(){
				this.$emit("submit",this.formatterCityVO())
				this.close();
			}
			
		}
	}
</script>

<style lang="less" src="./style.less"></style>
