<template>
  <el-dialog
    top="0"
    width="950px"
    :visible.sync="show"
    :before-close="closeDialog"
    :close-on-click-modal="false"
    append-to-body>
    <div slot="title" class="dialog-header">
      <i class="iconfont icon-titleaddressbook"></i>
      <span>子系统管理</span>
    </div>
    <div class="content">
      <div class="left-box">
        <div class="title">
          <span>子系统列表</span>
        </div>
        <div class="list">
          <ul>
            <li v-for="(item, index) in subSystemList" :key="index" @click="handleLi(item)" :class="{'active':item.id == curItem.id}">
              <p class="item">
                <span class="key">{{item.key}}</span>
                <span class="itemValue">{{item.value}}</span>
                <span class="optionBtns">
              </span>
              </p>
              <p class="url">{{item.url}}</p>
              <!-- <i class="iconfont icon-delete" @click.stop="delItem(item)"></i> -->
            </li>
          </ul>
        </div>
        <div class="footer">
          <span class="saveBtn" @click="addItem">新增</span>
        </div>
        <!-- <div class="list-action-bar">
          <span class="save" @click="addItem">新增</span>
        </div> -->
      </div>
      <div class="right-box">
        <div class="title">
          <span>子系统信息 - {{ curItem.id ? '修改' : '新增' }}</span>
        </div>
        <div class="cont">
          <el-form class="form" ref="form" :model="form" :rules="rules" label-width="120px" size="small">
            <el-form-item label="系统key：" prop="key">
              <el-input v-model.trim="form.key" placeholder="请输入系统key" clearable></el-input>
            </el-form-item>
            <el-form-item label="系统名称：" prop="value">
              <el-input v-model.trim="form.value" placeholder="请输入系统名称" clearable></el-input>
            </el-form-item>
            <el-form-item label="系统路径：" prop="path">
              <el-input v-model.trim="form.path"  placeholder="请输入系统路径" clearable>
                <el-select slot="prepend" v-model="form.agre" placeholder="请选择协议" style="width:120px">
                  <el-option v-for="(item,index) in options" :label="item.label" :value="item.value" :key="index"></el-option>
                </el-select>
              </el-input>
            </el-form-item>
          </el-form>
          <div class="footer">
            <span class="saveBtn" @click.stop="save('form')">保存</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from "vuex"
