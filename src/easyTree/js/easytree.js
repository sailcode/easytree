/**
 * Copyright 2014 Zhang Fan(sailtoy@foxmail.com), Peng Wanliang
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.easyTree
 * 
 * EasyTree
 * 
 * 使用jquery根据传入数据动态生成一颗树。可以定义树节点之间尖头的颜色，并可查看节点的详细信息。 鼠标提示强依赖于jquery.tooltip插件。
 * 
 * 节点数据结构： var tree = [ { text : '节点1', tooltipTitle:'tooltip标题', tooltip :
 * '提示内容' isError : false,//是否标记为错误节点 leftLine:'color',//左边线条颜色
 * rightLine:'color',//右边线条颜色 children : []//孩子节点 } ];
 * 
 * 使用方法： js: $(document).ready(function() { easyTree.init(tree); });
 * 
 * html: <div id="easyTree"></div>
 */

// 树高度
var depth = 0;
// 每层节点数目
var seq = [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ];
var easyTree = {
	id : "easyTree",

	// 初始化树
	init : function(data) {
		this.iterNode(data, null);
		// 设置tooltip，强依赖于插件jquery.tooltip
		$("div.node").tooltip();
	},

	// 递归动态画出树
	iterNode : function(node, parent, align) {
		var box = $("#" + this.id);
		depth++;
		var nodes = new Array();
		$.each(node, function(i, item) {
			// 构造节点
			var newNode = $("<div class='node' leftLine='" + item.leftLine
					+ "' rightLine='" + item.rightLine + "' >" + item.text
					+ "<div class='tooltip_description' title='"
					+ item.tooltipTitle + "' style='display:none'>"
					+ item.tooltip + "</div></div>");
			if (item.isError) {
				newNode.css("background-color", "red");
			}
			box.append(newNode);
			if(parent == null){
				newNode.css({
				left : 200 + 120 * seq[depth],
				top : 10 * depth
			});
			}else{
				newNode.css({
				left : 200 + 120 * seq[depth],
				top : parent.offset().top + parent.height() + 120
			});
			}
			
			nodes.push(newNode);
			seq[depth]++;
			if (item.children != null) {
				easyTree.iterNode(item.children, newNode);
			}
		});
		// 若节点为根节点，则不画线
		if (parent != null) {
			// 画线
			for (var i = 0; i < nodes.length; i++) {
				var pX = parent.offset().left + parent.width()/2;
				var pY = parent.offset().top + parent.height();
				var cX = nodes[i].offset().left + parent.width()/2;
				var cY = nodes[i].offset().top;
				// 左边线条
				if (nodes[i].attr("leftLine") != null
						&& nodes[i].attr("leftLine") != "")
					easyTree.drawArrowLine(box, pX - 10, pY, cX - 10, cY,
							nodes[i].attr("leftLine"));
				// 右边线条
				if (nodes[i].attr("rightLine") != null
						&& nodes[i].attr("rightLine") != "")
					easyTree.drawArrowLine(box, cX + 10, cY, pX + 10, pY,
							nodes[i].attr("rightLine"));

			}
		}
		depth--;
	},

	// 画点
	drawDot : function(container, x, y, color) {
		var dot = $("<div class='dot'></div>");
		dot.css({
			left : x,
			top : y
		});
		dot.css("background-color", color);
		container.append(dot);
	},

	// 画直线(x1,y1)->(x2,y2)
	drawLine : function(container, x1, y1, x2, y2, color) {
		// 竖线情况,斜率不存在，直接画出
		if (x1 == x2) {
			if (y1 > y2) {
				var tmp = y1;
				y1 = y2;
				y2 = tmp;
			}
			for (var i = y1; i < y2; i++) {
				this.drawDot(container, x1, i, color);
			}
			return;
		}
		// 直线方程y= ax + b
		var a = (y1 - y2) / (x1 - x2);
		var b = y1 - a * x1;

		// 使用较长的边计算直线上的坐标，使线段密实
		if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
			if (x1 > x2) {
				var tmp = x1;
				x1 = x2;
				x2 = tmp;
			}
			for (var i = x1; i < x2; i++) {
				this.drawDot(container, i, a * i + b, color);
			}
		} else {
			if (y1 > y2) {
				var tmp = y1;
				y1 = y2;
				y2 = tmp;
			}
			for (var i = y1; i < y2; i++) {
				this.drawDot(container, (i - b) / a, i, color);
			}
		}

	},

	// 画带箭头的直线，以A(x1,y1)到B(x2,y2),箭头在B
	drawArrowLine : function(container, x1, y1, x2, y2, color) {
		// 箭头角度
		var theta = 15 * Math.PI / 180;
		// 箭头长度
		var length = 10;
		// 计算向量P(AB)
		var px = x1 - x2;
		var py = y1 - y2;
		// 向量P旋转theta角度得到向量P1
		p1x = px * Math.cos(theta) - py * Math.sin(theta);
		p1y = px * Math.sin(theta) + py * Math.cos(theta);
		// 向量P旋转-theta角度得到向量P2
		p2x = px * Math.cos(-theta) - py * Math.sin(-theta);
		p2y = px * Math.sin(-theta) + py * Math.cos(-theta);

		// 缩放向量
		var a, b;
		a = Math.sqrt(p1x * p1x + p1y * p1y);
		p1x = p1x * length / a;
		p1y = p1y * length / a;

		b = Math.sqrt(p2x * p2x + p2y * p2y);
		p2x = p2x * length / b;
		p2y = p2y * length / b;

		// 平移直线
		p1x = p1x + x2;
		p1y = p1y + y2;
		p2x = p2x + x2;
		p2y = p2y + y2;

		// 画直线
		this.drawLine(container, x1, y1, x2, y2, color);

		// 画箭头
		this.drawLine(container, p1x, p1y, p2x, p2y, color);
		this.drawLine(container, x2, y2, p1x, p1y, color);
		this.drawLine(container, x2, y2, p2x, p2y, color);
	}

};