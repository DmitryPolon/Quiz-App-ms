USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[UpdateQuestionSequence]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[UpdateQuestionSequence]
    @SequenceId INT,
    @SequenceNum INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE QuestionSequence
    SET SequenceNum = @SequenceNum
    WHERE SequenceId = @SequenceId;
END
GO