import store from '@/store'
import systemApi from "@/api/modules/system"
export default {
  props:['data','show'],
  data() {
    var pathValidate = (rule, value, callback) => {
      if(value.indexOf('//') != -1) {
        callback(new Error('系统路径格式不正确'));
      } else {
        callback();
      }
    };
    return {
      curItem:{},
      subSystemList:[],
      copyForm:{},
      form:{
        id:'',
        key:'',
        path:'',
        value:'',
        agre:'http',
      },
      options: [
        {
          value: 'http',
          label: 'http'
        },
        {
          value: 'https',
          label: 'https'
        }
      ],
      rules: {
        key: [
          { required: true, message: '请输入系统key', trigger: 'blur' }
        ],
        value: [
          { required: true, message: '请输入系统名称', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '请输入系统路径', trigger: 'blur' },
          { validator:pathValidate, trigger: 'blur' },
        ],
      }
    };
  },
  created(){
    this.getList();
    this.copyForm = JSON.parse(JSON.stringify(this.form));
  },
  methods:{
    // 获取子系统列表
    async getList(){
      let _params = {
        obj:{
          type: 'SUB_SYSTEM'
        }
      }
      let _data = await systemApi.getSubSystemList(_params);
      if(_data){
        this.subSystemList = _data.list;
        this.handleLi(_data.list[0]);
      }
    },
    // 新增
    addItem(){
      this.curItem = {};
      this.$refs['form'].resetFields();
      this.form = JSON.parse(JSON.stringify(this.copyForm));
    },
    handleLi(item){
      item.agre = '';
      item.path = '';
      this.curItem = item;
      this.$refs['form'].resetFields();
      const pathArr = item.des.split('//');
      this.form = JSON.parse(JSON.stringify(item));
      this.form.agre = pathArr[0].split(':')[0];
      this.form.path = pathArr[1];
    },
    delItem(item){
      this.$confirm('此操作将永久删除该子系统, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let _params = {
          id:item.id
        }
        await systemApi.delSubSystem(_params).then(res=>{
          if(res){
            this.subSystemList.forEach((v,indx)=>{
              v.id == item.id ? this.subSystemList.splice(indx,1) : '';
            })
          }
          this.form = JSON.parse(JSON.stringify(this.copyForm));
        })
      }).catch(() => {});
    },
    save(formName){
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let pathStr = `${this.form.agre}://${this.form.path}`;
          let params = {
            des: pathStr,
            id: this.form.id,
            key: this.form.key,
            value: this.form.value,
            type:'SUB_SYSTEM'
          };
          await systemApi.saveSubSystem(params).then(res=>{
            this.$message.success('保存成功！');
            if(this.form.id){
              this.subSystemList.forEach((item,i)=>{
                if(item.id == this.form.id ){
                  this.subSystemList[i].des = pathStr;
                  this.subSystemList[i].key = this.form.key;
                  this.subSystemList[i].value = this.form.value;
                }
              })
            }else{
              this.getList();
            }
          }).catch((err) => this.$message({
            message: err,
            type: 'error'
          }))
        } else {
          return false;
        }
      });
    },
    closeDialog() {
      this.$emit("close", false);
    },
  }
};
</script>
<style lang="scss" scoped>
 .el-dialog__header{
  background: #094457;
  border: none;
}
 .el-dialog__body{
  background-color: #032A38;
  border: none;
  background-image: none;
}
 .el-form-item{
  .el-radio__label,
  .el-form-item__label{
    color: #B6EFFA;
    }
}

 .el-input__inner, .el-textarea__inner,
 .el-input-group__prepend div.el-select .el-input__inner
{
  background-color: #033347;
  border: 1px solid #05799F;
  height: 36px;
  color: #fff;
  // box-shadow: 0px 0 4px rgba(39, 218, 235,.4) inset;
    &.active{
      background-color: rgba(9, 68, 87, .9);
      border: 1px solid rgba(0, 234, 255, .7);
    }
}
 .el-input-group__prepend { 
  border-right: none;
  border-left: none;
  border-radius: 3px;
}
 ::-webkit-scrollbar-thumb{
  color: aqua;
}
 input::-webkit-input-placeholder,
  input:-ms-input-placeholder,
  input:-moz-placeholder{
        color:palevioletred;
        opacity: 1;
       }
 input:-moz-placeholder,
 textarea:-moz-placeholder {
    color: #BBBBBB;
    
}
 input:-ms-input-placeholder,
 textarea:-ms-input-placeholder {
    color: #BBBBBB;
    
    
}
 input::-webkit-input-placeholder,
 textarea::-webkit-input-placeholder {
    
    color: #BBBBBB;
}
// 伪类
 ::-webkit-input-placeholder {
    
    color:    #BBBBBB;
}
 :-moz-placeholder {
    
    color:    #BBBBBB;
}
 ::-moz-placeholder {
    
    color:    #BBBBBB;
}
 :-ms-input-placeholder {
    
    color:    #BBBBBB;
}
// .dialog-header{
//   background: #094457;
// }

