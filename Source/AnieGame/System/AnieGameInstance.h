// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/GameInstance.h"
#include "JsEnv.h"
#include "AnieGameInstance.generated.h"

DECLARE_DYNAMIC_DELEGATE_TwoParams(FGlobalTick, float, deltaTimeMS, double, curTimeMS);
DECLARE_DYNAMIC_DELEGATE(FApplicationCallback);

/**
 * 
 */
UCLASS()
class ANIEGAME_API UAnieGameInstance : public UGameInstance
{
	GENERATED_BODY()
public:
	virtual void Init() override;
	virtual void Shutdown() override;
	bool Tick(float deltaSeconds);

public:
	void OnApplicationBackground();
	void OnApplicationForeground();
	UFUNCTION()
	UGameInstanceSubsystem* GetGameInstanceSubsystem(TSubclassOf<UGameInstanceSubsystem> SubsystemClass);
private:
	UPROPERTY()
	FGlobalTick JsUpdate;
	UPROPERTY()
	FApplicationCallback AppInit;
	UPROPERTY()
	FApplicationCallback AppInitOver;
	UPROPERTY()
	FApplicationCallback AppQuitFunc;
	UPROPERTY()
	FApplicationCallback AppBackgroundFunc;

	UPROPERTY()
	FApplicationCallback AppForegroundFunc;
	
	TSharedPtr<puerts::FJsEnv> m_GameScript;
	bool m_Ready;
	FTSTicker::FDelegateHandle m_TickDelegateHandler;
};
