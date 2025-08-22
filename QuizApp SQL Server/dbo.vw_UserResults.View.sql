USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_UserResults]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ========================================
-- View: User Results
-- ========================================
CREATE   VIEW [dbo].[vw_UserResults] AS
SELECT 
    R.ResultID,
    U.Username,
    Q.Title AS QuizTitle,
    R.Score,
    DATEDIFF(SECOND, R.StartTime, R.EndTime) AS TimeTakenSeconds,
    R.TakenAt
FROM Results R
JOIN Users U ON R.UserID = U.UserID
JOIN Quizzes Q ON R.QuizID = Q.QuizID;
GO
