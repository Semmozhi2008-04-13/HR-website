from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from candidates.models import Candidate
from jobs.models import Job
from .services import ats_matcher
from .serializers import CandidateRankingSerializer

class AIMatchingViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def rank_candidates(self, request):
        """Rank candidates for a specific job using AI"""
        job_id = request.data.get('job_id')
        
        try:
            job = Job.objects.get(id=job_id)
            candidates = Candidate.objects.filter(
                applied_for=job,
                status__in=['applied', 'ai_reviewed']
            )
            
            if not candidates.exists():
                return Response({
                    'error': 'No candidates found for this job'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Run AI matching
            ranked_candidates = ats_matcher.rank_candidates(candidates, job)
            
            # Prepare response
            results = []
            for item in ranked_candidates[:50]:  # Top 50 candidates
                candidate = item['candidate']
                results.append({
                    'candidate_id': candidate.id,
                    'name': candidate.full_name,
                    'ai_score': round(item['score'], 2),
                    'skills_match': round(item['analysis']['skills_match'], 2),
                    'experience_match': round(item['analysis']['experience_match'], 2),
                    'education_match': round(item['analysis']['education_match'], 2),
                    'research_score': round(item['analysis']['research_score'], 2),
                    'matched_skills': item['analysis']['matched_skills'],
                    'missing_skills': item['analysis']['missing_skills'],
                    'recommendation': item['analysis']['recommendation'],
                    'status': candidate.status
                })
            
            return Response({
                'job_title': job.title,
                'total_candidates': len(results),
                'ranked_candidates': results
            })
            
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def auto_shortlist(self, request):
        """Automatically shortlist candidates based on AI score threshold"""
        job_id = request.data.get('job_id')
        threshold = request.data.get('threshold', 75)  # Default 75%
        
        try:
            job = Job.objects.get(id=job_id)
            
            # First rank all candidates
            candidates = Candidate.objects.filter(applied_for=job, status='applied')
            ranked_candidates = ats_matcher.rank_candidates(candidates, job)
            
            # Shortlist candidates above threshold
            shortlisted = []
            for item in ranked_candidates:
                if item['score'] >= threshold:
                    candidate = item['candidate']
                    candidate.status = 'shortlisted'
                    candidate.save()
                    shortlisted.append({
                        'candidate_id': candidate.id,
                        'name': candidate.full_name,
                        'score': item['score']
                    })
            
            return Response({
                'job_id': job_id,
                'threshold': threshold,
                'shortlisted_count': len(shortlisted),
                'shortlisted_candidates': shortlisted
            })
            
        except Job.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)