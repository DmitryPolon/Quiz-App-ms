USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[AssignQuizAllUsers]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 CREATE PROCEDURE [dbo].[AssignQuizAllUsers]
    @QuizID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT;

    DECLARE user_cursor CURSOR FOR
        SELECT UserID FROM Users;

    OPEN user_cursor;
    FETCH NEXT FROM user_cursor INTO @UserID;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC [AssignQuizToUser] @UserID, @QuizID;
        FETCH NEXT FROM user_cursor INTO @UserID;
    END

    CLOSE user_cursor;
    DEALLOCATE user_cursor;
END
GO
