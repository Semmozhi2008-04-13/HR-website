@echo off
echo Setting up Smart Faculty Recruitment System Backend...

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
pip install -r requirements.txt

REM Create .env file
echo Creating .env file...
(
echo DJANGO_SECRET_KEY=your-super-secret-key-here
echo DEBUG=True
echo DB_NAME=recruitment_db
echo DB_USER=postgres
echo DB_PASSWORD=your_password
echo DB_HOST=localhost
echo DB_PORT=5432
echo EMAIL_HOST_USER=your_email@gmail.com
echo EMAIL_HOST_PASSWORD=your_app_password
) > .env

REM Run migrations
python manage.py makemigrations
python manage.py migrate

REM Create superuser
python manage.py createsuperuser

REM Run server
python manage.py runserver

pause