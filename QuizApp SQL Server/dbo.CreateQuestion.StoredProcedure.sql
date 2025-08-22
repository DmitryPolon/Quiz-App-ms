USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[CreateQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CreateQuestion]
    @QuizID INT,
    @QuestionText NVARCHAR(500),
    @DifficultyID INT,
    @TimeLimitSeconds INT
AS
BEGIN
    INSERT INTO Questions (QuizID, QuestionText, DifficultyID, TimeLimitSeconds)
    VALUES (@QuizID, @QuestionText, @DifficultyID, @TimeLimitSeconds);
END;

GO
