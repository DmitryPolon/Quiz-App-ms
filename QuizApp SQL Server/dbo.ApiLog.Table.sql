USE [QuizApp]
GO
/****** Object:  Table [dbo].[ApiLog]    Script Date: 8/21/2025 11:45:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ApiLog](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [nvarchar](128) NULL,
	[Path] [nvarchar](512) NOT NULL,
	[HttpMethod] [nvarchar](16) NOT NULL,
	[InputParameters] [nvarchar](max) NULL,
	[Output] [nvarchar](max) NULL,
	[Timestamp] [datetime] NOT NULL,
	[IsBefore] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[ApiLog] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
