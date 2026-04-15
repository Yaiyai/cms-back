# Internacionalización de Secciones y Máquinas

## Cambios Implementados

Se ha añadido soporte completo de internacionalización a los modelos `Section` y `Maquina` con un sistema de vinculación de traducciones mediante `contentId`.

### ⚡ Comportamiento Automático de Traducciones

**Creación Automática (POST):**

- Al crear una sección o máquina en **español** (sin `contentId` existente), se crea automáticamente una versión en **inglés** como copia
- La versión EN es idéntica al contenido ES (temporal, para editar después)
- El `sectionName` de sections EN tiene sufijo ` EN` (ej: "Cabecera" → "Cabecera EN")
- El `name` de máquinas EN tiene sufijo ` EN` (ej: "Torno CNC" → "Torno CNC EN")
- El slug de la versión EN tiene sufijo `-en` (ej: "torno-cnc" → "torno-cnc-en")
- Ambas versiones comparten el mismo `contentId`

**Eliminación en Cascada (DELETE):**

- Al borrar una sección o máquina, se eliminan **todas sus traducciones** automáticamente
- Usa el `contentId` para identificar y borrar todas las versiones en todos los idiomas
- Devuelve el número de documentos eliminados en `deletedCount`

### Modelos Actualizados

#### Section Model

- **Campo añadido**: `contentId` (String, required, indexed) - Vincula todas las versiones traducidas del mismo contenido
- **Campo añadido**: `lang` (String, enum: ['es', 'en'], default: 'es', required)
- **Índice compuesto único**: `(contentId, lang)` - Garantiza una sola versión por idioma de cada contenido
- **Cambio importante**: Se eliminó `unique: true` de `sectionName` para permitir secciones con el mismo nombre en diferentes idiomas

#### Maquina Model

- **Campo añadido**: `contentId` (String, required, indexed) - Vincula todas las versiones traducidas del mismo contenido
- **Campo añadido**: `lang` (String, enum: ['es', 'en'], default: 'es', required)
- **Índices compuestos**:
  - `(contentId, lang)` único - Garantiza una sola versión por idioma de cada contenido
  - `(slug, lang)` - Optimiza búsquedas por slug
- **Cambio importante**: Se eliminó `unique: true` de `name` para permitir máquinas con el mismo nombre en diferentes idiomas

### Sistema de ContentId

El `contentId` es el identificador común que vincula todas las traducciones del mismo contenido:

```javascript
// Versión en español
{
  _id: "507f1f77bcf86cd799439011",
  contentId: "507f1f77bcf86cd799439011",  // ← MISMO ID
  name: "Torno CNC",
  slug: "torno-cnc",
  lang: "es"
}

// Versión en inglés (misma máquina)
{
  _id: "507f1f77bcf86cd799439022",
  contentId: "507f1f77bcf86cd799439011",  // ← MISMO ID
  name: "CNC Lathe",
  slug: "cnc-lathe-en",
  lang: "en"
}
```

### API Endpoints Actualizados

Todos los endpoints ahora soportan el parámetro de query `lang` (por defecto 'es'):

#### Sections

**GET /api/sections?lang=es**

- Obtiene todas las secciones del idioma especificado
- Default: 'es'

**GET /api/sections/:id?lang=es**

- Obtiene una sección específica por ID y idioma
- Default: 'es'

**POST /api/sections**

```json
{
	"sectionName": "hero",
	"lang": "es",
	"title": "Bienvenido"
}
```

- El campo `lang` es opcional, default: 'es'
- El campo `contentId` es **opcional**:
  - Si NO se proporciona: se genera automáticamente (nuevo contenido)
  - Si se proporciona: se vincula a una traducción existente

**Crear traducción de contenido existente:**

```json
{
	"contentId": "507f1f77bcf86cd799439011", // ← contentId de la versión ES
	"sectionName": "hero",
	"lang": "en",
	"title": "Welcome"
}
```

**PUT /api/sections/:id?lang=es**

- Actualiza una sección específica
- El parámetro `lang` es opcional pero recomendado para asegurar que se actualiza el idioma correcto

**DELETE /api/sections/:id**

- Elimina una sección por ID (no requiere lang ya que el ID es único)

#### Maquinas

