import store from  "../../../vuex/store"
import mutations from  "../../../vuex/mutations"
import * as Handle from './handle'
import {Message} from 'iview'
import axios from '@/utils/axios'
import * as urlApi from "@/../api/urlsConfig"
import * as d3 from "d3";
/**
 *新增案件标识节点
 */
export function addCasnodes(data) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  currentGraphModel.ur.do("add",data.graphVo);
  //右键点击坐标
  let rightClick_position = store.state.rightClick_position;
  let menuAddNode = store.state.menuAddNode;

  let layout = cy.nodes('[mark='+1+']').layout({
    name:"grid",
    fit:false,
    boundingBox:{x1:menuAddNode ?rightClick_position.x: 0,y1:menuAddNode ?rightClick_position.y: 0,w:1,h:1},
    avoidOverlap: true,
    type:'star'
  });
  layout.run();
  if (!menuAddNode) {
    if(cy.nodes('[mark=' + 1 + ']').length === 1){
      cy.zoom(1)
    }
    cy.center(cy.nodes('[mark=' + 1 + ']'));
  }
  cy.nodes().unselect();
  //取消右侧分析-->选中标签的高亮
  $(".f-cspaH").removeClass("f-cspaH");
  $(".f-cspCusH").removeClass("f-cspCusH");
  let addNodeIds = _.map(_.map(data.graphVo.nodes, 'data'), 'id');
  _.each(cy.nodes(), function (node) {
    if(_.includes(addNodeIds, node.id())){
      node.select()
    }
  });

  //新增点的标识替换
  _.each(cy.nodes('[mark='+1+']'), function(node){
    node.data().casemark = 0;
    node.data().mark = 0;
  });
  //案件标识号码设置形状  参数：shape,  star:形状名称
  let nodes=cy.nodes('[casemark='+0+']');
  cy.style()
    .selector(nodes)
    .style("shape","star")
    .update();
  //显示标记对号
  addMarkImg(cy, nodes, data.definedLabel);
  //添加数据至当前model
  refreshRightCon(cy);
}
/**
 * 新增节点
 */
export function addNode(data) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  // cy.add(data.graphVo);
  currentGraphModel.ur.do("add",data.graphVo);
  //右键点击坐标
  let rightClick_position = store.state.rightClick_position;
  let menuAddNode = store.state.menuAddNode;

  let layout = cy.nodes('[mark='+1+']').layout({
    name:"grid",
    fit:false,
    boundingBox:{x1:menuAddNode ?rightClick_position.x: 0,y1:menuAddNode ?rightClick_position.y: 0,w:1,h:1},
    avoidOverlap: true
  });
  layout.run();
  if (!menuAddNode) {
    if(cy.nodes('[mark=' + 1 + ']').length === 1){
      cy.zoom(1)
    }
    cy.center(cy.nodes('[mark=' + 1 + ']'));
  }
  cy.nodes().unselect();
  //取消右侧分析-->选中标签的高亮
  $(".f-cspaH").removeClass("f-cspaH");
  $(".f-cspCusH").removeClass("f-cspCusH");
  cy.nodes('[mark='+1+']').select();
  //选中添加的点，包含与已有的点重复的点
  let addNodeIds = _.map(_.map(data.graphVo.nodes, 'data'), 'id');
  _.each(cy.nodes(), function (node) {
    if(_.includes(addNodeIds, node.id())){
      node.select()
    }
  });

  //显示标记对号
  addMarkImg(cy, cy.nodes('[mark='+1+']'), data.definedLabel);
  //新增点的标识替换
  _.each(cy.nodes('[mark='+1+']'), function(node){
    node.data().mark = 0
  });
  // if(!menuAddNode){
  //   cy.center(cy.nodes('[mark='+0+']'));
  // }
  //添加数据至当前model
  refreshRightCon(cy);
  // //未保存显示任务星号
  // let taskStarId = currentGraphModel.taskModel.taskStarId;
  // if(taskStarId && document.getElementById(taskStarId)) {
  //   document.getElementById(taskStarId).style.visibility = 'visible';
  // }
}

/**
 * 扩线查询
 * @param data
 * @param cy
 */
export function expandLine(data, cy) {
  // cy.remove("[id='" + cy._private.curNode.id() + "']");
  //当为新添加的点，删除后显示扩线后的点
  let currentGraphModel = store.state.currentGraphModel;
  let graphVo = data.graphVo;
  let connectedEdges = cy._private.curNode.connectedEdges();
  let expandCurrentNode = _.find(graphVo.nodes, function (node) {
    if(node.data.name === cy._private.curNode.data('name') && node.data.type === cy._private.curNode.data('type')) {
      return node;
    }
  });
  if(cy._private.curNode.data('id')=== cy._private.curNode.data('name')){
    cy.remove("[id='" + cy._private.curNode.id() + "']");
  }else {
    //过滤掉当前点
    graphVo.nodes = _.reject(graphVo.nodes, expandCurrentNode);
    //过滤当前图上已有的线
    graphVo.edges = _.reject(graphVo.edges, function (addEdge) {
      return _.find(connectedEdges, function (edge) {
        if (addEdge.data.type === edge.data('type')
          && addEdge.data.source === edge.data('source')
          && addEdge.data.target === edge.data('target')) {
          return addEdge
        }
      })
    });
    cy.nodes("[id='" + cy._private.curNode.id() + "']").data().flag = 1;
  }
  let newData = {nodes: graphVo.nodes, edges: graphVo.edges};

  //将手动添加的线重新加到画布中
  let newEdges = [];
  _.each(connectedEdges, function (edge) {
    let newEdge = {data: edge.data()};
    if(newEdge.data.source === cy._private.curNode.data('id')){
      newEdge.data.source = expandCurrentNode.data.id
    }
    if(newEdge.data.target === cy._private.curNode.data('id')){
      newEdge.data.target = expandCurrentNode.data.id
    }
    newEdges.push(newEdge)
  });
  newData.edges = _.flatten([newData.edges, newEdges]);
  currentGraphModel.ur.do("add", newData);
  // //给当前扩线点加标识
  let curNode_x= cy._private.curNode.position().x;
  let curNode_y= cy._private.curNode.position().y;
  let layout = cy.nodes('[flag='+1+']').layout({
    name:"concentric",
    fit:false,
    boundingBox:{x1: curNode_x, y1: curNode_y, w: 1,h: 1},
    avoidOverlap: true
  });
  layout.run();
  cy.nodes().unselect();
  //取消右侧分析-->选中标签的高亮
  $(".f-cspaH").removeClass("f-cspaH");
  $(".f-cspCusH").removeClass("f-cspCusH");
  cy.nodes('[flag='+1+']').select();
  //当前节点为已有节点，重复添加标记隐藏会出问题
  cy.nodes("[id='" + cy._private.curNode.id() + "']").data().flag = 0;
  //显示标记对号
  addMarkImg(cy, cy.nodes('[flag='+1+']'), data.definedLabel);

  _.each(cy.nodes('[flag='+1+']'), function(node){
    node.data().flag = 0
  })
  resetWeightStyle(cy,currentGraphModel,graphVo)
}
//扩线完成重新设置点线大小粗细
function resetWeightStyle(cy,currentGraphModel,graphVo){
  let weight = store.state.weight;
  let data = currentGraphModel.data;
  let linear;//点大小比例尺
  let nodear;//线粗细比例尺
  if(null != data.maxEdgeWeight && undefined != data.maxEdgeWeight){
    let maxEdgeWeight = 0;
    let minEdgeWeight = 0;
    graphVo.maxEdgeWeight = 10;
    graphVo.maxNodeWeight = 10;
    if(data.maxEdgeWeight >= graphVo.maxEdgeWeight){
      maxEdgeWeight = data.maxEdgeWeight;
    }else{
      maxEdgeWeight = graphVo.maxEdgeWeight;
      weight.maxEdgeWeight = maxEdgeWeight;//保存快照用，替换原有最大比重
    }

    if(data.minEdgeWeight >= graphVo.minEdgeWeight){
      minEdgeWeight = graphVo.minEdgeWeight;
      weight.minEdgeWeight = minEdgeWeight;
    }else{
      minEdgeWeight = data.minEdgeWeight;
    }
    linear = d3.scaleLinear().domain([minEdgeWeight,maxEdgeWeight]).range([1,3.2]);

    let maxNodeWeight = 0;
    let minNodeWeight = 0;

    if(data.maxNodeWeight >= graphVo.maxNodeWeight){
      maxNodeWeight = data.maxNodeWeight;
    }else{
      maxNodeWeight = graphVo.maxNodeWeight
      weight.maxNodeWeight = maxNodeWeight;
    }

    if(data.minNodeWeight >= graphVo.minNodeWeight){
      minNodeWeight = graphVo.minNodeWeight;
      weight.minNodeWeight = minNodeWeight;
    }else{
      minNodeWeight = data.minNodeWeight
    }
    store.commit('setWeight', weight);

    nodear = d3.scaleLinear().domain([minNodeWeight,maxNodeWeight]).range([16,32]);

    cy.style()
      .selector("edge")
      .style('width',function (e) {
        if(null == data.maxEdgeWeight || undefined == data.maxEdgeWeight){
          e.data().edgewidth = 1;
          return 1
        }
        else{
          if(undefined==linear(e._private.data.weight)){
            return 1
          }else {
            let edgewidth=linear(e._private.data.weight)
            e.data().edgewidth = edgewidth;
            return edgewidth;
          }

        }
      })
      .update();

    cy.style()
      .selector("node")
      .style('height',function (e) {
        if(null == data.maxNodeWeight || undefined == data.maxNodeWeight){
          e.data().height1 = 16;
          return 16
        }else{
          if(undefined == nodear(e._private.data.weight)){
            e.data().height1 = 16;
            return 16;
          }else{
            let height = nodear(e._private.data.weight);
            //存储节点高
            e.data().height1 = height;
            return height
          }
        }
      })
      .style('width',function (e) {
        if(null == data.maxNodeWeight || undefined == data.maxNodeWeight){
          //存储节点宽
          e.data().width1 = 16;
          return 16
        }else{
          if(undefined == nodear(e._private.data.weight)){
            e.data().width1 = 16;
            return 16;
          }else{
            let width = nodear(e._private.data.weight);
            e.data().width1 = width;
            return width
          }
        }
      })
      .update();
  }
}
/**
 * 节点隐藏
 */
