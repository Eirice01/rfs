<template>
  <div>
    <div id="toolbar">
      <span class="toolbarItems f-csp" id="question-btn" >
        <i class="iconfont icon-mendian-"></i>
      </span>
      <p class="lins"></p>
      <span class="toolbarItems f-csp" @click="frameSelect" title="拉框选择">
         <i class="iconfont icon-wuticopy"></i>

      </span>

      <span class="toolbarItems f-csp" title="圆形选择" @click="circleSelect">
        <i class="iconfont icon-yuanxing"></i>
      </span>

      <span class="toolbarItems f-csp" title="自由选择" @click="freeSelectNodes">
         <i class="iconfont  icon-ioscolorwand"></i>

      </span>

      <span class="toolbarItems f-csp" title="反选" @click="opposeNodes">
        <i class="iconfont  icon-weibiaoti--"></i>

      </span>
      <p class="lins"></p>

      <span class="toolbarItems f-csp" title="放大" @click="enlargeGraph">
        <i class="iconfont  icon-fangda1"></i>

      </span>

      <span class="toolbarItems f-csp" title="缩小" @click="shrinkGraph">
         <i class="iconfont  icon-suoxiao1"></i>
      </span>

      <span class="toolbarItems f-csp" title="区域放大" @click="frameEnlarge">
        <i class="iconfont  icon-lakuangfangda"></i>

      </span>

      <span class="toolbarItems f-csp" title="区域缩小" @click="frameZoomout">
        <i class="iconfont  icon-lakuangsuoxiao"></i>

      </span>
      <p class="lins"></p>
      <span class="toolbarItems f-csp" @click="deleteNodes" title="删除" :class="!deletable || isCloseCase ? 'disableTool' : ''">
        <i class="iconfont  icon-shanchu"></i>

      </span>
      <span class="toolbarItems f-csp"title="撤销"  @click="undoHandler" :class="isCloseCase ? 'disableTool' : ''">
         <i class="iconfont  icon-retreat"></i>

      </span>

      <span class="toolbarItems f-csp" @click="handleHideNodes" title="隐藏" :class="isCloseCase ? 'disableTool' : ''">
        <i class="iconfont  icon-biyan"></i>

      </span>
      <span class="toolbarItems f-csp" @click="showHideNodes" title="显示" :class="isCloseCase ? 'disableTool' : ''">
        <i class="iconfont  icon-xianshi" style="font-size: 12px"></i>

      </span>
      <span class="toolbarItems f-csp" @click="unSelectify" id="Selects"title="节点锁定/解锁" :class="isCloseCase ? 'disableTool' : ''">
        <i class="iconfont  icon-suoding"></i>

      </span>

      <span class="toolbarItems f-csp" @click="reset" title="刷新" :class="isCloseCase ? 'disableTool' : ''">
        <i class="iconfont  icon-shuaxin"></i>
      </span>

      <span class="toolbarItems f-csp" @click="shortestPath" id=""title="最短路径">
        <i class="iconfont  icon-xianduan"></i>

      </span>

      <p class="lins"></p>

      <span class="toolbarItems f-csp" @click="exportselectnodes" title="导出节点" :class="!exportable || isCloseCase ? 'disableTool' : ''">

        <i class="iconfont  icon-_daochu"></i>

      </span>

      <span class="toolbarItems f-csp" title="导出图片" @click="exportPicture" :class="!exportable || isCloseCase ? 'disableTool' : ''">


         <i class="iconfont  icon-fuhao-tupianxiazai"></i>

      </span>
      <span id="createSnapshotSpan" class="toolbarItems f-csp" @click="createSnapshot" title="添加快照" :class="!addable || isCloseCase ? 'disableTool' : ''">


        <i class="iconfont  icon-kuaizhao"></i>

      </span>
      <span class="toolbarItems f-csp" title="图形指标" @click="showSliderModels">
        <i class="iconfont icon-caozuo_gw"></i>
      </span>
      <p class="lins"></p>
    </div>
    <div class="userinfos">
      <div class="title">关系图介绍</div>
      <p>1.点的大小反应来联系人的多少，线的粗细反应两个人的紧密度，边的颜色，相同颜色为同一社团。</p>
      <p>2.点的高亮代表已选中的点，多代表具有不同的关系，悬浮代表边的属性。</p>
      <p>3.点的标签（悬浮）展示节点标签的内容。</p>
      <p>4.两点间的距离：团体间远近无意义。</p>
      <p>5.五边形表示输入点，圆形表示输出点，五角星表示从案件带过来的</p>
      <p>6.根据团体的大小，从大到小排列，最多展示12种团体，超过12种团体的其他团体统一用一种颜色表示。</p>
      <p>7.核心指标：不区分输入输出的前提下，值越高，表示内部联系越紧密。联络指标：区分输入输出的前提下，值越高，与输入号码的关系就越紧密。</p>
      <div class="title">图上操作说明</div>
      <p>1.右键单击，表示取消选中或取消置灰</p>
      <p>2.双击团体图例，选中团体数据，如需选中多个团体，可使用Ctrl键+双击团体图例</p>
      <p>3.选中操作，可使用轨迹选择工具和框选工具。Ctrl键可多次使用框选或轨迹工具</p>
    </div>
  </div>
