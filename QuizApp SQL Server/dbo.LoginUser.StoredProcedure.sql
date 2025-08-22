USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[LoginUser]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[LoginUser]
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF EXISTS (
            SELECT 1 FROM Users
            WHERE Username = @Username AND PasswordHash = @PasswordHash
        )
        BEGIN
            SELECT 
                UserID,
                Username,
                Email,
                u.RoleID,
                RoleName,
                CreatedAt
            FROM Users u LEFT JOIN Roles r on u.RoleID = r.RoleID
            WHERE Username = @Username;
        END
        ELSE
        BEGIN
            -- Return a result set indicating failure
            SELECT 
                CAST(NULL AS INT) AS UserID,
                CAST(NULL AS NVARCHAR(50)) AS Username,
                CAST(NULL AS NVARCHAR(255)) AS Email,
                CAST(NULL AS INT) AS RoleID,
                CAST('Login failed' AS NVARCHAR(50)) AS RoleName,
                CAST(NULL AS DATETIME) AS CreatedAt;
        END
    END TRY
    BEGIN CATCH
        -- Optionally, log error or return a generic failure
        SELECT 
            CAST(NULL AS INT) AS UserID,
            CAST(NULL AS NVARCHAR(50)) AS Username,
            CAST(NULL AS NVARCHAR(255)) AS Email,
            CAST(NULL AS INT) AS RoleID,
            CAST('Login failed' AS NVARCHAR(50)) AS RoleName,
            CAST(NULL AS DATETIME) AS CreatedAt;
    END CATCH
END;

GO
