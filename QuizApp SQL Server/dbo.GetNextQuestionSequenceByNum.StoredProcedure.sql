USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetNextQuestionSequenceByNum]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE  PROCEDURE [dbo].[GetNextQuestionSequenceByNum]
    @QuizID INT,
    @SequenceNum INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
       SELECT [SequenceNum], [SequenceID], q.*, a.*
        FROM [QuestionSequence] qs inner join Questions q
		  on qs.[QuestionID] =q.[QuestionID]
		  inner join [Answers] a 
		   on q.QuestionID = a.QuestionID
        WHERE qs.SequenceNum = @SequenceNum and qs.[QuizID] = @QuizID;
        RETURN 0; -- Success
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
        RETURN -1; -- Error
    END CATCH
END
GO
