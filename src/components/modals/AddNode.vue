<template>
  <div id="addNode">
    <div class="addNodeModel">
      <Modal v-model="getModalState" title="新增节点" width="810" :mask-closable="false" >
        <Form ref="formItem" :label-width="82">
          <div class="changeType">
            <!--<span>选择新增</span>-->
            <RadioGroup v-model="taginfo" @on-change="changeCarda">
              <Radio label="mt">手动添加</Radio>
              <Radio label="tg">使用案件标识</Radio>
            </RadioGroup>
          </div>

          <FormItem label="新增类型：" v-show="isTage">
            <Select v-model="formSend.code" @on-change="getNewNumTypes">
              <Option :value="item.label" v-for="(item,key) in this.numtypelist" :key="key"
                      @click.native="getNewTypeReg(item.regular,item.name)">{{item.name}}
              </Option>
            </Select>
          </FormItem>

          <div class="rowcard" v-show="isTage">
            <div class="btnlist" style="float: left">
              <Button type="default" size="small" style="height:32px;width:75px ;margin-right:10px;float: left"
                      @click="templateDownload">下载模板
              </Button>
              <Upload :action="uploadPath"
                      :before-upload="beforeUpload"
                      :on-success="handleSuccess"
                      :data="uploadParams"
                      :on-error="handleError"
                      style="float:left ;height: 44px;"
                      :max-size="5242880"
                      :show-upload-list="false">
                <Button type="default" icon="ios-cloud-upload-outline"
                        style="height:32px;width:75px; margin-top:7px;float:left">导入
                </Button>
              </Upload>
              <Button type="default" style="height:32px;width:75px ;margin-left:10px;float:left" @click="clearAll">清空
              </Button>
            </div>
            <p class="userinfo">*&nbsp;导入支持xls,xlsx,txt格式文件,请不要上传超过5M的文件</p>
          </div>

          <FormItem label="新增号码：" v-show="isTage">
            <Input v-model="formItem.nums" type="textarea" style="overflow-y: scroll;"
                   :autosize="{minRows:9,maxRows:10}" @on-blur="checkNewNumType"
                   placeholder="输入号码前请先确认选择类型,多个号码使用换行分割"/>
            <span v-show="isErroInmation" style="color: red;font-size: 8px">{{ErroText}}</span>
          </FormItem>
        </Form>
        <div slot="close" @click="closeModal">
          <Icon type="ios-close"></Icon>
        </div>
        <div slot="footer" v-show="isTage">
          <Button type="text" @click="addNodeCancel">取消</Button>
          <Button type="default" @click="subMitNewNumType">确定</Button>
        </div>
        <!--案件标识-->
        <div class="tagerMin" v-show="isTageCard">
          <div v-if="caseNumList.length > 0">
            <!--   <Row :gutter="16" style="margin-bottom:24px" id="tagRow">
                 <li class="cls-tag" v-for="(item,key1) in caseNumList">
                   <Col span="4">
                   <span class="cardTitle">{{item.name}}</span>
                   <Tooltip content="批量删除">
                     <Icon type="md-close-circle" size="22" @click.native="batchDelete(item)" style="margin-left:5px;position:relative;top:2px"></Icon>
                   </Tooltip>
                   <Tooltip content="清空号码">
                     <Icon type="md-trash" @click.native="emptyHandler(item)" size="22" style="margin-left:5px;position:relative;top:2px"></Icon>
                   </Tooltip>
                   <div class="tagBox">
                     <Tag type="border" :ref="item.type"  checkable :checked=false closable  v-for="(item1,key) in item.nodeList" :key="key" :name="item1" @on-close="singleClose(item1,item)" color="blue">{{item1}}</Tag>
                   </div>
                   <Page :total="item.value.length" v-show="item.value.length > pageSize ? true : false" :current="current0" :pageSize="pageSize" @on-change="changePage($event,item)" simple class="page"></Page>
                   </Col>
                 </li>
               </Row>-->
            <Row>
              <Col span="10" style="margin: 0 20px ">
              <Tabs type="card" :value="tabType" @on-click="changeTabName">

                <TabPane :label="item.name" :name='item.type' v-for="(item, itemKey) in caseNumList" :key="itemKey">
                  <Input v-model="item.searchNode" style="width:74%;margin-bottom: 5px" class="statisticsSearch"
                         size="small" placeholder="搜索对象..." @on-keyup="searchNodeName(item,false,true)">
                  </Input>
                  <div class="tagBox">
                    <Tag type="border" :ref="item.type" :checked=false v-for="(value,key) in item.nodeList" :key="key"
                         :name="key" @click.native="selectNumber(item, value)" color="blue">{{value}}
                    </Tag>
                  </div>
                  <Page :total="item.value.length" :current="item.currentPage" :pageSize="pageSize"
                        @on-change="changePage($event,item)" class="page" size="small"  show-total></Page>
                </TabPane>
              </Tabs>
              </Col>
              <div class="btn">
                <Icon type="ios-arrow-forward" id="backRight" style="margin-bottom: 10px"  v-if="isRDisable"></Icon>
                <Icon type="ios-arrow-forward" title="" @click="selectAll(true)" v-if="!isRDisable" style="margin-bottom: 10px"></Icon>
                <Icon type="ios-arrow-back" @click="selectAll(false)" v-if="!isLDisable"></Icon>
                <Icon type="ios-arrow-back" id="backLeft" v-if="isLDisable"></Icon>
              </div>
              <Col span="10" style="margin: 0 20px ">
              <Tabs type="card">
                <TabPane label="目标号码">
                  <Input v-model="targetData.searchNode" style="width:74%;margin-bottom: 5px" class="statisticsSearch"
                         size="small" placeholder="搜索对象..." @on-keyup="searchNodeName(targetData,true,true)">
                  </Input>
                  <div class="tagBox" :class="isSub ? 'targetBox' :'' ">
                    <Tag type="border" :checked=false v-for="(tarValue,tarKey) in targetData.nodeList" :key="tarKey"
                         :name="tarKey" @on-close="singleClose(tarValue)" closable color="blue"
                         v-show="tarValue.name==='' ? false : true">{{tarValue.name}}-{{tarValue.value}}
                    </Tag>
                  </div>
                  <Page :total="targetData.value.length" @on-change="changePage($event,targetData,true)"
                        :current="targetData.currentPage" :pageSize="pageSize" class="page" size="small"
                        show-total></Page>
                </TabPane>
              </Tabs>
              </Col>

            </Row>

          </div>
          <div v-else style="width: 100%; text-align: center; color: #8da2d8dd;">
            <span class="param-label">暂无案件标识</span>
          </div>
        </div>
        <div slot="footer" v-show=" isTageCard && caseNumList.length > 0">
          <Button type="text" @click="addcaseCancel">取消</Button>
          <Button type="default" @click="subMitCaseNum">确定</Button>
        </div>
      </Modal>
    </div>
    <!--重复号码提示框-->
    <div id="deleteNum">
      <Modal title="重复号码" v-model="isshowDelete" :styles="{top: '160px',width:'630px'}">
        <Form ref="createTaskForm" :label-width="110">
          <FormItem label="重复号码：">
            <Input v-model="deleteNum" disabled type="textarea" style="overflow-y: scroll;"
                   :autosize="{minRows:9,maxRows:10}"/>
          </FormItem>
        </Form>
        <div slot="close" @click="closeDelete">
          <Icon type="ios-close"></Icon>
        </div>
        <div slot="footer">
          <Button type="text" @click="cancels">取消</Button>
          <Button type="primary" @click="cancelsDelete">确定</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
  import * as allOperation from '../../pages/graph/js/allOperation'
  import {URL} from "../../../api/urlsConfig"
  import * as uuId from "../../utils/uuid"
  import GraphModel from "../../pages/graph/js/GraphModel"
  export default {
    name: "add-node",
    data() {

      return {
        isBtn: true,
        tabType: '',
        isSub: false,
        isCheckInfoa: true,
        isCheckInfob: false,
        taginfo: 'mt',
        isTage: true,
        isTageCard: false,
        isshowDelete: false,
        deleteNum: '',
        file: null,
        maxNum: 0,
        //更新后的服务号码
        updateFwhm: '',
        //更新后的msi
        updateMsi: '',
        //更新后的imei
        updateimei: '',

        //使用案件标识list集合
        caseNumList: [],
        //卡号当前分页号码
        current1: 1,
        MSIData: [],
        nodeList1: [],
        totalCount1: 0,
        //设备号当前分页号码
        current2: 1,
        totalCount2: 0,
        IMEIData: [],
        nodeList2: [],
        //服务号码当前分页号码
        nodeList0: [],
        fwhmData: [],
        current0: 1,
//          currentPage: 1,
        pageSize: 20,
        totalCount0: 0,
        caseNodeList: '',
        //上传成功返回的数据（模拟）
        targetData: {
          searchNode: "",
          currentPage: 1,
          value: [],
          allValue: [],
          nodeList: [{value: [], name: ''}]
        },
        uploadData: {
          "data": [
            {
              "type": "fwhm",
              "value": "15565656590\n15565656591\n15565656592\n15565656593"
            },
            {"type": "size", "value": "35"}
          ],
          "msg": "success"
        },
        uploadParams: {
          multipartFile: '',
          nowCount: 0,
        },

        uploadPath: URL.uploadPath,    //上传文件地址
        isAddModal: false,
        isErroInmation: false,
        reglist: '',
        ErroText: '',
        formSend: {
          name: '',
          code: ''
        },
        numtypelist: '',
        formItem: {
          nums: "",
        },
        newNodes: '',
        numReg: '',
        numName: '',
        searchNode: '',
        searchTargetNode: '',
        isLDisable:true,
        isRDisable:false
      }

    },

    components: {},
    created() {
      //含有正则的标签集合
      let typelist = this.$store.state.queryBaseDictionData;

      //下拉列表数据
      this.numtypelist = typelist.nodePro;
      //  console.log(this.numtypelist)
      //正则集合数据
      // this.reglist = _.map(this.numtypelist, 'val1')


    },
    computed: {
      //弹窗状态标识计算
      getModalState: {
        get: function () {
          if( this.$store.state.isAddNodeModal){
            this.caseNumList = [];
            this.getqueryUserNumByCase();
          }
          return  this.$store.state.isAddNodeModal
        },
        set: function () {
          this.$store.commit("showAddNodeModal");
        }
      },
    },
    watch: {},
    mounted() {

    },
    methods: {
      //根据type获// 取name
      getNameByType(type){
        let currentNode = _.find(this.caseNumList, {'type': type});
        currentNode.name = _.find(this.numtypelist, {'label': type}).name;
        currentNode.currentPage = 1
        //分页
        currentNode.searchNode = currentNode.searchNode === undefined ? "" : currentNode.searchNode;
        this.searchNodeName(currentNode);
        this.changePage(currentNode.currentPage, currentNode);
      },

      //关闭
      closeDelete(){
        this.isshowDelete = false;
        this.deleteNum = '';
        this.initTarget();
        this.$refs.formItem.resetFields();
      },
      cancels(){
        this.isshowDelete = false;
        this.deleteNum = '';
        this.$refs.formItem.resetFields();
      },
      cancelsDelete(){
        this.isshowDelete = false;
        this.deleteNum = '';
      },
      //处理分页问题
      changePage(page, item){
        item.currentPage = page;
        let currentNum = page * this.pageSize;
        item.nodeList = _.slice(item.value, this.pageSize * (page - 1), currentNum);
        if (_.isEmpty(item.nodeList) && page > 1) {
          this.changePage(page - 1, item)
        }
        this.$forceUpdate();
      },
      //清空
      clearAll() {

      },
      //切换新增模板
      changeCarda() {
        let _this=this;
        if (this.taginfo == 'mt') {
          this.isTage = true;
          this.isTageCard = false;
        }
        if (this.taginfo == 'tg') {
         /* this.caseNumList = [];
//              this.current0 = 1;
          this.getqueryUserNumByCase();*/
//          _.each(_this.caseNumList,function (num) {
//            num.searchNode = "";
//            _this.searchNodeName(num);
//          });
          this.isTage = false;
          this.isTageCard = true;
          this.isSub = false;
          let currentNode = _.find(_this.caseNumList, {'type': _this.tabType});
          this.isRDisable=currentNode.value.length == 0;
          // 按钮不能点
          this.isLDisable=_this.targetData.value.length == 0;
 //         _this.initTarget()
//         this.targetData.searchNode = "";
//          _this.searchNodeName(this.targetData, true);
        }

      },
      //获取案件标识数据
      getqueryUserNumByCase() {
        let _this = this;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let currentTaskModel = currentGraphModel.taskModel;
        let caseID = currentTaskModel.caseId;
        this.$http.request({
            method: 'get',
            params: {caseId: caseID},
            url: URL.queryUserNumByCaseId,
            success: (data) => {
            if (data.code === 200) {
//          this.isTageCard = true;
          if(!_.isEmpty(data.data)) {
            _this.caseNumList = data.data;
            _.each(_this.caseNumList, function (num) {
              num.allValue=num.value;
              _this.getNameByType(num.type)
            });
            this.tabType = _.first(_this.caseNumList).type;

            if($(".cls-tag .ivu-tag-checked").length>0){
              $(".cls-tag .ivu-tag-checked").removeClass(".ivu-tag-checked")
            }
          }
        }else {
          this.$Message.warning('请求案件标识数据异常！');
        }
      },
        error: (data) => {
          this.$Message.warning('请求案件标识数据失败！');
        }
      });
      },
      //批量删除
      batchDelete(item) {
        let nums = [];
        this.$refs[item.type].forEach(v => {
          if(v.isChecked){
          nums.push(v.name);
        }
      });
        let lastPage = item.value.length % this.pageSize;
        if (this.fwhmCurrent > 1) {
          if (this.fwhmCurrent == Math.ceil(item.value.length / this.pageSize) && lastPage > 0 && nums.length == lastPage) {
            this.fwhmCurrent -= 1;
          }
        }
        this.updateNumList(nums, item);
      },
      //批量删除更新数据
      updateNumList(mums, item){
        item.value = _.difference(_.concat(mums, item.value), mums);
        this.totalCount0 = item.value.length;
        this.changePage(item.currentPage, item);
        this.$refs[item.type].forEach(v => {
          v.checked = false;
        v.isChecked = false;
      })
        ;
      },
      //清空
      emptyHandler(item){
        item.value = [];
        item.nodeList = [];
        this.changePage(item.currentPage, item);
      },
      //案件标识取消
      addcaseCancel(){
        this.taginfo = 'mt';
        this.isTage = true;
        this.isTageCard = false;
        this.isSub = false;
        this.isRDisable=false;
        this.isLDisable=true;
        this.initTarget();
        this.$store.commit("showAddNodeModal", false);
        this.$store.commit("rightClick_position", null);
      },
      //案件标识号码提交
      subMitCaseNum(){
        let _this = this;
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let paramNodeVoList = [];
        let deleteNumList = [];
        if (this.targetData.allValue.length === 0) {
          this.isSub = true;
        }
        let newTargetData = _.groupBy(this.targetData.allValue, 'type');
        _.each(newTargetData, function (children, nodeType) {
          let nodeList = _.uniq(_.map(children, 'value'));
          //过滤出图上没有的号码
          nodeList = _.reject(nodeList, function (caseNode) {
            return _.find(cy.nodes(), function (node) {
              if (node.data('name') === caseNode && node.data('type') === nodeType) {
                deleteNumList.push(caseNode);
                return caseNode;
              }
            })
          });
          _this.setParamNodeVoList(nodeList, nodeType, paramNodeVoList)
        });
        //显示重复的点
        this.deleteNum = _.join(deleteNumList, ',');
        this.doCaseNodes(paramNodeVoList);
      },
      //封装添加参数
      setParamNodeVoList: function (newNodes, nodeType, paramNodeVoList) {
        let value = _.join(newNodes, ',');
        let currentNodePro = _.find(this.numtypelist, {'label': nodeType});
        if (!_.isEmpty(currentNodePro)) {
          let flag = currentNodePro.dyFlag ? 1 : 0;
          let indexLabel = currentNodePro.indexLabel;
          paramNodeVoList.push({nodeType: nodeType, value: value, flag: flag, indexLabel: indexLabel});
        }
      },

      //上传前文件大小判定
      beforeUpload(file) {
        let fileSize = file.size;
        var fileType = /\.txt|\.xls|.csv|.xlsx$/;
        if (!fileType.test(file.name)) {
          this.$Message.info("请选择正确文件格式");
          return false;
        } else {
          if (fileSize < 5242880) {
            return this.getParams(file);
          } else {
            this.$Message.info("请不要上传超过5M的文件");
          }
        }
      },

      //成功后利用Promise回调
      getParams(file) {
        return new Promise((resolve, reject) => {
          this.uploadParams.multipartFile = file.name;
        this.uploadParams.nowCount = this.numHandler();
        resolve()
      })
      },
      //已有号码时去重统计长度
      numHandler() {
        let fArray = this.formItem.nums == '' ? [] : this.formItem.nums.replace(/\r|\n/g, ',').split(',').filter(item => item
      )
        ;
        let fArr = Array.from(new Set(fArray));
        this.formItem.nums = fArr.length == 0 ? "" : fArr.join("\n");
        let totalLength = fArr.length;
        return totalLength
      },
      //上传成功后的回调方法
      handleSuccess(res, file) {
        if (res.code === 200 && res.data) {
          let data = res.data;
          this.formItem.nums = data[0].value;
        } else {
          this.$Message.warning('导入失败,请检查');
        }

      },
      //导入失败上传失败时显示
      handleError(res, file, fileList) {
        this.$Message.warning('导入失败,请检查');
      },
      //下载模板
      templateDownload() {
        window.location.href = URL.templateDownload + "?fileName=" + "node_type_template.xlsx";
        //测试显示数据
        // this.formItem.nums=this.uploadData.data[0].value
      },
      //清空
      clearAll() {
        this.formItem.nums = '';
      },

      //过滤与图上重复的号码
      filterRepeatOfGraph: function (nodeArr) {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let cy = currentGraphModel.cy;
        let _this = this;
        if (!_.isEmpty(cy.nodes())) {
          let Arr = [];
          _.filter(cy.nodes(), function (md) {
            for (let i = 0; i < nodeArr.length; i++) {
              if (md.data().name === nodeArr[i] && md.data().type === _this.formSend.code) {
                Arr.push(md.data().name);
                nodeArr.splice(i, 1)
              }
            }
            _this.deleteNum = Arr.join(",")
          })
        }
      },
      //数据处理,新增提交
      subMitNewNumType() {
        this.newNodes = '';
        let vsls = this.checkNewNumType();
        if (vsls) {
          if (this.formSend.code === '' || this.formItem.nums === '') {
            this.isErroInmation = true;
            this.ErroText = '请选择一个类型并输入要新增的号码,以换行符分割';
            return false
          } else {
            this.isErroInmation = false;
            let dataList = [];

            let dataArr = this.formItem.nums.split("\n");
            //去除号码中的空, 去重
            let newDataArr = _.uniq(dataArr.filter(function (item) {
              return item && item.trim();
            }));
            //过滤掉添加节点中与图上重复的点
            this.filterRepeatOfGraph(newDataArr);
            this.doAddNode(newDataArr);
            this.formItem.nums = "";
            this.formSend.code = "请选择";
          }
        } else {

        }

      },

      //关闭新增弹窗
      addNodeCancel() {
        this.formItem.nums = "";
        this.formSend.code = '';
        this.isSub = false;
        this.initTarget();
        this.$store.commit("showAddNodeModal", false);
        this.$store.commit("menuAddNode", false);
        this.$store.commit("rightClick_position", null);
        this.isRDisable=false;
        this.isLDisable=true;
      },
      //案件标识点添加刷新右侧
      doCaseNodes(paramNodeVoList){
        this.$store.commit("showStatisticsAndAnalyzeCon", false);
        this.$store.commit("graphLoad", true);

        //显示重复的值
        if (!_.isEmpty(this.deleteNum)) {
          this.isshowDelete = true;
        }
        //过滤出因重复为空的值
        paramNodeVoList = _.reject(paramNodeVoList, {'value': ''});
        if (_.isEmpty(paramNodeVoList)) {
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
          this.$store.commit("menuAddNode", false);
          this.$store.commit("graphLoad", false);
          this.$Message.warning("没有可添加的目标标识");
          return false;
        }
        this.taginfo = 'mt';
        this.isTage = true;
        this.isTageCard = false;
        this.$store.commit("showAddNodeModal", false);

        this.$http.request({
            method: 'post',
            data: JSON.stringify(paramNodeVoList),
            url: URL.addNode,
            success: (data) => {
            if (data.code === 200 && data.data)
        {
          allOperation.addCasnodes(data.data);
          this.initTarget();
          this.$store.commit("setSnapshotConfirm", true);//新增成功后图发生变化，设置true
          this.$store.commit("graphLoad", false);
        }
      else
        {
          this.$store.commit("graphLoad", false);
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
          this.$store.commit("menuAddNode", false);
          this.$store.commit("graphLoad", false);
          this.$Message.warning('添加节点失败！');
        }
        this.$refs.formItem.resetFields();
      },
        error: (data) =>
        {
          this.$store.commit("graphLoad", false);
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
          this.$store.commit("menuAddNode", false);
          this.$store.commit("graphLoad", false);
          this.$Message.warning('添加节点失败！');
        }
      });
      },

      //刷新右侧对象树
      doAddNode(newNodes) {
        this.$store.commit("showStatisticsAndAnalyzeCon", false);
        let paramNodeVoList = [];
        let nodeType = this.formSend.code;
        //显示重复的值
        if (!_.isEmpty(this.deleteNum)) {
          this.isshowDelete = true;
        }
        //过滤出因重复为空的值
        if (_.isEmpty(newNodes)) {
          this.$store.commit("graphLoad", false);
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
          this.$store.commit("menuAddNode", false);
          this.$store.commit("graphLoad", false);
          this.$Message.warning("没有可添加的标识");
          return false;
        } else {
          this.setParamNodeVoList(newNodes, nodeType, paramNodeVoList);
        }
        this.$store.commit("showAddNodeModal", false);
        this.$store.commit("graphLoad", true);
        this.$http.request({
            method: 'post',
            data: JSON.stringify(paramNodeVoList),
            url: URL.addNode,
            success: (data) => {
            if (data.code === 200 && data.data)
        {
          allOperation.addNode(data.data);
          this.$store.commit("setSnapshotConfirm", true);//新增成功后图发生变化，设置true
          this.$store.commit("graphLoad", false);
        }
      else
        {
          this.$store.commit("graphLoad", false);
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
          this.$store.commit("menuAddNode", false);
          this.$store.commit("graphLoad", false);
          this.$Message.warning('添加节点失败！');
        }
        this.$refs.formItem.resetFields();
      },
        error: (data) =>
        {
          this.$store.commit("showStatisticsAndAnalyzeCon", true);
          this.$store.commit("menuAddNode", false);
          this.$store.commit("graphLoad", false);
          this.$store.commit("graphLoad", false);
          this.$Message.warning('添加节点失败！');
        }
      });

      },

      //右上关闭按钮
      closeModal() {
        this.formItem.nums = "";
        this.formSend.code = '';
        this.initTarget();
        this.taginfo = 'mt'
        this.isTage = true;
        this.isTageCard = false;
        this.$store.commit("rightClick_position", null);
        this.$store.commit("menuAddNode", false);
        this.isSub = false;
        this.isRDisable=false;
        this.isLDisable=true;
      },
      //获取当前选择类型的正则匹配
      getNewTypeReg(reg, name) {
        if (reg != '' || reg != undefined) {
          this.numReg = reg;
          this.numName = name;
        }

      },
      //获取新增类型并验证输入数据是否合法
      checkNewNumType() {
        if (this.formSend.code == undefined || this.formSend.code == '') {
          this.isErroInmation = true;
          this.ErroText = '请选择新增类型';
          return false
        }

        if (this.numReg != undefined && this.formSend.code != '' && this.formSend.code != undefined) {
          let testIdArr = []
          let tregs = /\s/;
          let numList = this.formItem.nums.split("\n")
          for (let i = 0; i < numList.length; i++) {
            let regs = eval(this.numReg)
            var regResult = regs.test(numList[i])
            var regsResult = tregs.test(numList[i])
            if (regResult && !regsResult) {
              testIdArr.push(numList[i])
              if (testIdArr.length == numList.length) {
                this.isErroInmation = false;
                return true
              }
            } else {
              this.isErroInmation = true;
              this.ErroText = '请输入合法的' + this.numName;
              return false
            }
          }
        } else {
          return true;
        }
      },
      getNewNumTypes() {
        console.log(this.formSend.code)
        if (this.formSend.code != '') {
          this.isErroInmation = false;
        }
      },
      //服务号码标签单个删除
      singleClose(tarValue,isBatch) {
        let _this = this;
        let tarValueArr=[];
        if(isBatch){
          tarValueArr=tarValue;
        }else{
          tarValueArr.push(tarValue);
        }
        let newTargetData = _.groupBy(tarValueArr, 'type');
        _.each(newTargetData,function (children,type) {
          //将数据添加至案件标识中
          let currentNode = _.find(_this.caseNumList, {'type': type});
          let valueArr = _.uniq(_.map(children, 'value'));
          currentNode.allValue=currentNode.allValue.concat(valueArr);
          _this.getNameByType(type);
        //将数据从目标号码中移除、

        /*  let targetItem = _.find(this.targetData.allValue, {'type': tarValue.type, 'value': tarValue.value});
          this.targetData.allValue = _.reject(this.targetData.allValue, targetItem);*/
          _this.targetData.allValue =_.differenceBy(_this.targetData.allValue,children,'value');
          _this.searchNodeName(_this.targetData, true,false,true);
          _this.changePage(_this.targetData.currentPage, _this.targetData);
        });
        this.tabType =_.first(_.keys(newTargetData));
        // 案件标识按钮不能点
        let currentNode = _.find(_this.caseNumList, {'type': this.tabType});
        this.isRDisable=currentNode.value.length == 0;
          // 按钮不能点
          this.isLDisable=_this.targetData.value.length == 0;
      },
      setTargetData(valueArr, item){
        let _this = this;
        _.each(valueArr,function (valueItem) {
          let targetItem = {
            type: item.type,
            name: item.name,
            value: valueItem
          };
          _this.targetData.allValue.push(targetItem);
        });
        _this.searchNodeName(_this.targetData, true,false,true);
        _this.changePage(_this.targetData.currentPage, _this.targetData);
//        return targetItem;
      },
      selectNumber(item, value, isBatch) {
        let valueArr = [];
        if (isBatch) {
          valueArr=value;
        } else {
          valueArr.push(value);
        }
        let _this = this;
        this.isSub = false;//是否报红
        _this.setTargetData(valueArr, item);
        let caseItem = _.find(this.caseNumList, {'type': item.type});
        //从案件标识中移除所过滤过滤出来的所有号码
        _.remove(caseItem.allValue, function (node) {
          return _.includes(valueArr,node)
        });
        this.searchNodeName(caseItem,false,false,true);
        this.changePage(item.currentPage, item);
        //目标号码按钮不能点
        this.isLDisable=_this.targetData.allValue.length == 0;
          // 案件标识按钮不能点
          this.isRDisable=item.value.length == 0;
      },
      changeTabName(name) {
        this.tabType = name;
        let currentNode = _.find(this.caseNumList, {'type': name});
        this.isRDisable=currentNode.value.length == 0;
      },
      initTarget() {
        this.targetData = {
          searchNode: "",
          currentPage: 1,
          value: [],
          allValue: [],
          nodeList: [{value: [], name: ''}]
        };
      },
      searchNodeName(item, isTarget,isOnKeyUp,isNoRefresh) {
        let _this=this;
//            this.searchNode;
        item.value = this.searchFilter(item.searchNode, item.allValue, isTarget);
        if(!isNoRefresh){
          this.changePage(1, item);
        }
        if(isOnKeyUp){
          let currentNode = _.find(_this.caseNumList, {'type': _this.tabType});
          this.isRDisable=currentNode.value.length == 0;
          // 按钮不能点
          this.isLDisable=_this.targetData.value.length == 0;
        }
      },
      //过滤搜索
      searchFilter(content, allData, isTarget) {
        return _.filter(allData, function (node) {
          return isTarget ? _.includes(node.value, content) : _.includes(node, content);
        });
      },
      selectAll(flag){
        let _this=this;
        if (flag) {
          //案件标识全部添加到目标号码中
          let caseItem = _.find(this.caseNumList, {'type': this.tabType});
          _this.selectNumber(caseItem, caseItem.value, true);
        } else {
          //目标号码删除至案件标识列表中
          _this. singleClose(_this.targetData.value,true);
        }

      }
    }
  }
