from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Candidate(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('ai_reviewed', 'AI Reviewed'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interviewed', 'Interviewed'),
        ('evaluated', 'Evaluated'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
        ('offered', 'Offered'),
        ('joined', 'Joined'),
    )
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    
    # Professional Information
    highest_qualification = models.CharField(max_length=200)
    specialization = models.CharField(max_length=200)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1)
    current_organization = models.CharField(max_length=200, blank=True)
    current_designation = models.CharField(max_length=200, blank=True)
    
    # Skills & Research
    skills = models.TextField(help_text="Comma-separated skills")
    publications = models.IntegerField(default=0)
    research_papers = models.TextField(blank=True, help_text="List of research papers")
    patents = models.IntegerField(default=0)
    google_scholar_link = models.URLField(blank=True)
    linkedin_profile = models.URLField(blank=True)
    
    # Documents
    resume = models.FileField(upload_to='candidates/resumes/')
    profile_picture = models.ImageField(upload_to='candidates/photos/', null=True, blank=True)
    cover_letter = models.TextField(blank=True)
    
    # AI Scores
    ai_ats_score = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    skills_match_score = models.FloatField(default=0)
    experience_match_score = models.FloatField(default=0)
    education_match_score = models.FloatField(default=0)
    research_score = models.FloatField(default=0)
    
    # Additional AI Analysis
    ai_analysis = models.JSONField(default=dict, blank=True)
    strength_weakness = models.JSONField(default=dict, blank=True)
    recommendations = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='applied')
    applied_for = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, related_name='candidates')
    applied_date = models.DateTimeField(auto_now_add=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-ai_ats_score', '-applied_date']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.ai_ats_score}%"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"