//引入模块
var http = require('http');
var qs = require('querystring');
var crypto = require('crypto');
//使用指定数据模型需要在此处引入
const FeiESetting = require('../models/feie_setting.js')

//以下URL参数不需要修改
var HOST = "api.feieyun.cn";     //域名
var PORT = "80";		         //端口
var PATH = "/Api/Open/";         //接口路径
var isAdded = false				 //已添加打印机
var feie = {




	//**********测试时，打开下面注释掉方法的即可,更多接口文档信息,请访问官网开放平台查看**********


	//添加打印机接口（支持批量）
	//----------接口返回值说明----------
	//正确例子：{"msg":"ok","ret":0,"data":{"ok":["sn#key#remark#carnum","316500011#abcdefgh#快餐前台"],"no":["316500012#abcdefgh#快餐前台#13688889999  （错误：识别码不正确）"]},"serverExecutedTime":3}
	//错误：{"msg":"参数错误 : 该帐号未注册.","ret":-2,"data":null,"serverExecutedTime":37}

	//提示：打印机编号(必填) # 打印机识别码(必填) # 备注名称(选填) # 流量卡号码(选填)，多台打印机请换行（\n）添加新打印机信息，每次最多100行(台)。
	//var snlist = "sn1#key1#remark1#carnum1\nsn2#key2#remark2#carnum2"
	//addprinter(snlist);



	//方法1.打印订单
	//----------接口返回值说明----------
	//正确例子：{"msg":"ok","ret":0,"data":"xxxx_xxxx_xxxxxxxxx","serverExecutedTime":6}
	//错误：{"msg":"错误信息.","ret":非零错误码,"data":null,"serverExecutedTime":5}

	//提示：调用打印接口之前，必须登录后台在该账号下添加打印机，或者通过API接口，把打印机添加到该账号下面
	//var sn = "xxxxx";//打印机编号（9位数字），必填，查看打印机底部标签
	//print(sn);



	//方法2.查询某订单是否打印成功
	//----------接口返回值说明----------
	//已打印：{"msg":"ok","ret":0,"data":true,"serverExecutedTime":6}
	//未打印：{"msg":"ok","ret":0,"data":false,"serverExecutedTime":6}

	//var strorderid = "xxxxxx_xxxxxx_xxxxx";//订单id，由方法1返回
	//queryOrderState(strorderid);




	//方法3.查询指定打印机某天的订单详情
	//----------接口返回值说明----------
	//正确例子：{"msg":"ok","ret":0,"data":{"print":6,"waiting":1},"serverExecutedTime":9}
	//错误例子：{"msg":"参数错误 : 时间格式不正确。","ret":1001,"data":null,"serverExecutedTime":37}

	//var sn = "xxxxx";//打印机编号（9位数字），必填，查看打印机底部标签
	//var strdate = "2017-03-09";//注意日期格式为yyyy-MM-dd
	//queryOrderInfoByDate(sn,strdate);





	//方法4.查询打印机的状态
	//提示：由于获取到打印机状态有延时，不建议使用本接口作为发单的依据
	//如果有订单数据要打印，直接调用方法1传过来即可，不必先调用本接口获取打印机状态

	//----------接口返回值说明-----------
	//提示：返回的JOSN中文是编码过的
	//{"msg":"ok","ret":0,"data":"离线","serverExecutedTime":9}
	//{"msg":"ok","ret":0,"data":"在线，工作状态正常","serverExecutedTime":9}
	//{"msg":"ok","ret":0,"data":"在线，工作状态不正常","serverExecutedTime":9}

	//var sn = "xxxxx";//打印机编号（9位数字），必填，查看打印机底部标签
	//queryPrinterStatus(sn);





	//-----------------------以下方法实现----------------------------------
	addprinter: async function () {

		if (!isAdded) {
			console.log('addprinter');
			var STIME = Math.floor(new Date().getTime() / 1000);//请求时间,当前时间的秒数	
			//获取飞鹅云打印机设置
			const fesetting = await FeiESetting.findOne()
			var snlist = fesetting.user + "#" + fesetting.user
			var post_data = {
				user: fesetting.user,//账号
				stime: STIME,//当前时间的秒数，请求时间
				sig: signature(fesetting.user, fesetting.ukey, STIME),//签名
				apiname: "Open_printerAddlist",//不需要修改
				printerContent: snlist//添加的打印机信息
			};
			var content = qs.stringify(post_data);
			var options = {
				hostname: HOST,
				port: 80,
				path: PATH,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			};
			var req = http.request(options, function (res) {
				res.setEncoding('utf-8');
				res.on('data', function (response) {
					//response是返回的JSON字符串
					// console.log('addprinter:',response);
					var jsObj = JSON.parse(response)
					if(jsObj.msg == 'ok'){
						console.log('addprinter:ok');
						isAdded = true
					}else{
						console.log('addprinter:',response);
					}
				});
			});
			req.on('error', function (e) {
				console.log('error!');
			});
			req.write(content);
			req.end();
		}
		return
	},


	print: async function (orderInfo) {
		console.log('print');
		//标签说明：
		//单标签:
		//"<BR>"为换行,"<CUT>"为切刀指令(主动切纸,仅限切刀打印机使用才有效果)
		//"<LOGO>"为打印LOGO指令(前提是预先在机器内置LOGO图片),"<PLUGIN>"为钱箱或者外置音响指令
		//成对标签：
		//"<CB></CB>"为居中放大一倍,"<B></B>"为放大一倍,"<C></C>"为居中,<L></L>字体变高一倍
		//<W></W>字体变宽一倍,"<QR></QR>"为二维码,"<BOLD></BOLD>"为字体加粗,"<RIGHT></RIGHT>"为右对齐
		//拼凑订单内容时可参考如下格式
		//根据打印纸张的宽度，自行调整内容的格式，可参考下面的样例格式

		// var orderInfo;
		// orderInfo = "<CB>测试打印</CB><BR>";//标题字体如需居中放大,就需要用标签套上
		// orderInfo += "名称　　　　　 单价  数量 金额<BR>";
		// orderInfo += "--------------------------------<BR>";
		// orderInfo += "番　　　　　　 1.0    1   1.0<BR>";
		// orderInfo += "番茄　　　　　 10.0   10  10.0<BR>";
		// orderInfo += "番茄炒　　　　 10.0   100 100.0<BR>";
		// orderInfo += "番茄炒粉　　　 100.0  100 100.0<BR>";
		// orderInfo += "番茄炒粉粉　　 1000.0 1   100.0<BR>";
		// orderInfo += "番茄炒粉粉粉粉 100.0  100 100.0<BR>";
		// orderInfo += "番茄炒粉粉粉粉 15.0   1   15.0<BR>";
		// orderInfo += "备注：快点送到xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx<BR>";
		// orderInfo += "--------------------------------<BR>";
		// orderInfo += "合计：xx.0元<BR>";
		// orderInfo += "送货地点：xxxxxxxxxxxxxxxxx<BR>";
		// orderInfo += "联系电话：138000000000<BR>";
		// orderInfo += "订餐时间：2011-01-06 19:30:10<BR><BR>";
		// orderInfo += "----------请扫描二维码----------";
		// orderInfo += "<QR>http://www.dzist.com</QR>";//把二维码字符串用标签套上即可自动生成二维码
		var STIME = Math.floor(new Date().getTime() / 1000);//请求时间,当前时间的秒数
		//获取飞鹅云打印机设置
		const fesetting = await FeiESetting.findOne()
		var post_data = {
			user: fesetting.user,//账号
			stime: STIME,//当前时间的秒数，请求时间
			sig: signature(fesetting.user, fesetting.ukey, STIME),//签名
			apiname: "Open_printMsg",//不需要修改
			sn: fesetting.printer_sn,//打印机编号
			content: orderInfo,//打印内容
			times: "1"//打印联数,默认为1
		};
		var content = qs.stringify(post_data);
		var options = {
			hostname: HOST,
			port: 80,
			path: PATH,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		};
		var req = http.request(options, function (res) {
			res.setEncoding('utf-8');
			res.on('data', function (response) {
				//response是返回的JSON字符串
				//服务器返回值，建议要当做日志记录起来
				console.log('print:',response);
			});
		});
		req.on('error', function (e) {
			console.log('error!');
		});
		req.write(content);
		req.end();
		return
	},
	queryOrderState: async function (strorderid) {
		var STIME = Math.floor(new Date().getTime() / 1000);//请求时间,当前时间的秒数
		//获取飞鹅云打印机设置
		const fesetting = await FeiESetting.findOne()
		var post_data = {
			user: fesetting.user,//账号
			stime: STIME,//当前时间的秒数，请求时间
			sig: signature(fesetting.user, fesetting.ukey, STIME),//签名
			apiname: "Open_queryOrderState",//不需要修改
			orderid: strorderid//订单id由方法1返回
		};
		var content = qs.stringify(post_data);
		var options = {
			hostname: HOST,
			port: 80,
			path: PATH,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		};
		var req = http.request(options, function (res) {
			res.setEncoding('utf-8');
			res.on('data', function (response) {
				//response是返回的JSON字符串
				console.log(response);
			});
		});
		req.on('error', function (e) {
			console.log('error!');
		});
		req.write(content);
		req.end();
	},
	queryOrderInfoByDate: async function (sn, strdate) {
		var STIME = Math.floor(new Date().getTime() / 1000);//请求时间,当前时间的秒数	
		//获取飞鹅云打印机设置
		const fesetting = await FeiESetting.findOne()
		var post_data = {
			user: fesetting.user,//账号
			stime: STIME,//当前时间的秒数，请求时间
			sig: signature(fesetting.user, fesetting.ukey, STIME),//签名
			apiname: "Open_queryOrderInfoByDate",//不需要修改
			sn: fesetting.printer_sn,//打印机编号
			date: strdate,//日期
		};
		var content = qs.stringify(post_data);
		var options = {
			hostname: HOST,
			port: 80,
			path: PATH,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		};
		var req = http.request(options, function (res) {
			res.setEncoding('utf-8');
			res.on('data', function (response) {
				//response是返回的JSON字符串
				console.log(response);
			});
		});
		req.on('error', function (e) {
			console.log('error!');
		});
		req.write(content);
		req.end();
	},
	queryPrinterStatus: async function (sn) {
		var STIME = Math.floor(new Date().getTime() / 1000);//请求时间,当前时间的秒数
		//获取飞鹅云打印机设置
		const fesetting = await FeiESetting.findOne()
		var post_data = {
			user: fesetting.user,//账号
			stime: STIME,//当前时间的秒数，请求时间
			sig: signature(fesetting.user, fesetting.ukey, STIME),//签名
			apiname: "Open_queryPrinterStatus",//不需要修改
			sn: fesetting.printer_sn//打印机编号
		};
		var content = qs.stringify(post_data);
		var options = {
			hostname: HOST,
			port: 80,
			path: PATH,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			}
		};
		var req = http.request(options, function (res) {
			res.setEncoding('utf-8');
			res.on('data', function (response) {
				//response是返回的JSON字符串
				console.log(response);
			});
		});
		req.on('error', function (e) {
			console.log('error!');
		});
		req.write(content);
		req.end();
	}
}
function signature(USER, UKEY, STIME) {
	return crypto.createHash('sha1').update(USER + UKEY + STIME).digest('hex');//获取签名
}
module.exports = feie;




