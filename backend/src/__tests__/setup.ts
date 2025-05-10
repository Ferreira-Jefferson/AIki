import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

// Configuração global do mongoose
mongoose.set('strictQuery', false);

// Função para limpar as coleções
const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Função para conectar ao banco de dados
const connectDB = async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Conectado ao banco de testes');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de testes:', error);
    throw error;
  }
};

// Função para desconectar do banco de dados
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    await mongod.stop();
    console.log('🛑 Conexão do banco de testes fechada');
  } catch (error) {
    console.error('❌ Erro ao fechar conexão do MongoDB:', error);
    throw error;
  }
};

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearCollections();
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await disconnectDB();
});
