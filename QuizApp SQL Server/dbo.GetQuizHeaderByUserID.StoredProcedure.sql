USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetQuizHeaderByUserID]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[GetQuizHeaderByUserID]
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        q.QuizID,
        q.Title,
        q.Description,
        q.CreatedBy,
		r.AssignedOn,
		r.TakenAt,
		r.Score,
		r.ResultID
    FROM
        Results r
        INNER JOIN Quizzes q ON r.QuizID = q.QuizID
    WHERE
        r.UserID = @UserID
END
GO
