USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[DeleteQuiz]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE   PROCEDURE [dbo].[DeleteQuiz]
    @QuizID INT
AS
BEGIN

	Delete a FROM Answers a 
	    INNER JOIN  Questions q on a.QuestionId = q.QuestionId WHERE QuizID = @QuizID;
	DELETE FROM Questions WHERE QuizID = @QuizID;
	DELETE FROM QuestionSequence WHERE QuizID = @QuizID;
    DELETE FROM Quizzes WHERE QuizID = @QuizID;
END;



GO
