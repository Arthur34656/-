import React, { useState, useMemo, FormEvent } from "react";
import { PRODUCTS } from "../data";
import { MapPin, Phone, Clock, ShieldCheck, Target, Hammer, Search, Calendar, Check, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Store {
  id: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  features: string[];
  shootingRange: boolean;
  sharpenerWorkshop: boolean;
  coordinates: { x: number; y: number };
}

export default function StoreLocator() {
  const stores: Store[] = [
    {
      id: "varta-kyiv",
      city: "Київ",
      address: "вул. Велика Васильківська, 42 (метро «Площа Українських Героїв»)",
      phone: "+380 (44) 344-12-00",
      hours: "Пн-Нд: 10:00 - 20:00",
      features: [
        "Флагманський шоурум самооборони",
        "Підземний закритий тестовий тир",
        "Ковальська майстерня підгонки та кастомізації",
        "Сервісна зона безкоштовного тесту довідки МВС"
      ],
      shootingRange: true,
      sharpenerWorkshop: true,
      coordinates: { x: 260, y: 75 } // custom Kyiv relative mapping location
    },
    {
      id: "varta-lviv",
      city: "Львів",
      address: "вул. Стрийська, 33 (кут вул. Сахарова)",
      phone: "+380 (32) 203-90-50",
      hours: "Пн-Сб: 10:00 - 19:00, Нд: 11:00 - 17:00",
      features: [
        "Тактичний простір та лекторій з такмеду",
        "Зона кастомного лазерного гравіювання",
        "Пункт видачі індивідуальних ковальських замовлень",
        "Виставка мисливських дамаських клинків"
      ],
      shootingRange: false,
      sharpenerWorkshop: true,
      coordinates: { x: 92, y: 110 } // Lviv mapping coordinates
    },
    {
      id: "varta-dnipro",
      city: "Дніпро",
      address: "просп. Дмитра Яворницького, 55 (Гранд-Плаза)",
      phone: "+380 (56) 740-15-40",
      hours: "Пн-Сб: 10:00 - 19:00, Нд: Вихідний",
      features: [
        "Опорний екіпірувальний центр",
        "Тестовий стенд газових балончиків та засобів ураження",
        "Точка безкоштовної балістичної консультації"
      ],
      shootingRange: false,
      sharpenerWorkshop: false,
      coordinates: { x: 388, y: 125 } // Dnipro mapping coordinates
    }
  ];

  const [selectedStoreId, setSelectedStoreId] = useState<string>("varta-kyiv");
  const [availabilityProductId, setAvailabilityProductId] = useState<string>(PRODUCTS[0].id);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingService, setBookingService] = useState("training_spray");
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Active store object
  const activeStore = useMemo(() => {
    return stores.find(s => s.id === selectedStoreId) || stores[0];
  }, [selectedStoreId, stores]);

  // Dynamic stock calculator based on product choice and store mapping
  const currentStockInfo = useMemo(() => {
    const product = PRODUCTS.find(p => p.id === availabilityProductId);
    if (!product) return { status: "Невідомо", count: 0, color: "text-zinc-500 bg-zinc-500/10" };

    // Deterministic stock level depending on string hash combinations
    const charCodeSum = product.name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + selectedStoreId.charCodeAt(6);
    const stockCount = (charCodeSum % 9) + 1; // Between 1 and 9 pieces

    if (stockCount > 5) {
      return {
        status: `В наявності багато (${stockCount} одиниць)`,
        count: stockCount,
        color: "text-emerald-450 text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      };
    } else {
      return {
        status: `В наявності мало (останні ${stockCount} одиниці)`,
        count: stockCount,
        color: "text-amber-450 text-amber-500 bg-amber-500/10 border-amber-500/20"
      };
    }
  }, [availabilityProductId, selectedStoreId]);

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate) return;
    setBookingSubmitted(true);
    setTimeout(() => {
      setBookingSubmitted(false);
      setBookingName("");
      setBookingPhone("");
      setBookingDate("");
    }, 4500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      
      {/* City tabs headers */}
      <div className="grid grid-cols-3 gap-2 bg-[#121214] p-1.5 rounded-xl border border-[#27272a]">
        {stores.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedStoreId(s.id)}
            className={`py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              selectedStoreId === s.id
                ? "bg-amber-500 text-zinc-950 font-black shadow-[0_4px_12px_rgba(245,158,11,0.15)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <span className="text-sm">{s.city}</span>
            <span className="text-[9px] font-normal lowercase max-w-[120px] truncate opacity-80 sm:block hidden">
              {s.address.split("(")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Primary layout: Info & map (7 cols) / Check availability + booking (5 cols) */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* Left window: Address breakdown and visual map mockups */}
        <div className="lg:col-span-7 bg-[#121214] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between shadow-xl space-y-6">
          <div className="space-y-4">
            
            {/* Store title card */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-zinc-100 font-sans">
                  ВАРТА • Шоурум {activeStore.city}
                </h3>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  {activeStore.address}
                </p>
              </div>
            </div>

            {/* Timings and contacts */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#27272a]/70 py-4 font-mono text-xs">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-zinc-650 text-zinc-500 block uppercase">Робочі години:</span>
                  <span className="text-zinc-200 font-semibold">{activeStore.hours}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-zinc-650 text-zinc-500 block uppercase">Гаряча лінія філії:</span>
                  <span className="text-zinc-200 font-semibold">{activeStore.phone}</span>
                </div>
              </div>
            </div>

            {/* List of features */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Набір тактичних послуг філії:
              </h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono text-zinc-350">
                {activeStore.features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-[#18181b] p-3 rounded-lg border border-[#27272a]/50">
                    <span className="text-emerald-400 font-bold">✔️</span>
                    <span className="text-zinc-300 font-medium leading-normal">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulated Tactical Interactive Map Vector SVG of Ukraine */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4.5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 text-[9px] font-mono text-zinc-500 uppercase tracking-widest pointer-events-none">
              СХЕМАТИЧНА СУПУТНИКОВА МАПА ПОРТАЛУ ВАРТА
            </div>
            
            <div className="flex items-center justify-center py-5">
              <svg viewBox="0 0 480 200" className="w-full h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] select-none">
                {/* Simplified vector grid for map background */}
                <defs>
                  <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill="#27272a" opacity="0.6" />
                  </pattern>
                  <pattern id="diagonal-hash" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="10" stroke="#ffedd5" strokeWidth="0.5" opacity="0.1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
                <rect width="100%" height="100%" fill="url(#diagonal-hash)" />

                {/* Highly simplified contour shape representation of Ukraine */}
                <path 
                  d="M 50 110 C 60 70, 110 50, 180 60 C 230 50, 310 40, 370 70 C 430 80, 450 110, 420 140 C 390 150, 340 160, 300 150 C 270 170, 240 185, 200 170 C 140 160, 90 170, 50 140 Z" 
                  fill="#18181b" 
                  stroke="#27272a" 
                  strokeWidth="2" 
                />

                {/* Dnipro river curve schematic representation */}
                <path 
                  d="M 260 62 Q 220 100, 255 120 T 290 155" 
                  fill="none" 
                  stroke="#1c1917" 
                  strokeWidth="3" 
                  opacity="0.4"
                />

                {/* Coordinates pins pointing to Varta stores */}
                {stores.map((s) => {
                  const isActive = s.id === selectedStoreId;
                  return (
                    <g 
                      key={s.id} 
                      className="cursor-pointer group" 
                      onClick={() => setSelectedStoreId(s.id)}
                    >
                      {/* Interactive area radar animation pulse */}
                      {isActive && (
                        <circle 
                          cx={s.coordinates.x} 
                          cy={s.coordinates.y} 
                          r="14" 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="1.5"
                          className="animate-ping origin-center"
                          style={{ transformOrigin: `${s.coordinates.x}px ${s.coordinates.y}px` }}
                        />
                      )}

                      {/* Hard Point Pin */}
                      <circle 
                        cx={s.coordinates.x} 
                        cy={s.coordinates.y} 
                        r={isActive ? "7" : "5.5"} 
                        fill={isActive ? "#f59e0b" : "#4b5563"} 
                        stroke="#09090b" 
                        strokeWidth="1.5"
                        className="transition-all duration-300"
                      />

                      {/* City Text Labels on map */}
                      <text 
                        x={s.coordinates.x} 
                        y={s.coordinates.y - (isActive ? 12 : 9)} 
                        fill={isActive ? "#f59e0b" : "#9ca3af"} 
                        fontSize={isActive ? "10" : "8"} 
                        fontFamily="monospace"
                        fontWeight="bold" 
                        textAnchor="middle"
                        className="transition-all"
                      >
                        {s.city.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            <div className="text-center font-mono text-[9px] text-zinc-550 text-zinc-500">
              * Клацніть на точку на мапі або оберіть перемикачі вище, щоб змінити фокус філії.
            </div>
          </div>
        </div>

        {/* Right window: Availability widget and training session selector */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Availability Widget */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-5 shadow-xl space-y-4">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5 border-b border-[#27272a] pb-2">
                <Search className="w-4.5 h-4.5 text-amber-500" /> Перевірити Наявність у філії
              </h4>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block uppercase mb-1">Оберіть виріб:</label>
                <select
                  value={availabilityProductId}
                  onChange={(e) => setAvailabilityProductId(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-xs text-zinc-200 font-mono outline-none focus:border-amber-500"
                >
                  {PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price} ₴)</option>
                  ))}
                </select>
              </div>

              {/* Graphical stock output card */}
              <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors font-mono text-xs ${currentStockInfo.color}`}>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase mb-0.5">СТАТУС СКЛАДУ ({activeStore.city}):</span>
                  <strong className="text-sm font-semibold">{currentStockInfo.status}</strong>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[9px] text-zinc-500 block uppercase">Зарезервувати:</span>
                  <span className="text-[10px] text-zinc-400">тел: 0 800 500 600</span>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-zinc-500 font-sans">
                У нас діє автоматична синхронізація залишків. Ви можете оформити самовивіз через Кнопку в кошику, і спорядження буде очікувати на вас у касі обраної філії з безкоштовним подарунковим темляком.
              </p>
            </div>
          </div>

          {/* Secure Booking Form */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-5 shadow-xl">
            <h4 className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5 border-b border-[#27272a] pb-2 mb-3.5">
              <Calendar className="w-4.5 h-4.5 text-amber-500" /> Запис на Тематичний Візит / Тюнінг
            </h4>

            {bookingSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center font-mono text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-2"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <Check className="w-5 h-5" />
                </div>
                <strong>ЗАПИС УСПІШНО РЕЄСТРОВАНО!</strong>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans normal-case">
                  Наш адміністратор зв'яжеться з вами за вказаним номером телефону протягом 15 хвилин для підтвердження часу вашого візиту у філію <b>{activeStore.city}</b>.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 block uppercase mb-1">Практична Послуга:</label>
                  <select
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                  >
                    <option value="training_spray">Тест-драйв і вебінар по роботі з газовим розпиром</option>
                    <option value="sharpening_custom">Сервісне кастомне заточування / ремонт вашого клинка</option>
                    <option value="law_seminar">Консультація адвоката: межі допустимої оборони в Україні</option>
                    {activeStore.shootingRange && (
                      <option value="shooting_range">Оренда тиру з пневматикою та випробування думок</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">Ваша Дата:</label>
                    <input
                      required
                      type="date"
                      min="2026-06-04"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded p-2 text-zinc-200 outline-none focus:border-amber-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">Ваше ПІБ:</label>
                    <input
                      required
                      placeholder="Ковальчук А."
                      type="text"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded p-2 text-zinc-200 outline-none focus:border-amber-500 text-left"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 block uppercase mb-1">Номер телефону для зв'язку:</label>
                    <input
                      required
                      placeholder="+380 67..."
                      type="tel"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      className="w-full bg-[#18181b] border border-[#27272a] rounded p-2 text-zinc-200 outline-none focus:border-amber-500 text-left"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition rounded-lg cursor-pointer flex items-center justify-center gap-1.5 leading-none shadow-[0_3px_10px_rgba(245,158,11,0.15)] uppercase text-[11px]"
                >
                  <Send className="w-3.5 h-3.5" /> Забронювати візит
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
