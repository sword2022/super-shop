<template>
  <div style="background-color: #FFFFFF;padding:5px 20px 0px 10px;margin-bottom:5px;">
    <div style="color:#aaaaaa;font-weight:500;border-bottom:thick solid #F8F8F8;padding-left:5px;">
      <span style="font-size:28px;">店铺</span>
    </div>

    <div style="padding-top:10px;padding-left:5px;border-bottom:thick solid #F8F8F8;">
      <el-form ref="form" :model="form" :inline="false">
        <el-form-item label="正在营业">
          <el-switch v-model="form.opening"></el-switch>
        </el-form-item>
        <el-form-item label="首页弹窗">
          <el-switch v-model="form.showPopup"></el-switch>
        </el-form-item>
        <el-form-item label="是否打印">
          <el-switch v-model="form.print"></el-switch>
        </el-form-item>
        <el-form-item label="店铺名称">
          <el-input v-model="form.store_name"></el-input>
        </el-form-item>
        <el-form-item label="店铺地址">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.telephone"></el-input>
        </el-form-item>
        <el-form-item label="支付过期分钟">
          <el-input v-model="form.pay_expire"></el-input>
        </el-form-item>
        <el-form-item label="起送金额">
          <el-input v-model="form.minimum_fee"></el-input>
        </el-form-item>
        <el-form-item label="显示已售">
          <el-switch v-model="form.show_sales"></el-switch>
        </el-form-item>
        <el-form-item
          v-for="(domain, index) in form.opening_times"
          :label="'营业时间-' + (index+1)"
          :key="domain.startTime && domain.endTime"
          :prop="'opening_times.' + index + '.value'"
          :rules="{
            required: true, message: '时间段不能为空', trigger: 'blur'
          }"
          >
          <el-time-select
            placeholder="起始时间"
            v-model="domain.startTime"
            :picker-options="{
              start: '07:30',
              step: '00:15',
              end: '21:30'
            }">
          </el-time-select>
          <el-time-select
            placeholder="结束时间"
            v-model="domain.endTime"
            :picker-options="{
              start: '07:30',
              step: '00:15',
              end: '21:30',
              minTime: domain.startTime
            }">
          </el-time-select>
          <el-button v-if="form.opening_times.indexOf(domain)>0" @click.prevent="removeDomain(domain)">删除</el-button>
          <el-button v-else @click="addDomain">新增时段</el-button>
        </el-form-item>
        <el-form-item label="店铺位置经纬度">
          <el-input v-model="form.longitude" disabled></el-input>
          <el-input v-model="form.latitude" disabled></el-input>
          <div style="float:left;width:100%;">在地图中点击您店铺所在位置</div>
          <div id="mapview" style="width:350px;height:350px;"></div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
      form:{
        opening_times: [{
          value: ''
        }],
        longitude:'116.397909',
        latitude:'39.900519'
      },//对话框
    }
  },
  methods:{
    /* eslint-disable no-undef */
    async init() {
      var _this = this
      var myLatlng = new qq.maps.LatLng(this.form.latitude,this.form.longitude)
      var myOptions = {
        zoom: 16,               //设置地图缩放级别
        center: myLatlng,      //设置中心点
        mapTypeId: qq.maps.MapTypeId.ROADMAP  //设置地图样式详情参见MapType
      }
      //获取dom元素添加地图信息
      var map = new qq.maps.Map(document.getElementById("mapview"), myOptions)
      var marker1 = new qq.maps.Marker({
          position: myLatlng,
          map: map,
          animation: qq.maps.MarkerAnimation.BOUNCE
      })
      //添加监听鼠标单击事件
      // eslint-disable-next-line no-unused-vars
      var result = await qq.maps.event.addListener(map, 'click', function(event) {
        marker1.setMap(null)
        var marker = new qq.maps.Marker({
          position:event.latLng, 
          map:map,
          animation: qq.maps.MarkerAnimation.BOUNCE
        })
        _this.form.longitude = event.latLng.getLng()
        _this.form.latitude = event.latLng.getLat()
        // eslint-disable-next-line no-unused-vars
        qq.maps.event.addListener(map, 'click', function(event) {
          marker.setMap(null)     
        })
      })
    },
    async onSubmit(){
      let res = await this.$http.put('setting/update',this.form)
      window.console.log(res)
      if(res.data){
        this.form = res.data
        this.$message({
            type: 'success',
            message: '保存成功!'
        })
      }else{
        this.$message({
            type: 'error',
            message: '保存失败!'
        })
      }
    },
    removeDomain(item) {
      var index = this.form.opening_times.indexOf(item)
      if (index !== -1) {
        this.form.opening_times.splice(index, 1)
      }
    },
    addDomain() {
      this.form.opening_times.push({
        value: '',
        key: Date.now()
      })
    },
    async fetch(){
      //获取设置
      let res = await this.$http.get('setting/fetch')
      if(res.data){
        window.console.log(res)
        this.form = res.data
        this.init()
      }
    }
  },
  mounted(){
    this.init()
  },
  created(){
    this.fetch()
  }
}
</script>