**GET /api/maquinaria?lang=es**

- Obtiene todas las máquinas del idioma especificado
- Default: 'es'

**GET /api/maquinaria/:id?lang=es**

- Obtiene una máquina específica por ID y idioma
- Default: 'es'

**GET /api/maquinaria/maquina/slug/:slug?lang=es**

- Obtiene una máquina por slug y idioma
- Default: 'es'

**POST /api/maquinaria**

```json
{
  "name": "Torno CNC",
  "lang": "es",
  "image": "...",
  ...
}
```

- El campo `lang` en el body es opcional, default: 'es'

**PUT /api/maquinaria/:id?lang=es**

- Actualiza una máquina específica
- El parámetro `lang` es opcional pero recomendado

**DELETE /api/maquinaria/:id**

- Elimina una máquina por ID (no requiere lang ya que el ID es único)

### Búsqueda Inteligente por ID

Los endpoints `GET /api/sections/:id?lang=X` y `GET /api/maquinaria/:id?lang=X` implementan un **sistema de fallback automático de 4 pasos**:

**Paso 1: Búsqueda Directa** Intenta encontrar un documento con el `_id` especificado Y el idioma solicitado.

**Paso 2: Búsqueda por ID Solo** Si no se encuentra en Paso 1, busca el documento con ese `_id` en **cualquier idioma**.

**Paso 3: Traducción por ContentId** Si encuentra el documento (aunque sea en otro idioma), usa su `contentId` para buscar la versión en el idioma solicitado.

**Paso 4: Respuesta con Flags**

- Si existe traducción: devuelve la traducción con `langMismatch: true`
- Si NO existe traducción: devuelve el documento original con `translationMissing: true`
- Si el ID no existe en absoluto: devuelve 404

**Ejemplos:**

```bash
# Escenario 1: ID y idioma coinciden
GET /api/sections/507f-es-id?lang=es
# → 200 OK - Devuelve directamente la sección ES

# Escenario 2: ID es de otro idioma, pero existe traducción
GET /api/sections/507f-es-id?lang=en
# → 200 OK con langMismatch: true
# {
#   ok: true,
#   msg: "Sección encontrada (traducción)",
#   langMismatch: true,
#   requestedLang: "en",
#   section: {...versión EN}
# }

# Escenario 3: ID es de otro idioma, NO existe traducción
GET /api/sections/507f-es-id?lang=en
# → 200 OK con translationMissing: true
# {
#   ok: true,
#   msg: "Sección encontrada pero sin traducción al idioma solicitado",
#   translationMissing: true,
#   requestedLang: "en",
#   availableLang: "es",
#   section: {...versión ES original}
# }

# Escenario 4: ID no existe
GET /api/sections/id-inexistente?lang=en
# → 404 NOT FOUND
# {
#   ok: false,
#   msg: "No existe una sección con ese id"
# }
```

**Ventajas:**

✅ El frontend puede usar UN solo ID para todas las peticiones  
✅ Cambiar de idioma es tan simple como cambiar el param `?lang=X`  
✅ Nunca devuelve 404 si el contenido existe (aunque sea en otro idioma)  
✅ Flags informativos permiten UX mejorado (avisos de contenido faltante)

### Búsqueda Inteligente por Slug

El endpoint `GET /api/maquinaria/maquina/slug/:slug?lang=X` tiene un sistema de fallback inteligente:

**Escenario 1: Slug existe en el idioma solicitado**

```bash
GET /api/maquinaria/maquina/slug/torno-cnc?lang=es
# ✓ Devuelve la máquina directamente
```

**Escenario 2: Slug no existe en idioma solicitado, pero sí en otro idioma**

```bash
GET /api/maquinaria/maquina/slug/torno-cnc?lang=en
# 1. No encuentra "torno-cnc" en lang=en
# 2. Encuentra "torno-cnc" en lang=es, obtiene su contentId
# 3. Busca contentId con lang=en
# 4. Si existe traducción EN, la devuelve con flags:
#    - slugMismatch: true
#    - originalSlug: "torno-cnc"
#    - correctSlug: "cnc-lathe-en"
#    - data: {...versión EN}
```

**Escenario 3: No existe traducción al idioma solicitado**