export function hideNodes(nodes) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let selectNode =  cy.$(":selected");
  if(nodes){
    selectNode = nodes
  }
  if(selectNode.length>0){
    _.forEach(selectNode,function (value) {
      if(value.locked()==true){
         value.show()
      }else {
        value.data().tollMark=1;
        value.hide();
        value.unselect();
        if (value._private.classes.size > 0) {//节点隐藏同时隐藏有标记的小对号
          var name = value.data().name
          let el = document.getElementById(`${name}_label`);
          if (el) {
            el.parentNode.style.display = "none";
          }
        }
      }
    })
  }

}

/**
 * 节点显示
 */
export function showNodes(flag,nodes) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let selectNode =  cy.$(":hidden");
  cy.edges().show();
  if(nodes){
    selectNode = nodes;
  }
  let show = false;
  _.filter(selectNode,function (node) {
    if(node.data().tollMark==1 || flag){
      node.show();
      node.data().tollMark=0;
      show = true;
    }
  });
  if(selectNode.length>0 && (show || flag)){//节点显示同时显示有标记的小对号
    _.forEach(selectNode,function (value) {
      var name = value.data().name;
      if (value._private.classes.size > 0&&value.data().tollMark==0) {
        let el = document.getElementById(`${name}_label`);
        if (el) {//有标记类，并且找到div,显示原有div
          el.parentNode.style.display = "block";
        }else{//有标记类未找到div,新加div
          //画布大小切换时会清除掉标记对号的div(原因未发现),重新添加标记div
          let currentResultDefinedLabel = store.state.currentResultDefinedLabel;
          let nodeLabel = _.find(currentResultDefinedLabel,function (t) {
            if(name==t.nodeId && !_.isEmpty(t.labels)){
              return t;
            }
          })
          if(nodeLabel !=undefined && !_.isEmpty(nodeLabel.labels)){
            if(value.style().display!='none'){//隐藏节点不显示
              let keys = [];
              value._private['classes'].forEach(function (key) {
                keys.push(key);
              });
              if (keys.indexOf( 'l1') > -1) {
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
              else if(keys.indexOf( 'l2') > -1){//应对先隐藏，再置灰，最后又显示的问题
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
          }
        }
      }
    })
  }
}
/**
 * 点/框选节点删除
 */
export function deleteNodes() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let collection = cy.collection();

  let nodes = cy.$(":selected");

  let deleteNodes=_.filter(nodes,function (node) {
    if (!node.locked()) {
      return node
    }
  });

  collection.merge(deleteNodes);
  currentGraphModel.ur.do("remove",collection);
  cy.scratch('deleteNode',collection);   //利用暂存区存储被删除的元素  可使用 window.cy.scratch(deleteNode) 查看该暂存区内的值
  cy.scratch('deleteNode');
  //有节点删除切换任务弹出是否保存快照提示框
  if(deleteNodes.length>0){
    store.commit("setSnapshotConfirm",true);
    //分组处理
    let nodesAll = currentGraphModel.data.nodes;
    let groupBase = _.groupBy(nodesAll,function (node) {
      return node.data.group;
    })

    if(currentGraphModel.data.groups){
      dealGroups(cy,deleteNodes,collection);
      let groups = [];
      _.each(groupBase,function (value,groupId) {
        var group = {
          "select": true,
          "groupId": 3,
          "num": 0
        }
        group.groupId = groupId;
        group.num = value.length;
        if(groupId != "undefined"){
          groups.push(group)
        }
      })
      store.commit("setGroups",groups);
    }
  }

  if(currentGraphModel.data.nodes.length == deleteNodes.length) {
    store.commit("showColorBar", false);
  }

  //刷新右侧统计树
  refreshRightCon(cy);
  //未保存显示任务星号
  // let taskStarId = currentGraphModel.taskModel.taskStarId;
  // if(taskStarId && document.getElementById(taskStarId)) {
  //   document.getElementById(taskStarId).style.visibility = 'visible';
  // }
}

function dealGroups(cy,deleteNodes,collection) {
  var groupsAll = store.state.groupsAll;
  var groupsBase= store.state.groupsBase;

  //未删除的nodes
  let noDeleteNodes = cy.nodes().difference(collection);
  if(noDeleteNodes.length==0){//说明节点全部删除
    groupsAll.groups = [];
    groupsAll.otherGroupList = [];
    groupsAll.ready = false;
    groupsAll.colorDispaly = false;
  }else{
    let groups = groupsAll.groups;
    let otherGroupList = groupsAll.otherGroupList;

    let groupDeleteBase = _.map(deleteNodes,function (node) {
        return node.data().group;
    })
    let groupsDelete = _.uniq(groupDeleteBase);//删除节点的分组集合

    if(groupsDelete.length>0){
      let groupsRepeat = _.map(noDeleteNodes, function (node) {
        return node.data().group;
      })
      let groupLst = _.uniq(groupsRepeat);//存在节点的分组集合
      let deleteGroups = [];//彻底删除的分组，节点中不再存在
      groupsDelete.forEach(function (e) {
        if(groupLst.indexOf(e) <= -1){
          deleteGroups.push(e)
        }
      })

      if(deleteGroups.length>0){
        if(otherGroupList.length>0){
          _.remove(otherGroupList,function (e) {
            return deleteGroups.indexOf(e.groupId) > -1
          })
          if(otherGroupList.length==0){//移除合并分组
            groups = _.dropRight(groups)
            groupsAll.ready = false;
          }
        }
        _.remove(groups,function (e) {
          return deleteGroups.indexOf(e.groupId) > -1
        })
      }
    }
    groupsAll.groups = groups;
    groupsAll.otherGroupList = otherGroupList;
    groupsAll.colorDispaly = true;
    store.commit("setGroupsAll",groupsAll)
  }
}
/**
 * 获取锁定的节点
 */
function nodesLocked() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  // let s=cy.nodes()
  return cy.$(":selected").locked()
}

