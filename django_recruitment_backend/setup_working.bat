@echo off
echo ========================================
echo Smart Faculty Recruitment System Setup
echo ========================================
echo.

cd C:\Users\asemm\OneDrive\Desktop\Smart_Recruitment_Faculty_System-\django_recruitment_backend

echo Activating virtual environment...
call venv\Scripts\activate

echo Uninstalling conflicting packages...
pip uninstall django celery django-celery-beat -y

echo Installing compatible packages...
pip install Django==4.2.10
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install djangorestframework-simplejwt==5.3.1
pip install drf-yasg==1.21.7
pip install django-filter==24.2
pip install psycopg2-binary==2.9.9
pip install python-dotenv==1.0.1
pip install Pillow==10.2.0
pip install PyPDF2==3.0.1
pip install python-docx==1.1.0
pip install nltk==3.8.1
pip install numpy==1.26.3
pip install pandas==2.2.0
pip install scikit-learn==1.4.0

echo.
echo Creating Django project...
django-admin startproject recruitment_backend .

echo.
echo Creating apps...
python manage.py startapp accounts
python manage.py startapp jobs
python manage.py startapp candidates
python manage.py startapp applications
python manage.py startapp ai_matching
python manage.py startapp interviews
python manage.py startapp evaluation
python manage.py startapp selection
python manage.py startapp offers
python manage.py startapp notifications

echo.
echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating superuser...
python manage.py createsuperuser

echo.
echo Starting server...
python manage.py runserver

pause