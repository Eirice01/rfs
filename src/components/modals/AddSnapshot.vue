<template>
  <div id="addSnapshot">
    <Modal title="添加快照" v-model="getAddSnapshotModalState" :styles="{top: '160px'}">
      <Form ref="snapshotForm" :label-width="110" :model="SnapshotName" :rules="ruleValidates">
        <FormItem label="快照名称：" prop="addSnapshotName">
          <Input v-model="SnapshotName.addSnapshotName" placeholder="请输入快照名称" @keyup.enter.native="addNewSnapshot" style="width:260px;" ></Input>
        </FormItem>
        <FormItem label="描述信息：" prop="addSnapshotDescribe">
          <Input type="textarea" :row="3" v-model="SnapshotName.addSnapshotDescribe" placeholder="请输入快照描述" @keyup.enter.native="addNewSnapshot"  style="width:368px;" ></Input>
        </FormItem>
      </Form>
      <div slot="close" @click="closeModal"><Icon type="ios-close"></Icon></div>
      <div slot="footer">
        <Button type="text" @click="closeModal">取消</Button>
        <Button type="primary" @click="addNewSnapshot" :disabled="isSubmit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import * as snapshotManage from '../../pages/graph/js/snapshotManage'
  import {URL} from "../../../api/urlsConfig"

  export default {
    name: "add-snapshot",
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
          addSnapshotName:'',
          addSnapshotDescribe: '',
        },
        ruleValidates:{
          addSnapshotName:[
            {required:true,trigger:'change',validator:snapshotdatePass},
          ],
          addSnapshotDescribe: [
            {trigger: 'change',validator: snapshotdescribe},
          ]
        },
        isSubmit:false
      }

    },
    porps: {
      // isShowSnapshot: Boolean,
    },
    created() {

    },
    computed: {
      getAddSnapshotModalState: {
        get: function () {
          return this.$store.state.isAddSnapshotModal
        },
        set: function () {
          this.$store.commit("showAddSnapshotModal");
        }
      },
    },
    mounted() {
    },
    methods: {
      closeModal() {
        this.$store.commit("showAddSnapshotModal", false);
        this.SnapshotName.addSnapshotName='';
        this.SnapshotName.addSnapshotDescribe = '';
        $('#toolbar span').css({backgroundColor:'',boxShadow: ''});
        this.isSubmit=false;
        this.$refs.snapshotForm.resetFields();
      },
      addNewSnapshot() {
        let currentGraphModel = this.$store.state.currentGraphModel;
        $('#createSnapshotSpan').css("pointer-events", "none");
        if(_.isEmpty(currentGraphModel.data)){
          this.$Message.warning('不能保存快照！');
          $('#createSnapshotSpan').css("pointer-events", "auto");
        }
        let snapshotName = this.SnapshotName.addSnapshotName;
        let snapshotDescribe = this.SnapshotName.addSnapshotDescribe;
        this.$refs.snapshotForm.validate((valid) => {
          if(valid){
            this.isSubmit=true;
            // this.getAddSnapshotModalState = false;
            // 新增快照 sid为空
            let snapshot = snapshotManage.createSnapshot(snapshotName, currentGraphModel,snapshotDescribe,'');
            //保存json留下有用字段
            this.$http.request({
              method: 'post',
              url:URL.saveSnapshot,
              data:snapshot ,
              success: (data) => {
                if(data.code === 200){
                  currentGraphModel.rid = data.data;
                  this.$Message.success('保存成功！');
                  this.closeModal();
                  this.$emit("refreshSnapshotList");
                  $('#createSnapshotSpan').css("pointer-events", "auto");
                  this.$store.commit("setSnapshotConfirm",false);//添加快照成功后图初始化，避免再次触发保存快照
                }else {
                  this.$Message.success('保存快照失败！');
                  $('#createSnapshotSpan').css("pointer-events", "auto");
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
