USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[AddOrUpdateAnswer]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[AddOrUpdateAnswer]
    @AnswerID INT = NULL,
    @QuestionID INT,
    @AnswerText NVARCHAR(MAX),
    @IsCorrect BIT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewAnswerID INT;

    IF @AnswerID IS NULL
    BEGIN
        INSERT INTO Answers (QuestionID, AnswerText, IsCorrect)
        VALUES (@QuestionID, @AnswerText, @IsCorrect);

        SET @NewAnswerID = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        IF EXISTS (
            SELECT 1 FROM Answers
            WHERE AnswerID = @AnswerID
              AND (ISNULL(AnswerText, '') <> ISNULL(@AnswerText, '')
                   OR ISNULL(IsCorrect, 0) <> ISNULL(@IsCorrect, 0))
        )
        BEGIN
            UPDATE Answers
            SET AnswerText = @AnswerText,
                IsCorrect = @IsCorrect
            WHERE AnswerID = @AnswerID;
        END
        SET @NewAnswerID = @AnswerID;
    END

    SELECT @NewAnswerID AS AnswerID;
END

GO
