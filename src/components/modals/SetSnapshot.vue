<template>
  <div id="editSnapshot">
    <Modal title="编辑快照信息" v-model="getEditSnapshotModalState" :styles="{top: '160px'}">
      <Form ref="snapshotForm" :label-width="110" :model="SnapshotName" :rules="ruleValidates">
        <FormItem label="快照名称：" prop="editSnapshotName">
          <Input v-model="SnapshotName.editSnapshotName" placeholder="请输入快照名称" @keyup.enter.native="setSnapshotName" style="width:260px;" ></Input>
        </FormItem>
        <FormItem label="描述信息：" prop="editSnapshotDescribe">
          <Input type="textarea" :row="3" v-model="SnapshotName.editSnapshotDescribe" placeholder="请输入快照描述" @keyup.enter.native="setSnapshotName"  style="width:368px;" ></Input>
        </FormItem>
      </Form>
      <div slot="close" @click="closeModal"><Icon type="ios-close"></Icon></div>
      <div slot="footer">
        <Button type="text" @click="closeModal">取消</Button>
        <Button type="primary" @click="setSnapshotName" :disabled="isSubmit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import * as snapshotManage from '../../pages/graph/js/snapshotManage'
  import {URL} from "../../../api/urlsConfig"

  export default {
    name: "set-snapshot",
    data() {
      const snapshotdatePass = (rule,value,callback) => {
        if(value.includes(" ")) {
          callback(new Error('快照名称不能含有空格！'));
        } else if(value.length == 0) {
          callback(new Error('快照名称不能为空！'));
        } else if(value.length > 20) {
          callback(new Error('快照名称不能超过20个字符！'));
        } else {
          callback();
        }
      };
      const snapshotdescribe = (rule,value,callback) => {
        if(value.includes(" ")){
          callback(new Error('快照描述中不能含有空格！'));
        }else if(value.length > 100){
          callback(new Error('快照描述不能超过80个字符！'));
        }else {
          callback();
        }
      };
      return {
        SnapshotName:{
          editSnapshotName:'',
          editSnapshotDescribe: '',
          sid: '',
        },
        ruleValidates:{
          editSnapshotName:[
            {required:true,trigger:'change',validator:snapshotdatePass},
          ],
          editSnapshotDescribe: [
            {trigger: 'change',validator: snapshotdescribe},
          ]
        },
        isSubmit:false
      }

    },
    porps: {},
    created() {

    },
    computed: {
      getEditSnapshotModalState: {
        get: function () {
          return this.$store.state.isEditSnapshotModal
        },
        set: function () {
          this.$store.commit("showEditSnapshotModal");
        }
      },

    },
    mounted() {
    },
    methods: {
      //模态框开启
      openCaseNameModel(data){
        console.log(data);
        this.SnapshotName.editSnapshotName = data.sname;
        this.SnapshotName.editSnapshotDescribe = data.desce;
        this.SnapshotName.sid = data.sid;
        this.$store.commit("showEditSnapshotModal", true);
      },

      closeModal() {
        this.$store.commit("showEditSnapshotModal", false);
        this.SnapshotName.editSnapshotName = '';
        this.SnapshotName.editSnapshotDescribe = '';
        $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
        this.isSubmit=false;
        this.$refs.snapshotForm.resetFields();
      },

      setSnapshotName() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        let snapshotName = this.SnapshotName.editSnapshotName;
        let snapshotDescribe = this.SnapshotName.editSnapshotDescribe;
        let sid = this.SnapshotName.sid;
        // let _this = this;
        this.$refs.snapshotForm.validate((valid) => {
          if(valid){
            this.isSubmit=true;
            // this.getAddSnapshotModalState = false;
            let snapshot = snapshotManage.editSnapshotNameAndDesce(snapshotName,snapshotDescribe,sid);
            this.$http.request({
              method: 'post',
              url:URL.saveSnapshot,
              data:snapshot ,
              success: (data) => {
                if(data.code === 200){
                  currentGraphModel.rid = data.data;
                  this.$Message.success('保存成功！');
                  this.closeModal();
                  this.$emit("initSnapshot");
                  this.$store.commit("setSnapshotConfirm",false);//添加快照成功后图初始化，避免再次触发保存快照
                }else {
                  this.$Message.success('保存快照失败！');
                }
              },
              error: (data) => {
                this.$Message.warning('保存快照失败！');
                $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
                $('#createSnapshotSpan').css("pointer-events", "auto");
              }
            });
          }
        })
      }
    },
  }
</script>

<style scoped>

</style>
