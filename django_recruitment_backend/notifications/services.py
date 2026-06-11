from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os

class EmailService:
    
    @staticmethod
    def send_interview_schedule(candidate_email, candidate_name, interview_details):
        """Send interview schedule email to candidate"""
        subject = f"Interview Schedule - {interview_details['job_title']} at Chennai Institute of Technology"
        
        html_content = render_to_string('emails/interview_schedule.html', {
            'candidate_name': candidate_name,
            'date': interview_details['date'],
            'time': interview_details['time'],
            'venue': interview_details['venue'],
            'interview_type': interview_details['type'],
            'panel_members': interview_details['panel_members']
        })
        
        send_mail(
            subject,
            '',
            settings.EMAIL_HOST_USER,
            [candidate_email],
            html_message=html_content,
            fail_silently=False,
        )
    
    @staticmethod
    def send_offer_letter(candidate_email, candidate_name, offer_details):
        """Send offer letter with attachment"""
        subject = f"Offer Letter - {offer_details['position']} at Chennai Institute of Technology"
        
        # Generate PDF offer letter
        pdf_path = OfferLetterGenerator.generate_offer_letter_pdf(candidate_name, offer_details)
        
        email = EmailMessage(
            subject,
            render_to_string('emails/offer_letter.html', {
                'candidate_name': candidate_name,
                'position': offer_details['position'],
                'department': offer_details['department'],
                'ctc': offer_details['ctc'],
                'joining_date': offer_details['joining_date']
            }),
            settings.EMAIL_HOST_USER,
            [candidate_email]
        )
        
        email.attach_file(pdf_path)
        email.send()
        
        # Clean up temp file
        os.remove(pdf_path)
    
    @staticmethod
    def send_selection_notification(candidate_email, candidate_name, next_round):
        """Send selection notification for next round"""
        subject = f"Update on Your Application - {next_round['round_name']}"
        
        send_mail(
            subject,
            render_to_string('emails/selection_update.html', {
                'candidate_name': candidate_name,
                'next_round': next_round['round_name'],
                'date': next_round['date'],
                'instructions': next_round['instructions']
            }),
            settings.EMAIL_HOST_USER,
            [candidate_email],
            fail_silently=False,
        )

class OfferLetterGenerator:
    
    @staticmethod
    def generate_offer_letter_pdf(candidate_name, offer_details):
        """Generate PDF offer letter"""
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import inch
        import tempfile
        
        # Create temporary PDF file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        
        c = canvas.Canvas(temp_file.name, pagesize=letter)
        width, height = letter
        
        # Add content (simplified - you can expand)
        y = height - 100
        
        # Header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, y, "CHENNAI INSTITUTE OF TECHNOLOGY")
        y -= 30
        
        c.setFont("Helvetica-Bold", 14)
        c.drawString(100, y, "OFFER OF APPOINTMENT")
        y -= 50
        
        # Body
        c.setFont("Helvetica", 12)
        c.drawString(100, y, f"Date: {offer_details['date']}")
        y -= 30
        c.drawString(100, y, f"To: {candidate_name}")
        y -= 30
        c.drawString(100, y, f"Subject: Offer of Appointment as {offer_details['position']}")
        y -= 50
        
        # Offer details
        c.drawString(100, y, f"We are pleased to offer you the position of {offer_details['position']}")
        y -= 20
        c.drawString(100, y, f"in the Department of {offer_details['department']}.")
        y -= 30
        c.drawString(100, y, f"Annual CTC: {offer_details['ctc']}")
        y -= 20
        c.drawString(100, y, f"Expected Joining Date: {offer_details['joining_date']}")
        y -= 50
        
        c.drawString(100, y, "We look forward to your positive response.")
        
        c.save()
        
        return temp_file.name