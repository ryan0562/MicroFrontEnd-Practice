<template>
  <el-dialog
    title="修改密码"
    top="0"
    :visible.sync="show"
    append-to-body
    :before-close="close"
    custom-class="passWordPopus"
    :close-on-click-modal="false"
    width="500px"
  >
    <el-form ref="form" :model="form" size="small" :rules="rules">
      <el-form-item label="原密码" :label-width="formLabelWidth" prop="oldPassword">
        <el-input v-model="form.oldPassword" autocomplete="off" clearable placeholder="请输入原密码"></el-input>
      </el-form-item>
      <el-form-item label="新密码" :label-width="formLabelWidth" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          autocomplete="off"
          clearable
          placeholder="请输入新密码"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" :label-width="formLabelWidth" prop="conPassword">
        <el-input
          v-model="form.conPassword"
          type="password"
          autocomplete="off"
          clearable
          placeholder="请再次输入新密码"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <!-- <el-button @click="close" size="small">取 消</el-button>
      <el-button type="primary" @click="save" size="small">确 定</el-button> -->

       <div class="button btn-common-blue" @click="close">
              <span>取 消</span>
       </div>
      <div class="button btn-common-blue" @click="save">
        <span>确 定</span>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { mapState, mapActions } from "vuex";
import systemApi from "@/api/modules/system";
export default {
  props: ["visible"],
  data() {
    let passwordRE = (rule, value, callback) => {
      if (value === this.form.newPassword) {
        console.log("pass");
        return callback();
      } else {
        console.log("defined");
        return callback(new Error("二次密码输入不一至，请重新核对"));
      }
    };
    return {
      show: true,
      form: {
        oldPassword: "",
        newPassword: "",
        conPassword: "",
      },
      rules: {
        oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
        newPassword: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          {
            message: "密码格式有误，请重新输入(可以包含英文、数字，且长度6~20位)",
            trigger: "blur",
            pattern: /^([a-z0-9\.\@\!\#\$\%\^\&\*\(\)]){6,20}$/i,
          },
        ],
        conPassword: [{ required: true, trigger: "blur", validator: passwordRE }],
      },
      formLabelWidth: "120px",
    };
  },
  filters: {},
  computed: {
    ...mapState({}),
  },
  created() {},
  mounted() {},
  methods: {
    ...mapActions(["logOut"]),
    async save() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          let _userCode = JSON.parse(sessionStorage.getItem("userInfo")).code;
          let param = {
            code: _userCode,
            oldPassword: this.form.oldPassword,
            password: this.form.newPassword,
          };
          await systemApi.changePassword(param).then(res => {
            this.$emit("close");
            this.$alert(res, "提示", {
              confirmButtonText: "确定",
              callback: action => {
                this.logOut();
              },
            });
          });
        } else {
          return false;
        }
      });
    },
    close() {
      this.$emit("close");
    },
  },
  components: {},
};
</script>
<style lang="scss" scoped>
//  .el-dialog__title{
//   @include mixColor($white, $white);
// }
//  .el-dialog__body{
//   border: 0;
// }
 .passWordPopus {
  // @include mixin(background-color, #033950 #033950);
  background: #033950;
  .el-dialog__header {
    background: #0a4457;
    border-color: transparent;
  }
  .el-dialog__body {
    background: transparent;
    border-color: transparent;
    .el-form {
      .el-form-item {
        .el-form-item__label {
          color: white;
        }
        .el-form-item__content {
          .el-input__inner {
            background: #033347;
            color: white;
            border: 1px solid #05799F;
          }
          input:-webkit-autofill , textarea:-webkit-autofill, select:-webkit-autofill {
              // 字体颜色
              -webkit-text-fill-color: white !important;
              // 背景颜色
              background-color: #033347 !important;
              // 背景图片
              background-image: #033347 !important;
              //设置input输入框的背景颜色为透明色
              -webkit-box-shadow: 0 0 0px 1000px #033347  inset !important;  
              transition: background-color 50000s ease-in-out 0s;  
            }
        }
      }
    }
  }
}
.dialog-footer{
  // background: red;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  .button{
    margin-left:10px;
  }
}
</style>
