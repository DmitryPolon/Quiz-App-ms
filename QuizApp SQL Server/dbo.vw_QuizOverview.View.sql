USE [QuizApp]
GO
/****** Object:  View [dbo].[vw_QuizOverview]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ========================================
-- View: Quiz Overview
-- ========================================
CREATE   VIEW [dbo].[vw_QuizOverview] AS
SELECT 
    Q.QuizID,
    Q.Title,
    Q.Description,
    U.Username AS CreatedBy,
    Q.TimeLimitMinutes,
    Q.CreatedAt,
    STRING_AGG(C.Name, ', ') AS Categories
FROM Quizzes Q
JOIN Users U ON Q.CreatedBy = U.UserID
LEFT JOIN QuizTags QT ON Q.QuizID = QT.QuizID
LEFT JOIN Categories C ON QT.CategoryID = C.CategoryID
GROUP BY Q.QuizID, Q.Title, Q.Description, U.Username, Q.TimeLimitMinutes, Q.CreatedAt;

GO
