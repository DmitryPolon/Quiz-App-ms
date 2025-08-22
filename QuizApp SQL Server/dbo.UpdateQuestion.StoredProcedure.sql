USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[UpdateQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateQuestion]
    @QuestionID INT,
    @QuestionText NVARCHAR(500),
    @DifficultyID INT,
    @TimeLimitSeconds INT
AS
BEGIN
    UPDATE Questions
    SET QuestionText = @QuestionText,
        DifficultyID = @DifficultyID,
        TimeLimitSeconds = @TimeLimitSeconds
    WHERE QuestionID = @QuestionID;
END;
GO
