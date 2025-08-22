USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[VerifyEmail]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[VerifyEmail]
    @UserID INT,
    @Code NVARCHAR(100)
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM Users 
        WHERE UserID = @UserID AND EmailVerificationCode = @Code
    )
    BEGIN
        UPDATE Users
        SET IsEmailVerified = 1,
            EmailVerificationCode = NULL
        WHERE UserID = @UserID;

        PRINT 'Email verified successfully.';
    END
    ELSE
    BEGIN
        RAISERROR('Invalid verification code.', 16, 1);
    END
END;
GO
