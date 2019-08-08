<template>
  <div v-model="isShowSnapshotContent" id="snapshot">
    <div style="margin-top: 3px; width: 100%;" v-if="snapshotModelList.length==0?false:true">
      <span class="cls-shot">批量操作 :</span>
      <span   class="cls-shot" ><Icon type="ios-log-out" @click="exportSnapshotFile" title="批量导出"></Icon></span>
      <span   class="cls-shot"><Icon type="ios-trash" @click="deleteSnapshotNotOne" title="批量删除"></Icon></span>
      <!--  关闭 -->
      <span   class="cls-shot" id="cls-delete"><Icon type="ios-close-circle-outline" @click="closeSnapshot"></Icon></span>

    </div>
    <div class="snapshot-content" v-if="snapshotModelList.length==0?false:true">
      <div class="snapshot-container" v-for="snapshotModel in snapshotModelList">
        <ul>
          <li class="snapshot-li" @mouseleave="mouseLeave($event)" style="display: inline-table; position: relative">
            <img @mouseenter="mouseEnter($event)" @click="viewSnapshotModelResult(snapshotModel)" class="snapshot-base-img f-csp" :src="snapshotModel.baseImage"/>
            <Icon class="snapshot-delete-icon f-csp" @click="deleteSnapshotModel(snapshotModel) " type="ios-trash"></Icon>
            <!--<checkbox class="snapshot-check-icon f-csp" type="snapshot" :label="snapshotModel.sid" @on-change="selectSnopShot(snapshotModel.sid)"></checkbox>-->
            <Checkbox  v-model="snapshotModel.checked" class="snapshot-check-icon f-csp" type="snapshot" :label="snapshotModel.sid" @on-change="selectSnopShot(snapshotModel.sid)"></Checkbox>
            <Icon class="snapshot-edit-icon f-csp" type="ios-create-outline" @click="editSnapshot(snapshotModel)"></Icon>
            <Icon class="snapshot-save-icon f-csp" type="md-checkmark" @click="updateSnapshot(snapshotModel)"></Icon>
          </li>
          <li class="snapshot-li">
            <span :title="snapshotModel.sname">{{snapshotModel.sname}}</span>
          </li>
          <li class="snapshot-li">
            <span :title="snapshotModel.createtime">{{snapshotModel.createtime}}</span>
          </li>
          <!-- 显示快照的描述信息 -->
          <li class="snapshot-li" style="width: 115px">
            <span :title="snapshotModel.desce">{{snapshotModel.desce}}</span>
          </li>
        </ul>
      </div>
      <div v-show="index === '0'" style="display: inline-table;">
        <span title="查看更多" @click="querySnapShotModelMore" class="loadMoreSpan">...</span>
      </div>
    </div>
    <set-snap-shot ref="setsnopshot" @initSnapshot="initSnapShot"></set-snap-shot>
  </div>
</template>

