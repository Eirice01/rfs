import store from  "../../../vuex/store"
/**
 * 布局切换
 * @param layoutName
 */
export function changeLayout(layoutName){
  store.commit("showSliderModel", false);
  setTimeout(function () {
    let currentGraphModel = store.state.currentGraphModel;
    let cy = currentGraphModel.cy;

    cy._private.layoutName = layoutName;
    var options = getOptions(layoutName, currentGraphModel, cy);
    var layout;

    if (currentGraphModel.collectionNodes && currentGraphModel.collectionNodes.length > 1) { //局部布局
      let collectionDatas = cy.$(":selected")  //当前选中的节点
      if ('euler' != layoutName) {
        collectionDatas.merge(cy.edges()) //添加边，影响树形布局
      }
      if (cy.nodes().length == collectionDatas.length) {//全选节点相当于全部布局
        layout = cy.elements().layout(options);
      } else {
        layout = cy.elements(collectionDatas).layout(options);
      }
      layout.run();
    } else if(cy.elements().length > 1){ //整体布局
      layout = cy.elements().layout(options);
      layout.run();
    }

    //解决同心圆点少时切换布局后点过大的问题
    if (currentGraphModel.data.nodes.length < 50) {
      if ('concentric' == layoutName || 'euler' == layoutName) {
        cy.zoom(1 - currentGraphModel.data.nodes.length / 50);
        cy.center()
      }
    }
    store.commit("showSliderModel", true)
  }, 10);

}

/**
 * 布局参数设置
 * @param layoutName
 */
function getOptions(layoutName,currentGraphModel,cy) {
  var options={
    name:layoutName,
    avoidOverlap:true,
    boundingBox:undefined
  };;

  if('breadthfirst'==layoutName){
    options = {
      name:layoutName,
      avoidOverlap:true,
      animate:'end',
      boundingBox:undefined
    };
    //设置当前节点为根节点
    if(cy._private.curNode){
      options.roots=cy._private.curNode;
    }
  }else if('euler'==layoutName){
    options = {
      name:layoutName,
      avoidOverlap:true,
      boundingBox:undefined,
      maxIterations:2000, //布局退出前的最大迭代
      maxSimulationTime:10000 //布局退出前的最大时间
    };
  }

  //局部布局设置布局位置
  if(!_.isEmpty(cy._private.curNode) && !_.isEmpty(currentGraphModel.collectionNodes) && currentGraphModel.collectionNodes.length>1){
    options.boundingBox = {x1:cy._private.curNode.position().x,y1:cy._private.curNode.position().y,w:300,h:300};
  }
  return options;
}






