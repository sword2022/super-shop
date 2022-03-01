<template>
  <div class="main_form">
    
    <div class="input-box">
      <el-input prefix-icon="el-icon-user" size="max" placeholder="请输入账号" v-model="model.username"  clearable></el-input>
    </div>
    
    <div class="input-box">
      <el-input prefix-icon="el-icon-lock" type="password" @keyup.enter.native="login" placeholder="请输入密码" v-model="model.password"  clearable></el-input>
    </div>
    
    <div class="main_btn">
      <el-button @click.native="login" type="primary" round :loading="isBtnLoading">登录</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      model:{},
      isBtnLoading: false
    }
  },
  computed: {
    btnText() {
      if (this.isBtnLoading) return '登录中...'
      return '登录'
    }
  },
  methods: {
    async login() {
      if (!this.model.username) {
        this.$message.error('请输入账号')
        return
      }
      if (!this.model.password) {
        this.$message.error('请输入密码')
        return
      }
      this.isBtnLoading=true
      const res = await this.$http.post(`user/login`,this.model)
      window.console.log(res)

      if(res.data.message){
        this.$message({
          type:'error',
          message:`${res.data.message}`
        })
        this.isBtnLoading=false
        return
      }
      if(!res.data.messsage&&res.data.token){
        // 保存token->弹出登录成功->跳转界面
        window.localStorage.setItem("token", res.data.token)
        window.localStorage.setItem("tokenExpire",new Date().getTime())
        // window.console.log('222:'+window.localStorage.getItem('tokenExpire'))
        this.$message({type:'success',message:'登陆成功'})
        this.$router.push({path:'/'})
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