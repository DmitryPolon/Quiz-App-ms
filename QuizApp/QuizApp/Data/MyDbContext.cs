using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using QuizApp.Controllers;
using QuizApp.Models;
using QuizApp.UserAppRepositories;
using System;
using System.Collections.Generic;

namespace QuizApp.Models
{
   
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options)
            : base(options)
        {
        }

        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ConditionalLogic> ConditionalLogic { get; set; }
        public DbSet<vw_QuizOverview> vw_QuizOverview { get; set; }
        public DbSet<vw_Category> vw_Category { get; set; }
        public DbSet<QuestionSequence> QuestionSequences { get; set; }
        public DbSet<RetrievesQuizHeaders> RetrievesQuizHeaders { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserResponse> UserResponses { get; set; }
        public DbSet<DifficultyLevel> DifficultyLevels { get; set; }
        public DbSet<ApiLog> ApiLogs { get; set; }
        public DbSet<ErrorLog> ErrorLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().HasKey(u => u.UserId);

            modelBuilder.Entity<LoginUserResult>().HasNoKey();

            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.CreatedByNavigation)
                .WithMany(u => u.Quizzes)
                .HasForeignKey(q => q.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Quiz>()
                .HasMany(q => q.Categories)
                .WithMany(c => c.Quizzes)
                .UsingEntity<Dictionary<string, object>>(
                    "QuizTags",
                    j => j.HasOne<Category>().WithMany().HasForeignKey("CategoryID"),
                    j => j.HasOne<Quiz>().WithMany().HasForeignKey("QuizID")
                );

            modelBuilder.Entity<ConditionalLogic>()
                .HasOne(cl => cl.TriggerAnswer)
                .WithMany()
                .HasForeignKey(cl => cl.TriggerAnswerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConditionalLogic>()
                .HasOne(cl => cl.BaseQuestion)
                .WithMany(q => q.ConditionalLogicBaseQuestions)
                .HasForeignKey(cl => cl.BaseQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConditionalLogic>()
                .HasOne(cl => cl.FollowUpQuestion)
                .WithMany(q => q.ConditionalLogicFollowUpQuestions)
                .HasForeignKey(cl => cl.FollowUpQuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<vw_QuizOverview>()
                .HasKey(v => v.QuizID);
            modelBuilder.Entity<vw_Category>()
                .HasKey(v => v.CategoryID);
            modelBuilder.Entity<RetrievesQuizHeaders>()
                .HasNoKey();
            modelBuilder.Entity<ConditionalLogic>()
                .HasKey(cl => cl.LogicId);

            modelBuilder.Entity<User>()
                .ToTable("Users");
            modelBuilder.Entity<Role>()
                .ToTable("Roles");
            modelBuilder.Entity<UserResponse>()
                .ToTable("UserResponses");
            modelBuilder.Entity<DifficultyLevel>()
                .ToTable("DifficultyLevels");
            modelBuilder.Entity<ApiLog>()
                .ToTable("ApiLog");
            modelBuilder.Entity<ErrorLog>()
                .ToTable("ErrorLog");
        }
    }
}
