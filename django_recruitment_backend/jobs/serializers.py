from rest_framework import serializers
from .models import Job, JobCategory

class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = '__all__'

class JobSerializer(serializers.ModelSerializer):
    categories = JobCategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=JobCategory.objects.all(), many=True, write_only=True, source='categories'
    )
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')