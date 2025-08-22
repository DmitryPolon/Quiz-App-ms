USE [QuizApp]
GO

/****** Object:  Trigger [dbo].[trg_AfterInsertUser]    Script Date: 8/21/2025 11:57:36 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TRIGGER [dbo].[trg_AfterInsertUser]
ON [dbo].[Users]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT;
    SELECT @UserID = UserID FROM inserted;

    EXEC [AssignQuizToUser] @UserID, 1022;
    EXEC [AssignQuizToUser] @UserID, 1024;
END
GO

ALTER TABLE [dbo].[Users] ENABLE TRIGGER [trg_AfterInsertUser]
GO


