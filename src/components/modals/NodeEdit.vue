<template>
  <div id="nodeEdit">
    <Modal class="nodeEdit" v-model="getNodeEditModalState" title="节点编辑" :styles="{top: '160px',width:'700px'}">
      <Form ref="formItem" :model="nodeEdit" :label-width="90" :rules="ruleValidates">
        <Row>
          <Col span="7" style="margin:10px;">
            <div class="iconTitle">
              实体图标:
            </div>
            <div class="entityBox">
              <img v-for="(item,index) in entityImgList" :src="item.imageData" :gid="item.gid" alt="" :title="item.gName" class="imgIcon" @click="setCurrentIcon($event)">
            </div>
          </Col>
          <Col span="7" style="margin:10px;">
            <div class="iconTitle">
              通用图标：
            </div>
            <div class="generalBox">
              <img v-for="(item,index) in generalImgList" :src="item.imageData" :gid="item.gid" alt="" :title="item.gName" class="imgIcon" @click="setCurrentIcon($event)">
            </div>
          </Col>
          <Col span="7" style="margin:10px;">
            <div class="iconTitle">
              自定义图标：
            </div>
            <div class="defaultBox">
              <img v-for="(item,index) in defaultImgList" :src="item.imageData" :gid="item.gid" alt="" :title="item.gName" class="imgIcon" @click="setCurrentIcon($event)">
            </div>
          </Col>
        </Row>
        <FormItem label="上传图标：">
          <a href="javascript:;" class="input-file input-fileup" id="inputBtn">
            选择图片<input id="uploadImageInput" size="100" type="file" name="file" @change="uploadImage" ref="inputer" />
          </a>
          <span class="showFileName textColor" :title="names"></span>
          &nbsp;<span style="font-size: 10px; color: red" class="textColor"><span style="padding-left:8px;">*</span>图片大小建议不超过70kb.</span>
        </FormItem>
        <Row>
          <Col span="8">
          <FormItem label="图标预览：">
            <div id="previewImg" class="previewImgIcon">
            </div>
            <Tooltip content="删除图标" placement="top-end">
              <Icon class="preview-delete-icon f-csp" @click="deletePreviewImg" type="ios-trash"></Icon>
            </Tooltip>
            <!--<img id="previewImg" class="previewImgIcon"/>-->
          </FormItem>
          </Col>
          <Col span="8">
          <FormItem label="自定义大小：">
            <InputNumber  :max="5" :min="1"     v-model="nodeEdit.nodeSize"  :editable="false" class="inputSize"  size="small"> </InputNumber>&nbsp;<span
            class="textColor" style="font-size: 8px">倍</span>
            <!--<Input v-model="nodeEdit.nodeSize" size="small" style="width:50px;"></Input>&nbsp;<span style="font-size: 8px">倍</span>-->
          </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="close" @click="cancelNodeEdit"><Icon type="ios-close"></Icon></div>
      <div slot="footer">
        <Button type="text" @click="cancelNodeEdit">取消</Button>
        <Button type="default" @click="okNodeEdit">确定</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
    import {URL} from "../../../api/urlsConfig"
    import store from "../../vuex/store"
    export default {
      name: "node-edit",
      data() {
        return {
          selectNodesLength: 0, // 图上选中的点的数量
          selectNodes: [],  // 批量选中的图上的点

          names:'',
          nodeEdit:{
//            nodeName:"",
            nodeSize:1,
          },
      ruleValidates:{
       /*     nodeName:[
              {required:true,message:"节点名称格式不正确!",trigger:"blur"},
              {validator(rule,value,callback) {
                  var pattern = /^[\u4E00-\u9FA5A-Za-z]+$/;//只能输入中文和英文
                  if(!pattern.test(value)) {
                    callback("节点名称格式不正确!")
                  } else{
                    callback();
                  }
                }}
            ],*/
            nodeSize:[
              {required:true,message:"只能输入正数字!",trigger:"change"},
              {validator(rule,value,callback) {
                  var pattern = /^[0-9]+$/;
                  if(!pattern.test(value)) {

                    callback("只能输入正数字!")
                  } else{
                    callback();
                  }
                }}
            ],
          },
          uploadParams:{
            multipartFile:'',
            nowCount:0,
          },
          uploadPath: URL.uploadPath,
          defaultImgList:[],
          generalImgList:[],
          entityImgList:[],
          gid:"",// 默认图片的id
          // nid:"",//节点id
          rid:"",//当前分析任务的id
          code:"",//left 0 right:1 快照为 0 分析任务为 1
          defaultIconStr:'',
          baseImageStr:"",
          imageSize:'',
          imageWidth:"",
          imageHeight:"",
          // isBanFile:false,
          isSameImage:false
        }
      },
      created() {

      },
      computed: {
        getNodeEditModalState: {
          get: function () {
            if(this.$store.state.isNodeEdit){
              this.initSelectNodes();
            }
            return this.$store.state.isNodeEdit
          },
          set: function () {
            this.$store.commit("showNodeEditModal");
          }
        }
      },
      mounted() {
      },
      methods: {
        // 获取选中的点的信息
        initSelectNodes(){
          let _this = this;
          let currentGraphModel = _this.$store.state.currentGraphModel;
          let cy = currentGraphModel.cy;
          _this.selectNodesLength = cy.nodes(":selected").length;
          let nodes = cy.nodes(":selected");
          _.filter(nodes,function (code) {
            if(_this.selectNodes.indexOf(code.data().name) == -1){
              _this.selectNodes.push(code.data().name);
            }
          });
        },

        //节点编辑获取通用图标和实体图标
        getDefaultIcon(){
          this.$http.request({
            method: 'get',
            params:{},
            url:URL.getDefaultIcon,
            success: (data) => {
              if(data.code === 200) {
                this.defaultImgList = data.data.default;
                this.generalImgList = data.data.general;
                this.entityImgList = data.data.entity;
                this.initPreviewImg();
                //获取所有的图标
                this.$emit('selectNodeImageData')
              }
            },
            error: (data) => {
              this.$Message.warning('请求数据失败！');
            }
          });
        },



        //预览图片显示
        initPreviewImg(){
          let currentGraphModel = store.state.currentGraphModel;
          let cy = currentGraphModel.cy;
          let target = cy._private.curNode;
          //点的大小倍数回显
          if(target.data('width')){
            this.nodeEdit.nodeSize = Number(target.data('width') / target.data('width1'));
          }
          let groups = currentGraphModel.data.groups;
          //显示当前点的颜色 --- 选中的只有一个点的时候 显示当前点的颜色  选中多个点的时候  显示蓝色
          if(this.selectNodesLength == 1){
            if(_.isEmpty(groups)){
              $('#previewImg').css({'background-color': '#3f51b5'});
            }else {
              let group = _.find(groups, {'groupId':target.data('group')});
              let backgroundColor = _.isEmpty(group)? '#3f51b5' : group.color;
              $('#previewImg').css({'background-color': backgroundColor});
            }
            $('#previewImg').css({'background-image': target.style('background-image')});
          }else{
            $('#previewImg').css({'background-color': '#3f51b5'});
          }
        },

        //删除图标复原为原始颜色
        deletePreviewImg(){
          if($('#previewImg').css('background-image') === 'none'){
            this.$Message.warning("没有设置图标");
          }else {
            $('#previewImg').css({'background-image':'none'});
            document.getElementById('uploadImageInput').value = '';
            $(".showFileName").html('');
            this.$Message.success("删除图标成功");
            this.defaultIconStr = this.baseImageStr = '';
          }
        },

        //上传图片
        uploadImage(){
          var _this = this;
          //判断是否支持FileReader
          if(new FileReader){
            var reader = new FileReader();
          }else{
            this.$Message.warning('你的设备不支持图片上传功能，如需要请升级你的浏览器！');
          }
          //获取文件
          var fileDom = this.$refs.inputer;
          $(".imgIcon").removeClass('selectIcon');
          if(_.isEmpty(fileDom.files)){
            return false
          }
          var file = fileDom.files[0];
          var fileName = file.name.split(".")[0];
          _this.names=fileName;
          var len = fileDom.files.length;
          if(len > 1){
            this.$Message.warning('最多可以上传1张图片！');
            return false;
          }
          this.imageSize = file.size;
          var imageType = /^image\//;
          //是否是图片
          if(imageType.test(file.type)){
            if(this.imageSize < 71680){
              reader.onload = function (e) {
                var imageNode = new Image();
                _this.baseImageStr = e.target.result;
                _this.defaultIconStr = _this.baseImageStr;
                $('#previewImg').css({'background-image':"url('"+ _this.defaultIconStr +"')"});
                imageNode.src= _this.baseImageStr;
                imageNode.onload = function(){
                  _this.imageWidth = this.width;
                  _this.imageHeight = this.height;
                };
                imageNode = null;
              };
              reader.readAsDataURL(file);

              $(".showFileName").html(fileName);
              // $(".fileErrorTip").html("");
            }else {
              this.$Message.warning('图片型号过大！');
            }
          }else{
            this.$Message.warning('请选择图片！');
            $(".showFileName").html("文件类型有误");
            // $(".fileErrorTip").html("文件类型有误！");
          }
        },
        //取消编辑
        cancelNodeEdit() {
          // $("#inputBtn").css("opacity","1");
          $(".imgIcon").removeClass('selectIcon');
          this.$store.commit("showNodeEditModal", false);
          this.defaultIconStr = '';
          this.baseImageStr = '';
          this.gid = '';
          // this.nid = '';
          this.selectNodes = [];
          $('#previewImg').css({'background-image': 'none'});
          this.nodeEdit.nodeSize = 1;
          document.getElementById('uploadImageInput').value = '';
          $(".showFileName").html("");
          // $(".fileErrorTip").html("");
          this.$refs.formItem.resetFields();
        },

        setNodeImg (selectNodes, cy) {
          let size = parseInt(this.nodeEdit.nodeSize);
          cy.style()
            .selector(selectNodes)
            .style("width", function (e) {
              e.data().width = e.data('width1') * size;
              return e.data('width1') * size;
            })
            .style("height", function (e) {
              e.data().height = e.data('height1') * size;
              return e.data('height1') * size;
            })
            .update();
        },

        //确认编辑
        okNodeEdit() {
          let _this = this;
          _this.isSameImage = false;
          let currentGraphModel = store.state.currentGraphModel;
          let cy = currentGraphModel.cy;
          // 批量编辑节点 -- 选中的对象集合
          var selectNodes = cy.nodes(":selected");
          // let target = cy._private.curNode;
          // 当 baseImageStr与defaultIconStr为空时，不需要发请求 只修改图标的样式即可
          if(_.isEmpty(_this.baseImageStr) && _.isEmpty(_this.defaultIconStr)){
            this.setNodeImg(selectNodes, cy);
            //删除原有图片
            if($('#previewImg').css('background-image') === 'none'){
              cy.style()
                .selector(selectNodes)
                .style("background-fit", 'cover cover')
                .style("background-image", 'none').update();
            }
            this.cancelNodeEdit();
            return false;
          }
          // this.nid = target._private.data.id;
          /*批量编辑节点*/
          // let nid = selectNodes._private.map.keys();
          // console.log(selectNodes,this.nid,[...nid].join(","))
          this.rid = currentGraphModel.rid;
          this.code = currentGraphModel.code;
          var defaultNodeImgList = store.state.defaultNodeImgList;

          _.each(defaultNodeImgList,function (value, key) {
            if(value === encodeURI(_this.baseImageStr)){
              _this.gid = key;
              _this.isSameImage = true;
              return false;
            }
          });
          var params = {};
          if(this.gid !== ""){
            //选择默认图标参数
             params = {
              gid: this.gid,
              nid: this.selectNodes.join(","),
              ntype: this.code,
              rid: this.rid
            };
          }else {
            //自定义图标参数
            params = {
              nid: this.selectNodes.join(","),
              rid: this.rid,
              ntype: this.code
            };
            if(!this.isSameImage){
              params.imageData = this.baseImageStr;
              params.width = this.imageWidth;
              params.height = this.imageHeight;
              params.size = this.imageSize;
            }
          }
            this.$http.request({
              method: 'post',
              //params:params,
              data:params,
              url:URL.updateImageData,
              success: (data) => {
                if(data.code == 200){
                  var curNodeGid = data.data;
                  /*批量编辑节点*/
                  /*this.nodeIds = [];
                  [...selectNodes].forEach((item)=>{
                    this.nodeIds.push(item._private.data.id);
                    item._private.data.gid = curNodeGid;
                    var size = parseInt(this.nodeEdit.nodeSize);
                    var width = item._private.style.width.value;
                    var height = item._private.style.height.value;
                    cy.style()
                      .selector(item)
                      .style("width", width * size)
                      .style("height", height * size)
                      .style("background-fit", 'cover cover')
                      // .style("background-color", $('#previewImg').css('background-color'))
                      .style("background-image", _.isEmpty(this.defaultIconStr)? 'none' : 'url(' + encodeURI(this.defaultIconStr) + ')').update();
                  })*/
                  // 将选中的对象集合 -- 重置的背景图片显示
                  for(let i=0;i<selectNodes.length;i++){
                    selectNodes[i]._private.data.gid = curNodeGid;
                  }
                  cy.style()
                    .selector(selectNodes)
                    .style("background-width", '70%')
                    .style("background-height", '70%')
                    .style("background-image", _.isEmpty(this.defaultIconStr)? 'none' : 'url(' + encodeURI(this.defaultIconStr) + ')')
                    .style('background-repeat', 'no-repeat')
                    .style('background-position-x', '50%')
                    .style('background-position-y', '50%')
                    .update();
                  this.setNodeImg(selectNodes, cy);
                  this.updateResultJsonByRId(curNodeGid);
                  // target._private.data.gid = curNodeGid;
                  //
                  // this.setNodeImg(target, cy);
                  // cy.style()
                  //   .selector(target)
                  //   .style("background-fit", 'cover cover')
                  //   .style("background-image", _.isEmpty(this.defaultIconStr)? 'none' : 'url(' + encodeURI(this.defaultIconStr) + ')').update();
                  // // this.isBanFile = false;
                  // this.updateResultJsonByRId();
                  // this.cancelNodeEdit();
                  store.commit("setSnapshotConfirm",true);//节点编辑成功，切换任务时需要弹出是否保存快照提示框
                }else{
                  this.$Message.warning('上传图片失败');
                }
                this.cancelNodeEdit();
              },
              error: (data) => {
                this.$Message.warning('新建模型失败');
              }
            });
        },
        //选择图标
        setCurrentIcon(event){
          //清空上传
          document.getElementById('uploadImageInput').value = '';
          $(".showFileName").html('');
          var selectElement = event.target;
          if($(selectElement).parent().hasClass('defaultBox')){
            $(".entityBox").find("img").removeClass('selectIcon');
            $(".generalBox").find("img").removeClass('selectIcon');
          }else if($(selectElement).parent().hasClass('entityBox')){
            $(".defaultBox").find("img").removeClass('selectIcon');
            $(".generalBox").find("img").removeClass('selectIcon');
          }else if($(selectElement).parent().hasClass('generalBox')){
            $(".defaultBox").find("img").removeClass('selectIcon');
            $(".entityBox").find("img").removeClass('selectIcon');
          }
          $(selectElement).siblings().removeClass('selectIcon');
          if($(selectElement).hasClass('selectIcon')){
            $(selectElement).removeClass('selectIcon');
            this.gid = "";
            // this.isBanFile = false;
            this.defaultIconStr = "";
            baseImageStr = "";
            // $("#inputBtn").css("opacity","1");
          }else{
            this.defaultIconStr = $(selectElement).attr('src');
            this.baseImageStr = $(selectElement).attr('src');
            $(selectElement).addClass('selectIcon');
            this.gid = $(selectElement).attr('gid');
            // this.isBanFile = true;
            // $("#inputBtn").css("opacity","0.5");
          }
          $('#previewImg').css({'background-image':"url('"+ this.defaultIconStr +"')"})
        },
        //前台更新图形数据
        updateResultJsonByRId(gid){
          let currentGraphModel = store.state.currentGraphModel;
          let cy = currentGraphModel.cy;
          let nodesData = cy.json().elements.nodes;
          for(let i = 0; i < nodesData.length; i++){
              let id = nodesData[i].data.name;
              if(this.selectNodes.indexOf(id) > -1){
                nodesData[i].data.gid = this.gid;
                break;
              }
              // if(this.nid.indexOf(id)!=-1){
              //   nodesData[i].data.gid = id;
              // }
          }
          currentGraphModel.data.nodes = nodesData;
        }
      }
    }
