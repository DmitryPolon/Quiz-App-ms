USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[SubmitQuiz]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SubmitQuiz]
    @ResultID INT
    
AS
BEGIN
    UPDATE Results
    SET EndTime = GETDATE()
    WHERE ResultID = @ResultID 

    -- calculate total time
    DECLARE @Duration INT;
    SELECT @Duration = DATEDIFF(SECOND, StartTime, EndTime)
    FROM Results
    WHERE ResultID = @ResultID;

    PRINT 'Total time taken: ' + CAST(@Duration AS NVARCHAR) + ' seconds';
END;
GO
