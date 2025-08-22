USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[CreateCategory]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CreateCategory]
    @Name NVARCHAR(100)
AS
BEGIN
    INSERT INTO Categories (Name) VALUES (@Name);
END;
GO
