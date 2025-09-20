# 🎨 Muse Sketch Studio

**AI-Powered Fashion Design Pipeline** - Create professional fashion designs from concept to runway

Transform your fashion ideas into reality with our complete AI-powered design workflow: **Prompt → Sketch → Colors → Model → Runway Video**

![Fashion Design Pipeline](https://img.shields.io/badge/AI-Fashion%20Design-ff69b4?style=for-the-badge)
![Powered by](https://img.shields.io/badge/Powered%20by-Replicate-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%2B%20Node.js-green?style=for-the-badge)

## ✨ Features

### 🎯 Complete Design Pipeline
- **Step 1**: Text prompt → Professional fashion sketch
- **Step 2**: Color selection → Colored design  
- **Step 3**: Model generation → Fashion photography
- **Step 4**: Runway video → Professional fashion show

### 🤖 AI Models Used
- **google/nano-banana** - Fashion sketches, coloring, and model photography
- **google/veo-3** - Professional runway video generation
- **Replicate API** - Seamless AI model integration

### 🎨 Professional Quality
- Hand-drawn fashion designer sketch style
- No text, labels, or watermarks
- Clean professional backgrounds
- Fashion week quality runway videos
- Downloadable PNG images and MP4 videos

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Replicate API Token ([Get one here](https://replicate.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd muse-sketch-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env and add your Replicate API token:
   # REPLICATE_API_TOKEN=your_actual_token_here
   ```

4. **Start the application**
   ```bash
   # Start backend (Terminal 1)
   node simple-server.js

   # Start frontend (Terminal 2)  
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:8080
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REPLICATE_API_TOKEN=your_replicate_api_token_here
MODEL_ID=google/nano-banana
PROMPT_TEMPLATE=professional fashion designer sketch, hand-drawn style, clean pencil lines
```

> ⚠️ **Security Note**: Never commit your `.env` file or share your API tokens. The `.env` file is already added to `.gitignore`.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/generate-sketch` | POST | Generate fashion sketch |
| `/api/add-colors` | POST | Add colors to sketch |
| `/api/generate-model` | POST | Create model photo |
| `/api/generate-runway` | POST | Generate runway video |

## 📖 Usage Guide

### 1. Create a Fashion Sketch
- Enter your design prompt (e.g., "elegant evening gown")
- Select garment type from dropdown
- Click "Generate Sketch"
- Wait 10-15 seconds for AI generation

### 2. Add Colors
- Select colors from the palette
- Click "Add Colors" 
- AI preserves the sketch structure while adding colors

### 3. Generate Model Photo
- Click "Generate Model Photo"
- AI creates professional fashion photography
- Model wearing your colored design

### 4. Create Runway Video
- Click "Create Runway Video" 
- AI generates professional runway show
- Takes 5-20 minutes for video generation

### 5. Download Results
- Download PNG images at each step
- Download MP4 runway video
- Share your complete fashion collection

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── FashionPipeline.tsx    # Multi-step workflow UI
│   ├── FashionCanvas.tsx      # Display generated content
│   └── ui/                    # Reusable UI components
├── pages/
│   └── FashionDesignTool.tsx  # Main application page
└── hooks/                     # Custom React hooks
```

### Backend (Node.js)
```
simple-server.js               # Express API server
├── Replicate API integration
├── Multi-step fashion pipeline
├── Professional AI prompts
└── Error handling & timeouts
```

## 🎨 AI Prompt Engineering

### Sketch Generation
```
Professional fashion designer sketch, hand-drawn style, clean pencil lines, 
technical fashion illustration, [garment], [user prompt]. 
Pure sketch only, no text, no labels, no annotations, no background elements, 
white/cream paper background, detailed garment construction lines, 
professional fashion croquis style, elegant proportions, fashion design studio quality
```

### Color Addition
```
Add colors to this professional fashion designer sketch, maintain the exact same design and proportions, 
keep the hand-drawn sketch aesthetic, professional fashion illustration style, 
no text or labels, clean background. Preserve the original sketch lines and structure 
while adding the specified colors to the garment.
```

### Runway Video
```
Professional fashion runway show, [walk style], model walking confidently down the runway, 
smooth fluid motion, elegant stride, high fashion presentation, professional lighting, 
fashion week atmosphere, cinematic quality, no text or watermarks, 
luxury fashion show environment, seamless loop motion
```

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js (built-in modules only)
- **AI**: Replicate API (google/nano-banana, google/veo-3)
- **Build**: Vite, ESLint, PostCSS

### Development Scripts
```bash
npm run dev          # Start frontend development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
node simple-server.js # Start backend API server
```

### API Response Format
```json
{
  "imageUrl": "https://replicate.delivery/.../image.jpg",
  "success": true,
  "step": "sketch"
}
```

## 🚀 Deployment

### Frontend Deployment
- Built with Vite - deploy to Vercel, Netlify, or any static host
- `npm run build` creates optimized production build

### Backend Deployment  
- Deploy to Railway, Render, or any Node.js hosting
- Set environment variables in hosting platform
- Ensure Replicate API token is configured

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Replicate** - For providing access to cutting-edge AI models
- **Google** - For the amazing nano-banana and Veo-3 models
- **shadcn/ui** - For the beautiful UI component library
- **Fashion Design Community** - For inspiration and feedback

## 📞 Support

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Create a feature request issue
- 💬 **Questions**: Start a discussion on GitHub

---

**Built with ❤️ for the fashion design community**

*Transform your fashion ideas into reality with AI-powered design tools*