<script>

  import * as snapshotManage from '../../pages/graph/js/snapshotManage'
  import {URL} from "../../../api/urlsConfig"
  import GraphModel from "../../pages/graph/js/GraphModel"
  import * as Handle from "../../pages/graph/js/handle"
  import * as styleManage from "../../pages/graph/js/setStyleManage"
  import Checkbox from "iview/src/components/checkbox/checkbox";
  import SetSnapShot from "@/components/modals/SetSnapshot";

  export default {
    components: {
      Checkbox,
      SetSnapShot
    },
    name: "snapshot",
    data() {
      return {
        snapshotModelList: [],
        currentSnapshotModel: '',
        pageSize: 10,
        page: 1,
        index: '1',
        selectSnopShotSid: [],
      }
    },

    mounted() {
    },
    computed:{
      // 快照弹窗是否显示
      isShowSnapshotContent: {
        get: function () {
          if(this.$store.state.isShowSnapshot){
            this.initSnapShot()
          }else {
            this.closeSnapshot();
          }
          return this.$store.state.isShowSnapshot
        },
        set: function () {
          this.$store.commit("isShowSnapshotModel");
        }
      },

      // 获取删除的权限
      deletable:function(){
        return this.$store.state.jurisdiction.deletable;
      },
      // 获取导出快照ppt的权限
      exportable: function () {
        return this.$store.state.jurisdiction.exportable;
      },
      // 获取修改或是保存快照的权限
      addable: function () {
        return this.$store.state.jurisdiction.addable;
      },
    },
    methods: {
      //  快照批量导出为ppt
      exportSnapshotFile(){
        if(this.selectSnopShotSid.length > 0){
          let currentGraphModel = this.$store.state.currentGraphModel;
          window.location.href = URL.exportPPT + '?taskId=' + currentGraphModel.taskModel.taskId + '&snapId=' + this.selectSnopShotSid.join(",") + "&caseName=" + currentGraphModel.taskModel.caseName;
        }else {
          this.$Message.warning('请至少选择一个快照！');
        }
      },
      // 关闭快照
      closeSnapshot(){
        // this.isShowSnapshotContent = false;
        this.$store.commit("isShowSnapshotModel", false);
        this.selectSnopShotSid = [];
        this.snapshotModelList=[];
        // 取消复选框的显示
        this.cancelCheckBoxStatus();
        // 将所有的选中状态置为空
        this.snapshotModelList.forEach(function (v) {
          v.checked = false;
        });
      },

      // 取消复选框的显示
      cancelCheckBoxStatus(){
        let target = $("#snapshot .snapshot-content .snapshot-check-icon");
        for(let i=0;i<target.length;i++){
          if(target[i].getElementsByTagName("span")[0].classList.contains("ivu-checkbox-checked")){
            target[i].style.display = 'none';
          }
        }
      },

      // 批量删除快照方法
      deleteSnapshotNotOne(){
        this.$Modal.confirm({
          title: '是否删除选中的所有快照：',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.$http.request({
              method: 'post',
              params: {sid: this.selectSnopShotSid.join(",")},
              url:URL.deleteSnapShot,
              success:(data)=>{
                if (data.code === 200 && data.data === "1"){
                  // 取消复选框的显示
                  this.cancelCheckBoxStatus();
                  this.snapshotModelList = _.reject(this.snapshotModelList, {'sid': this.selectSnopShotSid.join(",")});
                  console.info("批量删除快照成功：");
                  //切换图形显示加载图
                  this.$store.commit("graphLoad",true);
                  this.$store.commit("showStatisticsAndAnalyzeCon", false);
                  this.$store.commit("showColorBar", false);
                  //查询当前任务最后一个快照json
                  this.queryLayoutData();
                  this.initSnapShot();
                }
              },
              error:(data)=>{
                this.$Message.warning('请求数据失败！');
              }
            })
          }
        });
      },
      // 选中复选框时方法
      selectSnopShot(sid){
        if(this.selectSnopShotSid.indexOf(sid) != -1){
          // splice函数的第二个参数指删除的数目，splice直接修改原数组，并把删除的所有元素以另一个新数组的方式返回
          this.selectSnopShotSid.splice(this.selectSnopShotSid.indexOf(sid),1);
        }else {
          this.selectSnopShotSid.push(sid);
        }
      },

      // 点击事件调用setsnopshot中的方法
      editSnapshot(snapshotModel){
        this.$refs.setsnopshot.openCaseNameModel(snapshotModel);
      },

      // 在快照上对图操作后 保存
      updateSnapshot(snopshot){
        let sid = snopshot.sid;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let snapshot = snapshotManage.createSnapshot('', currentGraphModel,'',sid);
        this.$http.request({
          method: 'post',
          url:URL.saveSnapshot,
          data:snapshot ,
          success: (data) => {
            if(data.code === 200){
              currentGraphModel.rid = data.data;
              this.$Message.success('保存成功！');
              this.initSnapShot();
              this.$store.commit("setSnapshotConfirm",false);//添加快照成功后图初始化，避免再次触发保存快照
            }else {
              this.$Message.success('保存快照失败！');
            }
          },
          error: (data) => {
            this.$Message.warning('保存快照失败！');
            $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
            // $('#createSnapshotSpan').css("pointer-events", "auto");
          }
        });
      },

      initSnapShot() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        this.queryTaskSnapShotList(currentGraphModel)
      },

      queryTaskSnapShotList (currentGraphModel) {
        let _this = this;
        this.$http.request({
          method: 'get',
          params: {taskId: currentGraphModel.taskModel.taskId, pageSize: this.pageSize, page: this.page},
          url: URL.queryTaskSnapShotList,
          success: (data) => {
            if (data.code === 200) {
              this.snapshotModelList = data.data.list;
              if(_.isEmpty(this.snapshotModelList)){
                // this.isShowSnapshotContent = false;
                this.$Message.warning("还没有保存快照!")
              }else {
                // this.isShowSnapshotContent = true;
                _this.$nextTick(function (o) {
                  let snapshotClientWidth = document.querySelector('#snapshot').clientWidth;
                  let snapshotLeft = (-snapshotClientWidth/2) < -266 ? -266 : (-snapshotClientWidth/2);
                  document.querySelector('#snapshot').style.left = snapshotLeft + "px";
                });
              }
              this.index = data.data.index
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        })
      },

      showSnapshotContent(letf) {
        // if(this.isShowSnapshotContent){
        //   // this.isShowSnapshotContent = false;
        //   return false;
        // }
        let currentGraphModel = this.$store.state.currentGraphModel;
        if(_.isEmpty(currentGraphModel.taskModel)){
          return false
        }
        this.currentSnapshotModel = currentGraphModel;
        this.currentSnapshotModel.sid = currentGraphModel.rid;
        this.queryTaskSnapShotList(currentGraphModel);
      },


      //删除快照
      deleteSnapshotModel(model) {
        let _this = this;
        this.$Modal.confirm({
          title: '是否删除快照：' + model.sname,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.$http.request({
              method: 'post',
              params: {sid: model.sid},
              url:URL.deleteSnapShot,
              success:(data)=>{
                if (data.code === 200 && data.data === "1"){
                  this.snapshotModelList = _.reject(this.snapshotModelList, {'sid': model.sid});
                  console.info("删除快照成功：" + model.sname);
                  //显示当前模型结果，删除后显示任务数据
                  if(model.sid === _this.currentSnapshotModel.sid) {
                    //切换图形显示加载图
                    this.$store.commit("graphLoad",true);
                    this.$store.commit("showStatisticsAndAnalyzeCon", false);
                    this.$store.commit("showColorBar", false);
                    //查询当前任务最后一个快照json
                    this.queryLayoutData();
                  }
                  this.initSnapShot();
                }
              },
              error:(data)=>{
                this.$Message.warning('请求数据失败！');
              }
            })
          }
        });
      },

      //请求当前图的所有标记
      queryCurrentResultDefinedLabel(datas,currentGraphModel){
        let rid = datas.data.id;
        this.$http.request({
          method:'get',
          params:{
            rid:rid,
            code:0
          },
          url:URL.queryCurrentResultDefinedLabel,
          success:(data)=>{
            if(data.code===200){
              let currentResultDefinedLabel = data.data;
              this.$store.commit("setCurrentResultDefinedLabel",currentResultDefinedLabel);
              this.loadGraph(datas.data, currentGraphModel);
            }
          },
          error:(data)=>{
            this.$Message.warning('请求数据失败！')
          }
        })
      },

      //请求图数据
      queryLayoutData(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let _this = this;
        this.$http.request({
          method: 'get',
          params: {taskId: currentGraphModel.taskModel.taskId, code:0},
          url:URL.queryResultJsonById,
          success: (data) => {
            if(data.code === 200){
              //加载图
              currentGraphModel.code = 0;
              if(data.data.id){
                currentGraphModel.rid = data.data.id;
                this.queryCurrentResultDefinedLabel(data,currentGraphModel);//标记记载在图加载之前
              }else {
                this.$store.commit("setCurrentResultDefinedLabel",[]);
                this.loadGraph(data.data, currentGraphModel);

              }
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },

      // setSelectedStyle () {
      //   let _this = this;
      //   setTimeout(function () {
      //     let currentSnapshotModel = _this.$store.state.currentGraphModel;
      //     currentSnapshotModel.cy.style()
      //       .selector(':selected')
      //       .css(
      //         {
      //           "border-width": "0.5px",
      //           "border-color": "#000000",
      //           "border-opacity": "1",
      //           "background-color": "#ff151a",
      //           "text-outline-color": "#ff151a"
      //         }
      //       )
      //       .selector('.nodehightlight')
      //       .css(
      //         {
      //           "border-color": "#8e918a",
      //           "background-color": "#8e918a",
      //           "text-outline-color": "#8e918a",
      //         }
      //       )
      //       .selector('.edgehightlight')
      //       .css(
      //         {
      //           "line-color": "#cccccc"
      //         }
      //       )
      //       .selector('edge:selected')
      //       .css(
      //         {
      //           'width':2,
      //           'opacity':1,
      //           'line-color':'#ff151a'
      //         }
      //       )
      //       //关联发现高亮推荐最短路径
      //       .selector("edge[?shortestFlag]")
      //       .css(
      //         {
      //           'width': 2,
      //           'opacity': 1,
      //           'line-color': '#bd0e14'
      //         }
      //       )
      //       .update()
      //   },100)//延时大于点线渲染的延时
      // },

      //加载图
      loadGraph (data, currentGraphModel) {
        //刷新统计和分析页面
        this.$store.commit("showStatisticsAndAnalyzeCon", true);
        //this.$store.commit("showColorBar", true);
        if (_.isEmpty(data.resultJson.groups)) {
          this.$store.commit("showColorBar", false);
        } else {
          this.$store.commit("showColorBar", true);
        }
        //渲染图
        currentGraphModel.data = data.resultJson;
        currentGraphModel.statisticsList = data.statisticsList;
        //当有任务时
        currentGraphModel.undefinedTask = false;
        let cy = Handle.init(currentGraphModel);
        currentGraphModel.setCy(cy);
        styleManage.setSelectedStyle(this);
        this.bindSelectNode(cy);
        this.$store.commit('setCurrentGraphModel', currentGraphModel);
        this.currentSnapshotModel = '';
        cy.zoom(data.resultJson.zoom);
        setTimeout(function () {
          let nodeImgMarkSize = currentGraphModel.data.nodeImgMarkSize;
          if(!_.isEmpty(nodeImgMarkSize)){
            _.each($('.cy-title,.cy-title_dark,.locked-node'), function(e){
              $(e).css({'width': nodeImgMarkSize.width, height: nodeImgMarkSize.height})
            });
          }
        }, 100)
      },

      //画布绑定点击时间
      bindSelectNode(cy) {
        let _this = this;
        cy.on('click',function (e) {
          //单击屏幕
          //取消右侧分析-->选中标签的高亮
          $(".f-cspaH").removeClass("f-cspaH");
          $(".f-cspCusH").removeClass("f-cspCusH");
          let flag = _this.$store.state.isAddRelation;
          if (flag) {
            _this.$store.commit("isAddRelation", false);
          } else {
            if (e.target.eh) {
              //显示整体信息
              _this.$emit("statisticsSelectNode", '');
              //移除置灰
              cy.nodes().removeClass("b-nodehightlight");
              cy.nodes().removeClass("a-nodehightlight");
              cy.edges().removeClass("b-edgehightlight");
              cy.edges().removeClass("a-edgehightlight");
            } else if (e.target.length && (e.target.isNode() || e.target.isEdge())) {
              //展开右侧功能区
              _this.$store.commit("setRightConTabName", "statistics");
              _this.$emit("statisticsSelectNode", e.target);
            }

          }
        });
      },
      //getSingleLvl
      changeSingleLvl(){
        this.$emit("getSingleLvl")
      },
      //查看快照结果
      viewSnapshotModelResult(model) {
        //图形指标关闭，数值初始化
        this.$store.commit("showMoreSlider", false);
        this.$store.state.isshowSlider=true;
        this.$store.commit("showSliderModel", this.$store.state.isshowSlider);
        this.changeSingleLvl();

        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        if((_.isEmpty(currentGraphModel.data.nodes) && _.isEmpty(currentGraphModel.data.edges))
          || cy.elements().difference(cy.elements(':hidden')).length === 0
        ){
          //this.$Message.warning("当前画布中无可保存的元素");
          this.cancelTask(model);
        }else{
        if(this.$store.state.isSnapshotConfirm){//图形有变化弹出是否保存快照提示框
          this.$Modal.confirm({
            title: '是否将当前步骤保存为快照',
            okText: '确认',
            cancelText: '取消',
            onOk: () =>{
            this.$store.commit("showAddSnapshotModal", true);//弹出添加快照窗口
        },
            onCancel:()=>{
              //切换图形显示加载图
           this.cancelTask(model);
            },
          })
        }else{
          //切换图形显示加载图
          this.cancelTask(model);
        }
        }
      },
       cancelTask(model){
         this.$store.commit("graphLoad",true);
         this.querySnapshotById(model)
       },
      querySnapshotById(model){
        this.currentSnapshotModel = model;
        let _this = this;
        let currentGraphModel = this.$store.state.currentGraphModel;
        this.$store.commit("showStatisticsAndAnalyzeCon", false);
        this.$store.commit("showColorBar", false);

        //前端打包测试
         let url = URL['querySnapshotData' + model.index];
        console.log('querySnapshotData' + model.index);
        this.$http.request({
          method: 'get',
          params: {rid: model.sid, code:0},
          url:URL.debug?url:URL.queryResultJsonById,
//           url:url,  //前端打包测试
          success:(data)=>{
            if (data.code === 200){
              //加载图
              currentGraphModel.rid = data.data.id;
              currentGraphModel.code = 0;
              this.queryCurrentResultDefinedLabel(data,currentGraphModel);
              console.info("查看快照结果：" + model.rname);
              this.$store.commit("Sliderlvl",0);//标签指标初始化
              this.$store.commit("baseLabelsFus",[]);//选择属性标签初始化
            }
          },
          error:(data)=>{
            this.$Message.warning('请求数据失败！');
          }
        })
      },

      //快照查看更多
      querySnapShotModelMore() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        this.pageSize += 10;
        this.queryTaskSnapShotList(currentGraphModel);
      },

      mouseEnter(event) {
        // event.target 指的是：img
        event.target.classList.add('snapshot-mouse-top');
        // 删除的权限
        if(this.deletable && !this.$store.state.closeCase){
          // event.target.parentElement.lastElementChild.style.display = 'block';
          event.target.parentElement.getElementsByClassName("snapshot-delete-icon")[0].style.display = 'block';
        }
        // 导出快照为PPT的权限
        if(this.exportable && !this.$store.state.closeCase){
          event.target.parentElement.getElementsByClassName("snapshot-check-icon")[0].style.display = 'block';
        }
        // 保存快照 和 修改快照的权限
        if(this.addable && !this.$store.state.closeCase){
          event.target.parentElement.getElementsByClassName("snapshot-edit-icon")[0].style.display = 'block';
          event.target.parentElement.getElementsByClassName("snapshot-save-icon")[0].style.display = 'block';
        }
      },

      mouseLeave(event) {
        // event.target.firstElementChild 指：img
        // 鼠标移出时 隐藏图标: 删除、修改、保存
        event.target.getElementsByClassName("snapshot-edit-icon")[0].style.display = 'none';
        event.target.getElementsByClassName("snapshot-save-icon")[0].style.display = 'none';
        event.target.getElementsByClassName("snapshot-delete-icon")[0].style.display = 'none';
        if(event.target.getElementsByClassName("ivu-checkbox-checked")[0] == undefined){
          event.target.getElementsByClassName("snapshot-check-icon")[0].style.display = 'none';
          event.target.firstElementChild.classList.remove('snapshot-mouse-top');
        }else{
          event.target.getElementsByClassName("snapshot-check-icon")[0].style.display = 'block';
        }
      },

      mouseLeaveSnapshotContent() {
        this.isShowSnapshotContent = false;
      }
    },
  }
</script>

<style scoped lang="less">
 #snapshot{
   .cls-shot{
     font-size: 16px;
     display: inline-block;
     margin-left: 5px;
   }
  #cls-delete{
    float: right;
  }
 }
  #snapshot{
    border-radius: 5px;
    position: absolute;
    cursor:pointer;
    top: 56px;
    z-index: 999;
    max-width: 725px;
    color: #fff;
    padding:0 10px;
    background-color: #6269a9;
  }

  .snapshot-content {
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    height: 100%;
    white-space: nowrap;
    background-color: #6269a9;
  }
  .snapshot-content::-webkit-scrollbal-track{
    background:#6269a9;
  }
  #snapshot .snapshot-li{
    list-style: none;
    margin: 2px 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 120px;
    text-align: center;
  }

  .snapshot-base-img {
    width: 120px;
    height: 90px !important;
    background-color: #f0f0f0;
    border-radius: 10px;
  }

  .snapshot-container {
    margin: 5px 10px;
    width: 120px;
    display: inline-table;
    overflow-x: scroll;
  }

  .snapshot-mouse-top {
    border: 2px solid #3f51b5;
  }
  .snapshot-delete-icon {
    position: absolute;
    left: 2px;
    top: 1px;
    font-size: 14px;
    display: none;
  }
  .snapshot-edit-icon {
     position: absolute;
    left: 98px;
    top: 71px;
    font-size: 18px;
    display: none;
  }
  .snapshot-check-icon {
     position: absolute;
    left: 100px;
    top: -2px;
    font-size: 18px;
    display: none;
  }
  .snapshot-save-icon {
    position: absolute;
    left: 4px;
    top: 72px;
    font-size: 18px;
    display: none;
  }
  #snapshot .loadMoreSpan {
    margin: 1px 5px;
    cursor: pointer;
    font-size: 20px;

  }
</style>
