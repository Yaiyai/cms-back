# Guía de Migración Frontend - API Internacionalizada

## 📋 Resumen de Cambios

La API ahora soporta **contenido multiidioma (ES/EN)** manteniendo **retrocompatibilidad total**. El frontend puede seguir funcionando sin cambios mientras se adapta gradualmente.

## ✅ Lo Que NO Cambia (Retrocompatible)

### Sin modificaciones en el frontend, la API sigue funcionando:

```javascript
// Estas llamadas siguen funcionando exactamente igual
GET  /api/sections                    // → Devuelve secciones ES
GET  /api/sections/:id                // → Devuelve sección ES
POST /api/sections                    // → Crea sección ES (+ versión EN automática)
PUT  /api/sections/:id                // → Actualiza sección
DELETE /api/sections/:id              // → Borra sección y todas sus traducciones

GET  /api/maquinaria                  // → Devuelve máquinas ES
GET  /api/maquinaria/:id              // → Devuelve máquina ES
GET  /api/maquinaria/maquina/slug/:slug // → Devuelve máquina ES
POST /api/maquinaria                  // → Crea máquina ES (+ versión EN automática)
PUT  /api/maquinaria/:id              // → Actualiza máquina
DELETE /api/maquinaria/:id            // → Borra máquina y todas sus traducciones
```

**Sin parámetro `lang`**: La API devuelve versión ES por defecto.

## 🌍 Cambios para Soporte Multiidioma

### 1. Nuevos Campos en las Respuestas

Todos los documentos ahora incluyen:

```javascript
{
  _id: "507f1f77bcf86cd799439011",
  contentId: "507f1f77bcf86cd799439011",  // ← NUEVO: Vincula traducciones
  lang: "es",                             // ← NUEVO: Idioma del contenido
  sectionName: "Cabecera",
  title: "Bienvenidos",
  // ... resto de campos
}
```

**Importante:**

- `contentId`: Mismo valor para todas las traducciones del mismo contenido
- `lang`: `"es"` o `"en"`

### 2. Query Param `lang` para Obtener Traducciones

Para obtener contenido en un idioma específico:

```javascript
// Obtener secciones en inglés
GET /api/sections?lang=en

// Obtener sección específica en inglés
GET /api/sections/507f1f77bcf86cd799439011?lang=en

// Obtener máquinas en inglés
GET /api/maquinaria?lang=en

// Obtener máquina por slug en inglés
GET /api/maquinaria/maquina/slug/torno-cnc?lang=en
```

#### ✨ Fallback Automático de Traducción

La API incluye un **sistema inteligente de fallback** para búsquedas por ID:

**Escenarios al buscar por ID:**

```javascript
// Caso 1: ID es del idioma solicitado
GET /api/sections/507f-es-id?lang=es
// → 200 OK - Devuelve la sección directamente

// Caso 2: ID es de OTRO idioma, pero existe traducción
GET /api/sections/507f-es-id?lang=en
// La API automáticamente:
// 1. Encuentra el documento con ese ID (lang="es")
// 2. Obtiene su contentId
// 3. Busca la versión con ese contentId y lang="en"
// 4. Devuelve la versión EN
// → 200 OK con flag langMismatch: true

// Caso 3: ID es de otro idioma y NO existe traducción
GET /api/sections/507f-es-id?lang=en
// La API:
// 1. Encuentra el documento con ese ID (lang="es")
// 2. No encuentra versión EN
// 3. Devuelve la versión ES encontrada
// → 200 OK con flag translationMissing: true

// Caso 4: ID no existe en absoluto
GET /api/sections/id-inexistente?lang=en
// → 404 NOT FOUND
```

**Respuestas con flags especiales:**

```javascript
// Traducción encontrada (ID de otro idioma)
{
  ok: true,
  msg: "Sección encontrada (traducción)",
  langMismatch: true,         // ← Flag: ID era de otro idioma
  requestedLang: "en",
  section: { /* versión EN */ }
}

// Sin traducción disponible
{
  ok: true,
  msg: "Sección encontrada pero sin traducción al idioma solicitado",
  translationMissing: true,   // ← Flag: No existe traducción
  requestedLang: "en",
  availableLang: "es",
  section: { /* versión ES */ }
}
```

