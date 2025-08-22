USE [QuizApp]
GO
/****** Object:  StoredProcedure [dbo].[GetConditionalPathsByQuestion]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[GetConditionalPathsByQuestion]
    @BaseQuestionID INT
AS
BEGIN
    SELECT * FROM ConditionalLogic WHERE BaseQuestionID = @BaseQuestionID;
END;
GO
