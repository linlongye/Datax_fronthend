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
      <el-table-column label="序号" align="center" min-width="5%">
        <template slot-scope="scope">{{ scope.$index+1 }}</template>
      </el-table-column>
      <el-table-column label="任务名" align="center" min-width="10%">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="配置" align="center" min-width="25%" v-if="false">
        <template slot-scope="scope">{{ scope.row.jsonstr }}</template>
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
      <el-table-column label="Cron" align="center" min-width="10%">
        <template slot-scope="scope">{{ scope.row.cron }}</template>
      </el-table-column>
      <el-table-column label="执行结果" align="center" min-width="60%">
        <template slot-scope="scope">
          <el-input type="textarea" :rows="8" :value="scope.row.result">{{ scope.row.result }}</el-input>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" min-width="10%">
        <template slot-scope="scope">{{ scope.row.remark }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="20%">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="warning" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-caret-right"
            @click="handleExec(scope.$index, scope.row)"
            :disabled="scope.row.isExec"
          >{{scope.row.isrun==0?'执行':'停止'}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增配置 -->
    <el-dialog title="新增临时任务" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="任务名">
          <el-input v-model="form.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="配置">
          <el-input type="textarea" :rows="8" v-model="form.jsonstr" @blur="checkJosn()"></el-input>
        </el-form-item>
        <el-form-item label="cron表达式">
          <el-input v-model="form.cron" auto-complete="off"></el-input>
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
import { setTimeout } from "timers";
export default {
  name: "RepeatTask",
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
        filename: "",
        cron: "",
        result: ""
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
      execIcon: "el-icon-caret-right",
      websockets: [],
      uuid: ""
    };
  },
  beforeMount() {
    this.fetchData();
  },
  mounted() {
    this.uuid = this.guid(); //保存当前访问的uuid
    //this.initWebsocket(this.uuid);
  },
  destroyed() {
    this.websockets.forEach(e => {
      e.socket.close();
    });
  },
  methods: {
    guid() {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      var uuid = s.join("");
      return uuid;
    },
    handleEdit(index, row) {
      this.form = row;
      this.dialogFormVisible = true;
    },
    handleDel(index, row) {
      this.axios
        .get(`http://localhost:8080/repeat/delete/${row.id}`)
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
    //通过task的id号获得从websockets中获得对象
    getWebSocket(rid) {
      let socket;
      this.websockets.forEach(e => {
        if (e.id == rid) {
          socket == e.socket;
        }
      });
      return socket;
    },
    fetchWebSocket(id) {
      let socket = this.getWebSocket(id);
      if (socket == undefined || socket == null) {
        socket = new WebSocket(`ws://localhost:8080/websocket/${id}`);
        socket.onmessage = this.onMessage;
        socket.onopen = this.onopen;
        socket.onerror = this.onError;
        socket.onclose = this.onClose;
        this.websockets.push({ id: id, socket: socket });
      }
      return socket;
    },
    handleExec(index, row) {
      //定义一个socket连接
      let socket = this.fetchWebSocket(row.id);
      socket.addEventListener("open", () => {
        debugger;
        if (row.isrun == 0) {
          socket.send(`${this.uuid}|${row.id}|0`); //当前任务开始运行
          row.isrun = 1;
          //任务没有执行的情况
        } else if (row.isrun == 1) {
          socket.send(`${this.uuid}|${row.id}|1`); //当前任务已在运行
          row.isrun = 0
        }
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
        .get(`http://localhost:8080/repeat/all/${userId}`)
        .then(res => {
          let data = res.data;
          if (data.success) {
            this.tableData = [];
            data.msg.forEach(e => {
              e["isExec"] = false;
              e["icon"] = "el-icon-caret-right";
            });
            this.tableData = data.msg;
            this.tableData.forEach(e => {
              if (e.isrun == 1) {
                this.fetchWebSocket(e.id);
              }
            });
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
      } else if (this.form.cron.trim() == "") {
        this.$message.error("cron表达式不能为空不能为空");
      } else {
        let data = {
          name: this.form.name,
          jsonstr: this.form.jsonstr,
          remark: this.form.remark,
          userid: this.$cookie.getCookie("userid"),
          isrun: 0,
          cron: this.form.cron
        };
        if (this.form.id != "") {
          data = { ...data, id: this.form.id, filename: this.form.filename };
        }
        this.axios
          .post("http://localhost:8080/repeat/save", data)
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
    },
    onMessage(msg) {
      let data = msg.data.split("|");
      this.tableData.forEach(e => {
        if (e.id == data[0]) {
          if (e.result == null) {
            e.result = "";
          }
          if (e.result.length >= 1000) {
            e.result = "";
          }
          e.result += data[2] + "\n";
          console.log(e.result);
        }
      });
    },
    onOpen() {
      console.log("websocket连接成功");
    },
    onError() {},
    onClose(e) {
      console.log("关闭连接", e);
    },
    sendMessage(msg) {
      console.log(msg);
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
