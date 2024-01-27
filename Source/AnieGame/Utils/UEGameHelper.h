#pragma once
#include "Kismet/BlueprintFunctionLibrary.h"
#include "UObject/UObjectBase.h"
#include "UEGameHelper.generated.h"
/*
 *该类用来导出一些全局接口，一般是依赖GameGlobal的
 */

class UAnieGameInstance;
class UNetCallerTsBase;
class UEngine;

UENUM()
enum class ErrTestTcpConnect : uint8
{
	Success = 0,
	SocketSubSystemNotFound,
	CreateSocketError,
	WrongIpaddr,
	NotConnect,
};
class UAnieGameInstance;
UCLASS(meta = (ScriptName = "UEGameHelper"))
class ANIEGAME_API UGameHelper :public UBlueprintFunctionLibrary
{
	GENERATED_UCLASS_BODY()
public:
	static void SetGameInstance(UAnieGameInstance* GameInstance);

	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static UWorld* GetCurrWorld();

	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static UEngine* GetEngine();

	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static FString GetDeviceModel();

	UFUNCTION(BlueprintCallable, Category = "GameHelper")
	static void SetInputMode_UIOnly(UWidget* InWidgetToFocus, EMouseLockMode Mode);

	UFUNCTION(BlueprintCallable, Category = "GameHelper")
	static void SetInputMode_GameAndUI(UWidget* InWidgetToFocus, EMouseLockMode Mode);

	UFUNCTION(BlueprintCallable, Category = "GameHelper")
	static void SetMouseLockMode(EMouseLockMode InMouseLockMode = EMouseLockMode::DoNotLock);

	UFUNCTION(BlueprintCallable, Category = "GameHelper")
	static void SetInputMode_GameOnly();

	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static double GetTimeMS();

	//获取当前真实时间(不受app切后台影响)，单位毫秒
	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static double GetRealtimeMS();

	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static bool IsEditorMode();

	//获取UE4提供的安全区
	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static FMargin  GetSafeZone();

	//获取运行平台，返回值: Windows, Android,HTML5,IOS
	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static FString GetPlatform();

	static class UAnieGameInstance* m_GameInstance;

	//获取ObjectUniqueID对应的Object
	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static UObject* IndexToObject(int32 objectIndex);

	//通过路径读取文件类容
	UFUNCTION(BlueprintPure, Category = "GameHelper")
	static FString LoadFile(FString path);
	
	UFUNCTION(BlueprintCallable, Category = "GameHelper")
	static void SwitchPlayerController(APlayerController* PC);
	
};