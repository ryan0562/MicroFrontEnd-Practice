<template>
  <el-dialog
    top="0"
    width="1238px"
    :visible.sync="show"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    append-to-body
  >
    <div slot="title" class="dialog-header">
      <i class="iconfont icon-titleaddressbook"></i>
      <span>消息管理</span>
    </div>
    <div class="content" :style="{ height: height + 'px' }">
      <div class="left-box">
        <div class="title">
          <span>消息列表</span>
        </div>
        <div class="search">
          <el-input
            placeholder="请输入内容"
            v-model="keywords"
            clearable
            @keyup.enter.native="getList(0)"
          >
            <el-select
              v-model="selectedSystem"
              slot="prepend"
              placeholder="子系统"
              clearable
              @change="chooseSystem"
            >
              <el-option
                v-for="(item, index) in systemDict && systemDict.SUB_SYSTEM"
                :key="index"
                :value="item.key"
                :label="item.value"
              ></el-option>
            </el-select>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getList(0)"
            ></el-button>
          </el-input>
        </div>
        <div class="list">
          <ul>
            <li
              v-for="(item, index) in list"
              :key="index"
              @click="getPropertyDetail(item)"
              :class="{ active: item.msgCode == curMsg.msgCode }"
            >
              <span
                >{{ item.msgCode }}({{ item.systemName | sysNameFilter }})</span
              >
              <i
                class="iconfont icon-delete"
                @click.stop="delListItem(item)"
              ></i>
            </li>
          </ul>
        </div>
        <!-- <div class="list-action-bar">
          <span class="save" @click="addListItem">新增</span>
        </div> -->
        <div class="btn button btn-common-blue" @click="addListItem">
          <img src="@/assets/images/icon_add.png" />
          <span>新增</span>
        </div>
      </div>
      <div class="right-box">
        <div class="title">
          <span>消息 - {{ curMsg.msgCode ? "修改" : "新增" }}</span>
        </div>
        <div class="cont">
          <!-- 消息维护 -->
          <el-form
            class="form"
            ref="form"
            :model="form"
            :rules="rules"
            label-width="120px"
            size="small"
          >
            <el-form-item
              class="form-item-half"
              label="所属系统："
              prop="systemName"
            >
              <el-select
                v-model="form.systemName"
                placeholder="选择系统"
                style="width: 100%"
                filterable
                clearable
                @change="handlerSystemName"
              >
                <el-option
                  v-for="(item, index) in systemDict && systemDict.SUB_SYSTEM"
                  :key="index"
                  :value="item.key"
                  :label="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-item-half"
              label="消息编码："
              prop="msgCode"
            >
              <el-input
                v-model.trim="form.msgCode"
                placeholder="全局唯一的消息编码"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item
              class="form-item-half"
              label="消息名称："
              prop="msgName"
            >
              <el-input
                v-model.trim="form.msgName"
                placeholder="输入消息名称"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item
              class="form-item-half"
              label="接收权限："
              prop="msgRole"
            >
              <el-select
                v-model="form.msgRole"
                placeholder="选择权限"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option
                  v-for="(item, index) in systemDict && systemDict.ROLE_MSG"
                  :key="index"
                  :value="item.key"
                  :label="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              class="form-item-row flexed"
              label="消息提醒："
              prop="remind"
              ref="remindInput"
            >
              <el-checkbox v-model="form.remindStatus"
                >开启未读提醒</el-checkbox
              >
              <i class="icon-mess" :class="{ active: form.remindStatus }"></i>
              <el-input
                v-model.trim="form.remind"
                placeholder="设置查看消息页面"
                clearable
                :disabled="!form.remindStatus"
              ></el-input>
            </el-form-item>
            <el-form-item class="form-item-row" label="" prop="audio">
              <el-checkbox v-model="form.audio" :disabled="!form.remindStatus"
                >开启声音提醒</el-checkbox
              >
            </el-form-item>
            <el-form-item class="form-item-row" label="持久化：" prop="persist">
              <el-checkbox v-model="form.persist" :disabled="!form.remindStatus"
                >开启持久化功能</el-checkbox
              >
            </el-form-item>
            <el-form-item
              class="form-item-row"
              label="气泡通知："
              prop="bubbleNoticed"
            >
              <el-checkbox v-model="form.bubbleNoticed">开启气泡</el-checkbox>
            </el-form-item>
            <el-form-item
              class="form-item-row"
              label="回调函数："
              prop="method"
            >
              <el-input
                v-model.trim="form.method"
                placeholder="输入自动处理器名称（JS方法名）"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item
              class="form-item-half"
              label="发送窗口期："
              prop="expireTime"
            >
              <el-input
                v-model.trim="form.expireTime"
                placeholder="0~120，单位：分钟"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item class="form-item-row" label="规则：" prop="rules">
              <div class="rule-box">
                <div class="acts">
                  <span @click="chooseRules">选择规则</span>
                  <span @click="addRules">自定义规则</span>
                </div>
                <ul>
                  <li
                    v-for="(item, index) in form.msgRule"
                    :key="index"
                    @click="editRule(item, index)"
                  >
                    <b>{{ item.excludesReceiver ? "排除" : "抄送" }}</b> -
                    {{ item.ruleName
                    }}<i
                      class="iconfont icon-delete"
                      @click.stop="delRule(item, index)"
                    ></i>
                  </li>
                </ul>
              </div>
            </el-form-item>
          </el-form>
          <div class="action-bar"></div>
          <div class="btn button btn-common-blue" @click="addListItem">
            <span class="save" @click.stop="saveP('form')">保存</span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      v-if="rulesDialogShow"
      top="0"
      width="500px"
      :visible.sync="rulesDialogShow"
      :before-close="closeRulesDialog"
      :close-on-click-modal="false"
      append-to-body
    >
      <div slot="title" class="dialog-header">
        <i class="iconfont icon-titleaddressbook"></i>
        <span>自定义规则</span>
      </div>
      <div class="content2">
        <el-form
          class="form2"
          ref="form2"
          :model="form2"
          :rules="rules2"
          label-width="120px"
          size="small"
        >
          <el-form-item
            class="form-item-row"
            label="规则类型："
            prop="excludesReceiver"
          >
            <el-radio v-model="form2.excludesReceiver" :label="parseInt(0)"
              >抄送</el-radio
            >
            <el-radio v-model="form2.excludesReceiver" :label="parseInt(1)"
              >排除</el-radio
            >
          </el-form-item>
          <el-form-item
            class="form-item-row"
            label="规则名称："
            prop="ruleName"
          >
            <el-input
              v-model.trim="form2.ruleName"
              placeholder="自定义规则名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item
            class="form-item-row"
            label="服务类型："
            prop="serverType"
          >
            <el-radio v-model="form2.serverType" :label="parseInt(1)"
              >远程服务</el-radio
            >
            <el-radio v-model="form2.serverType" :label="parseInt(2)"
              >本地服务</el-radio
            >
          </el-form-item>
          <el-form-item
            class="form-item-row"
            label="服务名称："
            prop="serviceName"
          >
            <el-input
              v-model.trim="form2.serviceName"
              placeholder="远程服务为请求地址(URL);本地服务为类名;"
              clearable
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="action-bar">
        <span class="save" @click.stop="saveR('form2')">保存</span>
      </div>
    </el-dialog>

    <el-dialog
      v-if="chooseDialogShow"
      top="0"
      width="500px"
      :visible.sync="chooseDialogShow"
      :before-close="closeChooseDialog"
      :close-on-click-modal="false"
      append-to-body
    >
      <div slot="title" class="dialog-header">
        <i class="iconfont icon-titleaddressbook"></i>
        <span>选择规则</span>
      </div>
      <div class="content3">
        <el-form
          class="form2"
          ref="form3"
          :model="form3"
          :rules="rules3"
          label-width="120px"
          size="small"
        >
          <el-form-item
            class="form-item-row"
            label="规则类型："
            prop="excludesReceiver"
          >
            <el-radio v-model="form3.excludesReceiver" :label="parseInt(0)"
              >抄送</el-radio
            >
            <el-radio v-model="form3.excludesReceiver" :label="parseInt(1)"
              >排除</el-radio
            >
          </el-form-item>
          <el-form-item
            class="form-item-row"
            label="规则名称："
            prop="ruleName"
          >
            <el-select
              v-model="form3.ruleName"
              placeholder="选择规则"
              style="width: 100%"
              filterable
              clearable
              @change="chooseRuleByForm"
            >
              <el-option
                v-for="(item, index) in baseRuleList"
                :key="index"
                :value="item.id"
                :label="item.ruleName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="action-bar">
        <span class="save" @click.stop="saveC('form3')">保存</span>
      </div>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { mapState, mapActions } from "vuex";
