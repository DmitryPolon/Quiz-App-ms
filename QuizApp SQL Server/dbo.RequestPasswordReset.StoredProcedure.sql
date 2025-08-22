USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[RequestPasswordReset]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RequestPasswordReset]
    @Email NVARCHAR(100),
    @Token NVARCHAR(100)
AS
BEGIN
    UPDATE Users
    SET PasswordResetToken = @Token,
        TokenGeneratedAt = GETDATE()
    WHERE Email = @Email;
END;
GO
