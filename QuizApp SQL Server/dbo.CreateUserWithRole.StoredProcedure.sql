USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[CreateUserWithRole]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CreateUserWithRole]
    @Username NVARCHAR(50),
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @RoleName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RoleID INT;

    -- Get RoleID from RoleName
    SELECT @RoleID = RoleID FROM Roles WHERE RoleName = @RoleName;

    IF @RoleID IS NULL
    BEGIN
        RAISERROR('Invalid role name.', 16, 1);
        RETURN;
    END

    -- Check for duplicate username or email
    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username OR Email = @Email)
    BEGIN
        RAISERROR('Username or email already exists.', 16, 1);
        RETURN;
    END

    -- Insert new user
    INSERT INTO Users (Username, Email, PasswordHash, RoleID)
    VALUES (@Username, @Email, @PasswordHash, @RoleID);

    PRINT 'User created successfully with role: ' + @RoleName;
END;
GO