```bash
GET /api/maquinaria/maquina/slug/torno-cnc?lang=en
# Si no existe versión EN, devuelve la versión ES con:
#    - translationMissing: true
#    - requestedLang: "en"
#    - availableLang: "es"
#    - data: {...versión ES}
```

**Respuestas del endpoint:**

```javascript
// Caso exitoso directo
{
  ok: true,
  msg: "Máquina encontrada con ese slug",
  redirect: false,
  data: {...}
}

// Caso traducción con slug diferente
{
  ok: true,
  msg: "Máquina encontrada (traducción desde otro slug)",
  redirect: true,
  slugMismatch: true,
  originalSlug: "torno-cnc",
  correctSlug: "cnc-lathe-en",
  data: {...}
}

// Caso sin traducción disponible
{
  ok: true,
  msg: "Máquina encontrada pero sin traducción al idioma solicitado",
  translationMissing: true,
  requestedLang: "en",
  availableLang: "es",
  data: {...}
}
```

## Migración de Datos Existentes

### Script 1: Añadir campo lang (OBSOLETO - usar Script 2)

```bash
npm run migrate:lang
```

### Script 2: ContentId + Crear Traducciones EN (RECOMENDADO)

```bash
npm run migrate:contentid
```

Este script realiza una migración completa:

1. **Añade contentId** a todos los documentos existentes (usando su `_id` como contentId)
2. **Crea versiones EN** (copias) de todas las secciones y máquinas en español
3. **Ajusta slugs** de versiones EN añadiendo sufijo `-en` para evitar duplicados
4. **Muestra progreso** detallado de cada operación
5. **Resumen final** con totales procesados

**Salida del script:**

```
--- PROCESANDO SECCIONES ---
Total de secciones encontradas: 10
✓ Section 507f... actualizada con contentId
✓ Versión EN creada para section 507f...
...
Secciones actualizadas con contentId: 10
Versiones EN de secciones creadas: 10

--- PROCESANDO MÁQUINAS ---
Total de máquinas encontradas: 15
✓ Maquina 608a... actualizada con contentId
✓ Versión EN creada para maquina 608a...
...
Máquinas actualizadas con contentId: 15
Versiones EN de máquinas creadas: 15
```

**IMPORTANTE**:

- Ejecutar este script **solo una vez** después de desplegar los cambios
- Crea versiones EN como **copias exactas** del contenido ES (temporal hasta que se traduzca)
- Los índices únicos compuestos evitan duplicados accidentales

## Flujo de Trabajo para Contenido Multiidioma

### 1. Crear contenido original (Automático - crea ES + EN):

```javascript
POST /api/sections
{
  "sectionName": "hero",
  "title": "Bienvenido"
}

// Resultado:
// ✓ Se crea versión ES con el contenido proporcionado
// ✓ Se crea AUTOMÁTICAMENTE versión EN (copia idéntica)
// ✓ Ambas comparten el mismo contentId
// ✓ La versión EN tiene sectionName "hero EN"
// ✓ La versión EN tiene slug con sufijo '-en' si existe slug

// Respuesta (solo devuelve la versión ES creada):
{
  ok: true,
  msg: "Sección creada",
  section: {
    _id: "507f1f77bcf86cd799439011",
    contentId: "507f1f77bcf86cd799439011",
    sectionName: "hero",
    lang: "es",
    title: "Bienvenido",
    ...
  }
}

// Nota: La versión EN se creó automáticamente en background
```

### 2. Editar la traducción al inglés:

```javascript
// Primero, obtener la versión EN creada automáticamente
GET /api/sections?lang=en
// Encuentra la sección con contentId: "507f1f77bcf86cd799439011"

// Actualizar con contenido traducido
PUT /api/sections/608a2f77bcf86cd799439022?lang=en
{
  "title": "Welcome",
  "subtitle": "To our website",
  "text": "Translated text..."
}

// Respuesta:
{
  ok: true,
  msg: "Sección actualizada",
  section: {
    _id: "608a2f77bcf86cd799439022",
    contentId: "507f1f77bcf86cd799439011",  // ← MISMO contentId
    sectionName: "hero",
    lang: "en",
    title: "Welcome",
    ...
  }
}
```

