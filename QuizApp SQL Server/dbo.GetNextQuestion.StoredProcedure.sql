USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetNextQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ========================================
-- Get Next Question with Conditional Logic
-- ========================================
CREATE   PROCEDURE [dbo].[GetNextQuestion]
    @UserID INT,
    @CurrentQuestionID INT
AS
BEGIN
    DECLARE @SelectedAnswerID INT;
    DECLARE @FollowUpQuestionID INT;

    SELECT @SelectedAnswerID = SelectedAnswerID
    FROM UserResponses
    WHERE UserID = @UserID AND QuestionID = @CurrentQuestionID;

    SELECT @FollowUpQuestionID = FollowUpQuestionID
    FROM ConditionalLogic
    WHERE BaseQuestionID = @CurrentQuestionID AND TriggerAnswerID = @SelectedAnswerID;

    IF @FollowUpQuestionID IS NOT NULL
    BEGIN
        SELECT * FROM Questions WHERE QuestionID = @FollowUpQuestionID;
    END
    ELSE
    BEGIN
        SELECT TOP 1 * FROM Questions
        WHERE QuizID = (SELECT QuizID FROM Questions WHERE QuestionID = @CurrentQuestionID)
          AND QuestionID > @CurrentQuestionID
        ORDER BY QuestionID;
    END
END;

GO