/**
 * 节点禁用
 */
export function unSelectify(cy) {
  cy.$(":locked").lock();
  cy.nodeHtmlLabel(
    [
      {
        query:':locked',
        halign:'top',
        valign:'right',
        cssClass:'locked-node',
        tpl:function (data) {
          return `<div id=${data.name}_lock></div>`;
        }
      }
    ]
  );
  //改变图标大小
  let currentGraphModel = store.state.currentGraphModel;
  let nodeImgMarkSize = currentGraphModel.data.nodeImgMarkSize;
  if(!_.isEmpty(nodeImgMarkSize)){
    _.each($('.cy-title,.cy-title_dark,.locked-node'), function(e){
      $(e).css({'width': nodeImgMarkSize.width, height: nodeImgMarkSize.height})
    });
  }
}

/**
 * 节点解锁
 */
export function Selects() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  cy.$(":selected").unlock();
}

/**
 *清除选中状态
 */
export function unselect() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  if(currentGraphModel.collectionNodes != undefined){
    currentGraphModel.collectionNodes.length = 0;
    cy.nodes().forEach(function (ele,i,eles) {
      ele.unselect();
      currentGraphModel.collectionNodes = currentGraphModel.collectionNodes.union(ele);
    });
  }
  $('#toolbar span').css({backgroundColor:'',boxShadow: ''})
}
/**
 * 导出选中节点
 */
export  function exportSelectNodes() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let nodes =cy.$(":selected");
  if(nodes.length>0){
   return true
  }
}
//解锁，清除解锁标记
export  function  unSelectifys() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let nodes=_.filter(cy.nodes(),function (node) {
     if(node.locked()){
       return node
     }
  })
  _.each(nodes,function (node) {
    node.data().isLock = 0;
    let name = node.data().name;
    let el = document.getElementById(`${name}_lock`).parentNode
    el.className = "unlocked-node";
  })
  cy.nodes().unlock();
}
/**
 * 视图刷新，隐藏节点显示
 */
export function reset() {
  showNodes();
  unselect();
  unSelectifys();
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let cyRef = cy;
  //同心圆，力，预设布局点数少时刷新会变化大小，进行特殊处理
  if(currentGraphModel.data.nodes != undefined && currentGraphModel.data.nodes.length <= 15
    && ('concentric' == cy._private.layoutName
      || 'preset'  == cy._private.layoutName
      ||  'euler'== cy._private.layoutName )){
  }else{
    let options = store.state.options;//滚轮缩放参数
    var elesToFit = options.fitSelector?cyRef.elements(options.fitSelector):cyRef.elements();
    if( elesToFit.size() === 0 ){
      cyRef.reset();
    } else {
      var animateOnFit = typeof options.animateOnFit === 'function' ? options.animateOnFit.call() : options.animateOnFit;
      if(animateOnFit){
        cyRef.animate({
          fit: {
            eles: elesToFit,
            padding: options.fitPadding
          }
        }, {
          duration: options.fitAnimationDuration
        });
      } else {
        cyRef.fit( elesToFit, options.fitPadding );
      }
    }
  }
  //刷新图形恢复之前的样式
  cy.nodes().removeClass('otherNodeColor');
  cy.edges().removeClass('otherEdgeColor');
  cy.zoom(store.state.currentZoom);
  cy.center();
}
/**
 * 撤销
 */
export function undoHandler() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  //先撤销，再显示节点取消选中
  if(!currentGraphModel.ur.isUndoStackEmpty()) {
		currentGraphModel.ur.undo();
  }
  showNodes(true,null);
  unselect();
  //刷新右侧统计树
  refreshRightCon(cy);
  if(currentGraphModel.data.groups && currentGraphModel.data.groups.length > 0){
    refreshColorBar(cy);
    store.commit("showColorBar", true);
  }
}

function deepClone(obj) {
  let _obj = JSON.stringify(obj);
  let objClone = JSON.parse(_obj);
  return objClone;
}

function refreshColorBar(cy) {
  //根据图上的点计算分组，用于分组更新后色条刷新
  var nodesAll =  cy.json().elements.nodes;
  let groupBase = _.groupBy(nodesAll,function (node) {
    return node.data.group;
  })

  //图上存在点的group集合
  let groupLst = [];
  _.each(groupBase,function (value,groupId) {
    var group = {
      "select": true,
      "groupId": 3,
      "num": 0
    }
    group.groupId = groupId;
    group.num = value.length;
    if(groupId != "undefined"){
      groupLst.push(group)
    }
  })

   let groupIdLst = _.map(groupLst,function (e) {
     return e.groupId;
   })

  let groupsBase = store.state.groupsBase;
  //深copy一份初始化分组信息操作，始终不能更改初始化分组信息
  let groupsAll = deepClone(groupsBase);
  let groups  = groupsAll.groups;
  let otherGroupList = groupsAll.otherGroupList;
  let groupsNew = [];
  let otherGroupListNew = [];
  //重组新的group，和原来的顺序保持一致
  groups.forEach(function (e,id) {
    if(groupIdLst.indexOf(e.groupId.toString())>-1){
      groupsNew.push(e);
      groupsAll.colorDispaly = true;//有分组显示色条
      groupsAll.ready =false;//合并分组小箭头
    }
  })

  let mergeGroupId = "";
  otherGroupList.forEach(function (e,id) {
    if(groupIdLst.indexOf(e.groupId.toString())>-1){
      otherGroupListNew.push(e);
      mergeGroupId = mergeGroupId + e.groupId + ",";
    }
  })
  mergeGroupId = mergeGroupId.substring(0,mergeGroupId.length-1)

  //合并分组不为空，加入groupsNew
  if(mergeGroupId != ""){
    let mergeGroup = groups[groups.length-1];//groups最后一个组为合并分组
    mergeGroup.groupId = mergeGroupId;//更新最后一个分组的id，其他信息不变

    groupsNew.push(mergeGroup);
    groupsAll.colorDispaly = true;
    groupsAll.ready =true;
  }
  groupsAll.groups = groupsNew;
  groupsAll.otherGroupList = otherGroupListNew;
  store.commit("setGroupsAll",groupsAll);
  store.commit("setGroups",groupLst);
}
/**
 * 保存
 */
