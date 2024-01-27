declare function require(any);

import * as UE from 'ue'
import * as Puerts from 'puerts'

if (UE.GameHelper.IsEditorMode())
{
	require("../../ts_workspace/ThirdParty/source-map-support-run/source-map-support-run.js");
}

let gameInst = Puerts.argv.getByName("GameInstance") as UE.AnieGameInstance;

gameInst.AppInit.Bind(function ()
{
	console.log("AppInit")
	//ClientGlobal.Instance().Init();
	//GameGlobal.GetInstance().InitOnce(game_inst);
});
gameInst.JsUpdate.Bind((deltaTimeMS: number, curTimeMS: number) =>
{
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

gameInst.AppBackgroundFunc.Bind(function ()
{
	//ClientGlobal.Instance().OnApplicationPause(true);
});
gameInst.AppForegroundFunc.Bind(function ()
{
	//ClientGlobal.Instance().OnApplicationPause(false);
});
gameInst.AppQuitFunc.Bind(function ()
{
	//ClientGlobal.Instance().OnApplicationQuit();
});