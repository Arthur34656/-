import { useState } from "react";
import { QuizQuestion, Product } from "../types";
import { SECURITY_QUIZ, PRODUCTS } from "../data";
import { ShieldAlert, RefreshCw, ShoppingBag, ArrowRight, CheckCircle2, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DefenseQuizProps {
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export default function DefenseQuiz({ onAddToCart, onOpenDetails }: DefenseQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<{ [category: string]: number }>({
    knives: 0,
    gas_sprays: 0,
    self_defense: 0,
    accessories: 0,
  });
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectOption = (points: { [category: string]: number }, optionIdx: number) => {
    // Add points to score
    const updatedScores = { ...scores };
    Object.entries(points).forEach(([category, val]) => {
      if (updatedScores[category] !== undefined) {
        updatedScores[category] += val;
      }
    });

    const newSelectedAnswers = [...selectedAnswers, optionIdx];
    setSelectedAnswers(newSelectedAnswers);
    setScores(updatedScores);

    // Navigate or complete
    if (currentStep < SECURITY_QUIZ.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setScores({
      knives: 0,
      gas_sprays: 0,
      self_defense: 0,
      accessories: 0,
    });
    setSelectedAnswers([]);
    setIsCompleted(false);
  };

  // Find recommended products based on the highest category
  const getRecommendations = (): { bestCategoryLabel: string; products: Product[]; explanation: string } => {
    let bestCategory = "gas_sprays";
    let maxScore = -1;

    (Object.entries(scores) as [string, number][]).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = cat;
      }
    });

    const recommendations = PRODUCTS.filter((p) => p.category === bestCategory).slice(0, 3);
    
    let bestCategoryLabel = "Газові балончики";
    let explanation = "Ваші відповіді показують, що ви шукаєте надійний захист без близького фізичного контакту чи юридичних складнощів. Газові балончики є ідеальним вибором, оскільки вони легальні з 18 років, компактні та діють миттєво на відстані!";

    if (bestCategory === "knives") {
      bestCategoryLabel = "Ножі (EDC туризм)";
      explanation = "Ви ведете активний спосіб життя і за кулісами тактичної підготовки хотіли б мати універсальний ріжучий інструмент щоденного носіння. Наші складані та туристичні ножі на 100% не належать до ХО та стануть вашим щоденним компаньйоном.";
    } else if (bestCategory === "self_defense") {
      bestCategoryLabel = "Тактичні ліхтарі та Сирени";
      explanation = "Ви приділяєте максимум уваги безпеці в закритих приміщеннях, під'їздах та транспорті. Ми рекомендуємо безконтактні світло-шумові сирени та засліплюючі тактичні ліхтарі-безелі зі стробоскопом, які повністю легальні та вкрай ефективні.";
    } else if (bestCategory === "accessories") {
      bestCategoryLabel = "Тактичні аксесуари та захист";
      explanation = "Ви цінуєте високий захист та практичність. Тактичні ремені, перчатки та екіпірування підійдуть вам для активного використання, спорту та максимального особистого захисту в екстремальних сценаріях.";
    }

    return { bestCategoryLabel, products: recommendations, explanation };
  };

  const { bestCategoryLabel, products: recommendedProducts, explanation } = getRecommendations();
  const progressPercent = Math.round(((selectedAnswers.length) / SECURITY_QUIZ.length) * 100);

  return (
    <div id="defense-quiz" className="bg-[#121214] border border-[#27272a] rounded-xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {!isCompleted ? (
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-mono text-sm uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4" /> Інтерактивний тест
              </div>
              <h3 className="text-xl font-bold text-zinc-100">Підберіть ідеальний засіб захисту</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm text-zinc-500 font-mono">Запитання {currentStep + 1} з {SECURITY_QUIZ.length}</span>
              {/* Progress bar */}
              <div className="w-32 bg-zinc-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-300" 
                  style={{ width: `${progressPercent || 10}%` }} 
                />
              </div>
            </div>
          </div>

          <hr className="border-[#27272a] mb-6" />

          {/* Question Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-left"
            >
              <h4 className="text-lg md:text-xl font-semibold text-zinc-200">
                {SECURITY_QUIZ[currentStep].question}
              </h4>

              {/* Options Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {SECURITY_QUIZ[currentStep].options.map((option, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectOption(option.points, idx)}
                    className="p-4 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-amber-500/60 hover:bg-amber-500/5 text-[#d4d4d8] text-base transition-all text-left font-medium flex items-center justify-between cursor-pointer active:scale-95 group"
                  >
                    <span>{option.text}</span>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Completed/Result Section */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-left space-y-6"
        >
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/20 p-5 rounded-lg">
            <div className="flex items-start gap-3">
              <Award className="w-10 h-10 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-mono text-amber-500 uppercase tracking-widest block font-semibold">Ваша Рекомендована Категорія</span>
                <span className="text-2xl font-extrabold text-zinc-100 font-sans tracking-tight">{bestCategoryLabel}</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 border border-[#27272a] text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 font-mono text-xs py-2 px-3.5 rounded transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Пройти знову
            </button>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
            {explanation}
          </p>

          <hr className="border-[#27272a]" />

          {/* Recommended Products Grid */}
          <div>
            <h4 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Пропоновані товари для вашого сценарію:
            </h4>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {recommendedProducts.map((p) => (
                <div 
                  key={p.id} 
                  className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 flex flex-col justify-between hover:border-zinc-700 transition"
                >
                  <div>
                    <div className="aspect-[4/3] rounded overflow-hidden mb-3 bg-[#09090b]">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h5 className="font-semibold text-zinc-200 text-sm line-clamp-1 mb-1">{p.name}</h5>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#27272a]/40">
                      <span className="text-base font-bold text-zinc-100 font-mono">{p.price} ₴</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetails(p)}
                          className="p-1 px-2 hover:bg-zinc-800 text-zinc-400 rounded transition text-[11px] font-semibold cursor-pointer"
                        >
                          Деталі
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddToCart(p)}
                          className="bg-amber-500 text-[#09090b] font-medium p-1.5 px-3 rounded hover:bg-amber-400 transition text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
