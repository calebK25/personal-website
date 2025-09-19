const slides = [
  {
    slideTitle: "About Me",
    slideDescription:
    "I’m a Computer Science major at Princeton University with minors in Statistics & Machine Learning and Quantitative Economics. I’m especially interested in vision–language models and I’m convinced the frontier won’t be moved by compute alone, but by smarter training signals and mechanistic interpretability to understand—and fix—hallucinations. I currently conduct research in both the Princeton Vision & Learning Lab and the Princeton IPA Lab. Outside the lab, I’m into powerlifting and photography. Lately I’ve had Jay Chou (周杰倫) and BIBI (김형서) on repeat.",
    slideImg: "/pfp/Yt556Yja_400x400.jpg",
    slideTags: ["LinkedIn", "GitHub", "Email", "Spotify"],
  },
  {
    slideTitle: "Experience",
    slideDescription:
      "My research asks how to make models both see and remember reliably. In 3D vision, I study how to estimate and exploit the temporal dynamics of camera intrinsics (zoom, focus) directly from raw video, disentangling lens changes from scene motion and training systems that stay robust under real-world optics. In language, I investigate the mechanisms behind hallucination using DRM-style false-memory probes to pinpoint when and why LLMs hallucinate.",
    slideUrl: "/experience",
    slideTags: ["Reasoning", "AI/ML", "Computer Vision", "Prompt Optimization"],
    slideImg: null, // No image for white background
  },
  {
    slideTitle: "Projects",
    slideDescription:
      "stuff I've built",
    slideUrl: "/projects",
    slideTags: ["Persona Vectors", "NLP", "Camera Intrinsics/3D Geometry", "Nondeterminism"],
    slideImg: null, // No image for white background
  },
  {
    slideTitle: "Photography",
    slideDescription:
      "I occasionally shoot",
    slideUrl: "/photography",
    slideTags: ["Fujifilm X100VI / XT-30", "XF 27mm f/2.8", " XF 18-55mm f/2.8-4"],
    slideImg: null, // No image for white background
  },
];

export default slides;
