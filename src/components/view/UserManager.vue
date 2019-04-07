<template>
  <div class="container">
    <div class="add" v-if="addDivVisiable">
      <el-row justify="start" align="center">
        <el-col :span="24">
          <div class="grid-content bg-purple-dark">
            <el-button size="large" plain type="success" icon="el-icon-plus" @click="handleAdd()">添加</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-table :data="tableData" style="width: 100%" fit>
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">{{ scope.$index+1 }}</template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="scope">{{ scope.row.username }}</template>
      </el-table-column>
      <el-table-column label="密码" align="center">
        <template slot-scope="scope">{{ keepPassSave(scope.row.password) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" v-if="addDivVisiable">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="新增用户" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="用户名">
          <el-input v-model="form.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" auto-complete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.usernamerepet" auto-complete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="1"></el-option>
            <el-option label="普通用户" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData()">提 交</el-button>
      </div>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>是否确定删除</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="suerDelete()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { debug } from "util";
export default {
  name: "UserManager",
  data() {
    return {
      tableData: [],
      addDivVisiable: false,
      dialogFormVisible: false,
      form: {
        username: "",
        password: "",
        usernamerepet: "",
        role: "2"
      },
      isAdmin: false,
      dialogVisible: false
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    handleEdit(index, row) {
      console.log(row.username);
      this.form.username = row.username;
      this.form.password = row.password;
      this.form.role = row.role + "";
      this.dialogFormVisible = true;
    },
    suerDelete() {
      this.axios
        .get(`http://localhost:8080/user/delete/${this.form.username}`)
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.$message.info("删除成功");
            this.fetchData();
            this.form = {
              username: "",
              password: "",
              usernamerepet: "",
              role: "2"
            };
            this.dialogVisible = false;
          } else {
            this.$message.error(data.msg);
          }
        })
        .catch(err => {
          this.$message.error(err);
        });
    },
    handleDelete(index, row) {
      this.dialogVisible = true;
      this.form.username = row.username;
      this.form.password = row.password;
      this.form.role = row.role + "";
    },
    keepPassSave(pass) {
      return new Array(pass.length + 1).join("*");
    },
    fetchData() {
      let v = this;
      this.axios
        .get("http://localhost:8080/user/all")
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.tableData = [];
            this.tableData = data.msg;
            this.$message("数据获取成功");
            if (v.$cookie.getCookie("role") == 1) {
              v._data.addDivVisiable = true;
            } else {
              v._data.addDivVisiable = false;
            }
          } else {
            this.tableData = [];
            this.$message.error("数据获取失败");
          }
        })
        .catch(err => {
          this.$message(err);
        });
    },
    handleAdd() {
      //每次打开窗口是清除数据
      this.form = {
        username: "",
        password: "",
        usernamerepet: "",
        role: "2"
      };
      this.dialogFormVisible = true;
    },
    submitData() {
      if (this.form.username.replace(/\s*/g, "") == "") {
        this.$message.error("用户名不能为空");
        return;
      }
      if (this.form.password.replace(/\s*/g, "") == "") {
        this.$message.error("密码不能为空");
        return;
      }
      if (this.form.role.replace(/\s*/g, "") == "") {
        this.$message.error("角色不能为空");
        return;
      }
      if (this.form.password != this.form.usernamerepet) {
        this.$message.error("两次输入的密码不一致");
        return;
      }
      this.axios
        .post("http://localhost:8080/user/add", { ...this.form })
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.$message.error("提交成功");
            this.fetchData();
            this.dialogFormVisible = false;
          } else {
            this.$message.error(data.msg);
            return;
          }
        })
        .catch(err => {
          this.$message.error(err);
          return;
        });
    }
  }
};
</script>
<style scoped>
.add {
  width: 100%;
  height: 50px;
  text-align: left;
}
.add .el-row {
  line-height: 50px;
  padding-left: 10px;
  padding-top: 10px;
}
</style>


