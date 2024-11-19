import express from 'express';
import { createClient } from 'redis';
import CORS from 'cors';
import jwt from 'jsonwebtoken';
import qrcode from 'qrcode';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(CORS());
app.use(express.json());
app.use(express.static('public'));

// Clave secreta para firmar tokens JWT
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key_here';

// Función para conectar con la base de datos Redis
async function connect_db() {
   // Creamos un cliente Redis
  const client = createClient({ url: 'redis://db-redis:6379' });
  try {
    await client.connect(); // Intentamos conectar a Redis
    console.log('Connected to Redis');
  } catch (err) {
    console.log('Error al conectarse a la base de datos ' + err);
  }
  return client;
}

// Conectamos con Redis y almacenamos el cliente en una variable global
const redisClient = await connect_db(); 

// Middleware para autenticar las solicitudes usando JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Ruta de inicio
app.get('/', (req, res) => {
  const mensaje = {
    mensaje: 'Backend Digital Wallet Demo',
    timestamp: new Date().toISOString()
  };
  res.json(mensaje);
});

// Ruta para crear un nuevo usuario
app.post('/register', async (req, res) => {
  const { username, password, balance } = req.body;
  if (!username || !password || balance === undefined) {
    return res.status(400).json({ error: 'Username, password, and balance are required' });
  }
  // Verificamos si el usuario ya existe en Redis
  const existingUser = await redisClient.hGetAll(`user:${username}`);
  if (Object.keys(existingUser).length !== 0) {
    return res.status(400).json({ error: 'User already exists' });
  }
  // Hasheamos la contraseña
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  // Creamos el nuevo usuario en Redis
  await redisClient.hSet(`user:${username}`, {
    username: username,
    password: hashedPassword,
    balance: balance.toString()
  });
  res.status(201).json({ message: 'User created successfully' });
});

// Ruta de login para autenticar a los usuarios
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscamos al usuario en la base de datos Redis
    const user = await redisClient.hGetAll(`user:${username}`);
    
    // Verificar si el usuario existe
    if (Object.keys(user).length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    
    // Generamos un token de acceso JWT usando la clave secreta
    const accessToken = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ accessToken });
    
  } catch (error) {
    console.error('Error en el proceso de login:', error);
    return res.status(500).json({ message: 'Ha ocurrido un error inesperado' });
  }
});


// Ruta para generar un código QR
app.get('/generate-qr', authenticateToken, async (req, res) => {
  // Creamos un ID único para la transacción usando la hora actual
  const transactionId = Date.now().toString();
  const amount = req.query.amount;
  const transactionDetails = { transactionId, amount };
  // Guardamos la transacción en Redis
  await redisClient.hSet(`transaction:${transactionId}`, transactionDetails);
  const qrCodeData = JSON.stringify(transactionDetails);
  try {
     // Generamos un código QR con los detalles de la transacción
    const qrCode = await qrcode.toDataURL(qrCodeData);
    res.json({ qrCode, transactionDetails });
  } catch (err) {
    res.status(500).send('Error generating QR code');
  }
});

// Ruta para procesar un pago
app.post('/process-payment', authenticateToken, async (req, res) => {
  const { transactionId } = req.body;
   // Buscamos la transacción en Redis
  const transaction = await redisClient.hGetAll(`transaction:${transactionId}`);
  if (!transaction) {
    return res.status(404).send('Transaction not found');
  }
  // Obtenemos los detalles del usuario desde Redis
  const user = await redisClient.hGetAll(`user:${req.user.username}`);
  const amount = parseFloat(transaction.amount);
  if (parseFloat(user.balance) < amount) {
    return res.status(400).send('Insufficient funds');
  }
  // Actualizamos el saldo del usuario
  user.balance = (parseFloat(user.balance) - amount).toString(); // Calculamos el nuevo saldo
  // Guardamos el nuevo saldo en Redis
  await redisClient.hSet(`user:${req.user.username}`, 'balance', user.balance);
  // Almacenamos el pago en Redis
  const paymentId = Date.now().toString(); // o utiliza un ID único
  const paymentDetails = {
    paymentId,
    transactionId,
    amount,
    timestamp: new Date().toISOString(),
  };
  await redisClient.hSet(`payments:${req.user.username}`, paymentId, JSON.stringify(paymentDetails));
  res.json({ message: 'Payment successful', newBalance: user.balance });
});

// Ruta para obtener el saldo del usuario
app.get('/balance', authenticateToken, async (req, res) => {
  // Obtenemos los detalles del usuario desde Redis
  const user = await redisClient.hGetAll(`user:${req.user.username}`); 
  const payments = await redisClient.hGetAll(`payments:${req.user.username}`);
  const paymentsArray = Object.values(payments).map(payment => JSON.parse(payment));
  res.json({ balance: user.balance, payments: paymentsArray });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
