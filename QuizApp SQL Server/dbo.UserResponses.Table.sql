USE [QuizApp]
GO
/****** Object:  Table [dbo].[UserResponses]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserResponses](
	[ResponseID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[QuizID] [int] NOT NULL,
	[QuestionID] [int] NOT NULL,
	[QuestionText] [nvarchar](500) NOT NULL,
	[SelectedAnswerID] [int] NULL,
	[AnswerText] [nvarchar](500) NULL,
	[IsCorrect] [bit] NULL,
	[TimeTakenSeconds] [int] NULL,
	[ResponseDateTime] [datetime] NOT NULL,
	[AnswerTimedOut] [bit] NOT NULL,
	[ResultID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ResponseID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[UserResponses] ADD  DEFAULT (getdate()) FOR [ResponseDateTime]
GO
ALTER TABLE [dbo].[UserResponses] ADD  DEFAULT ((0)) FOR [AnswerTimedOut]
GO
ALTER TABLE [dbo].[UserResponses]  WITH CHECK ADD  CONSTRAINT [FK_UserResponses_QuestionID] FOREIGN KEY([QuestionID])
REFERENCES [dbo].[Questions] ([QuestionID])
GO
ALTER TABLE [dbo].[UserResponses] CHECK CONSTRAINT [FK_UserResponses_QuestionID]
GO
ALTER TABLE [dbo].[UserResponses]  WITH CHECK ADD  CONSTRAINT [FK_UserResponses_UserID] FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[UserResponses] CHECK CONSTRAINT [FK_UserResponses_UserID]
GO