</template>
<script>

  import * as AllOperation from '../../pages/graph/js/allOperation'

  export default {
    name: "toolbar",
    data() {
      return {
        isShowOperate: false,
        flag:true,
        ishide:true,
      }
    },
    props:[],
    components: {},
    created() {

    },
    mounted() {
      this.changeButnColor();
      this.userInfoEnter()
      this.userInfoLeave()
    },
    computed:{
      addable:function(){
        return this.$store.state.jurisdiction.addable;
      },
      deletable:function(){
        return this.$store.state.jurisdiction.deletable;
      },
      exportable:function(){
        return this.$store.state.jurisdiction.exportable;
      },
      isCloseCase:function(){
        return this.$store.state.closeCase;
      }
    },
    methods: {
      //弹出图形指标框
      showSliderModels(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        this.$store.state.isshowSlider=!this.$store.state.isshowSlider
        this.$store.commit("showSliderModel", this.$store.state.isshowSlider);

      },
      //获取来自graph的标签方法
      getlabels(){
        this.$emit('getlabel')
      },
      //点击选中工具栏按钮选中的按钮变色
        changeButnColor(){
          $('#toolbar .toolbarItems').each(function () {
            $(this).click(function () {
              $(this).css({
                backgroundColor: '#121845',
                boxShadow: '0 0 0px 2px rgba(35, 114, 184, 0.8)'})
              $(this).siblings().css({backgroundColor:'',boxShadow: ''})
            })
          })
      },
    //使用说明动画
      userInfoEnter(){
        $('#question-btn').mouseenter(function () {
          $('.userinfos').animate({},function () {
            $('.userinfos').css({
              'transform':'scale(1)'

            })
          })
        });
      },
      //使用说明动画
      userInfoLeave(){
        $('#question-btn').mouseleave(function () {
            $('.userinfos').animate({},function () {
              $('.userinfos').css({

                'transform':'scale(0)'

              })
            })
        })
      },
      createSnapshot() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        if((_.isEmpty(currentGraphModel.data.nodes) && _.isEmpty(currentGraphModel.data.edges))
          || cy.elements().difference(cy.elements(':hidden')).length === 0
        ){
          this.$Message.warning("当前画布中无可保存的元素");
          return false
        }
        this.$store.commit("showAddSnapshotModal", true);
      },
      exportselectnodes(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        let nodes = cy.nodes(":selected");
        if(nodes.length>0){
          this.$store.commit("ShowExprotSelectNodes", true);
          this.getlabels()
        }else {
          this.$Message.warning('请选择节点')
        }
      },

      //拉框选择
      frameSelect(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.frameSelect();
      },
      //圆形选择
      circleSelect(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.circleSelect();
      },
      //拉框放大
      frameEnlarge(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.frameEnlarge();
      },
      //拉框缩小
      frameZoomout(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.frameZoomout();
      },
      //导出图片
      exportPicture(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        //导出图片名称
        let names="";
        if(this.$store.state.modelrname==''){

          names= currentGraphModel.taskModel.taskName+'.png'
        }else {
         names= this.$store.state.modelrname+'.png'
          // this.$store.state.modelrname='';

        }
        AllOperation.downloadImg(names);
      },
      //下载
      // downloadFile(file)
      //反选
      opposeNodes(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
          cy.$('.addBorderColor').removeClass('addBorderColor');
          cy.nodes().forEach(function (ele,i,eles) {
            let id = ele.json().data.id;
            currentGraphModel.collectionNodes = cy.collection();
            //取消右侧分析-->选中标签的高亮
            $(".f-cspaH").removeClass("f-cspaH");
            $(".f-cspCusH").removeClass("f-cspCusH");
            if(ele.selected()){
              ele.unselect()
            }else {
              if(!ele.hidden()){
                ele.select()
              }
              // cy.$("#"+id).json({selected:true});
              //currentGraphModel.collectionNodes = currentGraphModel.collectionNodes.union(ele);
            }
          });
        currentGraphModel.collectionNodes = cy.$(":selected");
      },
      //自由选择
      freeSelectNodes(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.freeSelectNodes();
      },
      //放大
      enlargeGraph(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.enlargeGraph();
      },
      //缩小
      shrinkGraph(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.shrinkGraph();
      },
      //选中节点禁用
      unSelectify () {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        let SelectNodes=cy.$(":selected");
        let collection = cy.collection();

       let unlockArr= _.filter(SelectNodes,function (node) {
          return !node.locked()
        })
        if(_.isEmpty(unlockArr)){
          SelectNodes.forEach(v => {
            let name = v.data().name;
            let el = document.getElementById(`${name}_lock`).parentNode;
               el.className = "unlocked-node";

          })
          SelectNodes.unlock();
          this.$store.state.isRightSelect=false;
          _.each(SelectNodes, function(node){
              node.data().isLock = 0
            });

        }else {
          collection.merge(unlockArr);
          collection.lock();
          this.$store.state.isRightSelect=true;
          //锁定后判断锁定节点的标记
          if(!_.isEmpty( cy.nodes('[isLock=1]'))){
            _.each(cy.nodes('[isLock=1]'), function(node){
              node.data().isLock = 0
            });
          }
          collection.forEach(v=>{
            //每次添加前清除之前的id,className
            let name = v.data().name;
            v.data().isLock = 1;
            let el = document.getElementById(`${name}_lock`);
            if(el){
              el.parentNode.className = "";
              el.id = "";
            }
          })

          //对锁定的节点添加图标锁
          cy.nodeHtmlLabel(
            [
              {
                query:'[isLock=1]',
                halign:'top',
                valign:'right',
                cssClass:'locked-node',
                tpl:function (data) {
                  return `<div id=${data.name}_lock></div>`;
                }
              }
            ]
          );
          //触发样式更新，每次颜色设置不一样，样式一样不会触发更新
          collection[0].style("textOutlineColor",'rgb(255,255,255)');
          let colorVal = collection[0].style().textOutlineColor;
          if(colorVal == 'rgb(255,255,255)'){
            colorVal = 'rgb(255,250,250)';
          }else{
            colorVal = 'rgb(255,255,255)';
          }
          cy.style()
            .selector(collection[0])
            .style("text-outline-color", colorVal)
            .update();
        }

      },
      //单点删除
      deleteNodes () {
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        //刷新右侧对象树
        this.$store.commit("showStatisticsAndAnalyzeCon",false);

        setTimeout(() => {
          AllOperation.deleteNodes();
        }, 10);
      },
      //操作隐藏/显示
      handleHideNodes(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }

          // let currentGraphModel = store.state.currentGraphModel;
          // let cy = currentGraphModel.cy;
          // if(this.$store.state.isRightSelect==false){
          // if(this.ishide){
            AllOperation.hideNodes();
        //     this.ishide=false
        //   }else {
        //     AllOperation.showNodes();
        //     this.ishide=true
        //   }
        // }
      },
      showHideNodes(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.showNodes();
      },
      //刷新
      reset (){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        AllOperation.reset();
      },
      //最短路径
      shortestPath(){
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        let selectNodes = cy.nodes(':selected');
        if(selectNodes.length === 2){
          AllOperation.shortestPath(cy, selectNodes);
        }else {
          this.$Message.warning('最短路径只支持两个对象')
        }
      },
      //撤销
      undoHandler (){
        let currentGraphModel = this.$store.state.currentGraphModel;
        //当没有任务时
        if(currentGraphModel.undefinedTask){
          this.$Message.warning("先选择一个任务");
          return false
        }
        //刷新右侧对象树
        this.$store.commit("showStatisticsAndAnalyzeCon", false);
        setTimeout(() => {
          AllOperation.undoHandler();
        }, 10);
      },
      //保存
      saveNodes(){
        // AllOperation.saveNodes()
        // this.$emit("saveCurrentTask")
      }
    },

  }
