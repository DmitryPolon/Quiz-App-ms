USE [QuizApp]
GO
/****** Object:  UserDefinedTableType [dbo].[QuestionSequenceTableType]    Script Date: 8/21/2025 11:45:19 PM ******/
CREATE TYPE [dbo].[QuestionSequenceTableType] AS TABLE(
	[SequenceNum] [int] NOT NULL,
	[QuizID] [int] NOT NULL
)
GO
