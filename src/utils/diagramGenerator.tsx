import { useLanguage } from "@/contexts/LanguageContext";

export interface IExercise {
  exercise: string;
  focus: string;
  setup: string;
  method: string;
  keyPoints: string;
  watchFor: string;
  goal: string;
  quickFix: string;
  size: string;
  type: string;
}

export const COLOR_LEGEND = {
  Walk: { from: "#3AD55A", to: "#00AE23" },
  Trot: { from: "#FFD766", to: "#FF821C" },
  Canter: { from: "#5E92FA", to: "#3C77EC" },
  "Halt/Transition": { from: "#F67DB5", to: "#D80568" },
  "Free Walk": { from: "#A38DFC", to: "#7658EB" },
};
export const COLOR_LEGEND_ES = {
  Caminar: { from: "#3AD55A", to: "#00AE23" },
  Trote: { from: "#FFD766", to: "#FF821C" },
  "Medio galope": { from: "#5E92FA", to: "#3C77EC" },
  "Detener/Transición": { from: "#F67DB5", to: "#D80568" },
  "Paseo libre": { from: "#A38DFC", to: "#7658EB" },
};

export const diagramExtractor = (recommendation: IExercise) => {
  const { language } = useLanguage();
  const {
    exercise,
    focus,
    setup,
    method,
    keyPoints,
    watchFor,
    goal,
    quickFix,
    size,
    type,
  } = recommendation;

  const svgFileName = `${type}-${size}.svg`;
  // Determine SVG dimensions based on size and window width for responsiveness
  let width: number, height: number;
  if (size.toLowerCase() === "large") {
    width = 200;
    height = 400;
  } else {
    width = 200;
    height = 300;
  }

  // Responsive adjustment for mobile
  let svgWidth = width;
  let svgHeight = height;

  if (typeof window !== "undefined" && window.innerWidth) {
    // For mobile screens, scale down the SVG
    if (window.innerWidth < 600) {
      svgWidth = window.innerWidth - 40 > 100 ? window.innerWidth - 40 : 100;
      // Maintain aspect ratio
      svgHeight = Math.round((svgWidth * (height + 200)) / (width + 200));
    }
  }
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center" >{setup}</div>
      <img
        src={`/exercise-diagrams/${svgFileName}`}
        width={svgWidth}
        height={svgHeight}
        alt={`${type} ${size} exercise diagram`}
      />
      <div>
        {language === "en" ? "Arena Size:" : "Tamaño de la arena:"} {size}
      </div>
    </div>
  );
};
