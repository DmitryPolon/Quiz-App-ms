USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetAnswersByQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetAnswersByQuestion]
    @QuestionID INT
AS
BEGIN
    SELECT * FROM Answers WHERE QuestionID = @QuestionID;
END;
GO
