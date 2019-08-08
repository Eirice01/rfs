<template>
    <div id="legendPanel" class="legendPanel" v-show="colorDispaly">
      <span  v-for="(item,index) in groups" class = "legend">
        <input type="checkbox" class="btn" :value="item.groupId" v-model="item.select" @change="selectGroup(item)" />
       <span class="color" :id="item.groupId" :title='"团体"+item.groupId' :style="{'background-color': item.color,'box-shadow':item.shadow}" infoShow="0" @click ="setHightlight(item,$event)"></span>

      </span>
      <span v-if="ready" isShow="0" style="height: 20px;" @click="showOthersGroup(isShow)" class="addDirectLt" id="showOther"></span>
      <div id="otherLegend"  class="otherLegend">
      <span v-for="(item,index) in otherGroupList" class="legend">
        <input type="checkbox" class="btn" :value="item.groupId" v-model="item.select" @change="selectGroup(item)"/>
        <span class="color" :id="item.groupId" :title='"团体"+item.groupId' :style="{'background-color': item.color,'box-shadow':item.shadow}" infoShow="0" @click ="setHightlight(item,$event)"></span>
      </span>
      </div>
    </div>
</template>

<script>
  import store from  "../../vuex/store"
  import * as styleManage from "../../pages/graph/js/setStyleManage.js"
  import * as allOperation from '../../pages/graph/js/allOperation'

  export default {
    name:"colorBar",
    data() {
      return {
        isShow:"0",
        allGroupList:[],//所有分组
        groups:[],//按大小排序的前12个分组
        otherGroupList:[],//其他分组
        data:null,
        check:'',
        ready:false,
        timer:null,
        colorDispaly:true//设置色卡工具条是否显示
//        color : ['#3f51b5', '#ff9800', '#EC407A', '#009688', '#AB47BC', '#03A9F4', '#8D6E63', '#8BC34A', '#FF7043', '#7B1FA2', '#26C6DA', '#CDDC39', '#FFCA28', '#4CAF50', '#5C6BCD', '#827717', '#00695C', '#7E57C2', '#015798', '#FFEB3B'],
      };
    },
    created(){
      let currentGraphModel = store.state.currentGraphModel;
      let cy = currentGraphModel.cy;
      this.ready = false;
      this.data = currentGraphModel.data;
      if(_.isEmpty(this.data.groups)){
        this.colorDispaly = false;
      } else {
        this.allGroupList = this.data.groups;
        var defaultCount = 12;//默认展示几个分组的色签
        if(this.allGroupList.length > 0){
          //如果分组数大于defaultCount，拆分分组
          if(this.allGroupList.length<=defaultCount){
            this.groups = this.allGroupList;
            //给每个组分配颜色
            for(var i =0;i<this.groups.length;i++){
              if(this.groups[i].isLighted == false){
                this.groups[i]['shadow']= "0 5px 5px #666"
              }else{
                this.groups[i]['shadow']= ""
              }
              // this.groups[i].color = grou;
            };
            this.otherGroupList = [];
          }else{
            this.ready = true;//显示合并分组(小箭头)
            for(var i=0;i<this.allGroupList.length;i++){
              if(i<defaultCount){
                this.groups.push(this.allGroupList[i])
              }else{
                this.otherGroupList.push(this.allGroupList[i])
              }
            }

            for(var i =0;i<this.groups.length;i++){
              if(this.groups[i].isLighted == false){
                this.groups[i]['shadow']= "0 5px 5px #666"
              }else{
                this.groups[i]['shadow']= ""
              }
              // this.groups[i].color = this.color[i];
            }

            var mergeGroupId = "";
            var otherSelect = false;//表示合并分组是否选中，快照初始化加载时使用
            var otherShadow = true;//表示合并分组是否添加阴影
            for(var i =0;i<this.otherGroupList.length;i++){
              this.otherGroupList[i].color = '#FFCA28';
              if(this.otherGroupList[i].select){//合并分组子分组有一个勾选的，则合并分组处于勾选状态
                otherSelect = true
              }
              if(this.otherGroupList[i].isLighted || this.otherGroupList[i].isLighted==undefined){//合并分组子分组有一个未高亮，则合并分组不高亮(色条加阴影)
                otherShadow = false
              }
              mergeGroupId = mergeGroupId + this.otherGroupList[i].groupId +","
            }
            mergeGroupId = mergeGroupId.substring(0,mergeGroupId.length-1)

            //默认分组后拼接一个合并分组，合并分组颜色一样
            var mergeGroup = {"groupId":mergeGroupId,"select":true,isLighted:true,"color":'#FFCA28'};
            if(!otherSelect){
              mergeGroup.select = false;
            }
            if(otherShadow){
              mergeGroup['shadow']="0 5px 5px #666";
              mergeGroup.isLighted=false;
            }else{
              for(var i =0;i<this.otherGroupList.length;i++){
                if(this.otherGroupList[i].isLighted == false){
                  this.otherGroupList[i]['shadow']= "0 5px 5px #666"
                }else{
                  this.otherGroupList[i]['shadow']= ""
                }
              }
              mergeGroup['shadow']="";
            }
            this.groups.push(mergeGroup);
          }
          //合并的分组设置不同颜色
          // if(this.otherGroupList.length>0){
          //   this.setNodesStyle(this.otherGroupList,cy);
          // }

          let groupsAll = {
            groups:[],
            otherGroupList:[]
          }
          groupsAll.groups = this.groups;
          groupsAll.otherGroupList = this.otherGroupList;
          groupsAll.ready = this.ready;

          let i = 0;//分组设置排序，撤销恢复分组使用
          groupsAll.groups.forEach(function (e) {
            e.order = i++;
          })
          groupsAll.otherGroupList.forEach(function (e) {
            e.order = i++;
          })

          //深度copy一份初始化分组信息撤销使用
          let groupsBase = this.deepClone(groupsAll)
          store.commit("setGroupsBase",groupsBase);//撤销使用，保持初始状态
          store.commit("setGroupsAll",groupsAll);//删除使用，会增删
        }
      }
      this.initGraph(this.data,cy)
   },
    mounted(){
      let currentGraphModel = store.state.currentGraphModel;
      //添加高亮事件
      // this.setHightlight();
      this.dblclickSelect();
      this.initDefinedLabelCss(currentGraphModel.data);
      this.watchGroups()
    },
    methods : {
      watchGroups(){
        this.$store.watch(()=>{
          return this.$store.state.groups;
          },()=>{
          this.getGroups()
        }
        )
      },

      deepClone(obj) {
        let _obj = JSON.stringify(obj);
        let objClone = JSON.parse(_obj);
        return objClone;
      },

      getGroups(){
        var groupsAll = store.state.groupsAll;
        this.groups = groupsAll.groups;
        this.otherGroupList = groupsAll.otherGroupList;
        this.ready = groupsAll.ready;
        this.colorDispaly = groupsAll.colorDispaly;
        if(!_.isEmpty(this.otherGroupList)){
          this.allGroupList = [..._.dropRight(this.groups),...this.otherGroupList];
        }else{
          this.allGroupList = groupsAll.groups;
        }

        this.$forceUpdate()
      },

      //初始化
      initGraph(data, cy) {
        cy.startBatch();//异步重绘start,大量提升重绘效率
        //筛选出高亮的分组
        var groupList = _.filter(data.groups, function (e) {
          if (e.isLighted == false) {
            return e;
          }
        })
        if (!_.isEmpty(groupList)) {//没有高亮分组，返回
          let collectionNodes = cy.collection();//合并分组所有的点集合
          let collectionEdges = cy.collection();//合并分组所有的线集合
          //高亮分组的点
          let groupIdLst= [];
          groupList.forEach(function (e) {
            document.querySelectorAll(".color");
            let group = e.groupId;
            groupIdLst.push(group)
            var nodes = cy.nodes('[group=' + group + ']');
            collectionNodes.merge(nodes);
          })
          store.commit("setCollectionPlayer",groupIdLst);//时序分析使用高亮的点

          //高亮分组的线
          let lineGroupData = cy.edges().filter(function (ele) {
            if(collectionNodes.contains(ele.source()) &&
              collectionNodes.contains(ele.target())){
              return ele;
            }
          });
          collectionEdges.merge(lineGroupData);

          let unCollectionNodes = cy.nodes().difference(collectionNodes);//反选其他组的节点
          let unCollectionEdges = cy.edges().difference(collectionEdges);//反选其他组的线

          let themeType = store.state.themeType;
          if (!_.isEmpty(unCollectionNodes)) {
            if ('b' == themeType) {
              unCollectionNodes.addClass("b-nodehightlight");//非当前分组的点进行置灰
            } else {
              unCollectionNodes.addClass("a-nodehightlight");//非当前分组的点进行置灰
            }
          }
          if (!_.isEmpty(unCollectionEdges)) {
            if ('b' == themeType) {
              unCollectionEdges.addClass("b-edgehightlight");//非当前分组的线进行置灰
            } else {
              unCollectionEdges.addClass("a-edgehightlight");//非当前分组的线进行置灰
            }
          }
        }else{
          store.commit("setCollectionPlayer",[]);//时序分析使用高亮的点
        }
        this.setDefinedLable(cy,0);
        cy.endBatch();//异步重绘start,大量提升重绘效率
      },
      //色签复选框事件
      selectGroup(item) {
        let currentGraphModel = store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        store.commit("setSnapshotConfirm",true)//隐藏显示分组图发生变化，设置true

        //合并分组id需要拆分
        var groupIdLst = item.groupId.toString().split(',');
        //如果groupList大于0，说明点击的是合并总分组，处理合并的子分组
        if (groupIdLst.length > 1) {
          //总分组选中，子分组全部选中，总分组去勾选，子分组全部去勾选
          this.otherGroupList.forEach(function (value) {
            if (item.select) {
              value.select = true;
            } else {
              value.select = false;
            }
          })
        }
        let _this = this;
        groupIdLst.forEach(function (value, index) {
          var groupData = cy.nodes().filter(function (ele) {
            var groupId = ele.data("group");
            if (groupId == value && ele.data().rgtMrk!=1) {
              return ele;
            }
          });
          if (item.select) {
            groupData.show();
            //显示自定义标记下的小对号
            groupData.filter(function (e) {
              let keys = [];
              e._private['classes'].forEach(function (key) {
                keys.push(key);
              });
              var name = e.data().name
              let el = document.getElementById(`${name}_label`);
              if (el) {
                el.parentNode.style.display = "block";
              }else{
                if (keys.indexOf( 'l1') > -1){
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
                }else if(keys.indexOf( 'l2') > -1){
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
              //锁
              let cl = document.getElementById(`${name}_lock`);
              if(cl) {
                cl.parentNode.style.display = "block";
              }

              return;
            })
            //_this.setDefinedLable(cy,1);
          } else {
            groupData.hide();
            groupData.unselect();//隐藏节点去清除中状态
            //隐藏自定义标记下的小对号
            groupData.filter(function (e) {
              var name = e.data().name
              let keys = [];
              e._private['classes'].forEach(function (key) {
                keys.push(key);
              });
              if (keys.indexOf( 'l1') > -1 || keys.indexOf( 'l2') > -1) {
                let el = document.getElementById(`${name}_label`);
                if (el) {
                  el.parentNode.style.display = "none";
                }
              }
              //锁
              let cl = document.getElementById(`${name}_lock`);
              if(cl) {
                cl.parentNode.style.display = "none";
              }
              return;
            })
           }
        })
      },
      //色签工具栏下的小箭头控制
      showOthersGroup() {
        //显示隐藏的色签
        if (this.isShow == 0) {
          this.isShow = 1;
          $('#showOther').removeClass('addDirectLt').addClass('addDirectRb');
          $("#otherLegend").css("display", "block");
        } else {//显示隐藏的色签
          this.isShow = 0;
          $('#showOther').removeClass('addDirectRb').addClass('addDirectLt');
          $("#otherLegend").css("display", "none");
        }
      },

      dblclickSelect() {
        let currentGraphModel = store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let _this  = this;
        $("#legendPanel").on('dblclick', ".color", function (e) {
          clearTimeout(_this.timer);
          //取消右侧分析-->选中标签的高亮
          $(".f-cspaH").removeClass("f-cspaH");
          $(".f-cspCusH").removeClass("f-cspCusH");
          if (!e.ctrlKey) {
            cy.nodes().unselect();//点击是先清除之前选中的点
            $("#legendPanel").find(".color").css({
              "border": "none"
            });
          }
          $(e.target).css({"border": "1px solid black"});

          var groupList = $(e.target).attr("id").split(',');//可能是合并分组，进行统一处理
          let collectionNodes = cy.collection();//合并分组所有的点集合

          groupList.forEach(function (group) {
            var nodes = cy.nodes('[group=' + group + ']');
            collectionNodes.merge(nodes);
          })
          collectionNodes.select();//选中
          currentGraphModel.collectionNodes = cy.$(":selected")
        })
      },

      setHightLightFunction(ele, e){
        let currentGraphModel = store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let _this = this;
        let themeType = store.state.themeType;
        store.commit("setSnapshotConfirm",true)//设置高亮图发生变化，设置true
        cy.nodes().removeClass("b-nodehightlight"); //移除之前所有置灰的样式
        cy.edges().removeClass("b-edgehightlight"); //移除之前所有置灰的样式
        cy.nodes().removeClass("a-nodehightlight"); //移除之前所有置灰的样式
        cy.edges().removeClass("a-edgehightlight"); //移除之前所有置灰的样式
        var islight = ele.isLighted;
        let groupList = ele.groupId.toString().split(',');//可能是合并分组，进行统一处理
        if (islight == true || islight == undefined) {
          let collectionNodes = cy.collection();//合并分组所有的点集合
          let collectionEdges = cy.collection();//合并分组所有的线集合
          store.commit("setCollectionPlayer",groupList);//时序分析使用高亮的点

          //先筛选点，再通过点筛选线，因为存在合并分组
          groupList.forEach(function (group) {
            var nodes = cy.nodes('[group=' + group + ']');
            collectionNodes.merge(nodes);//当前分组的点
          })

          //当前分组的线
          let lineGroupData = cy.edges().filter(function (ele) {
            if(collectionNodes.contains(ele.source()) &&
                 collectionNodes.contains(ele.target())){
              return ele;
            }
          });
          collectionEdges.merge(lineGroupData);

          //合并分组，改变原始数据中的高亮状态值
          ele.isLighted = false;
          _this.allGroupList.forEach(function (e) {
            if (groupList.indexOf(e.groupId.toString()) > -1) {
              e.isLighted = false;
            } else {
              e.isLighted = true;
            }
          })
          let unCollectionNodes = cy.nodes().difference(collectionNodes);//反选其他组的节点
          let unCollectionEdges = cy.edges().difference(collectionEdges);//反选其他组的线

          if (!_.isEmpty(unCollectionNodes)) {
            if ('b' == themeType) {
              unCollectionNodes.addClass("b-nodehightlight");//非当前分组的点进行置灰
            } else {
              unCollectionNodes.addClass("a-nodehightlight");//非当前分组的点进行置灰
            }
          }
          if (!_.isEmpty(unCollectionEdges)) {
            if ('b' == themeType) {
              unCollectionEdges.addClass("b-edgehightlight");//非当前分组的线进行置灰
            } else {
              unCollectionEdges.addClass("a-edgehightlight");//非当前分组的线进行置灰
            }
          }

          $("#legendPanel").find(".color").css({
            "box-shadow": ""
          });
          $(e.target).css({"box-shadow": "0 5px 5px #666"});//当前色卡添加阴影

          var removeEls = document.querySelectorAll(".cy-title,.cy-title_dark");
          removeEls.forEach(v=>{
            let parent = v.parentNode;
            if(parent.parentNode){
              parent.parentNode.removeChild(parent);
            }
          })
          cy.nodes().forEach(function(e){
            e._private['classes'].delete('l2');//高亮去l2
            e._private['classes'].delete('l1')
          })
          this.setDefinedLable(cy,1);
          allOperation.setLabelDisplay(unCollectionNodes,collectionNodes);//隐藏置灰节点标签信息（标签不是标记）
          _this.$emit("refreshGroupStatistics", {nodes: collectionNodes, edges: collectionEdges, group: ele})
        } else {
          ele.isLighted = true;
          //合并分组，改变原始数据中的高亮状态值
          _this.allGroupList.forEach(function (e) {
            if (groupList.indexOf(e.groupId.toString()) > -1) {
              e.isLighted = true;
            }
          })
          $(e.target).css({"box-shadow": ""});//当前色卡去掉阴影
          this.setDefinedLable2(cy);//取消高亮，所有标记样式变为红色对号
          allOperation.setLabelDisplay(null,cy.nodes());//显示标签信息（标签不是标记）
          _this.$emit("refreshGroupStatistics", null)
          store.commit("setCollectionPlayer",[]);//取消高亮传空数组
        }
        cy.nodes().unselect();
        $("#legendPanel").find(".color").css({
          "border": "none"
        });
        //设置标记大小
        allOperation.setLableSize();
      },

      setHightlight(ele, e) {
        let _this  = this;
        clearTimeout(this.timer);
        this.timer =  setTimeout(function () {
          _this.setHightLightFunction(ele,e);
        },300);
      },

      initDefinedLabelCss(data) {
        let nodes = data.nodes;
        if(_.isEmpty(nodes)){
          return
        }
        //筛选隐藏节点
        let hideNodes = nodes.filter(function (e) {
          var group = e.data.group;
          var groupData = _.find(data.groups,function (ele) {
            if(ele.groupId == group){
              return ele;//返回是否勾选
            }
          })
          if(groupData != undefined && groupData.select == false){
            return e;
          }
        })

        //隐藏隐藏节点的小对号
        if(hideNodes){
          hideNodes.filter(function (e) {
            if(e.classes == 'l1' || e.classes =='l2' ){
              var name =e.data.name
              let el = document.getElementById(`${name}_label`);
              if(el){
                el.parentNode.style.display = "none";
              }
            }
            return;
          })
        }
      },

      //添加自定义标记，取消高亮调用
      setDefinedLable2(cy) {
        var removeEls = document.querySelectorAll(".cy-title,.cy-title_dark");
        removeEls.forEach(v=>{
          let parent = v.parentNode;
          if(parent.parentNode){
            parent.parentNode.removeChild(parent);
          }
        })
        cy.nodes().forEach(function(e){
          e._private['classes'].delete('l2');//高亮去l2
          e._private['classes'].delete('l1')
        })
        let currentResultDefinedLabel = store.state.currentResultDefinedLabel;
        cy.nodes().forEach(function (e) {
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
        })
        cy.resize();//触发样式更新（标记对号）
      },

      //添加自定义标记样式，隐藏时不添加，隐藏变为显示需要调用一次进行添加
      setDefinedLable(cy,source) {
        let currentResultDefinedLabel = store.state.currentResultDefinedLabel;
        let groupsInfo = this.allGroupList;
        let flag = false;//表示不存在高亮群组
        for(let i=0;i<groupsInfo.length;i++){
          if(groupsInfo[i].isLighted == false){
            flag = true;
            break;
          }
        }

        //先刪除原有的标记样式
        var removeEls = document.querySelectorAll(".cy-title,.cy-title_dark");
        removeEls.forEach(v=>{
          let parent = v.parentNode;
          if(parent.parentNode){
            parent.parentNode.removeChild(parent);
          }
        })
        cy.nodes().forEach(function(e){
          e._private['classes'].delete('l2');//高亮去l2
          e._private['classes'].delete('l1')
        })

        cy.nodes().forEach(function (e) {
          var name = e.data().name;
          let nodeLabel = _.find(currentResultDefinedLabel,function (t) {
            if(name==t.nodeId && !_.isEmpty(t.labels)){
              return t;
            }
          })
          if(nodeLabel !=undefined && !_.isEmpty(nodeLabel.labels)){
            let nodeGroup = _.find(groupsInfo,function (v) {
              if(e.data().group == v.groupId){
                return v
              }
            })

            if(nodeGroup != undefined && nodeGroup.isLighted == true && flag){
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
            }else{
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
          }
        })
        //设置标记大小
        allOperation.setLableSize();
        ////触发样式更新（标记对号）
        if(source==0){
          cy.center();
        }else{
          cy.resize()
        }
       }
    },
    beforeDestroy() {
      clearTimeout(this.timer);
    },
  }
</script>

<style scoped>
  #legendPanel{
    position: absolute;
    display: grid;
    width: 47px;
    right: 15px;
    top: 80px;
    text-align: center;
    z-index: 99;
    padding: 2px;
    border-radius: 3px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  #otherLegend {
    /*width: calc(100% + 15px);*/
    width: 55px;
    max-height: calc(100% - 23px);
    overflow-y: auto;
    position: absolute;
    bottom: 23px;
    left: -60px;
    text-align: center;
    z-index: 99;
    padding: 2px;
    border-radius: 3px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    display: none;
  }

  #legendPanel .legend {
    display: inline-flex;
    height: 20px;
    border-radius: inherit;
    margin-top: 1px;
    margin-bottom: 1px;
    padding: 2px;
    z-index: 99;
  }

  #legendPanel .legend .btn {
    display: inline-block;
    height: 16px;
    width: 16px;
    margin-top: 0px;
    margin-bottom: 3px;
    cursor: pointer;
  }

  #legendPanel .color {
  /*border-radius: 50%;*/
  /*position: relative;*/
    top: 0;
    left: -9px;
    width: 20px;
    height: 14px;
    border-radius: 3px;
    cursor: pointer;
  }

  .addDirectRb{
    width: 20px;
    height: 18px;
    margin-left: 10px;
    background: url("../../../static/image/direct_rb.png");
  }
  .addDirectLt{
    width: 20px;
    height: 18px;
    margin-left: 10px;
    background: url("../../../static/image/direct_lt.png");
  }

</style>


