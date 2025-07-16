# 🎧 Signaware Frontend

**Interfaz de Usuario para Asistencia Auditiva Inteligente**

Signaware Frontend es una aplicación React que proporciona una interfaz intuitiva y accesible para personas con discapacidad auditiva. La aplicación combina grabación de audio en tiempo real, chat inteligente y alertas visuales para crear una experiencia completa de asistencia.

## 🎨 Diseño y UX

### **Principios de Diseño**
- **Minimalismo**: Interfaz limpia y sin distracciones
- **Accesibilidad**: Contraste alto, textos legibles, navegación clara
- **Responsive**: Adaptable a todos los dispositivos
- **Feedback Visual**: Indicadores claros de estado y acciones

### **Paleta de Colores**
- **Azul principal**: Para elementos de acción
- **Gris secundario**: Para elementos de fondo
- **Verde**: Para estados de éxito
- **Amarillo**: Para advertencias
- **Rojo**: Para alertas de peligro
- **Fondo claro**: Para mejor legibilidad

## 🏗️ Arquitectura de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT APP                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   AuthContext   │  │  AudioContext   │  │   Chat System   │ │
│  │   (JWT)         │  │  (Recording)    │  │  (Messages)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    COMPONENT LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│  │ AudioListener│ │   Chat      │ │  Sidebar    │ │  Login   │ │
│  │ (Recording) │ │ (Messages)  │ │ (Nav)       │ │ (Auth)   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    SERVICE LAYER                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│  │   API       │ │   Audio     │ │   Auth      │ │  Storage │ │
│  │ (Fetch)     │ │ (WebRTC)    │ │ (JWT)       │ │ (Local)  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    EXTERNAL APIS                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │
│  │   Django    │ │   WebRTC    │ │   Browser   │ │  Netlify │ │
│  │   API       │ │ (Audio)     │ │ (Storage)   │ │ (Deploy) │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

La aplicación está construida con React y utiliza varios contextos para manejar el estado:

- **AuthContext**: Maneja autenticación y tokens JWT
- **AudioContext**: Controla grabación y procesamiento de audio
- **Chat System**: Maneja conversaciones con IA
- **Componentes**: Interfaz modular y reutilizable

## 🧩 Componentes Principales

### 🎤 **AudioListener - Grabación en Tiempo Real**
Monitorea el entorno auditivo de forma continua:
- **Grabación Automática**: Se activa cuando detecta sonidos por encima del umbral
- **Análisis en Tiempo Real**: Procesamiento inmediato con IA
- **Alertas Visuales**: Indicadores de colores según el tipo de sonido
- **Modo Manual/Automático**: Control del usuario sobre la grabación

**Estados de Audio**:
- 🟢 **Monitoreando**: Escuchando el entorno
- 🔴 **Grabando**: Capturando audio
- 🟡 **Procesando**: Analizando con IA
- ⚪ **Desactivado**: Modo manual

### 💬 **Chat - Asistente Inteligente**
Interfaz conversacional con IA especializada:
- **Chat en Tiempo Real**: Respuestas inmediatas
- **Historial Persistente**: Conversaciones guardadas
- **Tipos de Respuesta**: Texto, imágenes, recomendaciones
- **Integración RAG**: Información actualizada sobre audífonos

**Funcionalidades**:
- **Consultas sobre Audífonos**: Información técnica y recomendaciones
- **Búsqueda de Centros Médicos**: Ubicaciones y especialistas
- **Noticias Médicas**: Últimos avances en tecnología auditiva
- **Generación de Imágenes**: Visualización de dispositivos

### 🔐 **Sistema de Autenticación**
Componentes de seguridad:
- **Login**: Acceso con email/contraseña
- **Registro**: Creación de cuenta nueva
- **Recuperación**: Reset de contraseña
- **JWT**: Tokens seguros para sesiones

### 📱 **Sidebar - Navegación**
Elementos de navegación:
- **Logo**: Identidad de la aplicación
- **Menú Principal**: Navegación entre secciones
- **Estado de Audio**: Indicador de grabación
- **Perfil de Usuario**: Configuración y logout

## 🎯 Funcionalidades Principales

### **1. Detección de Sonidos**
- Umbral de volumen configurable
- Duración de grabación de 3 segundos
- Tasa de muestreo de 16kHz
- Análisis en tiempo real

### **2. Alertas Visuales**
Sistema de categorías de alertas:
- 🔴 **Peligro**: Sirenas, alarmas, cristales rompiéndose
- 🟡 **Atención**: Teléfonos, timbres, silbatos
- 🟢 **Social**: Conversaciones, gritos, risas
- 🔵 **Ambiente**: Pasos, vehículos, animales

