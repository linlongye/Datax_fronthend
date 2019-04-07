<template>
  <el-form ref="form" :model="form" label-width="80px">
    <el-form-item label="id" v-if="false">
      <el-input v-model="form.id"></el-input>
    </el-form-item>
    <el-form-item label="活动名称">
      <el-input v-model="form.bindir"></el-input>
    </el-form-item>
    <el-form-item label="活动名称">
      <el-input v-model="form.jobdir"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { error } from "util";
export default {
  name: "SystemSetting",
  data() {
    return {
      form: {
        id: "",
        bindir: "",
        jobdir: ""
      }
    };
  },
  methods: {
    onSubmit() {
      let data = { bindir: this.form.bindir, jobdir: this.form.jobdir };
      if (this.form.id != "") {
        data = { ...data, id: this.form.id };
      }
      this.axios
        .post("http://localhost:8080/setting/save", data)
        .then(res => {
          if (res.data.success) {
            this.$message.success("保存成功");
            this.form.id = res.data.msg.id;
          } else {
            this.$message.error("保存失败");
          }
        })
        .catch(error => {
          this.$message.error("保存失败");
        });
    }
  },
  mounted() {
    this.axios
      .get("http://localhost:8080/setting/find/1")
      .then(res => {
        let data = res.data;
        if (data.success) {
          this.form.id = data.msg.id;
          this.form.bindir = data.msg.bindir;
          this.form.jobdir = data.msg.jobdir;
          this.$message.success("查询成功");
        }
      })
      .catch(err => {
        this.$message.error(err);
      });
  }
};
</script>


<style scoped>
.el-form {
  margin: 50px;
}
</style>
