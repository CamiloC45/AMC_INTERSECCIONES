from rest_framework import serializers
from .models import Criterion, SubCriterion, Alternative, PairwiseComparison

class SubCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCriterion
        fields = ['id', 'name']

class CriterionSerializer(serializers.ModelSerializer):
    subcriteria = SubCriterionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Criterion
        fields = ['id', 'name', 'subcriteria']

class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = '__all__'

class PairwiseComparisonSerializer(serializers.ModelSerializer):
    class Meta:
        model = PairwiseComparison
        fields = '__all__'
