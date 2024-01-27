#include "UEGameHelper.h"
#include "AnieGame/System/AnieGameInstance.h"
#include "Engine.h"
#if PLATFORM_ANDROID
#include "Android/AndroidPlatformMisc.h"
#elif PLATFORM_IOS
#include "IOS/IOSPlatformMisc.h"
#endif
#include "Kismet/GameplayStatics.h"
#include "Blueprint/WidgetTree.h"
#include "Blueprint/WidgetBlueprintLibrary.h"

UAnieGameInstance* UGameHelper::m_GameInstance = NULL;

UGameHelper::UGameHelper(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
}

void UGameHelper::SetGameInstance(UAnieGameInstance* GameInstance)
{
	m_GameInstance = GameInstance;
}

UWorld* UGameHelper::GetCurrWorld()
{
	if (IsValid(m_GameInstance))
	{
		return m_GameInstance->GetWorld();
	}
	if (IsEditorMode())
	{
		return GWorld->GetWorld();
	}
	return nullptr;
}

UEngine* UGameHelper::GetEngine()
{
	if (IsValid(m_GameInstance))
	{
		return m_GameInstance->GetEngine();
	}
	return nullptr;
}
	

FString UGameHelper::GetDeviceModel()
{
	FString DeviceModel;
#if PLATFORM_ANDROID
	DeviceModel = FAndroidMisc::GetDeviceModel();
#elif PLATFORM_IOS
	DeviceModel = FIOSPlatformMisc::GetDeviceMakeAndModel();
#else
	DeviceModel = FGenericPlatformMisc::GetDeviceMakeAndModel();
#endif
	return DeviceModel;
}

void UGameHelper::SetInputMode_UIOnly(UWidget* InWidgetToFocus, EMouseLockMode Mode)
{
	auto PlayerController = UGameplayStatics::GetPlayerController(UGameHelper::GetCurrWorld(), 0);
	auto Character = UGameplayStatics::GetPlayerCharacter(UGameHelper::GetCurrWorld(), 0);
	if (PlayerController)
	{
		PlayerController->bShowMouseCursor = 1;
		PlayerController->bEnableClickEvents = 1;
		if (Character)
		{
			//UI only 模式下禁用玩家控制输入
			Character->DisableInput(PlayerController);
			//重新刷新按键状态
			PlayerController->FlushPressedKeys();
		}
		//调用真正的UI only函数
		UWidgetBlueprintLibrary::SetInputMode_UIOnlyEx(PlayerController, InWidgetToFocus, Mode);	
	}
}

void UGameHelper::SetInputMode_GameAndUI(UWidget* InWidgetToFocus, EMouseLockMode Mode)
{
	auto PlayerController = UGameplayStatics::GetPlayerController(UGameHelper::GetCurrWorld(), 0);
	if (PlayerController)
	{
		PlayerController->bShowMouseCursor = 1;
		PlayerController->bEnableClickEvents = 1;
		UWidgetBlueprintLibrary::SetInputMode_GameAndUIEx(PlayerController, InWidgetToFocus, Mode, false);
	}
}

void UGameHelper::SetInputMode_GameOnly()
{
	auto PlayerController = UGameplayStatics::GetPlayerController(UGameHelper::GetCurrWorld(), 0);
	auto Character = UGameplayStatics::GetPlayerCharacter(UGameHelper::GetCurrWorld(), 0);
	if (PlayerController)
	{
		PlayerController->bShowMouseCursor = 0;
		PlayerController->bEnableClickEvents = 0;
		UWidgetBlueprintLibrary::SetInputMode_GameOnly(PlayerController);
		if (Character)
		{
			//UI only 模式下启用玩家控制输入
			Character->EnableInput(PlayerController);
			//重新刷新按键状态
			//PlayerController->FlushPressedKeys();
		}
	}
}


void UGameHelper::SetMouseLockMode(EMouseLockMode InMouseLockMode)
{
	GetCurrWorld()->GetGameViewport()->SetMouseLockMode(InMouseLockMode);
}

