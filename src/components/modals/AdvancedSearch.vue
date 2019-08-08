  <template>
    <div id="AdvancedSearch">
      <Modal v-model="getSearchModalState" title="高级搜索" width="650">
        <div class="SearchTypeList">
          <li>
            <Select  style="width:200px" v-model="typecode" @on-change="getOptionstype">
              <Option :value="item.dicCode" v-for="(item,key) in typelist" :key="key" >{{item.dicName}}</Option>
            </Select>
          </li>
          <li v-if="isShowModal">
            <Select  style="width:200px" v-model="Secondcode" @on-change="getSecondcode" v-if="ismenun" filterable>
            <Option :value="item.name" v-for="(item,key) in numtypelist" :key="key" @click.native="getOptionsCode(item.type)" v-if="ismenun">{{item.name}}</Option>
          </Select>
            <Select  style="width:200px" v-model="Secondcode" @on-change="getSecondcode" v-if="islas" filterable>
              <Option :value="item.dicName" v-for="(item,key) in numtypelist" :key="key" @click.native="getOptionsCode(item.dicCode,item.val1)">{{item.dicName}}</Option>
            </Select>
          </li>
          <li v-if="isInput"><input type="text" v-model="formCode"  @keyup.enter.native="confirmSelect"/></li>
        </div>
        <div slot="close" @click="closeModal"><Icon type="ios-close"></Icon></div>
        <div slot="footer">
          <Button type="text" @click="cancelModel">取消</Button>
          <Button type="default" @click="confirmSelect">确定</Button>
        </div>
      </Modal>
    </div>
</template>

