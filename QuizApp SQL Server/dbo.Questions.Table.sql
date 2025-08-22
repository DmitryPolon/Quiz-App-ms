USE [QuizApp]
GO
/****** Object:  Table [dbo].[Questions]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Questions](
	[QuestionID] [int] IDENTITY(1,1) NOT NULL,
	[QuizID] [int] NULL,
	[QuestionText] [nvarchar](500) NOT NULL,
	[DifficultyID] [int] NULL,
	[TimeLimitSeconds] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[QuestionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD FOREIGN KEY([DifficultyID])
REFERENCES [dbo].[DifficultyLevels] ([DifficultyID])
GO
ALTER TABLE [dbo].[Questions]  WITH CHECK ADD FOREIGN KEY([QuizID])
REFERENCES [dbo].[Quizzes] ([QuizID])
GO
