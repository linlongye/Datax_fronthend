<template>
  <div class="main-container">
    <el-row class="nav">
      <el-col :span="2" class="nav-left">
        <div class="grid-content bg-purple">
          <el-col :span="12" class="nav-menu">
            <el-menu
              :default-active="activeItemIndex"
              class="el-menu-vertical-demo"
              background-color="#2c3e50"
              text-color="#fff"
              active-text-color="#ffd04b"
            >
              <el-menu-item index="1">
                <i class="el-icon-menu"></i>
                <span slot="title" @click="navHome()">定时任务</span>
              </el-menu-item>
              <el-menu-item index="2" @click="navTempTask()">
                <i class="el-icon-tickets"></i>
                <span slot="title">临时任务</span>
              </el-menu-item>
              <el-menu-item index="3" @click="navUserManager()">
                <i class="el-icon-star-on"></i>
                <span slot="title">用户管理</span>
              </el-menu-item>
              <el-menu-item index="4" @click="navSetting()">
                <i class="el-icon-setting"></i>
                <span slot="title">系统配置</span>
              </el-menu-item>
            </el-menu>
          </el-col>
        </div>
      </el-col>
      <el-col :span="22" class="nav-right">
        <div class="grid-content bg-purple-light">
          <router-view/>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "main_page",
  data() {
    return {
      activeItemIndex: "1"
    };
  },
  mounted() {
    let token = this.$cookie.getCookie("usertoken");
    //未登录跳转到登录界面
    if (token === "") {
      this.$router.push({
        path: "/login"
      });
    }
  },
  methods: {
    navUserManager() {
      this.$router.push({ path: "/manage" });
    },
    setActiveItem(index) {
      this.activeItemIndex = "" + index;
    },
    navTempTask() {
      this.$router.push({ path: "/temptask" });
    },
    navSetting() {
      this.$router.push({ path: "/setting" });
    },
    navHome() {
      this.$router.push({ path: "/" });
    }
  }
};
</script>

<style scoped>
.main-container {
  position: relative;
  height: 100%;
  width: 100%;
}
.nav {
  position: relative;
  height: 100%;
  width: 100%;
}
.nav-left {
  position: relative;
  height: 100%;
  background-color: #2c3e50;
}
.nav-left .bg-purple {
  position: relative;
  height: 100%;
}
.nav-right {
  position: relative;
  height: 100%;
}
.nav-right .bg-purple-light {
  position: relative;
  height: 100%;
}

.nav-menu {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>
