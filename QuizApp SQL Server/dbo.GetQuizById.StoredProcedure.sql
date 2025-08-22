USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetQuizById]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   PROCEDURE [dbo].[GetQuizById]
    @QuizID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- CTE: Distinct categories for the quiz
    WITH DistinctCategories AS (
        SELECT DISTINCT QT.QuizID, C.Name
        FROM QuizTags QT
        JOIN Categories C ON QT.CategoryID = C.CategoryID
        WHERE QT.QuizID = @QuizID
    )

    -- Quiz Header
    SELECT 
        Q.QuizID,
        Q.Title,
        Q.Description,
        Q.TimeLimitMinutes,
        u.UserID as CreatedBy,
		Q.CreatedAt,
        (
            SELECT STRING_AGG(Name, ', ') 
            FROM DistinctCategories 
            WHERE QuizID = Q.QuizID
        ) AS Categories
    FROM Quizzes Q
    JOIN Users U ON Q.CreatedBy = U.UserID
    WHERE Q.QuizID = @QuizID;

    -- Questions and Answers
    SELECT 
	    QS.SequenceId,
        QS.SequenceNum,
		Q.QuestionID,
        Q.QuestionText,
        Q.TimeLimitSeconds,
		Dl.DifficultyID,
        DL.LevelName AS Difficulty,
        A.AnswerID,
        A.AnswerText,
        A.IsCorrect
    FROM Questions Q
    LEFT JOIN DifficultyLevels DL ON Q.DifficultyID = DL.DifficultyID
    LEFT JOIN Answers A ON Q.QuestionID = A.QuestionID
	LEFT JOIN QuestionSequence QS ON QS.QuestionID = Q.QuestionID
	WHERE Q.QuizID = @QuizID
    ORDER BY QS.SequenceNum;
END;
GO