</script>

<style scoped lang="less">
  .tagerMin {
    width: 100%;
    max-height: 370px;

  }

  .btn {
    width: 30px;
    height: 100%;
    float: left;
    position: relative;
    top: 160px;
  }

  .changeType {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  >
  .ivu-radio-group {
    margin-left: 10px;
  }

  }
  .cardTitle {
    display: inline-block;
    margin-left: 10px;
  }

  .setTitle {
    background: #3a7db8;

  >
  .ivu-icon {
    font-size: 12px;
  }

  }
  .rowcard {
    align-items: center;
    display: flex;
    width: 100%;

  }

  .btnlist {
    display: flex;
    align-items: center;
    margin-left: 111px;

  }

  .userinfo {
    color: red;
    margin-left: 5px;
  }
</style>
<style lang="less">
  .btn .ivu-icon {
    font-size: 24px;
  }
#backRight{
  color: #666 !important;
}
  #backLeft{
    color: #666 !important;
  }
  .tagerMin .ivu-tabs .ivu-tabs-bar {
    margin-bottom: 5px;
  }

  .cls-tag .ivu-tooltip .ivu-icon {
    font-size: 18px !important;
    top: -1px !important;

  }

  .tagBox {
    border: 1px solid #dddee1;
    height: 285px;
    padding: 4px 7px;
    overflow: auto;
    margin-bottom: 5px;

  .ivu-tag {
    display: flex;
    width: 300px;
    justify-content: space-between;
    align-items: center;
  }

  }
  .targetBox {
    border: 1px solid red !important;
  }

  .cls-tag {
    text-align: center;
  }

  .cls-tag .ivu-col-span-4 {
    width: 250px;
  }

  .cls-tag .ivu-tag-checked {
    background: #2d8cf0 !important;
    color: white !important;
  }

  .tagBox .ivu-tag-checked .ivu-tag-text {
    color: white !important;
  }

  .tagBox .ivu-tag-checked .ivu-icon-ios-close {
    color: white !important;
  }

  .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab {
    margin: 0;
    margin-right: 2px;
    height: 31px;
    padding: 6px;
    border: 1px solid #dcdee2;
    border-bottom: 0;
    border-radius: 4px 4px 0 0;
    transition: all .3s ease-in-out;
    background: #f8f8f9;
    font-size: 12px;
  }
</style>