export function saveNodes() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let newNodeList  =  cy.json();
  return newNodeList;
}


/**
 * 导出图片
 */
export function downloadImg(name) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let theme = store.state.themeType;
  let bgColor;
  if(theme == "a") {
    bgColor = "#10143f";
  } else if(theme == "b") {
    bgColor = "#fff";
  }
  var datas = cy.png({bg:bgColor});
  downloadFile(name,datas)
}
/**
 * base64转blob
 */
 function base64ToBlob(code) {
  let parts = code.split(';base64,');
  let contentType = parts[0].split(':')[1]; //处理拿到的数据
  let raw =window.atob(parts[1]);
  let rawLength = raw.length;
  let uInt8Arry = new Uint8Array(rawLength);
  for (let i=0;i<rawLength;i++) {
    uInt8Arry[i]= raw.charCodeAt(i);
  }
  return new Blob([uInt8Arry],{type:contentType});
}
/**
 * 预下载处理
 */
function downloadFile(fileName,content) {
  let aLink =document.createElement('a');
  let blob= base64ToBlob(content);
  let evt = document.createEvent("HTMLEvents");
  evt.initEvent("click",false,true);               //initEvent 不加这两个参数在FF会报错，事件类型，是否冒泡，是否组织浏览器默认行为
  aLink.download=fileName;
  aLink.href=URL.createObjectURL(blob);
  $('#toolbar span').css({backgroundColor:'',boxShadow: ''});

  aLink.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window})); //兼容火狐
}

/**
*复制
 */
export function Copy(e) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
   return cy.clipboard().copy(cy.$(":selected"))
}

/**
 *粘贴
 */
export function Paste() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  currentGraphModel.ur.do('paste');
}

/**
 *自由选择
 */
export function freeSelectNodes() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  //禁止鼠标移动图形
  cy.userPanningEnabled(false);
  cy.panningEnabled(false);
  var $container = $($(cy.container())[0]);
  var w = $container.width();
  var h = $container.height();
  var drawLayer = document.getElementById("draw");
  var drawCtx = drawLayer.getContext('2d');
  showDrawLayer();

  drawLayer.onmousedown = function (ev) {
    var x = ev.offsetX;
    var y = ev.offsetY;
    drawCtx.beginPath();
    drawCtx.moveTo(x, y);
    document.onmousemove = function (em) {
      var x2 = em.offsetX;
      var y2 = em.offsetY;
      drawCtx.lineTo(x2, y2);
      drawCtx.stroke();
    };
    document.onmouseup = function (e) {
      $("#legendPanel").find(".color").css({
        "border": "none"
      });//移除色签选中样式
      $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
      drawCtx.closePath();
      document.onmousemove = null;
      document.onmouseup = null;
      let nodesSelect = cy.nodes().filter(function (ele) {
        let n = ele.renderedPosition();
        let x = n.x;
        let y = n.y;
        if (!ele.hidden() && drawCtx.isPointInPath(x, y)) {
          return ele;
        }
      });

      //取消右侧分析-->选中标签的高亮
      $(".f-cspaH").removeClass("f-cspaH");
      $(".f-cspCusH").removeClass("f-cspCusH");
      if (!e.ctrlKey) {
        cy.nodes().unselect();//清除之前选择的节点
        cy.$(nodesSelect).select();
        currentGraphModel.collectionNodes = cy.$(":selected");
      }else{
        cy.$(nodesSelect).select();
        currentGraphModel.collectionNodes = cy.$(":selected");
      }
      $("#draw").hide();
      cy.userPanningEnabled(true);
      cy.panningEnabled(true);
    };
  };
}
/**
 *拉框选择
 */
export function frameSelect() {
  $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  //禁止鼠标移动图形
  cy.userPanningEnabled(false);
  cy.panningEnabled(false);
  var $container = $($(cy.container())[0]);
  var w = $container.width();
  var h = $container.height();
  var drawLayer = document.getElementById("draw");

  var drawCtx = drawLayer.getContext('2d');
  showDrawLayer();

  var startX, startY, endX, endY;
  drawLayer.onmousedown = function (ev) {
    var x = ev.offsetX;
    var y = ev.offsetY;
    startX = ev.offsetX;
    startY = ev.offsetY;
    document.onmousemove = function (em) {
      var x2 = em.offsetX - x;
      var y2 = em.offsetY - y;
      endX = em.offsetX;
      endY = em.offsetY;
      drawCtx.clearRect(0, 0, w, h);
      drawCtx.fillRect(x, y, x2, y2);
      drawCtx.strokeRect(x, y, x2, y2);
    };
    document.onmouseup = function (e) {
      $("#legendPanel").find(".color").css({
        "border": "none"
      });//移除色签选中样式
      $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
      document.onmousemove = null;
      document.onmouseup = null;

      let nodesSelect = cy.nodes().filter(function (ele) {
        var n = ele.renderedPosition();
        var x3 = n.x;
        var y3 = n.y;
        if ( !ele.hidden() && (
          (endX > x3 && x3 > startX && endY > y3 && y3 > startY) ||
          (endX > x3 && x3 > startX && endY < y3 && y3 < startY) ||
          (endX < x3 && x3 < startX && endY < y3 && y3 < startY) ||
          (endX < x3 && x3 < startX && endY > y3 && y3 > startY))
        ) {
          return ele;
        }
      });
      //取消右侧分析-->选中标签的高亮
      $(".f-cspaH").removeClass("f-cspaH");
      $(".f-cspCusH").removeClass("f-cspCusH");
      if (!e.ctrlKey) {
        cy.nodes().unselect();
        cy.$(nodesSelect).select();
        currentGraphModel.collectionNodes = cy.$(":selected");
      }else{
        cy.$(nodesSelect).select();
        currentGraphModel.collectionNodes = cy.$(":selected");
      }
      $("#draw").hide();
      cy.userPanningEnabled(true);
      cy.panningEnabled(true);
    };
  };
}
/**
 *圆形选择
 */
