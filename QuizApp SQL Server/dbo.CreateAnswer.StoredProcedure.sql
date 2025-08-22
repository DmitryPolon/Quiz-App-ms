USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[CreateAnswer]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CreateAnswer]
    @QuestionID INT,
    @AnswerText NVARCHAR(255),
    @IsCorrect BIT
AS
BEGIN
    INSERT INTO Answers (QuestionID, AnswerText, IsCorrect)
    VALUES (@QuestionID, @AnswerText, @IsCorrect);
END;
GO