**Manejar en Frontend:**

```javascript
const response = await fetch(`/api/sections/${sectionId}?lang=${language}`);
const result = await response.json();

if (result.ok) {
	const section = result.section;

	if (result.langMismatch) {
		console.log('Se obtuvo traducción desde ID de otro idioma');
		// La sección ya está en el idioma solicitado, usar normalmente
	}

	if (result.translationMissing) {
		console.warn(`Contenido no disponible en ${result.requestedLang}`);
		// Mostrar aviso al usuario: "Este contenido está solo en español"
		// Opción: Mostrar contenido en idioma disponible con advertencia
	}
}
```

**Ventaja para el Frontend:**

✅ **Ahora puedes hacer esto sin problemas:**

```javascript
// Guardar solo UN ID (puedes usar el de ES o EN)
const sectionId = '507f-es-id';

// Funciona sin importar el idioma solicitado
fetch(`/api/sections/${sectionId}?lang=en`);
// → Devuelve versión EN automáticamente o ES si no existe traducción

fetch(`/api/sections/${sectionId}?lang=es`);
// → Devuelve versión ES directamente
```

❌ **Ya NO necesitas:**

- Guardar IDs separados por idioma
- Buscar primero por contentId y luego obtener el ID correcto
- Hacer listados completos solo para encontrar un documento

### 3. Creación Automática de Traducciones

**Comportamiento actual (POST):**

Al crear contenido, se generan AUTOMÁTICAMENTE 2 versiones:

```javascript
POST /api/sections
{
  "sectionName": "hero",
  "title": "Bienvenido",
  "text": "Texto en español"
}

// RESULTADO:
// ✓ Versión ES creada (devuelta en la respuesta)
// ✓ Versión EN creada automáticamente como copia (background)
//   - sectionName: "hero EN"
//   - title: "Bienvenido" (mismo contenido, pendiente de traducir)
//   - lang: "en"
//   - contentId: igual a la versión ES
```

**Implicaciones para el Frontend:**

1. **Después de crear contenido**, ya existe una versión EN (copia)
2. El usuario debe **editar la versión EN** para traducir el contenido
3. Para mostrar el contenido traducido, hacer: `GET /api/sections?lang=en`

### 4. Edición de Traducciones

Para editar una traducción específica, usar el param `lang`:

```javascript
// 1. Obtener la versión EN para editar
GET /api/sections?lang=en
// Buscar la sección con el contentId deseado
// Obtener su _id

// 2. Actualizar solo la versión EN
PUT /api/sections/608a2f77bcf86cd799439022?lang=en
{
  "title": "Welcome",
  "text": "Text in English"
}

// La versión ES permanece intacta
```

**Sin el param `lang`**: El UPDATE buscará solo por ID (sin filtrar por idioma).

### 5. Eliminación en Cascada

**Nuevo comportamiento:**

```javascript
DELETE /api/sections/507f1f77bcf86cd799439011

// RESULTADO:
// ✓ Se borra la versión ES (ID proporcionado)
// ✓ Se borran AUTOMÁTICAMENTE todas las traducciones (versión EN)

// Respuesta:
{
  ok: true,
  msg: "Sección y todas sus traducciones borradas",
  deletedCount: 2  // ES + EN
}
```

**Ya NO es necesario borrar manualmente cada idioma.**

## 🔧 Adaptación Recomendada del Frontend

### Fase 1: Sin Cambios (Estado Actual)

- Frontend funciona normalmente
- Solo muestra contenido ES
- Ignora los nuevos campos `contentId` y `lang`

### Fase 2: Selector de Idioma

