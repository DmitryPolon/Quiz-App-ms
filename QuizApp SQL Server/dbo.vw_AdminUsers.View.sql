USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_AdminUsers]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE   VIEW [dbo].[vw_AdminUsers] AS
SELECT 
    U.UserID,
    U.Username,
    U.Email,
    R.RoleName,
    U.CreatedAt
FROM Users U
JOIN Roles R ON U.RoleID = R.RoleID
WHERE R.RoleName = 'Admin';
GO
