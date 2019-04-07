<template>
  <div class="container">
    <div class="add">
      <el-row justify="start" align="center">
        <el-col :span="24">
          <div class="grid-content bg-purple-dark">
            <el-button size="large" plain type="success" icon="el-icon-plus" @click="handleAdd()">添加</el-button>
            <el-button size="large" plain type="success" icon="el-icon-plus" @click="fetchData()">刷新</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-table :data="tableData" style="width: 100%" fit>
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">{{ scope.$index+1 }}</template>
      </el-table-column>
      <el-table-column label="任务名" align="center">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="配置" align="center">
        <template slot-scope="scope">{{ scope.row.jsonstr }}</template>
      </el-table-column>
      <el-table-column label="备注" align="center">
        <template slot-scope="scope">{{ scope.row.remark }}</template>
      </el-table-column>
      <el-table-column label="id" align="center" v-if="hidden">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="userId" align="center" v-if="hidden">
        <template slot-scope="scope">{{ scope.row.userId }}</template>
      </el-table-column>
      <el-table-column label="文件名" align="center" v-if="hidden">
        <template slot-scope="scope">{{ scope.row.filename }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="warning" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button
            size="mini"
            type="danger"
            :icon="scope.row.icon"
            @click="handleExec(scope.$index, scope.row)"
            :disabled="scope.row.isExec"
          >执行</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增配置 -->
    <el-dialog title="新增临时任务" :visible.sync="dialogFormVisible">
      <el-form :inline="true">
        <el-form-item label="请选择输入数据库类型">
          <el-select v-model="inputSelect" placeholder="请选择">
            <el-option
              v-for="item in inputOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请选择输入数据库类型">
          <el-select v-model="outputSelect" placeholder="请选择">
            <el-option
              v-for="item in outputOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            size="large"
            plain
            type="primary"
            icon="eel-icon-download"
            @click="getTemplate()"
          >获取配置模板</el-button>
        </el-form-item>
      </el-form>
      <el-form :model="form">
        <el-form-item label="任务名">
          <el-input v-model="form.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="配置">
          <el-input type="textarea" :rows="8" v-model="form.jsonstr" @blur="checkJosn()"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitData()">提 交</el-button>
      </div>
    </el-dialog>

    <!-- 执行结果 -->
    <el-dialog title="执行结果" :visible.sync="resultDialogVisible" width="50%" height="60%">
      <el-input type="textarea" :rows="10" v-model="execResult"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="resultDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { debug } from "util";
export default {
  name: "TempTask",
  data() {
    return {
      tableData: [],
      processId: [],
      btnEnable: false,
      form: {
        id: "",
        name: "",
        jsonstr: "",
        remark: "",
        userId: "",
        filename: ""
      },
      execResult: "", //执行结果
      addDivVisiable: false,
      hidden: false,
      dialogFormVisible: false,
      inputSelect: "oraclereader",
      outputSelect: "oraclewriter",
      resultDialogVisible: false,
      inputOptions: [
        {
          value: "1",
          label: "mysqlreader"
        },
        {
          value: "2",
          label: "oraclereader"
        },
        {
          value: "3",
          label: "sqlserverreader"
        }
      ],
      outputOptions: [
        {
          value: "1",
          label: "mysqlwriter"
        },
        {
          value: "2",
          label: "oraclewriter"
        },
        {
          value: "3",
          label: "sqlserverwriter"
        }
      ],
      execIcon: "el-icon-caret-right"
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    handleEdit(index, row) {
      this.form = row;
      this.dialogFormVisible = true;
    },
    handleDel(index, row) {
      this.axios
        .get(`http://localhost:8080/temp/delete/${row.id}`)
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.$message.success("删除成功");
            this.fetchData();
          } else {
            this.$message.error("删除失败");
          }
        })
        .catch(err => {
          this.$message.error(err);
        });
    },
    handleExec(index, row) {
      row.isExec = !row.isExec;
      row.icon = "el-icon-loading";
      this.axios
        .post("http://localhost:8080/exec/once", row)
        .then(res => {
          let data = res.data;
          console.log(data);
          if (data.success) {
            this.execResult = data.msg;
            row.isExec = !row.isExec;
            row.icon = "el-icon-caret-right";
            this.resultDialogVisible = true;
          } else {
            this.$message.error(data.msg);
          }
        })
        .catch(err => {
          this.$message.error(err);
        });
    },
    //获取数据
    fetchData() {
      let v = this;
      let userId = this.$cookie.getCookie("userid");
      if (userId == "") {
        this.$message("验证用户信息不正确");
        return;
      }
      this.axios
        .get(`http://localhost:8080/temp/find/${userId}`)
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.tableData = [];
            data.msg.forEach(e => {
              e["isExec"] = false;
              e["icon"] = "el-icon-caret-right";
            });
            this.tableData = data.msg;
            this.$message.success("数据获取成功");
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
      this.form = {
        id: "",
        name: "",
        jsonstr: "",
        remark: "",
        userId: "",
        filename: ""
      };
      this.dialogFormVisible = true;
    },
    getTemplate() {
      this.axios
        .get(
          `http://localhost:8080/exec/getTemplateJson/${this.inputSelect}/${
            this.outputSelect
          }`
        )
        .then(res => {
          let data = res.data;
          let v = this;
          if (data.success) {
            this.form.jsonstr = data.msg;
          }
        })
        .catch(err => {});
    },
    /**
     * 校验是否为真确的json格式
     */
    isJSON(str) {
      if (typeof str == "string") {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == "object" && obj) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
      return false;
    },
    checkJosn() {
      if (!this.isJSON(this.form.jsonstr)) {
        this.$message.error("输入的json不正确");
      } else {
        this.$message.success("json校验正确");
      }
    },
    submitData() {
      if (this.form.name.trim() == "") {
        this.$message.error("任务名称不能为空");
      } else if (this.form.jsonstr.trim() == "") {
        this.$message.error("任务配置不能为空");
      } else {
        let data = {
          name: this.form.name,
          jsonstr: this.form.jsonstr,
          remark: this.form.remark,
          userid: this.$cookie.getCookie("userid")
        };
        if (this.form.id != "") {
          data = { ...data, id: this.form.id, filename: this.form.filename };
        }
        this.axios
          .post("http://localhost:8080/temp/add", data)
          .then(res => {
            let data = res.data;
            if (data.success) {
              this.form = {
                id: "",
                name: "",
                jsonstr: "",
                remark: "",
                userId: ""
              };
              this.fetchData();
              this.dialogFormVisible = false;
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(err => {
            this.$message.error(err);
          });
      }
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

.el-textarea__inner {
  height: 400px;
}
</style>
