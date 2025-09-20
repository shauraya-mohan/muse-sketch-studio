import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// AI Models for different steps
const MODELS = {
  SKETCH: "google/imagen-4",
  COLORING: "google/imagen-4", 
  MODEL_PHOTO: "google/imagen-4",
  RUNWAY_VIDEO: "google/veo-3"
};

const PROMPT_TEMPLATES = {
  SKETCH: "Fashion design sketch, technical drawing, clean lines, professional fashion illustration, white background, detailed garment construction",
  COLORING: "Add vibrant colors to this fashion sketch, maintain the original design, professional fashion illustration",
  MODEL: "Professional fashion photography, model wearing this outfit, studio lighting, high fashion, detailed fabric textures",
  RUNWAY: "Fashion runway walk, professional model, smooth walking motion, elegant presentation"
};

// Helper function for API calls with timeout
async function callReplicateWithTimeout(modelId, input, timeoutMs = 300000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("API timeout")), timeoutMs);
  });

  const replicatePromise = replicate.run(modelId, { input });
  const output = await Promise.race([replicatePromise, timeoutPromise]);

  if (!output) {
    throw new Error("No output returned from Replicate API");
  }

  const resultUrl = output.url ? output.url() : output;
  if (!resultUrl) {
    throw new Error("No URL returned from Replicate API");
  }

  return resultUrl;
}

// Step 1: Generate Fashion Sketch
app.post('/api/generate-sketch', async (req, res) => {
  try {
    const { prompt, garmentType = "dress" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({ 
        error: "REPLICATE_API_TOKEN not configured",
        success: false 
      });
    }

    const combinedPrompt = `${PROMPT_TEMPLATES.SKETCH}, ${garmentType}, ${prompt}`;

    const input = {
      prompt: combinedPrompt,
      aspect_ratio: "1:1",
      safety_filter_level: "block_medium_and_above"
    };

    console.log("Generating sketch with prompt:", combinedPrompt);

    const imageUrl = await callReplicateWithTimeout(MODELS.SKETCH, input);

    console.log("Sketch generated successfully:", imageUrl);

    return res.status(200).json({ 
      imageUrl,
      success: true,
      step: "sketch"
    });

  } catch (error) {
    console.error("Error generating sketch:", error);
    return res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Step 2: Add Colors to Sketch
app.post('/api/add-colors', async (req, res) => {
  try {
    const { sketchUrl, colors, prompt } = req.body;

    if (!sketchUrl) {
      return res.status(400).json({ error: "Sketch URL is required" });
    }

    const colorPrompt = colors ? `Using colors: ${colors.join(', ')}, ` : "";
    const combinedPrompt = `${colorPrompt}${PROMPT_TEMPLATES.COLORING}, ${prompt || ""}`;

    const input = {
      image: sketchUrl,
      prompt: combinedPrompt,
      aspect_ratio: "1:1",
      safety_filter_level: "block_medium_and_above"
    };

    console.log("Adding colors with prompt:", combinedPrompt);

    const imageUrl = await callReplicateWithTimeout(MODELS.COLORING, input);

    console.log("Colored design generated successfully:", imageUrl);

    return res.status(200).json({ 
      imageUrl,
      success: true,
      step: "colored"
    });

  } catch (error) {
    console.error("Error adding colors:", error);
    return res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Step 3: Generate Model Photo
app.post('/api/generate-model', async (req, res) => {
  try {
    const { designUrl, modelType = "diverse fashion model", pose = "standing" } = req.body;

    if (!designUrl) {
      return res.status(400).json({ error: "Design URL is required" });
    }

    const combinedPrompt = `${PROMPT_TEMPLATES.MODEL}, ${modelType}, ${pose} pose, wearing this exact outfit`;

    const input = {
      image: designUrl,
      prompt: combinedPrompt,
      aspect_ratio: "3:4",
      safety_filter_level: "block_medium_and_above"
    };

    console.log("Generating model photo with prompt:", combinedPrompt);

    const imageUrl = await callReplicateWithTimeout(MODELS.MODEL_PHOTO, input);

    console.log("Model photo generated successfully:", imageUrl);

    return res.status(200).json({ 
      imageUrl,
      success: true,
      step: "model"
    });

  } catch (error) {
    console.error("Error generating model photo:", error);
    return res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Step 4: Generate Runway Video
app.post('/api/generate-runway', async (req, res) => {
  try {
    const { modelPhotoUrl, walkStyle = "elegant runway walk" } = req.body;

    if (!modelPhotoUrl) {
      return res.status(400).json({ error: "Model photo URL is required" });
    }

    const combinedPrompt = `${PROMPT_TEMPLATES.RUNWAY}, ${walkStyle}, smooth motion, professional fashion show`;

    const input = {
      image: modelPhotoUrl,
      prompt: combinedPrompt
    };

    console.log("Generating runway video with prompt:", combinedPrompt);

    const videoUrl = await callReplicateWithTimeout(MODELS.RUNWAY_VIDEO, input, 600000); // 10 min timeout for video

    console.log("Runway video generated successfully:", videoUrl);

    return res.status(200).json({ 
      videoUrl,
      success: true,
      step: "runway"
    });

  } catch (error) {
    console.error("Error generating runway video:", error);
    return res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env_check: {
      replicate_token: !!process.env.REPLICATE_API_TOKEN,
      model_id: process.env.MODEL_ID || 'using default',
      prompt_template: !!process.env.PROMPT_TEMPLATE
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Generate endpoint: http://localhost:${PORT}/api/generate`);
  
  // Log environment status
  console.log('\n🔧 Environment Status:');
  console.log(`  REPLICATE_API_TOKEN: ${process.env.REPLICATE_API_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`  MODEL_ID: ${process.env.MODEL_ID || 'using default'}`);
  console.log(`  PROMPT_TEMPLATE: ${process.env.PROMPT_TEMPLATE ? '✅ Set' : 'using default'}`);
});
