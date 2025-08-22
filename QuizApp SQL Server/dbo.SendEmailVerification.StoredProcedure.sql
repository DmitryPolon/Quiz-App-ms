USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[SendEmailVerification]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[SendEmailVerification]
    @UserID INT,
    @VerificationCode NVARCHAR(100)
AS
BEGIN
    UPDATE Users
    SET EmailVerificationCode = @VerificationCode,
        VerificationSentAt = GETDATE()
    WHERE UserID = @UserID;
END;
GO
