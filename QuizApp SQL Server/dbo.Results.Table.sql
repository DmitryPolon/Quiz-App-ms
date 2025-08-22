USE [QuizApp]
GO
/****** Object:  Table [dbo].[Results]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Results](
	[ResultID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NULL,
	[QuizID] [int] NULL,
	[Score] [int] NULL,
	[TakenAt] [datetime] NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[AssignedOn] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[ResultID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Results] ADD  DEFAULT (getdate()) FOR [AssignedOn]
GO
ALTER TABLE [dbo].[Results]  WITH CHECK ADD FOREIGN KEY([QuizID])
REFERENCES [dbo].[Quizzes] ([QuizID])
GO
ALTER TABLE [dbo].[Results]  WITH CHECK ADD FOREIGN KEY([UserID])
REFERENCES [dbo].[Users] ([UserID])
GO
