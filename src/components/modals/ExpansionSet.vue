<template>
    <div id="expansionSet">
      <Modal v-model="getModalState" title="扩线设置">
        <Form ref="formItem" :model="formItem" :rules="itemRule" :label-width="110">
          <FormItem label="关系类型：" prop="relationType">
            <Select v-model="formItem.relationType" multiple  style="width:90%;">
              <Option v-for="item in edgePro" :value="item.label" :key="item.label">{{item.name}}</Option>
            </Select>
          </FormItem>

          <FormItem label="时间范围：" prop="dateValue">
            <DatePicker type="daterange"
                        :options="limitDate"
                        v-model="formItem.dateValue"
                        :clearable=false
                        :editable=false
                        split-panels
                        placeholder="请选择要查看的时间范围"
                        style="width:90%;">

            </DatePicker>
          </FormItem>
          <FormItem v-show="nodeLabel === 'vm'" label="标签类型：" prop="labelType">
            <Select v-model="formItem.labelType" filterable multiple style="width:90%;">
              <Option v-for="item in labelList" :disabled="formItem.labelType.length > 4" :value="item.dicCode" :key="item.dicCode">{{ item.dicName }}</Option>
            </Select>
          </FormItem>

          <!--<FormItem label="通联频度：" prop="contactFrequency">-->
            <!--<Input  placeholder="" style="width:90%;" v-model="formItem.contactFrequency"></Input>-->
          <!--</FormItem>-->
        </Form>
        <div slot="close" @click="closeModal"><Icon type="ios-close"></Icon></div>
        <div slot="footer">
          <Button type="text" @click="closeModal">取消</Button>
          <Button type="default" @click="expansionOk">确定</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
  import * as Operation from '../../pages/graph/js/allOperation'
  import {initDate} from '@/utils/date'
  import {URL} from "../../../api/urlsConfig"
    export default {
        name: "expansion-set",
        data() {
            return {
              limitDate:{
                disabledDate (date) {
                  return date && date.valueOf() > new Date().getTime();
                },
                shortcuts: [
                  {
                    text: '一周',
                    value () {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                      return [start, end];
                    }
                  },
                  {
                    text: '一个月',
                    value () {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                      return [start, end];
                    }
                  },
                  {
                    text: '三个月',
                    value () {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                      return [start, end];
                    }
                  },
                  {
                    text: '六个月',
                    value () {
                      const end = new Date();
                      const start = new Date();
                      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                      return [start, end];
                    }
                  }
                ]
              },
              edgePro:[],
              expansionData:[],
              //前端打包，第几次扩线
              expansionIndex: 1,
              labelList: [],
              //当前点的label，只有电话号码支持标签选择
              nodeLabel: [],
              formItem:{
                relationType: [],
                dateValue: initDate(),
                contactFrequency:"",
                labelType: [],
              },
              itemRule:{
                dateValue:[
                  {required:true, type: 'array', message:"日期不能为空",trigger:"change"},
                  {validator:(rule,value,callback) => {
                    if(value[0] == "" && value[1] == "") {
                      callback("请选择要查看的时间范围！")
                    } else if(new Date(value[1]).getTime() -new Date(value[0]).getTime() >15552000000) {
                      callback("时间间隔不能超过六个月！")
                    }else{
                      callback();
                    }

                  }}
                ],
                relationType: [
                  {
                    required: true, validator: (rule, value, callback) => {
                      if (_.isEmpty(value)) {
                        callback("关系类型不能为空！")
                      } else {
                        callback();
                      }
                    }
                  },
                ]
              },

            }
        },
        computed:{
          getModalState:{
            get:function () {
              this.resetData();
              if(this.$store.state.isExpansionSetModal){
                this.initEdgePro();
              }
              return this.$store.state.isExpansionSetModal
            },
            set:function () {
              this.$store.commit("showExpansionSetModal");
            }

          }
        },
        components: {},
        created() {

        },
        mounted() {

        },

        methods: {
          /*setDate() {
            let time1= Number(sessionStorage.getItem("expansionDate1"));
            let time2 = Number(sessionStorage.getItem("expansionDate2"));
            if (time1 != 0 && time2 != 0) {
              this.formItem.dateValue= [time1,time2];
            }else {
              this.formItem.dateValue = initDate();
            }
          },*/

         initEdgePro() {
            let baseDictionData = this.$store.state.queryBaseDictionData;
            let currentGraphModel = this.$store.state.currentGraphModel;
            let cy = currentGraphModel.cy;
            let nodeLabel = cy._private.curNode.data().type;
            let nodeProBase = baseDictionData.nodePro;
            this.nodePro = _.find(nodeProBase, {'label': nodeLabel});
            this.edgePro = _.isEmpty(this.nodePro) ? [] :this.nodePro.edgeList;
            this.nodeLabel = _.isEmpty(this.nodePro) ? '' :this.nodePro.label;
            this.labelList = baseDictionData.flagLabel;

          },

          closeModal() {
           this.$store.commit("showExpansionSetModal",false);
           this.formItem.labelType = [];
           this.formItem.relationType = [];
           let selDate = this.formItem.dateValue;this.$refs.formItem.resetFields();

           let dateValidate1 = selDate[0] == "" || selDate[1] == "";
            let dateValidate2 = new Date(selDate[1]).getTime() -new Date(selDate[0]).getTime() >15552000000;
           if(dateValidate1 || dateValidate2) {
             this.formItem.dateValue = initDate();
           }else {
             this.formItem.dateValue = selDate
           }
          },

          expansionOk() {
            let _this = this;
            this.$refs["formItem"].validate((valid) => {
              if (valid) {
                //显示加载动画
                this.$store.commit("graphLoad", true);
                this.$store.commit("showStatisticsAndAnalyzeCon", false);
                let currentGraphModel = this.$store.state.currentGraphModel;
                let cy = currentGraphModel.cy;
                let name = cy._private.curNode.data().name;
                let nodeLabel = cy._private.curNode.data().type;
                let startTime = this.formItem.dateValue[0] === '' ? null : new Date(this.formItem.dateValue[0]).getTime();
                let endTime = this.formItem.dateValue[1] === '' ? null : new Date(this.formItem.dateValue[1]).getTime();
                let indexLabel = _.isEmpty(this.nodePro) ? '' : this.nodePro.indexLabel;
                // //前端打包测试
                 this.expansionIndex = this.expansionIndex > 3 ? 1 : this.expansionIndex;
                 let url = URL['queryExpansionLineData' + this.expansionIndex];
                 this.expansionIndex++;

                let baseDictionData = this.$store.state.queryBaseDictionData;
                let edgeBasePro = baseDictionData.edgePro;
                let selectEdgePro = _.filter(_this.edgePro, function (edge) {
                  if (_.includes(_this.formItem.relationType, edge.label)) {
                    return edge
                  }
                });
                let staticEdgeLabel = _.join(_.map(_.filter(selectEdgePro, function(e){return !e.dyFlag && !e.multi}), 'label'), ',');
                let staticMutilEdgeLabel = _.join(_.map(_.filter(selectEdgePro, function(e){return !e.dyFlag && e.multi}), 'label'), ',');
                let moveEdgeLabel = _.join(_.map(_.filter(selectEdgePro, {'dyFlag': true}), 'label'), ',');

                this.$http.request({
                  method: 'post',
                  params: {
                    staticEdgeLabel: staticEdgeLabel,
                    staticMutilEdgeLabel: staticMutilEdgeLabel,
                    moveEdgeLabel: moveEdgeLabel,
                    nodes: name,
                    nodeLabel: nodeLabel,
                    indexLabel: indexLabel,
                    startL: startTime,
                    endL: endTime,
                    labels: _.join(this.formItem.labelType, ','),
                    code: 205
                  },
                  url: URL.debug?url:URL.queryExpansionLine,
//                   url:url, //前端打包测试
                  success: (data) => {
                    if (data.code === 200) {
                      let nodesl = data.data.graphVo.nodes.length;
                      let edgesl = data.data.graphVo.edges.length;
                      if (nodesl <= 1 && edgesl === 0 ) {
                        //关闭加载动画
                        this.$store.commit("graphLoad", false);
                        this.$Message.info('没有可扩线的节点！');
                      } else {
                        _this.expansionData = data.data;
                        _.each(_this.expansionData.graphVo.nodes, function (node) {
                          node.data.flag = 1
                        });
                        Operation.expandLine(_this.expansionData, cy);
                        //添加数据至当前model
                        currentGraphModel.data.nodes = cy.json().elements.nodes;
                        currentGraphModel.data.edges = cy.json().elements.edges;
                        currentGraphModel.statisticsList = _.flatten([currentGraphModel.statisticsList, data.data.statisticsListStr]);
                        this.$store.commit('setCurrentGraphModel', currentGraphModel);
                        //关闭加载动画
                        this.$store.commit("graphLoad", false);
                        //图有变化切换任务弹出是否保存快照提示框
                        this.$store.commit("setSnapshotConfirm", true);

                        this.closeModal();
                        this.$Message.success('扩线完成！');
                        //未保存显示任务星号
                        // let taskStarId = currentGraphModel.taskModel.taskStarId;
                        // if(taskStarId && document.getElementById(taskStarId)) {
                        //   document.getElementById(taskStarId).style.visibility = 'visible';
                        // }
                      }
                      //刷新节点树
                      this.$store.commit("showStatisticsAndAnalyzeCon", true);
                    }else {
                      this.$store.commit("graphLoad", false);
                      this.$Message.warning('扩线失败！');
                    }
                  },
                  error: (data) => {
                    this.$store.commit("graphLoad", false);
                    this.$Message.warning('扩线失败！');
                  }
                });
              }
            })

          },

          setLabelParams: function (edgeBasePro, _this, moveEdgeLabel, staticEdgeLabel) {
            _.each(edgeBasePro, function (edgeBp) {
              _.each(_this.edgePro, function (edgeSe) {
                if (edgeBp.label === edgeSe.label) {
                  if (edgeBp.dyFlag) {
                    moveEdgeLabel.push(edgeSe.label)
                  } else {
                    staticEdgeLabel.push(edgeSe.label)
                  }
                }
              })
            })
          },

          //清空重置数据
          resetData(){
            this.formItem.labelType = [];
            this.formItem.relationType = [];
            this.formItem.contactFrequency ="";
          },

        },


    }
</script>

<style scoped>

</style>