### **3. Chat Inteligente**
Tipos de mensajes y funcionalidades:
- **Consultas sobre Audífonos**: Información técnica
- **Búsqueda de Centros Médicos**: Ubicaciones
- **Noticias Médicas**: Avances tecnológicos
- **Generación de Imágenes**: Visualización

## 🔧 Configuración y Variables de Entorno

### **Variables de Entorno**
- **VITE_API_URL**: URL de la API de Django
- **VITE_WS_URL**: URL para WebSockets
- **VITE_ENABLE_AUDIO_RECORDING**: Habilitar grabación
- **VITE_ENABLE_CHAT**: Habilitar chat
- **VITE_ENABLE_IMAGE_GENERATION**: Habilitar generación de imágenes

### **Configuración de Audio**
- **WebRTC**: Para acceso al micrófono
- **Análisis de Frecuencia**: Para detección de volumen
- **Grabación**: Formato WAV, mono, 16kHz
- **Procesamiento**: Envío automático a la API

## 🚀 Instalación y Desarrollo

### **1. Instalación de Dependencias**
```bash
npm install
```

### **2. Configuración de Desarrollo**
```bash
npm run dev
```

### **3. Construcción para Producción**
```bash
npm run build
```

## 📱 Componentes Detallados

### **AudioListener Component**
Componente que maneja la grabación de audio:
- Indicador de volumen visual
- Estados de grabación
- Control de activación/desactivación
- Integración con el contexto de audio

### **Chat Component**
Interfaz de conversación con IA:
- Historial de mensajes
- Entrada de texto
- Estados de carga
- Integración con múltiples modelos de IA

### **Login Component**
Sistema de autenticación:
- Formulario de login
- Validación de credenciales
- Manejo de errores
- Redirección automática

## 🎨 Estilos y CSS

### **Sistema de Diseño**
- **Tailwind CSS**: Framework de utilidades
- **Variables CSS**: Para colores y espaciado
- **Componentes Base**: Botones, inputs, cards
- **Animaciones**: Transiciones suaves

### **Animaciones**
- **Transiciones**: Para cambios de estado
- **Indicadores**: Para grabación y procesamiento
- **Barras de Volumen**: Actualización en tiempo real

## 🔧 Configuración de Despliegue

### **Netlify Configuration**
Configuración para despliegue en Netlify:
- Comando de construcción
- Directorio de publicación
- Redirecciones para SPA
- Variables de entorno

### **Variables de Entorno de Producción**
- URL de la API en producción
- Configuración de WebSockets
- Flags de funcionalidades

## 🧪 Testing

### **Tests Unitarios**
```bash
npm test
```

### **Tests de Integración**
Pruebas de componentes y funcionalidades:
- AudioListener
- Chat
- Autenticación
- Integración con API

## 📊 Monitoreo y Analytics

### **Métricas de Rendimiento**
- **Web Vitals**: Core Web Vitals
- **Error Tracking**: Captura de errores
- **User Analytics**: Comportamiento de usuarios

### **Error Tracking**
- **Error Boundaries**: Captura de errores de React
- **Logging**: Registro de errores
- **Notificaciones**: Alertas al usuario

## 🔮 Roadmap y Mejoras Futuras

### **Próximas Características**
- **Modo Offline**: Funcionalidad básica sin conexión
- **Notificaciones Push**: Alertas en segundo plano
- **Personalización**: Temas y configuraciones del usuario
- **Accesibilidad Avanzada**: Soporte para lectores de pantalla
- **PWA**: Instalación como aplicación nativa
- **Multilingüe**: Soporte para múltiples idiomas

### **Mejoras Técnicas**
- **Optimización de Bundle**: Code splitting y lazy loading
- **Caching Inteligente**: Service workers para datos
- **WebAssembly**: Procesamiento de audio más rápido
- **WebRTC Avanzado**: Mejor calidad de audio
- **Tests E2E**: Cypress para flujos completos

## 🤝 Contribución

### **Estructura del Proyecto**
```
signaware_app/
├── src/
│   ├── components/          # Componentes React
│   ├── context/            # Context API
│   ├── hooks/              # Custom hooks
│   ├── services/           # Servicios
│   ├── config/             # Configuración
│   └── assets/             # Recursos estáticos
├── public/                 # Archivos públicos
└── dist/                   # Build de producción
```

### **Guidelines de Desarrollo**
1. **Componentes Funcionales**: Usar hooks en lugar de clases
2. **Props Destructuring**: Extraer props al inicio del componente
3. **Error Boundaries**: Manejar errores gracefully
4. **Loading States**: Mostrar estados de carga apropiados
5. **Accessibility**: Incluir atributos ARIA y navegación por teclado

---

**🎧 Signaware Frontend** - Interfaz moderna y accesible para asistencia auditiva inteligente.