export function circleSelect(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  //禁止鼠标移动图形
  cy.userPanningEnabled(false);
  cy.panningEnabled(false);
  var $container = $($(cy.container())[0]);
  var w = $container.width();
  var h = $container.height();
  var drawLayer = document.getElementById("draw");
  var drawCtx = drawLayer.getContext('2d');
  showDrawLayer();

  drawLayer.onmousedown = function (ev) {
    let x = Math.abs(ev.offsetX);
    let y = Math.abs(ev.offsetY);
    document.onmousemove = function (em) {
      let currentX = em.offsetX -x;
      let currentY = em.offsetY -y;
      let r = Math.sqrt(currentX*currentX+currentY*currentY);
      drawCtx.beginPath();
      drawCtx.clearRect(0, 0, w, h);
      drawCtx.arc(x, y, r, 0,Math.PI*2,true);
      drawCtx.stroke();
    };
    document.onmouseup = function (e) {
      $("#legendPanel").find(".color").css({
        "border": "none"
      });//移除色签选中样式
      $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
      drawCtx.closePath();
      document.onmousemove = null;
      document.onmouseup = null;
      let nodesSelect = cy.nodes().filter(function (ele) {
        var n = ele.renderedPosition();
        var x = n.x;
        var y = n.y;
        // let id = ele.json().data.id;
        // cy.$("#"+id).json({selected:true});
        if (!ele.hidden() && drawCtx.isPointInPath(x, y)){
          return ele;
        }
      });

      //取消右侧分析-->选中标签的高亮
      $(".f-cspaH").removeClass("f-cspaH");
      $(".f-cspCusH").removeClass("f-cspCusH");
      if (!e.ctrlKey) {
        cy.nodes().unselect();//清除之前选择的节点
        cy.$(nodesSelect).select();
        currentGraphModel.collectionNodes = cy.$(":selected");
        console.log(cy.$(":selected").jsons());
      }else{
        cy.$(nodesSelect).select();
        currentGraphModel.collectionNodes = cy.$(":selected");
      }
      $("#draw").hide();
      cy.userPanningEnabled(true);
      cy.panningEnabled(true);
    };
  };
}


/**
 * 区域放大
 */
export function frameEnlarge(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let $container = $(cy.container());
  let w = $container.width();
  let h = $container.height();
  let drawLayer = document.getElementById("draw");
  let drawCtx = drawLayer.getContext('2d');
  showDrawLayer();
  let startX, startY, endX, endY;
  drawLayer.onmousedown = function (ev) {
    let x = ev.offsetX;
    let y = ev.offsetY;
      startX = ev.offsetX;
      startY = ev.offsetY;
    let dw = 0, dh = 0;
    drawLayer.onmousemove = function (em) {
      dw = em.offsetX - x;
      dh = em.offsetY - y;
      endX = em.offsetX;
      endY = em.offsetY;
      drawCtx.clearRect(0, 0, w, h);
      drawCtx.fillRect(x, y, dw, dh);
      drawCtx.strokeRect(x, y, dw, dh);
    };
    drawLayer.onmouseup = function (e) {
      $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
      drawLayer.onmousemove = null;
      drawLayer.onmouseup = null;

      let nodesSelect = cy.nodes().filter(function (ele) {
        var n = ele.renderedPosition();
        var x3 = n.x;
        var y3 = n.y;
        if (
          (endX > x3 && x3 > startX && endY > y3 && y3 > startY) ||
          (endX > x3 && x3 > startX && endY < y3 && y3 < startY) ||
          (endX < x3 && x3 < startX && endY < y3 && y3 < startY) ||
          (endX < x3 && x3 < startX && endY > y3 && y3 > startY)
        ) {
          return ele;
        }
      });
      //cy.$(nodesSelect).select();
      if (dw > 0 && dh > 0) {
        var zoomIn = w/dw;
        // cy.zoom({
        //   level:zoomIn,
        //   position:{x:x,y:y}
        // });

        //cy.panBy({x:x,y:y});

        let options = store.state.options;
        //let factor = 1 + options.zoomFactor + zoomIn;
        let factor = 1 + options.zoomFactor + 0.1;
        zoom(factor);

        cy.center(cy.$(nodesSelect));
      }
      $("#draw").hide();
    }
  };
}

/**
 * 区域缩小
 */
export function frameZoomout(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  var $container = $($(cy.container())[0]);
  var w = $container.width();
  var h = $container.height();
  var drawLayer = document.getElementById ("draw");
  var drawCtx = drawLayer.getContext('2d');
  showDrawLayer();

  var startX, startY, endX, endY;
  drawLayer.onmousedown = function (ev) {
    var x = ev.offsetX;
    var y = ev.offsetY;
    startX = ev.offsetX;
    startY = ev.offsetY;
    var dw = 0, dh = 0;
    drawLayer.onmousemove = function (em) {
      dw = em.offsetX - x;
      dh = em.offsetY - y;
      endX = em.offsetX;
      endY = em.offsetY;
      drawCtx.clearRect(0, 0, w, h);
      drawCtx.fillRect(x, y, dw, dh);
      drawCtx.strokeRect(x, y, dw, dh);
    };
    drawLayer.onmouseup = function (e) {
      $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
      drawLayer.onmousemove = null;
      drawLayer.onmouseup = null;
      let nodesSelect = cy.nodes().filter(function (ele) {
        var n = ele.renderedPosition();
        var x3 = n.x;
        var y3 = n.y;
        if (
          (endX > x3 && x3 > startX && endY > y3 && y3 > startY) ||
          (endX > x3 && x3 > startX && endY < y3 && y3 < startY) ||
          (endX < x3 && x3 < startX && endY < y3 && y3 < startY) ||
          (endX < x3 && x3 < startX && endY > y3 && y3 > startY)
        ) {
          return ele;
        }
      });

      if (dw > 0 && dh > 0) {
        var zoomIn = dw/w;
        // cy.zoom({
        //   level:zoomIn//,
        //   // position:{x:x,y:y}
        // });
        //cy.panBy({x:-x,y:-y});

        let options = store.state.options;
        // let factor = 1 + options.zoomFactor-zoomIn;
        let factor = 1/(1 + options.zoomFactor + 0.1);
        zoom(factor);
        cy.center(nodesSelect);
      }
      $("#draw").hide();
    }
  };
}
/**
 * 框选区域
 */
function showDrawLayer(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  var $container = $($(cy.container())[0]);
  var w = $container.width();
  var h = $container.height();
  var drawLayer = document.getElementById("draw");
  var drawCtx = drawLayer.getContext('2d');

  $("#draw").show();
  drawLayer.width = w;
  drawLayer.height = h;
  drawLayer.style.cursor = "crosshair";
  drawCtx.clearRect(0, 0, w, h);
  drawCtx.strokeStyle = "rgb(204,10,10)";
  drawCtx.fillStyle = "rgba(204,10,10,.3)";
  drawCtx.strokeWidth = 1;
  drawCtx.lineWidth = 1;
}

/**
*添加关系
* */
export function addRelation(node, cy) {
  cy.eh.enable();
  cy.eh.start(node);
  store.commit("isAddRelation",true);
  let el = document.querySelector("div[name='canvasContainer'] canvas:first-of-type");
  el.onmouseout = function(){
    cy.eh.stop();
    store.commit("isAddRelation",false);
  }
}

//手动增加连线
export function addEdge(cy) {
  let _this = this;
  let options = {
    complete: function (sourceNode, targetNode, addedEles) {
      cy.eh.disable();
      store.commit("showAddEdgeModal", true);
      store.commit("setAddEdgeData", addedEles.data());
    },
    stop: function () {
      //停止后屏蔽连线行为
      cy.eh.disable()
    },
    cancel: function () {
      //取消连线后屏蔽连线行为
      store.commit("isAddRelation",false);
      cy.eh.disable()
    }
  };
  let eh = cy.edgehandles(options);
  //关闭绘图模式
  eh.disableDrawMode();
  //初始化屏蔽连线行为
  eh.disable();
  cy.eh = eh;
}

/**
 *放大
 */
export function enlargeGraph() {
  let options = store.state.options;
  let factor = 1 + options.zoomFactor;
  zoom(factor);
}

/**
 *缩小
 */
export function shrinkGraph() {
  let options = store.state.options;
  let factor = 1/(1 + options.zoomFactor)
  zoom(factor);
}

