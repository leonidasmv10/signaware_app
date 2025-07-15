// Script de prueba para verificar el manejo de tokens caducados
// Ejecutar en la consola del navegador

console.log('🧪 Probando manejo de tokens caducados...');

// Función para simular una petición con token caducado
const testTokenExpiration = async () => {
  try {
    // Simular una petición que devuelve 401
    const response = await fetch('/api/agent/text_generation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_here',
      },
      body: JSON.stringify({ message: 'test', model: 'gemini' }),
    });

    if (response.status === 401) {
      console.log('✅ Token caducado detectado correctamente');
      console.log('🔄 Redirigiendo al login...');
      
      // Simular el manejo de token caducado
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem('sound_detections');
      
      // Disparar evento de notificación
      window.dispatchEvent(new CustomEvent('tokenExpired'));
      
      console.log('📢 Notificación de token expirado enviada');
      
      // Simular redirección después de 2 segundos
      setTimeout(() => {
        console.log('🔄 Redirigiendo a /login...');
        // window.location.href = '/login';
      }, 2000);
      
    } else {
      console.log('❌ Error: No se detectó token caducado');
    }
  } catch (error) {
    console.log('✅ Error capturado correctamente:', error.message);
  }
};

// Función para probar la validación de token
const testTokenValidation = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('❌ No hay token almacenado');
    return;
  }
  
  try {
    const response = await fetch('/api/user/validate-token/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token válido:', data);
    } else {
      console.log('❌ Token inválido o caducado');
    }
  } catch (error) {
    console.log('❌ Error validando token:', error);
  }
};

// Función para limpiar tokens (simular logout)
const clearTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem('sound_detections');
  console.log('🧹 Tokens limpiados');
};

// Función para mostrar estado actual
const showCurrentState = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  console.log('📊 Estado actual:');
  console.log('  - Token:', token ? 'Presente' : 'Ausente');
  console.log('  - Refresh Token:', refreshToken ? 'Presente' : 'Ausente');
  console.log('  - URL actual:', window.location.href);
};

// Exportar funciones para uso en consola
window.testTokenExpiration = testTokenExpiration;
window.testTokenValidation = testTokenValidation;
window.clearTokens = clearTokens;
window.showCurrentState = showCurrentState;

console.log('📋 Funciones disponibles:');
console.log('  - testTokenExpiration() - Prueba detección de token caducado');
console.log('  - testTokenValidation() - Valida token actual');
console.log('  - clearTokens() - Limpia tokens del localStorage');
console.log('  - showCurrentState() - Muestra estado actual');

// Mostrar estado inicial
showCurrentState(); 