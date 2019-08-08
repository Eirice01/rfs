<template>
  <div id="bottomTaskBar">
    <transition name="open">
      <div class="behaviorOpen" v-show="isActive" @mouseenter="cancelLabelView()">
        <Icon type="ios-keypad-outline" class="isClose" @click.native="changeshow"></Icon>
        <Tabs value="name1" :animated="false" style="height: 240px;"  @on-click="bottomChangeTabs">
          <TabPane label="行为明细" name="name1">
            <div style="margin-top: -8px;">
              <div style="height: 28px">
                <span class="behavior-drop" v-if="isShowBehavior">
                  <Select v-model="selType" size="small" style="width:200px; max-height: 100px"
                          @on-change="changeColumns()" :transfer="true">
                    <Option v-for="item in edgeTypeList" :value="item.label"
                            :key="item.label">{{ item.name }}</Option>
                  </Select>
                  <Input id="condition" v-model="searchVal" size="small" @on-keyup="changeData(1)"
                       placeholder="搜索服务号码或对方号码..."></Input>
                </span>
                <Button type="primary" id="exportData" size="small" @click="exportData">导出数据</Button>
              </div>
              <div id="behaviorInfo">
                <Table :columns="behaviorColumns" :data="behaviorPageData" class="transform"
                       :class="rotate ? 'rotate180': 'rotate0'" size="small" height="180"
                       @on-row-dblclick="showDetail" @on-row-click="selEdge"
                       @on-sort-change="sortChange"></Table>
                <Table :columns="detailColumns" :data="behaviorPageData" class="transform"
                       :class="rotate ? 'rotate0': 'rotate180'"
                       size="small" height="180" @on-row-dblclick="showDetail" @on-sort-change="sortChange"></Table>
                <Page :total="totalCount" size="small" :page-size="pageSize" show-total style="float: right"
                      :current="currentPage" @on-change="changePage" class="page-box"></Page>
              </div>
            </div>
          </TabPane>
          <TabPane label="行为分析" name="name2" style="height: 100%;">
            <relation-analyze ref="relation"></relation-analyze>
          </TabPane>
          <TabPane label="时序分析" name="name3">
            <time-analyze @selectGraphElements="selectGraphElements" ref="timeAnalyze"></time-analyze>
          </TabPane>
        </Tabs>
      </div>
    </transition>
    <transition name="close">
      <div class="behaviorClose" v-show="!isActive">
      <span class="isClose" @click="changeshow">
        <Tooltip content="关系立方" placement="top-end">
          <Icon type="ios-keypad-outline"></Icon>
        </Tooltip>
      </span>
      </div>
    </transition>

    <Modal title="导出数据" v-model="isExport" :closable="false" :mask-closable="false"
           :styles="{top: '160px',width:'630px'}">
      <p slot="header" class="modal-header">
        <span>导出数据</span>
        <span @click="cancelExport" class="modal-close">
         <Icon type="md-close"></Icon>
        </span>
      </p>
      <Form ref='fileForm' :label-width="110" :model="fileForm" :rules="ruleValidates">
        <FormItem label="导出文件名称：" prop="fileName">
          <Input v-model="fileForm.fileName" placeholder="请输入文件名称" @keyup.enter.native='exportOk'
                 style="width:487px;"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelExport">取消</Button>
        <Button type="primary" @click="exportOk">确定</Button>
      </div>
    </Modal>

  </div>

</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import * as SelectManage from "../../pages/graph/js/selectManage"
  import RelationAnalyze from "./RelationAnalyze";
  import TimeAnalyze from "./TimeAnalyze";