import store from "@/store";
import systemApi from "@/api/modules/system";
export default {
  props: ["data", "show"],
  data() {
    return {
      chooseDialogShow: false,
      rulesDialogShow: false,
      selectedSystem: "",
      keywords: "",
      height: document.body.clientHeight - 400,
      list: [],
      curMsg: {},
      curRuleIndex: -1,
      baseRuleList: [],
      ruleList: [],
      tablist: [
        {
          label: "消息维护",
        },
        {
          label: "规则维护",
        },
      ],
      form: {
        systemName: "",
        msgCode: "",
        msgName: "",
        msgRole: "",
        remindStatus: false,
        remind: "",
        audio: "",
        bubbleNoticed: false,
        method: "",
        expireTime: "",
        persist: false,
        msgRule: [],
      },
      form2: {
        msgCode: "",
        ruleName: "",
        serverType: "1",
        serviceName: "",
        excludesReceiver: "0",
      },
      form3: {
        msgCode: "",
        ruleName: "",
        serverType: "1",
        serviceName: "",
        excludesReceiver: "0",
      },
      addSaveData: {
        msgRole: {
          msgCode: "",
          key: "msgRole",
          value: "",
          type: "UIF",
        },
        expireTime: {
          msgCode: "",
          key: "expireTime",
          value: "",
          type: "QUEUE",
        },
        systemName: {
          msgCode: "",
          key: "systemName",
          value: "",
          type: "UIF",
        },
        method: {
          msgCode: "",
          key: "method",
          value: "",
          type: "UIF",
        },
        icon: {
          msgCode: "",
          key: "icon",
          value: "",
          type: "UIF",
        },
        msgName: {
          msgCode: "",
          key: "msgName",
          value: "",
          type: "UIF",
        },
        audio: {
          msgCode: "",
          key: "audio",
          value: false,
          type: "UIF",
        },
        bubbleNoticed: {
          id: "",
          msgCode: "",
          key: "bubbleNoticed",
          value: false,
          type: "UIF",
        },
        persist: {
          msgCode: "",
          key: "persist",
          value: false,
          type: "QUEUE",
        },
        remind: {
          msgCode: "",
          key: "remind",
          value: "",
          type: "UIF",
        },
      },
      rules: {
        systemName: [
          { required: true, message: "请选择子系统", trigger: "change" },
        ],
        msgCode: [
          { required: true, message: "请选输入消息关键字", trigger: "blur" },
          {
            message: "请完善消息关键字",
            trigger: "blur",
            pattern: /^(?!(?:EDUTY_|ECIS_|EK_|ELECTR_|EP_|RM_|SYSTEM_|UDM_)$)/,
          },
        ],
        msgName: [
          { required: true, message: "请选择编制单位", trigger: "blur" },
        ],
        remind: [
          { required: false, message: "请设置查看消息页面", trigger: "blur" },
        ],
        expireTime: [
          { required: true, message: "请设置发送窗口期", trigger: "blur" },
          {
            message: "发送窗口期格式不正确，请重新输入",
            trigger: "blur",
            pattern: /^120$|^(\d|[1-9]\d)$/,
          },
        ],
      },
      rules2: {
        ruleName: [
          { required: true, message: "请输入规则名称", trigger: "blur" },
        ],
        serviceName: [
          { required: true, message: "请输入服务名称", trigger: "blur" },
        ],
      },
      rules3: {
        ruleName: [
          { required: true, message: "请输入规则名称", trigger: "change" },
        ],
      },
    };
  },
  watch: {
    "form.remindStatus": {
      handler(newVal, oldVal) {
        oldVal && !newVal
          ? ((this.form.remind = ""),
            (this.form.audio = false),
            (this.form.persist = false),
            (this.rules.remind[0].required = false),
            this.$refs["remindInput"].clearValidate())
          : "";
        !oldVal && newVal ? (this.rules.remind[0].required = true) : "";
      },
      deep: true,
    },
    keywords: {
      handler(newVal, oldVal) {
        newVal.length <= 0 && oldVal.length > 0 ? this.getList(0) : "";
      },
    },
  },
  filters: {
    sysNameFilter(value) {
      let _systemDict = JSON.parse(sessionStorage.getItem("systemDict"));
      let _arr = _systemDict.SUB_SYSTEM.filter((item) => item.key == value);
      return _arr.length > 0 ? _arr[0].value : "";
    },
  },
  computed: {
    ...mapState({
      // systemDict: state => state.user.systemDict, // 字典表
    }),
    systemDict() {
      return JSON.parse(sessionStorage.getItem("systemDict"));
    },
  },
  created() {
    this.getList();
    this.getBaseRules();
  },
  mounted() {},
  methods: {
    chooseSystem(value) {
      this.getList();
    },
    async getBaseRules() {
      let _params = {};
      let _data = await systemApi.getMessageBaseRule(_params);
      this.baseRuleList = _data;
    },
    handlerSystemName(value) {
      this.form.msgCode = value.toLocaleUpperCase() + "_";
    },
    closeDialog() {
      this.$emit("close", false);
    },
    async getList(value) {
      let _params = {
        systemName: this.selectedSystem,
        msgCode: this.keywords,
      };
      let _data = await systemApi.getMessagePropertyList(_params);
      this.list = _data;
      value
        ? this.getPropertyDetail({ msgCode: value })
        : this.list.length > 0
        ? this.getPropertyDetail(this.list[0])
        : this.addListItem();
    },
    async getPropertyDetail(item) {
      if (item.msgCode != this.curMsg.msgCode) {
        this.$refs["form"] ? this.$refs["form"].resetFields() : "";
        let _params = {
          msgCode: item.msgCode,
        };
        let _data = await systemApi.getMessagePropertyDetail(_params),
          _form = {},
          _a;
        for (let key in _data) {
          if (key == "msgRule") {
            if (_data[key] === null) _data[key] = [];
            for (let v of _data[key]) {
              delete v.id;
            }
            _form[key] = _data[key];
          } else {
            _form[key] = _data[key].value;
          }
        }
        _form.msgCode = item.msgCode;
        _form.remindStatus = _form.remind ? true : false;
        _form.persist = _form.persist == "1" ? true : false;
        _form.audio = _form.audio == "1" ? true : false;
        _form.bubbleNoticed = _form.bubbleNoticed === "0" ? false : true;
        this.form = _form;
        //补偿
        for (let key in this.addSaveData) {
          !_data[key] ? (_data[key] = this.addSaveData[key]) : "";
        }
        this.formSaveData = _data;
        this.curMsg = item;
      }
    },
    addListItem() {
      this.form = {
        systemName: "",
        msgCode: "",
        msgName: "",
        msgRole: "",
        remindStatus: false,
        remind: "",
        audio: "",
        bubbleNoticed: false,
        method: "",
        expireTime: "",
        persist: false,
      };
      this.formSaveData = JSON.parse(JSON.stringify(this.addSaveData));
      this.curMsg = {};
      this.$refs["form"].resetFields();
    },
    delListItem(item) {
      this.$confirm("此操作将删除该消息属性, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.delPropertyItem(item);
        })
        .catch(() => {});
    },
    async delPropertyItem(item) {
      let _params = {
        msgCode: item.msgCode,
      };
      await systemApi.delMessagePropertyItem(_params).then((res) => {
        item.msgCode == this.curMsg.msgCode
          ? this.list.length > 0
            ? this.getPropertyDetail(this.list[0])
            : this.addListItem()
          : this.getList(this.curMsg);
      });
    },
    saveP(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let _params = JSON.parse(JSON.stringify(this.formSaveData));
          for (let key in _params) {
            key != "msgRule"
              ? ((_params[key].value = this.form[key]),
                (_params[key].msgCode = this.form.msgCode))
              : (_params[key] = this.form.msgRule);
          }
          _params.audio.value = _params.audio.value ? "1" : "0";
          _params.bubbleNoticed.value = _params.bubbleNoticed.value ? "1" : "0";
          _params.persist.value = _params.persist.value ? "1" : "0";
          _params.icon.value === "undefined" ? (_params.icon.value = null) : "";
          await systemApi
            .saveMessagePropertyDetail(_params)
            .then((res) => {
              this.$message({
                message: "保存成功",
                type: "success",
              });
              this.getList(this.form.msgCode);
            })
            .catch((err) =>
              this.$message({
                message: err,
                type: "error",
              })
            );
        } else {
          return false;
        }
      });
    },
    closeRulesDialog() {
      this.rulesDialogShow = false;
    },
    closeChooseDialog() {
      this.chooseDialogShow = false;
    },
    saveR(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          if (this.curRuleIndex > -1) {
            this.form.msgRule[this.curRuleIndex] = JSON.parse(
              JSON.stringify(this.form2)
            );
          } else {
            this.form.msgRule.push(JSON.parse(JSON.stringify(this.form2)));
          }
          this.rulesDialogShow = false;
        } else {
          return false;
        }
      });
    },
    saveC(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.form.msgRule.push(JSON.parse(JSON.stringify(this.form3)));
          this.chooseDialogShow = false;
        } else {
          return false;
        }
      });
    },
    addRules() {
      this.form2.msgCode = this.curMsg.msgCode;
      this.form2.ruleName = "";
      this.form2.serverType = 1;
      this.form2.serviceName = "";
      this.form2.excludesReceiver = 0;
      this.rulesDialogShow = true;
      this.curRuleIndex = -1;
    },
    editRule(item, index) {
      this.form2.msgCode = this.curMsg.msgCode;
      this.form2.ruleName = item.ruleName;
      this.form2.serverType = item.serverType;
      this.form2.serviceName = item.serviceName;
      this.form2.excludesReceiver = item.excludesReceiver;
      this.rulesDialogShow = true;
      this.curRuleIndex = index;
    },
    chooseRules() {
      this.form3.msgCode = this.curMsg.msgCode;
      this.form3.ruleName = "";
      this.form3.serverType = 1;
      this.form3.serviceName = "";
      this.form3.excludesReceiver = 0;
      this.chooseDialogShow = true;
      this.curRuleIndex = -1;
    },
    delRule(item, index) {
      let _rules = this.form.msgRule,
        _idx = -1;
      for (let v of _rules) {
        _idx = v.id == item.id ? index : "";
      }
      _idx > -1 ? _rules.splice(_idx, 1) : "";
    },
    chooseRuleByForm(id) {
      let _obj;
      if (id) {
        for (let v of this.baseRuleList) {
          if (v.id == id) {
            _obj = v;
            break;
          }
        }
        this.form3.ruleName = _obj.ruleName;
        this.form3.serverType = _obj.serverType;
        this.form3.serviceName = _obj.serviceName;
      } else {
        this.form3.ruleName = "";
        this.form3.serverType = 1;
        this.form3.serviceName = "";
      }
    },
  },
  components: {},
};
</script>
<style lang="scss" scoped>
.el-dialog__body {
  .content2 {
    display: flex;
    width: 100%;
    height: 250px;
    .form2 {
      width: 100%;
    }
  }
  .content3 {
    display: flex;
    width: 100%;
    height: 150px;
    .form3 {
      width: 100%;
    }
  }
  .content {
    display: flex;
    width: 100%;
    .left-box,
    .right-box {
      .title {
        width: 100%;
        height: 34px;
        margin-bottom: 15px;
        span {
          font-size: 18px;
          line-height: 36px;
          font-weight: 500;
          @include mixin(color, (#fff) ($white));
        }
      }
    }
    .left-box {
      float: left;
      width: 430px;
      height: 100%;
      .search {
        width: 100%;
        height: 40px;
        .el-select {
          width: 120px;
        }
      }
      .list {
        width: 100%;
        height: calc(100% - 148px);
        // border-width: 1px;
        border-top-width: 0;
        border-style: solid;
        @include mixin(border-color, (#013d53) ($dark-2));
        overflow: hidden;
        overflow-y: auto;
        ul {
          width: 100%;
          overflow: hidden;
          padding: 10px;
          li {
            overflow: hidden;
            position: relative;
            width: 100%;
            height: 40px;
            padding: 0 20px;
            background: pink;
            border-radius: 5px;
            border: 1px solid;
            line-height: 40px;
            @include mixin(border-color, (#05799f) ($dark-2));
            @include mixin(color, (#fff) ($color-dc));
            @include mixin(background, (#04263c) ($dark-5));
            padding-right: 40px;
            cursor: pointer;
            & + li {
              margin-top: 10px;
            }
            i {
              transition: right 0.3s ease-in-out 0s;
              font-size: 18px;
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              right: -50px;
              cursor: pointer;
              @include mixin(color, (#fff) ($color-dc));
              &:hover {
                @include mixin(color, (#fff) ($secondary));
              }
            }
            &:hover {
              @include mixin(border-color, (#00eaff) ($dark-2));
              i {
                right: 10px;
              }
            }
            &.active {
              @include mixin(background, (#023347) ($dark-98));
            }
          }
        }
      }
      .list-action-bar {
        width: 100%;
        height: 60px;
        padding: 20px 0 0;
        text-align: center;
        span {
          width: 95px;
          height: 36px;
          font-size: 16px;
          margin: 0px 10px;
          line-height: 36px;
          text-align: center;
          border-radius: 3px;
          display: inline-block;
          @include mixin(color, (#fff) ($white));
          cursor: pointer;
          &.cancel {
            border: 1px solid;
            line-height: 34px;
            @include mixin(color, (#fff) ($color-dc));
            @include mixin(border-color, ($color-c) ($color-dc));
            @include mixin(background-color, ($white) ($dark-6));
            vertical-align: bottom;
          }
          &.save {
            @include mixin(background-color, ($primary) ($dark-1));
          }
        }
      }
    }
    .right-box {
      float: left;
      width: calc(100% - 450px);
      margin-left: 20px;
      height: 100%;
      .cont {
        position: relative;
        padding: 20px;
        width: 100%;
        height: calc(100% - 54px);
        border-width: 1px;
        border-style: solid;
        @include mixin(border-color, (#00eaff) ($dark-1));
        overflow: hidden;
        overflow-y: auto;
        .tablist {
          width: 100%;
          height: 40px;
          overflow: hidden;
          margin-bottom: 10px;
          ul {
            width: 100%;
            height: 100%;
            li {
              cursor: pointer;
              font-size: 16px;
              float: left;
              & + li {
                margin-left: 20px;
              }
              &.active {
                @include mixin(color, (#fff) ($dark-1));
                @include mixin(border-color, ($primary) ($dark-1));
                padding-bottom: 5px;
                border-bottom: 2px solid;
              }
            }
          }
        }
        .form {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          .icon-mess {
            margin-left: 10px;
            vertical-align: top;
            display: inline-block;
            width: 30px;
            height: 30px;
            background-position: 0 0;
            background-repeat: no-repeat;
            background-size: 100% 100%;
            @include mixin(background-image, ($mess-icon) ($mess-icon));
            &.active {
              @include mixin(
                background-image,
                ($mess-icon-active) ($mess-icon-active)
              );
            }
          }
          .form-item-half {
            width: 49%;
          }
          .form-item-row {
            width: 100%;
            &.flexed {
              .el-form-item__content {
                display: flex;
                .el-input {
                  width: 200px;
                  margin-left: 20px;
                }
              }
            }
          }
          .rule-box {
            width: 100%;
            overflow: hidden;
            .acts {
              width: 100%;
              height: 32px;
              margin-bottom: 10px;
              span {
                display: inline-block;
                text-align: center;
                // border: 1px solid;
                line-height: 30px;
                padding: 0 10px;
                cursor: pointer;
                border-radius: 3px;
                @include mixin(color, (#fff) ($color-6));
                text-decoration: underline;
              }
            }
            ul {
              width: 100%;
              overflow: hidden;
              li {
                cursor: pointer;
                position: relative;
                font-size: 14px;
                border: 1px solid;
                display: inline-block;
                padding-right: 30px;
                padding-left: 8px;
                margin-right: 8px;
                margin-bottom: 8px;
                border-radius: 5px;
                @include mixin(border-color, ($br-primary) ($dark-2));
                @include mixin(color, (#fff) ($color-dc));
                @include mixin(background, ($white) ($dark-98));
                &:hover {
                  @include mixin(color, (#fff) ($white));
                  @include mixin(background, ($color-e) ($dark-5));
                }
                i {
                  position: absolute;
                  right: 8px;
                  font-size: 14px;
                  &:hover {
                    color: $state-1;
                  }
                }
              }
            }
          }
           span {
            font-size: 16px;
          }
        }
      }
    }
  }
}
.action-bar {
  width: 100%;
  padding: 20px 0 10px;
  text-align: center;
  span {
    width: 95px;
    height: 36px;
    font-size: 16px;
    margin: 0px 10px;
    line-height: 36px;
    text-align: center;
    border-radius: 3px;
    display: inline-block;
    @include mixin(color, ($white) ($white));
    cursor: pointer;
    &.cancel {
      border: 1px solid;
      line-height: 34px;
      @include mixin(color, ($color-3) ($color-dc));
      @include mixin(border-color, ($color-c) ($color-dc));
      @include mixin(background-color, ($white) ($dark-6));
      vertical-align: bottom;
    }
    &.save {
      @include mixin(background-color, ($primary) ($dark-1));
    }
  }
}
 .button {
  margin: 10px auto;
}
</style>
