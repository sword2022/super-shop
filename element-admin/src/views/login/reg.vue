<template>
  <div class="main_form">
    
    <div class="input-box">
        <el-input prefix-icon="el-icon-user" size="max" placeholder="请输入账号" v-model="model.username"  clearable></el-input>
    </div>
    
    <div class="input-box">
        <el-input prefix-icon="el-icon-lock" type="password" maxlength="20" placeholder="请输入密码" v-model="model.password"  clearable></el-input>
    </div>

    <div class="input-box">
        <el-input prefix-icon="el-icon-lock" type="password" maxlength="20" placeholder="请再次输入密码" v-model="inputAgain" clearable></el-input>
    </div>

    <div class="main_btn">
      <el-button @click.native="register" type="primary" round :loading="isBtnLoading">注册</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      model:{},
      inputAgain:"",
      isBtnLoading: false
    }
  },
  computed: {
    btnText() {
      if (this.isBtnLoading) return '注册中...'
      return '注册'
    }
  },
  methods: {
    async register() {
      if (!this.model.username) {
        this.$message.error('请输入账号')
        return
      }
      if (!this.model.password) {
        this.$message.error('请输入密码')
        return
      }
      if (!this.inputAgain) {
        this.$message.error('请再次输入密码')
        return
      }
      if (this.model.password!=this.inputAgain) {
        this.$message.error('两次输入密码不一样')
        return
      }
      this.isBtnLoading=true
      const res = await this.$http.post(`user/reg`,this.model)
      window.console.log(res)

      if(res.data.message){
        this.$message({
          type:'error',
          message:`${res.data.message}`
        })
        this.isBtnLoading=false
        return
      }else{
        this.$message({
          type:'success',
          message:'注册成功'
        })
        this.$router.push({path:'/login'})
      }
    }
  }
}
</script>
<style>
  .main_form {
    width: 350px;
    padding-bottom:20px;
    background-color: #eeeeee;
    position: absolute;
    left: 50%;
    top: 45%;
    transform: translateX(-50%) translateY(-50%);
    border-radius: 5px;
  }
  .input-box {
    width:300px;
    margin: 0 auto;
    padding-top: 30px;
  }
  .main_btn{
    width:200px;
    margin: 0 auto;
    padding-top: 20px;
   }
  .main_btn .el-button {
    width: 200px;
    font-size: 14px;
    background: #2154FA; 
    filter: brightness(1.4);
  }
</style>