import { setTimeout } from 'timers';
import { refreshRightCon } from '../../pages/graph/js/allOperation';

  export default {
    name: "bottom-taskbar",
    data() {
      const fileNameValidate = (rule, value, callback) => {
        if (value.includes(" ")) {
          callback(new Error('文件名称不能含有空格！'));
        } else if (value.length == 0) {
          callback(new Error('文件名称不能为空！'));
        } else if (value.length > 20) {
          callback(new Error('文件名称不能超过20个字符！'));
        } else {
          callback();
        }
      };
      return {
        ruleValidates: {
          fileName: [
            {validator: fileNameValidate, trigger: 'change'}
          ]
        },
        behaviorColumns: [],
        searchVal: "",
        isActive: false,
        selType: '',
        edgeTypeList: [],
        columns: [
          /* {
             title: "序号",
             width: 60,
             align: 'center',
             render:(h,params) => {
               return h('div',[
                 h('span',(params.index+1)+this.pageSize*(this.currentPage-1))
               ])
             }
           },
           {"title": "服务号码", "key": "serviceNum", "align":"center"},
           {"title": "服务号码姓名", "key": "serviceName", "align":"center"},
           {"title": "服务号码来源地", "key": "serviceOrigin", "align":"center"},
           {"title": "对方号码", "key": "oppositeNum", "align":"center"},
           {"title": "对方号码姓名", "key": "oppositeName", "align":"center"},
           {"title": "对方号码来源地对方号码来源地", "key": "oppositeOrigin", "align":"center","tooltip":true},
           {"title": "通联总次数（次）", "key": "callFrequency", "align":"center"},
           {"title": "通联总时长（s）", "key": "callTime", "align":"center"},
            {"title": "上传类型", "key": "uploadType", "align":"center"},
            {"title": "上传时间", "key": "uploadTime", "align":"center"},
            {"title": "上传用户", "key": "uploadUser", "align":"center"}*/
        ],
        totalCount: 0,
        currentPage: 1,
        behaviorCurPage: 1,//记录明细列表当前页码，从详情跳转回来时使用
        pageSize: 5,
        behaviorData: [],//表格所有数据
        behaviorPageData: [],//表格每页的数据,
        detailColumns: [
          /*{
            title: "序号",
            width: 60,
            align: 'center',
            render:(h,params) => {
              return h('div',[
                h('span',(params.index+1)+this.pageSize*(this.currentPage-1))
              ])
            }
          },
          {"title": "服务号码", "key": "serviceNum", "align":"center"},
          {"title": "对方号码", "key": "oppositeNum", "align":"center"},
          {"title": "通信时长", "key": "duration", "align":"center"},
          {"title": "通信时间", "key": "relationTime", "align":"center"},*/
        ],
        detailData: [],//详单表格数据,
        detailPageData: [],
        isShowBehavior: true,
        isShowDetail: false,
        isExport: false,
        fileForm: {
          fileName: ''
        },
        rotate: false,
        timer: null,
        staticRelation: false, //当前选择的关系是否为静态关系，如果是静态关系，行为明细表格禁止双击
      }
    },
    components: {
      RelationAnalyze,
      TimeAnalyze
    },
    created() {

    },

    computed: {},

    mounted() {
      this.initTable();

    },

    methods: {
      //鼠标进入取消标记框
      cancelLabelView() {
        let labelDiv = $(".popper-div");
        if (labelDiv) {
          labelDiv.remove();
          window.popper = null;
        }
      },
      selectGraphElements(time,cy){
        this.$refs.relation.selectGraphEle(time,cy);
      },
      sortChange({column, key, order}) {
        this.currentPage = 1;
        if (order == 'desc') {
          this.descSort(key);
        } else if (order == 'asc') {
          this.ascSort(key);
        }
      },

      //降序排列
      descSort(key) {
        if (this.isShowBehavior) {
          //明细数据表格排序
          this.behaviorData.sort(function (a, b) {
            if (key == "ts") {
              let bTime = new Date(b[key]).getTime() ? new Date(b[key]).getTime() : 0;
              let aTime = new Date(a[key]).getTime() ? new Date(a[key]).getTime() : 0;
              return bTime - aTime
            } else {
              return b[key] - a[key];
            }

          });
          this.changePage(this.currentPage);
        } else {
          //详单数据排序
          this.detailData.sort(function (a, b) {
            if (key == "ts") {
              let bTime = new Date(b[key]).getTime() ? new Date(b[key]).getTime() : 0;
              let aTime = new Date(a[key]).getTime() ? new Date(a[key]).getTime() : 0;
              return bTime - aTime

            } else {
              return b[key] - a[key];

            }
          });
          this.changePage(this.currentPage);
        }
      },

      //升序排列
      ascSort(key) {
        if (this.isShowBehavior) {
          //明细数据表格排序
          this.behaviorData.sort(function (a, b) {
            if (key == "ts") {
              let bTime = new Date(b[key]).getTime() ? new Date(b[key]).getTime() : 0;
              let aTime = new Date(a[key]).getTime() ? new Date(a[key]).getTime() : 0;
              return aTime - bTime;

            } else {
              return a[key] - b[key];
            }

          });
          this.changePage(this.currentPage);
        } else {
          //详单数据排序
          this.detailData.sort(function (a, b) {
            if (key == "ts") {
              let bTime = new Date(b[key]).getTime() ? new Date(b[key]).getTime() : 0;
              let aTime = new Date(a[key]).getTime() ? new Date(a[key]).getTime() : 0;
              return aTime - bTime;

            } else {
              return a[key] - b[key];
            }

          });
          this.changePage(this.currentPage);
        }

      },

      cancelExport() {
        this.isExport = false;
        this.$refs.fileForm.resetFields();
      },

      exportData() {
        let exportColumnData = this.behaviorData.length;
        if (exportColumnData > 0) {
          this.isExport = true;
        } else {
          this.$Message.warning('没有可导出的数据！');
        }

      },

      exportOk() {
        this.$refs.fileForm.validate((valid) => {
          if (valid) {
            let exportColumns = []; //表头
            exportColumns = this.isShowBehavior ? this.behaviorColumns : this.detailColumns;
            let exportColumnData = [];//表格数据
            exportColumnData = this.isShowBehavior ? this.behaviorData : this.detailData;
            let isDetail = this.isShowBehavior ? 0 : 1;
            let columnsName = [];

            exportColumns.forEach(function (item) {
              if (item.key) {
                columnsName.push(item.key);
              }
            });
            let currentTimeCode = new Date().getTime() + "excel";
            this.$http.request({
              method: 'post',
              url: URL.saveFilterParams,
              data: {
                type: this.selType,
                fileName: this.fileForm.fileName,
                exportData: JSON.stringify(exportColumnData),
                columns: columnsName.join(","),
                isDetail: isDetail,
                currentTimeCode: currentTimeCode
              },
              success: (data) => {
                if (data.code == '200') {
                  window.location.href = URL.exportData + `?currentTimeCode=${currentTimeCode}`;
                }
              }
            });
            this.$refs.fileForm.resetFields();
            this.isExport = false;
          }
        })
      },

      getEdgeType() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let edges = cy.edges();
        let baseDictionData = this.$store.state.queryBaseDictionData;
        let edgePro = baseDictionData.edgePro;
        let edgeTypeGroup = _.groupBy(edges, function (edge) {
          return edge.data('type')
        });


        if (!edgeTypeGroup) {
          this.selType = "";
          this.edgeTypeList = [];
        } else {
          this.edgeTypeList = [];
          let _this = this;
          _.each(edgeTypeGroup, function (edgeElementS, edgeType) {

            let edgeVo = _.find(edgePro, {'label': edgeType});
            let propertyDeLength = _.isEmpty(edgeVo) ? 0 : edgeVo.propertyDe.length;
            let isStaticRelation = propertyDeLength > 0 ? false : true;
            let name = _.isEmpty(edgeVo) ? edgeType : edgeVo.name;

            _this.edgeTypeList.push({name: name, label: edgeType, isStaticRelation: isStaticRelation});

          });
          this.selType = this.edgeTypeList[0] ? this.edgeTypeList[0].label : "";
        }

      },

      changeshow() {
        this.isActive = !this.isActive;
        if (this.isActive) {
          this.initTable();

          //图形指标关闭，数值初始化
          this.$store.state.isshowSlider = false;
          // this.$store.commit("showSliderModel", this.$store.state.isshowSlider);

          //改变缩略图高度
          $('#cyNavigator').css('bottom', '243px');
          // $('#graphical-quota').css('bottom', '243px');
          //改变
        }else {
          //清除行为分析浮标
          this.$refs.relation.changeSwitch();
          $('#cyNavigator').css('bottom', '35px');
          // $('#graphical-quota').css('bottom', '35px')
        }

      },

      initTable() {
        this.isShowBehavior = true;
        this.rotate = false;
        this.currentPage = 1;
        this.getEdgeType();
        this.changeColumns();
      },


      changeColumns() {
        const _this = this;
        for (let i = 0; i < this.edgeTypeList.length; i++) {
          if (this.selType == this.edgeTypeList[i].label) {
            this.staticRelation = this.edgeTypeList[i].isStaticRelation;
          }
        }

        this.behaviorColumns = [];
        this.detailColumns = [];
        let edgePro = this.$store.state.queryBaseDictionData.edgePro;
        for (let i = 0; i < edgePro.length; i++) {
          if (edgePro[i].label == this.selType) {
            this.behaviorColumns = edgePro[i].properties;
            this.detailColumns = edgePro[i].propertyDe;
          }
        }

        for (let i = 0; i < this.behaviorColumns.length; i++) {
          let bColumnItem = this.behaviorColumns[i];
          this.$set(bColumnItem, 'renderHeader', (h, params) => {
            return h('span', {
              attrs: {title: params.column.title}
            }, params.column.title)
          });

          if (bColumnItem.key == "source") {
            this.$set(bColumnItem, 'render', (h, params) => {
              const _this = this;
              let sourceId = params.row.source;
              return h('span', {
                style: {
                  borderBottom: "1px solid #c8c5ec"
                },
                on: {
                  click: function (e) {
                    e.stopPropagation();
                    _this.graphNodeSelect(params.row.sourceId);
                  }
                }
              }, params.row.source)
            })

          } else if (bColumnItem.key == "target") {
            this.$set(bColumnItem, 'render', (h, params) => {
              const _this = this;
              return h('span', {
                style: {
                  borderBottom: "1px solid #c8c5ec"
                },
                on: {
                  click: function (e) {
                    e.stopPropagation();
                    _this.graphNodeSelect(params.row.targetId);
                  }
                }
              }, params.row.target)
            })
          }

          let number = {
            title: "序号",
            width: 60,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('span', (params.index + 1) + _this.pageSize * (_this.currentPage - 1))
              ])
            }
          };

          if (this.behaviorColumns.length > 0) {
            if (this.behaviorColumns[0].title == "序号") {
              this.behaviorColumns.splice(0, 1);
            }
            this.behaviorColumns.unshift(number)
          }

          if (this.detailColumns.length > 0) {
            if (this.detailColumns[0].title == "序号") {
              this.detailColumns.splice(0, 1);
            }
            this.detailColumns.unshift(number)
          }
          this.changeData(1);

        }
      },


      changeData(curPage) {
        let currentGraphModel = this.$store.state.currentGraphModel;
        var cy = currentGraphModel.cy;

        let sorted = document.querySelector("#bottomTaskBar .ivu-table-sort i.on");
        if (sorted) {
          sorted.click();
        }

        let allEdges = cy.edges();
        this.behaviorData = [];
        this.detailData = [];
        let pageNum = curPage;

        var columnsData = [];
        if (this.isShowBehavior) {//行为明细
          columnsData = this.behaviorColumns;
        } else {//详单
          columnsData = this.detailColumns;
        }


        for (let i = 0; i < allEdges.length; i++) {

          if (allEdges[i].data().type == this.selType) {

            let behaviorDataItem = {};
            behaviorDataItem['sourceEdgeId'] = allEdges[i].data().source;
            behaviorDataItem['targetEdgeId'] = allEdges[i].data().target;
            behaviorDataItem['edgeId'] = allEdges[i].data('id');
            behaviorDataItem['startT'] = allEdges[i].data().startT;
            behaviorDataItem['endT'] = allEdges[i].data().endT;

            for (let j = 1; j < columnsData.length; j++) {

              if (columnsData[j].key == "source") {

                behaviorDataItem[columnsData[j].key] = allEdges[i].source().data("name");
                behaviorDataItem.sourceId = allEdges[i].source().data("id");
                var serviceMatchFlag = behaviorDataItem[columnsData[j].key].indexOf(this.searchVal);

              } else if (columnsData[j].key == "target") {

                behaviorDataItem[columnsData[j].key] = allEdges[i].target().data("name");
                behaviorDataItem.targetId = allEdges[i].target().data("id");
                var oppositeMatchFlag = behaviorDataItem[columnsData[j].key].indexOf(this.searchVal);

              } else if (columnsData[j].key.indexOf("source") != -1) {

                let sourceLabels = allEdges[i].source().data().labels;
                if (sourceLabels) {
                  let sourceVal = allEdges[i].source().data().labels[columnsData[j].labelCode];
                  behaviorDataItem[columnsData[j].key] = sourceVal ? sourceVal : "";
                } else {
                  behaviorDataItem[columnsData[j].key] = "";
                }

              } else if (columnsData[j].key.indexOf("target") != -1) {

                let targetLabel = allEdges[i].target().data().labels;
                if (targetLabel) {
                  let targetVal = allEdges[i].target().data().labels[columnsData[j].labelCode];
                  behaviorDataItem[columnsData[j].key] = targetVal ? targetVal : "";
                } else {
                  behaviorDataItem[columnsData[j].key] = "";
                }

              } else {

                let attr = allEdges[i].data().attr;
                if (attr) {
                  let attrVal = allEdges[i].data().attr[columnsData[j].key];
                  behaviorDataItem[columnsData[j].key] = attrVal ? attrVal : "";
                } else {
                  behaviorDataItem[columnsData[j].key] = "";
                }

              }

            }

            if (this.searchVal == "" || (serviceMatchFlag != -1 || oppositeMatchFlag != -1)) { //搜索条件为空
              this.behaviorData.push(behaviorDataItem);
            } else {  //没匹配上
              continue;
            }
          }
        }

        this.totalCount = this.behaviorData.length;
        this.changePage(pageNum);
      },


      changePage(currentPage) {
        this.currentPage = currentPage;
        let currentNum = currentPage * this.pageSize;


        if (this.isShowBehavior) {
          this.behaviorPageData = [];
          for (let i = this.pageSize * (currentPage - 1); i < (currentNum > this.totalCount ? this.totalCount : currentNum); i++) {
            this.behaviorPageData.push(this.behaviorData[i]);
          }
        } else {
          this.behaviorPageData = [];
          for (let i = this.pageSize * (currentPage - 1); i < (currentNum > this.totalCount ? this.totalCount : currentNum); i++) {
            this.behaviorPageData.push(this.detailData[i]);
          }
        }
      },

      showDetail(dataItem) {
        if (this.staticRelation) {
          return;
        }
        clearTimeout(this.timer);
        this.rotate = !this.rotate;
        this.isShowBehavior = !this.isShowBehavior;

        if (this.isShowBehavior) {//行为明细
          this.changeData(this.behaviorCurPage);

        } else {//详情

          var rowItem = dataItem;
          this.behaviorCurPage = this.currentPage;
          this.getDetailData(rowItem);

        }
      },

      getDetailData(rowData) {
        let baseDictionData = this.$store.state.queryBaseDictionData;
        let edgePro = _.find(baseDictionData.edgePro, {'label': this.selType});

        if (_.isEmpty(edgePro)) {
          this.$Message.warning("没有详细信息");
          return false;
        }

        let edgeId = rowData.sourceEdgeId + "," + rowData.targetEdgeId;
        let startTime = rowData.startT;
        let endTime = rowData.endT;
        let edgeLabel = this.selType;
        let dyFlag = edgePro.dyFlag ? 1 : 0;
        let _this = this;
        this.$http.request({
          method: 'get',
          url: URL.queryEdgeDetail,
          params: {edgeIdString: edgeId, edgeLabel: edgeLabel, startL: startTime, endL: endTime, dyFlag: dyFlag},
          success: (data) => {
            if (data.code === 200) {
              _this.detailData = data.data;
              _this.totalCount = _this.detailData.length;
              _this.changePage(1);
            }
          }
        });
      },

      //选中点或者类型高亮graph图显示
      graphNodeSelect(nodeId) {
        if (!_.isEmpty(document.querySelector('.node-group-select-span'))) {
          document.querySelector('.node-group-select-span').classList.remove('node-group-select-span');
        }
        if (!_.isEmpty(document.querySelector('.edge-group-select-span'))) {
          document.querySelector('.edge-group-select-span').classList.remove('edge-group-select-span');
        }
        SelectManage.selectNodeOnGraph(nodeId);
      },

      graphEdgeSelect(selectEdgeId) {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        // let eId = selectEdge.id;
        let curEdge = cy.$(`#${selectEdgeId}`);
        if (curEdge && !curEdge.hidden()) {
          if (!_.isEmpty(document.querySelector('.node-group-select-span'))) {
            document.querySelector('.node-group-select-span').classList.remove('node-group-select-span');
          }
          if (!_.isEmpty(document.querySelector('.edge-group-select-span'))) {
            document.querySelector('.edge-group-select-span').classList.remove('edge-group-select-span');
          }
          SelectManage.drawEdgeTrack(selectEdgeId, event)
        } else {
          this.$Message.warning('该关系处于隐藏状态')
        }
      },

      selEdge(row) {
        let _this = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
          let source = row.source;
          let target = row.target;
          if (source == target) {
            return;
          }
          let edgeId = row.edgeId;
          _this.graphEdgeSelect(edgeId);
        }, 300);

      },

      bottomChangeTabs(name) {
        if(name=="name3"){
          setTimeout(()=>{this.$refs.timeAnalyze.initData() },500);      
        } else if(name=="name2"){
          setTimeout(()=>{this.$refs.relation.initData() },500);
        }
        //清除行为分析浮标
        this.$refs.relation.changeSwitch();
      },
        //刷新底部行为分析，时序分析图例
      refreshEcharts(){
        if(this.$refs.timeAnalyze.myChart){
          setTimeout(()=>{this.$refs.timeAnalyze.myChart.resize()},200);
        }
        if(this.$refs.relation.myChart){
          setTimeout(()=>{this.$refs.relation.myChart.resize()},200);         
        }
      }, 
    },

    beforeDestroy() {
      clearTimeout(this.timer);
      $('#cyNavigator').css('bottom', '35px');
    }
  }
