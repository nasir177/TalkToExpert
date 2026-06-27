# TalkToExpert

Live Application: https://talk-to-expert.vercel.app

Build Status: Active | Maintenance: Yes | License: MIT

A web-based platform designed to bridge the gap between industry professionals and clients seeking real-time consulting. The application focuses on intuitive discovery, streamlined appointment workflows, and fluid user interfaces, serving as a demonstration of responsive frontend architecture and type-safe state management.

---

## Technical Architecture and Stack

The application is engineered using an explicit development stack chosen for rendering speed, maintainability, and strict data contract enforcement.

### Core Technologies
* **React**: Utilized for component-driven UI architecture, predictable hook-based state management, and optimized virtual DOM updates.
* **TypeScript**: Implemented across the codebase to enforce static typing, catch runtime anomalies early, and provide self-documenting data interfaces.
* **JavaScript (ES6+)**: Handles dynamic interactions, modular code splitting, and functional collection processing.
* **Tailwind CSS**: Employed for explicit utility-first layout constraints and robust responsive breakpoints without stylesheet bloat.
* **HTML5 / CSS3**: Provides the structural foundation via semantic elements alongside native flexbox and grid layouts.

### Tooling and Infrastructure
* **Vite**: Serves as the high-speed bundler and Hot Module Replacement engine for accelerated local development iterations.
* **Git**: Used for granular version control and atomic commitment pipelines.
* **Vercel**: Configured for continuous integration and automated branch deployment.

---

## Core System Features

* **AI-Powered Expert Consultation**
  Connect with 12 specialized AI experts, including doctors, lawyers, and teachers, for immediate guidance. The AI advisors provide text-based insights and can suggest appropriate courses of action, such as recommending a physical doctor's visit for specific medical concerns.
* **Multilingual and Dialect Support**
  To provide a high level of localization and accessibility, the application offers full language support in English and Japanese. Additionally, it has native capability to communicate in Hinglish, making it a powerful tool for the modern Indian demographic.
* **Real-Time Interactive Chat Interface**
  Engage in real-time consultations with AI experts. The UI provides a clean chat interface with features like suggested response buttons (e.g., 'Haan' / 'Nahi') and voice input capabilities. It includes disclaimers and immediate contact options for emergencies.
* **Dynamic Expert Filtering Matrix**
  Features multi-parameter filtering arrays that scan through expert listings by field (Health, Legal, Safety, Education, Finance, Fitness), yielding instant UI state updates as users refine their search parameters.
* **User Consultation History**
  The application maintains a history of past consultations, allowing users to reference previous discussions. Users can also manage this history by deleting individual session logs or clearing the entire record.
* **Secure and Multiple Sign-In Options**
  Users can securely access the platform using their email and password or leverage a streamlined sign-in process with their Google account. The user-friendly interface handles new account registration and password visibility.
* **Intuitive and Mobile-First Design System**
  Built on rigid grid alignment systems and fluid layout values to ensure cross-device consistency across mobile viewports, tablet form factors, and ultra-wide displays.

---

## User Interface and Layout Showcase

Note for Technical Recruiters: To streamline engineering evaluations without requiring a local workspace setup or compilation dependencies, the primary functional boundaries and design systems are captured below.

| Home Screen | Experts Dashboard | Consultation Interface |
| :---: | :---: | :---: |
| <img src="Screenshot 2026-04-05 195843.png" width="100%" alt="TalkToExpert Home Screen" /> | <img src="Screenshot 2026-04-05 195616.png" width="100%" alt="Experts Listing and Categories" /> | <img src="Screenshot 2026-04-05 195337.png" width="100%" alt="Real-time Chat Interface" /> |
| App welcome page with access to all available experts and key platforms metrics. | Categorized grid for discovering and filtering AI advisors. | Seamless text and button-based interaction for expert consultation. |

| Consultation History | Security and Authentication | User Registration |
| :---: | :---: | :---: |
| <img src="Screenshot 2026-04-28 120138.png" width="100%" alt="Consultation History Log" /> | <img src="Screenshot 2026-04-05 195942.png" width="100%" alt="Sign In and Access" /> | <img src="Screenshot 2026-04-05 114534.png" width="100%" alt="Account Creation Interface" /> |
| A historical record of previous consultation summaries. | Secure access interface featuring Google login and email sign-in. | Streamlined, multi-option user registration flow. |

---

## Local Deployment and Environment Execution

To review the underlying implementation logic on your system, execute the following operational pipeline:

1. Clone the project files:
   ```bash
   git clone [https://github.com/nasir177/TalkToExpert.git](https://github.com/nasir177/TalkToExpert.git)
   cd TalkToExpert
