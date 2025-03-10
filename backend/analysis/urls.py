from django.urls import path, include
from rest_framework import routers
from .views import CriterionViewSet, AlternativeViewSet, PairwiseComparisonViewSet, EvaluationAPIView

router = routers.DefaultRouter()
router.register(r'criteria', CriterionViewSet)
router.register(r'alternatives', AlternativeViewSet)
router.register(r'comparisons', PairwiseComparisonViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('evaluation/', EvaluationAPIView.as_view(), name='evaluation'),
]
