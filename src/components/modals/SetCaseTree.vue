<template>
<div id="setcasetree">
 <Modal id="caseTreeSet" v-model="treeModal"  title="案件设置" width="350" >
  <li class="cls-row">
    <span>一级：</span>
    <Select v-model="formcodes" clearable @on-change="getTypeRow1" @on-clear="clear1">
      <Option  :value="item.typeCode" v-for="(item,key) in typeList" :key="key" @click.native="getOptionstypes(item.typeCode)">{{item.typeName}}</Option>
    </Select>
  </li>
  <li class="cls-row" style="margin:15px 0px">
    <span>二级：</span>
    <Select v-model="formcodes2" :disabled="row2" clearable @on-change="getTypeRow2" @on-clear="clear2">
      <Option  :value="item.typeCode" v-for="(item,key) in typeList2" :key="key"@click.native="getOptionstypes2(item.typeCode)" >{{item.typeName}}</Option>
    </Select>
  </li>
  <li class="cls-row">
    <span>三级：</span>
    <Select v-model="formcodes3":disabled="row3" clearable @on-change="getTypeRow3" @on-clear="clear3">
      <Option  :value="item.typeCode" v-for="(item,key) in typeList3" :key="key" @click.native="getOptionstypes3(item.typeCode)">{{item.typeName}}</Option>
    </Select>
  </li>
  <div slot="close" @click="closeTreeModal"><Icon type="ios-close"></Icon></div>
  <div slot="footer">
    <Button type="text" @click="cancelTreeModal">取消</Button>
    <Button type="primary" @click="upCaseTree">确定</Button>
  </div>
 </Modal>
</div>
</template>
<script>
  import {URL} from "../../../api/urlsConfig"
  export default {
    name: "setcasetree",
    data() {
      return {
        treeModal:false,
        typeArray:[],
        typeList :[
          {
            "typeName":'状态',
            "typeCode":'status'
          },
          {
            "typeName":'部门',
            "typeCode":'dep'
          },
          {
            "typeName":'类型',
            "typeCode":'casetype'

          },
        ],
        typeList2:'',
        typeList3:'',
        formcodes:'status',
        formcodes2:'dep',
        formcodes3:'casetype',
        rowType1:'',
        rowType2:'',
        rowType3:'',
        row2:true,
        row3:true,
        newList:'',

      }
    },
    props:[
      'root'
    ],
    components: {},
    created() {

    },
    mounted() {
    },
    methods: {
      //初始化案件树设置
       initCasetree(){

       },
      //案件树设置等级获取(1级)
      getOptionstypes(code){
        this.formcodes2='';
        this.formcodes3='';
      },
      //案件树设置等级获取(2级)
      getOptionstypes2(code){

      },
      //案件树设置等级获取(3级)
      getOptionstypes3(code){

      },
      // 一级案件树设置清空
      clear1(){
        this.row2=false;
        this.row3=false;
        this.formcodes2='';
        this.formcodes3='';
      },
      // 二级案件树设置清空
      clear2(){
        this.row3=false;
        this.formcodes3='';
      },
      // 三级案件树设置清空
      clear3(){
        this.formcodes3='';
      },
      //获取一级等级选项
      getTypeRow1(){
        if(this.formcodes!=''&& this.formcodes!=undefined){
          this.row2=false;
          // if(this.formcodes=='状态'){
          //   this.rowType1=this.formcodes;
          // }
          // if(this.formcodes=='部门'){
          //   this.rowType1='dep';
          // }
          // if(this.formcodes=='类型'){
          //   this.rowType1='casetype';
          // }
          this.rowType1=this.formcodes;
          this.typeList2=_.reject(this.typeList,{'typeCode':this.formcodes});
        }else {
          this.row2=true;
          this.row3=true;
          this.formcodes2='';
          this.formcodes3='';
          this.newList=''
        }
      },
      //获取二级等级选项
      getTypeRow2(){
        if(this.formcodes2!='' && this.formcodes2!=undefined){
          this.row3=false;
          this.rowType2=this.formcodes2;
          this.typeList3=_.reject(this.typeList2,{'typeCode':this.formcodes2});
        }else {
          this.row3=true;
        }
      },
      //获取三级级等级选项
      getTypeRow3(){
        this.rowType3=this.formcodes3;
      },
      //案件设置左上角关闭
      closeTreeModal(){
        this.treeModal=false;
      },
      //案件设置
      treeSets(){
        let _this=this;
        _this.treeModal=true;
        this.$http.request({
          method: 'get',
          url: URL.queryTreeDeepByUserId,
          params: {},
          success: (data) => {
            if (data.code === 200){
              _this.typeArray=data.data;
              let tepcode=[];
              _this.formcodes2='';
              _this.formcodes2='';
              _this.formcodes3='';
              _.filter(_this.typeArray,function (code) {
                for(let i=0;i<_this.typeList.length;i++){
                  if(code.deepName==_this.typeList[i].typeCode){
                    tepcode.push(code.deepName)
                  }
                }
              })
              //根据返回值回填选中状态
              if(tepcode.length==1){
                _this.formcodes=tepcode[0];
                _this.formcodes2='';
                _this.formcodes3='';
              }
              if(tepcode.length==2){
                _this.formcodes=tepcode[0];
                _this.formcodes2=tepcode[1];
                _this.formcodes3='';
              }
              if(tepcode.length==3){
                _this.formcodes=tepcode[0];
                _this.formcodes2=tepcode[1];
                _this.formcodes3=tepcode[2];
              }
            }
            _this.getTypeRow1();
            _this.getTypeRow2();
            _this.getTypeRow3();
          }
        });
      },
      //案件树设置提交
      upCaseTree(){
        let _this=this;
        let TypeList=[];
        _this.newList=[];
        TypeList.push(this.formcodes,this.formcodes2,this.formcodes3);
        let labelcodes= new Set(TypeList);
        let codes=Array.from(labelcodes);
        //去除空
        let newDataArr=codes.filter(function (item) {
          return  item && item.trim();
        })
        //转字符串，去掉尾部,
          let newList=TypeList.join(',')
          newList=_.trimEnd(newList,',')
          _this.newList={deepName:newList}
        console.log(_this.newList)
        this.$http.request({
          method: 'post',
          url: URL.queryTreeDeepByUserId,
          data:{},
          success: (data) => {
            if (data.code === 200){
              this.$emit('intCaseTree',_this.newList)
              this.treeModal=false;
            }
          }
        });
      },
      //取消
      cancelTreeModal(){
        this.treeModal=false;
      },

    },

  }
</script>

<style scoped>

</style>
<style>
  /*#setcasetree*/
</style>
