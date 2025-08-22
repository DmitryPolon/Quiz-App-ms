USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[UpdateConditionalPath]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateConditionalPath]
    @BaseQuestionID INT,
    @OldTriggerAnswerID INT,
    @OldFollowUpQuestionID INT,
    @NewTriggerAnswerID INT,
    @NewFollowUpQuestionID INT
AS
BEGIN
    -- Check if the original path exists
    IF EXISTS (
        SELECT 1 FROM ConditionalLogic
        WHERE BaseQuestionID = @BaseQuestionID
          AND TriggerAnswerID = @OldTriggerAnswerID
          AND FollowUpQuestionID = @OldFollowUpQuestionID
    )
    BEGIN
        UPDATE ConditionalLogic
        SET TriggerAnswerID = @NewTriggerAnswerID,
            FollowUpQuestionID = @NewFollowUpQuestionID
        WHERE BaseQuestionID = @BaseQuestionID
          AND TriggerAnswerID = @OldTriggerAnswerID
          AND FollowUpQuestionID = @OldFollowUpQuestionID;

        PRINT 'Conditional path updated successfully.';
    END
    ELSE
    BEGIN
        RAISERROR('Conditional path not found.', 16, 1);
    END
END;
GO
