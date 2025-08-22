USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[sp_BulkInsertQuestionSequences]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- BULK INSERT QuestionSequences
-- =============================================
CREATE PROCEDURE [dbo].[sp_BulkInsertQuestionSequences]
    @QuestionSequences AS [dbo].[QuestionSequenceTableType] READONLY
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO [QuestionSequence] ([SequenceNum], [QuizID])
        SELECT [SequenceNum], [QuizID]
        FROM @QuestionSequences;
        
        -- Return the number of rows inserted
        SELECT @@ROWCOUNT AS RowsInserted;
        
        COMMIT TRANSACTION;
        
        RETURN 0; -- Success
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
        RETURN -1; -- Error
    END CATCH
END
GO
