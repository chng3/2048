// 获取画布元素和上下文
let canvasEl = document.getElementById('canvas')
let context = canvasEl.getContext('2d')

// 初始化
// 创建地图 ：4*4 二维数组来存放每个格子的状态，值为0代表为空，
// 值为其他数字表示这个格子上的方块的数字
let map = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
]
// 不同数字的颜色信息
let num_colors = {
  0:"#ccc0b3",2:"#eee4da",4:"#ede0c8",8:"#f2b179",
  16:"#f59563",32:"#f67c5f",64:"#ec6544",128:"#e44d29",
  256:"#edcf72",512:"#c8a145",1024:"#a8832b",2048:"#86aa9c"
}
// 不同数字的大小信息
let num_sizes = {
  0:"60",2:"60",4:"60",8:"60",
  16:"60",32:"60",64:"60",128:"50",
  256:"50",512:"50",1024:"40",2048:"40"
}
// 不同数字的偏移量（为了将数字画在方块中心）
let offsetx = { 0: 65, 2: 65, 4: 65, 8: 62, 16: 48, 32: 45, 64: 50, 128: 38, 256: 40, 512: 33, 1024: 33, 2048: 33 };
// 上下左右键的code对应的方向信息
let directionMap = {
  '38':[0,-1],'40':[0,1],'37':[-1,0],'39':[1,0]
}
// space 表示当前剩余的空格块数， score 表示当前的分数
let space = 16, score = 0;

// TODO: 监听键盘事件来控制数字方块的移动
let draw = {
  // 循环生成4^2次函数
  loop: function (func) {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map.length; j++) {
        func(i,j)
      }
    }
  },
  // 关键算法1；随机生成方块方法
  produce: function (){
    var cot = Math.floor(Math.random()*space); // 随机生成一个数[0,15]
    var k = 0;
    // 循环遍历二维数组map，生成方块
    draw.loop(function(i,j){
        if(map[i][j]==0){ // 如果该位置没有方块
            if(cot==k){ // 该位置为随机数生成的位置
                map[i][j]=2; // 生成方块
                draw.block(); // 绘制方块
            }
            k+=1; // 统计已遍历的方块数
        }
    });
    space-=1; // 可生成方块的位置
  },
  // 绘制圆角矩形
  roundRect: function (x,y,c){
    // 定义方块宽度和边距宽度
    var box_width = context.canvas.width*0.8*0.25;
    var margin_width = context.canvas.width*0.2*0.20;
    // 开始绘制路径
    context.beginPath();
    // 设置填充颜色
    context.fillStyle=c;
    // 移动到矩形左上角的位置
    context.moveTo(x,y);
    // 绘制圆角矩形的四个角
    context.arcTo(x+box_width,y,x+box_width,y+1,margin_width*0.7);
    context.arcTo(x+box_width,y+box_width,x+box_width-1,y+box_width,margin_width*0.7);
    context.arcTo(x,y+box_width,x,y+box_width-1,margin_width*0.7);
    context.arcTo(x,y,x+1,y,margin_width*0.7);
    // 填充路径内部的颜色
    context.fill();
  },
  // 根据地图绘制方格
  block: function () {
      draw.loop(function (i, j) {
        // 根据map信息绘制4*4游戏方格
        num = map[i][j]
        color = num_colors[num]
        draw.roundRect(j*130+30, i*130+30, color)
        if(num!== 0){
          context.font = "bold "+num_sizes[num]+"px Arial,Microsoft Yahei";
          context.fillStyle = (num<=4)?"#776e65":"white";
          context.fillText(String(map[i][j]),j*132+offsetx[num],i*132+80+num_sizes[num]/3);
        }
    })
  },
  
}

draw.produce()
draw.produce()



