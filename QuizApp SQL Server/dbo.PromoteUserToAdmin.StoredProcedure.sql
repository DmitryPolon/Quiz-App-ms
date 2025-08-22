USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[PromoteUserToAdmin]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[PromoteUserToAdmin]
    @UserID INT
AS
BEGIN
    UPDATE Users
    SET RoleID = (SELECT RoleID FROM Roles WHERE RoleName = 'Admin')
    WHERE UserID = @UserID;
END;
GO
