<template>
  <div class="contents">
    <div id="time-analyze">
    </div>
    <div id="player" v-if="this.length" :class="!flag ? 'player':'stop'" @click="trackPlayer">
      <!--<span ></span>-->
    </div>
    <div class="stopDisable" v-if="flag" ></div>
  </div>

</template>

<script>
  import * as allOperation from '../../pages/graph/js/allOperation'

  export default {
    name: "time-analyze",
    data() {
      return{
        myChart:null,
        flag:false,
        edgeDataLst:[],
        length:0,//x轴刻度数量
        start:0,
        end:0,
        areas:[],//框选区域
        isFirst: true,
        isGuding: true
      }
    },
    created(){
    },
    mounted() {

    },
    methods: {
      initData(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let statisticsList = currentGraphModel.statisticsList;
        if (!_.isEmpty(statisticsList)) {
          // let el=$("#time-analyze canvas");
          // el.style.width=$("#time-analyze").style.width
          this.initLineChart(statisticsList,cy)
        }
      },

      initLineChart(statisticsList,cy){
        this.myChart = this.$echarts.init(document.getElementById('time-analyze'));
        //轴
        let xAxisData = _.map(statisticsList, 'time');
        this.length = xAxisData.length;

        let baseDictionData = this.$store.state.queryBaseDictionData;
        //关系类型
        let edgeTypeList = _.uniq(_.map(_.flatten(_.map(statisticsList, 'timeSonList')), 'key'));
        let edgeProList = _.filter(baseDictionData.edgePro, function (pro) {
          if (_.includes(edgeTypeList, pro.label)) {
            return pro
          }
        });
        //legend
        let legendData= _.map(edgeProList, 'name');
        let seriesData = this.getSeriesData(statisticsList,edgeProList);

        let colors = ["#39c87f", "#da4373", "#5EBEFC", "#2EF7F3", "#FFFFFF"];

        let option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {type: 'shadow'}
            },
          legend: {
            show: true,
            left: "right",
            data:legendData,
            y: "0",
            itemWidth: 18,
            itemHeight: 12,
            textStyle:
              {
                color: "#8e8e8f",
                fontSize: 10
              },
          },
          toolbox:{
            feature:{
              brush:{
                type:['lineX','clear']
              }
            },
            left:60,
            top:-7
          },
          brush:{
            xAxisIndex:'all',
            outOfBrush:{
              colorAlpha:0.1
            },
            throttleType:'debounce',
            throttleDelay:1000,
            //transformable:false
          },
          dataZoom: [{
            type:'slider',
            show: true,
            height: 20,
            bottom: 5,
            startValue:0,
            endValue:27,
            minSpan:6,
            textStyle: {color: "#90979c"},
            borderColor: '#90979c'
          },
            {
              type:'inside',
              //zoomOnMouseWheel:'alt'
            }],
          grid: {
            left: '2%',
            top: "15%",
            bottom: "20",
            right: "2%",
            containLabel: true
          },
          color: colors,
          xAxis:[
            {
              type: 'category',
              axisLine: {show: true, lineStyle: {color: '#6173A3'}},
              axisLabel: {interval: 0, rotate:40, textStyle: {color: '#9ea7c4', fontSize: 10}},
              data: xAxisData,
            },
          ],
          yAxis: [
            {
              type:'value',
              // axisTick : {show: true},
              splitLine: {show: false, lineStyle: {color: '#6173A3'}},
              axisLabel: {textStyle: {color: '#9ea7c4', fontSize: 10}},
              axisLine: {show: true, lineStyle: {color: '#6173A3'}},
            },
          ],
          series:seriesData,
        }

        this.myChart.setOption(option);

        let _this = this;
        this.myChart.on('click', function (item) {
          let time = item.data.time;
          if (!_.isEmpty(time)) {
            _this.$emit("selectGraphElements",time,cy)
          }
        })

        this.myChart.on('brushselected',(params) =>{
          let brushComponet = params.batch[0];
          _this.areas = brushComponet.areas;
          if(_.isEmpty(_this.areas)){
            if(_this.end != 0){
              clearInterval(_this.timer);
            }
            _this.start = 0;
            _this.end = 0;
            _this.isFirst = true;
            return false;
          }else {
            if(_this.end != 0){
              _this.isFirst = false;
            }
          }

          if(_this.isFirst){
            _this.isGuding = true;
            console.info("===============定周期");
            _this.isFirst = false;
          }

          if(!_.isEmpty(brushComponet.areas) && !_this.flag){
            _this.start = brushComponet.areas[0].coordRange[0];
            _this.end = brushComponet.areas[0].coordRange[1];
            //不能框选不存在的坐标轴
            if(_this.start<0){
              _this.start = 0;
            }
            if(_this.end>_this.length-1){
              _this.end=_this.length-1;
            }
            let collectionAll = _this.getBaseData();//筛选参与播放的节点
            _this.animationPlayer(_this.start,_this.end,collectionAll)
          }
        })
        window.resize = () => {
          this.myChart.resize()
        }
      },

      //组装图数据
      getSeriesData(statisticsList, edgeProList) {
        let seriesData = [];

        //取出所有时间包含的关系对象
        let timeSonList = _.flatten(_.map(statisticsList, 'timeSonList'));
        this.edgeDataLst = timeSonList;

        //组装
        _.each(edgeProList, function (edgePro) {
          let data = [];
          _.each(timeSonList, function (time) {
            if (time.key === edgePro.label) {
              let name = '';
              let value = _.sumBy(time.edgeStatisticsList, 'count');
              _.each(time.edgeStatisticsList, function (edgeStatistics) {
                name += edgeStatistics.sourceName + '-' + edgeStatistics.targetName + ': ' + edgeStatistics.count + '\n'
              });
              name += '总数';
              data.push(
                {
                  value: value,
                  name: name,
                  time: time,
                });
            }else{
              data.push(
                {
                  value: 0,
                  name: name,
                  time: time,
                })
            }
          });
          let series = {
            name: edgePro.name,
            type: 'bar',
            barGap:0,
            data: data,
            // tooltip: {
            //   textStyle: {
            //     width: '1300px',
            //     height: '200px',
            //     overflowY: 'auto'
            //   }
            // }
          };
          seriesData.push(series)
        });
        return seriesData;
      },

      //baseNodes图上所有显示的点，nodesSelect需要高亮的点
      setLabelCss(baseNodes,nodesSelect){
        //差集，置灰的点
        let collections = baseNodes.difference(nodesSelect)
        let currentGraphModel = this.$store.state.currentGraphModel;
        let currentResultDefinedLabel = this.$store.state.currentResultDefinedLabel;
        let cy = currentGraphModel.cy;
        var removeEls = document.querySelectorAll(".cy-title,.cy-title_dark")
        removeEls.forEach((v)=> {//不操作集合外的点（隐藏的点）
            let name = v.children[0].id.substring(0,v.children[0].id.length-6)
            let node = cy.nodes("[name='"+name+"']");
            if(baseNodes.contains(node)){
              let parent = v.parentNode;
              if(parent.parentNode){
                parent.parentNode.removeChild(parent);
              }
            }
        })

        baseNodes.forEach(function(e){
          e._private['classes'].delete('l2');//高亮去l2
          e._private['classes'].delete('l1')
        })

        collections.forEach(function (e) {
          var name = e.data().name;
          let nodeLabel = _.find(currentResultDefinedLabel,function (t) {
            if(name==t.nodeId && !_.isEmpty(t.labels)){
              return t;
            }
          })
          if(nodeLabel !=undefined && !_.isEmpty(nodeLabel.labels)){
            e.addClass('l2')
            let name = e.data().name;
            if(e.style().display!='none'){
              cy.nodeHtmlLabel(
                [
                  {
                    query:"node[name='"+name+"']",
                    halign:'bottom',
                    valign:'right',
                    cssClass:'cy-title_dark',
                    tpl:function (data) {
                      return `<div id=${data.name}_label></div>`; //div添加id，用于清除节点右下小对号样式
                    }
                  }
                ]
              )
            }
          }
          cy.resize();
        })

        nodesSelect.forEach(function (e) {
          var name = e.data().name;
          let nodeLabel = _.find(currentResultDefinedLabel,function (t) {
            if(name==t.nodeId && !_.isEmpty(t.labels)){
              return t;
            }
          })
          if(nodeLabel !=undefined && !_.isEmpty(nodeLabel.labels)){
            e.addClass('l1')
            let name = e.data().name;
            if(e.style().display!='none'){
              cy.nodeHtmlLabel(
                [
                  {
                    query:"node[name='"+name+"']",
                    halign:'bottom',
                    valign:'right',
                    cssClass:'cy-title',
                    tpl:function (data) {
                      return `<div id=${data.name}_label></div>`; //div添加id，用于清除节点右下小对号样式
                    }
                  }
                ]
              )
            }
          }
         cy.resize();
        })
      },

      //先置灰，再高亮符合条件的
      animationPlayer(startValue,endValue,collections){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let themeType = this.$store.state.themeType;

        let baseNodes = collections.baseNodeData;
        let baseEdges = collections.baseEdgeData;
        //先置灰所有(不操作图上已经隐藏的元素)
        if ('b' == themeType) {
          baseNodes.addClass('b-nodehightlight');
          baseEdges.addClass('b-edgehightlight');
        } else {
          baseNodes.addClass('a-nodehightlight');
          baseEdges.addClass('a-edgehightlight');
        }

        let edgeData = [];
        let nodesSelect = cy.collection();
        let edgesSelect = cy.collection();

        for(let i=startValue;i<=endValue;i++){
          console.log('time:  '+ currentGraphModel.statisticsList[i].time +'   i:  ' + i)
          edgeData.push(this.edgeDataLst[i]);
        }
        let edgeDataAll = _.flatten(_.map(edgeData,'edgeStatisticsList'))
        _.forEach(edgeDataAll,function (e) {
          let targetId = e.targetId;
          let sourceId= e.sourceId;
          let edgeId = e.edgeId;
          let targetNode = cy.nodes("[id= '"+targetId+"']");
          let sourceNode = cy.nodes("[id= '"+sourceId+"']");

          //source和target都在高亮分组内才会参与播放
          if(baseNodes.contains(targetNode) && baseNodes.contains(sourceNode)){
            nodesSelect.merge(targetNode)
            nodesSelect.merge(sourceNode)
          }

          let edge = cy.edges("[id= '"+edgeId+"']");
          if(baseEdges.contains(edge)){
            edgesSelect.merge(edge);
          }
        })

        if (!_.isEmpty(nodesSelect)) {
          if ('b' == themeType) {
            nodesSelect.removeClass("b-nodehightlight");
          } else {
            nodesSelect.removeClass("a-nodehightlight");
          }
        }

        this.setLabelCss(baseNodes,nodesSelect)
        if (!_.isEmpty(edgesSelect)) {
          if ('b' == themeType) {
            edgesSelect.removeClass("b-edgehightlight");
          } else {
            edgesSelect.removeClass("a-edgehightlight");
          }
        }
      },

      trackPlayer(){
        if(this.isFirst){
          this.isGuding = false;
          console.info("===============不定周期")
          this.isFirst = false;
        }

        let _this =this;
        //关闭刷选状态
        this.myChart.dispatchAction({
          type:'takeGlobalCursor',
          key:'brush',
          brushOption:{
            brushType:false
          }
        })

        if(this.flag){
          this.flag = false
        }else{
          this.flag = true
        }
        if(this.flag){
          let collectionAll = _this.getBaseData();//筛选参与播放的节点
          if(collectionAll.baseNodeData ==undefined || collectionAll.baseNodeData.length<1){
            this.$Message.warning("没有可播放的节点!")
            this.flag = false
            return
          }
          this.forbidSelect(true);//播放开始，禁止高亮置灰,隐藏显示操作
          this.timer = setInterval( ()=>{
            if(this.end > this.length-1){//播放到最后一个x轴自动停止播放
              // _this.myChart.dispatchAction({//清除框选
              //   type:'brush',
              //   areas:[
              //   ]
              // })
              debugger
              this.start = 0;
              this.end = 0;
              clearInterval(this.timer);
              this.forbidSelect(false);//播放停止，允许隐藏置灰操作
              this.flag = false;
              return
            }

            let startValue = _this.myChart.getModel().option.dataZoom[0].startValue;
            let endValue = _this.myChart.getModel().option.dataZoom[0].endValue;

            if(_this.end >=endValue){
              startValue++
              endValue++
            }
            //框选走到刻度最后面，滚轴移动
            if(endValue <= _this.length-1){
              _this.myChart.dispatchAction({
                type:'dataZoom',
                startValue:startValue,
                endValue:endValue
              })
            }
            _this.animationPlayer(_this.start,_this.end,collectionAll)//设置标记样式（置灰，高亮）

            _this.myChart.dispatchAction({
              type:'brush',
              areas:[
                {
                  brushType:'lineX',
                  coordRange:[_this.start,_this.end],
                  xAxisIndex:0
                }
              ]
            })

            if(_this.isGuding){
              _this.start++
              _this.end++
            }else{
              _this.end++
            }
          },1500)

        }else{
          this.forbidSelect(false);
          clearInterval(this.timer);
        }
      },
      forbidSelect(flag){
        if(flag){
          //禁止高亮，隐藏操作
          //色块部分
          $(".btn").css({pointerEvents:'none'});
          $(".color").css({pointerEvents:'none'});
          $(".toolbarItems").css({pointerEvents:'none'});
          //右边统计部分
          $(".main-clsedge").css({backgroundColor:'#9D9E96',cursor:"no-drop",pointerEvents:'none'});
          $(".edge-checklist").css({backgroundColor:'#9D9E96',cursor:"no-drop",pointerEvents:'none'})
          $(".main-clsf").css({backgroundColor:'#9D9E96',cursor:"no-drop",pointerEvents:'none'});
          $(".cls-checklist").css({backgroundColor:'#9D9E96',cursor:"no-drop",pointerEvents:'none'})
        }else{
          $(".btn").css({pointerEvents:'auto'});
          $(".color").css({pointerEvents:'auto'});
          $(".toolbarItems").css({pointerEvents:'auto'});
          $(".main-clsedge").css({backgroundColor:'#346ac8',cursor:"pointer",pointerEvents:'auto'});
          $(".edge-checklist").css({backgroundColor:'#346ac8',cursor:"pointer",pointerEvents:'auto'})
          $(".main-clsf").css({backgroundColor:'#346ac8',cursor:"pointer",pointerEvents:'auto'});
          $(".cls-checklist").css({backgroundColor:'#346ac8',cursor:"pointer",pointerEvents:'auto'})
        }
      },
      getBaseData(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let groups = this.$store.state.collectionPlayer;
        let collectionNodes = cy.collection();

        if(!_.isEmpty(groups)){
          groups.forEach(function (group) {
            var nodes = cy.nodes('[group=' + group + ']');
            collectionNodes.merge(nodes);
          })
        }
        let baseNodeData = cy.collection();
        let baseEdgeData = cy.collection();

        if(collectionNodes.length>0){
          baseNodeData = collectionNodes.filter(function (e) {
            if(!e.hidden()){
              return e;
            }
          })

          //高亮分组的线
          baseEdgeData = cy.edges().filter(function (ele) {
            if(collectionNodes.contains(ele.source()) &&
              collectionNodes.contains(ele.target()) && !ele.hidden()){
              return ele;
            }
          });
        }else{
          baseNodeData = cy.nodes().filter(function (e) {
            if(!e.hidden()){
              return e;
            }
          })

          //高亮分组的线
          baseEdgeData = cy.edges().filter(function (ele) {
            if(!ele.hidden()){
              return ele;
            }
          });
        }
        let collectionAll = {
          "baseNodeData":baseNodeData,
          "baseEdgeData":baseEdgeData
        }
        return collectionAll;
      }
    },
    destroyed(){
      this.isFirst = true;
      clearInterval(this.timer);//组件销毁时清除定时器
    }
  }
</script>

<style lang="less" scoped>
  #time-analyze{
    width: 100%;
    height: 200px;
  }

  .player{
    width: 20px;
    height: 20px;
    background: url("../../../static/image/run.png");
    background-size: 100% 100%;
    position: absolute;
    left: 30px;
    top: -5px;
  }
  .stop{
    width: 20px;
    height: 20px;
    background: url("../../../static/image/stop.png");
    background-size: 100% 100%;
    position: absolute;
    left: 30px;
    top: -5px;
  }

  .stopDisable{
    width: 60px;
    height: 22px;
    left: 60px;
    top: -5px;
    position: absolute;

  }

</style>
