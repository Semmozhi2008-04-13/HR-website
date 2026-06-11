from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Import viewsets
from ai_matching.views import AIMatchingViewSet
from interviews.views import InterviewViewSet
from evaluation.views import EvaluationViewSet
from selection.views import SelectionViewSet
from offers.views import OfferViewSet

router = DefaultRouter()
router.register(r'ai-matching', AIMatchingViewSet, basename='ai-matching')
router.register(r'interviews', InterviewViewSet, basename='interviews')
router.register(r'evaluation', EvaluationViewSet, basename='evaluation')
router.register(r'selection', SelectionViewSet, basename='selection')
router.register(r'offers', OfferViewSet, basename='offers')

schema_view = get_schema_view(
    openapi.Info(
        title="Smart Faculty Recruitment System API",
        default_version='v1.0',
        description="AI-Powered Faculty Recruitment Management System",
    ),
    public=True,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('accounts.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/candidates/', include('candidates.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/notifications/', include('notifications.urls')),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)