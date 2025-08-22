USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetQuestionSequenceById]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- GET QuestionSequence by SequenceId
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetQuestionSequenceById]
    @SequenceId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        SELECT [SequenceId], [SequenceNum], [QuizID]
        FROM [QuestionSequence]
        WHERE [SequenceId] = @SequenceId;
        
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
