using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QuizApp.Models;

public partial class QuizAppContext : DbContext
{
    public QuizAppContext(DbContextOptions<QuizAppContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Answer> Answers { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<ConditionalLogic> ConditionalLogics { get; set; }

    public virtual DbSet<DifficultyLevel> DifficultyLevels { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<QuestionSequence> QuestionSequences { get; set; }

    public virtual DbSet<Quiz> Quizzes { get; set; }

    public virtual DbSet<Result> Results { get; set; }

    public virtual DbSet<RetrievesQuizHeader> RetrievesQuizHeaders { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAuditLog> UserAuditLogs { get; set; }

    public virtual DbSet<UserResponse> UserResponses { get; set; }

    public virtual DbSet<VwAdminUser> VwAdminUsers { get; set; }

    public virtual DbSet<VwCategory> VwCategories { get; set; }

    public virtual DbSet<VwConditionalPath> VwConditionalPaths { get; set; }

    public virtual DbSet<VwFeedbackSummary> VwFeedbackSummaries { get; set; }

    public virtual DbSet<VwQuestionDetail> VwQuestionDetails { get; set; }

    public virtual DbSet<VwQuizOverview> VwQuizOverviews { get; set; }

    public virtual DbSet<VwUserResult> VwUserResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Answer>(entity =>
        {
            entity.HasKey(e => e.AnswerId).HasName("PK__Answers__D4825024F9C99945");

            entity.Property(e => e.AnswerId).HasColumnName("AnswerID");
            entity.Property(e => e.AnswerText).HasMaxLength(255);
            entity.Property(e => e.QuestionId).HasColumnName("QuestionID");

            entity.HasOne(d => d.Question).WithMany(p => p.Answers)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("FK__Answers__Questio__300424B4");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2B9B68AF96");

            entity.HasIndex(e => e.Name, "UQ__Categori__737584F6DB9B04A4").IsUnique();

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<ConditionalLogic>(entity =>
        {
            entity.HasKey(e => e.LogicId).HasName("PK__Conditio__4A718C7D4C3EFF1F");

            entity.ToTable("ConditionalLogic");

            entity.Property(e => e.LogicId).HasColumnName("LogicID");
            entity.Property(e => e.BaseQuestionId).HasColumnName("BaseQuestionID");
            entity.Property(e => e.FollowUpQuestionId).HasColumnName("FollowUpQuestionID");
            entity.Property(e => e.TriggerAnswerId).HasColumnName("TriggerAnswerID");

            entity.HasOne(d => d.BaseQuestion).WithMany(p => p.ConditionalLogicBaseQuestions)
                .HasForeignKey(d => d.BaseQuestionId)
                .HasConstraintName("FK__Condition__BaseQ__5535A963");

            entity.HasOne(d => d.FollowUpQuestion).WithMany(p => p.ConditionalLogicFollowUpQuestions)
                .HasForeignKey(d => d.FollowUpQuestionId)
                .HasConstraintName("FK__Condition__Follo__571DF1D5");

            entity.HasOne(d => d.TriggerAnswer).WithMany(p => p.ConditionalLogics)
                .HasForeignKey(d => d.TriggerAnswerId)
                .HasConstraintName("FK__Condition__Trigg__5629CD9C");
        });

        modelBuilder.Entity<DifficultyLevel>(entity =>
        {
            entity.HasKey(e => e.DifficultyId).HasName("PK__Difficul__161A3207BF311E12");

            entity.HasIndex(e => e.LevelName, "UQ__Difficul__9EF3BE7BBA507A3F").IsUnique();

            entity.Property(e => e.DifficultyId).HasColumnName("DifficultyID");
            entity.Property(e => e.LevelName).HasMaxLength(50);
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF6A09625A8");

            entity.ToTable("Feedback");

            entity.Property(e => e.FeedbackId).HasColumnName("FeedbackID");
            entity.Property(e => e.Comment).HasMaxLength(500);
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.SubmittedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Quiz).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__Feedback__QuizID__48CFD27E");

            entity.HasOne(d => d.User).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Feedback__UserID__47DBAE45");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.QuestionId).HasName("PK__Question__0DC06F8CF2B414C4");

            entity.Property(e => e.QuestionId).HasColumnName("QuestionID");
            entity.Property(e => e.DifficultyId).HasColumnName("DifficultyID");
            entity.Property(e => e.QuestionText).HasMaxLength(500);
            entity.Property(e => e.QuizId).HasColumnName("QuizID");

            entity.HasOne(d => d.Difficulty).WithMany(p => p.Questions)
                .HasForeignKey(d => d.DifficultyId)
                .HasConstraintName("FK__Questions__Diffi__44FF419A");

            entity.HasOne(d => d.Quiz).WithMany(p => p.Questions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__Questions__QuizI__2D27B809");
        });

        modelBuilder.Entity<QuestionSequence>(entity =>
        {
            entity.HasKey(e => e.SequenceId);

            entity.ToTable("QuestionSequence");

            entity.Property(e => e.QuestionId).HasColumnName("QuestionID");
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.QuizId).HasName("PK__Quizzes__8B42AE6E4A877635");

            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Title).HasMaxLength(100);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Quizzes)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK__Quizzes__Created__29572725");

            entity.HasMany(d => d.Categories).WithMany(p => p.Quizzes)
                .UsingEntity<Dictionary<string, object>>(
                    "QuizTag",
                    r => r.HasOne<Category>().WithMany()
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__QuizTags__Catego__412EB0B6"),
                    l => l.HasOne<Quiz>().WithMany()
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__QuizTags__QuizID__403A8C7D"),
                    j =>
                    {
                        j.HasKey("QuizId", "CategoryId").HasName("PK__QuizTags__2AD23DCC27B97594");
                        j.ToTable("QuizTags");
                        j.IndexerProperty<int>("QuizId").HasColumnName("QuizID");
                        j.IndexerProperty<int>("CategoryId").HasColumnName("CategoryID");
                    });
        });

        modelBuilder.Entity<Result>(entity =>
        {
            entity.HasKey(e => e.ResultId).HasName("PK__Results__97690228DCA1C2A6");

            entity.Property(e => e.ResultId).HasColumnName("ResultID");
            entity.Property(e => e.AssignedOn)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.TakenAt).HasColumnType("datetime");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Quiz).WithMany(p => p.Results)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__Results__QuizID__398D8EEE");

            entity.HasOne(d => d.User).WithMany(p => p.Results)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Results__UserID__38996AB5");
        });

        modelBuilder.Entity<RetrievesQuizHeader>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("RetrievesQuizHeaders");

            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.QuizName).HasMaxLength(100);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A9E0361FE");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B6160BFE1773B").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.RoleName).HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CCAC650458DC");

            entity.ToTable(tb => tb.HasTrigger("trg_AfterInsertUser"));

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E4DB6895D7").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534C18B905E").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.EmailVerificationCode).HasMaxLength(100);
            entity.Property(e => e.IsEmailVerified).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.PasswordResetToken).HasMaxLength(100);
            entity.Property(e => e.RoleId)
                .HasDefaultValue(2)
                .HasColumnName("RoleID");
            entity.Property(e => e.TokenGeneratedAt).HasColumnType("datetime");
            entity.Property(e => e.Username).HasMaxLength(50);
            entity.Property(e => e.VerificationSentAt).HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__Users__RoleID__5EBF139D");
        });

        modelBuilder.Entity<UserAuditLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__UserAudi__5E5499A8A3ED3C1D");

            entity.ToTable("UserAuditLog");

            entity.Property(e => e.LogId).HasColumnName("LogID");
            entity.Property(e => e.Action).HasMaxLength(50);
            entity.Property(e => e.Details).HasMaxLength(255);
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        modelBuilder.Entity<UserResponse>(entity =>
        {
            entity.HasKey(e => e.ResponseId).HasName("PK__UserResp__1AAA640C5AB3C6B3");

            entity.Property(e => e.ResponseId).HasColumnName("ResponseID");
            entity.Property(e => e.AnswerText).HasMaxLength(500);
            entity.Property(e => e.QuestionId).HasColumnName("QuestionID");
            entity.Property(e => e.QuestionText).HasMaxLength(500);
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.ResponseDateTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ResultId).HasColumnName("ResultID");
            entity.Property(e => e.SelectedAnswerId).HasColumnName("SelectedAnswerID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Question).WithMany(p => p.UserResponses)
                .HasForeignKey(d => d.QuestionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserResponses_QuestionID");

            entity.HasOne(d => d.User).WithMany(p => p.UserResponses)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserResponses_UserID");
        });

        modelBuilder.Entity<VwAdminUser>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_AdminUsers");

            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.RoleName).HasMaxLength(50);
            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        modelBuilder.Entity<VwCategory>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_Category");

            entity.Property(e => e.CategoryId)
                .ValueGeneratedOnAdd()
                .HasColumnName("CategoryID");
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<VwConditionalPath>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_ConditionalPaths");

            entity.Property(e => e.BaseQuestion).HasMaxLength(500);
            entity.Property(e => e.BaseQuestionId).HasColumnName("BaseQuestionID");
            entity.Property(e => e.FollowUpQuestion).HasMaxLength(500);
            entity.Property(e => e.FollowUpQuestionId).HasColumnName("FollowUpQuestionID");
            entity.Property(e => e.TriggerAnswer).HasMaxLength(255);
            entity.Property(e => e.TriggerAnswerId).HasColumnName("TriggerAnswerID");
        });

        modelBuilder.Entity<VwFeedbackSummary>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_FeedbackSummary");

            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.Title).HasMaxLength(100);
        });

        modelBuilder.Entity<VwQuestionDetail>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_QuestionDetails");

            entity.Property(e => e.CorrectAnswer).HasMaxLength(255);
            entity.Property(e => e.Difficulty).HasMaxLength(50);
            entity.Property(e => e.QuestionId).HasColumnName("QuestionID");
            entity.Property(e => e.QuestionText).HasMaxLength(500);
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
        });

        modelBuilder.Entity<VwQuizOverview>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_QuizOverview");

            entity.Property(e => e.Categories).HasMaxLength(4000);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.CreatedBy).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.QuizId).HasColumnName("QuizID");
            entity.Property(e => e.Title).HasMaxLength(100);
        });

        modelBuilder.Entity<VwUserResult>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_UserResults");

            entity.Property(e => e.QuizTitle).HasMaxLength(100);
            entity.Property(e => e.ResultId).HasColumnName("ResultID");
            entity.Property(e => e.TakenAt).HasColumnType("datetime");
            entity.Property(e => e.Username).HasMaxLength(50);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