</script>

<style scoped lang="less">
  /*.lins{*/
    /*display: inline-block;*/
    /*width: 100%;*/
    /*border: 1px solid #d6d3d3;*/
  /*}*/
  .title{
      color: #FF6699;
      height: 20px;
      line-height: 20px;
    margin-left: 5px;
  }
  #toolbar{
    position: absolute;
    top:70px;
    left: 20px;
    z-index: 9;
    width: 60px;
    height: 505px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    user-select:none;
    border-radius: 5px;
    .toolbarItems{
      font-size: 22px;
      margin:2px 0px;
      /*color: #636693;*/
      &:hover{
        color: #8e93d2;
      }
      i{
        /*color: #636693;*/
        font-size: 18px;
        font-weight: 700;
      }
    }
  }

.userinfos{
  width: 500px;
  position: absolute;
  top:70px;
  left: 80px;
  z-index: 999;
  background: #6269A9;
  border-radius: 3px;
  transform: scale(0);
  padding:10px;
  transition: all .5s;
  >p{
    color:#fff;
   padding:2px 3px;
  }
}
/*@keyframes myshow {*/
/*0%{*/
  /*transform: translateY(10px);*/
/*}*/
/*25%{*/
  /*transform: translateY(0px);*/
/*}*/
/*50%{*/
  /*transform: translateY(10px);*/
/*}*/
  /*100%{*/
    /*transform: translateY(0px);*/
  /*}*/
/*}*/



</style>