/**
 * 滚轮缩放
 * @param cy
 */
export function mouseZoom(cy) {
  let options = store.state.options;//滚轮缩放参数
  let factor;
  cy.userZoomingEnabled(false);//false不使用框架自带的zoom事件
  document.onmousewheel = function (e) {
    if(e.target.tagName == "CANVAS"){
      let event = e|| window.event;
      if(event.wheelDelta < 0){ //向下滚动
        factor = 1/(1 + options.zoomFactor + 0.2);
      }else{  //向上滚动
        factor = (1 + options.zoomFactor + 0.2);
      }
      zoom(factor);
    }
  };

}

/**
 * 缩放关系图核心代码
 * @param factor
 */
function zoom(factor) {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let options = store.state.options;//滚轮缩放参数
  let cyRef = cy,$container = "",zx, zy,zooming = false;
  $(cy.container()).each(function(){
    $container = $(this);
  });
  startZooming();
  doZoom();

  function startZooming(){
    zooming = true;
    zx = $container.width()/2;
    zy = $container.height()/2;
  }
  function doZoom() {
    var zoom = cyRef.zoom();
    var lvl = cyRef.zoom() * factor;

    if( lvl < options.minZoom ){
      lvl = options.minZoom;
    }
    if( lvl > options.maxZoom ){
      lvl = options.maxZoom;
    }
    if( (lvl == options.maxZoom && zoom == options.maxZoom) ||
      (lvl == options.minZoom && zoom == options.minZoom)
    ){
      return;
    }
    zoomTo(lvl);
  }
  function zoomTo(level){
    if(!zooming){
      zx = $container.width()/2;
      zy = $container.height()/2;
    }
    cyRef.zoom({
      level: level,
      renderedPosition: { x: zx, y: zy }
    });
    if(window.popper) {
      window.popper.scheduleUpdate();
    }

  }
}
/**
 * 节点反选
 */
export function opposeNodes(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  cy.$('.addBorderColor').removeClass('addBorderColor');
  //取消右侧分析-->选中标签的高亮
  $(".f-cspaH").removeClass("f-cspaH");
  $(".f-cspCusH").removeClass("f-cspCusH");
  cy.nodes().forEach(function (ele,i,eles) {
    let id = ele.json().data.id;
    currentGraphModel.collectionNodes = cy.collection();
    if(ele.selected()){
      ele.unselect()
    }else {
      ele.select()
      // cy.$("#"+id).json({selected:true});
      //currentGraphModel.collectionNodes = currentGraphModel.collectionNodes.union(ele);
    }
  });
  currentGraphModel.collectionNodes = cy.$(":selected");
}
/**
 * 节点编辑
 */
export function nodeEdit() {
  store.commit("showNodeEditModal", true);
}
/**
 * 拆分节点
 */
export function splitNode(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  if(cy.nodes(':selected').length !==1){
    Message.warning('请选择一个点！');
    return false;
  }
  let selectedNode = cy.nodes(':selected')[0];
  let entityLabels = selectedNode.data().entityLabels;
  if(entityLabels && Object.keys(entityLabels).length > 0){
    store.commit("showNodeSplitModal",true);
  }
  else {
    store.commit("showStatisticsAndAnalyzeCon", true);
    Message.warning('该节点无可拆分属性！');
  }
}


/**
 * 对数组去重
 */
function unique(arr) {
  let x = new Set(arr);
  return [...x];
}

/**
 * 手动组合
 */
export function manualCombination() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  cy._private.customManualRules = []; //创建一个空的手动组合rule
  store.commit("removeManualCombination",true);
  let isGroupComb = store.state.removeGroupCombinationFlag;
  var currentNodes = currentGraphModel.collectionNodes;//用户手动选中的点

  if(isGroupComb) { //团体组合开启
    let checkedGroup = [];  //用户选中的点中包含的组Id
    let allMoveNodes = null;
    _.each(currentNodes.jsons(),function (node) {
      checkedGroup.push(node.data.group);
    });
    let checkedUniqGroup = unique(checkedGroup);//去重后的组Id

    _.each(checkedUniqGroup,function (groupItem) {
      if(allMoveNodes==null){
        allMoveNodes = cy.nodes('[group='+groupItem+']');
      }else{
        allMoveNodes = allMoveNodes.union(cy.nodes('[group='+groupItem+']'));
      }
    });

    cy._private.customManualRules.push(cy.automove({
      nodesMatching:allMoveNodes,
      reposition:'drag',
      dragWith:allMoveNodes
    }));

  } else {  //团体组合未开启
    cy._private.customManualRules.push(cy.automove({
      nodesMatching:currentNodes,
      reposition:'drag',
      dragWith:currentNodes
    }));
  }
}

/**
 * 取消手动组合
 */
export function removeManualCombination() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let allManualComb =  cy._private.customManualRules;
  _.each(allManualComb,function(rule) {
    rule.destroy();
  });
  cy._private.customManualRules = [];
  store.commit("removeManualCombination",false);
}


/**
 * 团体组合
 */
export function groupCombination() {
  store.commit("removeGroupCombinationFlag",true);
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let allGroup = currentGraphModel.data.groups;
  cy._private.customAutoMoveRules = [];//团体组合生成的rules


  for(let i=0; i<allGroup.length; i++) {
    cy._private.customAutoMoveRules.push(cy.automove({
      nodesMatching:cy.nodes('[group='+allGroup[i].groupId+']'),
      reposition:'drag',
      dragWith:cy.nodes('[group='+allGroup[i].groupId+']')
    }));
  }
}

/**
 * 取消团体组合
 */

export function removeGroupCombination() {
  store.commit("removeGroupCombinationFlag",false);
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let autoRules = cy._private.customAutoMoveRules;
   _.each(autoRules,function(rule) {
     rule.destroy();
   });
  cy._private.customAutoMoveRules = [];

}


/**
 * 合并节点
 */
export function mergeSelected() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let curNode = cy._private.curNode;
  let selectNode = cy.nodes(":selected");
  let nodeProBase = store.state.queryBaseDictionData.nodePro;
  let baseDictionData = store.state.dictionDataAll;
  let labelsData = store.state.currentResultDefinedLabel;
  var mergeNodeIdList = [];
  if(selectNode.length == 2){
    cy.nodes(":selected").forEach(function (value) {
      let data = value.data();
      let itemInfo = {
        currentNode: [],
        // currentNode: {
        //   name: '',
        //   type: '',
        // },
        labelInfo:[],
        signLabel:[],
        entityInfo:[],
        staticProperties:[]
      };
      itemInfo.currentNode.push({'name': data.name,'isEqual': false});
      let nodePro = _.find(nodeProBase, {'label': data.type});
      // itemInfo.currentNode.type = _.isEmpty(nodePro) ? '' : nodePro.indexName;
      if(data.labels!=undefined){
        Object.keys(data.labels).forEach((item,index)=>{
          var t = _.find(baseDictionData,['dicCode',item]);
          if(!_.isEmpty(t)&&t.dicCode!="00000"){
            itemInfo.labelInfo.push({
              'dicName':t.dicName,
              'dicVal':data.labels[t.dicCode],
              'isEqual': false
            })
          }
        })
      }
      let  labelData = _.filter(labelsData, ['nodeId', data.name]);
      let labelLst = [];
      if(!_.isEmpty(labelData)){
        labelLst = labelData[0].labels;
      }
      if( !_.isEmpty(labelLst)){
        labelLst.forEach((item,index)=>{
          itemInfo.signLabel.push({'dicName': item.labelName,'isEqual': false})
        })
      }
      _.each(data.entityLabels, function (entityLabel, entityType) {
        let entityPro = _.find(nodeProBase, {'label': entityType});
        if(!_.isEmpty(entityLabel)){
          itemInfo.entityInfo.push({
            dicName: _.isEmpty(entityPro) ? entityType : entityPro.name,
            dicVal: entityLabel,
            isEqual: false
          })
        }
      });
      _.each(data.properties, function (value, name) {
        itemInfo.staticProperties.push({
          dicName: _.isEmpty(nodePro.proList[name]) ? name : nodePro.proList[name],
          dicVal: value,
          isEqual: false
        })
      });
      mergeNodeIdList.push(itemInfo);
    });
    store.commit("setMergeNodeId",mergeNodeIdList);
    store.commit("showMergeNodeModal",true);
    // refreshRightCon(cy);
  }else{
    Message.warning('合并已选节点为两个！');
  }
}