</script>

<style scoped>
  .imgIcon{
    display:inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    margin: 8px;
    vertical-align: middle;
  }
  .previewImgIcon{
    display:inline-block;
    width: 60px;
    height: 60px;
    line-height: 50px;
    cursor: pointer;
    margin: -15px 8px 0 8px;
    vertical-align: middle;
    border-radius: 50%;
    border: 1px #deabab solid;
    background-size: 70% 70%;
    background-repeat: no-repeat;
    background-position: center;
  }

  .preview-delete-icon{
    font-size: 18px;
    margin-top: -15px;
    margin-left: -5px;
  }

  .selectIcon{
    border: 1px solid #e4393c;
    border-radius: 5px;
    padding: 1px;
  }
  .inputFile{
    display:inline-block;
    width: 160px;
    height: 32px;
  }

  .input-file{
    float: left;
    position: relative;
    overflow: hidden;
    text-align: center;
    width: auto;
    background: #fffdef;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: normal;
    line-height: 18px;
    color: #333B4E;
    text-decoration: none;
  }
  .input-file input[type="file"]{
    position: absolute;
    top:0;
    right: 0;
    font-size: 14px;
    background: #fff;
    transform: translate(-300px,0px) scale(4);
    height: 40px;
    opacity: 0;
    filter:alpha(opacity=0);
  }
  .fileErrorTip{
    /*display: none;*/
    float: left;
    width: 150px;
    height: 30px;
    line-height: 30px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    padding-left: 8px;
    text-overflow: ellipsis;
  }
  .showFileName{
    /*display: none;*/
    float: left;
    height: 30px;
    width: 150px;
    padding-left: 8px;
    line-height: 30px;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .iconTitle{
    padding: 10px 0 0 10px;
  }
  .entityBox,.generalBox,.defaultBox{
    height: 200px;
    overflow-y: auto;
    padding: 10px 0 10px 0;
  }
  .inputSize{
    width:50px;
    height:25px;
    border-radius: 4px;
    text-align: center;
  }
</style>
