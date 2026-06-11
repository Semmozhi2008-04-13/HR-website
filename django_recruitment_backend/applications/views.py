from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationSerializer

class ApplicationListView(generics.ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'applicant':
            return Application.objects.filter(applicant=user)
        return Application.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def update(self, request, *args, **kwargs):
        if request.user.user_type == 'applicant':
            return Response({'error': 'Applicants cannot update applications'},
                          status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)