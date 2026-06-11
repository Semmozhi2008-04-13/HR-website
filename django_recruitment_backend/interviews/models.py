from django.db import models
from django.conf import settings
from candidates.models import Candidate
from jobs.models import Job

class InterviewPanel(models.Model):
    name = models.CharField(max_length=200)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='panel_members')
    department = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class Interview(models.Model):
    INTERVIEW_TYPE_CHOICES = (
        ('technical', 'Technical Interview'),
        ('hr', 'HR Interview'),
        ('panel', 'Panel Interview'),
        ('director', 'Director Round'),
    )
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    )
    
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='interviews')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='interviews')
    panel = models.ForeignKey(InterviewPanel, on_delete=models.SET_NULL, null=True)
    interview_type = models.CharField(max_length=50, choices=INTERVIEW_TYPE_CHOICES)
    
    # Schedule Details
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    venue = models.CharField(max_length=200)
    meeting_link = models.URLField(blank=True, help_text="For online interviews")
    
    # Panel & Feedback
    panelists = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='interviews')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='scheduled')
    
    # Scores
    panel_score = models.FloatField(null=True, blank=True)
    panel_feedback = models.TextField(blank=True)
    recommendation = models.CharField(max_length=100, blank=True)
    
    # Notification
    email_sent = models.BooleanField(default=False)
    reminder_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_date']
    
    def __str__(self):
        return f"{self.candidate.full_name} - {self.get_interview_type_display()}"