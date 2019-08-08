<template>
  <div id="leftCon" :class="isActive ? 'active' : ''">
    <div class="SearchCase">
         <span title="设置" class="searchtitle">
         <Icon type="md-settings" @click.native="treeSet"/>
        </span>
      <Input search placeholder="回车搜索"
             style="width: 180px;"
             :maxlength="nameLength" size="small"
             v-model="searchCaseName" @on-search="filterTreeData"/>
    </div>
    <div>
      <Tree id="caseTreeList" style="margin-top: 20px;" :data="caseTreeData" :load-data="loadTaskData"
            :render="renderContent" ref="tree"></Tree>
    </div>
    <add-task ref="addTask" @addNewTask="addNewTask"></add-task>
    <set-case-tree ref="setcasetree" @intCaseTree="queryCaseTree" @initLoadFirstCase="initLoadFirstCase"
                   root="root"></set-case-tree>
    <set-case-name ref="setcasename" @changeTaskname="changeTaskname"></set-case-name>
  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import AddTask from "@/components/modals/AddTask"
  import * as CanvasManage from '../graph/js/canvasManage'
  import GraphModel from "../graph/js/GraphModel"
  import * as uuId from "../../utils/uuid"
  import SetCaseTree from "@/components/modals/SetCaseTree"
  import SetCaseName from "@/components/modals/SetCaseName"

  export default {
    name: "leftCon",
    data() {
      return {
        treeHeight: '',
        treeModal: false,
        caseTreeData: [],
        currentCase: "",
        nameLength: 20,
        searchCaseName: '',
        caseFirst: '',
        clickTask: '',
        flag: true,
        checkTop: '',
        root: [],
        currentSelectTask: '',
        changeTaskid: ''
      }
    },

    props: ["isActive"],

    components: {
      AddTask,
      SetCaseTree,
      SetCaseName
    },
    created() {
      this.queryCaseTree()
    },
    watch: {
      // treeHeight:function (val,oldval) {
      //   //if(val>855){
      //     $("#leftCon").css({maxHeight:this.height,overflowY:'auto',transaction:'all .5s'})
      //   //}
      // }
    },
    mounted() {
    },
    computed: {
      addable: function () {
        return this.$store.state.jurisdiction.addable;
      },
      deletable: function () {
        return this.$store.state.jurisdiction.deletable;
      }
    },
    methods: {
      //指标初始化
      StartSetLvl() {
        this.$emit("setSingleLvl")
      },
      //左侧树滚动条
      treeScroll() {
        this.treeHeight = $("#leftCon").height();
      },
      //案件树设置
      treeSet() {
        this.$refs.setcasetree.treeSets()
      },

      //使用Vux管理树节点数据
      queryCaseTree(data) {
        this.$http.request({
          method: 'get',
          params: data,
          url: URL.queryCaseTree,
          success: (data) => {
            if (data.code === 200) {
              this.caseTreeData = data.data;
              this.flag = true;
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        })
      },
      //自定义标签
      queryCurrentResultDefinedLabel(rid, newGraphModel) {
        if (rid) {
          this.$http.request({
            method: 'get',
            params: {
              rid: rid,
              code: 0
            },
            url: URL.queryCurrentResultDefinedLabel,
            success: (data) => {
              if (data.code === 200) {
                let currentResultDefinedLabel = data.data;
                this.$store.commit("setCurrentResultDefinedLabel", currentResultDefinedLabel);
                this.$store.commit('setCurrentGraphModel', newGraphModel);
              }
            },
            error: (data) => {
              this.$Message.warning('请求数据失败！')
            }
          })
        } else {
          this.$store.commit('setCurrentGraphModel', newGraphModel);
          this.$store.commit("setCurrentResultDefinedLabel", []);
        }
      },

      //搜索展开
      searchUploadTaskData(item, callback) {
        let _this = this;
        setTimeout(() => {
          this.$http.request({
            method: 'get',
            params: {caseId: item.id},
            url: URL.queryTaskList,
            success: (data) => {
              if (data.code === 200) {
                //搜索给选中任务添加背景
                if (_this.currentCase.id === item.id) {
                  _.each(data.data, function (task) {
                    if (task.taskId === _this.currentSelectTask.taskId) {
                      task.selected = true;
                      return false
                    }
                  })
                }
                callback(data.data);
                // _this.flag=true;
              }
              this.treeScroll()
            },
            error: (data) => {
              this.$Message.warning('请求数据失败！');
            }
          })
        }, 10);
      },

      //筛选数据
      filterTreeData(e) {
        let _this = this;
        if (e.trim() != '') {
          let filterData = [];
          _this.checkTop = '';
          $('#caseTreeList .ivu-tree-title').each(function () {
            if ($(this).hasClass('mark')) {
              $(this).removeClass("mark")
            } else if ($(this).hasClass('first')) {
              $(this).removeClass("first")
            }

          });
          _.each(this.root, function (item) {
            if (item.node.type === 'case') {
              _this.searchUploadTaskData(item.node, (response) => {
                if (!response) return;
                item.node.children = response;
                item.node.expand = true;
              });
            } else {
              item.node.expand = true;
            }
          });
          setTimeout(() => {
            let themes = _this.$store.state.themeType;
            $('#caseTreeList .ivu-tree-title').css({background: ''});
            if (_this.searchCaseName != '') {
              if (_this.caseFirst != '' && _this.clickTask == '') {
                $('#caseTreeList .ivu-tree-title').eq(0).css({background: '#5E7A9E', color: '#ffffff'})
                $('#caseTreeList .ivu-tree-title').eq(0).addClass('first')
              }
              if (_this.clickTask != '') {
                $('#caseTreeList .ivu-tree-title').each(function () {
                  if (_this.clickTask == $(this).html()) {
                    $(this).css({background: '#5E7A9E'})
                  }
                })
              }
              if (themes == 'a') { // 皮肤a下 即：蓝色背景下
                $('#caseTreeList .ivu-tree-title').each(function () {
                  if (_.includes($(this).html(), _this.searchCaseName)) {
                    $(this).css({background: '#959cd8'});
                    $(this).addClass("mark");
                    filterData.push($(this)[0]);
                  }
                });
                if (filterData.length != 0) {
                  _this.checkTop = (filterData[0].getBoundingClientRect().top + 40);
                }
              } else {
                $('#caseTreeList .ivu-tree-title').each(function () {
                  if (_.includes($(this).html(), _this.searchCaseName)) {
                    $(this).css({background: '#959cd8'});
                    $(this).addClass("mark");
                    filterData.push($(this)[0]);
                  }
                });
                if (filterData.length != 0) {
                  _this.checkTop = (filterData[0].getBoundingClientRect().top + 40);
                }
              }
            } else {
              if (_this.caseFirst != '' && _this.clickTask == '') {
                $('#caseTreeList .ivu-tree-title').eq(0).css({background: '#5E7A9E', color: '#ffffff'})
              }
            }
            _this.changeScorrl(_this.checkTop);
          }, 500);
        }
      },
      //滚动条改变
      changeScorrl(top) {
        // document.getElementById('leftCon').scrollTop=$("#leftCon").height()-this.checkTop;
        document.getElementById('leftCon').scrollTop = top - 120;
      },
      //时间转换
      /*   changeTime(time){
           let date=new Date(time);
           let Y= date.getFullYear()+'-';
           let M= (date.getMonth()+1<10 ?'0'+(date.getMonth()+1):date.getMonth()+1)+'-';
           let D= date.getDate()+' ';
           let H= date.getHours()+':';
           let m= date.getMinutes()+':';
           let s= date.getSeconds();
           return Y+M+D+H+m+s;
         },*/
      //请求图数据
      queryLayoutData(task) {
        let _this = this;
        //给任务树设置已有taskId
        let currentGraphModel = this.$store.state.currentGraphModel;
        let currentTaskModel = currentGraphModel.taskModel;
        // if(!_.isEmpty(currentGraphModel.taskModel) && task.taskName === currentTaskModel.taskName){
        //   task.taskId = currentGraphModel.taskId
        // }
        //前端打包测试
        let url = URL.querySnapshotData2;
        this.$http.request({
          method: 'get',
          params: {taskId: task.taskId, code: 0},
          url: URL.debug ? url : URL.queryResultJsonById,
//               url:url,  //前端打包测试
          success: (data) => {
            if (data.code === 200) {
              //清除分析模型定时刷新
              clearInterval(window.anaModelTimer);
              clearInterval(window.anaModelCacheTimer);
              let dataJason = _.isEmpty(data.data) ? {nodes: []} : data.data.resultJson;
              let id = _.isEmpty(data.data) ? '' : data.data.id;
              let graphId = uuId.getUUID("graph");
              let newGraphModel = new GraphModel(graphId, task.taskId, dataJason, id);
              newGraphModel.taskModel = task;
              newGraphModel.statisticsList = data.data.statisticsList;
              newGraphModel.code = 0;
              //当有任务时
              newGraphModel.undefinedTask = false;
              this.$store.commit("showStatisticsAndAnalyzeCon", false);
              this.$store.commit("showTaskCon", false);
              this.$store.commit("showColorBar", false);
              this.queryCurrentResultDefinedLabel(id, newGraphModel);
              // this.$store.commit('setCurrentGraphModel', newGraphModel);
              this.$store.commit("Sliderlvl", 0);//标签指标初始化
              this.$store.commit("baseLabelsFus", []);//选择属性标签初始化
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //右键添加任务
      rightAddTask(taskName, caseID) {
        this.$http.request({
          method: 'get',
          params: {taskName: taskName, caseID: caseID},
          url: URL.checkTaskNameIsExists,
          success: (data) => {
            if (data.code === 200 && data.data === "1") {
              this.$store.commit("showRightAddTaskModel", false);
              this.rightSaveTask(taskName, caseID);
            } else {
              this.$Message.warning('新增任务名称已存在,请重新命名！');
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //右键区域任务保存
      rightSaveTask(taskName, caseID) {
        let _this = this;
        let currentCases = _.find(this.root, function (item) {
          return item.node.id == caseID
        });
        this.$store.commit("showColorBar", false);
        this.$store.commit("showSliderModel", false);
        //保存任务
        this.$http.request({
          method: 'post',
          params: {taskName: taskName, caseId: caseID},
          url: URL.saveOrUpdateTaskDatas,
          success: (data) => {
            if (data.code === 200) {
//                  let time = this.changeTime(data.data.createtime);
              const children = currentCases.node.children || [];
              let taskModel = {
                taskId: data.data.taskId,
                createUser: data.data.createUser,
                createtime: data.data.createtime,
                caseId: currentCases.node.id,
                caseName: currentCases.node.title,
                taskName: taskName,
                showButton: "2",
                expand: true,
                selected: true,
              };
              this.clearSelected();
              children.push(taskModel);
              this.$set(currentCases, 'children', children);
              this.clickTask = taskModel.taskName;
              _this.caseFirst = taskModel.taskName;
              this.currentSelectTask = taskModel;
              CanvasManage.rightTaskAdd(taskModel);
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //树修改任务名称
      changeTaskname(newname, id, caseid) {
        //修改任务名产验证
        this.$http.request({
          method: 'get',
          params: {taskName: newname, taskId: id, caseId: caseid},
          url: URL.checkTaskNameIsExists,
          success: (data) => {
            if (data.code === 200 && data.data === "1") {
              this.$store.commit("caseNameModal", false);
              this.saveNewTask(newname, id)
            } else {
              this.$Message.warning('任务名称重复,请重新修改！');
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //树添加添加任务
      addNewTask(taskName) {
        //验证名称是否存在
        this.$http.request({
          method: 'get',
          params: {taskName: taskName, caseId: this.currentCase.id},
          url: URL.checkTaskNameIsExists,
          success: (data) => {
            if (data.code === 200 && data.data === "1") {
              this.$store.commit("showAddTaskModal", false);
              this.saveNewTask(taskName, null);
            } else {
              this.$Message.warning('新增任务名称已存在，请重新命名！');
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //清除树选中
      clearSelected: function () {
        _.each(this.root, function (item) {
          if (item.children === undefined) {
            item.node.selected = false;
          }
        });
      },
      //保存任务
      saveNewTask(taskName, id, caseid) {
        let _this = this;
        //保存任务
        this.$http.request({
          method: 'post',
          params: {taskName: taskName, taskId: id, caseId: this.currentCase.id},
          url: URL.saveOrUpdateTaskDatas,
          success: (data) => {
            if (data.code === 200) {
              const children = _this.currentCase.children || [];
              if (id === null) {
//                    let time=this.changeTime(data.data.createtime)
                let taskModel = {
                  taskId: data.data.taskId,
                  createUser: data.data.createUser,
                  createtime: data.data.createtime,
                  caseId: _this.currentCase.id,
                  caseName: _this.currentCase.title,
                  taskName: taskName,
                  showButton: "2",
                  expand: true,
                  selected: true,
                };
                this.clearSelected();
                children.push(taskModel);
                this.$set(_this.currentCase, 'children', children);
                this.clickTask = taskModel.taskName;
                _this.caseFirst = taskModel.taskName;
                this.currentSelectTask = taskModel;
                CanvasManage.taskAdd(taskModel);
              } else {
                //根据当前的编辑任务id获取到对应的父节点改变_this.currentCase；
                let tasknode = _this.changeTaskid.taskId;
                let caselist = _.filter(_.map(this.root), function (node) {
                  return node.node.type == 'case'
                });
                _.filter(caselist, function (node) {
                  if (node.node.children != '') {
                    let templist = node.node.children;
                    for (let i = 0; i < templist.length; i++) {
                      if (templist[i].taskId == tasknode) {
                        _this.currentCase = node.node
                      }
                    }
                  }
                });
                const newchildren = _this.currentCase.children || [];
                _.each(newchildren, function (task) {
                  if (task.taskId === id) {
                    task.taskName = taskName;
                  }
                });
                this.$set(_this.currentCase, 'children', newchildren);
              }
              this.$store.commit("closeCase", false);
            }
          },
          error: (data) => {
            this.$Message.warning('请求数据失败！');
          }
        });
      },
      //删除任务
      removeTask(root, node, data) {
        let _this = this;
        this.$Modal.confirm({
          title: '是否删除该任务',
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            const parentKey = root.find(el => el === node).parent;
            const parent = root.find(el => el.nodeKey === parentKey).node;
            const index = parent.children.indexOf(data);
            parent.children.splice(index, 1);
            if (!_.isEmpty(data.taskId)) {
              _this.$http.request({
                method: 'post',
                params: {
                  taskId: node.node.taskId
                },
                url: URL.deleteTask,
                success: (res) => {
                  if (res.code === 200) {
                    this.$Message.success('删除成功！');
                    //切换到当前任务下第一下任务
                    this.clearSelected();
                    let caseItem = _.find(_this.root, function (caseItem) {
                      return node.parent === caseItem.nodeKey
                    });
                    //当没有任务时
                    if (caseItem && caseItem.children.length === 0) {
                      let currentGraphModel = this.$store.state.currentGraphModel;
                      currentGraphModel.undefinedTask = true;
                      currentGraphModel.data = {
                        nodes: [],
                        edges: []
                      };
                      this.$store.commit('setCurrentGraphModel', currentGraphModel);
                      //图形指标关闭，数值初始化
                      this.$store.commit("showSliderModel", false);
                      this.$store.commit("Sliderlvl", 0);//标签指标初始化
                      //隐藏右侧菜单
                      this.$store.commit("showStatisticsAndAnalyzeCon", false);
                      this.$store.commit("showTaskCon", false);
                      return false
                    }
                    let currentCase = _.find(root, function (item) {
                      return item.node.id === data.caseId
                    });
                    let firstTask = _.first(currentCase.node.children);
                    _this.currentSelectTask = firstTask;
                    firstTask.selected = true;
                    this.clickTask = firstTask.taskName;
                    _this.caseFirst = firstTask.taskName;
                    this.queryLayoutData(firstTask)
                  }
                },
                error: (data) => {
                  this.$Message.warning('删除失败！');
                }
              });
            }
          }
        });
      },
      loadTaskData(item, callback) {
        let _this = this;
        setTimeout(() => {
          this.$http.request({
            method: 'get',
            params: {caseId: item.id},
            url: URL.queryTaskList,
            success: (data) => {
              if (data.code === 200) {
                callback(data.data);
              }
              this.treeScroll()
            },
            error: (data) => {
              this.$Message.warning('请求数据失败！');
            }
          })
        }, 10);
      },

      firstLoadTaskData(item, callback) {
        let _this = this;
        this.$store.commit("showSliderModel", false);
        setTimeout(() => {
          this.$http.request({
            method: 'get',
            params: {caseId: item.id},
            url: URL.queryTaskList,
            success: (data) => {
              if (data.code === 200) {
                callback(data.data);
                if (data.data.length > 0) {
                  //默认显示第一个任务
                  this.currentCase = item;
                  let firstTask = _.first(data.data);
                  if (!_.isEmpty(firstTask)) {
                    _this.currentSelectTask = firstTask;
                    this.clickTask = firstTask.taskName;
                    this.clearSelected();
                    firstTask.selected = true;
                    firstTask.caseName = item.title;
                    _this.caseFirst = item.children[0].taskName;
                    this.queryLayoutData(firstTask);
                    //图形指标开启，数值初始化
                    this.$store.commit("showSliderModel", true);
                    this.$store.commit("Sliderlvl", 0);//标签指标初始化
                  }
                }
              }
              this.treeScroll()
            },
            error: (data) => {
              this.$Message.warning('请求数据失败！');
            }
          })
        }, 100);
      },
      //初始化案件树展开第一个案件
      initLoadFirstCase() {
        if (this.root != '') {
          let _this = this;
          //案件树默认展开的第一项案件
          let defaultcase = _.first(_.filter(_.map(_this.root), function (node) {
            return node.node.type == 'case'
          }));
          //已经加载
          if (defaultcase.node.expand == false) {
            defaultcase.node.expand = true
          }
          if (!_.isEmpty(defaultcase.children)) {
            defaultcase.expand = true;
            // return false;
          }
          if (defaultcase.node.type === 'case') {
            //第一次加载
            let cases = defaultcase.node;
            _this.firstLoadTaskData(cases, (response) => {
              if (!response) return;
              defaultcase.node.children = response;
              defaultcase.expand = true;
            });
          }
          //是否加载完当前案件下的任务
          this.$store.commit("setChildTaskStatus", true);
        }
      },
      //点击案件展开&折叠树
      loadCaseChildrenData(caseData) {
        let _this = this;
        //折叠
        if (caseData.expand) {
          caseData.expand = false;
          return false;
        }
        //已经加载
        if (!_.isEmpty(caseData.children)) {
          caseData.expand = true;
          return false;
        }
        if (caseData.type === 'case') {

          //第一次加载
          this.loadTaskData(caseData, (response) => {
            if (!response) return;
            caseData.children = response;
            caseData.expand = true;
          });
        }

        //是否加载完当前案件下的任务
        this.$store.commit("setChildTaskStatus", false);
      },
      //修改任务名称
      changeCaseName(root, node, data) {
        this.$refs.setcasename.openCaseNameModel(data)
      },

      //刷新案件下任务列表
      refreshCaseTaskList(caseData) {
        this.clearSelected();
        this.refreshTaskData(caseData, (response) => {
          if (!response) return;
          caseData.children = response;
          caseData.expand = true;
        });
      },

      //刷新案件列表回调函数
      refreshTaskData(caseData, callback) {
        let _this = this;
        this.$http.request({
          method: 'get',
          params: {caseId: caseData.id},
          url: URL.queryTaskList,
          success: (data) => {
            if (data.code === 200) {
              //若该案件下其他任务选中，刷新后仍选中
              _.each(data.data, function (task) {
                // console.log("data.data:"+task.taskId);
                if (_this.currentSelectTask.taskId === task.taskId) {
                  task.selected = true;
                }
              });
              callback(data.data);
            }
            this.treeScroll()
          },
          error: (data) => {
            this.$Message.warning('刷新案件列表失败！');
          }
        })
      },
      cancelTask(data, e, root, node) {
        //切换图形显示加载图
        this.$store.commit("graphLoad", true);
        let _this = this;
        //任务切换
        this.$store.commit("closeCase", false);
        $('#toolbar span').css({backgroundColor: '', boxShadow: ''});
        this.clearSelected();
        data.selected = true;
        e.target.style.background = '#5E7A9E';
        let caseModel = _.find(root, {nodeKey: node.parent});
        data.caseName = _.isEmpty(caseModel) ? "" : caseModel.node.title;
        this.clickTask = data.taskName;
        this.caseFirst = '';
        this.currentSelectTask = data;
        this.queryLayoutData(data);
      },
      //案件树渲染
      renderContent(h, {root, node, data}) {
        let _this = this;
        this.root = root;
        if (_this.flag == true) {
          this.initLoadFirstCase();
          _this.flag = false;
        }
        if (data.showButton === "1") {//添加新建按钮
          return h("span", {
              style: {
                // float: "right",
                // marginRight: "17px"
                visibility: 'visible'
              },
              on: {
                // mouseenter: (e) => {
                //   e.target.lastElementChild.style.visibility = 'visible';
                // },
                // mouseleave: (e) => {
                //   e.target.lastElementChild.style.visibility = 'hidden';
                // },
              }
            },
            [
              h("span", {
                style: {
                  display: "inline-block",
                  cursor: "pointer",
                  width: '116px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  borderRadius: '3px',
                  padding: '0px 2px',
                },
                attrs: {
                  title: node.node.title,
                  class: "ivu-tree-title"
                },
                on: {
                  mouseenter: (e) => {
                    e.target.style.background = '#5E7A9E';
                    // e.target.style.color='#ffffff'
                  },
                  mouseleave: (e) => {
                    e.target.style.background = "";
                    // e.target.style.color='#5b5b8e'
                  },
                  click: (e) => {

                    this.loadCaseChildrenData(data);

                  }
                }

              }, data.title),
              h("span", {
                style: {
                  display: "inline-block",
                  cursor: "pointer",
                  paddingTop: "2px",
                  // visibility: 'hidden'
                },
              }, [
                h("Icon", {
                  style: {
                    display: this.addable ? "inline-block" : "none",
                    margin: '-14px 0 0 5px',
                    fontSize: "20px",
                    fontWeight: "600",
                    cursor: "pointer",
                  },
                  domProps: {
                    title: "刷新任务列表"
                  },
                  attrs: {
                    type: "ios-refresh"
                  },
                  on: {
                    click: (e) => {
                      this.refreshCaseTaskList(data);
                    }
                  }
                }),
                h("Icon", {
                  style: {
                    display: this.addable ? "inline-block" : "none",
                    margin: '-14px 0 0 5px',
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                  },
                  domProps: {
                    title: "添加任务"
                  },
                  attrs: {
                    type: "ios-add-circle-outline"
                  },
                  on: {
                    click: (e) => {
                      this.currentCase = data;
                      this.$store.commit("showAddTaskModal", true);
                    }
                  }
                })
              ]),
            ]
          )
        }
        if (data.showButton === "2") {
          return h("span", {
              style: {
                display: "inline-block",
                lineHeight: "16px",
                position: "relative",
                right: "12px"
              },
              on: {
                mouseenter: (e) => {
                  e.target.lastElementChild.style.visibility = 'visible';
                },
                mouseleave: (e) => {
                  e.target.lastElementChild.style.visibility = 'hidden';
                },
              }
            },
            [
              h("span", {
                style: {
                  padding: "0px 0px 0px 2px",
                  display: "inline-block",
                  cursor: "pointer",
                  width: '112px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  backgroundColor: data.selected ? '#5E7A9E' : "",
                  color: data.selected ? '#ffffff' : ""
                },
                attrs: {
                  title: node.node.taskName,
                  class: "ivu-tree-title"
                },
                domProps: {
                  ClassName: 'btn'
                },
                on: {
                  mouseenter: (e) => {
                    if (e.target.classList.contains('mark')) {
                      e.target.style.background = '#959cd8';
                      e.target.style.color = '#ffffff'
                    } else {
                      //264c9e
                      e.target.style.background = '#5E7A9E';
                      e.target.style.color = '#ffffff'
                      if (data.selected) {
                        e.target.style.background = '#5E7A9E';

                      }

                    }

                  },
                  mouseleave: (e) => {
                    e.target.style.background = data.selected ? '#5E7A9E' : "";
                    e.target.style.color = data.selected ? '#ffffff' : ""
                  },
                  click: (e) => {
                    //图形指标关闭，数值初始化
                    this.StartSetLvl();
                    // this.$store.commit("showMoreSlider", false);
                    // _this.$store.state.isshowSlider=true;
                    // this.$store.commit("showSliderModel", _this.$store.state.isshowSlider);

                    let currentGraphModel = this.$store.state.currentGraphModel;
                    let cy = currentGraphModel.cy;
                    if ((_.isEmpty(currentGraphModel.data.nodes) && _.isEmpty(currentGraphModel.data.edges))
                      || cy.elements().difference(cy.elements(':hidden')).length === 0
                    ) {
                      //this.$Message.warning("当前画布中无可保存的元素");
                      this.cancelTask(data, e, root, node)
                    } else {
                      if (this.$store.state.isSnapshotConfirm) {//图形有变化弹出是否保存快照提示框
                        this.$Modal.confirm({
                          title: '是否将当前步骤保存为快照',
                          okText: '确认',
                          cancelText: '取消',
                          onOk: () => {
                            this.$store.commit("showAddSnapshotModal", true);//弹出添加快照窗口
                          },
                          onCancel: () => {
                            //切换图形显示加载图
                            this.cancelTask(data, e, root, node);
                          }
                        })
                      } else {
                        //切换图形显示加载图
                        this.$store.commit("graphLoad", true);
                        //任务切换
                        $('#toolbar span').css({backgroundColor: '', boxShadow: ''});
                        this.clearSelected();
                        data.selected = true;
                        e.target.style.background = '#5E7A9E';
                        let caseModel = _.find(root, {nodeKey: node.parent});
                        data.caseName = _.isEmpty(caseModel) ? "" : caseModel.node.title;
                        this.clickTask = data.taskName;
                        this.currentSelectTask = data;
                        this.$store.commit("closeCase", false);
                        this.queryLayoutData(data);
                        //图形指标关闭，数值初始化
                        this.$store.commit("showSliderModel", true);
                        // console.log(this.$store.state.markSlider)
                        this.$store.commit("Sliderlvl", 0);//标签指标初始化
                      }
                    }
                    // 关闭快照的弹窗
                    this.$store.commit("isShowSnapshotModel", false);
                  }
                }
              }, node.node.taskName),
              h("span", {
                style: {
                  display: "inline-block",
                  cursor: "pointer",
                  visibility: 'hidden'
                },
              }, [
                h("Icon", {
                  style: {
                    display: this.addable ? "inline-block" : "none",
                    margin: '-4px 0 0 5px',
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                  },
                  domProps: {
                    title: "修改任务名称"
                  },
                  attrs: {
                    type: "ios-create-outline"
                  },
                  on: {
                    click: (e) => {
                      this.changeCaseName(root, node, data)
                      this.changeTaskid = data;
                    }
                  }
                }),
                h("Icon", {
                  style: {
                    display: this.deletable ? "inline-block" : "none",
                    margin: '-4px 0 0 4px',
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                  },
                  domProps: {
                    title: "删除任务"
                  },
                  attrs: {
                    type: "ios-trash-outline"
                  },
                  on: {
                    click: (e) => {
                      this.removeTask(root, node, data)
                    }
                  }
                }),
              ]),
            ]
          )
        }
        if (data.showButton === "4") {
          return h("span", {
              style: {
                display: "inline-block",
                lineHeight: "16px",
                position: "relative",
                right: "12px"
              },
              on: {
                // mouseenter: (e) => {
                //   e.target.lastElementChild.style.visibility = 'visible';
                // },
                // mouseleave: (e) => {
                //   e.target.lastElementChild.style.visibility = 'hidden';
                // },
              }
            },
            [
              h("span", {
                style: {
                  padding: "0px 0px 0px 2px",
                  display: "inline-block",
                  cursor: "pointer",
                  width: '104px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  backgroundColor: data.selected ? '#5E7A9E' : "",
                  color: data.selected ? '#ffffff' : ""
                },
                attrs: {
                  title: node.node.taskName,
                  class: "ivu-tree-title"
                },
                domProps: {
                  ClassName: 'btn'
                },
                on: {
                  mouseenter: (e) => {
                    e.target.style.background = '#5E7A9E';
                    e.target.style.color = '#ffffff'
                  },
                  mouseleave: (e) => {
                    e.target.style.background = data.selected ? '#5E7A9E' : "";
                    e.target.style.color = data.selected ? '#ffffff' : ""
                  },
                  click: (e) => {
                    //任务切换
                    this.$store.commit("graphLoad", true);
                    this.$store.commit("closeCase", true);
                    $('#toolbar span').css({backgroundColor: '', boxShadow: ''});
                    this.clearSelected();
                    data.selected = true;
                    e.target.style.background = '#5E7A9E';
                    let caseModel = _.find(root, {nodeKey: node.parent});
                    data.caseName = _.isEmpty(caseModel) ? "" : caseModel.node.title;
                    this.clickTask = data.taskName;
                    this.currentSelectTask = data;
                    this.queryLayoutData(data);
                    //图形指标关闭，数值初始化
                    this.$store.commit("showSliderModel", true);
                    this.$store.commit("Sliderlvl", 0);//标签指标初始化
                  }
                }
              }, node.node.taskName),
              h("span", {
                  style: {
                    display: "inline-block",
                    cursor: "pointer",
                    // visibility: 'hidden'
                  },
                },
              ),
            ]
          )
        }
        else {
          return h("span", {
              style: {
                display: "inline-block"
              }
            },
            [
              h("span", {
                style: {
                  display: "inline-block",
                  cursor: "pointer"
                },
                attrs: {
                  title: node.node.title,
                  class: "ivu-tree-title"
                },
                on: {
                  mouseenter: (e) => {
                    if (e.target.classList.contains('mark')) {
                      e.target.style.background = '#959cd8';
                      e.target.style.color = '#ffffff'
                    } else {
                      //264c9e
                      e.target.style.background = '#5E7A9E';
                      e.target.style.color = '#ffffff';
                    }

                  },
                  mouseleave: (e) => {
                    e.target.style.background = data.selected ? '#5E7A9E' : "";
                    e.target.style.color = data.selected ? '#ffffff' : ""
                  },
                  click: (e) => {
                    this.loadCaseChildrenData(data);
                  }
                }
              }, data.title)
            ]
          )
        }
      },
    }
  }
</script>

<style scoped lang="less">
  #leftCon {
    overflow-x: hidden;
    overflow-y: auto;
    height: calc(100% - 48px) !important;
  }

  .cls-row {
    display: flex;
    > span {
      height: 30px;
      line-height: 30px;
      display: block;
      font-size: 12px;
      width: 86px;
      text-align: center;
    }
  }

  .SearchCase {
    display: flex;
    width: 212px;
    position: absolute;
    top: 1px;
    /*z-index: 9;*/
    > span {
      cursor: pointer;
      display: block;
      width: 42px;
      height: 23px;
      text-align: center;
      line-height: 23px;
      font-size: 16px;
      margin-left: 5px;
    }
  }

  .caseinfo {
    background: deepskyblue;
  }

  .active {
    visibility: hidden;
  }

  .ivu-tree-title-selected, .ivu-tree-title-selected:hover {
    background-color: #d5e8fc;
  }

  .ivu-tree-title:hover {
    background-color: #eaf4fe;
  }

  .ivu-tree-title {
    display: inline-block;
    margin: 0;
    padding: 0 4px;
    border-radius: 3px;
    cursor: pointer;
    vertical-align: top;
    color: #495060;
    transition: all .2s ease-in-out;
  }
</style>
<style>
  .SearchCase .ivu-input {
    height: 22px;
  }

  .ivu-modal-content li {

    list-style: none;

  }

  .ivu-tree-arrow i {
    transition: all .2s ease-in-out;
    font-size: 14px;
    vertical-align: middle;
    position: relative;
    top: -3px;
  }

</style>
