import re
import nltk
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestRegressor
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import json
from django.core.files.storage import default_storage
from PyPDF2 import PdfReader
from docx import Document

# Download NLTK data
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

class ATSMatcher:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        self.vectorizer = TfidfVectorizer(max_features=1000)
        
    def extract_text_from_resume(self, resume_file):
        """Extract text from PDF or DOCX resume"""
        text = ""
        file_path = resume_file.path
        
        if resume_file.name.endswith('.pdf'):
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text()
        elif resume_file.name.endswith('.docx'):
            doc = Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        
        return text.lower()
    
    def preprocess_text(self, text):
        """Clean and preprocess text"""
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Tokenize
        tokens = text.split()
        # Remove stopwords and lemmatize
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens 
                 if token not in self.stop_words]
        return ' '.join(tokens)
    
    def extract_skills(self, text, job_skills):
        """Extract skills from resume and calculate match"""
        found_skills = []
        for skill in job_skills:
            if skill.lower() in text:
                found_skills.append(skill)
        
        match_percentage = (len(found_skills) / len(job_skills)) * 100 if job_skills else 0
        return match_percentage, found_skills
    
    def calculate_experience_match(self, candidate_exp, min_exp, max_exp):
        """Calculate experience match score"""
        if candidate_exp < min_exp:
            return max(0, (candidate_exp / min_exp) * 50)
        elif candidate_exp > max_exp:
            return 90
        else:
            # Perfect match within range
            return 100
    
    def calculate_education_match(self, candidate_qualification, job_qualifications):
        """Calculate education qualification match"""
        # Define qualification hierarchy
        qual_hierarchy = {
            'phd': 100,
            'mtech': 85,
            'm.e': 85,
            'msc': 80,
            'btech': 70,
            'b.e': 70,
        }
        
        candidate_qual = candidate_qualification.lower()
        highest_score = 0
        
        for qual, score in qual_hierarchy.items():
            if qual in candidate_qual:
                highest_score = max(highest_score, score)
        
        return highest_score
    
    def calculate_research_score(self, publications, patents, research_papers):
        """Calculate research contribution score"""
        paper_score = min(publications * 5, 50)
        patent_score = min(patents * 10, 30)
        research_text_score = min(len(research_papers) / 100, 20)
        
        return paper_score + patent_score + research_text_score
    
    def calculate_ats_score(self, candidate, job):
        """Complete ATS scoring algorithm"""
        # Extract resume text
        resume_text = self.extract_text_from_resume(candidate.resume)
        processed_text = self.preprocess_text(resume_text)
        
        # Parse job requirements
        job_skills = [s.strip().lower() for s in job.required_skills.split(',')]
        
        # Calculate individual scores
        skills_match, found_skills = self.extract_skills(processed_text, job_skills)
        experience_match = self.calculate_experience_match(
            candidate.experience_years, 
            job.min_experience, 
            job.max_experience
        )
        education_match = self.calculate_education_match(
            candidate.highest_qualification, 
            job.qualifications
        )
        research_score = self.calculate_research_score(
            candidate.publications,
            candidate.patents,
            candidate.research_papers
        )
        
        # Weighted average (customize weights as needed)
        weights = {
            'skills': 0.35,
            'experience': 0.25,
            'education': 0.20,
            'research': 0.20
        }
        
        final_score = (
            skills_match * weights['skills'] +
            experience_match * weights['experience'] +
            education_match * weights['education'] +
            research_score * weights['research']
        )
        
        # Store detailed analysis
        analysis = {
            'skills_match': skills_match,
            'experience_match': experience_match,
            'education_match': education_match,
            'research_score': research_score,
            'matched_skills': found_skills,
            'missing_skills': [s for s in job_skills if s not in found_skills],
            'recommendation': self.generate_recommendation(final_score)
        }
        
        return final_score, analysis
    
    def generate_recommendation(self, score):
        """Generate recommendation based on score"""
        if score >= 85:
            return "Highly Recommended - Strong match for all criteria"
        elif score >= 75:
            return "Recommended - Good match with minor gaps"
        elif score >= 60:
            return "Consider - Meets basic requirements"
        else:
            return "Not Recommended - Significant gaps in qualifications"
    
    def rank_candidates(self, candidates, job):
        """Rank all candidates for a job based on ATS score"""
        ranked_candidates = []
        
        for candidate in candidates:
            score, analysis = self.calculate_ats_score(candidate, job)
            
            # Update candidate with AI scores
            candidate.ai_ats_score = score
            candidate.skills_match_score = analysis['skills_match']
            candidate.experience_match_score = analysis['experience_match']
            candidate.education_match_score = analysis['education_match']
            candidate.research_score = analysis['research_score']
            candidate.ai_analysis = analysis
            candidate.strength_weakness = {
                'strengths': analysis['matched_skills'][:5],
                'weaknesses': analysis['missing_skills'][:5]
            }
            candidate.save()
            
            ranked_candidates.append({
                'candidate': candidate,
                'score': score,
                'analysis': analysis
            })
        
        # Sort by score descending
        ranked_candidates.sort(key=lambda x: x['score'], reverse=True)
        return ranked_candidates

# Initialize global matcher
ats_matcher = ATSMatcher()