double UGameHelper::GetTimeMS()
{
	return FPlatformTime::Seconds() * 1000;
}

double UGameHelper::GetRealtimeMS()
{
	return FDateTime::Now().GetTicks() / ETimespan::TicksPerMillisecond;
}


bool UGameHelper::IsEditorMode()
{
#if WITH_EDITOR
	return true;
#else
	return false;
#endif
}

FMargin  UGameHelper::GetSafeZone() {
	FMargin SafeZone;
	if (FSlateApplication::IsInitialized())
	{
		FDisplayMetrics DisplayMetrics;
		FSlateApplication::Get().GetDisplayMetrics(DisplayMetrics);
		auto CachedDisplayWidth = DisplayMetrics.PrimaryDisplayWidth;
		auto CachedDisplayHeight = DisplayMetrics.PrimaryDisplayHeight;

#if PLATFORM_DESKTOP
		TSharedPtr<SWindow> Window = FSlateApplication::Get().GetActiveTopLevelWindow();
		if (Window.IsValid())
		{
			FVector2D WindowSize = Window->GetClientSizeInScreen();
			if (ISlateViewport* SlateViewport = Window->GetViewport().Get())
			{
				WindowSize = SlateViewport->GetSize();
			}

			CachedDisplayWidth = WindowSize.X;
			CachedDisplayHeight = WindowSize.Y;
		}
#endif

		const FVector2D EffectiveScreenSize = FVector2D(CachedDisplayWidth, CachedDisplayHeight);
		FSlateApplication::Get().GetSafeZoneSize(/*out*/ SafeZone, EffectiveScreenSize);

		auto bSafeZonePadX = FMath::CeilToInt(SafeZone.Left);
		auto SafeZonePadY = FMath::CeilToInt(SafeZone.Top);
		auto SafeZonePadEX = FMath::CeilToInt(SafeZone.Right);
		auto SafeZonePadEY = FMath::CeilToInt(SafeZone.Bottom);
	}
	return SafeZone;
}

FString UGameHelper::GetPlatform()
{
	// the string that BP users care about is actually the platform name that  we'd name the .ini file directory (Windows, not WindowsEditor)
	// 返回值: Windows, Android,HTML5,IOS
	return FPlatformProperties::IniPlatformName();
}


UObject* UGameHelper::IndexToObject(int32 objectIndex)
{
	if (objectIndex >= 0)
	{
		FUObjectItem* fUObjectPtr = GUObjectArray.IndexToObject(objectIndex);
		if (fUObjectPtr)
		{
			return (UObject*)fUObjectPtr->Object;
		}
	}
	return nullptr;
}

FString UGameHelper::LoadFile(FString path)
{
	FString OutResult;
	FFileHelper::LoadFileToString(OutResult, *path);
	return OutResult;
}

void UGameHelper::SwitchPlayerController(APlayerController* PC)
{
	if (!IsValid(m_GameInstance) || !PC) 
	{
		return;
	}
	ULocalPlayer* LocalPlayer = m_GameInstance->GetFirstGamePlayer();
	if (LocalPlayer->PlayerController == PC) 
	{
		return;
	}
	APawn* ControlPawn = nullptr;
	if (LocalPlayer->PlayerController)
	{
		ControlPawn = LocalPlayer->PlayerController->GetPawn();
	}
	APlayerController* OldPlayerController = LocalPlayer->PlayerController;
	ControlPawn->DisableInput(OldPlayerController);
	OldPlayerController->DisableInput(OldPlayerController);
	OldPlayerController->SetActorTickEnabled(false);
	OldPlayerController->PlayerInput->FlushPressedKeys();

	LocalPlayer->SwitchController(PC);
	PC->EnableInput(PC);
	PC->SetActorTickEnabled(true);
	UWorld* OwerWorld = m_GameInstance->GetWorld();
	
	PC->Possess(ControlPawn);
	ControlPawn->EnableInput(PC);
}

