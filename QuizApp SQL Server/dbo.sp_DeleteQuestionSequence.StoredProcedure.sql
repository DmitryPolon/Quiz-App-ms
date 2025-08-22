USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteQuestionSequence]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- DELETE QuestionSequence
-- =============================================
CREATE PROCEDURE [dbo].[sp_DeleteQuestionSequence]
    @SequenceId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if the record exists
        IF NOT EXISTS (SELECT 1 FROM [QuestionSequence] WHERE [SequenceId] = @SequenceId)
        BEGIN
            RAISERROR('QuestionSequence with SequenceId %d does not exist.', 16, 1, @SequenceId);
            RETURN -1;
        END
        
        DELETE FROM [QuestionSequence] 
        WHERE [SequenceId] = @SequenceId;
        
        -- Return the number of rows affected
        SELECT @@ROWCOUNT AS RowsAffected;
        
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
