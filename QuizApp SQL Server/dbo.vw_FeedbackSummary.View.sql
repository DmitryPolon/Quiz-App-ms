USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_FeedbackSummary]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [dbo].[vw_FeedbackSummary] AS
SELECT 
    Q.QuizID,
    Q.Title,
    COUNT(F.FeedbackID) AS TotalFeedbacks,
    AVG(F.Rating) AS AverageRating
FROM Quizzes Q
LEFT JOIN Feedback F ON Q.QuizID = F.QuizID
GROUP BY Q.QuizID, Q.Title;
GO
