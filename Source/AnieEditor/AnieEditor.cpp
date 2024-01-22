// Copyright Epic Games, Inc. All Rights Reserved.

#include "AnieEditor.h"

#define LOCTEXT_NAMESPACE "AnieEditor"

DEFINE_LOG_CATEGORY(LogAnieEditor);

/**
 * FLyraEditorModule
 */
class FAnieEditorModule : public FDefaultGameModuleImpl
{
	virtual void StartupModule() override
	{
	}

	virtual void ShutdownModule() override
	{
	}
};

IMPLEMENT_MODULE(FAnieEditorModule, AnieEditor);

#undef LOCTEXT_NAMESPACE
