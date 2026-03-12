# API Billetera - Documentación para Frontend

## Base URL
```
http://localhost:3001
```

## Autenticación
La API usa JWT Bearer Token para endpoints protegidos.
```
Authorization: Bearer <token_jwt>
```

## Formato de Respuesta
Todas las respuestas siguen este formato:
```json
{
  "success": true|false,
  "cod_error": "00"|"01"|"02",
  "message_error": "",
  "data": {}
}
```

- **cod_error**: 
  - `00`: Éxito
  - `01`: Error de validación/lógica
  - `02`: Error interno

---

## 🔐 Autenticación (Auth)

### 1. Registrar Usuario
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez", 
  "documento": "123456789",
  "telefono": "3001234567"
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "id": "user_id",
    "email": "usuario@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "123456789",
    "message": "Usuario registrado. Por favor verifica tu email para activar la cuenta."
  }
}
```

### 2. Verificar Email
```http
POST /auth/verify-email
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "verificationCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "message": "Cuenta verificada exitosamente. Ya puedes iniciar sesión."
  }
}
```

### 3. Reenviar Código de Verificación
```http
POST /auth/resend-verification
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

### 4. Iniciar Sesión
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "access_token": "jwt_token",
    "user": {
      "id": "user_id",
      "email": "usuario@ejemplo.com",
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
}
```

### 5. Obtener Perfil (Requiere Token)
```http
GET /auth/profile
Authorization: Bearer <token>
```

### 6. Actualizar Perfil (Requiere Token)
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez González",
  "telefono": "3009876543"
}
```

---

## 💳 Billetera (Wallet)

### 1. Consultar Saldo
```http
GET /billetera/saldo?documento=123456789
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "documento": "123456789",
    "saldo": 50000,
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Recargar Saldo
```http
POST /billetera/recarga
```

**Body:**
```json
{
  "documento": "123456789",
  "valor": 50000
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "Recarga exitosa",
  "data": {
    "documento": "123456789",
    "saldo": 100000,
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 3. Iniciar Pago (Generar Token)
```http
POST /billetera/iniciar-pago
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "documento": "123456789",
  "monto": 1000
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "mensaje": "Se ha enviado un correo con el código de confirmación.",
    "sessionId": "220c3814-71ff-4ab4-b2a8-9b0fa896f94f"
  }
}
```

### 4. Realizar Pago con Token
```http
POST /billetera/pago-token
```

**Body:**
```json
{
  "origen": "123456789",
  "destino": "987654321",
  "monto": 20000,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "mensaje": "Pago realizado con éxito",
    "monto": 20000
  }
}
```

### 5. Confirmar Pago
```http
POST /billetera/confirmar-pago
```

**Body:**
```json
{
  "sessionId": "220c3814-71ff-4ab4-b2a8-9b0fa896f94f",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "mensaje": "Pago confirmado y realizado con éxito",
    "monto": 1000
  }
}
```

---

## 👥 Clientes

### 1. Registrar Cliente
```http
POST /clientes
```

**Body:**
```json
{
  "documento": "123456789",
  "nombres": "Juan Pérez",
  "email": "juan.perez@example.com",
  "celular": "+573001234567"
}
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "Registro exitoso",
  "data": {
    "documento": "123456789",
    "nombres": "Juan Pérez",
    "email": "juan.perez@example.com",
    "celular": "+573001234567",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 2. Buscar Cliente por Documento (Requiere Token)
```http
GET /clientes/buscar?documento=123456789
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "cod_error": "00",
  "message_error": "",
  "data": {
    "documento": "123456789",
    "nombres": "Juan Pérez",
    "email": "juan.perez@example.com",
    "celular": "+573001234567"
  }
}
```

### 3. Obtener Clientes Frecuentes (Requiere Token)
```http
GET /clientes/frecuentes?limit=10
Authorization: Bearer <token>
```

### 4. Estadísticas de Clientes (Requiere Token)
```http
GET /clientes/estadisticas
Authorization: Bearer <token>
```

---

## 🚨 Errores Comunes

### Email no verificado
```json
{
  "success": false,
  "cod_error": "01",
  "message_error": "Por favor verifica tu email antes de iniciar sesión"
}
```

### Credenciales inválidas
```json
{
  "success": false,
  "cod_error": "01",
  "message_error": "Credenciales inválidas"
}
```

### Saldo insuficiente
```json
{
  "success": false,
  "cod_error": "01",
  "message_error": "Saldo insuficiente"
}
```

### Token inválido
```json
{
  "success": false,
  "cod_error": "01",
  "message_error": "Token inválido o expirado"
}
```

---

## 🔄 Flujo Completo de Pago

1. **Login**: `POST /auth/login` → Obtener token JWT
2. **Consultar saldo**: `GET /billetera/saldo?documento=XXX`
3. **Iniciar pago**: `POST /billetera/iniciar-pago` → Recibir email con token
4. **Realizar pago**: `POST /billetera/pago-token` → Usar token del email
5. **Confirmar pago**: `POST /billetera/confirmar-pago` → Finalizar transacción

---

## 📝 Notas Importantes

- **JWT expira en 10 minutos** (`JWT_EXPIRES_IN=10m`)
- **Rate limiting**: 100 requests por minuto por IP
- **Todos los montos** son en pesos colombianos (COP)
- **Documentos** deben ser strings (pueden incluir ceros)
- **Emails** son case-insensitive
- **Teléfonos** deben incluir código de país (+57)

---

## 🧪 Ejemplos de Uso

### JavaScript/Fetch
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Consultar saldo
const getBalance = async (documento, token) => {
  const response = await fetch(`http://localhost:3001/billetera/saldo?documento=${documento}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### cURL
```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Consultar saldo
curl "http://localhost:3001/billetera/saldo?documento=123456789" \
  -H "Authorization: Bearer <token>"
```

---

## 📊 Swagger UI
Para documentación interactiva, visita:
```
http://localhost:3001/api
```

---

## 🔧 Configuración del Servidor
- **Puerto**: 3001
- **Base de datos**: MongoDB
- **Cache**: Redis
- **Logs**: Nivel info
- **Rate Limit**: 100 req/min