/**
 * 人本溯源
 */
export function findRoot() {
  store.commit("showStatisticsAndAnalyzeCon", false);
  let currentGraphModel = store.state.currentGraphModel;
  let baseDictionData = store.state.queryBaseDictionData;
  let cy = currentGraphModel.cy;

  let nodeProBase = baseDictionData.nodePro;
  let name = cy._private.curNode.data().name;
  let nodeLabel = cy._private.curNode.data().type;
  this.nodePro = _.find(nodeProBase, {'label': nodeLabel});
  let indexLabel = _.isEmpty(this.nodePro) ? '' : this.nodePro.indexLabel;
  let edgeLst = _.isEmpty(this.nodePro) ? '' : this.nodePro.edgeList;
  let edgeLabel = "";
  if(!_.isEmpty(this.nodePro)){
    _.forEach(edgeLst,function (e) {
      if(!e.dyFlag){
        edgeLabel = edgeLabel + e.label + ','
      }
    })
    edgeLabel = edgeLabel.substring(0,edgeLabel.length-1)
  }
  axios.request({
    method: 'get',
    params: {
      node:name,
      nodeLabel:nodeLabel,
      indexlabel:indexLabel,
      edgeLabel:edgeLabel
    },
    url:urlApi.URL.queryHumanisticByStaticBank,
    success: (data) => {
      if(data.code === 200) {
        let nodesl = data.data.graphVo.nodes.length;
        let edgesl = data.data.graphVo.edges.length;
        let humanisticId = data.data.graphVo.humanisticId;//进行溯源的身份证id
        let connectedEdges = cy._private.curNode.neighborhood().connectedEdges();
        if(nodesl == 0 && edgesl == 0) {
          Message.info('没有可溯源的节点！');
        } else {
          let graphVo = data.data.graphVo;

          //过滤掉当前节点
          graphVo.nodes = _.reject(graphVo.nodes, function (node) {
            if(node.data.id === cy._private.curNode.id()) {
              return node;
            }
          });
          //给溯源的点添加标识
          _.each(graphVo.nodes, function (node) {
            node.data.flag = 2
        });
          //过滤掉图上已有的线
          graphVo.edges = _.reject(graphVo.edges, function (addEdge) {
            addEdge.data.flag = 2
            return _.find(connectedEdges, function (edge) {
              if (addEdge.data.type === edge.data('type')
                && addEdge.data.source === edge.data('source')
                && addEdge.data.target === edge.data('target')) {
                addEdge.data.flag = 0
                return addEdge
              }
            })
          });
          let newData = {nodes: graphVo.nodes, edges: graphVo.edges};
          // cy.add(graphData);
          currentGraphModel.ur.do("add", newData);
          //给当前溯源点加标识
          cy.nodes("[id='" + cy._private.curNode.id() + "']").data()['flag'] = 2;
          let curNode_x= cy._private.curNode.position().x;
          let curNode_y= cy._private.curNode.position().y;
          let centerId = "";

          let layout = cy.elements('[flag='+2+']').layout({
            name:'breadthfirst',//concentric
            //circle:true,
            fit:false,
            boundingBox:{x1: curNode_x + 50, y1: curNode_y+50, w: 1,h: 1},
            avoidOverlap: true,
            roots: cy.nodes("[id='" + humanisticId + "']"),
            // concentric:function(node){
            //   if(node._private.data.name == 'D5025' || node._private.data.name == '15619945555' || node._private.data.name == '15319944393'){
            //     return 3;
            //   }else if(node._private.data.name == '610502199901021124'){
            //     return 6;
            //   }else{
            //     return 1;
            //   }
            // },
            //
          });

          layout.run();
          cy.nodes().unselect();
          //取消右侧分析-->选中标签的高亮
          $(".f-cspaH").removeClass("f-cspaH");
          $(".f-cspCusH").removeClass("f-cspCusH");
          cy.nodes('[flag='+2+']').select();
          cy.nodes("[id='" + cy._private.curNode.id() + "']").data()['flag'] = 0;
          //显示标记对号
          addMarkImg(cy, cy.nodes('[flag='+2+']'), data.data.definedLabel);
          _.each(cy.nodes('[flag='+2+']'), function(node){
            node.data().flag = 0
          })
          resetWeightStyle(cy,currentGraphModel,graphVo)
          //添加数据至当前model
          currentGraphModel.data.nodes = cy.json().elements.nodes;
          currentGraphModel.data.edges = cy.json().elements.edges;
          store.commit("showStatisticsAndAnalyzeCon", true);
        }
      }
    },
    error: (data) => {
      Message.warning('溯源失败！');
    }
  });
}

/**
 *  共同关联
 */
export function commonRelation() {
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let curNode = cy._private.curNode;
  let selectNode = cy.nodes(":selected");
  let nodeProBase = store.state.queryBaseDictionData.nodePro;
  let baseDictionData = store.state.queryBaseDictionData;
  let edgePro = baseDictionData.edgePro;
  // let labelList = baseDictionData.flagLabel;
  let nodePro = baseDictionData.nodePro;
  let nodeNameList = []; // 对象名称
  let nodeType = []; // 对象类型
  let edgeType = []; // 关系类型
  if(selectNode.length > 1){
    cy.nodes(":selected").forEach(function (value) {
      let data = value.data();
      if(nodeType.indexOf(data.type) == -1){
        nodeType.push(data.type);
      }
    });
    if(nodeType.length > 1){
      Message.warning("选中点的类型不一致");
    }else{
      nodeType = _.filter(nodePro, function (pro) {
        return _.includes(nodeType, pro.label)
      });
      edgeType = _.isEmpty(nodeType[0].label) ? [] : nodeType[0].edgeList;

      nodeNameList = _.map(selectNode, function (node) {
        let nodePro = _.find(nodeProBase, {'label': nodeType[0].label});
        node.data().typeName = _.isEmpty(nodePro) ? '' : nodePro.indexName;
        return node.data();
      });
      let commonRelationList = {
        "nodeNameList": nodeNameList,
        "nodeType": nodeType,
        // "labelList": labelList,
        "edgeType": edgeType,
      };
      store.commit("setCommonRelationList",commonRelationList);
      store.commit("showCommonRelationModal",true);
    }
  }else{
      Message.warning("共同关联至少选中两个点");
  }
}

