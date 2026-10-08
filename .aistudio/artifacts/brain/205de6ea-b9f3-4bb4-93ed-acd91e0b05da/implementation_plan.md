# Plan de Implementación: Capas Visuales de Dispersión, Expansión y Recomposición (Project TRX)

Implementación de capas de animación orgánica de alto rendimiento basadas en Canvas HTML5 acelerado por hardware para **«01 // Analizador»** (filamentos orgánicos con muestreo de color directo de la imagen subida) y **«02 // Construye tu idea»** (fragmentos tipográficos y trazos conectivos cian que se descomponen y estructuran), replicando la física de dispersión y recomposición del video de referencia sin alterar la lógica de prompts, navegación ni ergonomía móvil.

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Confirmaciones del usuario incorporadas como base del diseño:
> - **Estilo visual en Analizador**: Filamentos orgánicos y partículas fluidas con color muestreado directamente de la imagen cargada por el usuario.
> - **Alcance espacial móvil**: Dispersión circunscrita al radio cercano de la tarjeta de referencia sin desbordar la pantalla del móvil ni tapar botones táctiles (`min-h-[44px]`) ni navegación.
> - **Estilo visual en Construye tu idea**: Fragmentos tipográficos y trazos que se descomponen en líneas y partículas cian (`#00F0FF`) que convergen al recibir el resultado.

---

### 1. Resumen y Concepto Central

- **Propósito**: Elevar la experiencia táctil y sensorial de Project TRX durante los estados de carga y análisis, sustituyendo animaciones genéricas o figurativas por efectos ópticos y volumétricos inspirados en la referencia de dispersión filamentaria.
- **Alcance Estricto**:
  - Aplicable **únicamente** a «01 // Analizador» y «02 // Construye tu idea».
  - No altera «Lotes de prompts», «Historial», prompts generados, esquemas de idioma ni llamadas a Gemini.
  - Cero personajes, robots o textos de progreso inventados.

---

### 2. Experiencia de Usuario y Diseño Visual

#### A. «01 // Analizador»: Micro-dispersión de Entrada y Escaneo Filamentario
1. **Transición al Cargar Foto (`onPhotoLoaded`)**:
   - Muestreo inicial de colores y luminancia en un canvas virtual de baja resolución ($64 \times 64\text{px}$).
   - Micro-dispersión de 600 ms: pequeños filamentos y partículas sutiles emergen de los 4 bordes de la foto hacia afuera y regresan suavemente con curvas de desaceleración (`cubic-bezier(0.16, 1, 0.3, 1)`), señalando que la escena fue absorbida por el visor óptico.
2. **Animación en Tiempo Real Durante «CREAR PROMPT TRX» (`isAnalyzing`)**:
   - **Línea de Escaneo Óptico**: Línea suave y translúcida con halo cian que recorre verticalmente la foto de arriba a abajo.
   - **Filamentos Orgánicos y Partículas**: 60–90 filamentos curvos con puntas luminosas y ~120 partículas toman el color exacto de los píxeles de donde se originan (piel, ropa, cielo, texturas reales).
   - **Desprendimiento y Profundidad Multicapa**: Los filamentos siguen contornos de contraste, se desprenden del marco y se expanden hacia el espacio inmediato del visor en 3 capas de profundidad óptica (escala $Z$, opacidad y desenfoque suave).
   - **Recomposición Inmediata**: Al llegar la respuesta de la API, los filamentos convergen rápidamente de vuelta hacia el interior de la imagen y la fotografía se revela con nitidez absoluta instantáneamente.
   - **Manejo de Errores y Limpieza**: Si la solicitud falla, la animación se detiene al instante y se muestra el banner de error existente con su botón de reintento.

#### B. «02 // Construye tu idea»: Descomposición y Estructuración Tipográfica
1. **Activación al pulsar «CREAR PROMPT TRX» (`isGenerating`)**:
   - Toma las palabras y glifos del texto redactado por el usuario (`autoText` o `manualText`).
   - Las palabras clave se descomponen en glifos flotantes, vectores lineales y partículas cian (`#00F0FF`).
   - Trazos cinéticos conectan los fragmentos tipográficos en diferentes capas, simulando la estructuración mental y forense de la idea en tiempo real.
