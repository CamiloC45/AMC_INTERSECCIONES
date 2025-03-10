from django.db import models

class Criterion(models.Model):
    name = models.CharField(max_length=100)
    #description = models.TextField(blank=True, null=True)
    #weight = models.FloatField(default=0.0, help_text="Peso calculado mediante AHP")

    def __str__(self):
        return self.name

class SubCriterion(models.Model):
    criterion = models.ForeignKey(Criterion, related_name='subcriteria', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    #description = models.TextField(blank=True, null=True)
    #weight = models.FloatField(default=0.0, help_text="Peso calculado para el subcriterio")
    #weight_global = models.FloatField(default=0.0, help_text="Peso global (criterio * subcriterio)")

    def __str__(self):
        return f"{self.criterion.name} - {self.name}"

class Alternative(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class PairwiseComparison(models.Model):
    # Se compararán dos criterios (Criterion1 vs Criterion2)
    criterion1 = models.ForeignKey(Criterion, related_name='comparisons_from', on_delete=models.CASCADE)
    criterion2 = models.ForeignKey(Criterion, related_name='comparisons_to', on_delete=models.CASCADE)
    value = models.FloatField(help_text="Valor de comparación (por ejemplo: 1, 3, 5, 7, 9)")

    def __str__(self):
        return f"{self.criterion1.name} vs {self.criterion2.name}: {self.value}"

class SubCriterionComparison(models.Model):
    subcriterion1 = models.ForeignKey(SubCriterion, related_name='subcomp_from', on_delete=models.CASCADE)
    subcriterion2 = models.ForeignKey(SubCriterion, related_name='subcomp_to', on_delete=models.CASCADE)
    value = models.FloatField(help_text="Valor de comparación (por ejemplo: 1, 3, 5, 7, 9)")

    def __str__(self):
        return f"{self.subcriterion1} vs {self.subcriterion2}: {self.value}"