### 3. Obtener contenido por idioma:

```javascript
// Obtener todas las secciones en español
GET /api/sections?lang=es

// Obtener todas las secciones en inglés (incluye las creadas automáticamente)
GET /api/sections?lang=en
```

### 4. Eliminar contenido (Cascada Automática):

```javascript
DELETE /api/sections/507f1f77bcf86cd799439011

// Resultado:
// ✓ Se elimina la versión ES (ID proporcionado)
// ✓ Se eliminan AUTOMÁTICAMENTE todas las traducciones (versión EN)
// ✓ Se borran todos los documentos con el mismo contentId

// Respuesta:
{
  ok: true,
  msg: "Sección y todas sus traducciones borradas",
  deletedCount: 2  // ES + EN
}

// Nota: NO es necesario borrar manualmente cada idioma
```

### 5. Buscar por slug con fallback (Máquinas):

```javascript
// Caso 1: Buscar slug español con idioma español
GET /api/maquinaria/maquina/slug/torno-cnc?lang=es
// ✓ Devuelve versión ES directamente

// Caso 2: Buscar slug español con idioma inglés (fallback inteligente)
GET /api/maquinaria/maquina/slug/torno-cnc?lang=en
// ✓ Encuentra el contentId del slug ES
// ✓ Busca versión EN con ese contentId
// ✓ Devuelve versión EN si existe, o ES con aviso si no existe

// Caso 3: Buscar slug inglés con idioma inglés
GET /api/maquinaria/maquina/slug/cnc-lathe-en?lang=en
// ✓ Devuelve versión EN directamente
```

## Consideraciones Importantes

### 1. Creación Automática de Traducciones

**¿Cuándo se crea automáticamente la versión EN?**

- Solo al crear contenido **nuevo** en español (sin `contentId` existente)
- Si se proporciona `contentId`, NO se crea versión EN (se asume que es una traducción manual)

**¿Qué se crea automáticamente?**

- Copia idéntica del contenido ES
- Mismo `contentId`
- `lang: 'en'`
- `sectionName` o `name` con sufijo ` EN` (ej: "Cabecera EN", "Torno CNC EN")
- Slug con sufijo `-en` (si existe)

**Flujo recomendado:**

1. Crear contenido en español (se crea ES + EN automáticamente)
2. Editar versión EN con contenido traducido
3. Las actualizaciones (PUT) NO crean traducciones, solo modifican el documento específico

### 2. Eliminación en Cascada

**¿Qué se elimina al borrar?**

- El documento con el ID proporcionado
- **TODOS** los documentos con el mismo `contentId` (todas las traducciones)

**Ejemplo:**

```javascript
// Tienes: ES (ID: abc) + EN (ID: def), ambos con contentId: "xyz"
DELETE / api / sections / abc;
// Resultado: Se borran tanto abc (ES) como def (EN)
```

**Importante:**

- No es necesario borrar manualmente cada idioma
- La respuesta incluye `deletedCount` con el número total de documentos eliminados

### 3. ContentId como Vínculo

- **Auto-generado**: Si no se proporciona `contentId` al crear, se genera automáticamente
- **Vínculo manual**: Para crear traducción adicional manualmente, proporciona el `contentId` de la versión original
- **Inmutable**: Una vez creado el documento, el `contentId` no debería cambiar
- **Único por idioma**: El índice compuesto `(contentId, lang)` garantiza solo una versión por idioma

### 4. Migración y Datos Existentes

**Para datos creados ANTES de la internacionalización:**

La migración `npm run migrate:contentid` añade `contentId` y crea versiones EN:

- Añade `contentId` a documentos existentes
- Crea versiones EN como copias
- `sectionName`/`name` con sufijo ` EN`
- Slug con sufijo `-en`

**Para datos creados DESPUÉS de la internacionalización:**

- ✓ Las versiones EN se crean **automáticamente** al crear contenido
- ✓ NO es necesario ejecutar migraciones
- ✓ Solo editar las versiones EN para traducir

**Actualizar traducciones creadas automáticamente:**

