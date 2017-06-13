/* draggable level-polygon(暂无文字提示内容)
    依赖d3.v4
    var config = {
        "id":容器ID，必填
        "sideNumber":多边形边数，必填，可修改
        "innerWidth":polygon重心-外点边距，必填，可修改
        --以下可选--
        "padding":内边距，可选，默认{left: 10, top: 10, right: 10, bottom: 10}
        "levelArr":各级数数组，可选，可修改
        "levelRange":级数范围，[min,max,step]，可选，可修改
        "drafFunc":拖拽后回调，非必填，可修改
    }
*/
"use strict";

//IIFE for closure
(function(window,d3,document){
    //basic math function)************************
    function sin(angle){
        return Math.sin(angle * Math.PI / 180);
    }
    function cos(angle){
        return Math.cos(angle * Math.PI / 180);
    }
    function tan(angle){
        return Math.tan(angle * Math.PI / 180);
    }

    //functions needed by Polygon*******************
    //根据边数n, 重心-顶点距离l, 圆心角angle, 中心坐标centerCoord, 获得正N边形顶点坐标arr
    function getPolygonOutlineCoord(n, l, angle, centerCoord){
        var res = [];
        //循环起点在Y轴最高点，角度顺时针循环
        for(var i = 0; i < n; i++){
            //假设坐标原点在polygon重心
            var _angle = i * angle;
            var x = l * sin(_angle);
            var y = l * cos(_angle);
            //svg坐标原点在左上角，重心坐标(innerWidth,innerWidth)
            x = centerCoord[0] + x;
            y = centerCoord[1] - y;
            res.push([x,y]);
        }
        return res;
    }
    //各顶点对应数据data，内边长innerWidth，级数数组rangeArr，圆心角angle，中心坐标centerCoord
    //根据序数获得不规则六边形顶点坐标组
    function getTargetOutlineCoord(data, innerWidth, rangeArr, angle, centerCoord){
        var res = [];
        for(var i =0;i<data.length;i++){
            var number = data[i],
                l = innerWidth / rangeArr.length * (rangeArr.indexOf(number) + 1),
                _angle = i * angle,
                x = l * sin(_angle),
                y = l * cos(_angle);
            //svg坐标原点在左上角，重心坐标(innerWidth,innerWidth)
            x = centerCoord[0] + x;
            y = centerCoord[1] - y;
            res.push([x,y]);
        }
        return res;
    }
    //拖拽时，保证拖拽点在对应轴上
    //对应点坐标x,y, 点序数index, 圆心角angle，点所在轴线的顶点坐标outlineCoord, 重心坐标centerCoord
    //返回拖拽点在轴线上的映射坐标
    function getDragPos(x, y, index, angle, outlineCoordArr, centerCoord){
        var _angle = angle * index;
        var outlineCoord = outlineCoordArr[outlineCoordArr.length - 1][index];
        //范围
        var minCoord = [Math.min(outlineCoord[0],centerCoord[0]),Math.min(outlineCoord[1],centerCoord[1])];
        var maxCoord = [Math.max(outlineCoord[0],centerCoord[0]),Math.max(outlineCoord[1],centerCoord[1])];

        var dx = x - centerCoord[0];
        // var dy = Math.abs(y - centerCoord[1]);
        var resX,resY;
        //判断x,y轴上特殊情况
        if(_angle === 0){
            resX = centerCoord[0];
            resY = y;
        }else if( _angle === 180){
            resX = centerCoord[0];
            resY = y;
        }else{
            resY = centerCoord[1] - dx / tan(_angle);
            resX = x;
        }
        resX = resX > maxCoord[0] ? maxCoord[0] : resX;
        resX = resX < minCoord[0] ? minCoord[0] : resX;
        resY = resY > maxCoord[1] ? maxCoord[1] : resY;
        resY = resY < minCoord[1] ? minCoord[1] : resY;
        // console.log(resX,resY);
        return [resX,resY];
    }
    //拖拽结束，根据位置获得对应轴能力级数
    //对应点坐标x,y, 点序数index, 圆心角angle，顶点坐标数组outlineCoordArr，重心坐标centerCoord
    function getLevelIndex(x, y, index, angle, outlineCoordArr, centerCoord){
        var _angle = angle * index;
        var area = Math.ceil(_angle / 90);//1-4象限
        if(_angle % 90 === 0){
            area = 0;
        }
        for(var i = outlineCoordArr.length - 1;i >= 0;i--){
            var coord = outlineCoordArr[i][index], preCoord;
            if(i>0){
                preCoord = outlineCoordArr[i-1][index];
            }else{
                preCoord = centerCoord;
            }
            switch(area){
                //在x,y轴上
                case 0:
                    if(_angle === 0){
                        if(y <= preCoord[1] && y > coord[1]){
                            return i;
                        }
                        break;
                    }else if(_angle === 90){
                        if(x <= coord[0] && x > preCoord[0]){
                            return i;
                        }
                        break;
                    }else if(_angle === 180){
                        if(y <= coord[1] && y > preCoord[1]){
                            return i;
                        }
                        break;
                    }else {//270
                        if(y > coord[1] && y <= preCoord[1]){
                            return i;
                        }
                        break;
                    }
                    break;
                //对应二维坐标四个象限
                case 1:
                    if( x <= coord[0] && x >= preCoord[0] &&
                        y >= coord[1] && y <= preCoord[1]){
                        return i;
                    }
                    break;
                case 2:
                    if( x <= coord[0] && x >= preCoord[0] &&
                        y <= coord[1] && y >= preCoord[1]){
                        return i;
                    }
                    break;
                case 3:
                    if( x >= coord[0] && x <= preCoord[0] &&
                        y <= coord[1] && y >= preCoord[1]){
                        return i;
                    }
                    break;
                case 4:
                    if( x >= coord[0] && x <= preCoord[0] &&
                        y >= coord[1] && y <= preCoord[1]){
                        return i;
                    }
                    break;
                default:break;
            }

        }
    }
    //util function
    function getType(n){
        var res = Object.prototype.toString.call(n);
        return res.split(' ')[1].replace(/(])$/,'');//Number,String,Array,Function,Object,Null,Undefined,Boolean
    }
    //core class
    var Polygon = function(config){
        //throw params errors
        if(getType(config.id) !== 'String'){
            throw new TypeError('params.id should be a string!');
        }
        if(config.levelArr !== undefined && getType(config.levelArr) !== 'Array'){
            throw new TypeError('params.levelArr should be an array!');
        }
        if(getType(config.sideNumber) !== 'Number'){
            throw new TypeError('params.sideNumber should be a Number!');
        }
        if(getType(config.sideNumber) <= 2){
            throw new RangeError('params.sideNumber should bigger than 2');
        }
        if(getType(config.innerWidth) !== 'Number'){
            throw new TypeError('params.innerWidth should be a Number!');
        }
        if(getType(config.innerWidth) <= 0){
            throw new RangeError('params.innerWidth should bigger than 0');
        }
        if(config.dragCallback !== undefined && getType(config.dragCallback) !== 'Function'){
            throw new TypeError('params.dragCallback should be a function!');
        }
        if(config.padding !== undefined && getType(config.padding) !== 'Object'){
            throw new TypeError('params.padding should be an Object!');
        }
        //data-setting
        this.id = config.id;
        this.dTarget = document.getElementById(this.id);
        this.padding = config.padding || {left: 10, top: 10, right: 10, bottom: 10};

        var reg = /^(\d+)\.?\d+px$/;
        this.width = window.getComputedStyle(this.dTarget).width.match(reg)[1];
        this.height = window.getComputedStyle(this.dTarget).height.match(reg)[1];

        this.sideNumber = config.sideNumber;
        this.innerWidth = config.innerWidth;
        if(config.levelRange){
            this.minLevel = config.levelRange[0] || 1;
            this.maxLevel = config.levelRange[1] || 1;
            this.levelStep = config.levelRange[2] || 1;
            //根据levelRange获取实际级数arr
            this.rangeArr = [];//[min,min+step,...,max]
            if(this.levelStep != 1){
                var cur = this.minLevel;
                while(cur <= this.maxLevel){
                    this.rangeArr.push(cur);
                    cur += this.levelStep;
                }
            }else{//step默认为1
                this.rangeArr = d3.range(this.minLevel, this.maxLevel + 1);
            }
            this.range = this.rangeArr.length;
            this.levelArr = config.levelArr;
        }else{
            this.rangeArr = [1];
            this.range = 1 ;
        }


        this.dragCallback = config.dragCallback || null;

        this.init();
    };

    Polygon.prototype = {
        //svg初始化
        init: function(){
            var self = this,
                svgClear = d3.select('#'+self.id).selectAll("svg").remove();
            //绘制svg
            var svg = d3.select('#'+self.id).append("svg")
                        .attr('class','hexagon-svg')
                        .attr('width',self.width)
                        .attr('height',self.height);
            self.svg = svg;
            self.drawBasicPolygon().addAxis();
            //根据config参数，添加数据点，添加拖拽事件
            if(self.levelArr !== undefined && self.levelArr.length !== 0){
                self.addPoints();
                if(self.dragCallback){
                    self.addDragCallback();
                }
            }
        },
        //geo func
        drawBasicPolygon: function(){

            var self = this;
            self.angle = 360 / self.sideNumber;//三角形圆心角
            var sideWidth = Math.round(self.innerWidth * sin(self.angle));//polygon边长
            self.centerCoord = [self.innerWidth, self.innerWidth];//重心svg坐标

            //多层同心正N边形
            self.outlineCoordArr = [];//由内到外
            var outlines = self.svg.selectAll('hexagon-outline')
                            .data(self.rangeArr)
                            .enter()
                            .append('polygon')
                            .attr('class','hexagon-outline')
                            .attr('transform','translate(' + self.padding.left + ',' + self.padding.top + ')')
                            .attr('points' ,function(d,i){
                                var inWidth = self.innerWidth / self.range * (i + 1);
                                var outlineCoord = getPolygonOutlineCoord(//当前级别顶点坐标组
                                    self.sideNumber,
                                    inWidth,
                                    self.angle,
                                    self.centerCoord
                                );
                                self.outlineCoordArr.push(outlineCoord);
                                return outlineCoord.join(" ");
                            });
            return self;
        },

        //添加轴线
        addAxis: function(){
            var self = this;
            self.axises = this.svg.selectAll('.axis-line')
                            .data(self.outlineCoordArr[self.outlineCoordArr.length - 1])
                            .enter()
                            .append('line')
                            .attr('class','axis-line')
                            .attr('transform','translate(' + self.padding.left + ',' + self.padding.top + ')')
                            .attr('x1',self.centerCoord[0]).attr('y1',self.centerCoord[1])
                            .attr('x2',function(d,i){
                                return d[0];
                            })
                            .attr('y2',function(d,i){
                                return d[1];
                            });
            return self;
        },
        //添加根据levelArr生成的点以及组成的不规则多边形
        addPoints: function(){
            var self = this;
            //不规则多边形坐标数组
            self.realOutlineCoord = getTargetOutlineCoord(
                self.levelArr, self.innerWidth,
                self.rangeArr, self.angle, self.centerCoord
            );
            //不规则多边形svg对象
            self.realOutline = self.svg.append('polygon')
                            .attr('class','hexagon-select')
                            .attr('transform','translate(' + self.padding.left + ',' + self.padding.top + ')')
                            .attr('points' ,function(){
                                return self.realOutlineCoord.join(" ");
                            });

            //(可拖拽)点
            self.dragPoints = self.svg.selectAll('.drag-point')
                                .data(self.levelArr)
                                .enter()
                                .append('circle')
                                .attr('class','drag-point')
                                .attr('transform','translate(' + self.padding.left + ',' + self.padding.top + ')')
                                .attr('cx',function(d,i){
                                    return self.realOutlineCoord[i][0];
                                })
                                .attr('cy',function(d,i){
                                    return self.realOutlineCoord[i][1];
                                })
                                //FireFox不识别stylesheet中的r属性
                                .attr('r',5);
            return self;
        },
        //添加拖拽事件
        addDragCallback: function(){
            var self = this;
            //拖拽事件**************************
            var dragStart = function(d,i){
                var index = i;
                // console.log(self.outlineCoordArr);
                // var outlineCoord = self.outlineCoordArr[0][i];//获取拖拽点对应最外层顶点坐标
                var _this = d3.select(this);

                d3.event.on("drag",function(){
                    //相对svg鼠标坐标
                    var mouseX = d3.mouse(this)[0];
                    var mouseY = d3.mouse(this)[1];

                    var mousePos = getDragPos(mouseX, mouseY, index, self.angle, self.outlineCoordArr, self.centerCoord);
                    _this.attr('cx',mousePos[0]).attr('cy',mousePos[1]);

                    //update realOutline
                    self.realOutlineCoord[index][0] = mousePos[0];
                    self.realOutlineCoord[index][1] = mousePos[1];

                    self.realOutline.attr('points' ,function(){
                        return self.realOutlineCoord.join(" ");
                    });
                })
                //dragend
                .on("end",function(){
                    var levelIndex = getLevelIndex(
                        _this.attr('cx'), _this.attr('cy'),
                        index, self.angle, self.outlineCoordArr, self.centerCoord
                    );
                    //setting levelArr
                    self.levelArr[index] = self.rangeArr[levelIndex];
                    _this.transition().duration(200)
                        .attr('cx',self.outlineCoordArr[levelIndex][index][0])
                        .attr('cy',self.outlineCoordArr[levelIndex][index][1]);

                    //update realOutline
                    self.realOutlineCoord[index][0] = self.outlineCoordArr[levelIndex][index][0];
                    self.realOutlineCoord[index][1] = self.outlineCoordArr[levelIndex][index][1];

                    self.realOutline.transition().duration(200).attr('points' ,function(){
                        return self.realOutlineCoord.join(" ");
                    });

                    //apply dragCallback
                    self.dragCallback(self.levelArr);
                });

            };
            self.dragPoints.call(d3.drag().on("start",dragStart));
            return self;
        },
        //异步修改Polygon对象
        changeProps: function(key,value,callback){
            this[key] = value;
            this.init();
            callback && callback();
        }
    };
    window.Polygon = Polygon;
    return Polygon;
})(window,d3,document);
