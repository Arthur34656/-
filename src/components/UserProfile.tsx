import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { OrderDetails, Product } from "../types";
import { User, Shield, CreditCard, ShieldCheck, Mail, Phone, MapPin, Package, Download, Edit2, Check, Star, Settings, Award, History, Landmark, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserProfileProps {
  onApplyLoyaltyDiscount: (discountPercent: number) => void;
  onUpdateCheckoutForm: (data: Partial<OrderDetails>) => void;
  checkoutForm: OrderDetails;
  sessionOrders: Array<{
    orderId: string;
    date: string;
    items: Array<{ product: Product; quantity: number }>;
    total: number;
    status: string;
  }>;
}

interface ProfileData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  npOffice: string;
  callsign: string; // tactical nickname
}

export default function UserProfile({ onApplyLoyaltyDiscount, onUpdateCheckoutForm, checkoutForm, sessionOrders }: UserProfileProps) {
  // Sync profile state with localStorage
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("varta_profile");
    return saved
      ? JSON.parse(saved)
      : {
          fullName: checkoutForm.fullName || "Ковальчук Андрій Миколайович",
          phone: checkoutForm.phone || "+380 67 123 4567",
          email: checkoutForm.email || "a.kovalchuk@gmail.com",
          city: checkoutForm.city || "Київ",
          address: checkoutForm.address || "вул. Хрещатик 12, кв. 44",
          npOffice: checkoutForm.novaPoshtaOffice || "42",
          callsign: "Стугна"
        };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<ProfileData>({ ...profile });
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "orders" | "certificates">("dashboard");
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [selectedSpecCert, setSelectedSpecCert] = useState<any | null>(null);

  // Mock static historical orders to populate user statistics immediately
  const [pastOrders] = useState([
    {
      orderId: "VRT-581903",
      date: "14.04.2026",
      items: [
        {
          product: {
            id: "spray-teren-4",
            name: "Газовий балончик Терен-4",
            price: 280,
            image: "/src/assets/images/pepper_spray_item_1780558047491.png"
          },
          quantity: 2
        },
        {
          product: {
            id: "knife-trex-carbon",
            name: "Ніж скланий Тірекс Карбон (EDC)",
            price: 1850,
            image: "/src/assets/images/folding_knife_item_1780558031093.png"
          },
          quantity: 1
        }
      ],
      total: 2410,
      status: "Доставлено"
    },
    {
      orderId: "VRT-410972",
      date: "02.03.2026",
      items: [
        {
          product: {
            id: "gloves-raptor",
            name: "Рукавиці тактичні Raptor з карбоновим захистом",
            price: 750,
            image: "/src/assets/images/tactical_gloves_item_1780558078523.png"
          },
          quantity: 1
        }
      ],
      total: 750,
      status: "Доставлено"
    }
  ]);

  // Combine live checkout orders from the current session and static past orders
  const allOrders = useEffect(() => {
    // Sync React prop state to native billing forms
    onUpdateCheckoutForm({
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      city: profile.city,
      novaPoshtaOffice: profile.npOffice,
      address: profile.address
    });
  }, [profile]);

  // Calculate Cumulative spending
  const totalSpent = useMemo(() => {
    const historicalTotal = pastOrders.reduce((sum, o) => sum + o.total, 0);
    const sessionTotal = sessionOrders.reduce((sum, o) => sum + o.total, 0);
    return historicalTotal + sessionTotal;
  }, [sessionOrders, pastOrders]);

  // Dynamic VIP Loyalty Tier
  const loyaltyTier = useMemo(() => {
    if (totalSpent > 25000) {
      return {
        name: "Еліта VARTA (Varta Operative)",
        discount: 0.15,
        color: "from-amber-600 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30",
        nextTier: null,
        benefits: "Постійна автоматична знижка 15% на весь тактичний каталог, право пріоритетного замовлення рідкісних сталей без передоплати, безкоштовні інструктажі з міської безпеки в шоурумах."
      };
    } else if (totalSpent > 10000) {
      return {
        name: "Ветеран Безпеки (Veteran Defender)",
        discount: 0.10,
        color: "from-amber-500 to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        nextTier: { limit: 25000, name: "Еліта VARTA" },
        benefits: "Постійна знижка 10% на всі замовлення, допуск до закритих кастомних клинків, безкоштовний тюнінг та заточка ножів у майстерні."
      };
    } else if (totalSpent > 3000) {
      return {
        name: "Уповноважений Охоронець (Certified Sentinel)",
        discount: 0.05,
        color: "from-zinc-700 to-zinc-900 border border-[#27272a]",
        badgeColor: "bg-zinc-500/20 text-zinc-300 border border-zinc-500/35",
        nextTier: { limit: 10000, name: "Ветеран Безпеки" },
        benefits: "Постійна фіксована знижка 5% на спорядження, безкоштовна доставка Новою Поштою на замовлення від 1500 грн."
      };
    } else {
      return {
        name: "Цивільний Рекрут (Civic Recruit)",
        discount: 0,
        color: "from-zinc-900 to-black border border-zinc-800",
        badgeColor: "bg-zinc-800 text-zinc-400 border border-zinc-700/60",
        nextTier: { limit: 3000, name: "Уповноважений Охоронець" },
        benefits: "Стартовий кабінет клієнта. Відчиняє доступ до системи електронних балістичних паспортів з кодом МВС."
      };
    }
  }, [totalSpent]);

  // Apply discount percent updates to global app
  useEffect(() => {
    onApplyLoyaltyDiscount(loyaltyTier.discount);
  }, [loyaltyTier, onApplyLoyaltyDiscount]);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfile(tempProfile);
    localStorage.setItem("varta_profile", JSON.stringify(tempProfile));
    setIsEditing(false);
  };

  const startDownloadCertAnim = (id: string, name: string, fileCode: string, date: string) => {
    setDownloadingCertId(id);
    setTimeout(() => {
      setDownloadingCertId(null);
      setSelectedSpecCert({ id, name, fileCode, date });
    }, 1200);
  };

  // Compile list of certs by checking ordered products
  const certList = useMemo(() => {
    const list: Array<{ id: string; name: string; fileCode: string; date: string }> = [
      {
        id: "cert-teren-4",
        name: "Газовий балончик Терен-4",
        fileCode: "МВС-№12/48-Т",
        date: "04.03.2025"
      },
      {
        id: "cert-trex",
        name: "Ніж скланий Тірекс Карбон (EDC)",
        fileCode: "ЕКСП-№449-ХО",
        date: "12.08.2025"
      }
    ];

    // Read session orders and add new ones if unique
    sessionOrders.forEach(o => {
      o.items.forEach(it => {
        const isExist = list.some(c => c.id === `cert-${it.product.id}`);
        if (!isExist) {
          list.push({
            id: `cert-${it.product.id}`,
            name: it.product.name,
            fileCode: `ДНДЕКЦ-№${Math.floor(1000 + Math.random() * 9000)}-ХО`,
            date: new Date().toLocaleDateString("uk-UA")
          });
        }
      });
    });

    return list;
  }, [sessionOrders]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      
      {/* Profile Header Widget */}
      <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-[#ea580c] p-1 flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <div className="w-full h-full bg-[#121214] rounded-full flex items-center justify-center text-zinc-100">
                <User className="w-8 h-8 text-amber-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 font-mono font-bold text-[8px] tracking-tighter px-1.5 py-0.5 rounded uppercase border border-black animate-pulse">
                {profile.callsign}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-zinc-100">{profile.fullName}</h3>
                <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${loyaltyTier.badgeColor}`}>
                  {loyaltyTier.discount > 0 ? `Знижка -${loyaltyTier.discount * 100}%` : "Starter"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono flex items-center gap-2 mt-1">
                <span>Ранг: <b className="text-amber-400 font-semibold">{loyaltyTier.name}</b></span>
                <span>•</span>
                <span>Витрачено всього: <u className="text-emerald-400 font-mono">{totalSpent.toLocaleString()} ₴</u></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setTempProfile({ ...profile });
                setIsEditing(true);
              }}
              className="py-2.5 px-4 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-amber-500/40 text-xs text-zinc-300 font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-zinc-400" /> Редагувати дані
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 3 Cols layout - left dashboard, right main window */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Side Navigation and Stats Panel */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Navigation Items list */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-3 shadow-xl">
            <div className="space-y-1">
              <button
                onClick={() => setActiveSubTab("dashboard")}
                className={`w-full p-3 rounded-lg text-xs font-mono font-bold uppercase tracking-tight flex items-center justify-between transition text-left cursor-pointer ${
                  activeSubTab === "dashboard"
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4.5 h-4.5" />
                  <span>Картка лояльності</span>
                </div>
                <span>→</span>
              </button>

              <button
                onClick={() => setActiveSubTab("orders")}
                className={`w-full p-3 rounded-lg text-xs font-mono font-bold uppercase tracking-tight flex items-center justify-between transition text-left cursor-pointer ${
                  activeSubTab === "orders"
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4.5 h-4.5" />
                  <span>Історія замовлень</span>
                </div>
                <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 text-[9px] rounded-full font-sans font-normal">
                  {pastOrders.length + sessionOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab("certificates")}
                className={`w-full p-3 rounded-lg text-xs font-mono font-bold uppercase tracking-tight flex items-center justify-between transition text-left cursor-pointer ${
                  activeSubTab === "certificates"
                    ? "bg-amber-500 text-zinc-950"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4.5 h-4.5" />
                  <span>Мій Сейф Сертифікатів</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[9px] rounded-full">
                  {certList.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick legal notification */}
          <div className="bg-[#18181b]/60 border border-[#27272a] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-500">
              <Shield className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-mono font-bold uppercase text-zinc-200">Цивільна безпека гарантована</h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
              Будь-які придбані товари у мережі <b>«ВАРТА»</b> постачаються із копією висновку офіційного експерта-баліста МВС України, яка засвідчує господарсько-побутовий (легальний) статус виробів. Сертифікати доступні для друку у вашому сейфі праворуч.
            </p>
          </div>
        </div>

        {/* Right Side Working Tab Window: 8 Cols */}
        <div className="lg:col-span-8 bg-[#121214] border border-[#27272a] rounded-xl p-6 shadow-2xl min-h-[420px] flex flex-col justify-between">
          
          {/* Dashboard (Loyalty & stats Card) */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
                <div>
                  <h4 className="text-lg font-bold text-zinc-100 flex items-center gap-2 font-mono">
                    <Award className="w-5 h-5 text-amber-500" /> ВАШ КПД ЛОЯЛЬНОСТІ
                  </h4>
                  <p className="text-xs text-zinc-500">Накопичувальна сітка лояльності клієнта мережі ВАРТА</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase block">Рівень Знижки:</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">-{loyaltyTier.discount * 100}%</span>
                </div>
              </div>

              {/* Graphical representation of the Card */}
              <div className={`p-6 rounded-2xl bg-gradient-to-r ${loyaltyTier.color} text-zinc-100 space-y-8 relative overflow-hidden shadow-2xl`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Shield className="w-64 h-64 rotate-12" />
                </div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-zinc-300 uppercase block">ТАКТИЧНИЙ ПРОЇЗДНИЙ КЛУБУ</span>
                    <h5 className="text-xl font-mono font-extrabold text-zinc-100 tracking-tight mt-1">{loyaltyTier.name}</h5>
                  </div>
                  <div className="font-mono text-zinc-100 border border-zinc-500/30 p-1.5 rounded-lg bg-black/40 text-xs">
                    ID: <b>{profile.fullName.substring(0, 3).toUpperCase()}-{totalSpent.toString().substring(0, 3)}</b>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-300 block">ПОЗИВНИЙ КЛІЄНТА:</span>
                    <strong className="text-sm font-mono tracking-wide text-zinc-100">«{profile.callsign.toUpperCase()}»</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-300 block">ДАНІ СХРОНУ / СУМА:</span>
                    <strong className="text-sm font-mono text-emerald-400">{totalSpent.toLocaleString()} ₴</strong>
                  </div>
                </div>
              </div>

              {/* Benefits of current tier */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 font-sans space-y-2">
                <span className="text-xs font-mono font-semibold text-amber-500 uppercase flex items-center gap-1">
                  💡 Припуски та Переваги вашого рангу:
                </span>
                <p className="text-xs text-zinc-450 text-zinc-300 leading-relaxed">
                  {loyaltyTier.benefits}
                </p>
              </div>

              {/* Next level tracker progress */}
              {loyaltyTier.nextTier ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500">До наступного рангу ({loyaltyTier.nextTier.name}):</span>
                    <strong className="text-zinc-300">{(loyaltyTier.nextTier.limit - totalSpent).toLocaleString()} ₴</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#18181b] content-none overflow-hidden relative border border-[#27272a]">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-[#ea580c] transition-all duration-1000"
                      style={{ width: `${Math.min(100, (totalSpent / loyaltyTier.nextTier.limit) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-650 text-zinc-500">
                    <span>{totalSpent.toLocaleString()} ₴</span>
                    <span>{loyaltyTier.nextTier.limit.toLocaleString()} ₴</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono text-center">
                  🎖️ Ви досягли максимально можливого оперативницького рангу лояльності у мережі ВАРТА!
                </div>
              )}
            </div>
          )}

          {/* Orders history section */}
          {activeSubTab === "orders" && (
            <div className="space-y-6">
              <div className="border-b border-[#27272a] pb-4">
                <h4 className="text-lg font-bold text-zinc-105 text-zinc-100 font-mono flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-500" /> ІСТОРІЯ ВАШИХ ЗАМОВЛЕНЬ
                </h4>
                <p className="text-xs text-zinc-500">Архів транзакцій та статусів доставки екіпірування</p>
              </div>

              {/* Orders Listing loops */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {/* Session Orders */}
                {sessionOrders.map((ord) => (
                  <div key={ord.orderId} className="bg-[#18181b] border border-amber-500/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#27272a] pb-1.5 text-xs font-mono">
                      <div>
                        <span className="text-amber-500 font-bold block">№{ord.orderId} (Сьогодні)</span>
                        <span className="text-[10px] text-zinc-500">{ord.date}</span>
                      </div>
                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase text-[10px] tracking-tight">
                        {ord.status}
                      </span>
                    </div>
                    {/* Items */}
                    <div className="space-y-2 text-xs font-mono text-zinc-400">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.product.name} ({it.quantity} шт)</span>
                          <span className="text-zinc-200">{(it.product.price * it.quantity).toLocaleString()} ₴</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono border-t border-[#27272a]/40 pt-2 text-zinc-200 font-bold">
                      <span>Разом замовлення:</span>
                      <span className="text-amber-400">{ord.total.toLocaleString()} ₴</span>
                    </div>
                  </div>
                ))}

                {/* Past Orders */}
                {pastOrders.map((ord) => (
                  <div key={ord.orderId} className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#27272a]/30 pb-1.5 text-xs font-mono">
                      <div>
                        <span className="text-zinc-300 font-bold block">№{ord.orderId}</span>
                        <span className="text-[10px] text-zinc-500">{ord.date}</span>
                      </div>
                      <span className="bg-zinc-850 bg-zinc-800 border border-zinc-700/60 text-zinc-400 px-2 py-0.5 rounded uppercase text-[10px] tracking-tight">
                        {ord.status}
                      </span>
                    </div>
                    {/* Items */}
                    <div className="space-y-1 text-xs font-mono text-zinc-450 text-zinc-400">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.product.name} ({it.quantity} шт)</span>
                          <span className="text-zinc-300">{(it.product.price * it.quantity).toLocaleString()} ₴</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono border-t border-[#27272a]/30 pt-2 text-zinc-350 text-zinc-300 font-semibold">
                      <span>Разом замовлення:</span>
                      <span className="text-amber-500/90">{ord.total.toLocaleString()} ₴</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Drawer window */}
          {activeSubTab === "certificates" && (
            <div className="space-y-6">
              <div className="border-b border-[#27272a] pb-4">
                <h4 className="text-lg font-bold text-zinc-100 font-mono flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> ЕЛЕКТРОННІ БАЛІСТИЧНІ СЕРТИФІКАТИ МВС
                </h4>
                <p className="text-xs text-zinc-500">Дозвільна база на кожну придбану одиницю зброї у кабінеті</p>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {certList.map((c) => (
                  <div key={c.id} className="bg-[#18181b] border border-[#27272a] p-3.5 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-mono block text-zinc-200">{c.name}</strong>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                          <span>Код: {c.fileCode}</span>
                          <span>•</span>
                          <span>Дата дослідження: {c.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startDownloadCertAnim(c.id, c.name, c.fileCode, c.date)}
                      className="p-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-[#27272a] rounded text-[11px] hover:border-emerald-500/30 font-mono flex items-center gap-1.5 transition text-emerald-400 cursor-pointer text-right shrink-0"
                    >
                      {downloadingCertId === c.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>Переглянути експертизу</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border border-[#27272a] p-6 rounded-xl max-w-lg w-full z-10 space-y-4 relative text-left"
            >
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <h4 className="text-base font-bold font-mono text-zinc-100 uppercase flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" /> Налаштування даних профілю
                </h4>
                <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="text-zinc-400 block mb-1">ПІБ Користувача</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.fullName}
                      onChange={(e) => setTempProfile({ ...tempProfile, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Номер телефону</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.phone}
                      onChange={(e) => setTempProfile({ ...tempProfile, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Тактичний Позивний</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.callsign}
                      onChange={(e) => setTempProfile({ ...tempProfile, callsign: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-zinc-400 block mb-1">Електронна пошта (Email)</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Місто доставлення</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.city}
                      onChange={(e) => setTempProfile({ ...tempProfile, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">Номер відділення НП</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.npOffice}
                      onChange={(e) => setTempProfile({ ...tempProfile, npOffice: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-zinc-400 block mb-1">Повна домашня поштова адреса</label>
                    <input
                      type="text"
                      className="w-full bg-[#18181b] border border-[#27272a] p-2.5 rounded text-zinc-200 outline-none focus:border-amber-500"
                      value={tempProfile.address}
                      onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#27272a]">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition rounded text-xs cursor-pointer text-center"
                  >
                    Зберегти зміни
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 font-semibold hover:text-white border border-[#27272a] transition rounded text-xs cursor-pointer text-center"
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pop-up Certificate viewer mock */}
      <AnimatePresence>
        {selectedSpecCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpecCert(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border-2 border-emerald-500 p-8 rounded-xl max-w-2xl w-full z-10 space-y-6 relative text-left"
            >
              <button 
                onClick={() => setSelectedSpecCert(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Certificate layout design */}
              <div className="border border-emerald-500/20 p-4 rounded bg-[#09090b] space-y-5 text-gray-300 font-mono text-[9px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rotate-45 transform translate-x-4 -translate-y-4 border border-emerald-500/20" />
                
                <div className="text-center font-bold text-zinc-100 text-[10px] space-y-1">
                  <div>ДЕРЖАВНИЙ НАУКОВО-ДОСЛІДНИЙ ЕКСПЕРТНО-КРИМІНАЛІСТИЧНИЙ ЦЕНТР</div>
                  <div className="text-emerald-400">МІНІСТЕРСТВО ВНУТРІШНІХ СПРАВ УКРАЇНИ</div>
                  <div className="text-zinc-500 font-normal">ЕКСПЕРТИЗА КЛИНКОВОЇ ЗБРОЇ ТА ЗАСОБІВ САМООБОРОНИ</div>
                </div>

                <div className="border-t border-b border-emerald-500/20 py-2 text-center text-zinc-100 font-black text-xs uppercase tracking-widest bg-emerald-500/5">
                  ВИСНОВОК СУДОВОГО ЕКСПЕРТА-БАЛІСТА
                </div>

                <div className="space-y-2 leading-relaxed text-zinc-400">
                  <p>
                    <b>ОБ'ЄКТ ДОСЛІДЖЕННЯ:</b> Господарсько-побутовий виріб цивільного призначення <b>«{selectedSpecCert.name}»</b>.
                  </p>
                  <p>
                    <b>ХАРАКТЕРИСТИКИ ТА ТТХ:</b> Конструкція кувальних матеріалів, наявність та габарити упорів руків'я, геометрія кута сходження ріжучої частини клинка, довжина ріжучої кромки.
                  </p>
                  <p>
                    <b>НОРМАТИВНА БАЗА:</b> Згідно з положеннями Методики офіційних криміналістичних досліджень холодної зброї та конструктивно схожих виробів (зареєстрованої Мін'юстом України під №745), досліджуваний об'єкт <b>НЕ Є ХОЛОДНОЮ ЗБРОЄЮ</b>.
                  </p>
                  <p>
                    <b>ОБҐРУНТУВАННЯ:</b> Відсутність сукупності ознак уражаючої дії та безпеки утримування руки при сильному колючому ударі (послаблені елементи, габарити упорів гарди менше 5 мм, двосічність виходить за цивільні норми, або довжина коротша за 90 мм).
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-emerald-500/20 pt-4 text-[8px] text-zinc-500">
                  <div>
                    <span>Сертифікат реєстрації: <b>{selectedSpecCert.fileCode}</b></span>
                    <span className="block">Дата випуску експертного листа: <b>{selectedSpecCert.date}</b></span>
                  </div>
                  <div className="text-right">
                    <span className="block text-emerald-400 font-bold uppercase">ПАСПОРТ ЗАВЕРЕНО</span>
                    <span className="block text-[8px]">ДНДЕКЦ МВС України</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between gap-4 font-mono text-xs">
                <span className="text-[10px] text-zinc-500 leading-tight">
                  * Цей документ зберігається у вашому зашифрованому Сейфі VARTA та додається у роздрукованому вигляді до кузовного комплекту посилки.
                </span>
                <button
                  onClick={() => setSelectedSpecCert(null)}
                  className="py-2 px-5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded cursor-pointer shrink-0 transition"
                >
                  Зрозуміло, закрити
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
