USE [QuizApp]
GO
/****** Object:  View [dbo].[RetrievesQuizHeaders]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[RetrievesQuizHeaders] AS
--- Will need to rework this logic to have a QuizCompleted flag

WITH QuestionAnswerCounts AS (
    SELECT
        Que.QuestionID,
        Que.QuizID,
        COUNT(Ans.AnswerID) AS AnswerCount
    FROM
        Questions Que
        INNER JOIN Answers Ans ON Que.QuestionID = Ans.QuestionID
    GROUP BY
        Que.QuestionID,
        Que.QuizID
)
SELECT
    Q.QuizID,
    Q.Title AS QuizName,
    Q.Description,
    Q.TimeLimitMinutes,
    COUNT(DISTINCT Que.QuestionID) AS TotalQuestions
FROM
    Quizzes Q
    INNER JOIN Questions Que ON Q.QuizID = Que.QuizID
WHERE
    Q.QuizID IN (
        SELECT QuizID
        FROM QuestionAnswerCounts
        GROUP BY QuizID
        HAVING MIN(AnswerCount) >= 2
    )
GROUP BY
    Q.QuizID,
    Q.Title,
    Q.Description,
    Q.TimeLimitMinutes;
GO
