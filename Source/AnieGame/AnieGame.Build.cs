// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class AnieGame : ModuleRules
{
	public AnieGame(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "EnhancedInput" });
		PrivateDependencyModuleNames.AddRange(new string[] { "Slate", "SlateCore", "UMG","Puerts","JsEnv"});
		// Generate compile errors if using DrawDebug functions in test/shipping builds.
		PublicDefinitions.Add("SHIPPING_DRAW_DEBUG_ERROR=1");

		SetupGameplayDebuggerSupport(Target);
		SetupIrisSupport(Target);
	}
}
