<template>
  <div id="relation-analyze" style="position: relative;width:100%;height:100%">
    <div id="ra-container" style="width:100%; height:100%">
    </div>
    <div style="position: absolute;top: 1px;left: 30px;color: #9bb6f3;">
      <i-switch v-model="isShowBuoy" :title="isShowBuoy ? '隐藏浮标':'显示浮标'" @on-change="changeSwitch" size="small"/>
    </div>
  </div>
</template>

<script>

  import * as SelectManage from "../../pages/graph/js/selectManage"
  import ISwitch from "iview/src/components/switch/switch";

  export default {
    components: {ISwitch},
    name: "relation-analyze",
    data() {
      return{
        myChart:null,
        //浮标开关
        isShowBuoy: true,
        //浮标动画定时
        relationAnalyzeTimer: null,
        time:"",
      }
    },
    created() {

    },
    mounted() {
     
    },
    methods: {
      initData() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let statisticsList = currentGraphModel.statisticsList;
        if (!_.isEmpty(statisticsList)) {
          this.initmyChart(statisticsList, cy)
        }
      },

      //初始化折线图
      initmyChart(statisticsList, cy) {
        let _this = this;
        this.myChart = this.$echarts.init(document.getElementById('ra-container'));

        //取出所有的时间
        let xAxisData = _.map(statisticsList, 'time');

        let baseDictionData = this.$store.state.queryBaseDictionData;
        //获取所有的关系类型
        let edgeTypeList = _.uniq(_.map(_.flatten(_.map(statisticsList, 'timeSonList')), 'key'));
        //翻译关系类型
        let edgeProList = _.filter(baseDictionData.edgePro, function (pro) {
          if (_.includes(edgeTypeList, pro.label)) {
            return pro
          }
        });

        let legendData = _.map(edgeProList, 'name');
        let seriesData = this.getSeriesData(statisticsList, edgeProList);
        let colors = ["#39c87f", "#da4373", "#5EBEFC", "#2EF7F3", "#ff62a1", "#8D6E63", '#8BC34A', '#FF7043', '#7B1FA2', '#26C6DA', '#CDDC39',];
        let option = {
          // backgroundColor: '#10143f',
          legend: {
            show: true,
            left: "right",
            data: _.map(edgeProList, 'name'),
            y: "0",
            itemWidth: 18,
            itemHeight: 12,
            textStyle:
              {
                color: "#fff",
                fontSize: 10
              },
          },
          color: colors,
          grid: {left: '2%', top: "15%", bottom: "20", right: "2%", containLabel: true},
          tooltip: {trigger: 'item', axisPointer: {type: 'shadow'}},
          dataZoom: [{
            show: true,
            height: 20,
            bottom: 5,
            start: 0,
            end: 50,
            textStyle: {color: "#fff"},
            borderColor: '#90979c'
          }],
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              axisLine: {show: true, lineStyle: {color: '#6173A3'}},
              axisLabel: {interval: 0, rotate: 40, textStyle: {color: '#9ea7c4', fontSize: 10}},
              // axisTick : {show: false},
              splitLine: {show: true, lineStyle: {color: '#6173A3'}},
              data: xAxisData,
            },
          ],
          yAxis: [
            {
              // axisTick : {show: true},
              splitLine: {show: false, lineStyle: {color: '#6173A3'}},
              axisLabel: {textStyle: {color: '#9ea7c4', fontSize: 10}},
              axisLine: {show: true, lineStyle: {color: '#6173A3'}},
            },
          ],
          series: seriesData
        };
        this.myChart.setOption(option);
        this.myChart.on('click', function (item) {
          this.time = item.data.time;
          if (!_.isEmpty(this.time)) {
            //打开浮标开关
            _this.isShowBuoy = true;
            _this.heightLightGraphEle(this.time, cy);
          }
        });
        this.myChart.on('mouseover', function (item) {
          let time = item.data.time;
          if (!_.isEmpty(time)) {
            _this.selectGraphEle(time, cy);
          }
        });
        this.myChart.on('mouseout', function () {
          cy.$(cy.elements()).unselect();
        })
        window.resize = () => {
          this.myChart.resize();
        }
      },

      //组装折线图数据
      getSeriesData(statisticsList, edgeProList) {
        let seriesData = [];

        //取出所有时间包含的关系对象
        let timeSonList = _.flatten(_.map(statisticsList, 'timeSonList'));

        //组装
        _.each(edgeProList, function (edgePro) {
          let data = [];
          _.each(timeSonList, function (time) {
            if (time.key === edgePro.label) {
              let name = ' ';
              let value = _.sumBy(time.edgeStatisticsList, 'count');
              //根据联系次数降序
              let descEdgeStatisticsList = _.orderBy(time.edgeStatisticsList, 'count', 'desc');
              //取出排名前三次数的悬浮显示
              if(descEdgeStatisticsList.length > 3){
                descEdgeStatisticsList = _.take(descEdgeStatisticsList, 3)
              }
              _.each(descEdgeStatisticsList, function (edgeStatistics) {
                name += edgeStatistics.sourceName + '-' + edgeStatistics.targetName + '(' + edgeStatistics.count + '次)； '
              });
              name += '总数';
              data.push(
                {
                  value: value,
                  name: name,
                  time: time,
                });
            }
          });
          let series = {
            name: edgePro.name,
            type: 'line',
            symbol: "circle",
            symbolSize: 10,
            data: data,
            tooltip: {
              textStyle: {
                formatter: '{b0}:{c1}</br> {b1}:{c2}',
                width: '300px',
                height: '500px',
                overflowY: 'auto',
                fontSize: 10
              }
            }
          };
          seriesData.push(series)
        });
        return seriesData;
      },

      //悬浮选中图上对象和关系
      selectGraphEle(time, cy) {
        //取出所有关系包含对象的source和target的ID
        let ret = this.getSelectEle(time, cy);
        let selectNodes = ret.selectNodes;
        let selectEdges = ret.selectEdges;
        cy.$(cy.elements()).unselect();
        selectNodes.select();
        selectEdges.select();
      },

      //点击置灰图上不符合当前日期的对象和关系
      heightLightGraphEle(time, cy) {
        clearInterval(this.relationAnalyzeTimer);
        //移除所有置灰
        cy.nodes().removeClass("b-nodehightlight");
        cy.nodes().removeClass("a-nodehightlight");
        cy.edges().removeClass("b-edgehightlight");
        cy.edges().removeClass("a-edgehightlight");
        // cy.$(cy.elements()).unselect();
        let ret = this.getSelectEle(time, cy);
        let selectNodes = ret.selectNodes;
        let selectEdges = ret.selectEdges;
        let themeType = this.$store.state.themeType;
        let unCollectionNodes = cy.nodes().difference(selectNodes);//反选其他组的节点
        let unCollectionEdges = cy.edges().difference(selectEdges);//反选其他组的线
        if (!_.isEmpty(unCollectionNodes)) {
          if ('b' === themeType) {
            unCollectionNodes.addClass("b-nodehightlight");//非当前分组的点进行置灰
          } else {
            unCollectionNodes.addClass("a-nodehightlight");//非当前分组的点进行置灰
          }
        }
        if (!_.isEmpty(unCollectionEdges)) {
          if ('b' === themeType) {
            unCollectionEdges.addClass("b-edgehightlight");//非当前分组的线进行置灰
          } else {
            unCollectionEdges.addClass("a-edgehightlight");//非当前分组的线进行置灰
          }
        }
        this.relationAnalyzeTimer = setInterval(function () {
          _.each(selectEdges, function (edge) {
            SelectManage.showEdgeBuoy(edge.id())
          })
        }, 1500)


      },

      getSelectEle: function (time, cy) {
        let nodeIds = _.uniq(_.flatten([_.map(time.edgeStatisticsList, 'sourceId'), _.map(time.edgeStatisticsList, 'targetId')]));
        //取出关系ID
        let edgeIds = _.uniq(_.map(time.edgeStatisticsList, 'edgeId'));
        let selectNodes = cy.nodes().filter(function (node) {
          return _.includes(nodeIds, node.id())
        });
        let selectEdges = cy.edges().filter(function (edge) {
          return _.includes(edgeIds, edge.id())
        });
        return {selectNodes: selectNodes, selectEdges: selectEdges};
      },

      //切换开关
      changeSwitch(){
        clearInterval(this.relationAnalyzeTimer);
        SelectManage.hideEdgeBuoy()
      }
    },

    beforeDestroy() {
      clearTimeout(this.relationAnalyzeTimer);
      SelectManage.hideEdgeBuoy()
    }
  }
</script>

<style scoped>

</style>
