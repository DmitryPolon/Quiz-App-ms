USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[CreateConditionalLogic]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CreateConditionalLogic]
    @BaseQuestionID INT,
    @TriggerAnswerID INT,
    @FollowUpQuestionID INT
AS
BEGIN
    INSERT INTO ConditionalLogic (BaseQuestionID, TriggerAnswerID, FollowUpQuestionID)
    VALUES (@BaseQuestionID, @TriggerAnswerID, @FollowUpQuestionID);
END;
GO