```javascript
// 1. Añadir selector de idioma (ES/EN)
const [language, setLanguage] = useState('es');

// 2. Modificar llamadas API con query param
const fetchSections = async () => {
	const response = await fetch(`/api/sections?lang=${language}`);
	const data = await response.json();
	return data.sections;
};

// 3. Mostrar contenido según idioma seleccionado
```

### Fase 3: Gestión de Traducciones en Admin

**Listar contenido con indicador de traducción:**

```javascript
const fetchSectionsWithTranslations = async () => {
	const [sectionsES, sectionsEN] = await Promise.all([fetch('/api/sections?lang=es').then((r) => r.json()), fetch('/api/sections?lang=en').then((r) => r.json())]);

	// Agrupar por contentId para mostrar traducciones juntas
	const grouped = sectionsES.sections.map((secES) => {
		const secEN = sectionsEN.sections.find((s) => s.contentId === secES.contentId);
		return {
			contentId: secES.contentId,
			es: secES,
			en: secEN,
			hasTranslation: !!secEN && secEN.title !== secES.title, // Verificar si está traducido
		};
	});

	return grouped;
};
```

**Interfaz de edición simplificada con fallback automático:**

```jsx
function SectionEditor({ sectionId }) {
	const [activeTab, setActiveTab] = useState('es'); // 'es' | 'en'
	const [sectionData, setSectionData] = useState(null);
	const [warning, setWarning] = useState(null);

	// Obtener la versión en el idioma activo
	useEffect(() => {
		const fetchSection = async () => {
			// Usar SIEMPRE el mismo ID, el backend hace fallback automático
			const response = await fetch(`/api/sections/${sectionId}?lang=${activeTab}`);
			const result = await response.json();

			if (result.ok) {
				setSectionData(result.section);

				// Verificar flags especiales
				if (result.translationMissing) {
					setWarning(`Este contenido no está disponible en ${activeTab.toUpperCase()}. Mostrando versión en ${result.availableLang.toUpperCase()}.`);
				} else if (result.langMismatch) {
					setWarning(null); // Traducción encontrada correctamente
				} else {
					setWarning(null); // Idioma coincide perfectamente
				}
			}
		};

		fetchSection();
	}, [sectionId, activeTab]);

	const handleUpdate = async (data) => {
		// Actualizar en el idioma activo
		await fetch(`/api/sections/${sectionId}?lang=${activeTab}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});
	};

	return (
		<div>
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tab value='es'>Español</Tab>
				<Tab value='en'>English</Tab>
			</Tabs>

			{warning && <Alert type='warning'>{warning}</Alert>}

			{sectionData && <Form data={sectionData} onSave={handleUpdate} />}
		</div>
	);
}
```

**Ventajas del nuevo enfoque:**

✅ Guardas solo UN ID (puedes usar el de ES o EN indistintamente)  
✅ Cambias de idioma simplemente cambiando `lang` param  
✅ El backend devuelve la traducción automáticamente  
✅ Recibes flags cuando falta traducción o hay mismatch

````

## 🚨 Consideraciones Importantes

### 1. Nombres con Sufijo " EN"

Las versiones EN creadas automáticamente tienen sufijos:

- `sectionName`: "Cabecera" → "Cabecera EN"
- `name` (máquinas): "Torno CNC" → "Torno CNC EN"

**Recomendación:** Al editar la versión EN, cambiar el nombre por uno traducido:

```javascript
PUT /api/sections/:id?lang=en
{
  "sectionName": "Header",  // Cambiar de "Cabecera EN" a "Header"
  "title": "Welcome",
  "text": "..."
}
````

### 2. Búsqueda por Slug (Máquinas)

La búsqueda por slug tiene **fallback inteligente**:

```javascript
GET /api/maquinaria/maquina/slug/torno-cnc?lang=en

// Si no existe slug "torno-cnc" en EN:
// 1. Busca "torno-cnc" en cualquier idioma
// 2. Obtiene su contentId
// 3. Busca la versión EN con ese contentId
// 4. Si existe, la devuelve con flags especiales

// Respuesta (sin traducción):
{
  ok: true,
  translationMissing: true,  // ← Verificar este flag
  requestedLang: "en",
  availableLang: "es",
  data: { /* versión ES */ }
}
```

