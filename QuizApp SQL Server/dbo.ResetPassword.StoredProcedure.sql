USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[ResetPassword]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ResetPassword]
    @Email NVARCHAR(100),
    @Token NVARCHAR(100),
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM Users 
        WHERE Email = @Email AND PasswordResetToken = @Token
    )
    BEGIN
        UPDATE Users
        SET PasswordHash = @NewPasswordHash,
            PasswordResetToken = NULL
        WHERE Email = @Email;

        PRINT 'Password reset successful.';
    END
    ELSE
    BEGIN
        RAISERROR('Invalid token.', 16, 1);
    END
END;
GO
