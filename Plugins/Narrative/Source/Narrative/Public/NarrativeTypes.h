#pragma once

#include "CoreMinimal.h"
#include "Quest.h"
#include "UObject/ObjectMacros.h"
#include "UObject/Class.h"
#include "Templates/SubclassOf.h"
#include "Engine/DataTable.h"
#include "NarrativeTypes.generated.h"
/** 任务分类 **/
UENUM(BlueprintType)
enum class EQuestCategory : uint8
{
	Main	UMETA(DisplayName = "Main"),
	Branch	UMETA(DisplayName = "Branch"),
	Other	UMETA(DisplayName = "Other"),
	None	UMETA(DisplayName = "None")
};

/** Quest Config Table **/
USTRUCT(BlueprintType)
struct FQuestAssetDataTable :public FTableRowBase
{
	GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest", meta = (Tooltip = "QID，唯一标识"))
	int32 QuestID;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest", meta = (Tooltip = "任务资源"))
	TSubclassOf<UQuest> QuestClass;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest")
	EQuestCategory QuestCategory;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest", meta = (Tooltip = "任务标题"))
	FText QuestTitle;
	
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Quest", meta = (Tooltip = "任务奖励ID"))
	int32 RewardID;

	FQuestAssetDataTable() :QuestID(0), RewardID(0) 
	{
	}

	virtual void OnPostDataImport(const UDataTable* InDataTable, const FName InRowName, TArray<FString>& OutCollectedImportProblems) 
	{
		
	}

#if WITH_EDITOR
	virtual void PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent)
	{

	}
#endif // WITH_EDITOR
};