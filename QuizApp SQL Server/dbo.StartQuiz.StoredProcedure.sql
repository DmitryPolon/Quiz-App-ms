USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[StartQuiz]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[StartQuiz]
    @ResultID INT
AS
BEGIN
    UPDATE Results
    SET StartTime = GETDATE(),
	    TakenAt = GETDATE()
    WHERE ResultID = @ResultID;
END;

GO
