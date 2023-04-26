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
  0: "#ccc0b3", 2: "#eee4da", 4: "#ede0c8", 8: "#f2b179",
  16: "#f59563", 32: "#f67c5f", 64: "#ec6544", 128: "#e44d29",
  256: "#edcf72", 512: "#c8a145", 1024: "#a8832b", 2048: "#86aa9c"
}
// 不同数字的大小信息
let num_sizes = {
  0: "60", 2: "60", 4: "60", 8: "60",
  16: "60", 32: "60", 64: "60", 128: "50",
  256: "50", 512: "50", 1024: "40", 2048: "40"
}
// 不同数字的偏移量（为了将数字画在方块中心）
let offsetx = {
  0: 65, 2: 62, 4: 61, 8: 62,
  16: 43, 32: 44, 64: 43, 128: 31,
  256: 36, 512: 37, 1024: 34, 2048: 36
}
// 上下左右键的code对应的方向信息
let directionMap = {
  '38': [0, -1], '40': [0, 1], '37': [-1, 0], '39': [1, 0]
}
// space 表示当前剩余的空格块数， score 表示当前的分数, history 表示历史最高分
let space = 16, score = 0, history = 0

// TODO: 重点添加合并方块以及滑动动画
let draw = {
  // 循环生成4^2次函数
  loop: function (func) {
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map.length; j++) {
        func(i, j)
      }
    }
  },
  // 关键算法1；随机生成方块方法
  produce: function () {
    let free = []; // 空闲位置数组
    draw.loop(function (i, j) {
      if (map[i][j] == 0) free.push([i, j]); // 统计空闲位置
    });
    if (free.length > 0) {
      let index = Math.floor(Math.random() * free.length); // 随机生成一个索引号
      let [i, j] = free[index]; // 计算对应的行列坐标
      map[i][j] = 2; // 在地图对应位置生成方块
      draw.block(); // 绘制方块
    }
  },
  // 绘制圆角矩形
  roundRect: function (x, y, c) {
    // 定义方块宽度和边距宽度
    let box_width = context.canvas.width * 0.8 * 0.25;
    let margin_width = context.canvas.width * 0.2 * 0.20;
    // 开始绘制路径
    context.beginPath();
    // 设置填充颜色
    context.fillStyle = c;
    // 移动到矩形左上角的位置
    context.moveTo(x, y);
    // 绘制圆角矩形的四个角
    context.arcTo(x + box_width, y, x + box_width, y + 1, margin_width * 0.7);
    context.arcTo(x + box_width, y + box_width, x + box_width - 1, y + box_width, margin_width * 0.7);
    context.arcTo(x, y + box_width, x, y + box_width - 1, margin_width * 0.7);
    context.arcTo(x, y, x + 1, y, margin_width * 0.7);
    // 填充路径内部的颜色
    context.fill();
  },
  // 根据地图绘制方格, 更新分数
  block: function () {
    draw.loop(function (i, j) {
      // 根据map信息绘制4*4游戏方格
      num = map[i][j]
      color = num_colors[num]
      draw.roundRect(j * 130 + 25, i * 130 + 25, color)
      if (num !== 0) {
        context.font = "bold " + num_sizes[num] + "px Arial,Microsoft Yahei";
        context.fillStyle = (num <= 4) ? "#776e65" : "white";
        context.fillText(String(map[i][j]), j * 132 + offsetx[num], i * 132 + 80 + num_sizes[num] / 3);
      }
    })
    document.getElementById('score').innerText='当前得分：' + String(score)
  },

}

