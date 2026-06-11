from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
from .models import Interview, InterviewPanel

class InterviewScheduler:
    def __init__(self):
        self.working_hours_start = 9  # 9 AM
        self.working_hours_end = 17   # 5 PM
        
    def find_available_slots(self, panel_id, start_date, days_ahead=7):
        """Find available interview slots for a panel"""
        available_slots = []
        current_date = start_date
        
        for _ in range(days_ahead):
            # Skip weekends
            if current_date.weekday() >= 5:  # Saturday=5, Sunday=6
                current_date += timedelta(days=1)
                continue
            
            # Check each hour in working hours
            for hour in range(self.working_hours_start, self.working_hours_end):
                slot_time = current_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # Check if panel is available at this slot
                existing_interviews = Interview.objects.filter(
                    panel__id=panel_id,
                    scheduled_date=slot_time,
                    status__in=['scheduled', 'ongoing']
                )
                
                if not existing_interviews.exists():
                    available_slots.append(slot_time)
            
            current_date += timedelta(days=1)
        
        return available_slots
    
    def auto_schedule_interviews(self, candidate_ids, job_id, interview_type):
        """Automatically schedule interviews for shortlisted candidates"""
        from candidates.models import Candidate
        from jobs.models import Job
        
        scheduled_interviews = []
        
        # Get candidates
        candidates = Candidate.objects.filter(id__in=candidate_ids, status='shortlisted')
        job = Job.objects.get(id=job_id)
        
        # Find available panel
        panel = InterviewPanel.objects.filter(department=job.department, is_active=True).first()
        
        if not panel:
            return {'error': 'No interview panel available'}
        
        # Schedule each candidate
        current_datetime = datetime.now()
        slot_index = 0
        
        for candidate in candidates:
            # Find next available slot
            available_slots = self.find_available_slots(panel.id, current_datetime)
            
            if slot_index < len(available_slots):
                interview = Interview.objects.create(
                    candidate=candidate,
                    job=job,
                    panel=panel,
                    interview_type=interview_type,
                    scheduled_date=available_slots[slot_index],
                    duration_minutes=60,
                    venue=f"Meeting Room - {100 + slot_index}"
                )
                
                # Add panel members
                for member in panel.members.all():
                    interview.panelists.add(member)
                
                scheduled_interviews.append({
                    'candidate': candidate.full_name,
                    'email': candidate.email,
                    'date': interview.scheduled_date,
                    'venue': interview.venue
                })
                
                slot_index += 1
                candidate.status = 'interview_scheduled'
                candidate.save()
        
        return {
            'scheduled_count': len(scheduled_interviews),
            'interviews': scheduled_interviews
        }