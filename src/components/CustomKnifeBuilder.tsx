import { useState, useMemo } from "react";
import { Product } from "../types";
import { Shovel, ShieldCheck, Flame, Scale, Sparkles, Check, Info, Hammer, ShoppingBag, Eye, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface CustomKnifeBuilderProps {
  onAddToCart: (product: Product) => void;
  onOpenDetails?: (product: Product) => void;
}

type BladeShape = "drop_point" | "tanto" | "bowie" | "karambit" | "spear_point";
type BladeSteel = "d2" | "sandvik_14c28n" | "bohler_n690" | "bohler_m390" | "damascus" | "carbon_65g";
type BladeFinish = "satin" | "stonewash" | "blackwash" | "mirror" | "damascus_etch";
type HandleMaterial = "g10_black" | "g10_olive" | "micarta_green" | "olive_wood" | "carbon_fiber" | "titanium";
type HandlePins = "brass" | "screws_silver" | "titanium_blue" | "mosaic";
type SheathType = "none" | "kydex_black" | "kydex_coyote" | "leather_classic" | "cordura";

export default function CustomKnifeBuilder({ onAddToCart }: CustomKnifeBuilderProps) {
  // Configurator States
  const [bladeShape, setBladeShape] = useState<BladeShape>("drop_point");
  const [bladeLength, setBladeLength] = useState<number>(115); // mm
  const [bladeThickness, setBladeThickness] = useState<number>(3.5); // mm
  const [bladeSteel, setBladeSteel] = useState<BladeSteel>("d2");
  const [bladeFinish, setBladeFinish] = useState<BladeFinish>("stonewash");
  const [handleMaterial, setHandleMaterial] = useState<HandleMaterial>("g10_black");
  const [handlePins, setHandlePins] = useState<HandlePins>("brass");
  const [hasFingerChoil, setHasFingerChoil] = useState<boolean>(true);
  const [hasLanyardHole, setHasLanyardHole] = useState<boolean>(true);
  const [hasGlassBreaker, setHasGlassBreaker] = useState<boolean>(false);
  const [engravingText, setEngravingText] = useState<string>("");
  const [sheathType, setSheathType] = useState<SheathType>("kydex_black");
  const [fingerGuardSize, setFingerGuardSize] = useState<number>(3.5); // mm (crucial for Ukrainian weapon laws!)

  // UI flow states
  const [activeStep, setActiveStep] = useState<"blade" | "handle" | "extras">("blade");

  // Constant prices configuration
  const CONFIG_PRICES = {
    base: 2800,
    steel: {
      d2: 0,
      sandvik_14c28n: 450,
      bohler_n690: 750,
      bohler_m390: 2200,
      damascus: 2800,
      carbon_65g: 200
    },
    finish: {
      satin: 150,
      stonewash: 0,
      blackwash: 250,
      mirror: 600,
      damascus_etch: 350
    },
    handle: {
      g10_black: 0,
      g10_olive: 100,
      micarta_green: 300,
      olive_wood: 500,
      carbon_fiber: 1100,
      titanium: 1800
    },
    pins: {
      brass: 0,
      screws_silver: 100,
      titanium_blue: 250,
      mosaic: 450
    },
    extras: {
      engraving: 250,
      choil: 0,
      lanyard: 0,
      glassbreaker: 300
    },
    sheath: {
      none: -400,
      kydex_black: 0,
      kydex_coyote: 100,
      leather_classic: 350,
      cordura: -150
    }
  };

  // Human readables
  const steelLabels: Record<BladeSteel, string> = {
    d2: "Інструментальна D2 (59-61 HRC)",
    sandvik_14c28n: "Шведська Sandvik 14C28N (58-60 HRC)",
    bohler_n690: "Австрійська Böhler N690 (59-60 HRC)",
    bohler_m390: "Суперпорошок Böhler M390 (61-62 HRC)",
    damascus: "Художній Дамаск (500+ шарів, 58 HRC)",
    carbon_65g: "Ресорна Вуглецева 65Г (56-58 HRC)"
  };

  const shapeLabels: Record<BladeShape, string> = {
    drop_point: "Classic Drop-Point (Класичний)",
    tanto: "Tactical Tanto (Кутастий)",
    bowie: "Bowie Clip-Point (Мисливський)",
    karambit: "Curved Karambit (Кіготь)",
    spear_point: "Spear-Point (Кинджальний симетричний)"
  };

  const finishLabels: Record<BladeFinish, string> = {
    satin: "Satin (Подовжній ручний сатин)",
    stonewash: "StoneWash (Матове антивідблискове)",
    blackwash: "Blackwash/DLC (Тактичне чорне)",
    mirror: "Mirror Polish (Дзеркальний блиск)",
    damascus_etch: "Acid Etching (Контрастне кислотне цькування)"
  };

  const handleLabels: Record<HandleMaterial, string> = {
    g10_black: "Тактичний G10 Чорний",
    g10_olive: "Тактичний G10 Олива (Military)",
    micarta_green: "Преміум мікарта Canvas Green",
    olive_wood: "Добірне Оливкове дерево (+Карпатські тиснення)",
    carbon_fiber: "Авіаційний Вуглепластик (Carbon Fiber 3D)",
    titanium: "Космічний Титан анодований"
  };

  const pinsLabels: Record<HandlePins, string> = {
    brass: "Латунні трубчасті заклепки",
    screws_silver: "Нержавіючі стяжки Торкс",
    titanium_blue: "Титанові сині гвинти",
    mosaic: "Складний мозаїчний пін (Mosaic Pin з міддю)"
  };

  const sheathLabels: Record<SheathType, string> = {
    none: "Без піхов / чохла",
    kydex_black: "Kydex Чорний з кріпленням Tek-Lok",
    kydex_coyote: "Kydex Койот тактичний з Tek-Lok",
    leather_classic: "Натуральна чопра грубої шкіри з ремінним кріпленням",
    cordura: "Нейлоновий чохол Cordura з водовідштовхуванням"
  };

  // Dynamic price calculation
  const calculatedPrice = useMemo(() => {
    let tot = CONFIG_PRICES.base;
    tot += CONFIG_PRICES.steel[bladeSteel];
    tot += CONFIG_PRICES.finish[bladeFinish];
    tot += CONFIG_PRICES.handle[handleMaterial];
    tot += CONFIG_PRICES.pins[handlePins];
    tot += CONFIG_PRICES.sheath[sheathType];
    
    if (engravingText.trim().length > 0) tot += CONFIG_PRICES.extras.engraving;
    if (hasGlassBreaker) tot += CONFIG_PRICES.extras.glassbreaker;

    // Length factor: +15 ₴ per millimeter above 100mm
    if (bladeLength > 100) {
      tot += (bladeLength - 100) * 15;
    }
    // Thickness factor: +150 ₴ per mm above 3mm
    if (bladeThickness > 3) {
      tot += Math.floor((bladeThickness - 3) * 300);
    }

    return tot;
  }, [bladeSteel, bladeFinish, handleMaterial, handlePins, engravingText, hasGlassBreaker, bladeLength, bladeThickness, sheathType]);

  // Ukrainian weapons law classifier checker
  // According to Ukrainian law (МВС інструкція №745 & експертна методика):
  // Клинкова зброя є ХОЛОДНОЮ ЗБРОЄЮ (ХО) якщо одночасно виконуються наступні умови:
  // 1. Довжина клинка >= 90 мм
  // 2. Товщина клинка в найтовщому місці (обуху) >= 2.6 мм
  // 3. Наявність утикача, гарди, або підпальцевої виїмки/упору глибиною >= 5 мм (або сумарно для декількох виїмок >= 10 мм).
  // Якщо хоч ОДИН параметр виходить за норми (наприклад, лезо 120 мм, обух 4 мм, але упор 3 мм) - це НЕ є ХО.
  // Також двосічні кинджали мають інші застереження, але ми фокусуємось на упорі.
  const legalStatusInfo = useMemo(() => {
    const isLengthThreshold = bladeLength >= 90;
    const isThicknessThreshold = bladeThickness >= 2.6;
    const isGuardThreshold = fingerGuardSize >= 5;

    const isPotentialWeapon = isLengthThreshold && isThicknessThreshold && isGuardThreshold;

    if (isPotentialWeapon) {
      return {
        statusText: "⚠️ Потребує експертизи МВС / Мисливський квиток",
        colorClass: "text-amber-400 border-amber-500/30 bg-amber-500/5",
        description: `Оскільки довжина клинка (${bladeLength} мм), товщина обуха (${bladeThickness} мм) та розмір підпальцевого упору (гарди) (${fingerGuardSize} мм) ПЕРЕВИЩУЮТЬ гранично допустимі цивільні норми в Україні, такий виріб при балістичній експертизі МВС може бути визнаний Холодною Зброєю. Ми надішлемо ніж разом із заготовкою під упор, або зменшимо гарду до 4.5 мм безпосередньо при виготовленні, щоб гарантувати 100% ХОЗПОБУТОВИЙ статус (Довідка МВС у комплекті).`,
        legalActionSuggested: "Рекомендуємо: Послабити упор гарди до 4 мм в налаштуваннях нижче, щоб зробити ніж абсолютно легальним без документів."
      };
    } else {
      let logic = "";
      if (bladeLength < 90) logic = `Довжина клинка менша за 90 мм (${bladeLength} мм).`;
      else if (bladeThickness < 2.6) logic = `Товщина обуха менша за 2.6 мм (${bladeThickness} мм).`;
      else if (fingerGuardSize < 5) logic = `Висота підпальцевого упору/гарди менша за 5 мм (${fingerGuardSize} мм).`;

      return {
        statusText: "✅ 100% Цивільний / Легальний ніж (Довідка надається)",
        colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
        description: `Ніж повністю ЛЕГАЛЬНИЙ в Україні за господарсько-побутовим призначенням. Підстава: ${logic} Згідно з експертною методикою МВС України, ніж не вважається холодною зброєю. Ми доручимо офіційну копію сертифіката балістичного дослідження прямо у замовлення.`,
        legalActionSuggested: "Ніяких документів чи дозволів на носіння та купівлю не потрібно."
      };
    }
  }, [bladeLength, bladeThickness, fingerGuardSize]);

  // Construct dynamic product for the cart
  const handleAddToCartInteractive = () => {
    const customSpecsDescription = `Конструкторський ніж: Форма ${shapeLabels[bladeShape]}, сталь ${steelLabels[bladeSteel]}, покриття ${finishLabels[bladeFinish]}, руків'я ${handleLabels[handleMaterial]}, упор гарди ${fingerGuardSize}мм, довжина клинка ${bladeLength}мм, товщина обуху ${bladeThickness}мм, чохол: ${sheathLabels[sheathType]}` + 
      (engravingText.trim().length > 0 ? `, Гравіювання: «${engravingText}»` : "");

    const dynamicProduct: Product = {
      id: `custom-knife-${Date.now()}`,
      name: `Індивідуальний ніж «Ваш Дизайн» (${shapeLabels[bladeShape].split(" ")[0]})`,
      category: "knives",
      categoryLabel: "Ножі на замовлення",
      price: calculatedPrice,
      rating: 5.0,
      reviewsCount: 1,
      image: handleMaterial === "olive_wood" 
        ? "/src/assets/images/gent_karat_wood_1780558933627.png" 
        : handleMaterial === "g10_olive"
        ? "/src/assets/images/voin_g10_blackwash_1780558951322.png"
        : "/src/assets/images/sapsan_fixed_knife_1780558881528.png",
      description: customSpecsDescription,
      features: [
        `Кастомне загартування від коваля ВАРТА (${steelLabels[bladeSteel]})`,
        `Ручна підгонка ергономіки під довжину ${bladeLength}мм`,
        `Експертний сертифікат легальності МВС під визначені параметри`,
        engravingText.trim().length > 0 ? `Лазерне алмазне гравіювання: «${engravingText}»` : "Вакуумне збирання без люфтів"
      ],
      specs: {
        "Довжина клинка": `${bladeLength} мм`,
        "Товщина обуху": `${bladeThickness} мм`,
        "Марка сталі": steelLabels[bladeSteel],
        "Матеріал руков'я": handleLabels[handleMaterial],
        "Захисний упор": `${fingerGuardSize} мм`,
        "Тип кріплення": handlePins === "mosaic" ? "Мозаїчні піни" : pinsLabels[handlePins]
      },
      legalSelfDefenseStatus: legalStatusInfo.description,
      isLegalInUkraine: fingerGuardSize < 5 || bladeLength < 90 || bladeThickness < 2.6
    };

    onAddToCart(dynamicProduct);
  };

  // Helper values to style interactive SVG preview dynamically
  const svgConfigColors = useMemo(() => {
    let bladeFill = "#d4d4d8"; // satin / default
    let bladeStroke = "#71717a";
    let bladeGrainVisible = false;

    if (bladeFinish === "stonewash") {
      bladeFill = "#a1a1aa";
      bladeStroke = "#52525b";
    } else if (bladeFinish === "blackwash") {
      bladeFill = "#27272a";
      bladeStroke = "#09090b";
    } else if (bladeFinish === "mirror") {
      bladeFill = "#f4f4f5";
      bladeStroke = "#a1a1aa";
    } else if (bladeFinish === "damascus_etch") {
      bladeFill = "#3f3f46";
      bladeStroke = "#18181b";
      bladeGrainVisible = true;
    }

    if (bladeSteel === "damascus") {
      bladeFill = "#52525b";
      bladeGrainVisible = true;
    }

    let handleFill = "#18181b"; // black g10
    if (handleMaterial === "g10_olive") handleFill = "#3f4935"; // military green
    else if (handleMaterial === "micarta_green") handleFill = "#4a5d4e";
    else if (handleMaterial === "olive_wood") handleFill = "#b45309"; // warm wood
    else if (handleMaterial === "carbon_fiber") handleFill = "#09090b"; // woven black
    else if (handleMaterial === "titanium") handleFill = "#64748b"; // metallic greyish blue

    let pinFill = "#eab308"; // brass
    if (handlePins === "screws_silver") pinFill = "#cbd5e1";
    if (handlePins === "titanium_blue") pinFill = "#3b82f6";
    if (handlePins === "mosaic") pinFill = "#f59e0b"; // copper glow

    return { bladeFill, bladeStroke, bladeGrainVisible, handleFill, pinFill };
  }, [bladeFinish, bladeSteel, handleMaterial, handlePins]);

  return (
    <div className="grid gap-8 lg:grid-cols-12 text-left max-w-6xl mx-auto">
      
      {/* Configuration steps, panel controls: 7 Cols on desktop */}
      <div className="lg:col-span-7 bg-[#121214] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between shadow-2xl relative">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 font-mono">Конструктор індивідуальних ножів</h3>
                <span className="text-xs text-zinc-500 font-mono">Ручна праця та сертифікація під ваші габарити</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 font-mono block">Розрахункова вартість:</span>
              <span className="text-xl font-bold text-amber-500 font-mono">{calculatedPrice.toLocaleString()} ₴</span>
            </div>
          </div>

          {/* Configuration step navigation tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
            {(["blade", "handle", "extras"] as const).map((step) => {
              const stepLabel = step === "blade" ? "1. Клинок" : step === "handle" ? "2. Руків'я" : "3. Деталі / Чохол";
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveStep(step)}
                  className={`py-2 rounded text-xs font-mono tracking-tight uppercase transition cursor-pointer ${
                    activeStep === step
                      ? "bg-amber-500 text-black font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {stepLabel}
                </button>
              );
            })}
          </div>

          {/* STEP 1: Blade config */}
          {activeStep === "blade" && (
            <div className="space-y-5">
              {/* Blade Shape Selector */}
              <div>
                <label className="text-xs font-mono text-zinc-450 block mb-2 uppercase font-semibold text-zinc-400 flex items-center justify-between">
                  <span>Форма клинка</span>
                  <span className="text-amber-500 text-[10px] normal-case font-normal">Впливає на ріжучу геометрію</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(shapeLabels) as BladeShape[]).map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setBladeShape(shape)}
                      className={`p-3 text-left rounded-lg text-xs font-medium border transition cursor-pointer flex flex-col justify-between ${
                        bladeShape === shape
                          ? "bg-amber-500/10 border-amber-500 text-zinc-100"
                          : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <span className="font-semibold text-zinc-200">{shapeLabels[shape].split(" ")[0]}</span>
                      <span className="text-[10px] text-zinc-500 mt-1">{shapeLabels[shape].substring(shapeLabels[shape].indexOf("("))}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Steel Selector */}
              <div>
                <label className="text-xs font-mono text-zinc-450 block mb-2 uppercase font-semibold text-zinc-400">Марка сталі</label>
                <div className="grid gap-2">
                  {(Object.keys(steelLabels) as BladeSteel[]).map((steel) => {
                    const priceOffset = CONFIG_PRICES.steel[steel];
                    return (
                      <button
                        key={steel}
                        type="button"
                        onClick={() => {
                          setBladeSteel(steel);
                          if (steel === "damascus") {
                            setBladeFinish("damascus_etch");
                          } else if (bladeFinish === "damascus_etch") {
                            setBladeFinish("stonewash");
                          }
                        }}
                        className={`p-2.5 text-left rounded-lg text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
                          bladeSteel === steel
                            ? "bg-amber-500/10 border-amber-500 text-zinc-200"
                            : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${bladeSteel === steel ? "bg-amber-500 animate-pulse" : "bg-zinc-650"}`} />
                          <span>{steelLabels[steel]}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {priceOffset === 0 ? "Базова ціна" : `+${priceOffset} ₴`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders for Dimensions */}
              <div className="bg-[#18181b] border border-[#27272a]/60 rounded-xl p-4.5 space-y-4">
                <h4 className="text-xs font-mono text-amber-500 font-bold uppercase flex items-center gap-1">
                  <Scale className="w-4 h-4 text-emerald-400" /> Фізичні габарити виробу:
                </h4>
                
                {/* Length */}
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-zinc-400">Довжина ріжучої кромки:</span>
                    <strong className="text-zinc-200">{bladeLength} мм</strong>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    value={bladeLength}
                    onChange={(e) => setBladeLength(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-1">
                    <span>80 мм (Кишеньковий)</span>
                    <span>150 мм (Кемпінг)</span>
                    <span>220 мм (Екстремальний)</span>
                  </div>
                </div>

                {/* Thickness */}
                <div>
                  <div className="flex justify-between items-center text-xs font-mono mb-1">
                    <span className="text-zinc-400">Товщина обуху леза:</span>
                    <strong className="text-zinc-200">{bladeThickness.toFixed(1)} мм</strong>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="5.5"
                    step="0.1"
                    value={bladeThickness}
                    onChange={(e) => setBladeThickness(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-1">
                    <span>2.0 мм (Маневрений різак)</span>
                    <span>3.5 мм (Стандарт EDC)</span>
                    <span>5.5 мм (Суперстійкий тактик)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Handle config */}
          {activeStep === "handle" && (
            <div className="space-y-5">
              {/* Material selection */}
              <div>
                <label className="text-xs font-mono text-zinc-450 block mb-2 uppercase font-semibold text-zinc-400">Матеріал плашок руків'я</label>
                <div className="grid gap-2">
                  {(Object.keys(handleLabels) as HandleMaterial[]).map((mat) => {
                    const priceOffset = CONFIG_PRICES.handle[mat];
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setHandleMaterial(mat)}
                        className={`p-2.5 text-left rounded-lg text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
                          handleMaterial === mat
                            ? "bg-amber-500/10 border-amber-500 text-zinc-200"
                            : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded border border-zinc-700`} style={{
                            backgroundColor: mat === "g10_black" ? "#1f1f23" : 
                                             mat === "g10_olive" ? "#4a543f" : 
                                             mat === "micarta_green" ? "#506555" : 
                                             mat === "olive_wood" ? "#8c5b30" : 
                                             mat === "carbon_fiber" ? "#09090b" : "#64748b"
                          }} />
                          <span>{handleLabels[mat]}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {priceOffset === 0 ? "Без доплати" : `+${priceOffset} ₴`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pins fastners selection */}
              <div>
                <label className="text-xs font-mono text-zinc-450 block mb-2 uppercase font-semibold text-zinc-400">Тип кріпильних пінів</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(pinsLabels) as HandlePins[]).map((pin) => {
                    const priceOffset = CONFIG_PRICES.pins[pin];
                    return (
                      <button
                        key={pin}
                        type="button"
                        onClick={() => setHandlePins(pin)}
                        className={`p-3 text-left rounded-lg text-xs font-medium border transition cursor-pointer flex flex-col justify-between ${
                          handlePins === pin
                            ? "bg-amber-500/10 border-amber-500 text-zinc-200"
                            : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <span className="font-semibold text-zinc-300">{pinsLabels[pin].split(" ")[0]}</span>
                        <span className="font-mono text-[9px] text-zinc-500 mt-2">
                          {priceOffset === 0 ? "У базовому тарифі" : `+${priceOffset} ₴`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guard control slider for Ukrainian legal compliance */}
              <div className="bg-[#18181b] border border-[#27272a]/60 rounded-xl p-4.5 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    Упор / Гарда руків'я:
                    <span className="group relative cursor-help">
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-650 text-zinc-500" />
                      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black border border-[#27272a] p-3 rounded w-64 text-[10px] text-zinc-400 z-50 leading-relaxed shadow-lg">
                        Гарда товщиною &gt;= 5 мм спільно з лезом понад 90 мм класифікує ніж як спортивну/бойову холодну зброю в Україні. Встановіть менше 5 мм для повної цивільної свободи! Only in Ukraine.
                      </span>
                    </span>
                  </span>
                  <strong className={fingerGuardSize >= 5 ? "text-amber-500" : "text-emerald-400"}>
                    {fingerGuardSize} мм {fingerGuardSize >= 5 ? "(Критично)" : "(Цивільно)"}
                  </strong>
                </div>
                
                <input
                  type="range"
                  min="0.0"
                  max="8.0"
                  step="0.5"
                  value={fingerGuardSize}
                  onChange={(e) => setFingerGuardSize(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {fingerGuardSize >= 5 
                    ? "⚠️ Обумовлено мисливськими або колекційними конфігураціями. Для вільного носіння рекомендується повсякденне зменшення до 4.5 мм чи ніж без кілючого вістря."
                    : "✔️ Безпечний цивільний габарит. Не підпадає під обмеження на носіння містом МВС України."}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Extras / Finishes / Engraving / Sheath */}
          {activeStep === "extras" && (
            <div className="space-y-5">
              {/* Blade Finish selection */}
              {bladeSteel !== "damascus" && (
                <div>
                  <label className="text-xs font-mono text-zinc-450 block mb-2 uppercase font-semibold text-zinc-400">Тактичне фінішне покриття леза</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(finishLabels) as BladeFinish[]).filter(f => f !== "damascus_etch").map((finish) => {
                      const priceOffset = CONFIG_PRICES.finish[finish];
                      return (
                        <button
                          key={finish}
                          type="button"
                          onClick={() => setBladeFinish(finish)}
                          className={`p-3 text-left rounded-lg text-xs font-medium border transition cursor-pointer flex flex-col justify-between ${
                            bladeFinish === finish
                              ? "bg-amber-500/10 border-amber-500 text-zinc-200"
                              : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700"
                          }`}
                        >
                          <span className="font-semibold text-zinc-350">{finishLabels[finish].split(" ")[0]}</span>
                          <span className="font-mono text-[9px] text-zinc-500 mt-2">
                            {priceOffset === 0 ? "Базове шліфування" : `+${priceOffset} ₴`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sheaths/Scabbards selection */}
              <div>
                <label className="text-xs font-mono text-zinc-450 block mb-2 uppercase font-semibold text-zinc-400">Тактичні піхви / кобура в комплекті</label>
                <div className="grid gap-2">
                  {(Object.keys(sheathLabels) as SheathType[]).map((sheath) => {
                    const priceOffset = CONFIG_PRICES.sheath[sheath];
                    return (
                      <button
                        key={sheath}
                        type="button"
                        onClick={() => setSheathType(sheath)}
                        className={`p-2.5 text-left rounded-lg text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
                          sheathType === sheath
                            ? "bg-amber-500/10 border-amber-500 text-zinc-200"
                            : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Check className={`w-3.5 h-3.5 text-amber-500 transition-opacity ${sheathType === sheath ? "opacity-100" : "opacity-20"}`} />
                          <span>{sheathLabels[sheath]}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-550">
                          {priceOffset < 0 ? `Знижка -${Math.abs(priceOffset)} ₴` : priceOffset === 0 ? "Включено" : `+${priceOffset} ₴`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hand-carved or laser custom initials Engraving */}
              <div className="bg-[#18181b] border border-[#27272a]/60 rounded-xl p-4.5 space-y-3">
                <label className="text-xs font-mono text-zinc-450 block uppercase font-semibold text-zinc-400 flex justify-between items-center">
                  <span>Текстове лазерне гравіювання</span>
                  <span className="text-emerald-400 font-mono text-[10px] normal-case">+250 ₴</span>
                </label>
                
                <input
                  type="text"
                  maxLength={25}
                  placeholder="Приклад: Слава Україні / Воля / Позивний..."
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded p-2.5 text-xs text-zinc-205 text-zinc-200 outline-none focus:border-amber-500 text-left"
                />
                
                <p className="text-[10px] text-zinc-550 text-zinc-550 text-zinc-500">
                  Алмазне волоконне гравіювання наноситься біля спуску обуха. Букви гравіюються симетрично або з обраної сторони. Дозволяє надати виробу індивідуального характеру.
                </p>
              </div>

              {/* Addtional fast custom ergonomic parameters checkbox */}
              <div className="bg-black/30 border border-[#27272a]/40 rounded-xl p-4 grid grid-cols-2 gap-2.5 text-xs">
                {/* Choil */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasFingerChoil}
                    onChange={(e) => setHasFingerChoil(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <div>
                    <span className="block font-medium text-zinc-300">Дулька / Чойл</span>
                    <span className="text-[9px] text-zinc-500 font-mono">(для зручності заточки)</span>
                  </div>
                </label>

                {/* Lanyard hole */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasLanyardHole}
                    onChange={(e) => setHasLanyardHole(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <div>
                    <span className="block font-medium text-zinc-300">Отвір під темляк</span>
                    <span className="text-[9px] text-zinc-500 font-mono">(трубка діам. 6мм)</span>
                  </div>
                </label>

                {/* Skull crusher / glassbreaker */}
                <label className="flex items-center gap-2.5 col-span-2 cursor-pointer select-none border-t border-[#27272a]/30 pt-2 mt-1">
                  <input
                    type="checkbox"
                    checked={hasGlassBreaker}
                    onChange={(e) => setHasGlassBreaker(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <div className="flex-1 flex justify-between items-center pr-2">
                    <div>
                      <span className="block font-medium text-zinc-300">Тильник-склобій (Glassbreaker)</span>
                      <span className="text-[9px] text-zinc-500">Виступ хвостовика на кінці руків'я із надтвердими сплавами</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">+300 ₴</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic bottom action checker / Add to cart */}
        <div className="mt-8 pt-4 border-t border-[#27272a] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs text-zinc-500 font-mono block">Ви замовляєте виріб ексклюзивної конфігурації. Термін готовності:</span>
            <strong className="text-emerald-400 text-xs font-mono">⚡ Лише 3 робочі дні (Кузня ВАРТА)</strong>
          </div>
          
          <button
            type="button"
            onClick={handleAddToCartInteractive}
            className="bg-amber-500 text-zinc-950 font-bold px-6 py-3 rounded-lg hover:bg-amber-400 transition cursor-pointer flex items-center justify-center gap-2 text-sm shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.35)] active:scale-95 shrink-0"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            Додати кастомний ніж у кошик
          </button>
        </div>
      </div>

      {/* Visual Live SVG Interactive Design Preview: 5 Cols on desktop */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        
        {/* Real-time SVG preview */}
        <div className="bg-[#121214] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between h-full min-h-[380px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 bg-[#ea580c]/5 w-40 h-40 rounded-full filter blur-3xl" />
          
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-amber-500" /> СХЕМАТИЧНИЙ 2D ПРЕВ'Ю-ПРОЕКТ
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
              Вектор масштаб 1:1
            </span>
          </div>

          {/* Interactive responsive SVG Drawing */}
          <div className="flex-1 flex items-center justify-center py-6">
            <svg 
              viewBox="0 0 500 240" 
              className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)] select-none transition-transform duration-500 group-hover:scale-105"
            >
              {/* Optional Grid Background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#27272a" strokeWidth="0.5" opacity="0.4" />
                </pattern>
                
                {/* Damascus Steel Pattern Overlay */}
                <pattern id="damascus-grain" width="100" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                  <path 
                    d="M0 10 Q25 5, 50 10 T100 10 M0 20 Q25 15, 50 20 T100 20 M0 30 Q25 25, 50 30 T100 30 M0 40 Q25 35, 50 40 T100 40" 
                    fill="none" 
                    stroke="#18181b" 
                    strokeWidth="1.2" 
                    opacity="0.45" 
                  />
                  <path 
                    d="M0 15 Q30 8, 60 15 T100 15 M0 25 Q30 18, 60 25 T100 25 M0 35 Q30 28, 60 35 T100 35" 
                    fill="none" 
                    stroke="#3f3f46" 
                    strokeWidth="0.8" 
                    opacity="0.35" 
                  />
                </pattern>

                {/* Satin Linear Gradients */}
                <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={svgConfigColors.bladeFill} />
                  <stop offset="50%" stopColor="#e4e4e7" stopOpacity="0.8" />
                  <stop offset="100%" stopColor={svgConfigColors.bladeStroke} />
                </linearGradient>

                <linearGradient id="handle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#18181b" />
                  <stop offset="40%" stopColor={svgConfigColors.handleFill} />
                  <stop offset="100%" stopColor="#18181b" />
                </linearGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              <g transform="translate(10, 20)">
                {/* 1. BLADE DRAWING BASED ON SHAPE CONFIG */}
                {/* Baseline origin handle junction: X=240, Y=100. Size scales with bladeLength state */}
                {/* 2D Paths matching the specific shapes */}
                <g>
                  {/* Drop Point */}
                  {bladeShape === "drop_point" && (
                    <path 
                      d={`M 240 70 L ${240 - bladeLength} 75 Q ${240 - bladeLength - 15} 90, ${240 - bladeLength} 115 Q ${240 - bladeLength + 45} 125, 240 120 Z`}
                      fill="url(#blade-grad)" 
                      stroke={svgConfigColors.bladeStroke}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Tanto Shape */}
                  {bladeShape === "tanto" && (
                    <path 
                      d={`M 240 70 L ${240 - bladeLength + 25} 70 L ${240 - bladeLength - 15} 95 L ${240 - bladeLength + 10} 120 L 240 120 Z`}
                      fill="url(#blade-grad)" 
                      stroke={svgConfigColors.bladeStroke}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Bowie Clip Point */}
                  {bladeShape === "bowie" && (
                    <path 
                      d={`M 240 70 L ${240 - bladeLength + 35} 75 Q ${245 - bladeLength} 90, ${240 - bladeLength - 12} 88 Q ${240 - bladeLength + 35} 128, 240 118 Z`}
                      fill="url(#blade-grad)" 
                      stroke={svgConfigColors.bladeStroke}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Karambit Hook curved claw tip */}
                  {bladeShape === "karambit" && (
                    <path 
                      d={`M 240 70 Q 200 60, ${240 - bladeLength + 20} 95 Q ${240 - bladeLength - 20} 145, ${240 - bladeLength} 142 Q 200 125, 240 120 Z`}
                      fill="url(#blade-grad)" 
                      stroke={svgConfigColors.bladeStroke}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Spear Point fully symmetric */}
                  {bladeShape === "spear_point" && (
                    <path 
                      d={`M 240 70 Q 180 70, ${240 - bladeLength} 95 Q 180 120, 240 120 Z`}
                      fill="url(#blade-grad)" 
                      stroke={svgConfigColors.bladeStroke}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Optional Damascus steel pattern grain overlay */}
                  {svgConfigColors.bladeGrainVisible && (
                    <path 
                      d={
                        bladeShape === "drop_point" ? `M 240 70 L ${240 - bladeLength} 75 Q ${240 - bladeLength - 15} 90, ${240 - bladeLength} 115 Q ${240 - bladeLength + 45} 125, 240 120 Z` :
                        bladeShape === "tanto" ? `M 240 70 L ${240 - bladeLength + 25} 70 L ${240 - bladeLength - 15} 95 L ${240 - bladeLength + 10} 120 L 240 120 Z` :
                        bladeShape === "bowie" ? `M 240 70 L ${240 - bladeLength + 35} 75 Q ${245 - bladeLength} 90, ${240 - bladeLength - 12} 88 Q ${240 - bladeLength + 35} 128, 240 118 Z` :
                        bladeShape === "karambit" ? `M 240 70 Q 200 60, ${240 - bladeLength + 20} 95 Q ${240 - bladeLength - 20} 145, ${240 - bladeLength} 142 Q 200 125, 240 120 Z` :
                        `M 240 70 Q 180 70, ${240 - bladeLength} 95 Q 180 120, 240 120 Z`
                      }
                      fill="url(#damascus-grain)" 
                      opacity="0.6"
                      pointerEvents="none"
                    />
                  )}

                  {/* Custom Engraving Layer on blade surface */}
                  {engravingText.trim().length > 0 && (
                    <text 
                      x={240 - bladeLength / 1.7} 
                      y="98" 
                      fill="#0f172a" 
                      opacity="0.75" 
                      fontFamily="monospace" 
                      fontSize="9" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      letterSpacing="1"
                      transform={`rotate(${bladeShape === "karambit" ? 12 : 1}, ${240 - bladeLength / 1.7}, 98)`}
                    >
                      {engravingText.toUpperCase()}
                    </text>
                  )}
                </g>

                {/* 2. HANDLE GEOMETRY WITH MATERIAL OVERLAYS */}
                {/* Finger Guard (Garda size) - drawn before handle to represent a front bolster */}
                <path 
                  d={`M 238 ${70 - fingerGuardSize} L 242 ${70 - fingerGuardSize} L 242 ${120 + fingerGuardSize} L 238 ${120 + fingerGuardSize} Z`}
                  fill={svgConfigColors.pinFill}
                  stroke="#1e293b"
                  strokeWidth="1.2"
                />

                {/* Handle Scales */}
                <path 
                  d="M 242 70 L 370 73 Q 395 72, 400 95 Q 395 118, 370 117 L 242 120 C 248 110, 248 80, 242 70 Z" 
                  fill="url(#handle-grad)" 
                  stroke="#09090b"
                  strokeWidth="2"
                />

                {/* Optional finger choil groove */}
                {hasFingerChoil && (
                  <ellipse cx="255" cy="116" rx="9" ry="5" fill="#09090b" opacity="0.8" />
                )}

                {/* Lanyard Hole spacer */}
                {hasLanyardHole && (
                  <>
                    <circle cx="380" cy="95" r="5.5" fill="#09090b" stroke={svgConfigColors.pinFill} strokeWidth="1.5" />
                    <circle cx="380" cy="95" r="3.5" fill="#09090b" />
                  </>
                )}

                {/* Tactical Glassbreaker Tip on skull crusher pommel */}
                {hasGlassBreaker && (
                  <path 
                    d="M 398 90 L 408 95 L 398 100 Z" 
                    fill="#334155" 
                    stroke="#0f172a" 
                    strokeWidth="1.5"
                  />
                )}

                {/* Fasteners Pins based on configuration */}
                <circle cx="275" cy="95" r="4.5" fill={svgConfigColors.pinFill} stroke="#1e293b" strokeWidth="1" />
                <circle cx="315" cy="95" r="4.5" fill={svgConfigColors.pinFill} stroke="#1e293b" strokeWidth="1" />
                <circle cx="350" cy="95" r="4.5" fill={svgConfigColors.pinFill} stroke="#1e293b" strokeWidth="1" />

                {/* Extra detailed crosshairs for high quality mosaic design */}
                {handlePins === "mosaic" && (
                  <>
                    <circle cx="275" cy="95" r="1.5" fill="#ef4444" />
                    <circle cx="315" cy="95" r="1.5" fill="#ef4444" />
                    <circle cx="350" cy="95" r="1.5" fill="#ef4444" />
                  </>
                )}
              </g>
            </svg>
          </div>

          {/* Specs breakdown card overlay */}
          <div className="bg-[#09090b]/80 border border-[#27272a]/60 rounded-lg p-3 font-mono text-[10px] text-zinc-400 space-y-2 text-left">
            <div className="flex justify-between border-b border-[#27272a]/40 pb-1.5">
              <span>Хвостовик:</span>
              <strong className="text-zinc-200">Full-Tang (Суцільний)</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-550 block text-zinc-500">ГЕОМЕТРІЯ:</span>
                <span className="text-zinc-200 block truncate">{shapeLabels[bladeShape].split(" ")[0]}</span>
              </div>
              <div>
                <span className="text-zinc-550 block text-zinc-500 font-semibold text-zinc-400">КУВАННЯ ТА СТАЛЬ:</span>
                <span className="text-zinc-205 text-amber-500 block truncate">{steelLabels[bladeSteel].split(" ")[0]}</span>
              </div>
              <div>
                <span className="text-zinc-550 block text-zinc-500">ГАБАРИТИ ЛЕЗА:</span>
                <span className="text-zinc-200 block">{bladeLength}x{bladeThickness.toFixed(1)} мм</span>
              </div>
              <div>
                <span className="text-zinc-550 block text-zinc-500">УПОР / ГАРДА:</span>
                <span className="text-zinc-200 block">{fingerGuardSize} мм</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal check panel */}
        <div className={`border rounded-xl p-5 text-left transition-colors space-y-3 ${legalStatusInfo.colorClass}`}>
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <Scale className="w-4.5 h-4.5 text-[#ea580c]" />
            <span>ЮРИДИЧНИЙ АНАЛІЗ (МВС КЛАСИФІКАЦІЯ)</span>
          </div>
          
          <h5 className="font-bold text-xs uppercase underline">
            {legalStatusInfo.statusText}
          </h5>

          <p className="text-[11px] leading-relaxed text-zinc-300">
            {legalStatusInfo.description}
          </p>

          <p className="text-[11px] font-mono text-zinc-400 border-t border-[#27272a]/50 pt-2.5 leading-normal italic">
            💡 {legalStatusInfo.legalActionSuggested}
          </p>
        </div>
      </div>
    </div>
  );
}
