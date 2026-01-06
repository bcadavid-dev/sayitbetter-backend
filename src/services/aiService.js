import OpenAI from 'openai';

// Configuración de tonos con sus descripciones para el prompt
const TONES = {
  intelectual: {
    name: 'Intelectual',
    description: 'refinado, con vocabulario preciso y culto, pero sin sonar pedante'
  },
  directo: {
    name: 'Directo',
    description: 'sin rodeos, claro, conciso y al grano'
  },
  conciliador: {
    name: 'Conciliador',
    description: 'diplomático, empático y que busca el entendimiento'
  },
  sarcastico: {
    name: 'Sarcástico',
    description: 'con ironía sutil e inteligente, sin ser ofensivo'
  },
  poetico: {
    name: 'Poético',
    description: 'metafórico, evocativo y con belleza literaria'
  },
  neutral: {
    name: 'Neutral/Elegante',
    description: 'profesional, equilibrado y elegante'
  }
};

class AIService {
  constructor() {
    this.client = null;
    this.provider = 'openai'; // Permite cambiar a otro proveedor en el futuro
  }

  initialize() {
    if (this.provider === 'openai') {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 10000 // 10 segundos de timeout
      });
    }
    // Aquí podrías agregar otros proveedores (Anthropic, etc.)
  }

  buildPrompt(phrase, tone) {
    const toneConfig = TONES[tone];

    return `Eres un experto en comunicación que ayuda a mejorar frases para redes sociales.

REGLAS ESTRICTAS:
- Mantén el significado original
- NO agregues emojis
- NO uses hashtags
- NO hagas listas
- NO expliques nada
- Genera UNA sola frase
- Suena natural y humano, no como marketing
- Tono: ${toneConfig.description}

Frase original: "${phrase}"

Reescribe la frase con tono ${toneConfig.name}, siguiendo todas las reglas anteriores. Responde SOLO con la frase mejorada:`;
  }

  async improvePhrase(phrase, tone) {
    if (!this.client) {
      this.initialize();
    }

    // Validación de tono
    if (!TONES[tone]) {
      throw new Error(`Tono inválido: ${tone}`);
    }

    const prompt = this.buildPrompt(phrase, tone);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const improvedPhrase = response.choices[0].message.content.trim();

      // Limpieza adicional por si la IA no siguió las reglas
      return improvedPhrase
        .replace(/["«»]/g, '') // Quitar comillas
        .trim();

    } catch (error) {
      console.error('Error llamando a la API de IA:', error);
      throw new Error('Error al procesar la frase. Intenta de nuevo.');
    }
  }

  // Método para obtener la lista de tonos disponibles
  getAvailableTones() {
    return Object.keys(TONES).map(key => ({
      id: key,
      name: TONES[key].name
    }));
  }
}

export default new AIService();
