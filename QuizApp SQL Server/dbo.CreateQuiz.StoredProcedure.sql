USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[CreateQuiz]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[CreateQuiz]
    @Title NVARCHAR(100),
    @Description NVARCHAR(255),
    @CreatedBy INT,
    @TimeLimitMinutes INT = NULL,
    @QuizID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Optional: Validate admin role
    IF NOT EXISTS (
        SELECT 1 FROM Users WHERE UserID = @CreatedBy AND RoleID = 1
    )
    BEGIN
        RAISERROR('Only admins can create quizzes.', 16, 1);
        RETURN;
    END

    -- Insert quiz
    INSERT INTO Quizzes (Title, Description, CreatedBy, TimeLimitMinutes)
    VALUES (@Title, @Description, @CreatedBy, @TimeLimitMinutes);

    -- Return the new QuizID
    SET @QuizID = SCOPE_IDENTITY();
END;



GO
