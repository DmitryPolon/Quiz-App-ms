USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[UpdateAnswer]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateAnswer]
    @AnswerID INT,
    @AnswerText NVARCHAR(255),
    @IsCorrect BIT
AS
BEGIN
    UPDATE Answers
    SET AnswerText = @AnswerText,
        IsCorrect = @IsCorrect
    WHERE AnswerID = @AnswerID;
END;
GO
