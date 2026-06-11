@echo off
echo ========================================
echo SMART FACULTY RECRUITMENT SYSTEM SETUP
echo ========================================
echo.

cd C:\Users\asemm\OneDrive\Desktop\Smart_Recruitment_Faculty_System-\django_recruitment_backend

echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Installing Django and core packages...
pip install Django==4.2.10
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install djangorestframework-simplejwt==5.3.1
pip install drf-yasg==1.21.7
pip install django-filter==24.2
pip install python-dotenv==1.0.1
pip install Pillow==10.2.0

echo.
echo Installing document processing packages...
pip install PyPDF2==3.0.1
pip install python-docx==1.1.0

echo.
echo Installing AI/ML packages...
pip install nltk==3.8.1
pip install numpy==1.26.3
pip install pandas==2.2.0
pip install scikit-learn==1.4.0

echo.
echo Installing utility packages...
pip install requests==2.31.0
pip install beautifulsoup4==4.12.3
pip install openpyxl==3.1.2

echo.
echo Creating Django project...
django-admin startproject recruitment_backend . 2>nul

echo.
echo Creating Django apps...
python manage.py startapp accounts 2>nul
python manage.py startapp jobs 2>nul
python manage.py startapp candidates 2>nul
python manage.py startapp applications 2>nul
python manage.py startapp ai_matching 2>nul
python manage.py startapp interviews 2>nul
python manage.py startapp evaluation 2>nul
python manage.py startapp selection 2>nul
python manage.py startapp offers 2>nul
python manage.py startapp notifications 2>nul

echo.
echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Creating superuser...
python manage.py createsuperuser

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Starting server...
python manage.py runserver

pause