USE [QuizApp]
GO
/****** Object:  Table [dbo].[ConditionalLogic]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ConditionalLogic](
	[LogicID] [int] IDENTITY(1,1) NOT NULL,
	[BaseQuestionID] [int] NULL,
	[TriggerAnswerID] [int] NULL,
	[FollowUpQuestionID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[LogicID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ConditionalLogic]  WITH CHECK ADD FOREIGN KEY([BaseQuestionID])
REFERENCES [dbo].[Questions] ([QuestionID])
GO
ALTER TABLE [dbo].[ConditionalLogic]  WITH CHECK ADD FOREIGN KEY([FollowUpQuestionID])
REFERENCES [dbo].[Questions] ([QuestionID])
GO
ALTER TABLE [dbo].[ConditionalLogic]  WITH CHECK ADD FOREIGN KEY([TriggerAnswerID])
REFERENCES [dbo].[Answers] ([AnswerID])
GO
