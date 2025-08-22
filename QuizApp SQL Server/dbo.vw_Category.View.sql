USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_Category]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [dbo].[vw_Category] AS
SELECT
    CategoryID,
    Name
FROM
    Categories
GO
