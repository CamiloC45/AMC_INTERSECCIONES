# Evaluación de Intersecciones

Este proyecto es una aplicación web que utiliza un enfoque de análisis multicriterio basado en el método AHP (Analytic Hierarchy Process) para evaluar alternativas de infraestructura vial. La aplicación permite:

- Seleccionar criterios y subcriterios para evaluar intersecciones.
- Realizar comparaciones por pares para criterios y subcriterios.
- Calcular matrices de comparación y vectores de prioridades para criterios y subcriterios.
- Calcular un "Peso Global" para cada criterio o subcriterio.
- Ingresar y gestionar alternativas (agregar y eliminar).
- Evaluar las alternativas en función de los pesos globales, obteniendo una puntuación global final para cada alternativa.

## Funcionalidades

- **Selección de Criterios y Subcriterios:**  
  Permite al usuario seleccionar criterios y subcriterios desde una fuente de datos (por ejemplo, un backend Django).

- **Comparación por Pares (AHP):**  
  - Se generan automáticamente los pares de comparación entre criterios y subcriterios.  
  - Se calcula el vector de prioridades mediante el método AHP (media geométrica y normalización).

- **Cálculo del Peso Global:**  
  Para cada criterio (o subcriterio), se multiplica la prioridad obtenida en el análisis AHP por la prioridad del criterio, permitiendo ponderar las alternativas según su importancia relativa.

- **Evaluación de Alternativas:**  
  - Permite ingresar alternativas dinámicamente (agregar y eliminar).  
  - Se generan matrices de comparación entre alternativas, utilizando los ítems globales y se obtiene un score final para cada alternativa.

## Tecnologías Utilizadas

- **Frontend:**  
  - React.js  
  - HTML5, CSS3, JavaScript
- **Backend (opcional):**  
  - Django y Django REST Framework (para la provisión de datos de criterios y subcriterios)
- **Librerías Adicionales:**  
  - Axios (para peticiones HTTP)  
  - react-collapse (para animaciones en el despliegue de secciones)

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio

Instalar dependencias:

npm install

Configurar variables de entorno (si es necesario):
Crea un archivo .env y define las variables requeridas (por ejemplo, para la conexión con el backend).

Uso
Para iniciar la aplicación en modo desarrollo:

npm start
La aplicación se ejecutará en http://localhost:3000.
Si utilizas un backend en Django, asegúrate de que esté en ejecución y configurado para permitir CORS.

Estructura del Proyecto

.
├── src
│   ├── AlternativeEvaluation.js         # Evaluación de alternativas (con comparación manual)
│   ├── AlternativeEvaluationAuto.js     # Evaluación de alternativas (automática, con comparación uniforme)
│   ├── AlternativeInput.js              # Gestión de alternativas (agregar/eliminar/cargar)
│   ├── AHPAnalysis.js                   # Análisis AHP de subcriterios
│   ├── CriteriaAHP.js                   # Análisis AHP de criterios
│   ├── CriteriaSelection.js             # Selección de criterios y subcriterios
│   ├── GlobalWeightSection.js           # Cálculo del Peso Global de criterios/subcriterios
│   └── App.js                           # Componente principal que integra todas las secciones
├── package.json
└── README.md


Contribución
¡Las contribuciones son bienvenidas!
Si deseas mejorar el proyecto o corregir algún error, por favor abre un "issue" o envía un "pull request". Asegúrate de seguir las buenas prácticas de commits y documentar tus cambios.

Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

Contacto
Para cualquier consulta o sugerencia, puedes contactarme a: camilo.c45@outlook.com