<template>
  <div id="mergeNode">
    <Modal v-model="getMergeNodeModalState" title="合并节点" :styles="{top: '160px',width: '650px'}">
      <!-- :label-width="110"  -->
      <Form ref="formItem">
        <!-- label="请选择合并为：" -->
        <FormItem >
          <RadioGroup v-model="defaultId">
            <div v-for="(item,index) in getMergeIdList" style="display: inline-block;float: left;width: 300px;margin: 0px 4px;">
              <div>
                <div>
                  <li v-for="(itemNode,index) in item.currentNode">
                    <Radio :label="itemNode.name" :key="index">{{itemNode.name}}</Radio>
                  </li>
                </div>
                <div style="background-color: #1f2663;">
                  <ul style="list-style: none">
                    <li v-for="(itemLabel,index) in item.labelInfo" class="single-info-container" style="width: calc(100% - 170px);display: inline-block;margin-left: 10px;">
                      <div :title="itemLabel.dicName + '：' + itemLabel.dicVal">
                        <div :class="itemLabel.isEqual ? 'setColorRed' : 'setColorWhite'">
                          <label class="pre-title" >{{itemLabel.dicName}}：</label>
                          <span class="next-content">{{itemLabel.dicVal}}</span>
                        </div>
                      </div>
                    </li>
                    <li v-for="(itemStatic,index) in item.staticProperties" style="width: calc(100% - 10px);margin-left: 10px;">
                      <div :title="itemStatic.dicName + '：' + itemStatic.dicVal">
                        <div :class="itemStatic.isEqual ? 'setColorRed' : ''">
                          <label>{{itemStatic.dicName}}：</label>
                          <span>{{itemStatic.dicVal}}</span>
                        </div>
                      </div>
                    </li>
                    <li v-for="(itemEntity,index) in item.entityInfo" class="single-info-container" style="width: calc(100% - 10px);margin-left: 10px;">
                      <div :title="itemEntity.dicName + '：' + itemEntity.dicVal">
                        <div :class="itemEntity.isEqual ? 'setColorRed' : ''">
                          <label>{{itemEntity.dicName}}：</label>
                          <span>{{itemEntity.dicVal}}</span>
                        </div>
                      </div>
                    </li>
                    <li class="single-info-container" v-if="item.signLabel.length!==0" style="width: calc(100% - 10px);margin-left: 10px;">
                      <div :title="'标记信息:' ">
                        <label class="pre-title">标记信息：</label>
                        <span v-for="(itemSign,index) in item.signLabel" :class="itemSign.isEqual ? 'setColorRed' : ''">
                          {{ index==item.signLabel.length-1 ? itemSign.dicName : itemSign.dicName +","}}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </RadioGroup>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelMergeNode">取消</Button>
        <Button type="default" @click="okMergeNode">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>

    import Divider from "iview/src/components/divider/divider";

    export default {
      components: {Divider},
      name: "merge-node",
        data() {
          return {
            defaultId:"",
            secondId:"",
            // itemInfo: {
            //   currentNode: {
            //     name: '',
            //     type: '',
            //     degree: '',
            //     betweenness: '',
            //     closeness: '',
            //     eccentricDistance: '',
            //     pageRank: ''
            //   },
            //   labelInfo:[],
            //   signLabel:[],
            //   entityInfo:[],
            //   staticProperties:[],
            // },
            itemInfoList: [],
          }
        },
        created() {

        },
        computed:{
          getMergeNodeModalState:{
            get:function () {
              if(this.$store.state.isMergeNode){
                this.initNodeInfomation();
              }
              return this.$store.state.isMergeNode;
            },
            set:function () {
              this.$store.commit("showMergeNodeModal");
            }
          },
          getMergeIdList:function () {
            return this.$store.state.mergeNodeIdList;
          }
        },
        inject:[
          "changeRightConTabValue",
          "statisticsObjectAccount"
        ],
        mounted() {
        },
        methods: {
          // 封装数据
          initNodeInfomation(){
            let _this = this;
            for(let i=0;i<_this.getMergeIdList.length;i+=2){
              // 处理号码
              if(_this.getMergeIdList[i].currentNode.name == _this.getMergeIdList[i+1].currentNode.name){
                _this.getMergeIdList[i].currentNode.isEqual = true;
                _this.getMergeIdList[i+1].currentNode.isEqual = true;
              }
              // 处理标签
              _this.getMergeIdList[i].labelInfo.forEach(function (index, value){
                _this.getMergeIdList[i+1].labelInfo.forEach(function (index1,value1) {
                  if(index.dicName == index1.dicName && index.dicVal == index1.dicVal){
                    index.isEqual = true;
                    index1.isEqual = true;
                  }
                });
              });
              // 处理staticProperties信息
              _this.getMergeIdList[i].staticProperties.forEach(function (value, index) {
                _this.getMergeIdList[i+1].staticProperties.forEach(function (value1, index1) {
                  if(value.dicName == value1.dicName && value.dicVal == value1.dicVal){
                    value.isEqual = true;
                    value1.isEqual = true;
                  }
                });
              });
              // 处理实体信息
              _this.getMergeIdList[i].entityInfo.forEach(function (value, index) {
                _this.getMergeIdList[i+1].entityInfo.forEach(function (value1, index1) {
                  if(value.dicName == value1.dicName && value.dicVal == value1.dicVal){
                    value.isEqual = true;
                    value1.isEqual = true;
                  }
                });
              });
              // 处理自定义标记信息
              _this.getMergeIdList[i].signLabel.forEach(function (value, index) {
                _this.getMergeIdList[i+1].signLabel.forEach(function (value1, index1) {
                  if(value.dicName == value1.dicName && value.dicVal == value1.dicVal){
                    value.isEqual = true;
                    value1.isEqual = true;
                  }
                });
              });
            }
            // console.log(_this.getMergeIdList);
          },
          // 取消节点合并
          cancelMergeNode() {
            this.defaultId = "";
            this.getMergeIdList = [];
            this.$store.commit("showMergeNodeModal",false);
          },
          //合并
          mergeNode(){
            var _this = this;
            let currentGraphModel = this.$store.state.currentGraphModel;
            let cy = currentGraphModel.cy;
            this.getMergeIdList.forEach(function (value){
              if(value.currentNode[0].name != _this.defaultId){
                _this.secondId = value.currentNode[0].name;
              }
            });
            //未选择为合并中心的点
            let anotherTarget = cy.nodes().filter(function (ele) {
              if(ele.data().name == _this.secondId){
                return ele;
              }
            });
            //选择为合并中心的点
            var firstNode = cy.nodes().filter(function (ele) {
              if(ele.data().name == _this.defaultId){
                return ele;
              }
            });
            var defaultId = firstNode.id();
            var secondId  = anotherTarget.id();
            //选择点的所有线
            this.firstNodeEdges = firstNode.connectedEdges();
            //未选择的点的所有线
            this.relationEdge = anotherTarget.connectedEdges();

            //存储合并之前的边和线的数据
            var anotherTargetData = cy.nodes(anotherTarget).json().data;
            var position = cy.nodes(anotherTarget).json().position;
            var mergeBeforeNode = {
              group:"nodes",
              data:anotherTargetData,
              position:position
            };
            var relateEdgeArr = [];
            this.relationEdge.forEach(function (value) {
              relateEdgeArr.push(cy.edges(value).json().data);
            });
            //合并节点之前的边  删掉的点  加上去的边   mergeBeforeEdges mergeBeforeNode  mergeAfterAddEdges
            this.$store.commit("mergeBeforeEdges",relateEdgeArr);
            this.$store.commit("mergeBeforeNode",mergeBeforeNode);

            this.addData  = [];
            this.relationEdge.forEach(function (value) {
              if (value._private.data.target === secondId) {
                value._private.data.target = defaultId;
              } else if(value._private.data.source === secondId) {
                value._private.data.source = defaultId;
              }
              //去掉source和target一样的边
              if (value._private.data.target !== value._private.data.source) {
                _this.addData.push({
                  group:"edges",
                  data:value._private.data
                });
              }
            });

            let removeNode = cy.getElementById(secondId);

            //去掉与选择点已有重复的边(target source相同或相反)
            this.addData = _.reject(this.addData , function (addEdge) {
              return _.find(_this.firstNodeEdges, function (edge) {
                if (addEdge.data.type === edge.data('type') &&
                  ((addEdge.data.source === edge.data('source') && addEdge.data.target === edge.data('target'))
                   || (addEdge.data.source === edge.data('target') && addEdge.data.target === edge.data('source')))
                //   (addEdge.data.type === edge.data('type')
                //   && addEdge.data.source === edge.data('source')
                //   && addEdge.data.target === edge.data('target'))
                // || (addEdge.data.type === edge.data('type') && (edge.data('source')    ))
                ) {
                  return addEdge
                }
              })
            });

            //取出添加边的ID
            let addDataId = _.map(this.addData, function (edge) {
              return edge.data.id
            });
            this.$store.commit("mergeAfterAddEdges",addDataId);

            cy.remove(removeNode);
            cy.add({edges: this.addData});

            currentGraphModel.ur.do("remove",removeNode);
            this.$store.state.currentGraphModel.data.nodes = cy.json().elements.nodes;
            this.$store.state.currentGraphModel.data.edges = cy.json().elements.edges;
            this.$store.commit("setRightConTabName", "statistics");
            this.$store.commit("showStatisticsAndAnalyzeCon", true);
            this.$store.commit("showMergeNodeModal",false);
            // var nodes = this.$store.state.currentGraphModel.data.nodes;
            // var edges = this.$store.state.currentGraphModel.data.edges;
            /*setTimeout(function (){
              _this.statisticsObjectAccount(nodes,edges);
            },20);*/
          },
          //撤销
          cancelMerge(){
            let _this = this;
            let currentGraphModel = this.$store.state.currentGraphModel;
            let cy = currentGraphModel.cy;
            let mergeBeforeEdges = this.$store.state.mergeBeforeEdges;
            let mergeBeforeNode = this.$store.state.mergeBeforeNode;
            let mergeAfterAddEdges = this.$store.state.mergeAfterAddEdges;
            //删除合并之后的节点，增加合并之前的点和点有关的线
            mergeAfterAddEdges.forEach(function (value) {
              cy.getElementById(value).remove();
            });
            cy.add(mergeBeforeNode);
            mergeBeforeEdges.forEach(function (value) {
              var obj = {
                group:"edges",
                data:value
              };
              cy.add(obj);
            });

            var nodes = this.$store.state.currentGraphModel.data.nodes;
            var edges = this.$store.state.currentGraphModel.data.edges;
          /*  setTimeout(function () {
              _this.statisticsObjectAccount(nodes,edges);
            },20);*/
          },

          // 确定合并节点
          okMergeNode() {
            let _this = this;
            this.$store.commit("showStatisticsAndAnalyzeCon", false);
            if(this.defaultId !== ""){
              let currentGraphModel = this.$store.state.currentGraphModel;
              let cy = currentGraphModel.cy;
              let ur = currentGraphModel.ur;
              //合并和撤销方法
              setTimeout(function () {
                ur.action('mergeOperation', _this.mergeNode, _this.cancelMerge);
                ur.do("mergeOperation");
                _this.$store.commit("setSnapshotConfirm",true);//合并成功后图发生变化，设置true
              },1);
            }else {
              this.$Message.warning('请至少选择一个点！');
            }
          }
        }
    }
</script>

<style scoped>
#mergeNode .single-info-container {
  width: calc(50% - 22px);
  margin: 4px 10px;
  display: inline-block;
  /*text-overflow: ellipsis;*/
  /*overflow: hidden;*/
  /*vertical-align: middle;*/
  white-space: nowrap;
}
 .pre-title{
  max-width:60px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}
 .next-content{
  display: inline-block;
  vertical-align: middle;
  max-width: 65px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
  .setColorRed{
    font-size: 13px;
    font-weight: 500;
    color: #a71d5d;
  }
  .setColorWhite{
    color: white;
  }
</style>