```javascript
// 1. Obtener versión EN creada automáticamente
GET /api/maquinaria?lang=en

// 2. Actualizar con contenido traducido
PUT /api/maquinaria/:id?lang=en
{
  "name": "CNC Lathe",          // Traducido
  "category": "CNC Machinery",   // Traducido
  "features": [...],             // Traducido
  "slug": "cnc-lathe"            // Slug en inglés (cambiar -en)
}
```

### 5. Unicidad de Contenido

**ANTES (sin contentId):**

- No había forma de saber qué secciones/máquinas eran la misma pero traducidas
- Problemas al buscar por slug en diferentes idiomas

**AHORA (con contentId + creación automática):**

- Todas las traducciones del mismo contenido comparten `contentId`
- Al crear contenido, se generan ES + EN automáticamente
- Búsquedas por slug funcionan entre idiomas usando el `contentId` como puente
- DELETE elimina todas las traducciones automáticamente

## Próximos Pasos Recomendados

### Backend

- ✅ Campo `contentId` implementado
- ✅ Índices compuestos únicos
- ✅ Búsqueda inteligente por slug con fallback
- ✅ Generación automática de `contentId`
- 🔲 Endpoint para obtener todas las traducciones de un `contentId`:
  ```javascript
  GET /api/sections/translations/:contentId
  // Devuelve: [versionES, versionEN, ...]
  ```
- 🔲 Validación de que `contentId` existe antes de crear traducción

### Frontend

- 🔲 Selector de idioma que modifica query param `?lang=X`
- 🔲 Al editar contenido, mostrar versiones disponibles (ES, EN)
- 🔲 Botón "Crear traducción" que copia `contentId` al formulario
- 🔲 Indicador visual de qué traducciones existen/faltan
- 🔲 Manejo de respuestas con `translationMissing: true` (mostrar en idioma disponible con aviso)
- 🔲 Manejo de respuestas con `slugMismatch: true` (hacer redirect al slug correcto)

### Base de Datos

- 🔲 Crear índices manualmente si MongoDB no los crea automáticamente:
  ```javascript
  db.sections.createIndex({ contentId: 1, lang: 1 }, { unique: true });
  db.maquinas.createIndex({ contentId: 1, lang: 1 }, { unique: true });
  db.maquinas.createIndex({ slug: 1, lang: 1 });
  ```

## Troubleshooting

### Error: "E11000 duplicate key error collection"

**Causa**: Intentas crear dos documentos con el mismo `(contentId, lang)`

**Solución**: Solo puede haber una versión por idioma. Usa PUT para actualizar en lugar de POST.

### Búsqueda por slug devuelve `translationMissing: true`

**Causa**: No existe traducción al idioma solicitado

**Solución Frontend**:

```javascript
if (response.translationMissing) {
	// Mostrar contenido en idioma disponible con mensaje:
	// "This content is not available in English yet. Showing Spanish version."
}
```

### Slugs duplicados con sufijo `-en` después de migración

**Causa**: Migración automática añade `-en` para evitar conflictos

**Solución**: Actualiza manualmente los slugs de versiones EN con nombres apropiados en inglés. { "sectionName": "hero", "title": "Bienvenido" }

````

### Para crear contenido en inglés:

```javascript
POST /api/sections
{
  "sectionName": "hero",
  "lang": "en",
  "title": "Welcome"
}
````

### Para obtener contenido en un idioma específico:

```javascript
GET /api/sections?lang=en
GET /api/maquinaria/5fb15988fb855731d4d459df?lang=en
```

## Consideraciones

1. **Unicidad**: Ahora se pueden tener múltiples secciones/máquinas con el mismo nombre pero en diferentes idiomas
2. **Default**: Si no se especifica `lang`, se asume 'es'
3. **Validación**: Solo se aceptan los valores 'es' y 'en' para el campo `lang`
4. **Búsqueda por slug**: Los slugs deben ser únicos por idioma, no a nivel global

## Próximos Pasos Recomendados

- Actualizar el frontend para enviar el parámetro `lang` según el idioma seleccionado por el usuario
- Considerar añadir índices compuestos en MongoDB para mejorar rendimiento:
  ```javascript
  sectionModel.index({ sectionName: 1, lang: 1 }, { unique: true });
  maquinaModel.index({ name: 1, lang: 1 });
  maquinaModel.index({ slug: 1, lang: 1 }, { unique: true });
  ```
