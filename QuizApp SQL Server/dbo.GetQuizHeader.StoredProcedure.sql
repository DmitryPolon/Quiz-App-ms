USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetQuizHeader]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetQuizHeader]
    --@UserID INT,
    @QuizID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Optional: Validate user access (e.g., quiz visibility rules)

    SELECT 
        Q.QuizID,
        Q.Title AS QuizName,
        Q.Description,
        Q.TimeLimitMinutes,
        COUNT(Que.QuestionID) AS TotalQuestions
		-- will need to reowrk this logic.
		--,U.Username AS CreatedBy,
        --Q.CreatedAt
    FROM Quizzes Q
   -- JOIN Users U ON Q.CreatedBy = U.UserID
    LEFT JOIN Questions Que ON Q.QuizID = Que.QuizID
    WHERE Q.QuizID = @QuizID
    GROUP BY Q.QuizID, Q.Title, Q.Description, Q.TimeLimitMinutes --, U.Username, Q.CreatedAt;
END;
GO
