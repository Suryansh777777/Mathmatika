export const siteConfig = {
  name: "Mathmatika",
  tagline: "Mathematics learning made effortless",
  description:
    "Transform your math materials into comprehensive study aids with AI-powered notes, videos, and interactive quizzes",

  // Navigation
  nav: {
    links: [
      { name: "Features", href: "#features" },
      { name: "Faq", href: "#FAQ" },
    ],
    cta: { text: "Get Started", href: "/chat" },
  },

  // Hero Section
  hero: {
    badge: {
      icon: "chart",
      text: "AI-Powered Learning",
    },
    title: "Transform math materials into mastery",
    description:
      "Upload your materials and get AI-generated notes with LaTeX and educational videos in one workflow.",
    cta: {
      primary: { text: "Start Learning", href: "/chat" },
    },
    dashboard: {
      images: [
        {
          src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dsadsadsa.jpg-xTHS4hGwCWp2H5bTj8np6DXZUyrxX7.jpeg",
          alt: "Mathematics Notes Dashboard with LaTeX Rendering",
        },
        {
          src: "/analytics-dashboard-with-charts-graphs-and-data-vi.jpg",
          alt: "Interactive Video Interface",
        },
        {
          src: "/data-visualization-dashboard-with-interactive-char.jpg",
          alt: "Study Progress Analytics",
        },
      ],
    },
  },

  // Feature Cards
  features: {
    cards: [
      {
        title: "Smart Note Generation",
        description:
          "Upload PDFs, images, or text and get beautifully formatted notes with LaTeX equations in minutes.",
      },
      {
        title: "Interactive Videos",
        description:
          "Test your understanding with AI-generated videos and get instant feedback with detailed explanations.",
      },
      {
        title: "AI Mentorship",
        description:
          "Get personalized guidance through live Q&A for any question—like having a tutor available 24/7.",
      },
    ],
  },

  // Social Proof
  socialProof: {
    badge: {
      icon: "building",
      text: "Trusted by Students",
    },
    title: "Proven to improve learning outcomes",
    description:
      "Students learn mathematics more effectively with personalized\nexplanations and active learning tools in a single workflow.",
    logos: [
      { name: "MIT", icon: "/horizon-icon.svg" },
      { name: "Stanford", icon: "/horizon-icon.svg" },
      { name: "Berkeley", icon: "/horizon-icon.svg" },
      { name: "Harvard", icon: "/horizon-icon.svg" },
      { name: "Caltech", icon: "/horizon-icon.svg" },
      { name: "Princeton", icon: "/horizon-icon.svg" },
      { name: "Yale", icon: "/horizon-icon.svg" },
      { name: "Cornell", icon: "/horizon-icon.svg" },
    ],
  },

  // Bento Grid Features
  bentoGrid: {
    badge: {
      icon: "grid",
      text: "Learning Modes",
    },
    title: "Choose your learning speed",
    description:
      "From quick summaries to deep research—Mathmatika adapts\nto your learning style and time constraints.",
    items: [
      {
        title: "Basic Mode: Fast & Focused",
        description:
          "Get concise notes and 3-5 quiz questions in just 2-3 minutes. Perfect for quick review sessions.",
        component: "SmartSimpleBrilliant",
      },
      {
        title: "Deep Research: Comprehensive",
        description:
          "Detailed explanations with web search context, 5-7 advanced questions, and in-depth analysis in 5-10 minutes.",
        component: "YourWorkInSync",
      },
      {
        title: "Multi-format Support",
        description:
          "Upload PDFs, images,  or text—our AI understands them all without OCR hassles.",
        component: "EffortlessIntegration",
      },
      {
        title: "LaTeX Perfection",
        description:
          "Beautiful mathematical notation rendered flawlessly. Equations, matrices, and symbols—all crystal clear.",
        component: "NumbersThatSpeak",
      },
    ],
  },

  // Documentation Section
  documentation: {
    badge: {
      icon: "circle",
      text: "How It Works",
    },
    title: "From upload to mastery in minutes",
    description:
      "Our AI-powered platform transforms your materials into a complete\nlearning experience with notes, videos, and quizzes.",
    features: [
      {
        title: "1. Upload & Query",
        description:
          "Drop your math materials (PDF, images, text)\nand ask what you want to learn.",
        image: "/modern-dashboard-interface-with-data-visualization.jpg",
      },
      {
        title: "2. AI Processing",
        description:
          "Choose Basic (2-3 min) or Deep Research (5-10 min)\nmode for tailored learning depth.",
        image: "/analytics-dashboard.png",
      },
      {
        title: "3. Learn & Master",
        description:
          "Get structured notes, video explanations, quizzes,\nand live Q&A support—all in one place.",
        image: "/team-collaboration-interface-with-shared-workspace.jpg",
      },
    ],
  },

  // Testimonials
  testimonials: [
    {
      quote:
        "Mathmatika turned my calculus textbook into interactive notes and quizzes in minutes. My exam scores improved by 25% this semester!",
      name: "Alex Rivera",
      company: "Engineering Student, MIT",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2011%2C%202025%2C%2011_35_19%20AM-z4zSRLsbOQDp7MJS1t8EXmGNB6Al9Z.png",
    },
    {
      quote:
        "The Deep Research mode is incredible. It finds additional context online and explains concepts I struggled with for weeks. It's like having a personal tutor.",
      name: "Priya Sharma",
      company: "Math Major, Stanford",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2011%2C%202025%2C%2010_54_18%20AM-nbiecp92QNdTudmCrHr97uekrIPzCP.png",
    },
    {
      quote:
        "I use Mathmatika for every problem set. The LaTeX rendering is perfect, and the AI Q&A helps me understand mistakes instantly instead of waiting for office hours.",
      name: "Jordan Chen",
      company: "Physics PhD Candidate, Caltech",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Sep%2011%2C%202025%2C%2011_01_05%20AM-TBOe92trRxKn4G5So1m9D2h7LRH4PG.png",
    },
  ],

  // Pricing
  pricing: {
    badge: {
      icon: "dollar",
      text: "Plans & Pricing",
    },
    title: "Choose your learning plan",
    description:
      "Start free and upgrade as you master more topics.\nFlexible pricing that grows with your academic journey.",
    plans: [
      {
        name: "Student",
        description: "Perfect for individual learners exploring mathematics.",
        price: {
          monthly: 0,
          annually: 0,
        },
        cta: "Start for free",
        features: [
          "Up to 10 uploads/month",
          "Basic Mode processing",
          "Markdown notes with LaTeX",
          "3-5 quiz questions per topic",
          "Community Q&A support",
        ],
      },
      {
        name: "Scholar",
        description: "Advanced features for serious students and educators.",
        price: {
          monthly: 15,
          annually: 12, // 20% discount
        },
        cta: "Get started",
        featured: true,
        features: [
          "Unlimited uploads",
          "Deep Research Mode (5-10 min)",
          "Video explanations",
          "5-7 advanced quiz questions",
          "AI mentorship Q&A",
          "Export notes (PDF/Markdown)",
          "Learning analytics",
          "Priority processing",
        ],
      },
      {
        name: "Institution",
        description: "Complete solution for schools and universities.",
        price: {
          monthly: 99,
          annually: 79, // 20% discount
        },
        cta: "Contact sales",
        features: [
          "Everything in Scholar",
          "Multi-user accounts",
          "Custom curriculum uploads",
          "Advanced analytics dashboard",
          "SSO integration",
          "Dedicated support",
          "API access",
          "White-label options",
        ],
      },
    ],
  },

  // FAQ
  faq: {
    title: "Frequently Asked Questions",
    description:
      "Learn how Mathmatika transforms your materials\ninto comprehensive study aids.",
    items: [
      {
        question: "What is Mathmatika and how does it work?",
        answer:
          "Mathmatika is an AI-powered mathematics learning platform. Upload your materials (PDFs, images, text), ask a question, and get structured notes with LaTeX equations, educational videos, and interactive quizzes—all generated automatically.",
      },
      {
        question:
          "What's the difference between Basic and Deep Research modes?",
        answer:
          "Basic Mode (2-3 min) provides quick summaries and 3-5 quiz questions—ideal for review. Deep Research Mode (5-10 min) uses web search for additional context, generates detailed explanations, 5-7 advanced questions, and video content.",
      },
      {
        question: "Do I need to convert images to text (OCR)?",
        answer:
          "No! Mathmatika handles images directly without OCR. Just upload photos of textbook pages,  or problem sets, and our AI processes them as-is.",
      },
      {
        question: "How does the AI mentorship Q&A work?",
        answer:
          "After completing a quiz, you can ask questions about any problem. Our AI provides mentorship-style guidance with step-by-step explanations tailored to your understanding level.",
      },
      {
        question: "Can I export and save my notes?",
        answer:
          "Yes! Scholar and Institution plans allow you to export notes as PDF or Markdown files. You can also save all your learning sessions for future reference.",
      },
      {
        question: "What math topics does Mathmatika support?",
        answer:
          "Mathmatika works with all mathematics levels—from high school algebra to graduate-level topics like differential equations, linear algebra, calculus, statistics, and advanced mathematics.",
      },
    ],
  },

  // CTA Section
  cta: {
    title: "Ready to master mathematics?",
    description:
      "Join thousands of students learning smarter with AI-powered notes,\nvideos, and quizzes—all generated from your materials.",
    button: { text: "Start Learning Free", href: "/chat" },
  },

  // Footer
  footer: {
    tagline: "Mathematics learning made effortless",
    social: [
      {
        name: "Twitter",
        icon: "twitter",
        href: "https://twitter.com/mathmatika",
      },
      {
        name: "LinkedIn",
        icon: "linkedin",
        href: "https://linkedin.com/company/mathmatika",
      },
      { name: "GitHub", icon: "github", href: "https://github.com/mathmatika" },
    ],
    links: {
      product: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Learning Modes", href: "#modes" },
        { name: "AI Mentorship", href: "#mentorship" },
      ],
      company: [
        { name: "About us", href: "/about" },
        { name: "Our team", href: "/team" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
      ],
      resources: [
        { name: "Terms of use", href: "/terms" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Documentation", href: "/docs" },
        { name: "Student Community", href: "/community" },
        { name: "Support", href: "/support" },
      ],
    },
  },
};

export type SiteConfig = typeof siteConfig;
