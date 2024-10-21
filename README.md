# Digital Wallet Demo

Este proyecto es una demo de una aplicación de billetera digital con funcionalidad de pago basada en códigos QR. Incluye tanto una API backend construida con Node.js y Express, como una aplicación móvil frontend construida con React Native y Expo.

## Estructura del Proyecto

El proyecto consta de dos partes principales:

1. API Backend
2. Aplicación Móvil

### API Backend

El backend está construido con Node.js y Express, y utiliza Redis para el almacenamiento de datos. Proporciona endpoints para:

- Autenticación de usuarios
- Verificación de saldo
- Procesamiento de pagos
- Generación de códigos QR

Archivos clave:
- `app.js`: Archivo principal de la aplicación
- `Dockerfile`: Configuración de Docker para el backend
- `docker-compose.yaml`: Configuración de Docker Compose para todo el proyecto

### Aplicación Móvil

La aplicación móvil está construida con React Native y Expo. Proporciona una interfaz de usuario para:

- Registro e inicio de sesión de usuarios
- Ver el saldo
- Escanear códigos QR
- Realizar pagos

## Configuración e Instalación

### Requisitos Previos

- Node.js
- Docker
- Git

1. Abre tu terminal o símbolo del sistema.
2. Clona el repositorio:
   ```
   git clone https://github.com/cristianchivisky/digital-wallet-demo.git
   ```

### Configuración del Backend

1. Navega al directorio del backend:
2. Crea un archivo `.env` en el directorio del backend y agrega la siguiente línea:
   ```
   SECRET_KEY=tu_clave_secreta_aquí
   ```
3. Construye y ejecuta los contenedores de Docker:
   ```
   docker compose build
   docker compose up
   ```
   Esto iniciará el servidor Node.js y la base de datos Redis.

### Configuración de la Aplicación Móvil

1. Navega al directorio de la aplicación móvil:
2. Instala las dependencias:
   ```
   npm install
   ```
3. Inicia el servidor de desarrollo de Expo:
   ```
   npm run start
   ```

## Uso

1. Inicia la aplicación móvil en tu dispositivo o emulador.
2. Regístrate o inicia sesión con tus credenciales.
3. Ver tu saldo en la pantalla de inicio.
4. Para realizar un pago:
   - Haz clic en "Escanear Código QR"
   - Escanea un código QR válido
   - Confirma el pago en la pantalla de Pago

## Endpoints de la API

- `POST /register`: Registrar un nuevo usuario
- `POST /login`: Autenticar a un usuario y recibir un JWT
- `GET /balance`: Obtener el saldo actual del usuario
- `GET /generate-qr`: Generar un código QR para una transacción
- `POST /process-payment`: Procesar un pago

## Seguridad

- Se utilizan tokens JWT (JSON Web Tokens) para la autenticación.
- Las contraseñas se almacenan de manera segura mediante hashing.

## Mejoras Futuras

- Implementar actualizaciones de saldo en tiempo real
- Agregar característica de historial de transacciones
- Mejorar el manejo de errores y la retroalimentación al usuario
- Implementar pruebas unitarias e de integración

## Cómo Contribuir

¡Las contribuciones son bienvenidas! Aquí está cómo puedes contribuir a este proyecto:

1. Haz un fork del repositorio.
2. Clona tu repositorio bifurcado:
   ```
   git clone https://github.com/cristianchivisky/digital-wallet-demo.git
   ```
3. Crea una nueva rama para tu característica:
   ```
   git checkout -b feature/tu-caracteristica
   ```
4. Realiza tus cambios y hazles commit:
   ```
   git commit -m "Agrega tu mensaje de commit aquí"
   ```
5. Sube tus cambios a tu fork:
   ```
   git push origin feature/tu-caracteristica
   ```
6. Crea un Pull Request desde tu repositorio bifurcado al repositorio original

Asegúrate de que tu código se adhiere al estilo existente y que has probado tus cambios antes de enviar un Pull Request.

## Licencia

Este proyecto se encuentra bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.