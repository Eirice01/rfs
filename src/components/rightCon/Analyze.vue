<template>
  <div id="analyze">
    <ul>
      <li class="analyze-li f-cbli">
        <div class="analyze-container">
        <span class="analyze-icon f-csp">
        <Icon :class="menu.isShowAttributeTag?'isUnfold':''" @click="unfold('isShowAttributeTag')"
              type="ios-arrow-forward"></Icon>
        </span>
          <span class="iconfont icon-biaoqian2" style="font-size:18px"></span>
          <span>属性标签 ({{attributeTagNum}})</span>
        </div>
        <div class="tag-main"id="mainBase" v-show="menu.isShowAttributeTag">
          <div v-if="tagList.attributeTag.length > 0">

            <a class="tagminB" v-for="(item,index) in tagList.attributeTag" :key="index" @click="baseLabels(item.dicCode,$event,index)">{{item.dicName}} <span>{{item.tagNum}}</span></a>
            <!--<ul>-->
              <!--<li v-for="(group,idx) in tagList.attributeTag" class="group-li">-->
                <!--<span @click="isOrNotTagGroupUnfold(tagList.attributeTag, group)" style="cursor: pointer;display: inline-block;">-->
                  <!--<Icon type="ios-arrow-forward" :class="!!group.show?'isUnfold':''"></Icon>-->
                  <!--<span class="f-csp">{{group.title}}</span>-->
                  <!--<i id="cls-aTitle" style="font-style: normal">({{group.children.length}})</i>-->
                <!--</span>-->
                <!--<div v-show="group.show">-->
                  <!--<a class="tagminB" :class="ctrlCheck?'':{tagminA:index===currentIndex&&idx==liidx}"  v-for="(item,index) in group.children" :key="index" :data-name="item.dicName" @click="baseLabels(item.dicCode,$event,index,item.dicName,idx)">{{item.dicName}}<span>{{item.tagNum}}</span></a>-->
                <!--</div>-->
              <!--</li>-->
            <!--</ul>-->

          </div>
          <span v-else>暂时没有属性标签</span>
        </div>
      </li>
      <li class="analyze-li f-cbli">
        <div class="analyze-container">
        <span class="analyze-icon f-csp">
        <Icon :class="menu.isShowIsOrNotTag?'isUnfold':''" @click="unfold('isShowIsOrNotTag')"
              type="ios-arrow-forward"></Icon>
        </span>
          <span class="iconfont icon-biaoqian" style="font-size:20px"></span>
          <span>0/1标签 ({{isOrNotTagTreeNum}})</span>
        </div>
        <div class="tag-main" id='mainzero' v-show="menu.isShowIsOrNotTag">
          <div v-if="tagList.isOrNotTagTree.length > 0">
            <ul>
              <li v-for="group in tagList.isOrNotTagTree" class="group-li">
                <span @click="isOrNotTagGroupUnfold(tagList.isOrNotTagTree, group)" @mouseenter="addHighlight" @mouseleave="cancelHighlight" style="cursor: pointer;display: inline-block;">
                  <Icon type="ios-arrow-forward" :class="!!group.show?'isUnfold':''"></Icon>
                  <span class="f-csp">{{group.title}} ({{group.children.length}})</span>
                </span>
                <div v-show="!!group.show" style="margin-left: 16px">
                  <a class="f-cspa"  v-for="tag in group.children" :key="tag.dicName" :name="tag.dicName" @click="selectIsOrNotTag(tag,$event)">{{tag.dicName}}<span class="f-csps">{{tag.tagNum}}</span></a>
                </div>
              </li>
            </ul>
          </div>
          <span v-else>暂时没有0/1标签</span>
        </div>
      </li>
      <li class="analyze-li f-cbli">
        <div class="analyze-container">
        <span class="analyze-icon f-csp">
        <Icon :class="menu.isShowCustomTag?'isUnfold':''" @click="unfold('isShowCustomTag')"
              type="ios-arrow-forward"></Icon>
        </span>
          <span class="iconfont icon-biaoqian1" style="font-size:20px"></span>
          <span>自定义标记 ({{tagList.customTag.length}})</span>
        </div>
        <div class="tag-main" id="mainCust" v-show="menu.isShowCustomTag">
          <div v-if="tagList.customTag.length > 0" id="mainCustChild" style="height: 100%">
            <a class="f-cspCus" v-for="tag in tagList.customTag" :key="tag.labelName" :name="tag.labelName" @click="selectCustomTag(tag,$event)">   {{tag.labelName}}<span class="f-csps">{{tag.tagNum}}</span></a>
          </div>
          <span v-else>暂时没有自定义标记</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import * as Handle from "../../pages/graph/js/handle"
  export default {
    name: "analyze",
    data() {
      return {
        flags:true,
        checkedFcs:false,
        checkedCums:false,
        customLabels:'',
        checkedBase:false,
        newCustomlabels:[],
        ctrlCheck:false,
        singleCheck:true,
        currentIndex:'',
        ctrlKeys:false,
        liidx:'',
        baseHeight:'',
        zeroHeight:'',
        customHeight:'',
        menu: {
          isShowAttributeTag: true,
          isShowIsOrNotTag: true,
          isShowCustomTag: true,

        },
        tagList: {
          attributeTag: [],
          isOrNotTagTree: [],
          customTag: [],
        },
        attributeTagNum:0,
        isOrNotTagTreeNum: 0,
        selectIsOrNotTagNodes:[],
        selectIsCumNodes:[],
        selectIsBaseNodes:[],
        setNodeCodes:[],
      }
    },

    components: {

    },
    created() {

    },
    mounted() {
      this.setHeight();
      this.initTag();
      this.customTag();
    },
    watch:{
      /*baseHeight:function (val,oldval) {
        if(val>100){
          $("#mainBase").css({maxHeight:'140px',overflow:'auto'})
        }
      },
      zeroHeight:function (val,oldval) {
        if(val>250){
          $("#mainzero").css({maxHeight:'315px',overflow:'auto'})
        }
      },
      customHeight:function (val,oldval) {
       //if(val>){
          $("#mainCust").css({maxHeight:'270px',overflow:'auto'})
      // }
      }*/
    },
    methods: {
      setHeight(){
        setTimeout(function () {
          let allHeight = $("#graph").height() - 217;
          $("#mainBase").height(allHeight*0.2);
          $("#mainzero").height(allHeight*0.42);
          let thirdHeight = allHeight - $("#mainBase").height() - $("#mainzero").height()-13;
          $("#mainCust").height(thirdHeight);
        },100);
      },
      //基础属性动态添加滚动条
      heightScroll(){
        this.baseHeight=$("#mainBase").height();
      },
      //01标签
      zeroScroll(){
        this.zeroHeight=$("#mainzero").height();
      },
      //自定义标签
      customScroll(){
        this.customHeight=$("#mainCust").height();
      },
      //初始化标签/统计
      initTag() {
        let _this = this;
        let baseDictionData = this.$store.state.queryBaseDictionData;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let nodes = currentGraphModel.cy.nodes();
        //所有点label
        let allLabels = _.map(_.map(nodes, function (node) {
          return node.data()
        }), 'labels');
        //过滤空值
        let usableLabels = _.filter(allLabels, function (label) {
          if (!_.isEmpty(label)) {
          }
          return label
        });
        //每个标签个数
        let countByLabel = _.countBy(_.flatten(_.map(usableLabels, function (o) {
          if (!_.isEmpty(o)) {
            return Object.keys(o)
          }
        })));
        currentGraphModel.countByLabel = countByLabel;
        let labelType = baseDictionData.labelType;
        //统计属性标签
        _.each(baseDictionData.properLabel, function (label) {
          let tagNum = _.get(countByLabel, label.dicCode);
          label.tagNum = tagNum + '' === "undefined" ? 0 : tagNum;
        });
        this.tagList.attributeTag = _.sortBy(baseDictionData.properLabel, function (lable) {
          return - lable.tagNum;
        });
        this.attributeTagNum = this.tagList.attributeTag.length;
        //---------------------------------------------------------
        // let properLabelGroup = _.groupBy(baseDictionData.properLabel,'parentId');
        // _.each(properLabelGroup,function (value,key) {
        //   let title = _.find(labelType,{'dicCode':key}).dicName;
        //   _.each(value,function (label) {
        //     let tagNum = _.get(countByLabel,label.dicCode);
        //     label.tagNum = tagNum + '' === "undefined" ? 0 : tagNum;
        //   });
        //   let children = _.sortBy(value,function (label) {
        //     return -label.tagNum;
        //   });
        //   _this.tagList.attributeTag.push({title:title,children:children,show:true});
        //   _this.attributeTagNum +=value.length;
        // })
        //统计0/1标签
        let flagLabelGroup =  _.groupBy(baseDictionData.flagLabel, 'parentId');
        _.each(flagLabelGroup, function (value, key) {
          let title = _.find(labelType, {'dicCode': key}).dicName;
          _.each(value, function (label) {
            let tagNum = _.get(countByLabel, label.dicCode);
            label.tagNum = tagNum + '' === "undefined" ? 0 : tagNum;
          });
          let children = _.sortBy(value, function (lable) {
            return - lable.tagNum;
          });
          _this.tagList.isOrNotTagTree.push({title: title, children: children, show: true});
          _this.isOrNotTagTreeNum += value.length;
        });
        setTimeout(()=>{
          this.heightScroll();
          this.zeroScroll();
          this.customScroll();
        },1000)

      },

      //初始化自定义标记
      customTag(){
        this.customScroll();
        let _this = this;
        _this.tagList.customTag = [];
        //let definedLabel = this.$store.state.currentResultDefinedLabel;
        let definedLabel = [];
        this.customLabels= this.$store.state.currentResultDefinedLabel;

        let nodes = this.$store.state.currentGraphModel.data.nodes;
        let nameLst = [];
        if(_.isEmpty(nodes)){
          definedLabel = [];
        }else{
          //删除节点的标记不做计算
          _.forEach(nodes,function (e) {
            var name = e.data.name;
            nameLst.push(name)
          });
          _.forEach(this.customLabels,function (e) {
            if(nameLst.indexOf(e.nodeId)>-1){
              e.labels = _.uniqBy(e.labels, 'labelName');
              definedLabel.push(e)
            }
          })
        }

        //按标签id分组统计
        let groupTag =  _.groupBy(_.flatten(_.map(definedLabel,'labels')), 'labelCode');
        _.each(groupTag, function (value, key) {
          let label = value[0];
          if(!_.isEmpty(label)){
            _this.tagList.customTag.push({'labelCode': label.labelCode, 'labelName': label.labelName, 'tagNum': value.length})
          }
        });
        //排序
        this.tagList.customTag = _.sortBy(this.tagList.customTag, function (label) {
          return -label.tagNum
        });
      },

    //统计分析模块图上点的选中
      analyzeSelectNodes(selectNodes){
        // if(selectNodes.length!=0){
        //   // this.initTag();
        //   // this.customTag();
        // }
      },

      //清除所选01标签和自定义标记
      resetSelectTagNodes(){
        this.checkedCums=false;
        if($(".f-cspaH").length==0){
          this.selectIsOrNotTagNodes = [];
        }
        if($(".f-cspCusH").length==0){
          this.selectIsCumNodes = [];
        }
      },

      //获取01标记选中的点（从图上所有点里筛选）
      getOldIsOrNotNodeLst(selectTagNodes) {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;

        let selectNodes = _.filter(cy.nodes(), function (node) {
          if (!_.isEmpty(node.data().labels)&& !_.isEmpty(selectTagNodes)) {
            let nodeLabels = Object.keys(node.data().labels);
            let currentLabels = _.uniq(_.flatten([nodeLabels, selectTagNodes]));
            if (currentLabels.length === nodeLabels.length) {
              return node;
            }
          }
        });

        return selectNodes;
      },

      //01标签图上选中
      //先从图上所有的点里筛选自定义标记，然后再从筛选结果里筛选01标记（自定义标记筛选与之相反）
      extracted(selectTagNodes) {
        let tempnode=[];
        let selectNodes =[];
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        if(!_.isEmpty(selectTagNodes)){
          if( this.selectIsCumNodes.length >0){//先筛选自定义标记，然后从自定义标记筛选结果中筛选01标记
            tempnode = this.getOldFreeNodeLst(this.selectIsCumNodes)
          }else{
            tempnode = cy.nodes();
          }
          selectNodes = _.filter(tempnode, function (node) {
            if (!_.isEmpty(node.data().labels)&& !_.isEmpty(selectTagNodes)) {
              let nodeLabels = Object.keys(node.data().labels);
              let currentLabels = _.uniq(_.flatten([nodeLabels, selectTagNodes]));
              if (currentLabels.length === nodeLabels.length) {
                return node;
              }
            }
          });
        }else{//如果01标签未选中（取消最后一个选中），只筛选自定义
          selectNodes = this.getOldFreeNodeLst(this.selectIsCumNodes);
        }

        cy.$(cy.nodes()).unselect();
        let collection = cy.collection();
        collection.merge(selectNodes);
        cy.zoom(1);
        collection.select();
        cy.center(collection[0]);
        this.analyzeSelectNodes(collection)
      },
     //01标签筛选
      selectIsOrNotTag(tag,e) {
        this.resetSelectTagNodes();
        if(!e.target.classList.contains('f-cspaH')&& e.target.localName=="a"){
         e.target.classList.add('f-cspaH');
         this.checkedFcs=true;
        }else if(e.target.classList.contains('f-cspaH') && e.target.localName=="a"){
          e.target.classList.remove('f-cspaH')
          this.checkedFcs=false;
        }
        if(this.checkedFcs) {
          this.selectIsOrNotTagNodes.push(tag.dicCode);
        }else {
          this.selectIsOrNotTagNodes = _.pull(this.selectIsOrNotTagNodes, tag.dicCode);
        }
        this.extracted(this.selectIsOrNotTagNodes);
      },

      //获取自定已标记选中的点（从图上所有点力筛选）
      getOldFreeNodeLst(selectIsCumNodes){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let _this = this;
        let newNodes='';
        let newCustomlabels=[];

        let Freelabels=_this.customLabels;
        _.filter(Freelabels,function (node) {
          let nodelist=[];
          if(!_.isEmpty(selectIsCumNodes)){
            _.filter(node.labels,function (item) {
              for(let i=0;i<selectIsCumNodes.length;i++){
                let flag  = false;
                for (let j=0;j<node.labels.length;j++){
                  if(selectIsCumNodes[i]==node.labels[j].labelName){
                    flag =true;
                    break;
                  }
                }
                nodelist.push(flag);
              }
            })
            if (nodelist.indexOf(false)==-1){
              newCustomlabels.push(node);
            }
          }
        });

        newNodes=_.filter(cy.nodes(),function (ele) {
          if(!_.isEmpty(newCustomlabels)){
            for(let i=0; i<newCustomlabels.length;i++){
              if(ele.data().name==newCustomlabels[i].nodeId && newCustomlabels[i].labels!=''){
                return ele;
              }
            }
          }
        })
        return newNodes;
      },
      //自定义标记图上选中
      selectFreeLabels(selectIsCumNodes){
        //获取自定义标记
        let _this = this;
        let tempNodes=[];
       let newNodes='';
        let newCustomlabels=[];
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        if(!_.isEmpty(selectIsCumNodes)){
          let Freelabels=_this.customLabels;
          _.filter(Freelabels,function (node) {
            let nodelist=[];
            if(!_.isEmpty(selectIsCumNodes)){
              _.filter(node.labels,function (item) {
                for(let i=0;i<selectIsCumNodes.length;i++){
                  let flag  = false;
                  for (let j=0;j<node.labels.length;j++){
                    if(selectIsCumNodes[i]==node.labels[j].labelName){
                      flag =true;
                      break;
                    }
                  }
                  nodelist.push(flag)
                }
              })
              if (nodelist.indexOf(false)==-1){
                newCustomlabels.push(node)
              }
            }
          })

          if(this.selectIsOrNotTagNodes.length>0){
            tempNodes = this.getOldIsOrNotNodeLst(this.selectIsOrNotTagNodes);
          }else{
            tempNodes = cy.nodes()
          }

          if(!_.isEmpty(selectIsCumNodes)){
            newNodes=_.filter(tempNodes,function (ele) {
              if(!_.isEmpty(newCustomlabels)){
                for(let i=0; i<newCustomlabels.length;i++){
                  if(ele.data().name==newCustomlabels[i].nodeId && newCustomlabels[i].labels!=''){
                    return ele
                  }
                }
              }
            })
          }
        }else{//如果自定义标签为选中（取消最后一个选中），只筛选01标签
          newNodes = this.getOldIsOrNotNodeLst(this.selectIsOrNotTagNodes);
        }

        cy.$(cy.nodes()).unselect();
        let collection = cy.collection();
        collection.merge(newNodes);
        cy.zoom(1);
        collection.select();
        cy.center(collection[0]);
        this.analyzeSelectNodes(collection)
      },
      //自定义标记
      selectCustomTag(tag,e) {
        this.resetSelectTagNodes();
        if(!e.target.classList.contains('f-cspCusH')&& e.target.localName=="a"){
          e.target.classList.add('f-cspCusH');
          this.checkedCums=true;
        }else if(e.target.classList.contains('f-cspCusH')&& e.target.localName=="a"){
          e.target.classList.remove('f-cspCusH');
          this.checkedCums=false;
        }
        if(e.target.localName=="a"){
          if(this.checkedCums) {
            this.selectIsCumNodes.push(tag.labelName);
          }else {
            this.selectIsCumNodes = _.pull(this.selectIsCumNodes, tag.labelName);
          }
        }
        this.selectFreeLabels( this.selectIsCumNodes);
      },

      //展开树节点
      isOrNotTagGroupUnfold(treeData, group) {
        _.each(treeData, function (groupTree) {
          if (group.title === groupTree.title) {
            groupTree.show = !group.show;
          }
        });
        this.$forceUpdate();
      },

      addHighlight(e) {
        e.target.style.color = '#2d8cf0';
      },

      cancelHighlight(e) {
        e.target.style.color = '';
      },

      unfold(type) {
        this.menu[type] = !this.menu[type];
        this.setHeight();
      },
      //
      //基础属性标签图中选中
      baseLabelCus(selectTagNodes) {

        let _this = this;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let selectNodes = _.filter(cy.nodes(), function (node) {
          if (!_.isEmpty(node.data().labels)&& !_.isEmpty(selectTagNodes)) {
            let nodeLabels = Object.keys(node.data().labels);
            let currentLabels = _.uniq(_.flatten([nodeLabels, selectTagNodes]));
              return node;
          }
        });
        let nodesList=_.map(_.map(_.map(selectNodes,'_private'),'data'),'name')
        this.$store.commit("baseLabelsNodes",nodesList);
        let collection = cy.collection()
        collection.merge(selectNodes)
        this.$store.state.isshowsliderModel
        let Sliderlvl=this.$store.state.Sliderlvl;
        if(Sliderlvl!=0){
          if(collection.length!=0){
            cy.style()
              .selector(collection)
              .style('label',function (evt) {
                let o='';
                if(selectTagNodes.length==1){
                  for (let i=0;i<selectTagNodes.length;i++){
                    if(evt._private.data.labels[selectTagNodes[i]]==undefined){
                      o=o+' '
                    }else {
                      o=evt._private.data.labels[selectTagNodes[i]]
                    }
                  }
                }else {
                  for (let i=0;i<selectTagNodes.length;i++){
                    if(evt._private.data.labels[selectTagNodes[i]]==undefined){
                      o=o+' '+',';
                    }else {
                      o=o+evt._private.data.labels[selectTagNodes[i]]+','
                    }
                  }
                  o = _.trimEnd(o, ',');
                }
                return o
              })
              .style('text-halign','right')
              .style('text-valign','center')
              .update();
          }else {
            cy.style()
              .selector('node')
              .style('label','')
              .style('text-halign','right')
              .style('text-valign','center')
              .update();
          }
        }else {
          cy.style()
            .selector('node')
            .style('label','')
            .style('text-halign','right')
            .style('text-valign','center')
            .update();
        }
      },
     //基础属性标签选中
      baseLabels(code,e,index,name,idx){
        if(e.target.localName=="a"){
          this.$emit("handleSetlvl")
          this.$store.commit("labellvls",10);
        }
        // if(e.target.localName=="a"&&this.setNodeCodes.length==0){
        //   this.$emit('handleSetClose')
        // }
        // this.$store.state.isshowsliderModel
        let Sliderlvl=this.$store.state.Sliderlvl;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let lengthInfo=false;
        if(Sliderlvl!=0){
            if(!e.target.classList.contains('tagminA')&& e.target.localName=="a"){
              if(this.setNodeCodes.length<5){
                e.target.classList.add('tagminA');
                this.checkedBase=true;
              }else {
                this.checkedBase=false;
                this.$Message.warning("最多可以同时显示5个标签");
              }
            }else if(!e.target.classList.contains('tagminA')&& e.target.localName=="span"){
              this.checkedBase=false;
            }else {
              e.target.classList.remove('tagminA');
              this.checkedBase=false;
            }
          if(this.checkedBase) {
            this.selectIsBaseNodes.push(code);
            this.setNodeCodes=[];
            //对勾选标签进行比对排序，顺序又原始标签加载顺序决定
            let els=_.map(this.tagList.attributeTag,'dicCode')
            for(let i=0;i<els.length;i++){
              for (let j=0;j<this.selectIsBaseNodes.length;j++){
                if(els[i]==this.selectIsBaseNodes[j]){
                  this.setNodeCodes.push(els[i])
                }
              }
            }
            //对新增数据去重
/*            this.selectIsBaseNodes=_.uniqBy(this.setNodeCodes, function(node){
              return node;
            })
            this.$store.commit("baseLabelsFus",this.setNodeCodes);

            this.baseLabelCus(this.setNodeCodes)*/

          }else {
            if( e.target.localName=="a"){
              this.selectIsBaseNodes = _.pull(this.setNodeCodes,code);
              if(this.setNodeCodes.length==0){
                this.$emit('handleSetClose')
              }
            }

       /*   //对新增数据去重
            this.selectIsBaseNodes=_.uniqBy(this.setNodeCodes, function(node){
              return node;
            })
            this.$store.commit("baseLabelsFus",this.setNodeCodes);
            this.baseLabelCus(this.setNodeCodes)*/
          }
          //对新增数据去重
          this.selectIsBaseNodes=_.uniqBy(this.setNodeCodes, function(node){
            return node;
          })
          this.$store.commit("baseLabelsFus",this.setNodeCodes);
          this.baseLabelCus(this.setNodeCodes)
        }
    /*    if(Sliderlvl==0){
          this.$Message.warning('请先开启标签指标设置！设置非0值');
          if(this.setNodeCodes.length!=0){
            $('#mainBase a').each(function () {
              $(this).removeClass('tagminA')
            });
            this.setNodeCodes=[];
            this.$store.commit("baseLabelsFus",this.setNodeCodes)
            this.baseLabelCus(this.setNodeCodes)
          }
        }*/

     },
    },

  }
