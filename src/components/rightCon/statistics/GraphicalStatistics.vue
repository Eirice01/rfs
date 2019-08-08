<template>
  <div id="graphical-statistics">
    <div v-if="isShowOverallInfo" id="overall-info">
      <div class="statistics-info">
        <Row>
          <Carousel v-model="value"  dots="outside" trigger="click" arrow="never">
            <CarouselItem>
                <div id="statistics-max-contact" class="statistics-liquidFillInfo" title="查看最多关联边数的节点" @click="selectMaxNode" style="width: 100px;float: left;"></div>
                <div id="statistics-min-contact" class="statistics-liquidFillInfo" title="查看最少关联边数的节点" @click="selectMinNode" style="width: 100px;float: left;"></div>
                <div id="statistics-all-groups" class="statistics-liquidFillInfo" style="width: 100px;float: left;"></div>
            </CarouselItem>
            <CarouselItem >
                <div id="statistics-densityData-contact" class="statistics-liquidFillInfo" title="连通密度" style="width: 100px;float: left;"></div>
                <div id="statistics-cCoffCountData-contact" class="statistics-liquidFillInfo" title="聚类系数" style="width: 100px;float: left;"></div>
            </CarouselItem>
          </Carousel>
        </Row>
      </div>
    </div>
    <div v-if="isShowGroupInfo" id="group-info">
      <div class="statistics-info">
        <Row>
          <Col span="8">
          <div id="statistics-average-contact-time" class="statistics-liquidFillInfo"></div>
          </Col>
          <Col span="8">
          <div id="statistics-intimacy" class="statistics-liquidFillInfo"></div>
          </Col>
          <Col span="8">
          <div id="statistics-stability" class="statistics-liquidFillInfo"></div>
          </Col>
        </Row>
      </div>
    </div>
    <div v-if="isShowSingleInfo" id="single-info">
      <div class="statistics-info">
        <ul style="list-style: none">
          <li class="single-info-container" style="width: calc(100% - 22px);">
            <div :title="currentNode.type + '：' + currentNode.name">
              <label class="pre-title">{{currentNode.type}}：</label>
              <span class="next-content" style="width: 220px">{{currentNode.name}}</span>
            </div>
          </li>
          <li v-for="(item,index) in labelInfo" class="single-info-container">
            <div :title="item.dicName + '：' + item.dicVal">
              <label class="pre-title">{{item.dicName}}：</label>
              <span class="next-content">{{item.dicVal}}</span>
            </div>
          </li>
          <li v-for="item in staticProperties" class="single-info-container" style="width: calc(100% - 22px);">
            <div :title="item.dicName + '：' + item.dicVal">
              <label class="pre-title" style="max-width: 105px">{{item.dicName}}：</label>
              <span class="next-content" style="width: 185px">{{item.dicVal}}</span>
            </div>
          </li>
          <li v-for="(item) in entityInfo" class="single-info-container" style="width: calc(100% - 22px);">
            <div :title="item.dicName + '：' + item.dicVal">
              <label class="pre-title" style="max-width: 105px">{{item.dicName}}：</label>
              <span class="next-content" style="width: 185px">{{item.dicVal}}</span>
            </div>
          </li>
          <li class="single-info-container" style="width: calc(100% - 22px);"  v-if="signLabel.length!==0">
            <div :title="'标记信息:' + signLabel.join(',')">
              <label class="pre-title">标记信息：</label>
              <span  class="next-content" style="width: 220px">{{signLabel.join(", ")}}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import 'echarts-liquidfill'

  export default {
    name: "graphical-statistics",
    data() {
      return {
        value: 0,
        isShowOverallInfo: true,
        isShowGroupInfo: false,
        isShowSingleInfo: false,
        currentNode: {
          name: '',
          type: '',
          degree: '',
          betweenness: '',
          closeness: '',
          eccentricDistance: '',
          pageRank: ''
        },
        labelInfo:[],
        signLabel:[],
        entityInfo:[],
        staticProperties:[],
        maxContact:0,
        minContact:0,
        // 连通密度
        densityData: 0,
        // 聚类系数
        cCoffCountData: 0,
      }
    },
    props: ["selectNode"],
    create() {

    },
    mounted(){
      this.initOverallInfo();
    },
    methods: {
      initOverallInfo() {
        this.isShowOverallInfo = true;
        this.isShowGroupInfo = false;
        this.isShowSingleInfo = false;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let edges = currentGraphModel.data.edges;
        //对象联系个数
        let edgeCount = _.map(cy.nodes(), function(node){
          return node.connectedEdges().length
        });
        this.maxContact = _.isEmpty(edges) ? 0 : _.max(edgeCount);
        this.minContact = _.isEmpty(edges) ? 0 : _.min(edgeCount);

        let groupBase = _.groupBy(currentGraphModel.data.nodes,function (node) {
          // 默认group给的-1
          if(node.data.group >=0){
            return node.data.group;
          }
        });
        let groupNumList = [];
        _.each(groupBase, function (value, key) {
          if(key !== 'undefined'){
            groupNumList.push(key)
          }
        });
        // 团体总数
        let groupsCount = groupNumList.length;
        // 计算密度  --  2*总边数/(总点数*(总点数+1))
        let nodesLength = cy.nodes().length;
        let edgesLength = cy.edges().length;
        this.densityData = Math.floor((2*edgesLength/(nodesLength*(nodesLength+1)))*1000)/10;
        if(isNaN(this.densityData)){
          this.densityData = 0;
        }
        // console.log(this.densityData);

        // 计算聚类系数
        let cCoffCount = currentGraphModel.data.cCoffCount;  // 获取总的聚类系数
        this.cCoffCountData = (cCoffCount/nodesLength).toFixed(2);
        if(isNaN(this.cCoffCountData)){
          this.cCoffCountData = 0;
        }
        // console.log(this.cCoffCountData);

        this.$nextTick(function () {
          this.initLiquidFillInfo('statistics-max-contact', -1, this.maxContact + '/次', '最多关联边数', '#9e4be1');
          this.initLiquidFillInfo('statistics-min-contact', -1, this.minContact + '/次', '最少关联边数', '#1aa167');
          this.initLiquidFillInfo('statistics-all-groups', -1, groupsCount + '/个', '团体总数', '#bf942b');
          this.initLiquidFillInfo('statistics-densityData-contact', this.densityData/100, this.densityData + '%', '连通密度', '#28D8E1');
          this.initLiquidFillInfo('statistics-cCoffCountData-contact', -1,this.cCoffCountData + '' , '聚类系数', '#E1DF27');
        });
      },

      initGroupInfo(groupData) {
        let _this = this;
        this.isShowOverallInfo = false;
        this.isShowGroupInfo = true;
        this.isShowSingleInfo = false;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        //合并分组显示团体信息
        let totalTimes = 0,num = 0,groupOutsideNode=0,groupInsideEdge=0;
        if(groupData.group.order === 12) {
          let groups = currentGraphModel.data.groups;
          let mergeGroupId = _.split(groupData.group.groupId, ',');
          _.each(mergeGroupId, function (groupId) {
            let findGroup =  _.find(groups, function (group) {
              //字符串和数字相等
              return group.groupId == groupId;
            });
            if(!_.isEmpty(findGroup)){
              totalTimes += findGroup.totalTimes;
              num += findGroup.num;
              groupOutsideNode += findGroup.groupOutsideNode;
              groupInsideEdge += findGroup.groupInsideEdge;
            }

          })

        }else {
          totalTimes = groupData.group.totalTimes;
          num = groupData.group.num;
          groupOutsideNode = groupData.group.groupOutsideNode > 0 ? groupData.group.groupOutsideNode : 0 ;
          groupInsideEdge = groupData.group.groupInsideEdge;
        }
         //平均关联次数: 通联总次数/总人数
        let averageContactTime = Math.floor(totalTimes/ num) +　'/次';

        //亲密度: 团体内部边数/(团体的点数*(团体的点数-1)/2)
        let intimacy = Math.floor(groupInsideEdge / (num * ( num - 1)/2)*1000)/ 10;

        //稳固度: 团体内部人数/团体的外部人数
        let stability = Math.floor((num /(groupOutsideNode + num)) * 1000)/10;

        this.$nextTick(function () {
          _this.initLiquidFillInfo('statistics-average-contact-time', -1, averageContactTime, '平均关联次数', '#9e4be1');
          _this.initLiquidFillInfo('statistics-intimacy', intimacy/100, intimacy +'%'　, '亲密度', '#1aa167');
          _this.initLiquidFillInfo('statistics-stability', stability/100, stability +'%', '稳固度', '#bf942b');
        })
      },

      initSingleInfo(selectNode) {
        let _this = this;
        this.isShowOverallInfo = false;
        this.isShowGroupInfo = false;
        this.isShowSingleInfo = true;
        this.currentNode.name = selectNode.name;
        let nodeProBase = this.$store.state.queryBaseDictionData.nodePro;
        let nodePro = _.find(nodeProBase, {'label': selectNode.type});
        this.currentNode.type = _.isEmpty(nodePro) ? '' : nodePro.indexName;
        this.labelInfo =[];
        let  baseDictionData = this.$store.state.dictionDataAll;
        if(selectNode.labels!=undefined){
          Object.keys(selectNode.labels).forEach((item,index)=>{
            var t = _.find(baseDictionData,['dicCode',item]);
            if(!_.isEmpty(t)&&t.dicCode!="00000"){
              this.labelInfo.push({
                'dicName':t.dicName,
                'dicVal':selectNode.labels[t.dicCode]
              })
            }
          })
        }
        let labelsData = this.$store.state.currentResultDefinedLabel;
        let  labelData =  _.filter(labelsData, ['nodeId', selectNode.name]);
        let labelLst = [];
        this.signLabel =[];
        if(!_.isEmpty(labelData)){
          labelLst = labelData[0].labels
        }
        if( !_.isEmpty(labelLst)){
          labelLst.forEach((item,index)=>{
            this.signLabel.push(item.labelName)
          })
        }
        this.entityInfo = [];
        _.each(selectNode.entityLabels, function (entityLabel, entityType) {
          let entityPro = _.find(nodeProBase, {'label': entityType});
          if(!_.isEmpty(entityLabel)){
            _this.entityInfo.push({
              dicName: _.isEmpty(entityPro) ? entityType : entityPro.name,
              // dicVal: _.join(entityLabel, ',')
              dicVal: entityLabel
            })
          }
        });
        this.staticProperties = [];
        _.each(selectNode.properties, function (value, name) {
          _this.staticProperties.push({
            dicName: _.isEmpty(nodePro.proList[name]) ? name : nodePro.proList[name],
            dicVal: value
          })
        });
      },
      selectMaxNode(){
        let _this = this;
        _this.selectNodeD(this.maxContact);
      },
      selectMinNode(){
        let _this = this;
        _this.selectNodeD(this.minContact);
      },
      //选中和定位最大最小点
     selectNodeD(num){
       if(num === 0 )
         return;
       let currentGraphModel = this.$store.state.currentGraphModel;
       let cy = currentGraphModel.cy;
       let cyCollection=cy.nodes().filter(function (ele) {
         if( !ele.hidden() &&  ele._private.edges.length=== num  )
           return ele
       });
       if(cyCollection.length>0 ){
         cy.$(cy.nodes()).unselect();
         //取消右侧分析-->选中标签的高亮
         $(".f-cspaH").removeClass("f-cspaH");
         $(".f-cspCusH").removeClass("f-cspCusH");
         cy.zoom(1);
         cy.center(cyCollection);
         cyCollection.select();
       }else{
         this.$Message.warning('该点已隐藏！');
       }
     },
      initLiquidFillInfo (id, data, formatter, text, backgroundColor){
        if(_.isEmpty(document.getElementById(id))){
          return false;
        }
        let char =  this.$echarts.init(document.getElementById(id));
        let option = {
          title:[{
            text: text,
            textAlign: 'center',
            top: '28%',
            left: '45%',
            textStyle: {
              fontWeight: 'normal',
              color: '#FFF',
              fontSize: '11',
              textAlign: 'center'
            }
          }],
          series: [{
            type: 'liquidFill',
            data: [data],
            color: [backgroundColor],
            radius: '78%',
            shape: 'roundRect',
            backgroundStyle:{
              color: backgroundColor
            },
            outline: {
              borderDistance:0,
              itemStyle: {
                borderWidth: 0,
                borderColor: '#2ec7c9',
                shadowBlur: 0,
                shadowColor: 'rgba(255, 0, 0, 1)'
              }

            },
            label: {
              normal: {
                position: ['50%','65%'],
                fontWeight: 'normal',
                formatter: formatter,
                color: '#FFF',
                fontSize: 14,
              }
            }
          }],
        };
        window.addEventListener("resize", function () {
          char.resize();
        });
        char.setOption(option);
      },
    }

  }
</script>

<style scoped>
  #graphical-statistics .span-text {
    margin: 5px auto;
    display: inline-block;
    text-align: center;
    width: 92px;
  }

  /*#graphical-statistics .statistics-info {*/
    /*margin: 5px 0 10px 0;*/
  /*}*/

  .statistics-liquidFillInfo{
    height: 100px;
    weight: 100px;
    padding: 2px;
  }

  #graphical-statistics .single-info-container {
    width: calc(50% - 22px);
    margin: 4px 10px;
    display: inline-block;
    /*text-overflow: ellipsis;*/
    /*overflow: hidden;*/
    /*vertical-align: middle;*/
    white-space: nowrap;
  }
  #graphical-statistics .sign-info-container {
    margin: 4px 10px;
  }

  #graphical-statistics  #single-info{
    width: 95%;
    border: 1px #686db5 dashed;
    margin: 8px;
    border-radius: 5px;
  }
  .pre-title{

    max-width:65px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    vertical-align: middle;
  }
  .next-content{
    display: inline-block;
    vertical-align: middle;
    width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