2. **Convergencia al Resultado**:
   - Al recibir el prompt final sintetizado, los trazos y partículas tipográficas se contraen y convergen suavemente hacia la tarjeta del resultado (`04 // PROMPT SINTETIZADO`).

---

### 3. Decisiones de Producto y Rendimiento Técnico

- **Tecnología**: Canvas 2D (`requestAnimationFrame`) con cálculo vectorial de filamentos Bezier cúbicos. Cero dependencias npm externas o librerías pesadas para mantener bundle size liviano.
- **Resiliencia de Muestreo de Imagen**: Extracción segura en Canvas en memoria con fallback automático: si la imagen proviene de una fuente restringida, utiliza una paleta espectral armónica basada en luminancia promedio y tonos cian TRX.
- **Contención en Móvil**: El canvas de animación se monta con `pointer-events-none` y dimensiones absolutas calculadas con márgenes seguros (`overflow-hidden` o padding espacial controlado) para que ningún filamento tape los botones táctiles inferiores ni la barra superior.
- **Accesibilidad**: Detección nativa de `prefers-reduced-motion` mediante `window.matchMedia`. Si está activo, reemplaza el movimiento continuo por un sutil resplandor estático sin partículas en movimiento.
- **Ciclo de Vida Limpio**: Cancelación rigurosa de `cancelAnimationFrame`, liberación de `ImageData` y reinicio de estados cuando el usuario cambia de pestaña, reemplaza la foto o desmonta el componente.

---

### 4. Arquitectura y Componentes Técnicos

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             PROJECT TRX CORE                               │
├─────────────────────────────────────┬──────────────────────────────────────┤
│        01 // ANALIZADOR             │      02 // CONSTRUYE TU IDEA         │
├─────────────────────────────────────┼──────────────────────────────────────┤
│  Uploader (Visor Óptico Central)    │  IdeaBuilderSection (Entrada Texto)  │
│    │                                │    │                                 │
│    ▼                                │    ▼                                 │
│  PhotoFilamentCanvas (Nuevo)        │  TextStructureCanvas (Nuevo)         │
│  - Muestreo de píxeles/colores      │  - Fragmentación tipográfica         │
│  - Filamentos Bezier orgánicos      │  - Trazos conectivos cian            │
│  - Escaneo suave vertical           │  - Dinámica de estructuración        │
│  - Expansión z-depth y retorno      │  - Convergencia al prompt final      │
│  - Fallback óptico seguro           │                                      │
├─────────────────────────────────────┴──────────────────────────────────────┤
│ Sincronización Directa de Estados:                                         │
│ • status === AppStatus.ANALYZING   ──> Inicia/Detiene PhotoFilamentCanvas  │
│ • isGenerating                     ──> Inicia/Detiene TextStructureCanvas  │
│ • onClear / onChange               ──> Limpieza inmediata y cancelación   │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Plan de Archivos a Crear y Modificar:
1. **Crear `components/PhotoFilamentCanvas.tsx`**: Componente de Canvas 2D para Analizador con filamentos orgánicos, muestreo de color de la imagen cargada, escáner y recomposición.
2. **Crear `components/TextStructureCanvas.tsx`**: Componente de Canvas 2D para Construye tu idea con fragmentos de texto, conexiones vectoriales y convergencia hacia la tarjeta de prompt.
3. **Modificar `components/Uploader.tsx`**: Integrar `PhotoFilamentCanvas` reemplazando los robots/probes anteriores y añadiendo la micro-transición al cargar foto nueva.
4. **Modificar `components/IdeaBuilderSection.tsx`**: Integrar `TextStructureCanvas` vinculado al estado `isGenerating` y al texto actual.
5. **Eliminar/Deprecar componentes obsoletos** (`RoboticProbesAnimation.tsx` y `EditorialDeskAnimation.tsx`) para mantener el código limpio y libre de figuras/robots no solicitados.
6. **Verificación y Compilación**: Ejecutar `compile_applet` para garantizar cero errores de TypeScript y verificar fluidez en móvil.
