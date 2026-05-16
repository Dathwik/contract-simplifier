# Contract Simplifier

An AI-powered web application that transforms complex legal contracts into clear, plain-language summaries — so you understand what you're signing before you sign it.

Built with [Next.js](https://nextjs.org), [Claude AI](https://www.anthropic.com/claude) (Anthropic), and [PDF.js](https://mozilla.github.io/pdf.js/).

---

## Features

- **PDF Upload & Parsing** — Upload any contract PDF and extract its full text automatically
- **AI-Powered Simplification** — Claude AI breaks down dense legal language into plain English
- **Key Clause Highlighting** — Surfaces the most important clauses (termination, liability, payment terms, etc.)
- **Dark Mode Support** — Fully responsive UI with light and dark themes
- **No data stored** — Documents are processed in-memory and never persisted

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| PDF Processing | `pdfjs-dist` |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/dathwik/contract-simplifier.git
cd contract-simplifier
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
contract-simplifier/
├── app/
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Main application page
│   └── globals.css       # Global styles
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config       # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add `ANTHROPIC_API_KEY` to your Vercel environment variables
4. Deploy

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)
