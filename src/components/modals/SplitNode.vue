<template>
  <div id="splitNode">
    <Modal v-model="getSplitNodeModalState" title="拆分节点" :styles="{top: '160px'}" width="400">
      <Form ref="formItem" :label-width="110">
        <FormItem label="节点属性：" prop="nodeName">
          <Select v-model="nodeProperty" style="width:200px">
            <OptionGroup v-for="group in nodeTypeList" :key="group.code" :label="group.type">
              <Option v-for="item in group.value" :value="item" :key="item">{{ item }}</Option>
            </OptionGroup>
          </Select>
        </FormItem>
      </Form>
      <div slot="close" @click="cancelSplit">
        <Icon type="ios-close"></Icon>
      </div>
      <div slot="footer" >
        <Button type="text" @click="cancelSplit">取消</Button>
        <Button type="default" @click="okSplit">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import store from "../../vuex/store"
  import * as AllOperation from '../../pages/graph/js/allOperation'

  export default {
    name: "split-node",
    data() {
      return {
        nodeProperty: "",
        nodeType: "",
        nodeTypeList: []
      }
    },
    created() {

    },
    computed: {
      getSplitNodeModalState: {
        get: function () {
          if (this.$store.state.isNodeSplit) {
            this.initSplitModel()
          }
          return this.$store.state.isNodeSplit
        },
        set: function () {
          this.$store.commit("showNodeSplitModal");
        }
      },
      nodePropertyList() {
        return this.$store.state.splitNodeSelectData;
      }
    },
    mounted() {

    },
    methods: {

      initSplitModel() {
        let _this = this;
        let currentGraphModel = store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let selectedNode = cy.nodes(':selected')[0];
        let entityLabels = selectedNode.data().entityLabels;


        let baseDictionData = this.$store.state.queryBaseDictionData;
        _this.nodeTypeList = [];
        _this.nodeProperty = "";
        let nodePro = baseDictionData.nodePro;
        _.each(entityLabels, function (value, key) {
          let nodeEntity = _.find(nodePro, {'label': key});
          _this.nodeTypeList.push({
            code: key,
            type: _.isEmpty(nodeEntity) ? key : nodeEntity.name,
            value: value,
            nodeEntity: nodeEntity
          })
        })
      },
      cancelSplit() {
        this.$store.commit("showNodeSplitModal", false);
        this.nodeTypeList = [];
        this.nodeProperty = "";
      },

      okSplit() {
        const _this = this;
        let currentGraphModel = store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        if (cy.nodes("[name='" + _this.nodeProperty + "']").length > 0) {
          this.$Message.warning("该对象已经存在");
          return false;
        }


        let selectNodeType = _.find(_this.nodeTypeList, function (nodeType) {
          if (_.includes(nodeType.value, _this.nodeProperty)) {
            return nodeType;
          }
        });
        if (_.isEmpty(selectNodeType)) {
          return false;
        }
        this.$store.commit("showStatisticsAndAnalyzeCon", false);
        let nodeEntity = selectNodeType.nodeEntity;
        let staticEdgeLabel = _.join(_.map(_.filter(nodeEntity.edgeList,  function(e){return !e.dyFlag && !e.multi}), 'label'), ',');
        let staticMutilEdgeLabel = _.join(_.map(_.filter(nodeEntity.edgeList, function(e){return !e.dyFlag && e.multi}), 'label'), ',');
        let moveEdgeLabel = _.join(_.map(_.filter(nodeEntity.edgeList, {'dyFlag': true}), 'label'), ',');
        //对新拆分的点调用扩线查询接口，将其有关系的点连接起来
        this.$http.request({
          method: 'post',
          params: {
            staticEdgeLabel: staticEdgeLabel,
            staticMutilEdgeLabel: staticMutilEdgeLabel,
            moveEdgeLabel: moveEdgeLabel,
            nodes: _this.nodeProperty,
            nodeLabel: nodeEntity.label,
            indexLabel: nodeEntity.indexLabel,
            startL: "",
            endL: "",
            code: 205
          },
          url: URL.queryExpansionLine,
          success: (data) => {
            let expansionData = data.data;
            if (data.code === 200) {
              let nodesl = expansionData.graphVo.nodes.length;
              let edgesl = expansionData.graphVo.edges.length;
              _.each(expansionData.graphVo.edges, function (edge) {
                edge.data.flag = 1
              });
              _.each(expansionData.graphVo.nodes, function (node) {
                node.data.flag = 1
              });
              this.addSplitElements(expansionData.graphVo, nodeEntity, currentGraphModel);
              this.cancelSplit();
            } else {
              this.$Message.warning('拆分节点失败！');
              this.$store.commit("showStatisticsAndAnalyzeCon", true);
            }
          },
          error: (data) => {
            this.$Message.warning('拆分节点失败！');
            this.$store.commit("showStatisticsAndAnalyzeCon", true);
          }
        });
      },

      addSplitElements(data, nodeEntity, currentGraphModel) {
        let _this = this;
        let cy = currentGraphModel.cy;
        let allGraphNodes = cy.nodes();
        data.nodes = _.filter(data.nodes, function (node) {
          if (node.data.name === _this.nodeProperty && node.data.type === nodeEntity.label) {
            return node;
          }
        });
        data.edges = _.filter(data.edges, function (edge) {
          return _.find(allGraphNodes, function (node) {
            if(node.data('id') === edge.data.source || node.data('id') === edge.data.target){
              return edge
            }
          })
        });
        let newData = {nodes: data.nodes, edges: data.edges};
        currentGraphModel.ur.do("add", newData);
        // //给当前扩线点加标识
        let curNode_x = cy._private.curNode.position().x;
        let curNode_y = cy._private.curNode.position().y;
        let layout = cy.nodes('[flag=' + 1 + ']').layout({
          name: "concentric",
          fit: false,
          boundingBox: {x1: curNode_x + 100, y1: curNode_y + 100, w: 1, h: 1},
          // avoidOverlap: true
        });
        layout.run();
        cy.nodes().unselect();
        //取消右侧分析-->选中标签的高亮
        $(".f-cspaH").removeClass("f-cspaH");
        $(".f-cspCusH").removeClass("f-cspCusH");
        cy.nodes('[flag=' + 1 + ']').select();
        cy.edges('[flag=' + 1 + ']').select();

        //显示标记对号
        AllOperation.addMarkImg(cy, cy.nodes('[flag=' + 1 + ']'), data.definedLabel);
        _.each(cy.elements('[flag=' + 1 + ']'), function (ele) {
          ele.data().flag = 0
        });
        AllOperation.refreshRightCon(cy);
      },

    }
  }
</script>

<style scoped>

</style>