/**
 * 最短路径
 */
export function shortestPath(cy, nodes) {
  //移除所有置灰
  cy.nodes().removeClass("b-nodehightlight");
  cy.nodes().removeClass("a-nodehightlight");
  cy.edges().removeClass("b-edgehightlight");
  cy.edges().removeClass("a-edgehightlight");

  let aStar = cy.elements().aStar({root:nodes[0], goal:nodes[1]});
  let firstDistance = aStar.distance;
  let selectNodes = cy.collection();
  let selectEdges = cy.collection();
  if(aStar.found){
    let selectEle = aStar.path.edges().select();
    selectNodes.merge(aStar.path.nodes());
    selectEdges.merge(aStar.path.edges());
    recursionShortestPath(selectEle, nodes, selectNodes, selectEdges, firstDistance, cy.elements());
    setAshOther(cy, selectNodes, selectEdges);
  }else {
    Message.warning('没有最短路径！');
  }
}

/**
 * 递归显示多条相同最短路径
 */
export function recursionShortestPath(selectEle, nodes, selectNodes, selectEdges, firstDistance, elements) {
  _.each(selectEle, function (ele) {
    let residueEle = elements.difference(ele);
    residueEle.merge(selectNodes);
    let aStar = residueEle.aStar({root:nodes[0], goal:nodes[1]});
    let distance = aStar.distance;
    if(aStar.found && distance === firstDistance){
      let cirSelectEle = aStar.path.edges().select();
      selectNodes.merge(aStar.path.nodes());
      selectEdges.merge(aStar.path.edges());
      recursionShortestPath(cirSelectEle, nodes,  selectNodes, selectEdges, firstDistance, residueEle)
    }
  })
}

//置灰非最短路径
function setAshOther(cy, collectionNodes, collectionEdges) {
  let themeType = store.state.themeType;
  let unCollectionNodes = cy.nodes().difference(collectionNodes);//反选非最短路径的节点
  let unCollectionEdges = cy.edges().difference(collectionEdges);//反选非最短路径的线

  if (!_.isEmpty(unCollectionNodes)) {
    if ('b' === themeType) {
      unCollectionNodes.addClass("b-nodehightlight");//非最短路径的点进行置灰
    } else {
      unCollectionNodes.addClass("a-nodehightlight");//非最短路径的点进行置灰
    }
  }
  if (!_.isEmpty(unCollectionEdges)) {
    if ('b' === themeType) {
      unCollectionEdges.addClass("b-edgehightlight");//非最短路径的线进行置灰
    } else {
      unCollectionEdges.addClass("a-edgehightlight");//非最短路径的进行置灰
    }
  }
  setLabelDisplay(unCollectionNodes,collectionNodes);//隐藏置灰节点标签信息
  setLabelStyle(unCollectionNodes,collectionNodes);//置灰标记
}

/**
 * 添加任务
 */
export function addNewTask(){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let nodes =cy.$(":selected");
  if(nodes.length>0) {
    store.commit("showRightAddTaskModel", true)
  }
}

//画布变化刷新右侧统计菜单
export function refreshRightCon(cy) {
  let currentGraphModel = store.state.currentGraphModel;
  currentGraphModel.data.nodes = cy.json().elements.nodes;
  currentGraphModel.data.edges = cy.json().elements.edges;
  store.commit('setCurrentGraphModel', currentGraphModel);
  store.commit("showStatisticsAndAnalyzeCon", true);
  //store.commit("showColorBar", true);
}

/**
 *置灰隐藏标签，高亮显示标签
 * @param unCollectionNodes
 * @param collectionNodes
 */
export function setLabelDisplay(unCollectionNodes,collectionNodes){
  let currentGraphModel = store.state.currentGraphModel;
  let cy = currentGraphModel.cy;
  let Sliderlvl=store.state.Sliderlvl;
  let newlvl = store.state.newlvl;
  let newZoom = cy.zoom();
  //选中标签code集合
  let baseLabelList=store.state.baseLabelsFus;

  if (!_.isEmpty(unCollectionNodes)) {
    cy.style()
      .selector(unCollectionNodes)
      .style('label','')
      .style('text-halign','right')
      .update();
  }

  if(Sliderlvl!=0){
    if(newZoom>=newlvl){
      if(baseLabelList.length==0){
        cy.style()
          .selector(collectionNodes)
          .style('label','data(name)')
          .style('text-halign','right')
          .update();
      }else {
        cy.style()
          .selector(collectionNodes)
          .style('label',function (evt) {

            if(evt._private.data.labels == undefined){
              return '';
            }
            return getLabelNode(baseLabelList,evt)
          })
          .style('text-halign','right')
          .update();
      }
    }
  }else{
    cy.style()
      .selector("node")
      .style('label','')
      .update();
  }


}

export function getLabelNode(baseLabelList,evt){
  let o='';
  if(baseLabelList.length==1){
    for (let i=0;i<baseLabelList.length;i++){
      if(evt._private.data.labels[baseLabelList[i]]==undefined){
        o=o+' '
      }else {
        o=evt._private.data.labels[baseLabelList[i]]
      }
    }
  }else {
    for (let i=0;i<baseLabelList.length;i++){
      if(evt._private.data.labels[baseLabelList[i]]==undefined){
        o=o+' '+',';
      }else {
        o=o+evt._private.data.labels[baseLabelList[i]]+','
      }
    }
    o = _.trimEnd(o, ',');
  }
  return o;
}

/**
 * 置灰高亮节点标记样式适配
 */
export function setLabelStyle(unCollectionNodes,collectionNodes) {
  let currentResultDefinedLabel = store.state.currentResultDefinedLabel;
  let removeEls = document.querySelectorAll(".cy-title,.cy-title_dark");
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

  unCollectionNodes.forEach(function (e) {
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
  });

  collectionNodes.forEach(function (e) {
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
}


/**
 * 添加节点显示标记对号
 */

export function addMarkImg(cy, nodes, definedLabel) {
  nodes.forEach(function (node) {
    var name = node.data().name;
    let nodeLabel = _.find(definedLabel,function (t) {
      if(name===t.nodeId && !_.isEmpty(t.labels)){
        return t;
      }
    });
    if(nodeLabel && !_.isEmpty(nodeLabel.labels)){
      node.addClass('l1')
      let name = node.data().name;
      if(node.style().display!='none'){//隐藏节点不显示
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
  });
  //合并标记
  let currentResultDefinedLabel = store.state.currentResultDefinedLabel;
  currentResultDefinedLabel = _.compact(_.uniqBy(_.flatten([currentResultDefinedLabel, definedLabel]), 'nodeId'));
  store.commit("setCurrentResultDefinedLabel",currentResultDefinedLabel);
}

export function setLableSize() {
  setTimeout(function () {
    let currentGraphModel = store.state.currentGraphModel;
    let nodeImgMarkSize = currentGraphModel.data.nodeImgMarkSize;
    if(!_.isEmpty(nodeImgMarkSize)){
      let width = nodeImgMarkSize.width1 >= 0 ? nodeImgMarkSize.width1 : 10;
      let height = nodeImgMarkSize.height1 >= 0 ? nodeImgMarkSize.height1 : 10;
      _.each($('.cy-title,.cy-title_dark,.locked-node'), function(e){
        $(e).css({'width': width, height: height})
      });
    }
  }, 1)
}
