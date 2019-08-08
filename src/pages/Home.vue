<template>
    <div class="content">
      <div class="main-content">
        <router-view></router-view>
      </div>
    </div>
</template>
<style scoped lang="less">
  .content{
    height:100%;
  }
  .main-content{
    height: -webkit-calc(100% - 13px);
    height: -moz-calc(100% - 13px);
    height: calc(100% - 13px);
  }
  .footer{
    width: 100%;
    height:13px;
  }
  .footer .lego-bottom {
    width: 100%;
    text-align: center;
    line-height: 13px;
    font-size: 12px;
    background: #3a3a3f;
    height: 13px;
    color: #616165;
  }

</style>
<script>
  import {URL} from "../../api/urlsConfig"
  export default {
    name:"Home",
    data() {
      return {
        showHeader:true
      }
    },
    provide:function(){
      return {

      }
    },
    created() {

    },
    components: {

    },
    methods:{

    }
  }
</script>