**Manejar en Frontend:**

```javascript
const response = await fetch(`/api/maquinaria/maquina/slug/${slug}?lang=${language}`);
const result = await response.json();

if (result.translationMissing) {
	// Mostrar aviso: "Este contenido no está disponible en inglés"
	// Opción: Mostrar en español con advertencia
}

if (result.slugMismatch) {
	// Redirigir al slug correcto en el idioma solicitado
	window.location.href = `/maquinaria/${result.correctSlug}`;
}
```

### 3. Creación de Contenido

Al crear contenido nuevo:

```javascript
POST /api/sections
{
  "sectionName": "new-section",
  "title": "Título",
  // NO enviar contentId (se genera automáticamente)
  // NO enviar lang (default 'es', crea ES + EN)
}

// Respuesta:
{
  ok: true,
  section: {
    _id: "...",
    contentId: "...",  // ← Guardar para editar versión EN después
    lang: "es",
    // ...
  }
}

// Ahora existe:
// - Versión ES (devuelta)
// - Versión EN automática con sectionName: "new-section EN"
```

**Flujo recomendado:**

1. Usuario crea contenido en formulario (español)
2. API crea ES + EN
3. Mostrar en UI: "Contenido creado. ¿Deseas traducirlo ahora?"
4. Si sí: abrir formulario para editar versión EN

### 4. Eliminación

Al borrar contenido, **confirmar que el usuario entiende que se borran TODAS las traducciones**:

```javascript
const handleDelete = async (sectionId) => {
	const confirm = window.confirm('¿Borrar esta sección? Se eliminarán TODAS las traducciones (ES y EN)');

	if (confirm) {
		const response = await fetch(`/api/sections/${sectionId}`, {
			method: 'DELETE',
		});

		const result = await response.json();
		console.log(`${result.deletedCount} documentos eliminados`);
	}
};
```

## 📊 Ejemplo Completo: Listado con Traducciones

```javascript
function SectionsList() {
	const [language, setLanguage] = useState('es');
	const [sections, setSections] = useState([]);
	const [allSections, setAllSections] = useState({ es: [], en: [] });

	useEffect(() => {
		// Cargar ambos idiomas para verificar qué está traducido
		const fetchAll = async () => {
			const [esData, enData] = await Promise.all([fetch('/api/sections?lang=es').then((r) => r.json()), fetch('/api/sections?lang=en').then((r) => r.json())]);

			setAllSections({ es: esData.sections, en: enData.sections });
		};

		fetchAll();
	}, []);

	useEffect(() => {
		// Mostrar contenido según idioma seleccionado
		setSections(allSections[language]);
	}, [language, allSections]);

	const getTranslationStatus = (section) => {
		const enVersion = allSections.en.find((s) => s.contentId === section.contentId);

		if (!enVersion) return 'no-translation';

		// Verificar si realmente está traducido (no es solo copia)
		const isTranslated = enVersion.title !== section.title || !enVersion.sectionName.endsWith(' EN');

		return isTranslated ? 'translated' : 'pending';
	};

	return (
		<div>
			<select value={language} onChange={(e) => setLanguage(e.target.value)}>
				<option value='es'>Español</option>
				<option value='en'>English</option>
			</select>

			<ul>
				{sections.map((section) => {
					const status = getTranslationStatus(section);

					return (
						<li key={section._id}>
							<h3>{section.title}</h3>
							<p>{section.sectionName}</p>

							{language === 'es' && (
								<span>
									{status === 'translated' && '✅ Traducido'}
									{status === 'pending' && '⚠️ Traducción pendiente'}
									{status === 'no-translation' && '❌ Sin versión EN'}
								</span>
							)}

							<button onClick={() => editSection(section)}>Editar</button>
							<button onClick={() => deleteSection(section._id)}>Borrar</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
```

## 🔄 Migración Paso a Paso

### 1. Verificar que la API funciona sin cambios