<script>
  import store from  "../../vuex/store"
    export default {
        name: "advancedsearch",
        data() {
            return {
              codes:'00022',
              formCode:'',
              spotcodes:'',
              typecode:'对象类型',
              Secondcode:'',
              numtypelist:'',
              alllabels:'',
              numlist:'',
              freeLabels:'',
              isShowModal:true,
              ismenun:true,
              islas:false,
              isInput:true,
              freeMark:'',
              newnodelabels:[],
              typelist:[
                {
                  dicName:'对象类型',
                  dicCode:'对象类型',
                },
                {
                  dicName:'标签',
                  dicCode:'标签',
                },
                {
                  dicName:'标记',
                  dicCode:'标记',
                },
              ],
            }
        },
        components: {},

      //搜索框弹窗显示
      computed:{
          getSearchModalState:{
            get:function () {
              if(this.$store.state.isAdvancedSearchModal==true){
                this.freeMark=this.$store.state.currentResultDefinedLabel;
              }else {

                this.isInput=true;
              }
              return this.$store.state.isAdvancedSearchModal;
            },
            set:function () {
              this.$store.commit("ShowAdvancedSearchModal");
            }
          }
        },
        created() {

          //含服务号码类型列表
          // let typelist = this.$store.state.queryBaseDictionData;
          //下拉列表数据
          // this.numlist = typelist.nodePro;
          //获取所有自定义标记
          this.freeLabels=this.$store.state.currentResultDefinedLabel;
          //获取所有标签
          let baselabels=this.$store.state.queryBaseDictionData;
          this.alllabels =_.flatten([baselabels.flagLabel, baselabels.properLabel]);
        },
        mounted() {
          // this.numtypelist= this.numlist;
          //获取标记信息
          this.setNodePro()

        },
        methods: {
           setNodePro(){
             //获取对象拉下
             // this.numtypelist=this.$store.state.setLables;
             //对象赋值前去重
             //tep去重
             let tep=this.$store.state.setLables;
             const ast=tep.reduce((item,next)=>{
               tep[next.name]? '':tep[next.name]=true && item.push(next);
               return item
             },[])
             this.numtypelist=tep;
             if(this.numtypelist.length!=0){
               this.spotcodes = this.numtypelist[0].type;
               this.Secondcode=this.numtypelist[0].name;
             }
           },
          selectedGraphNode: function (cy, selectedNode) {
            cy.$(cy.nodes()).unselect();
            //取消右侧分析-->选中标签的高亮
            $(".f-cspaH").removeClass("f-cspaH");
            $(".f-cspCusH").removeClass("f-cspCusH");
              cy.zoom(1);
            cy.center(selectedNode[0]);
            cy.$(selectedNode).select();
          },
          //确认搜索并在图上选中
          confirmSelect(){
            //获取图上所有点的labels
            let _this=this;
            let currentGraphModel = store.state.currentGraphModel;
            let cy = currentGraphModel.cy;
            cy.nodes().unselect();
            //取消右侧分析-->选中标签的高亮
            $(".f-cspaH").removeClass("f-cspaH");
            $(".f-cspCusH").removeClass("f-cspCusH");
            //使用点属性进行搜索
            if(this.typecode=='对象类型'){
              this.ismenun=true;
                this.islas=false;
              if(_this.formCode==''){
                let selectedNode = cy.nodes().filter(function (node) {
                  if (_this.spotcodes === node.data('type')) {
                    return node
                  }
                });
                this.selectedGraphNode(cy, selectedNode)
                // cy.nodes().forEach(function (ele,i,eles) {
                //   let typelist=ele._private.data.type;
                //     if (typelist==_this.spotcodes){
                //       ele.select();
                //       cy.center(ele);
                //     }
                // })
              }
              if(_this.formCode!=''){
                // cy.nodes().forEach(function (ele,i,eles) {
                //   let typelist=ele._private.data.type;
                //   let namelist=ele._private.data.name;
                //   if (typelist==_this.spotcodes && _.includes(namelist,_this.formCode)){
                //     ele.select();
                //     cy.center(ele);
                //   }
                // })
                let selectedNode = cy.nodes().filter(function (node) {
                  if (_this.spotcodes === node.data('type') &&  _.includes(node.data('name'), _this.formCode)) {
                    return node
                  }
                });
                this.selectedGraphNode(cy, selectedNode)

              }
            }
            //使用标签去搜索
            cy.zoom(1);
            if(this.typecode=='标签'){
              this.ismenun=false;
              this.islas=true;
            if(_this.formCode==''){
              cy.nodes().forEach(function (ele,i,eles) {
                let labelCodes=ele._private.data.labels
                if(labelCodes==undefined ||null){
                  _this.formCode='';
                  _this.isInput=true;
                  _this.$store.commit("ShowAdvancedSearchModal", false);

                }else {
                  let nodelist=Object.keys(labelCodes)
                  for (let i=0;i<nodelist.length;i++){
                    if(_.includes(nodelist[i],_this.codes)==true){
                      // console.log( ele)
                      ele.select();
                      // cy.center(ele);
                    }
                  }
                }

              });
            }
            if(_this.formCode!=''){
              cy.nodes().forEach(function (ele,i,eles) {
                let labellist=ele._private.data.labels;
                if(labellist==''){
                  _this.formCode='';
                  _this.isInput=true;
                  _this.$store.commit("ShowAdvancedSearchModal", false);
                }else {
                  _.each(labellist,function (value,key) {
                    if(key==_this.codes &&_.includes(value,_this.formCode)){
                      ele.select();
                      // cy.center(ele);
                    }
                  })
                }
              });
            }
            }
            //使用标记去搜索
            if(this.typecode=='标记'){
              if(_this.formCode==''){
                  _this.freeMark.forEach(function (el,k,els) {
                    _.filter(cy.nodes(),function (node) {
                      if(node.data().name==el.nodeId && el.labels!=''){
                        node.select();
                        // cy.center(node);
                      }
                    })
                  })
              }
              if(_this.formCode!=''){
                _this.newnodelabels=[];
                _.filter(_this.freeMark,function (node) {
                   _.filter(node.labels,function (item) {
                     if(_.includes(item.labelName,_this.formCode)){
                       _this.newnodelabels.push(node);
                     }
                   })
                })
                _.filter(cy.nodes(),function (ele) {
                  _this.newnodelabels.forEach(function (vo,vk,vs) {
                    if(ele.data().name==vo.nodeId && vo.labels!=''){
                      ele.select();
                      // cy.center(ele);

                    }
                  })
                })
              }

           }
              this.formCode='';
              this.defaultChose()
              this.$store.commit("ShowAdvancedSearchModal", false);
          },
          //左上角关闭按钮
          closeModal(){
              this.formCode='';
            this.defaultChose()
          },
          //取消按钮
          cancelModel(){
              this.formCode='';
              this.defaultChose()
              this.$store.commit("ShowAdvancedSearchModal", false);
          },
          //2级下拉选中
          getSecondcode(){

          },
          //默认
          defaultChose(){
              this.typecode='对象类型';
              this.ismenun=true;
              this.islas=false;
              this.isShowModal=true;
              this.numtypelist=this.$store.state.setLables;
              this.Secondcode= this.numtypelist[0].name
          },
          //根据一级选择的类别改变2级列表数据
          getOptionstype(){
            if(this.typecode=='标记'){
              this.isShowModal=false;
              this.isInput=true;
              this.Secondcode='当前用户';
            }if (this.typecode=='标签'){
                this.ismenun=false;
                this.islas=true;
              this.isShowModal=true;
              this.numtypelist=this.alllabels;
              this.Secondcode='人口流动状态'
              this.isInput=false;
            }if(this.typecode=='对象类型'){
              this.ismenun=true;
                this.islas=false;
              this.isShowModal=true;
              this.isInput=true;
              this.numtypelist=this.$store.state.setLables;

              this.Secondcode=this.numtypelist[0].name;
            }
          },
          //获取选中的标签的dicCode
          getOptionsCode(data,parid){
            if (this.typecode=='标签') {
              //判断选中的是否是01标签时的话关闭输入框
              if(parid==1){
                this.isInput=false;
              }else {
                this.isInput=true;
              }
              this.codes=data;
            }if(this.typecode=='对象类型'){
              this.spotcodes=data;
            }
          },
        },

    }
</script>

<style scoped>
.SearchTypeList{
display: flex;
}
.SearchTypeList li{
  list-style: none;
  margin: 0px 5px;
}
.SearchTypeList li  input{
  width: 198px;
  display: block;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 4px;
  border: 1px solid #dcdee2;
  transition: all .2s ease-in-out;
  /*text-align: center;*/
  padding: 4px 7px;

}
</style>
