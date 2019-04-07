<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      class="login-form"
      auto-complete="on"
      label-position="left"
    >
      <h3 class="title">欢迎使用DATAX配置工具</h3>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          name="username"
          type="text"
          auto-complete="on"
          placeholder="用户名"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          :type="pwdType"
          v-model="loginForm.password"
          name="password"
          auto-complete="on"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;"
          @click.native.prevent="handleLogin"
        >登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      loginForm: {
        username: "",
        password: ""
      },
      loading: false,
      pwdType: "password",
      redirect: undefined
    };
  },
  methods: {
    showPwd() {},
    handleLogin() {
      this.axios
        .post("http://localhost:8080/user/login", {
          ...this.loginForm
        })
        .then(res => {
          console.log(res);
          if (res.data.success) {
            this.$router.push({
              path: "/"
            });
            //设置cookie，过期时间为3小时
            this.$cookie.setCookie(
              "usertoken",
              this.loginForm.username,
              60 * 60 * 3
            );
            this.$cookie.setCookie("role", res.data.msg.role, 60 * 60 * 3);
            this.$cookie.setCookie("userid", res.data.msg.id, 60 * 60 * 3);
          } else {
            this.messageBoxShow(res.msg, "登录失败");
          }
        })
        .catch(err => {
          this.messageBoxShow(err, "登录失败");
        });
    },
    messageBoxShow(content, title) {
      this.$alert(content, title, {
        confirmButtonText: "关闭"
      });
    }
  }
};
</script>

<style rel="stylesheet/css" lang="css">
/* reset element-ui css */
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: #2d3a4b;
}

.login-container .login-form {
  position: absolute;
  left: 0;
  right: 0;
  width: 520px;
  max-width: 100%;
  padding: 35px 35px 15px 35px;
  margin: 120px auto;
}

.login-container .title {
  font-size: 26px;
  font-weight: 400;
  color: #eee;
  margin: 0px auto 40px auto;
  text-align: center;
  font-weight: bold;
}
</style>
  
