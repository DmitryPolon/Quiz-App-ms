USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[TagQuizWithCategory]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[TagQuizWithCategory]
    @QuizID INT,
    @CategoryID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM QuizTags WHERE QuizID = @QuizID)
    BEGIN
        UPDATE QuizTags
        SET CategoryID = @CategoryID
        WHERE QuizID = @QuizID;
    END
    ELSE
    BEGIN
        INSERT INTO QuizTags (QuizID, CategoryID)
        VALUES (@QuizID, @CategoryID);
    END
END;
GO
