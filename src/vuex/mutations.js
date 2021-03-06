
export default {
  setCollectionPlayer(state,data){
    state.collectionPlayer = data;
  },

  //权限控制
  jurisdiction(state,data){
    state.jurisdiction = data;
  },
  //登录人姓名
  loginUser(state,data){
    state.userName=data
  },
  //图中所有对象的统计
  getModelTar(state,data){
    state.setLables=data;
  },
  showAddLabelModal(state,data){
    state.isAddLabelModal = data;
  },
  showAddNodeModal(state,data){
    state.isAddNodeModal = data;
  },
  ShowAddCaseModel(state,data){
    state.isAddCaseModal =data
 },
  showSliderModel(state,data){
    state.isshowsliderModel=data
  },
  showMoreSlider(state,data){
    state.isshowMoreSlider=data
  },
  ShowAdvancedSearchModal(state,data){
    state.isAdvancedSearchModal=data
  },
  ShowExprotSelectNodes(state,data){
    state.isExportSelectNodes=data
  },
  // 全面扩线
  showExpansionSetModal(state,data) {
    state.isExpansionSetModal = data;
  },
  // 公共关联 是否显示弹窗
  showCommonRelationModal(state,data){
    state.isCommonRelationModal = data;
  },
  // 公共关联 获取数据
  setCommonRelationList(state,data) {
    state.commonRelationList = data;
  },

  showAddEdgeModal(state,data) {
    state.isAddEdgeModal = data;
  },

  setAddEdgeData(state, data) {
    state.addEdgeData = data;
  },

  showAddSnapshotModal(state,data) {
    state.isAddSnapshotModal = data;
  },

  // 编辑快照信息
  showEditSnapshotModal(state,data) {
    state.isEditSnapshotModal = data;
  },

  // 是否显示快照弹窗
  isShowSnapshotModel(state,data){
    state.isShowSnapshot = data;
  },

  showAddTaskModal(state,data) {
    state.isAddTaskModal = data;
  },
  showRightAddTaskModel(state,data){
    state.isRightAddTaskModal= data
  },
  showNodeEditModal(state,data) {
    state.isNodeEdit = data;
  },
  showNodeSplitModal(state,data){
    state.isNodeSplit = data;
  },
  // 节点合并 弹窗是否显示
  showMergeNodeModal(state,data) {
    state.isMergeNode = data;
  },
  // 节点合并 数据
  setMergeNodeId(state,data) {
    state.mergeNodeIdList = data;
  },
  Sliderlvl(state,data){
    state.Sliderlvl=data;
  },
  setNewlvl(state,data){
    state.newlvl=data;
  },
  maxKshell(state,data){
    state.maxKshell=data;
  },
  minKshell(state,data){
    state.minKshell=data;
  },
  labellvls(state,data){
    state.labellvls=data;
  },
  ResultJsons(state,data){
    state.resultJsons=data;
  },
  currentZoom(state,data){
    state.currentZoom=data;
  },
  baseLabelsFus(state,data){
    state.baseLabelsFus=data
  },
  baseLabelsNodes(state,data){
    state.baseLabelsNodes=data;
  },
  setCurrentResultDefinedLabel(state,data) {
    state.currentResultDefinedLabel = data;
  },
  queryBaseDictionData(state,data){
    state.queryBaseDictionData=data
  },
  setDefaultNodeImgList(state,data) {
    state.defaultNodeImgList = data;
  },

  setGraphModel(state, data) {
    state.graphModelList = data
  },

  graphModelAdd(state, model) {
    state.graphModelList.push(model)
  },

  setDeleteGraph(state, data) {
    state.deleteGraph = data
  },

  setLogoutState(state, data) {
    state.isLogout = data
  },

  setCurrentGraphId(state, data) {
    state.currentGraphId = data
  },

  setCurrentGraphModel(state, data) {
    state.currentGraphModel = data
  },

  setWeight(state, data) {
    state.weight = data
  },

  setNewGraphIndex(state, data) {
    state.newGraphIndex = data
  },

  showStatisticsAndAnalyzeCon(state, data) {
    state.isLoadStatisticsAndAnalyzeCon = data
  },

  showTaskCon(state, data) {
    state.isLoadTaskCon = data
  },

  showColorBar(state, data) {
    state.showColor = data
  },

  setRightConTabName(state, data) {
    state.rightConTabName = data
  },
  splitNodeSelectData(state, data){
    state.splitNodeSelectData = data;
  },
  nodeProDict(state, data){
    state.nodeProDict = data;
  },
  removeGroupCombinationFlag(state, data){
    state.removeGroupCombinationFlag = data;
  },
  removeManualCombination(state, data) {
    state.removeManualFlag = data
  },
  modelRid(state,data){
    state.modelRid = data;
  },

  setChildTaskStatus(state,data){
    state.loadChildTaskStatus = data;
  },
  themeType(state,data){
    state.themeType = data;
  },
  setEdgeTypeList(state, data){
    state.edgeTypeList = data;
  },
  //右键菜单显示标识
  rightMenuReady(state,data){
    state.rightMenuReady = data;
  },
  //撤销
  mergeBeforeEdges(state,data){
    state.mergeBeforeEdges = data;
  },
  mergeBeforeNode(state,data){
    state.mergeBeforeNode = data;
  },
  mergeAfterAddEdges(state,data){
    state.mergeAfterAddEdges = data;
  },

  setSnapshotConfirm(state,data){
    state.isSnapshotConfirm = data;
  },

  isAddRelation(state,data){
    state.isAddRelation = data;
  },
  //产品介绍
  showProductModal(state,data){
    state.isProductModal = data
  },
  //设置分组
  setGroups(state,data){
    state.groups = data
  },
  setGroupsAll(state,data){
    state.groupsAll = data;
  },
  setGroupsBase(state,data){
    state.groupsBase = data;
  },
  graphLoad(state,data){
    state.graphLoad = data;
  },
  closeCase(state,data){
    state.closeCase = data;
  },
  //修改任务名称
  caseNameModal(state,data){
    state.caseNameModal=data;
  },
  rightClick_position(state,data){
    state.rightClick_position=data;
  },
  menuAddNode(state,data){
    state.menuAddNode=data;
  }
}