</script>

<style scoped>
  #analyze {
    margin-top: -10px;
  }

  .analyze-container {
    padding-bottom: 3px
  }

  .analyze-icon {
    font-size: 20px;

  }

  .analyze-li {
    margin: 5px 0;
    list-style: none;
  }

  .isUnfold {
    transform: rotate(90deg);
  }

  .tag-main {
    padding: 10px;
    overflow: auto;

  }
  /*.tag-main a{*/
    /*padding:0px 5px;*/
    /*display: inline-block;*/
    /*height: 26px;*/
    /*line-height: 26px;*/
    /*margin:5px;*/
  /*}*/
  .tag-main a span{
    color: #9a6e3a;
  }
  .tagminA{
    padding:0px 5px;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin:5px;
    background:#90A7D9!important;
    border-radius:5px!important;
  }
  .tagminB{
    padding:0px 5px;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin:5px;
    /*backgroundColor:#90A7D9;*/
    /*borderRadius:5px;*/
  }
  #analyze .group-li {
    list-style: none;
    margin-bottom: 6px;
    padding: 0;
  }
  .f-cspa{
    padding:0px 5px;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin:5px;
  }
  .f-cspaH{
    padding:0px 5px;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin:5px;
    background:#b0b6e6!important;
    border-radius: 5px;
  }
  .f-csps{
    margin-left: 3px;
    color: #9a6e3a;
  }
  .f-cspCus{
    padding:0px 5px;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin:5px;
  }
  .f-cspCusH{
    padding:0px 5px;
    display: inline-block;
    height: 26px;
    line-height: 26px;
    margin:5px;
    background:#b0b6e6!important;
    border-radius: 5px;
  }
</style>
<style>

</style>
