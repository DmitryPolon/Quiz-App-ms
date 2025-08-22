USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[UpdateQuiz]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[UpdateQuiz]
    @QuizID INT,
    @Title NVARCHAR(100),
    @Description NVARCHAR(255),
    @TimeLimitMinutes INT
AS
BEGIN
    UPDATE Quizzes
    SET Title = @Title,
        Description = @Description,
        TimeLimitMinutes = @TimeLimitMinutes
    WHERE QuizID = @QuizID;
END;
GO