</script>

<style lang="less" scoped>
  #bottomTaskBar {

    .isClose{
      font-size: 20px;
      position: absolute;
      right: 6px;
      line-height: 27px;
      z-index: 1085;
      font-weight: 700;
      .ivu-icon {
        font-weight: 700;
      }
    }
    .behaviorOpen {
      z-index: 999;
      width: 100%;
      height: 240px;
      overflow: hidden;
      position: absolute;
      bottom: 0px;
      cursor: pointer;
      /*transition:bottom .8s linear;*/
    }
    .behaviorClose {
      z-index: 999;
      width: 100%;
      height: 34px;
      line-height: 34px;
      background: #10143f;
      position: absolute;
      bottom: 0px;
      cursor: pointer;
      /* transition:bottom .8s linear;*/
    }

    #exportData {
      position: absolute;
      right: 4px;
    }
    .return {
      font-weight: 600;
      font-size: 12px;
      padding: 5px;
    }
    .behaviorTitle {
      font-weight: 600;
      padding: 5px 30px 5px 15px;
    }
    #condition {
      width: 180px;
    }
    .open-enter-active, .open-leave-active {
      transition: all 1s;
    }
    .open-enter, .open-leave-to {
      height: 34px;
    }
    .open-enter-to, .open-leave {
      height: 188px;
    }
    .close-enter-active, .close-leave-active {
      transition: all 1s;
    }
    .close-enter, .close-leave-to {
      height: 0px;
    }
    .close-enter-to, .close-leave {
      height: 34px;
    }
    .ivu-tabs-nav .ivu-tabs-tab-active {
      color: #0c76e6 !important;
    }
    #behaviorInfo {
      position: relative;
    }
    .transform {
      width: 100%;
      transition: all .5s;
      position: absolute;
      top: 0px;
      left: 0px;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      -moz-backface-visibility: hidden;
      -ms-backface-visibility: hidden;
    }
    .rotate0 {
      transform: rotateY(0deg);
    }
    .rotate180 {
      transform: rotateY(180deg);
    }
    .page-box {
      position: absolute;
      right: 0;
      top: 150px
    }
  }


</style>
<style>
  .ivu-table table {
    font-size: 0.9em;
  }

  .modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    font-size: 20px;
    cursor: pointer;
  }

  #behaviorInfo .ivu-table-small th {
    height: 25px;
  }

  #behaviorInfo .ivu-table-small td {
    height: 25px;
  }

  #detailTable .ivu-table-small th {
    height: 25px;
  }

  #detailTable .ivu-table-small td {
    height: 25px;
  }

  #behaviorInfo .ivu-table-wrapper {
    position: absolute;
  }

  #behaviorInfo .ivu-table-cell {
    padding: 0px;
  }

  #behaviorInfo .ivu-table-column-center {
    padding: 0px;
  }

  #detailTable .ivu-table-cell {
    padding: 0px;
  }

  #detailTable .ivu-table-column-center {
    padding: 0px;
  }

  /*.ivu-select-dropdown{*/
  /*background-color: #202977;*/
  /*}*/

</style>
