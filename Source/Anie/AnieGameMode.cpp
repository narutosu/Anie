// Copyright Epic Games, Inc. All Rights Reserved.

#include "AnieGameMode.h"
#include "AnieCharacter.h"
#include "UObject/ConstructorHelpers.h"

AAnieGameMode::AAnieGameMode()
{
	// set default pawn class to our Blueprinted character
	static ConstructorHelpers::FClassFinder<APawn> PlayerPawnBPClass(TEXT("/Game/ThirdPerson/Blueprints/BP_ThirdPersonCharacter"));
	if (PlayerPawnBPClass.Class != NULL)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}
}
