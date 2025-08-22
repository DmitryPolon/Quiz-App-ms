USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[DeleteQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[DeleteQuestion]
    @QuestionID INT
AS
BEGIN
  
	
	DELETE FROM QuestionSequence WHERE QuestionID = @QuestionID;
	DELETE FROM Answers WHERE QuestionID = @QuestionID;   
    DELETE FROM Questions WHERE QuestionID = @QuestionID;
END;
GO
