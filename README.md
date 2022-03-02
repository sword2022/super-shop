# super-shop
点餐/自提/外卖/团购微信小程序配送方式自由选择(单店版)，支持飞鹅外卖打印机，微信新订单提醒，服务端node.js+express+mongodb，管理端vue+elementui，小程序uni-app
# 效果展示
无法显示图片可使用自由海添加域名raw.githubusercontent.com 刷新页面即可显示图片
![image](https://github.com/sword2022/images/blob/8683c95d2b0f11cb12d7a9dfd4d31fc3510532b2/0.jpg)
![image](https://github.com/sword2022/images/blob/8683c95d2b0f11cb12d7a9dfd4d31fc3510532b2/1.jpg)
![image](https://github.com/sword2022/images/blob/8683c95d2b0f11cb12d7a9dfd4d31fc3510532b2/2.jpg)
![image](https://github.com/sword2022/images/blob/8683c95d2b0f11cb12d7a9dfd4d31fc3510532b2/3.jpg)
![image](https://github.com/sword2022/images/blob/8683c95d2b0f11cb12d7a9dfd4d31fc3510532b2/5.jpg)
![image](https://github.com/sword2022/images/blob/99017e838d70eb026c1bd45b47e49aac47e4ff63/myRQ.jpg)
# 服务端
_______________________________________  
安装步骤*****************************   
---------------------------------------  
bcrypt安装  
npm i --save node-gyp  
npm i bcrypt  
全局安装pm2  
npm install pm2 -g  
安装windows自启动包(服务器不需要)  
npm install pm2-windows-startup -g  
执行命令  
pm2-startup install  
pm2 start  app.js  
保存  
pm2 save  
重启电脑  
查看运行日志  
pm2 logs  
_______________________________________  
目录介绍*****************************  
---------------------------------------  
--cert		微信支付退款用商户证书  
--models		数据模型 指定了保存到数据库的数据格式  
--plugins		插件 定义mongoose模块连接数据库的方法  
--routers		接口  
--ssl		SSL证书 用来支持https访问的  
--uploads		资源上传  
--utils		工具类 存放功能函数  
# 管理端
_______________________________________  
安装步骤*****************************  
---------------------------------------  
修改服务器网址www123456789.qicp.vip为自己的  
\element-admin\src\http.js  
安装库  
npm i  
调试运行  
npm run serve  
发布  
npm run build  
进入dist目录运行  
cd dist  
serve  
运行成功即可通过域名在网络上访问  
# 小程序 
vscode		用于编程  
HBuilderX		用于编译  
uniapp项目到微信开发者工具  
微信开发者工具	用于发布项目到微信服务器  
