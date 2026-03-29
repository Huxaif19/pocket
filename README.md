# 💎 Pocket: Premium Image Optimizer

**Pocket** is a professional-grade, high-performance image optimization tool engineered for precision. Built with Next.js and powered by `sharp`, it provides a seamless and secure way to compress images without sacrificing the quality that matters.

![Pocket Preview](https://github.com/user-attachments/assets/your-preview-link-here)

---

## 🚀 Key Intentions

### 🎯 Engineered for Precision
Pocket doesn't just "shrink" images. It uses intelligent binary search algorithms to hit your specific target file sizes with the highest possible visual fidelity. Whether you're optimizing for quality or file size, Pocket finds the perfect balance.

### 🛡️ Security & Privacy First
In an era of digital vulnerabilities, Pocket treats every image as a potential risk.
- **Metadata Stripping**: Automatically removes EXIF and other sensitive data.
- **Deep Re-encoding**: Every image is re-encoded by `sharp` to eliminate polyglot attacks and malicious payloads.
- **Ephemeral Processing**: Your images are processed in-memory and never stored persistently.

### ⚡ Next-Gen Performance
- **Modern Formats**: Effortless conversion to **WebP** and **AVIF** for ultimate web performance.
- **Real-time Stats**: Detailed insights into saved bytes, percentage reduction, and applied optimization parameters.
- **Persistence**: Your last-used settings and results stay with you, even after a page refresh.

### ✨ Premium Experience
A stunning **Glassmorphism-inspired UI** designed for clarity and focus. Every interaction is fluid, with subtle micro-animations and a sleek dark theme.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Processing Engine**: [Sharp](https://sharp.pixelplumbing.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Validation**: [Zod](https://zod.dev/)
- **UI Architecture**: Glassmorphism Design System

---

## 🏗️ Getting Started

First, install the dependencies:

```bash
npm install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start optimizing.

---

## 📜 Roadmap & Future
- [x] Target-size optimization (Binary Search)
- [x] WebP/AVIF Support
- [x] Result Persistence
- [ ] Bulk Image Processing
- [ ] Custom Preset Management
- [ ] Direct CDN Integration

---

## 🤝 Contributing

Contributions are welcome! Whether it's a bug report, feature request, or a PR, we value your input.

---

## ⚖️ License

Built with ❤️ by the Pocket Team.
