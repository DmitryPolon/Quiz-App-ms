USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[SubmitAnswer]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SubmitAnswer]
  /*I am guessing there has to be a version trial, if the question or answer changes. 
  This can become an endless loop of chasing perfection. 
  I am not doing an approval workflow with test vertioning. */
	
    @UserID INT,
    @QuizID INT,
    @QuestionID INT,
    @AnswerID INT = NULL,
    @ResponseTimeSeconds INT = NULL,
    @AnswerTimedOut BIT = 0,
	@ResultID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IsCorrect BIT = NULL;
    DECLARE @QuestionText NVARCHAR(500) = NULL;
    DECLARE @AnswerText NVARCHAR(500) = NULL;

    SELECT @QuestionText = QuestionText
    FROM Questions
    WHERE QuestionID = @QuestionID;

    IF @AnswerID IS NOT NULL
    BEGIN
        SELECT 
            @IsCorrect = IsCorrect,
            @AnswerText = AnswerText
        FROM Answers
        WHERE AnswerID = @AnswerID;
    END

    INSERT INTO UserResponses (
        UserID,
        QuizID,
        QuestionID,
        QuestionText,
        SelectedAnswerID,
        AnswerText,
        IsCorrect,
        TimeTakenSeconds,
        ResponseDateTime,
        AnswerTimedOut,
		ResultID
    )
    VALUES (
        @UserID,
        @QuizID,
        @QuestionID,
        @QuestionText,
        @AnswerID,
        @AnswerText,
        @IsCorrect,
        @ResponseTimeSeconds,
        GETDATE(),
        @AnswerTimedOut,
		@ResultID
    );
END

GO