let game = {
  // 初始化游戏
  init: function () {
    draw.produce()
    draw.produce()
    // 判断是移动端还是鼠标
    if (document.body.ontouchstart !== undefined) {
      bindTouchEventHandlers()
    } else {
      bindKeyboardEventHandlers()
    }
    // 初始化历史得分
    if(localStorage.history) {
      // 显示历史得分
      document.getElementById("history").innerText = "历史最高得分：" + localStorage.history
    } else {
      // 初始化
      localStorage.history = history
      document.getElementById("history").innerText = "历史最高得分：" + String(history)
    }
    
  },
  // 检查游戏是否已经结束
  isGameOver: function () {
    // 检查是否有空格子
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (map[i][j] == 0) {
          return false; // 有空格子，游戏未结束
        }
      }
    }

    // 检查是否有可以合并的方块
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        if (j < 3 && map[i][j] == map[i][j + 1]) {
          return false; // 有可以合并的方块，游戏未结束
        }
        if (i < 3 && map[i][j] == map[i + 1][j]) {
          return false; // 有可以合并的方块，游戏未结束
        }
      }
    }

    // 所有方格都被填满且无法进行任何一次合并，游戏结束
    return true;
  },
  // 核心算法2之 “移动数字方块时的合并逻辑” 实现
  move: function (dir) {
    //用来调整不同方向的遍历方式
    function modify(x, y) {
      tx = x, ty = y;
      if (dir[0] == 0) tx = [ty, ty = tx][0];
      if (dir[1] > 0) tx = 3 - tx;
      if (dir[0] > 0) ty = 3 - ty;
      return [tx, ty];
    }
    //根据移动的方向，将地图中对应行/列中的数字一个个压入栈中，如果第一次遇到栈顶数字和待入栈数字相等，则栈顶数字乘2，最后用栈中数字更新地图中的对应行/列
    for (let i = 0; i < 4; i++) {
      let tmp = Array();
      let isadd = false;
      for (let j = 0; j < 4; j++) {
        let ti = modify(i, j)[0], tj = modify(i, j)[1];
        if (map[ti][tj] != 0) {
          if (!isadd && map[ti][tj] == tmp[tmp.length - 1]) score += (tmp[tmp.length - 1] *= 2), isadd = true, space += 1;
          else tmp.push(map[ti][tj]);
        }
      }
      for (let j = 0; j < 4; j++) {
        let ti = modify(i, j)[0], tj = modify(i, j)[1];
        map[ti][tj] = isNaN(tmp[j]) ? 0 : tmp[j];
      }
    }
    draw.produce();
    draw.block();
    // 判断是否游戏结束
    if (game.isGameOver()) {
      alert("游戏结束！");
      // 游戏结束后，将得分与历史最高分做对比
      if(score > localStorage.history){
        // 更新历史得分，储存到本地
        localStorage.history = score
      }
    }
  }
}

// 键盘事件监听
function bindKeyboardEventHandlers() {
  document.onkeydown = function (e) {
    dir = directionMap[(e ? e : event).keyCode]
    game.move(dir)
  }
}

// 移动端事件监听
function bindTouchEventHandlers() {
  // 定义触摸起始位置
  var sx, sy;
  // 定义触摸结束位置、位移距离
  var dx, dy, ex, ey;

  // 触摸开始事件
  canvas.ontouchstart = function (event) {
    // 获取第一个触点
    var touch = event.touches[0];
    // 记录触点的起始位置
    sx = touch.clientX, sy = touch.clientY;
  }

  // 触摸移动事件
  canvas.ontouchmove = function (event) {
    // 获取第一个触点
    var touch = event.touches[0];
    // 记录触点的当前位置
    ex = touch.clientX, ey = touch.clientY;
    // 计算触点的位移距离
    dx = ex - sx, dy = ey - sy;
    // 禁止默认的滑动事件
    event.preventDefault();
  }

  // 触摸结束事件
  canvas.ontouchend = function (event) {
    // 根据触点的位移距离和方向，判断应该移动的方向
    if (dy < -50 && Math.abs(dy / dx) > 2) game.move([0, -1]); // 上滑
    if (dy > 50 && Math.abs(dy / dx) > 2) game.move([0, 1]); // 下滑
    if (dx < -50 && Math.abs(dx / dy) > 2) game.move([-1, 0]); // 左滑
    if (dx > 50 && Math.abs(dx / dy) > 2) game.move([1, 0]); // 右滑
  }
}
// 重新开始游戏
const restartBtn = document.querySelector('#restart_btn');
restartBtn.addEventListener('click', () => {
  location.reload();
});

// 启动游戏
game.init()



