from django.urls import path
from .views import JobListView, JobDetailView, JobCategoryListView, JobCategoryDetailView

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('categories/', JobCategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', JobCategoryDetailView.as_view(), name='category-detail'),
]