from django.db import models
from django.conf import settings

class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('professor', 'Professor'),
        ('associate_professor', 'Associate Professor'),
        ('assistant_professor', 'Assistant Professor'),
        ('hod', 'Head of Department'),
        ('dean', 'Dean'),
        ('director', 'Director'),
    )
    
    DEPARTMENT_CHOICES = (
        ('cse', 'Computer Science & Engineering'),
        ('ece', 'Electronics & Communication'),
        ('eee', 'Electrical & Electronics'),
        ('mech', 'Mechanical Engineering'),
        ('civil', 'Civil Engineering'),
        ('it', 'Information Technology'),
        ('mca', 'MCA'),
        ('mba', 'MBA'),
    )
    
    title = models.CharField(max_length=200)
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    specialization = models.CharField(max_length=200)
    
    # Requirements
    qualifications = models.TextField()
    min_experience = models.IntegerField()
    max_experience = models.IntegerField()
    required_skills = models.TextField(help_text="Comma-separated required skills")
    
    # Job Details
    description = models.TextField()
    responsibilities = models.TextField()
    vacancies = models.IntegerField()
    salary_range = models.CharField(max_length=100)
    
    # Dates
    application_start_date = models.DateField()
    application_deadline = models.DateField()
    
    # Status
    is_active = models.BooleanField(default=True)
    is_urgent = models.BooleanField(default=False)
    
    # Metadata
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_job_type_display()} - {self.get_department_display()}"
    
    @property
    def total_applications(self):
        return self.candidates.count()
    
    @property
    def shortlisted_count(self):
        return self.candidates.filter(status='shortlisted').count()