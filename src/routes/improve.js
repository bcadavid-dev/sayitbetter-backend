import express from 'express';
import aiService from '../services/aiService.js';

const router = express.Router();

// Validaciones
const MIN_LENGTH = 10;
const MAX_LENGTH = 280;

router.post('/improve', async (req, res) => {
  try {
    const { phrase, tone } = req.body;

    // Validación de campos requeridos
    if (!phrase || !tone) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: phrase y tone'
      });
    }

    // Validación de longitud
    if (phrase.length < MIN_LENGTH) {
      return res.status(400).json({
        error: `La frase debe tener al menos ${MIN_LENGTH} caracteres`
      });
    }

    if (phrase.length > MAX_LENGTH) {
      return res.status(400).json({
        error: `La frase no puede exceder ${MAX_LENGTH} caracteres`
      });
    }

    // Llamar al servicio de IA
    const improvedPhrase = await aiService.improvePhrase(phrase, tone);

    return res.json({
      success: true,
      improvedPhrase
    });

  } catch (error) {
    console.error('Error en /api/improve:', error);

    return res.status(500).json({
      error: error.message || 'Error al procesar la solicitud'
    });
  }
});

// Endpoint para obtener tonos disponibles
router.get('/tones', (req, res) => {
  const tones = aiService.getAvailableTones();
  res.json({ tones });
});

export default router;
