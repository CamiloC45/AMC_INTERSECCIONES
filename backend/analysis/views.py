from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Criterion, SubCriterion, Alternative, PairwiseComparison, SubCriterionComparison
from .serializers import CriterionSerializer, SubCriterionSerializer, AlternativeSerializer, PairwiseComparisonSerializer
import numpy as np

class CriterionViewSet(viewsets.ModelViewSet):
    queryset = Criterion.objects.all()
    serializer_class = CriterionSerializer

    @action(detail=False, methods=['get'])
    def calculate_weights(self, request):
        """
        Calcula los pesos de cada criterio mediante el método AHP.
        Se construye una matriz de comparación a partir de las comparaciones almacenadas.
        """
        # Obtener todos los criterios
        criteria = list(Criterion.objects.all())
        n = len(criteria)
        if n == 0:
            return Response({"error": "No hay criterios registrados."})
        
        # Inicializar una matriz n x n con unos (valor 1 en la diagonal)
        comparison_matrix = np.ones((n, n))
        
        # Rellenar la matriz con las comparaciones existentes
        comparisons = PairwiseComparison.objects.all()
        for comp in comparisons:
            try:
                i = criteria.index(comp.criterion1)
                j = criteria.index(comp.criterion2)
                comparison_matrix[i, j] = comp.value
                # Establecer la reciprocidad
                comparison_matrix[j, i] = 1 / comp.value
            except ValueError:
                continue

        # Método de la media geométrica para calcular el vector de prioridades
        geometric_means = np.prod(comparison_matrix, axis=1) ** (1/n)
        weights = geometric_means / np.sum(geometric_means)
        
        # Actualizar los pesos en los criterios y guardar los cambios
        for idx, criterion in enumerate(criteria):
            criterion.weight = float(weights[idx])
            criterion.save()
        
        # Devolver los pesos calculados
        data = {criterion.name: criterion.weight for criterion in criteria}

        # Luego, calcular pesos de subcriterios para cada criterio (Nivel 2)
        subcriteria_results = {}
        for criterion in criteria:
            subs = list(criterion.subcriteria.all())
            m = len(subs)
            if m == 0:
                continue  # Si no tiene subcriterios, se omite
            # Inicializar la matriz para subcriterios
            sub_matrix = np.ones((m, m))
            # Filtrar las comparaciones correspondientes a estos subcriterios
            comparisons_sub = SubCriterionComparison.objects.filter(
                subcriterion1__in=subs, subcriterion2__in=subs
            )
            # Rellenar la matriz con las comparaciones
            for comp in comparisons_sub:
                i = subs.index(comp.subcriterion1)
                j = subs.index(comp.subcriterion2)
                sub_matrix[i, j] = comp.value
                sub_matrix[j, i] = 1 / comp.value

            # Calcular el vector de prioridades para subcriterios
            geom_means_sub = np.prod(sub_matrix, axis=1) ** (1/m)
            sub_weights = geom_means_sub / np.sum(geom_means_sub)

            # Actualizar los pesos en cada subcriterio y calcular el peso global
            for idx, sub in enumerate(subs):
                sub.weight = float(sub_weights[idx])
                # Peso global: peso del criterio * peso relativo del subcriterio
                sub.weight_global = criterion.weight * sub.weight  # Asegúrate de tener este campo o usalo de forma conceptual
                sub.save()
            # Guardar resultados para este criterio
            subcriteria_results[criterion.name] = {
                sub.name: sub.weight_global for sub in subs
            }

        return Response({
            "criteria_weights": data, 
            "subcriteria_global_weights": subcriteria_results
        })

class AlternativeViewSet(viewsets.ModelViewSet):
    queryset = Alternative.objects.all()
    serializer_class = AlternativeSerializer

class PairwiseComparisonViewSet(viewsets.ModelViewSet):
    queryset = PairwiseComparison.objects.all()
    serializer_class = PairwiseComparisonSerializer

class EvaluationAPIView(APIView):
    """
    Endpoint para seleccionar los criterios y subcriterios que se usarán para evaluar las alternativas.
    Se espera recibir un JSON con la siguiente estructura:
    
    {
      "criteria_ids": [1, 2, 3],
      "subcriteria_ids": {
          "1": [4, 5],
          "2": [6],
          "3": [7, 8]
      }
    }
    
    Donde "criteria_ids" es una lista con los IDs de los criterios seleccionados,
    y "subcriteria_ids" es un objeto (diccionario) en el que cada clave es el ID de un criterio
    y el valor es una lista con los IDs de los subcriterios seleccionados para ese criterio.
    """
    def post(self, request):
        # Extraer los datos del JSON enviado
        selected_criteria_ids = request.data.get('criteria_ids', [])
        #selected_subcriteria_ids = request.data.get('subcriteria_ids', {})

        # Obtener los criterios seleccionados
        criteria = Criterion.objects.filter(id__in=selected_criteria_ids)
        if not criteria.exists():
            return Response({"error": "No se encontraron criterios con los IDs proporcionados."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Preparar una respuesta que detalle la selección
        #selection_result = {}

        # Codigo Serializer agregado
        serializer = criterionSerializer(criteria, many=True)


        for crit in criteria:
            # Obtener la lista de subcriterios seleccionados para este criterio.
            # Notarás que convertimos la clave a cadena, ya que en JSON las claves son strings.
            sub_ids = selected_subcriteria_ids.get(str(crit.id), [])
            # Filtrar los subcriterios pertenecientes al criterio que estén en la selección
            subs = crit.subcriteria.filter(id__in=sub_ids)
            selection_result[crit.name] = [sub.name for sub in subs]

        # Aquí podrías llamar a una función que evalúe las alternativas basándose en esta selección,
        # o simplemente retornar la selección para confirmación.
        return Response({
            "selected_criteria": serializer.data
            #"selected_criteria": [crit.name for crit in criteria],
            #"selected_subcriteria": selection_result,
            #"evaluation": evaluation_result  # Aquí debería retornar el resultado de la evaluación
        }, status=status.HTTP_200_OK)    