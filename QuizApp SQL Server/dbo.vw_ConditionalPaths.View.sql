USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_ConditionalPaths]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ========================================
-- View: Conditional Paths
-- ========================================
CREATE   VIEW [dbo].[vw_ConditionalPaths] AS
SELECT 
    CL.BaseQuestionID,
    BQ.QuestionText AS BaseQuestion,
    CL.TriggerAnswerID,
    TA.AnswerText AS TriggerAnswer,
    CL.FollowUpQuestionID,
    FQ.QuestionText AS FollowUpQuestion
FROM ConditionalLogic CL
JOIN Questions BQ ON CL.BaseQuestionID = BQ.QuestionID
JOIN Answers TA ON CL.TriggerAnswerID = TA.AnswerID
JOIN Questions FQ ON CL.FollowUpQuestionID = FQ.QuestionID;
GO
