# Construye tu idea — Apartado de Creación de Prompts

Plan de arquitectura y experiencia de usuario para integrar el nuevo apartado **"Construye tu idea"**, permitiendo formular prompts hiperrealistas en dos modos (**Automático** y **Manual**) mediante la misma lógica forense y fotográfica de la aplicación, sin alterar ninguna funcionalidad ni estilo existente.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones confirmadas a partir de la consulta interactiva con el usuario:
>
> - **Navegación**: Se agregan pestañas principales en la parte superior del cuerpo de la aplicación: **"Analizador"** y **"Construye tu idea"**, sin alterar el orden actual ni desplazar elementos preexistentes.
> - **Visualización del Resultado**: En "Construye tu idea", el resultado se presentará en un campo de texto seleccionable y legible junto con un botón prominente **"Copiar prompt"** con retroalimentación visual inmediata.
> - **Idioma del Prompt Generado**: El prompt final resultante se generará en **inglés**, optimizado para motores de síntesis de imagen hiperrealista (Midjourney v6, FLUX.1, etc.), manteniendo la interfaz y las etiquetas en el idioma activo (Español / Inglés).

---

### 1. Overview & Core Concept

- **Qué hace**: Permite a los creadores idear y redactar prompts fotográficos de autenticidad humana sin necesidad de subir obligatoriamente una imagen de referencia previa. Ofrece dos modalidades de captura de la idea:
  1. **Modo Automático**: Campo de texto libre para describir cualquier sujeto, escena, acción o entorno.
  2. **Modo Manual**: Plantilla fotográfica estructurada lista para rellenar, con botón para restablecer a los valores predeterminados.
- **Audiencia objetivo**: Creadores de contenido, fotógrafos digitales e ingenieros de prompts que buscan recrear escenas con la estética "foto casual de smartphone" sin caer en la sobreedición ni estética sintética de IA.
- **Valor clave**: Reutiliza la misma canalización de razonamiento (`SYSTEM_INSTRUCTION` y calibraciones de física de ropa, lenguaje corporal y lente) que el analizador de imágenes, garantizando paridad total de estilo y calidad entre ambos métodos.

---

### 2. User Experience & Visual Design

#### A. Flujos de Usuario Principales

1. **Selección de Pestaña**:
   - En la parte superior del contenido principal se presentan dos pestañas con el lenguaje visual oscuro y detalles en dorado (`#d4af37`):
     - Pestaña 1: **Analizador** (la vista actual completa con uploader, EXIF y opciones).
     - Pestaña 2: **Construye tu idea** (la nueva sección).
   - El estado de la pestaña activa se preserva durante la sesión.

2. **Interacción en "Construye tu idea"**:
   - Selector segmentado de modo: **[Automático]** | **[Manual]**.
   - **En Modo Automático**:
     - Área de texto para describir libremente cualquier idea, sujeto o escena.
     - Botón principal: **"Generar prompt final"**.
   - **En Modo Manual**:
     - Área de texto pre-rellenada con la plantilla exacta solicitada por el usuario:
       `foto de [persona/sujeto]. lleva [ropa completa...]. está en [lugar específico...]. justo antes... la imagen final debe sentirse como...`
     - Botón secundario: **"Restablecer plantilla"** (regresa el texto al borrador original con confirmación).
     - Botón principal: **"Generar prompt final"**.
   - **Persistencia entre modos**: El texto redactado en cada pestaña/modo se conserva al alternar entre Automático y Manual para evitar pérdidas accidentales.

3. **Generación y Resultado**:
   - Estado de carga con animación de spinner sutil (`Extrayendo realismo...`) sin congelar la interfaz.
   - Campo de resultado en un bloque de código/área seleccionable estilizada con tipografía monoespaciada legible.
   - Botón **"Copiar prompt"** que cambia a *"Copiado!"* temporalmente.

#### B. Identidad Visual y Estilo

- **Paleta**: Fondo zinc oscuro (`bg-zinc-950`/`bg-zinc-900`), bordes sutiles `border-[#d4af37]/20`, y acentos en dorado ámbar (`#d4af37` a `#b8860b`).
- **Consistencia**: Mismo radio de bordes (`rounded-xl` / `rounded-2xl`), estados hover, sombras de resplandor suave y animaciones `fade-in` de Tailwind ya presentes en la aplicación.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Reutilización estricta del flujo y lógica existente**
  - *Enfoque*: En lugar de crear un endpoint o lógica desconectada, se conecta la idea textual a una función en `geminiService.ts` que utiliza el mismo `SYSTEM_INSTRUCTION` y las directrices de formateo (comienzo con `Subject A: [blank]`, descripción forense de ropa/entorno y cierre mandatorio de preservación).
  - *Por qué*: Cumple exactamente con la restricción del usuario de no crear lógica paralela ni alterar el comportamiento existente, asegurando que ambos módulos produzcan resultados con la misma calidad.
- **Decisión 2: Preservación de componentes y datos existentes**
  - *Enfoque*: El módulo original (Uploader, ResultCard, Historial, EXIF, controles de lente y ruido) permanece 100% intacto y funcional en la pestaña "Analizador".
  - *Por qué*: Garantiza cero regresiones en la aplicación actual.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│  State: activeTab ('analyzer' | 'ideaBuilder')              │
│  State: ideaMode ('auto' | 'manual')                        │
│  State: autoText, manualText, generatedIdeaPrompt           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     [activeTab === 'analyzer']      [activeTab === 'ideaBuilder']
               │                              │
   ┌───────────▼───────────┐      ┌───────────▼────────────────┐
   │    Sección Actual     │      │   IdeaBuilderSection.tsx   │
   │  - Uploader           │      │  - Selector Automático/Man │
   │  - Controles Lente    │      │  - Textarea adaptable      │
   │  - ResultCard         │      │  - Restablecer plantilla   │
   │  (Sin alteraciones)   │      │  - Generar prompt final    │
   └───────────────────────┘      │  - Output seleccionable    │
                                  │  - Botón Copiar prompt     │
                                  └───────────┬────────────────┘
                                              │
                                  ┌───────────▼────────────────┐
                                  │     geminiService.ts       │
                                  │  generatePromptFromIdea()  │
                                  │  (Misma instrucción base) │
                                  └────────────────────────────┘
```

#### Plan de Pasos de Ejecución (Al Aprobar):

1. **Actualizar `i18n.ts`**:
   - Incorporar cadenas de traducción (inglés y español) para la nueva sección: títulos de pestaña ("Analizador" / "Construye tu idea"), modos ("Automático" / "Manual"), botones ("Generar prompt final", "Restablecer plantilla", "Copiar prompt", "Copiado"), etc.
2. **Ampliar `geminiService.ts`**:
   - Agregar la función `generatePromptFromIdea(ideaText: string)` que reutiliza `SYSTEM_INSTRUCTION`, el modelo `gemini-3-flash-preview` y los mismos lineamientos de realismo forense sin modificar `analyzeImage`.
3. **Crear componente `IdeaBuilderSection.tsx`**:
   - Encapsular la interfaz del nuevo apartado, controlando los modos Automático y Manual, preservando el texto entre cambios de modo y proporcionando el campo de resultado seleccionable con botón de copia.
4. **Integrar en `App.tsx`**:
   - Añadir la navegación por pestañas en la parte superior sin alterar ningún elemento existente, renderizando condicionalmente la sección correspondiente y manteniendo intacto el estado del analizador.
5. **Verificación y Compilación**:
   - Ejecutar `compile_applet` para garantizar que la compilación de TypeScript y Vite es exitosa y sin errores.
