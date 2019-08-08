<template>
  <div id="create-statistics-model">
    <Modal v-model="getCommonRelationState" title="共同关联" :mask-closable="false" width="500">
      <Form ref="formItem" :model="formItem" :label-width="110" :rules="ruleValidates" style="margin-right: 30px">
        <FormItem label="时间范围：" prop="dateValue">
          <DatePicker type="daterange" :options="disableOpt" v-model="formItem.dateValue" :editable=false
                      :clearable=false split-panels placeholder="请选择要查看的时间范围" style="width: 100%">
          </DatePicker>
        </FormItem>

        <FormItem label="对象类型：" prop="nodeType">
          <Select v-model="formItem.nodeType" @on-change="changeNodePro">
            <Option v-for="item in nodeTypeList" :value="item.label" :key="item.label">{{item.name}}</Option>
          </Select>
        </FormItem>

        <FormItem label="关系类型：" prop="edgeType">
          <Select v-model="formItem.edgeType">
            <!-- v-show="item.dyFlag" -->
            <Option v-for="item in edgeTypeList" :value="item.label" :key="item.label">
              {{item.name}}
            </Option>
          </Select>
        </FormItem>

        <FormItem label="对象名称：" prop="nodeNameList">
          <div class="createModel-node-content">
            <Input v-model="searchNodeNameContent" style="width:74%" class="statisticsSearch"
                   size="small" placeholder="搜索对象..." @keyup.enter.native="searchNodeName">
            <Button slot="append" icon="ios-search" size="small" @click="searchNodeName"></Button>
            </Input>
            <!--<Icon style="position: absolute;left: 5px;top: 2px;" type="iso-refresh"></Icon>-->
            <span style="position: absolute;right: 5px;top: 2px;">共 {{ formItem.nodeNameList.length}} 个</span>
            <div class="createModel-node-tags">
              <Tag type="border" checkable :checked=false closable
                   :class="item.search===true ?'createModel-searchNodeName' : ''"
                   v-for="(item,key) in formItem.nodeNameList" :key="key" :name="key" @on-close="deleteNodeName(item)"
                   color="blue">
                {{item.typeName}}-{{item.name}}
              </Tag>
            </div>
          </div>
        </FormItem>
      </Form>
      <div slot="close" @click="closeCreateModel">
        <Icon type="ios-close"></Icon>
      </div>
      <div slot="footer">
        <Button type="text" @click="closeCreateModel">取消</Button>
        <Button type="default" @click="okCreateModel">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {URL} from "../../../api/urlsConfig"
  import {initDate} from '@/utils/date'

  export default {
    name: "create-statistics-model",
    data() {
      const modelNameValidate = (rule, value, callback) => {
        if (value.length > 40) {
          callback(new Error('任务名称长度不能超过40个字节'))
        }
        if (value.length == 0) {
          callback(new Error('任务名称不能为空'))
        }
        if (value.indexOf(" ") >= 0) {
          callback(new Error(('任务名称不能有空格')))
        }
        else {
          callback()
        }
      };
      return {
        disableOpt: {
          disabledDate(date) {
            return date && date.valueOf() > new Date().getTime();
          },
          shortcuts: [
            {
              text: '一周',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return [start, end];
              }
            },
            {
              text: '一个月',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start, end];
              }
            },
            {
              text: '三个月',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start, end];
              }
            },
            {
              text: '六个月',
              value() {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
                return [start, end];
              }
            }
          ]
        },
        edgePro: [],
        nodeTypeList: [],
        edgeTypeList: [],
        modelTypeList: [],
        statisticsModel: '',
        labelList: [],
        formItem: {
          edgeType: [],
          nodeType: '',
          nodeNameList: [],
          dateValue: initDate(),

        },
        searchNodeNameContent: '',
        ruleValidates: {
          nodeType: [
            {
              required: true, validator: (rule, value, callback) => {
                if (_.isEmpty(value)) {
                  callback("对象类型不能为空！")
                } else {
                  callback();
                }
              }
            },
          ],
          edgeType: [
            {
              required: true, type: 'array', validator: (rule, value, callback) => {
                if (_.isEmpty(value)) {
                  callback("关系类型不能为空！")
                } else {
                  callback();
                }
              }
            },
          ],
          nodeNameList: [
            {
              required: true, type: 'array', validator: (rule, value, callback) => {
                if (value.length < 2) {
                  callback('共同关联 - 请分析至少两个对象');
                } else {
                  callback()
                }
                // else if (this.formItem.nodeNameList.length > this.maxStatisticNum) {
                //   callback(this.formItem.dicName + '-分析对象个数不能超过' + this.maxStatisticNum);
                // } else {
                //
                // }
              }
            },
          ],
          dateValue: [
            {required: true, type: 'array', message: "日期不能为空", trigger: "change"},
            {
              validator: (rule, value, callback) => {
                if (value[0] == "" && value[1] == "") {
                  callback("请选择要查看的时间范围！")
                } else if (new Date(value[1]).getTime() - new Date(value[0]).getTime() > 15552000000) {
                  callback("时间间隔不能超过六个月！")
                } else {
                  callback();
                }
              }
            }
          ],
        }
      }
    },

    components: {},
    computed: {
      getCommonRelationState: {
        get: function () {
          return this.$store.state.isCommonRelationModal;
        },
        set: function () {
          this.$store.commit("showCommonRelationModal");
        }
      },
    },
    created() {
      let myNodeInfo = this.$store.state.commonRelationList;
      this.edgeTypeList = myNodeInfo.edgeType;
      this.nodeTypeList = myNodeInfo.nodeType;
      this.formItem.nodeNameList = myNodeInfo.nodeNameList;

    },
    mounted() {
      // console.log(this.initDate())
    },
    methods: {
      //时间变更
      settime() {
        let time1 = Number(sessionStorage.getItem("time1"));
        let time2 = Number(sessionStorage.getItem("time2"));
        if (time1 != null && time2 != null) {
          return [time1, time2]
        }
      },

      //根据节点类型动态联动关系
      changeNodePro() {
        console.log()
      },

      closeCreateModel() {
        this.$store.commit("showCommonRelationModal", false);
        this.formItem.nodeType = '';
        let time1 = sessionStorage.getItem("time1");
        let time2 = sessionStorage.getItem("time2");
        if (time1 != null && time2 != null) {
          this.formItem.dateValue = this.settime()
        } else {
          this.formItem.dateValue = initDate();
        }
        this.formItem.edgeType = [];
        this.edgeTypeList = [];
        this.nodeTypeList = [];
        this.formItem.nodeNameList = [];
        this.searchNodeNameContent = "";
        $(".createModel-searchNodeName").removeClass("createModel-searchNodeName");
        //对整个表单进行重置，将所有字段值重置为空并移除校验结果
        this.$refs.formItem.resetFields();

      },
      getParamVo(type, nodetype, label, nodeList) {
        let paramVo = {
          "nodeType": type,
          "indexLabel": nodetype.indexLabel,
          "edgeLabel": label,
          "value": _.join(_.map(nodeList, 'name'), ',')
        };
        return paramVo;
      },
      okCreateModel() {
        let _this = this;
        this.$refs.formItem.validate((valid) => {
          if (valid) {
            let startTime = _this.formItem.dateValue[0] === '' ? null : new Date(_this.formItem.dateValue[0]).getTime();
            let endTime = _this.formItem.dateValue[1] === '' ? null : new Date(_this.formItem.dateValue[1]).getTime();
            sessionStorage.setItem('time1', new Date(_this.formItem.dateValue[0]).getTime());
            sessionStorage.setItem('time2', new Date(_this.formItem.dateValue[1]).getTime());
            let nodeType = _this.formItem.nodeType;
            // 对象号码
            let sendValue = _.map(_this.formItem.nodeNameList, "name");
            sendValue = sendValue.join(",");
            // 边对象
            let edgeType = _.filter(_this.edgeTypeList, function (edge) {
              if (_.includes(_this.formItem.edgeType, edge.label)) {
                return edge;
              }
            });
            // 查静态库 还是动态库
            let flag = edgeType[0].dyFlag ? 1 : 0;
            // 查边标签
            let edgeLabel = edgeType[0].label;
            let indexLabel = _this.nodeTypeList[0].indexLabel;
            // post请求时用data传参数，注：后台接收时需要@RequestBody， get请求时用params传参数，不需要@RequestBody
            // data与params同时存在时，method用post,后台接收的时候，data中封装的是对象的数据，params是单个参数
            _this.$http.request({
              method: 'post',
              data: {
                nodeType: nodeType,
                value: sendValue,
                flag: flag,
                indexLabel: indexLabel,
                edgeLabel: edgeLabel,
              },
              params:{
                startTime: startTime,
                endTime: endTime,
              },
              url: URL.commonRelationSearch,
              success: (data) => {
                if (data.code === 200) {
                  let nodesl = data.data.graphVo.nodes.length;
                  let edgesl = data.data.graphVo.edges.length;
                  if (nodesl === 0 && edgesl === 0 ) {
                    //关闭加载动画
                    this.$store.commit("showCommonRelationModal", false);
                    this.$Message.info('没有共同关联的节点！');
                  } else {
                    //关闭加载动画
                    this.$store.commit("showCommonRelationModal", false);
                  }
                } else {
                  this.$store.commit("showCommonRelationModal", false);
                  this.$Message.warning('共同关联失败！');
                }
              },
              error: (data) => {
                this.$store.commit("showCommonRelationModal", false);
                this.$Message.warning('共同关联失败！');
              }
            });

          }

        })
      },

      //搜索节点名称高亮显示
      searchNodeName() {
        let _this = this;
        _.each(this.formItem.nodeNameList, function (node) {
          node.search = false;
        });
        if (_.isEmpty(_this.searchNodeNameContent)) {
          this.$forceUpdate();
          document.querySelector('.createModel-node-tags').scrollTop = 0;
          return false
        }

        //高亮显示
        _.each(this.formItem.nodeNameList, function (node) {
          if (_.includes(node.name, _this.searchNodeNameContent)) {
            node.search = true;
          }
        });
        this.$forceUpdate();
        //滚动条移动到第一个高亮tag
        this.$nextTick(function (o) {
          if (!_.isEmpty(document.querySelector('.createModel-searchNodeName'))) {
            let searchNodeNameTop = document.querySelector('.createModel-searchNodeName').offsetTop;
            let tagsTop = document.querySelector('.createModel-node-tags').offsetTop;
            $('.createModel-node-tags').scrollTop(searchNodeNameTop - tagsTop - 30)
          }
        });
      },
      //删除节点名称
      deleteNodeName(node) {
        this.formItem.nodeNameList = _.reject(this.formItem.nodeNameList, {'id': node.id});
        this.$refs.formItem.validate()
      }
    },

  }
</script>

<style scoped>
  .createModel-node-tags {
    max-height: 130px;
    overflow: auto;
    min-height: 32px;
  }

  .createModel-node-content {
    border: 1px solid #dddee1;
    padding: 4px 7px;
  }

  .createModel-searchNodeName {
    background-color: #bebef0 !important;
  }

</style>
