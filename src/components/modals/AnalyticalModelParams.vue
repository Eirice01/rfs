<template>
    <div id="analytical-model-params">
      <Modal title="模型参数" v-model="isShowModelParams" :styles="{top: '160px'}" width="800">
        <div slot="close" @click="closeModelParams">
          <Icon type="ios-close"></Icon>
        </div>
        <Row class="params-row">
          <Col :span="12" v-if="rname"><span class="param-label">模型名称:</span><span>{{rname}}</span></Col>
          <Col :span="12" v-if="createUser"><span class="param-label">创建人:</span><span>{{createUser}}</span></Col>
          <Col :span="12" v-if="relationType"><span class="param-label">关系类型:</span><span>{{relationType}}</span></Col>
          <Col :span="12" v-if="labels"><span class="param-label">标签名称:</span><span>{{labels}}</span></Col>
          <Col :span="12" v-if="createTime"><span class="param-label">创建时间:</span><span>{{createTime}}</span></Col>
          <Col :span="12" v-if="updateTime"><span class="param-label">修改时间:</span><span>{{updateTime}}</span></Col>
          <Col :span="12" v-if="rangeTime"><span class="param-label">时间范围:</span><span>{{rangeTime}}</span></Col>
          <Col :span="12" v-if="errorCause"><span class="param-label">失败原因:</span><span>{{errorCause}}</span></Col>
          <!--<Col :span="12" v-if="startTime"><span class="param-label">开始时间:</span><span>{{startTime}}</span></Col>-->
          <!--<Col :span="12" v-if="endTime"><span class="param-label">结束时间:</span><span>{{endTime}}</span></Col>-->
        </Row>
        <Row style="padding-top:10px">
          <Table :columns="columns" :data="curData" :loading="loading" id="analytical-table"></Table>
          <Page v-if="showPage" :total="total" show-elevator show-total size="small" :current="curPage" @on-change="changePage" :page-size='pageSize' style="text-align:right;padding-top:10px"></Page>
        </Row>
        <div slot="footer" style="text-align: center;">
          <Button type="primary" @click="closeModelParams">关闭</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
    import {URL} from "../../../api/urlsConfig"
    import * as DateUtil from "../../utils/date"
    export default {
      name: "analytical-model-params",
      data() {
        return {
          isShowModelParams: false,
          rname:"",
          labels:'',
          relationType:"",
          createUser:"",
          createTime:"",
          updateTime:"",
          startTime:"",
          endTime:"",
          errorCause: '',
          // 时间范围
          rangeTime:"",
          columns:[
            {
              title:"序号",
              key:"index",
              align:"center",
              width:100
            },
            {
              title:"对象类型",
              key:"type",
              align:"center"
            },
            {
              title:"对象名称",
              key:"value",
              align:"center"
            }
          ],
          tableData:[],
          curData:[],
          total:0,
          curPage:1,
          pageSize:10,
          loading:true
        }
      },
      props: [],
      create() {

      },
      mounted(){

      },
      computed:{
        showPage(){
          return this.total > this.pageSize;
        }
      },
      methods: {
        initModelParams(model) {
          // let rid = this.$store.state.modelRid;
          this.$http.request({
            method: 'get',
            params:{rid:model.rid},
            url: URL.viewParams,
            success:(data) => {
              if (data.code === 200) {
                let res = data.data;
                this.rname = res.rname;
                this.createUser = res.createUser;
                this.createTime = res.createtime;
                this.updateTime = res.updatetime;
                this.relationType = res.accountVo.edgeLabel;
                this.errorCause = res.errorCause;
                if(res.accountVo.startTime && res.accountVo.endTime ){
                  let startTime = +res.accountVo.startTime;
                  let endTime = +res.accountVo.endTime;
                  this.rangeTime = DateUtil.formatDateBysdf(startTime) + " - " + DateUtil.formatDateBysdf(endTime);
                }
                let parpamVo = res.accountVo.parpamVo;
                let baseDictionData = this.$store.state.queryBaseDictionData;
                let labels = res.accountVo.labels;
                if(!_.isEmpty(labels)){
                  let labelList = _.split(labels, ',');
                  let labelProList = _.filter(baseDictionData.flagLabel, function (labelPro) {
                    return _.find(labelList, function (label) {
                      if(labelPro.dicCode === label){
                        return labelPro;
                      }
                    })
                  });
                  this.labels = _.join(_.map(labelProList, 'dicName'), ',');
                }

                this.getTableData(parpamVo, baseDictionData);
              }
            },
            error: (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
          this.isShowModelParams = !this.isShowModelParams;
        },
        getTableData(parpamVo){
          let _this = this;
          const dict = this.$store.state.queryBaseDictionData.nodePro;
          let type,tableData = [],curData = [],index=0;
          _.each(parpamVo, function (item) {
            dict.forEach(v => {
              if(v.label === item.type){
                type = v.name;
              }
            });
            let valueArray = item.value.split("\n")[0];
            // _this.total = valueArray.length;
            // valueArray=valueArray.slice(0,_this.total);
          //  valueArray.forEach((v,i) => {

              tableData.push({
                index:index+1,
                type:type,
                value:valueArray
              });
              if(index < _this.pageSize){
                curData.push({
                  index:index+1,
                  type:type,
                  value:valueArray
                });
              }
            index ++;
          //  });
          });
          this.total = index;
          this.curData = curData;
          this.tableData = tableData;
          this.loading = false;
        },
        changePage(index){
          this.curPage = index;
          this.curData = [];
          let curData = [];
          let tableData = this.tableData;
          for(let i = this.pageSize*(this.curPage - 1); i < (this.pageSize*this.curPage > this.total ? this.total : this.pageSize*this.curPage); i++){
            curData.push(tableData[i]);
          }
          this.curData = curData;
        },
        closeModelParams() {
          this.isShowModelParams = !this.isShowModelParams;
          this.rname = "";
          this.relationType = "";
          this.createUser = "";
          this.labels = "";
          this.createTime = "";
          this.startTime = "";
          this.endTime = "";
          this.rangeTime = "";
          this.errorCause = "";
          this.tableData = [];
          this.curData = [];
          this.total = 0;
          this.curPage = 1;
          this.loading = true;
        },
        //时间格式化
  /*      formatTime(time) {
          let date = new Date(time);
          let y = date.getFullYear();
          let m = date.getMonth() + 1;
          let d = date.getDate();
            // h = date.getHours(),
            // mm = date.getMinutes(),
            // s = date.getSeconds();
          return y + '-' + this.timeFormatter(m) + '-' + this.timeFormatter(d);
        },
*/
        timeFormatter(m) {
          return m < 10 ? '0' + m : m;
        }
      }
    }
</script>

<style scoped>
  .params-row{
    width:95%;
    margin:0 auto;
    padding:20px;
    font-size:14px;
    line-height:26px;
  }
  .param-label{
    display:inline-block;
    width:75px;
    font-weight:800;
  }
</style>
<style>
  #analytical-table .ivu-table th,#analytical-table .ivu-table td{
    height:30px!important;
  }
  #analytical-table .ivu-table:before{
    background-color:transparent;
  }
</style>
