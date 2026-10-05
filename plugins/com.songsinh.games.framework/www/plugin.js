cordova.define("com.songsinh.games.framework.NativePlugin", function(require, exports, module) { /**
 * Created by Linh on 4/12/2017.
 */
var exec = require('cordova/exec'),
	cordova = require('cordova');

var NativePlugin = {};

NativePlugin.prepareScore = function (successCallback, errorCallback, player, mode, level, score) {
	exec(successCallback, errorCallback, "NativePlugin", 'prepareScore', [player, mode, level, score]);
};
module.exports = NativePlugin;
});
