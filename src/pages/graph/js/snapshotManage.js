import store from "../../../vuex/store"

export function createSnapshot(snapshotName, currentGraphModel, snapshotDescribe,sid) {
  let cy = currentGraphModel.cy;
  //隐藏节点和关系
  cy.elements(':hidden').forEach(function (ele) {
    ele.data().hidden = true;
  });
  let resultJson = cy.json().elements;
  let img = cy.png({maxWidth: 120, maxHeight: 90});
  let bigImage = cy.png();
  let taskId = currentGraphModel.taskId;
  let weight = store.state.weight;
  //扩线后保存快照,设置新的weight
  if(weight.maxNodeWeight !== 0){
    currentGraphModel.data.maxNodeWeight = weight.maxNodeWeight;
  }
  if(weight.minNodeWeight !== 0){
    currentGraphModel.data.minNodeWeight = weight.minNodeWeight;
  }
  if(weight.maxEdgeWeight !== 0){
    currentGraphModel.data.maxEdgeWeight = weight.maxEdgeWeight;
  }
  if(weight.minEdgeWeight !== 0){
    currentGraphModel.data.minEdgeWeight = weight.minEdgeWeight;
  }

  let saveNodes = _.reject(resultJson.nodes, function (node) {
    if(node.data.hidden){
      return node
    }
  });
  let saveEdges = _.reject(resultJson.edges, function (edge) {
    if(edge.data.hidden){
      return edge
    }
  });

  let groupDeleteBase = _.uniq(_.map(cy.nodes(), function (node) {
    if (!node.hidden()) {
      return node.data().group;
    }
  }));
  let saveGroups =  _.filter(currentGraphModel.data.groups, function (group) {
    if(_.includes(groupDeleteBase, group.groupId)){
      return group
    }
  });

  let saveNodeImgMarkSize = '';
  let nodeImgMarkSize = currentGraphModel.data.nodeImgMarkSize;
  if(!_.isEmpty(nodeImgMarkSize)){
    let width = nodeImgMarkSize.width1 >= 0 ? nodeImgMarkSize.width1 : 10;
    let height = nodeImgMarkSize.height1 >= 0 ? nodeImgMarkSize.height1 : 10;
    saveNodeImgMarkSize = {
      width: width,
      height: height
    }
  }
  //快照保存时间结果数据
  let statisticsList = currentGraphModel.statisticsList;
  let saveJson = {
    //取出部分属性
    nodes: _.map(saveNodes, function (node) {
      return _.pick(node, ['data', 'position', 'selected', 'locked', 'hidden'])
    }),
    edges: _.map(saveEdges, function (node) {
      return _.pick(node, ['data', 'selected', 'hidden'])
    }),
    groups: saveGroups,
    maxWeight: currentGraphModel.data.maxWeight,
    minWeight: currentGraphModel.data.minWeight,
    maxNodeWeight:currentGraphModel.data.maxNodeWeight,
    minNodeWeight:currentGraphModel.data.minNodeWeight,
    maxEdgeWeight:currentGraphModel.data.maxEdgeWeight,
    minEdgeWeight:currentGraphModel.data.minEdgeWeight,
    nodeImgMarkSize: saveNodeImgMarkSize,
    zoom: cy.json().zoom
  };
  let snapshot = {
    sname: snapshotName,
    desce: snapshotDescribe,
    taskId: taskId,
    resultJson: JSON.stringify(saveJson),
    baseImage: img,
    bigBaseImage: bigImage,
    statisticsList: JSON.stringify(statisticsList),
    sid: sid,
  };
  // store.commit("setSnapshotConfirm", false);
  return snapshot;
}

export function editSnapshotNameAndDesce(snapshotName,snapshotDescribe,sid) {
  let snapshot = {
    sname: snapshotName,
    desce: snapshotDescribe,
    sid: sid,
  };
  return snapshot;
}

export function snapshot2() {
  console.log("快照相关方法二");
}


export function snapshot3() {
  console.log("快照相关方法三");
}

