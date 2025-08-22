USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[DeleteConditionalPath]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[DeleteConditionalPath]
    @BaseQuestionID INT,
    @TriggerAnswerID INT,
    @FollowUpQuestionID INT
AS
BEGIN
    DELETE FROM ConditionalLogic
    WHERE BaseQuestionID = @BaseQuestionID
      AND TriggerAnswerID = @TriggerAnswerID
      AND FollowUpQuestionID = @FollowUpQuestionID;

    PRINT 'Conditional path deleted successfully.';
END;
GO