.content{
  width: 100%;
  height: 500px;
  display: flex;
  .left-box, .right-box{
    .title{
      width: 100%;
      height: 36px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      span{
        font-size: 18px;
        line-height:36px;
        font-weight: 400;
        @include mixin(color, (#FFF) );
      }
      &::before {
          content: '';
          width: 3px;
          height: 18px;
          margin-right: 10px;
          display: inline-block;
          background-color: #B6EFFA;
        }
    }
  }
  // .btn{
  //   display: flex;
  //   justify-content: center;
  //   margin: 20px auto;
  // }
  .footer {
    padding: 20px 0;
    text-align: center;
    .saveBtn {
      width: 130px;
      height: 38px;
      font-size: 16px;
      margin: 0px 10px;
      line-height: 36px;
      text-align: center;
      border-radius: 3px;
      display: inline-block;
      // @include mixColor($white, $white);
      color: #FFF;
      cursor: pointer;
      background-image: url(~@/assets/images/button_blue.png);

}
  }
  .left-box{
    float:left;
    width:420px;
    height:100%;
    .list{
      width: 100%;
      // border:1px solid;
      height:calc(100% - 104px);
      // @include mixin(border-color, ($br-primary) ($dark-2));
      overflow: hidden;
      overflow-y: auto;
      ul{
        width: 100%;
        // padding: 5px;
        overflow: hidden;
        li{
          width: 100%;
          height:48px;
          line-height: 48px;
          // border: 1px solid;
          // border-radius: 5px;
          padding: 0px 30px 0px 10px;
          @include mixin(background, (rgba(9, 68, 87, 0.5)) ($dark-98));
          // @include mixin(border-color, (rgb(0, 238, 255)) ($dark-2));
          box-shadow: 0px 0 8px rgba(39, 218, 235,.4) inset;
          @include mixin(color, ($text-primary) ($color-dc));
          margin-bottom: 10px;
          position: relative;
          cursor: pointer;
          p{
            width: 100%;
            display: flex;
            align-items: center;
            &.item span{
              display: block;
              font-size: 16px;
              float: left;
              @include mixin(color, ($text-primary) ($color-dc));
              width: calc(100% - 130px);
              overflow:hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              &.key{
                color:#EC403F;
                font-weight: 600;
                width: 120px;
                margin-right: 10px;
                margin-left: 10px;
              }
              &.itemValue{
                color: #FFFFFF;
              }
              &.optionBtns {
                // display: inline-block;
                .iconfont{
                  font-size: 30px;
                  // margin-left: 10px;
                  margin-right: 10px;
                  &.icon-circledelete{
                    color: #D94041;
                  }
                  &.icon-circleedit{
                    color: #00D7EC;
                  }
                }
              }
            }
            &.url{
              font-size: 16px;
              @include mixin(color, ($color-9) ($color-ac));
            }
          }
          i{
            cursor: pointer;
            font-size: 18px;
            position: absolute;
            top:50%;
            right:10px;
            transform: translateY(-50%);
            @include mixin(color, ($color-9) ($color-dc));
            &:hover{
              @include mixin(color, ($secondary) ($secondary));
            }
          }
          &:hover{
            // @include mixin(background, ($color-e) ($dark-5));
            background: rgba(9, 68, 87, .9);
            border: 1px solid rgba(0, 234, 255, .7);
          }
          // &.active{
          //   @include mixin(background, ($color-e) ($dark-5));
          // }
          &.active{
          background: rgba(9, 68, 87, .9);
          border: 1px solid rgba(0, 234, 255, .7);
        }
        }
      }
      
    }
    
    .list-action-bar{
      width: 100%;
      height: 60px;
      padding: 20px 0 0;
      text-align: center;
      span{
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
        &.save{
          @include mixin(background-color, ($primary) ($dark-1));
        }
      }
    }
  }
  .right-box{
    float:left;
    height:100%;
    margin-left: 20px;
    width:calc(100% - 400px);
    .cont{
      width: 100%;
      padding: 15px;
      height:calc(100% - 44px);
      // border: 1px solid;
      background-color: #033040;
      color: #B6EFFA;
      // @include mixin(border-color, ($br-primary) ($dark-2));
      overflow: hidden;
      // overflow-y: auto;
      .form{
        padding: 10px;
        width: 100%;
        height: calc(100% - 56px);
        
      }
    }
    .action-bar{
      width: 100%;
      padding-top: 20px;
      text-align: center;
      span{
        width: 95px;
        height: 36px;
        font-size: 16px;
        line-height: 36px;
        text-align: center;
        border-radius: 3px;
        display: inline-block;
        @include mixin(color, ($white) ($white));
        cursor: pointer;
        // &.save{
          // @include mixin(background-color, ($br-primary) ($dark-1));
        // }
      }
    }
  }
}
</style>
