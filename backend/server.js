import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/database.js';

dotenv.config({ path: new URL(".env", import.meta.url) });

const PORT = process.env.PORT || 3000;

try {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
} catch (error) {
    console.error("Erro ao iniciar servidor:", error.message);
    process.exit(1);
}
