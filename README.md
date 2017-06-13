# Regular-Polygon
>a Regular Polygon generator that based on `D3.js` which support adding dragCallback.   
一个基于`D3.js`实现的支持拖拽事件的正多边形生成器

### Usage
首先需要引入依赖的js和css文件:  

    <!--预定义的样式，可根据需要随意更改 -->
    <link rel="stylesheet" href="polygon.css">
    <!--依赖的d3,一定要在polygon.js之前加载 -->
    <script src="../lib/d3.min.js"></script>
    <script src="./polygon.js"></script>

作为目标元素的DOM节点一定要提前声明宽高，如下：

    <style>
        #target{
            width:60%;
			height:400px;
			margin:20px auto;
			border:#ccc solid 1px;
        }
    </style>
自行编写config配置，创建Polygon对象，详细config配置请查看[源码](./polygon.js "polygon.js"):

    var config = {
        id: 'target',//目标DOM元素id
        sideNumber: 5,//多边形边数
        innerWidth: 180,//顶点重心距离，注意不是边长！！
    };
    //创建对象后默认显示多边形
    var myStock = new Polygon(config);

若需要生成多维能力图，关联数据，添加拖拽config如下：

    var config = {
        id: 'target',//目标DOM元素id
        sideNumber: 5,//多边形边数
        innerWidth: 180,//顶点重心距离，注意不是边长！！
        levelArr: [4,3,4,3,5],//顶点关联数据
        levelRange: [1,10,1],//[min,max,step]
        dragCallback: function(arr){
            console.log(arr);
        }
    }

### Demo
[Demo1-自定义生成正多边形](./demo1.html "自定义生成正多边形")   
[Demo2-添加关联数据和拖拽事件以改变数据](./demo2.html "添加关联数据和拖拽事件以改变数据")

### Remark
>1.异步修改对象属性  
2.自定义样式  
3.添加级别对应文字提示  
4.ES6版本，react组件   
..etc
