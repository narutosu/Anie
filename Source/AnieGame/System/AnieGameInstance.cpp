// Fill out your copyright notice in the Description page of Project Settings.

#include "AnieGameInstance.h"
#include "PuertsModule.h"

void UAnieGameInstance::Init()
{
	Super::Init();
	m_Ready = false;
	
	m_TickDelegateHandler = FTSTicker::GetCoreTicker().AddTicker(FTickerDelegate::CreateUObject(this, &UAnieGameInstance::Tick));

	FCoreDelegates::ApplicationWillEnterBackgroundDelegate.AddUObject(this, &UAnieGameInstance::OnApplicationBackground);
	FCoreDelegates::ApplicationHasEnteredForegroundDelegate.AddUObject(this, &UAnieGameInstance::OnApplicationForeground);

}

bool UAnieGameInstance::Tick(float deltaSeconds)
{
	if (!m_Ready)
	{
		bool WaitDebbuger = IPuertsModule::Get().WaitDebugger();
		m_GameScript = MakeShared<puerts::FJsEnv>(std::make_unique<puerts::DefaultJSModuleLoader>(TEXT("JavaScript")), std::make_shared<puerts::FDefaultLogger>(), 8081);
		if (WaitDebbuger)
		{
			m_GameScript->WaitDebugger();
		}

		TArray<TPair<FString, UObject*>> Arguments;
		Arguments.Add(TPair<FString, UObject*>(TEXT("GameInstance"), this));
		Arguments.Add(TPair<FString, UObject*>(TEXT("World"), this->GetWorld()));
		m_GameScript->Start("main.js", Arguments);
		AppInit.ExecuteIfBound();
		AppInitOver.ExecuteIfBound();
		m_Ready = true;
	}

	JsUpdate.ExecuteIfBound(deltaSeconds * 1000, FPlatformTime::Seconds() * 1000);
	return true;
}

void UAnieGameInstance::OnApplicationBackground()
{
	AppBackgroundFunc.ExecuteIfBound();
}

void UAnieGameInstance::OnApplicationForeground()
{
	AppForegroundFunc.ExecuteIfBound();
}

UGameInstanceSubsystem* UAnieGameInstance::GetGameInstanceSubsystem(TSubclassOf<UGameInstanceSubsystem> SubsystemClass)
{
	return this->GetSubsystemBase(SubsystemClass);
}

void UAnieGameInstance::Shutdown()
{
	Super::Shutdown();
	AppQuitFunc.ExecuteIfBound();
	m_GameScript.Reset();
	FTSTicker::GetCoreTicker().RemoveTicker(m_TickDelegateHandler);
	m_Ready = false;
}
