// Copyright Epic Games, Inc. All Rights Reserved.

#include "AnieGame.h"
#include "Modules/ModuleManager.h"

/**
 * FLyraGameModule
 */
class FAnieGameModule : public FDefaultGameModuleImpl
{
	virtual void StartupModule() override
	{
	}

	virtual void ShutdownModule() override
	{
	}
};

IMPLEMENT_PRIMARY_GAME_MODULE(FAnieGameModule, AnieGame, "AnieGame");
 