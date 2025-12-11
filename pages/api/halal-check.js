import Anthropic from '@anthropic-ai/sdk';

// Liste des ingrédients connus comme haram ou douteux
const HARAM_INGREDIENTS = [
  // Porc et dérivés
  'pork', 'porc', 'لحم خنزير', 'pig', 'bacon', 'ham', 'jambon', 'lard', 'saindoux',
  'gelatin', 'gélatine', 'جيلاتين', 'gelée', 'porcine', 'e441', 'e542',
  'pepsin', 'pepsine', 'collagen', 'collagène',
  
  // Alcool
  'alcohol', 'alcool', 'كحول', 'ethanol', 'éthanol', 'wine', 'vin', 'beer', 'bière',
  'rum', 'rhum', 'whisky', 'vodka', 'brandy', 'cognac', 'liqueur', 'liquor',
  
  // Graisses animales non spécifiées
  'animal fat', 'graisse animale', 'tallow', 'suif', 'dripping',
  'shortening', 'e471', 'e472', 'e473', 'e474', 'e475', 'e476', 'e477', 'e478',
  'mono and diglycerides', 'mono et diglycérides',
  
  // Autres
  'carmine', 'carmin', 'e120', 'cochineal', 'cochenille',
  'l-cysteine', 'l-cystéine', 'e920', 'e921',
  'rennet', 'présure',
];

const DOUBTFUL_INGREDIENTS = [
  // E-numbers douteux
  'e120', 'e441', 'e542', 'e904', 'e471', 'e472', 'e473', 'e474', 'e475',
  'e476', 'e477', 'e478', 'e481', 'e482', 'e483', 'e491', 'e492', 'e493',
  'e494', 'e495', 'e570', 'e572', 'e631', 'e635', 'e920', 'e921',
  
  // Ingrédients ambigus
  'natural flavors', 'arômes naturels', 'نكهات طبيعية',
  'natural flavoring', 'arôme naturel',
  'enzyme', 'enzymes', 'إنزيمات',
  'emulsifier', 'émulsifiant', 'مستحلب',
  'glycerin', 'glycérine', 'glycerol', 'glycérol', 'e422',
  'stearic acid', 'acide stéarique', 'e570',
  'lecithin', 'lécithine', 'e322',
  'whey', 'lactosérum', 'petit-lait',
];

/**
 * Vérifie si un ingrédient est haram
 */
function checkIngredient(ingredient) {
  const lower = ingredient.toLowerCase();
  
  for (const haram of HARAM_INGREDIENTS) {
    if (lower.includes(haram.toLowerCase())) {
      return { status: 'haram', match: haram };
    }
  }
  
  for (const doubtful of DOUBTFUL_INGREDIENTS) {
    if (lower.includes(doubtful.toLowerCase())) {
      return { status: 'doubtful', match: doubtful };
    }
  }
  
  return { status: 'ok', match: null };
}

/**
 * Analyse les ingrédients avec Claude
 */
async function analyzeWithAI(productName, ingredients, language) {
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const langPrompts = {
      ar: 'أجب باللغة العربية.',
      fr: 'Réponds en français.',
      en: 'Answer in English.'
    };
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Tu es un expert en alimentation halal. Analyse ces ingrédients et donne un verdict clair.

Produit: ${productName}
Ingrédients: ${ingredients}

${langPrompts[language] || langPrompts.fr}

Réponds en 2-3 phrases maximum:
1. Le verdict (Halal, Haram, ou Douteux)
2. La raison principale si haram ou douteux
3. Une recommandation

Sois concis et direct.`
      }]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('AI analysis error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { barcode, language = 'fr' } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: 'Barcode is required' });
  }

  try {
    // 1. Fetch product from Open Food Facts
    const offResponse = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );
    const offData = await offResponse.json();

    if (offData.status !== 1 || !offData.product) {
      return res.status(200).json({
        found: false,
        barcode,
        message: 'Product not found in database'
      });
    }

    const product = offData.product;
    
    // 2. Extract product info
    const productInfo = {
      name: product.product_name || product.product_name_fr || product.product_name_en || 'Unknown',
      brand: product.brands || null,
      ingredients: product.ingredients_text || product.ingredients_text_fr || product.ingredients_text_en || '',
      image: product.image_front_url || product.image_url || null,
      categories: product.categories || '',
      labels: product.labels || ''
    };

    // 3. Check for halal labels
    const labelsLower = (productInfo.labels || '').toLowerCase();
    const hasHalalLabel = labelsLower.includes('halal') || labelsLower.includes('حلال');
    
    // 4. Analyze ingredients
    const ingredientsLower = (productInfo.ingredients || '').toLowerCase();
    const problematicIngredients = [];
    let overallStatus = 'halal';

    // Check each known problematic ingredient
    for (const haram of HARAM_INGREDIENTS) {
      if (ingredientsLower.includes(haram.toLowerCase())) {
        problematicIngredients.push(haram);
        overallStatus = 'haram';
      }
    }

    if (overallStatus !== 'haram') {
      for (const doubtful of DOUBTFUL_INGREDIENTS) {
        if (ingredientsLower.includes(doubtful.toLowerCase())) {
          if (!problematicIngredients.includes(doubtful)) {
            problematicIngredients.push(doubtful);
          }
          if (overallStatus !== 'haram') {
            overallStatus = 'doubtful';
          }
        }
      }
    }

    // If has halal label and no haram ingredients found, consider halal
    if (hasHalalLabel && overallStatus !== 'haram') {
      overallStatus = 'halal';
    }

    // If no ingredients listed, mark as unknown
    if (!productInfo.ingredients) {
      overallStatus = 'unknown';
    }

    // 5. AI Analysis for detailed explanation
    let aiAnalysis = null;
    if (productInfo.ingredients && process.env.ANTHROPIC_API_KEY) {
      aiAnalysis = await analyzeWithAI(
        productInfo.name,
        productInfo.ingredients,
        language
      );
    }

    // 6. Return result
    return res.status(200).json({
      found: true,
      barcode,
      status: overallStatus,
      product: productInfo,
      problematicIngredients: [...new Set(problematicIngredients)], // Remove duplicates
      hasHalalLabel,
      aiAnalysis
    });

  } catch (error) {
    console.error('Halal check error:', error);
    return res.status(500).json({
      error: 'Failed to analyze product',
      message: error.message
    });
  }
}