- Probar que todas las llamadas actuales funcionan
- No debería haber errores

### 2. Añadir selector de idioma básico

- Dropdown ES/EN
- Modificar llamadas GET para incluir `?lang=${language}`
- Probar navegación en ambos idiomas

### 3. Adaptar panel de administración

- Mostrar indicador de traducciones disponibles
- UI para editar versión ES y EN por separado
- Usar tabs o split view

### 4. Actualizar flujo de creación

- Informar al usuario que se crea versión EN automática
- Ofrecer editar traducción inmediatamente después de crear

### 5. Adaptar confirmaciones de eliminación

- Advertir que se borran todas las traducciones
- Mostrar contador de documentos eliminados

## ❓ FAQ

**¿Puedo seguir usando la API sin cambios?**  
Sí, totalmente. Sin el param `lang`, devuelve contenido ES por defecto.

**¿Qué pasa si busco por ID con un idioma que no corresponde?**  
✨ **Ahora la API hace fallback inteligente**. Por ejemplo:

- Tienes sección con `_id="abc"` y `lang="es"`
- Si haces `GET /api/sections/abc?lang=en`:
  1. La API encuentra el documento con ese ID (lang="es")
  2. Usa su `contentId` para buscar la versión EN
  3. Si existe EN: la devuelve con flag `langMismatch: true`
  4. Si NO existe EN: devuelve la versión ES con flag `translationMissing: true`

**Ya NO devuelve 404** si el ID existe (aunque sea en otro idioma).

**¿Qué pasa si llamo a GET con lang=en y no existe traducción?**  
Depende del endpoint:

- **Listados** (`/api/sections?lang=en`): devuelve array vacío si no hay secciones EN
- **Por ID** (`/api/sections/:id?lang=en`): devuelve el contenido disponible (ES) con flag `translationMissing: true`
- **Por slug en máquinas**: intenta fallback, devuelve versión ES con flag `translationMissing: true` si no existe EN

**¿Tengo que crear manualmente las versiones EN?**  
No. Al crear contenido (POST), se genera automáticamente una versión EN como copia. Solo necesitas editarla.

**¿Puedo crear contenido directamente en inglés?**  
Sí, envía `lang: 'en'` en el body del POST. En ese caso NO se crea versión ES automática.

**¿Cómo sé qué contenido está realmente traducido?**  
Compara los campos entre versiones ES y EN. Si `sectionName` termina en " EN" o el contenido es idéntico, está pendiente de traducir.

**¿Cómo guardo referencias a contenido multiidioma en mi frontend?**  
✨ **Ahora mucho más simple**: Guarda UN solo ID (puede ser ES o EN, da igual).

```javascript
// Guardar cualquier ID
const sectionId = '507f-es-id'; // Puede ser de ES o EN

// Funciona con cualquier idioma
fetch(`/api/sections/${sectionId}?lang=en`); // → Devuelve EN automáticamente
fetch(`/api/sections/${sectionId}?lang=es`); // → Devuelve ES automáticamente
```

Ya NO necesitas guardar `contentId` ni hacer búsquedas complejas. El backend resuelve la traducción correcta automáticamente.

**¿Qué significan los flags `langMismatch` y `translationMissing`?**

- **`langMismatch: true`**: El ID que enviaste era de otro idioma, pero encontramos y devolvimos la traducción correcta
- **`translationMissing: true`**: No existe traducción al idioma solicitado, devolvemos el contenido en el idioma disponible

**¿Tengo que validar estos flags en mi aplicación?**  
Opcional. Los flags sirven para:

- Mostrar avisos al usuario ("Este contenido no está disponible en inglés")
- Analytics/logging de contenido faltante
- UX mejorado

Si no los usas, la API de todos modos devuelve el mejor contenido disponible.

## 📞 Soporte

Para dudas sobre la implementación:

- Ver ejemplos en: [INTERNATIONALIZATION.md](INTERNATIONALIZATION.md)
- Revisar controladores: [routes/controllers/](routes/controllers/)
