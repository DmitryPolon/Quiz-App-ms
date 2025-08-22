USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[_GetUserQuizSummary]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[_GetUserQuizSummary]
    @UserID INT,
    @OnlyIncomplete BIT = 0,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @QuizType NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- CTE: Base quiz info with results
    WITH QuizBase AS (
        SELECT 
            Q.QuizID,
            Q.Title,
            Q.Description,
            Q.TimeLimitMinutes,
            R.Score,
            R.StartTime,
            R.EndTime,
            CASE 
                WHEN R.EndTime IS NULL THEN 'Incomplete'
                ELSE 'Completed'
            END AS Status
        FROM Quizzes Q
        LEFT JOIN Results R ON Q.QuizID = R.QuizID AND R.UserID = @UserID
        WHERE 
            (@OnlyIncomplete = 0 OR R.EndTime IS NULL)
            AND (@StartDate IS NULL OR R.StartTime >= @StartDate)
            AND (@EndDate IS NULL OR R.StartTime <= @EndDate)
            AND (@QuizType IS NULL OR Q.Title LIKE '%' + @QuizType + '%')
    ),
    QuestionStats AS (
        SELECT 
            QuizID,
            COUNT(*) AS TotalQuestions,
            MAX(DL.LevelName) AS MaxDifficulty
        FROM Questions Q
        LEFT JOIN DifficultyLevels DL ON Q.DifficultyID = DL.DifficultyID
        GROUP BY QuizID
    ),
    CategoryStats AS (
        SELECT 
            QT.QuizID,
            STRING_AGG(C.Name, ', ') AS Categories
        FROM QuizTags QT
        JOIN Categories C ON QT.CategoryID = C.CategoryID
        GROUP BY QT.QuizID
    )

    SELECT 
        QB.QuizID,
        QB.Title AS QuizName,
        QB.Description,
        QB.TimeLimitMinutes,
        QS.TotalQuestions,
        ISNULL(QB.Score, 0) AS Score,
        CASE 
            WHEN QS.TotalQuestions = 0 THEN NULL
            ELSE CAST(QB.Score * 100.0 / QS.TotalQuestions AS DECIMAL(5,2))
        END AS PercentageScore,
        DATEDIFF(SECOND, QB.StartTime, QB.EndTime) AS TimeTakenSeconds,
        QB.StartTime,
        QB.EndTime,
        QB.Status,
        ISNULL(CS.Categories, 'Uncategorized') AS Categories,
        QS.MaxDifficulty
    FROM QuizBase QB
    LEFT JOIN QuestionStats QS ON QB.QuizID = QS.QuizID
    LEFT JOIN CategoryStats CS ON QB.QuizID = CS.QuizID;
END;
GO
