var crypto = require('crypto')

var signature = {
    //签名
    dada_sign: function (body, format, timestamp, app_key, v, source_id, app_secret) {
        var ret = {
            body: body,
            format: format,
            timestamp: timestamp,
            app_key: app_key,
            v: v,
            source_id: source_id
        };
        var string = raw(ret);
        string = app_secret + string + app_secret;
        // console.log(string);
        var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
        return sign.toUpperCase()
    },
}
function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        string += k + newArgs[k];
    }
    return string;
}

module.exports = signature;