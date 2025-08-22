USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_QuestionDetails]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ========================================
-- View: Question Details
-- ========================================
CREATE   VIEW [dbo].[vw_QuestionDetails] AS
SELECT 
    Q.QuestionID,
    Q.QuestionText,
    Q.QuizID,
    Q.TimeLimitSeconds,
    DL.LevelName AS Difficulty,
    A.AnswerText AS CorrectAnswer
FROM Questions Q
LEFT JOIN DifficultyLevels DL ON Q.DifficultyID = DL.DifficultyID
JOIN Answers A ON Q.QuestionID = A.QuestionID AND A.IsCorrect = 1;
GO
