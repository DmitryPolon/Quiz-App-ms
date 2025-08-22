USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[ScoreResult]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ScoreResult]
    @ResultID INT,
    @WeightByDifficulty BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Score FLOAT = 0;
    DECLARE @EndTime DATETIME;
    DECLARE @NumberOfQuestions INT = 0;
    DECLARE @NumberOfCorrectAnswers INT = 0;
    DECLARE @TotalPossiblePoints INT = 0;
    DECLARE @CorrectPoints INT = 0;

    IF @WeightByDifficulty = 1
    BEGIN
        SELECT 
            @CorrectPoints = SUM(CASE WHEN ur.IsCorrect = 1 THEN ISNULL(q.DifficultyID, 1) ELSE 0 END),
            @NumberOfQuestions = COUNT(*),
            @NumberOfCorrectAnswers = SUM(CASE WHEN ur.IsCorrect = 1 THEN 1 ELSE 0 END),
            @TotalPossiblePoints = SUM(ISNULL(q.DifficultyID, 1))
        FROM UserResponses ur
        INNER JOIN Questions q ON ur.QuestionID = q.QuestionID
        WHERE ur.ResultID = @ResultID;

        IF @TotalPossiblePoints > 0
            SET @Score = (@CorrectPoints * 100.0) / @TotalPossiblePoints;
        ELSE
            SET @Score = 0;
    END
    ELSE
    BEGIN
        SELECT 
            @NumberOfCorrectAnswers = SUM(CASE WHEN ur.IsCorrect = 1 THEN 1 ELSE 0 END),
            @NumberOfQuestions = COUNT(*),
            @TotalPossiblePoints = COUNT(*)
        FROM UserResponses ur
        WHERE ur.ResultID = @ResultID;

        IF @TotalPossiblePoints > 0
            SET @Score = (@NumberOfCorrectAnswers * 100.0) / @TotalPossiblePoints;
        ELSE
            SET @Score = 0;
    END

    -- Update Results table (store raw percent as int)
    UPDATE Results
    SET Score = CAST(@Score AS INT)
    WHERE ResultID = @ResultID;

    -- Get EndTime
    SELECT @EndTime = EndTime
    FROM Results
    WHERE ResultID = @ResultID;

    -- Return summary: TakenAt, Score (percent), NumberOfQuestions, NumberOfCorrectAnswers, TotalPossiblePoints
    SELECT 
        @EndTime AS TakenAt, 
        @Score AS Score,
        @NumberOfQuestions AS NumberOfQuestions,
        @NumberOfCorrectAnswers AS NumberOfCorrectAnswers,
        @TotalPossiblePoints AS TotalPossiblePoints;

    -- Return details: QuestionText, IsCorrect
    SELECT 
        q.QuestionText,
        ur.IsCorrect
    FROM UserResponses ur
    INNER JOIN Questions q ON ur.QuestionID = q.QuestionID
    WHERE ur.ResultID = @ResultID;
END

GO
