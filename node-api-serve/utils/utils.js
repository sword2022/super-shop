var utils = {
    isNdefOrNull: function (variable) {
        let x;
        try {
            x = variable;
        } catch (e) {
            console.log(e.message);//sojson is undefined
        }
    },
    timeFn: function (d1) {
        var dateBegin = new Date(d1.toString().replace(/-/g, "/"));//将-转化为/，使用new Date
        var dateEnd = new Date();//获取当前时间
        var dateDiff = dateEnd.getTime() - dateBegin.getTime();//时间差的毫秒数
        var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
        var leave1 = dateDiff % (24 * 3600 * 1000)    //计算天数后剩余的毫秒数
        var hours = Math.floor((dayDiff * 24) + (leave1 / (3600 * 1000)))//计算出小时数
        //计算相差分钟数
        var leave2 = leave1 % (3600 * 1000)    //计算小时数后剩余的毫秒数
        var minutes = Math.floor((hours * 60) + (leave2 / (60 * 1000)))//计算相差分钟数
        //计算相差秒数
        // var leave3 = leave2%(60*1000)      //计算分钟数后剩余的毫秒数
        // var seconds = Math.round(leave3/1000)
        //console.log("相差 " + dayDiff + "天,相差 " + hours + "小时,相差 " + minutes + " 分钟")
        return minutes
    }
}
module.exports = utils;