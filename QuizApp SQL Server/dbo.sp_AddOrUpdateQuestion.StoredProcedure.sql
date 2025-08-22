USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[sp_AddOrUpdateQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[sp_AddOrUpdateQuestion]
    @QuestionID INT = NULL,
    @QuizID INT,
    @QuestionText NVARCHAR(MAX),
    @DifficultyID INT = NULL,
    @TimeLimitSeconds INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewQuestionID INT;

    IF @QuestionID IS NULL
    BEGIN
        INSERT INTO Questions (QuizID, QuestionText, DifficultyID, TimeLimitSeconds)
        VALUES (@QuizID, @QuestionText, @DifficultyID, @TimeLimitSeconds);

        SET @NewQuestionID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        IF EXISTS (
            SELECT 1 FROM Questions
            WHERE QuestionID = @QuestionID
              AND (ISNULL(QuizID, -1) <> ISNULL(@QuizID, -1)
                   OR ISNULL(QuestionText, '') <> ISNULL(@QuestionText, '')
                   OR ISNULL(DifficultyID, -1) <> ISNULL(@DifficultyID, -1)
                   OR ISNULL(TimeLimitSeconds, -1) <> ISNULL(@TimeLimitSeconds, -1))
        )
        BEGIN
            UPDATE Questions
            SET QuizID = @QuizID,
                QuestionText = @QuestionText,
                DifficultyID = @DifficultyID,
                TimeLimitSeconds = @TimeLimitSeconds
            WHERE QuestionID = @QuestionID;
        END
        SET @NewQuestionID = @QuestionID;
    END

    SELECT @NewQuestionID AS QuestionID;
END

GO
