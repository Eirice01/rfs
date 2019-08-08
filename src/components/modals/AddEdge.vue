<template>
  <div id="addEdge">
    <Modal v-model="getAddEdgeModalState" title="新增关系" :mask-closable="false" :closable="false" :styles="{top: '160px'}">
      <Form ref="formItem" :label-width="110">
        <FormItem label="关系类型：">
          <Select v-model="edgeType">
            <Option v-for="(item,index) in edgePro" :value="item.label" :key="index">{{item.name}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelAddEdge">取消</Button>
        <Button type="default" @click="okAddEdge">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
  export default {
    name: "add-edge",
    data() {
      return {
        isAddEdge: false,
        edgeType: '',
        edgePro: []
      }

    },
    created() {
    },
    computed:{
      getAddEdgeModalState: function () {
        if (this.$store.state.isAddEdgeModal) {
          this.initEdgePro();
        }
        return this.$store.state.isAddEdgeModal
      },

    },
    mounted() {

    },

    methods: {
      initEdgePro() {
        let baseDictionData = this.$store.state.queryBaseDictionData;
        this.edgePro = baseDictionData.edgePro;
        this.initEdgeType();
      },

      cancelAddEdge() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let edgeData = this.$store.state.addEdgeData;
        cy.edges("[id='" + edgeData.id + "']").remove();
        this.$store.commit("showAddEdgeModal",false);
        this.edgeType = '';
      },

      okAddEdge() {
        if(_.isEmpty(this.edgeType)){
          this.$Message.warning('没有可添加的关系类型');
          return false
        }

        let edgeData = this.$store.state.addEdgeData;
        edgeData.type = this.edgeType;
        let addEdge = {data: edgeData};
        let currentGraphModel = this.$store.state.currentGraphModel;
        this.$store.commit("showStatisticsAndAnalyzeCon", false);
        setTimeout(() => {
          currentGraphModel.data.edges = _.flatten([addEdge, currentGraphModel.data.edges]);
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
        }, 10);
        this.$store.commit("showAddEdgeModal",false);
        this.edgeType = '';
        this.$store.commit("setSnapshotConfirm",true);//添加关系成功，切换任务时需要弹出是否保存快照提示框
      },

      initEdgeType(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let edgeData = this.$store.state.addEdgeData;
        let existingEdges = _.filter(cy.edges(), function (edge) {
          if((edge.data('source') === edgeData.source && edge.data('target') === edgeData.target)
            || (edge.data('source') === edgeData.target && edge.data('target') === edgeData.source)){
            return edge;
          }
        });
        //去除两个点已存在的关系
        this.edgePro = _.reject(this.edgePro, function (edgePro) {
          return _.find(existingEdges, function (existingEdge) {
            if(edgePro.label === existingEdge.data('type')){
              return edgePro;
            }
          })
        });
        if(_.isEmpty(this.edgePro)){
          this.$Message.warning('没有可添加的关系类型');
          this.cancelAddEdge();
          return false;
        }
        this.edgeType = this.edgePro[0].label;
      }
    },

  }
</script>

<style scoped>

</style>
