"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UE = require("ue");
var Puerts = require("puerts");
if (UE.GameHelper.IsEditorMode()) {
    require("source-map-support-run");
}
var gameInst = Puerts.argv.getByName("GameInstance");
gameInst.AppInit.Bind(function () {
    console.log("AppInit");
    //ClientGlobal.Instance().Init();
    //GameGlobal.GetInstance().InitOnce(game_inst);
});
gameInst.JsUpdate.Bind(function (deltaTimeMS, curTimeMS) {
    console.log("JsUpdate");
    // try
    // {
    // 	ClientGlobal.Instance().Update(deltaTimeMS, curTimeMS);
    // }
    // catch (error)
    // {
    // 	let err = H.ConvertType(error, Error);
    // 	Log.error(err.stack);
    // 	if (UE.GameHelper.IsEditorMode())
    // 	{
    // 		//暂停游戏  停止Js的Update
    // 		UE.GameplayStatics.SetGamePaused(UEHelper.GetUEWorld(), true);
    // 		gameInst.JsUpdate.Unbind();
    // 	}
    // }
});
gameInst.AppBackgroundFunc.Bind(function () {
    //ClientGlobal.Instance().OnApplicationPause(true);
});
gameInst.AppForegroundFunc.Bind(function () {
    //ClientGlobal.Instance().OnApplicationPause(false);
});
gameInst.AppQuitFunc.Bind(function () {
    //ClientGlobal.Instance().OnApplicationQuit();
});
