from django.contrib import admin
from .models import Criterion, SubCriterion, Alternative, PairwiseComparison

admin.site.register(Criterion)
admin.site.register(SubCriterion)
admin.site.register(Alternative)
admin.site.register(PairwiseComparison)

