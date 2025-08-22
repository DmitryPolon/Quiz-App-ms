USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[EvaluateQuizScore]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ========================================
-- Evaluate Quiz Score
-- ========================================
CREATE   PROCEDURE [dbo].[EvaluateQuizScore]
    @UserID INT,
    @QuizID INT
AS
BEGIN
    DECLARE @Score INT;

    SELECT @Score = COUNT(*)
    FROM UserResponses UR
    JOIN Answers A ON UR.SelectedAnswerID = A.AnswerID
    JOIN Questions Q ON UR.QuestionID = Q.QuestionID
    WHERE A.IsCorrect = 1 AND UR.UserID = @UserID AND Q.QuizID = @QuizID;

    IF EXISTS (SELECT 1 FROM Results WHERE UserID = @UserID AND QuizID = @QuizID)
    BEGIN
        UPDATE Results
        SET Score = @Score,
            EndTime = GETDATE()
        WHERE UserID = @UserID AND QuizID = @QuizID;
    END
    ELSE
    BEGIN
        INSERT INTO Results (UserID, QuizID, Score, StartTime, EndTime)
        VALUES (@UserID, @QuizID, @Score, GETDATE(), GETDATE());
    END
END;

GO
