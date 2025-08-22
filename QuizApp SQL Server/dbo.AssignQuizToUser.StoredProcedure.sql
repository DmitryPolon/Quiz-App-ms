USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[AssignQuizToUser]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[AssignQuizToUser]
    @UserID INT,
    @QuizID INT
AS
BEGIN
    INSERT INTO Results (UserID, QuizID, AssignedOn)
    VALUES (@UserID, @QuizID, GETDATE());
END;

GO
