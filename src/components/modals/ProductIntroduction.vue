<template>
    <div id="product-introduction">
      <modal v-model="productModal" title="关于产品" width="800" id="product-introModal">
            <div>
              <Timeline>
                <TimelineItem>
                  <p class="time">版本</p>
                  <p class="content">发布1.0版本</p>
                </TimelineItem>
                <TimelineItem>
                  <p class="time">产品介绍</p>
                  <p class="content">
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;关系分析系统，以关联模型为核心，面向各类业务数据快速建模，
                       利用Janusgraph图数据库进行关系数据存储，分布式图索引技术
                       和GraphX分布式图计算引擎， 为用户提供大数据关系计算模型和可视化交互分析能力。产品围绕“大数据多源融合、计算应用、可
                       视分析、业务智能”设计实现，结合关系网络、时空数据、地理制图学建立可视化表征，揭示对象间的关联和对象时空相关的模式及规
                       律。产品提供关联网络、时空网络、搜索网络、信息立方、智能研判、协作共享、动态建模等功能，提供完整的关系计算API，以及用
                       可视化的方式有效融合机器的计算能力和人的认知能力，获得对于海量数据的洞察力，帮助用户更为直观、高效地获取信息和知识。
                    </p>
                  </p>
                </TimelineItem>
                <TimelineItem>
                  <p class="time">主要功能</p>
                  <p class="content">
                    <p>1、离线分析模型：单人关系；群体分析；社团扩展；关联发现；关系呈现</p>
                    <p>2、实时分析：扩线查询；最短路径</p>
                    <p>3、布局操作：矩阵布局；树型布局；环形布局；同心圆布局；弹性力布局</p>
                    <p>4、信息展示：整体信息；团体信息；个体信息</p>
                    <p>5、标签分析：属性标签；0/1标签；自定义标签</p>
                    <p>6、图形操作：聚合；拆分；组合；编辑；选择；缩放；锁定；</p>
                    <p>7、导出操作：导出图片；导出节点；导出关系</p>
                    <p>8、指标分析：标签指标；核心指标；联络指标</p>
                    <p>9、关系立方：行为明细</p>
                    <p>10、快照分析：快照保存</p>
                    <p>11、任务列表：案件树展示；搜索</p>
                    <p>12、其他操作：搜索；添加</p>
                </TimelineItem>
              </Timeline>
            </div>
            <div slot="footer">

            </div>
      </modal>
    </div>
</template>

<script>
    export default {
      name: "product-introduction",
      data(){
          return{

          }
      },
      computed:{
        productModal:{
          get:function(){
            return this.$store.state.isProductModal
          },
          set:function(data){
            this.$store.commit("showProductModal",data);
          }
        },

      },
      methods:{

      },
      created(){

      },
      mounted(){

      }
    }
</script>

<style scoped>
  .mainTitle{
    color: #FF6699;
    height: 20px;
    line-height: 20px;
   /* margin-left: 10px;*/
  }
  .headTitle{
    color: #DB7172;
    font-size: 15px;
    height: 20px;
    line-height: 20px;
    margin-bottom: 5px;
    /*margin-left: 5px;*/
  }
</style>
