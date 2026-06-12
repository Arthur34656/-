import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { Product, CartItem, Review, OrderDetails } from "./types";
import { PRODUCTS, REVIEWS, LEGAL_FAQ, PROMO_CODES } from "./data";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import DefenseQuiz from "./components/DefenseQuiz";
import AiConsultant from "./components/AiConsultant";
import CustomKnifeBuilder from "./components/CustomKnifeBuilder";
import UserProfile from "./components/UserProfile";
import StoreLocator from "./components/StoreLocator";
import {
  Shield,
  ShieldCheck,
  Scale,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  Check,
  MapPin,
  Truck,
  CreditCard,
  X,
  Award,
  BookOpen,
  Star,
  ChevronDown,
  Info,
  Clock,
  Phone,
  ThumbsUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowRight,
  Hammer,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation & Tab States
  const [activeTab, setActiveTab] = useState<"catalog" | "advisor" | "quiz" | "laws" | "reviews" | "custom" | "profile" | "locations">("catalog");
  
  // Real-time User Account & Loyalty States
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [sessionOrders, setSessionOrders] = useState<any[]>(() => {
    const saved = localStorage.getItem("varta_session_orders");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync session orders changes
  useEffect(() => {
    localStorage.setItem("varta_session_orders", JSON.stringify(sessionOrders));
  }, [sessionOrders]);

  // Cart & Catalog States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("varta_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<"all" | "knives" | "gas_sprays" | "self_defense" | "accessories">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price_low" | "price_high" | "rating">("default");
  
  // Modals & Sliders
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState("");
  
  // Custom reviews list (mutable in state for reviews simulation)
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [newReview, setNewReview] = useState({ author: "", rating: 5, comment: "", productName: PRODUCTS[0].name });
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  // Checkout States
  const [checkoutForm, setCheckoutForm] = useState<OrderDetails>({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    deliveryMethod: "nova_poshta",
    novaPoshtaOffice: "",
    address: "",
    paymentMethod: "cod",
    promoCode: ""
  });
  const [appliedPromo, setAppliedPromo] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" }[]>([]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem("varta_cart", JSON.stringify(cart));
  }, [cart]);

  // Toast trigger helper
  const addToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    addToast(`«${product.name}» додано в кошик!`, "success");
  };

  // Adjust Cart Quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Remove item from Cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast("Товар вилучено з кошика", "info");
  };

  // Apply promo codes
  const handleApplyPromo = () => {
    const code = checkoutForm.promoCode?.trim().toUpperCase() || "";
    if (PROMO_CODES[code] !== undefined) {
      setDiscountPercent(PROMO_CODES[code]);
      setAppliedPromo(code);
      addToast(`Промокод «${code}» активовано! Знижка ${PROMO_CODES[code] * 100}%`, "success");
    } else {
      addToast("Недійсний промокод", "info");
    }
  };

  // Triggering advisor with prefilled product context from details modal
  const handleConsultAIAboutProduct = (productName: string) => {
    setPrefilledMessage(`Розкажіть, будь ласка, детальніше про «${productName}» з вашого магазину. Які технічні особливості та чи повністю законно носити цей товар із собою в місті?`);
    setActiveTab("advisor");
  };

  // Sorting and Filtering products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // Default sorting
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Calculate totals
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    // Combine loyalty ranking discount and any applied promo codes up to max 35%!
    const totalDiscountRate = Math.min(0.35, discountPercent + loyaltyDiscount);
    return cartSubtotal * totalDiscountRate;
  }, [cartSubtotal, discountPercent, loyaltyDiscount]);

  const cartTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount);
  }, [cartSubtotal, discountAmount]);

  // Order checkout submission sim
  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!checkoutForm.fullName || !checkoutForm.phone || !checkoutForm.email || !checkoutForm.city) {
      addToast("Заповніть обов'язкові контактні дані", "info");
      return;
    }

    setIsPlacingOrder(true);

    // Simulate server side placement
    setTimeout(() => {
      const orderId = `VRT-${Math.floor(100000 + Math.random() * 900000)}`;
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 2); // 2 days shipping

      setActiveInvoice({
        orderId,
        date: new Date().toLocaleDateString("uk-UA"),
        clientName: checkoutForm.fullName,
        phone: checkoutForm.phone,
        email: checkoutForm.email,
        delivery: checkoutForm.deliveryMethod === "nova_poshta" ? `Нова Пошта (відділення №${checkoutForm.novaPoshtaOffice || "1"}, м. ${checkoutForm.city})` : checkoutForm.deliveryMethod === "ukr_poshta" ? `Укрпошта (Адреса: ${checkoutForm.address || "До запитання"}, м. ${checkoutForm.city})` : `Самовивіз із тактичного шоуруму «ВАРТА» (Київ, вул. Велика Васильківська 42)`,
        items: [...cart],
        subtotal: cartSubtotal,
        discount: discountAmount,
        total: cartTotal,
        payment: checkoutForm.paymentMethod === "cod" ? "Післяплата при отриманні в поштовому відділенні" : "Мульти-еквайринг онлайн (симуляція проведена)",
        estimatedDelivery: estDelivery.toLocaleDateString("uk-UA")
      });

      const newOrderObj = {
        orderId,
        date: new Date().toLocaleDateString("uk-UA"),
        items: [...cart],
        total: cartTotal,
        status: "В обробці"
      };
      setSessionOrders(prev => [newOrderObj, ...prev]);

      setCart([]); // Clear cart
      setIsPlacingOrder(false);
      setIsCartOpen(false);
      addToast("Замовлення успішно сформовано!", "success");
    }, 1500);
  };

  // Review Form Submit Sim
  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.comment.trim()) {
      addToast("Будь ласка, заповніть усі обов'язкові поля відгуку", "info");
      return;
    }

    const reviewObj: Review = {
      id: `rev-custom-${Date.now()}`,
      author: newReview.author.trim(),
      rating: newReview.rating,
      date: new Date().toLocaleDateString("uk-UA"),
      comment: newReview.comment.trim(),
      verified: true,
      productName: newReview.productName
    };

    setReviews([reviewObj, ...reviews]);
    setNewReview({ author: "", rating: 5, comment: "", productName: PRODUCTS[0].name });
    setIsReviewFormOpen(false);
    addToast("Ваш відгук успішно опубліковано і відправлено на модерацію!", "success");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500 selection:text-black antialiased relative">
      
      {/* Visual background grids / neon grids */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ea580c]/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header element */}
      <header className="sticky top-0 z-40 bg-[#09090b]/85 backdrop-blur-md border-b border-[#27272a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("catalog")}>
            <div className="bg-[#121214] border-2 border-amber-500 p-2 rounded-lg flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Shield className="w-5.5 h-10/12 fill-current" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black uppercase text-zinc-100 tracking-wider block font-mono">
                ВАРТА
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#ea580c] block">
                САМООБОРОНА ТА ЕКІПІРУВАННЯ
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-mono tracking-tight text-zinc-400">
            <button
              onClick={() => { setActiveTab("catalog"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white ${
                activeTab === "catalog" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              Каталог товарів
            </button>
            <button
              onClick={() => { setActiveTab("custom"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white flex items-center gap-1 ${
                activeTab === "custom" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              <Hammer className="w-4.5 h-4.5 text-amber-500" /> Ніж на замовлення
            </button>
            <button
              onClick={() => { setActiveTab("advisor"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white flex items-center gap-1 ${
                activeTab === "advisor" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> ШІ-Радник
            </button>
            <button
              onClick={() => { setActiveTab("quiz"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white ${
                activeTab === "quiz" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              Тест-Підбір
            </button>
            <button
              onClick={() => { setActiveTab("laws"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white ${
                activeTab === "laws" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              Законодавство
            </button>
            <button
              onClick={() => { setActiveTab("reviews"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white ${
                activeTab === "reviews" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              Відгуки
            </button>
            <button
              onClick={() => { setActiveTab("locations"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white flex items-center gap-1 ${
                activeTab === "locations" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Магазини
            </button>
            <button
              id="trigger-profile-tab"
              onClick={() => { setActiveTab("profile"); setActiveInvoice(null); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white flex items-center gap-1 ${
                activeTab === "profile" ? "text-amber-500 bg-[#121214] border border-[#27272a]" : ""
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" /> Кабінет
            </button>
          </nav>

          {/* Secondary triggers: Dial or Cart */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+380800500600"
              className="hidden lg:flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-500 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>0 800 500 600</span>
            </a>

            <button
              id="trigger-cart-sidebar"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="bg-[#121214] border border-[#27272a] hover:border-amber-500/50 p-2.5 rounded-lg flex items-center gap-2 text-sm text-zinc-300 transition-all cursor-pointer relative active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline font-mono font-medium">Кошик</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ea580c] text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Header Menu for tiny screens */}
      <div className="xl:hidden bg-[#121214]/85 backdrop-blur border-b border-[#27272a]/40 flex items-center gap-1 overflow-x-auto text-[10px] font-mono text-center text-zinc-400 select-none scrollbar-none py-1.5 px-2">
        <button
          onClick={() => { setActiveTab("catalog"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "catalog" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <Shield className="w-4.5 h-4.5" />
          <span>Каталог</span>
        </button>
        <button
          onClick={() => { setActiveTab("custom"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "custom" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <Hammer className="w-4.5 h-4.5" />
          <span>Свій Ніж</span>
        </button>
        <button
          onClick={() => { setActiveTab("advisor"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "advisor" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <Sparkles className="w-4.5 h-4.5" />
          <span>ШІ-Радник</span>
        </button>
        <button
          onClick={() => { setActiveTab("quiz"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "quiz" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <Award className="w-4.5 h-4.5" />
          <span>Підбір</span>
        </button>
        <button
          onClick={() => { setActiveTab("laws"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "laws" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <Scale className="w-4.5 h-4.5" />
          <span>Закони</span>
        </button>
        <button
          onClick={() => { setActiveTab("reviews"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "reviews" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Відгуки</span>
        </button>
        <button
          onClick={() => { setActiveTab("locations"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "locations" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <MapPin className="w-4.5 h-4.5" />
          <span>Магазини</span>
        </button>
        <button
          onClick={() => { setActiveTab("profile"); setActiveInvoice(null); }}
          className={`py-2 px-3.5 flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0 rounded ${activeTab === "profile" ? "text-amber-400 bg-black/40" : ""}`}
        >
          <User className="w-4.5 h-4.5 text-emerald-400" />
          <span>Кабінет</span>
        </button>
      </div>

      {/* Primary Application Workspace Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Animated Invoice Placeholder (if checkout succeeded, show this prominently) */}
        {activeInvoice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 text-left bg-zinc-900 border-2 border-emerald-500 rounded-xl max-w-2xl mx-auto overflow-hidden shadow-2xl relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
            
            {/* Invoice Header */}
            <div className="p-6 bg-emerald-950/20 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Замовлення сплачено / прийнято!</h3>
                  <span className="text-xs font-mono text-emerald-400">Накладна №{activeInvoice.orderId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="text-zinc-500 hover:text-white transition cursor-pointer font-mono text-xs border border-zinc-800 p-1.5 px-3 rounded bg-zinc-950/60"
              >
                Закрити
              </button>
            </div>

            {/* Invoice parameters */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block">ПІБ КЛІЄНТА:</span>
                  <span className="text-zinc-200 uppercase">{activeInvoice.clientName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">НОМЕР ТЕЛЕФОНУ:</span>
                  <span className="text-zinc-200">{activeInvoice.phone}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">МЕТОД ДОСТАВКИ:</span>
                  <span className="text-zinc-200">{activeInvoice.delivery}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">СПОСІБ ОПЛАТИ:</span>
                  <span className="text-zinc-200">{activeInvoice.payment}</span>
                </div>
              </div>

              <hr className="border-[#27272a]" />

              {/* Items listing table */}
              <div>
                <h4 className="text-xs font-mono text-zinc-500 mb-2 uppercase">Список придбаних засобів:</h4>
                <div className="space-y-2">
                  {activeInvoice.items.map((cartItem: CartItem) => (
                    <div 
                      key={cartItem.product.id}
                      className="flex items-center justify-between text-xs bg-black/40 border border-[#27272a]/50 p-2.5 rounded"
                    >
                      <div className="text-left font-medium text-zinc-300">
                        {cartItem.product.name} <span className="text-amber-500 font-mono">x{cartItem.quantity}</span>
                      </div>
                      <div className="font-mono text-zinc-100 text-right">
                        {(cartItem.product.price * cartItem.quantity).toLocaleString()} ₴
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-[#27272a]" />

              {/* Totals table and shipping estimate */}
              <div className="space-y-1.5 font-mono text-sm">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Сума:</span>
                  <span>{activeInvoice.subtotal.toLocaleString()} ₴</span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Знижка по промокоду:</span>
                    <span>-{activeInvoice.discount.toLocaleString()} ₴</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-zinc-100 border-t border-[#27272a]/50 pt-2">
                  <span>Загалом до сплати:</span>
                  <span className="text-amber-500">{activeInvoice.total.toLocaleString()} ₴</span>
                </div>
              </div>

              <div className="mt-6 bg-[#121214] border border-[#27272a]/60 rounded p-4 text-xs flex gap-3 text-left">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-zinc-300 font-mono">Термін відвантаження</h4>
                  <p className="text-zinc-500 mt-1 leading-relaxed">
                    Наш склад вже комплектує ваше тактичне замовлення. Сертифікати про неналежність до ХО будуть доручені у фабричній коробці. Розрахункова дата прибуття у ваше відділення: <strong className="text-zinc-300">{activeInvoice.estimatedDelivery}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 1: Catalog storefront page */}
        {activeTab === "catalog" && (
          <div className="space-y-8">
            
            {/* Hero promo Banner */}
            <section className="bg-gradient-to-r from-[#18181b] to-[#121214] border border-[#27272a] rounded-xl p-6 md:p-10 relative overflow-hidden text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-full bg-[#ea580c]/5 rounded-l-full filter blur-[100px] pointer-events-none" />
              <div className="space-y-4 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                  <Flame className="w-4 h-4 text-[#ea580c] animate-bounce" /> Безпека цивільних громадян України
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                  Захист себе та близьких — <span className="text-amber-500">цілком легально</span>
                </h1>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                  Професійна зброя самооборони, туристичні та складані ножі, що пройшли повну балістичну експертизу МВС України. Ніякого сірого імпорту — тільки сертифіковані балончики Терен, Кобра, Перець та інвентар EDC.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className="bg-amber-500 text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer text-sm flex items-center gap-2 active:scale-95"
                  >
                    Підібрати засіб захисту <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab("advisor")}
                    className="bg-[#121214] text-zinc-300 border border-[#27272a] font-mono px-5 py-2.5 rounded-lg hover:text-white hover:border-zinc-500 transition-colors cursor-pointer text-xs"
                  >
                    ШІ-консультант
                  </button>
                </div>
              </div>

              {/* Decorative tactical specs sidebar on banner */}
              <div className="bg-[#09090b]/80 border border-[#27272a]/60 rounded-lg p-5 font-mono text-[11px] text-zinc-400 shrink-0 w-full md:w-72 shadow-lg relative min-h-[160px] flex flex-col justify-between">
                <div>
                  <h4 className="text-amber-500 font-bold mb-3 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> СЕРТИФІКАЦІЯ «ВАРТА»
                  </h4>
                  <ul className="space-y-1.5 text-zinc-500 text-left">
                    <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Копія сертифіката МВС у посилці</li>
                    <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Тільки цивільні формули</li>
                    <li className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Професійний підбір ШІ</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-[#27272a]/40 text-left text-[10px] text-zinc-600">
                  Акція: Промокод <strong className="text-amber-500">VARTA10</strong> на знижку -10%!
                </div>
              </div>
            </section>

            {/* Filter and Search controls */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-[#121214] border border-[#27272a] rounded-lg p-4">
              
              {/* Category buttons tab */}
              <div className="flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none pb-1.5 md:pb-0">
                {(["all", "knives", "gas_sprays", "self_defense", "accessories"] as const).map((cat) => {
                  const label = cat === "all" ? "Всі товари" : cat === "knives" ? "Ножі" : cat === "gas_sprays" ? "Балончики" : cat === "self_defense" ? "Зброя/Захист" : "Аксесуари";
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded text-xs font-mono tracking-tight uppercase transition-all cursor-pointer border ${
                        selectedCategory === cat
                          ? "bg-amber-500/10 border-amber-500/45 text-amber-400"
                          : "bg-transparent border-transparent text-zinc-400 hover:text-white"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Search & Sort combo */}
              <div className="flex flex-col sm:flex-row gap-3 min-w-0 md:w-auto">
                {/* Search input */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Шукати модель чи бренд..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c1c1f] border border-[#27272a]/80 rounded py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-amber-500/50 text-left"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Sort selector */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-[#1c1c1f] border border-[#27272a]/80 rounded py-2 pl-9 pr-6 text-xs text-zinc-400 outline-none focus:border-amber-500/50 appearance-none font-mono cursor-pointer"
                  >
                    <option value="default">Сортування: Базове</option>
                    <option value="price_low">Ціна: від найменшої</option>
                    <option value="price_high">Ціна: від найбільшої</option>
                    <option value="rating">Рейтинг: Високі бали</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((p) => (
                  <div key={p.id}>
                    <ProductCard
                      product={p}
                      onAddToCart={handleAddToCart}
                      onOpenDetails={(prod) => setSelectedProduct(prod)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* No items found placeholder */
              <div className="bg-[#121214] border border-[#27272a] rounded-lg p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200">Нічого не знайдено</h4>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                    За вашим пошуковим запитом «{searchQuery}» моделей не виявлено. Спробуйте змінити ключові слова або категорію.
                  </p>
                </div>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="bg-zinc-800 text-zinc-350 hover:bg-zinc-700 py-1.5 px-3.5 rounded text-xs font-mono cursor-pointer transition-colors"
                >
                  Скинути фільтри
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Intelligent legal advisor */}
        {activeTab === "advisor" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" /> Інтелектуальний ШІ-консультант
              </h2>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Порадьтеся з нашим віртуальним юристом-експертом з тактики та озброєння. Задавайте питання про вимоги законодавства, сертифікати МВС, або проконсультуйтеся щодо вибору балончика та ножів.
              </p>
            </div>
            
            <AiConsultant
              prefilledMessage={prefilledMessage}
              onClearPrefill={() => setPrefilledMessage("")}
            />
          </div>
        )}

        {/* Tab 3: Interactive Selection Quiz */}
        {activeTab === "quiz" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" /> Розумний підбір засобів захисту
              </h2>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Пройдіть короткий інтерактивний експрес-опитування під керівництвом нашого алгоритму, щоб визначити найбільш підходящий для вашої фізичної комплекції, середовища проживання та закону засіб стримування правопорушень.
              </p>
            </div>

            <DefenseQuiz
              onAddToCart={handleAddToCart}
              onOpenDetails={(p) => setSelectedProduct(p)}
            />
          </div>
        )}

        {/* Tab 4: Legislation Accordion block */}
        {activeTab === "laws" && (
          <div className="max-w-3xl mx-auto space-y-8 text-left">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Scale className="w-6 h-6 text-amber-500" /> Закони України про самооборону та ХО
              </h2>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                Довідкова інформація та вичерпні відповіді на питання законності носіння туристичних ножів, газових засобів та тактичних ліхтарів.
              </p>
            </div>

            <div className="space-y-4">
              {LEGAL_FAQ.map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-[#121214] border border-[#27272a] rounded-lg p-5 hover:border-zinc-700 transition"
                >
                  <h4 className="font-semibold text-zinc-100 text-base flex items-start gap-2.5">
                    <span className="text-amber-500 font-mono">Q.</span>
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed pl-6 border-l border-amber-500/30">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            {/* Legislation disclaimer card */}
            <div className="bg-amber-950/10 border border-amber-500/20 p-5 rounded-lg flex items-start gap-3">
              <Info className="w-5.5 h-5.5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-450 leading-relaxed text-zinc-400">
                <strong className="text-zinc-200">ВАЖЛИВЕ ПОПЕРЕДЖЕННЯ:</strong> Магазин «ВАРТА» суворо засуджує будь-які форми незаконного насильства. Зброя та інструменти самооборони розроблені та призначені виключно для запобігання злочинам, рятування вашого життя та здоров'я, або для побутового туристичного використання. Перевищення меж необхідної оборони тягне за собою кримінальну відповідальність відповідно до статей 118 та 124 КК України. Будьте відповідальними та раціональними!
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Real-time Customer reviews */}
        {activeTab === "reviews" && (
          <div className="max-w-4xl mx-auto space-y-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-100 flex items-center gap-2">
                  <Star className="w-6 h-6 text-amber-500 fill-current" /> Відгуки наших покупців
                </h2>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                  Почитайте верифіковані відгуки клієнтів про наше спорядження чи поділіться власним досвідом покупок.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                className="bg-amber-500 text-[#09090b] font-semibold py-2 px-4 rounded hover:bg-amber-400 transition cursor-pointer text-sm"
              >
                {isReviewFormOpen ? "Закрити форму" : "Написати відгук"}
              </button>
            </div>

            {/* Adding new review Form */}
            {isReviewFormOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-[#121214] border border-[#27272a] rounded-lg p-5 md:p-6"
              >
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-zinc-450 block mb-1.5 uppercase font-medium">Ваше ім'я / позивний</label>
                      <input
                        type="text"
                        required
                        value={newReview.author}
                        onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                        placeholder="Олександр Сагайдачний"
                        className="w-full bg-[#1c1c1f] border border-[#27272a]/85 rounded p-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-zinc-450 block mb-1.5 uppercase font-medium">Оцінка товару</label>
                      <select
                        value={newReview.rating}
                        onChange={(e: any) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                        className="w-full bg-[#1c1c1f] border border-[#27272a]/85 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="5">5 Зірок (Відмінно)</option>
                        <option value="4">4 Зірки (Добре)</option>
                        <option value="3">3 Зірки (Задовільно)</option>
                        <option value="2">2 Зірки (Погано)</option>
                        <option value="1">1 Зірка (Жахливо)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-450 block mb-1.5 uppercase font-medium">Про який товар відгук?</label>
                    <select
                      value={newReview.productName}
                      onChange={(e) => setNewReview({ ...newReview, productName: e.target.value })}
                      className="w-full bg-[#1c1c1f] border border-[#27272a]/85 rounded p-2.5 text-sm text-zinc-300 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-450 block mb-1.5 uppercase font-medium">Ваш коментар</label>
                    <textarea
                      required
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Поділіться досвідом використання, якістю сталі, дальністю балончика тощо..."
                      className="w-full bg-[#1c1c1f] border border-[#27272a]/85 rounded p-2.5 text-sm text-zinc-200 outline-none focus:border-amber-500 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-500 text-zinc-950 font-bold py-2.5 px-5 rounded hover:bg-emerald-400 transition cursor-pointer text-xs uppercase"
                  >
                    Надіслати на перевірку
                  </button>
                </form>
              </motion.div>
            )}

            {/* List block */}
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <div key={r.id} className="bg-[#121214] border border-[#27272a]/65 rounded-lg p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-100">{r.author}</h4>
                      <span className="text-[10px] font-mono text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1.5 py-0.5 rounded">
                        Куплено: {r.productName}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{r.date}</span>
                  </div>

                  {/* Stars indicator */}
                  <div className="flex text-amber-500 gap-0.5">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current shrink-0" />
                    ))}
                    {Array.from({ length: 5 - r.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 text-zinc-800 shrink-0" />
                    ))}
                  </div>

                  <p className="text-sm text-zinc-355 text-zinc-300 leading-relaxed font-sans font-normal italic">
                    «{r.comment}»
                  </p>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Покупка підтверджена</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Custom Knife Builder */}
        {activeTab === "custom" && (
          <div className="space-y-6">
            <div className="text-left max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                <Flame className="w-3.5 h-3.5" /> Ковальська Справа & Ручна Робота
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 flex items-center gap-2">
                <Hammer className="w-7 h-7 text-amber-500" /> Конфігуратор Ножів на Замовлення
              </h2>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed max-w-3xl">
                Створіть свій ніж мрії: Обирайте будь-який розмір, товщину обуху, сталь (від базової D2 до Damascus та преміум порошку M390) та художнє оформлення. Ми прорахуємо вартість у реальному часі та надамо легальні документи балістичного сертифіката МВС у комплекті!
              </p>
            </div>

            <CustomKnifeBuilder 
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {/* Tab 7: Store Locator */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            <div className="text-left max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                <MapPin className="w-3.5 h-3.5" /> Офлайн Мережа Магазинів ВАРТА
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 flex items-center gap-2">
                Карта Фізичних Представництв в Україні
              </h2>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed max-w-3xl">
                Завітайте до наших авторизованих шоурумів та тактичних майстерень. Ви можете наживо випробувати газові балончики на мішенях, безкоштовно наточити свій ніж у найкращих майстрів або забрати оформлене інтернет-замовлення самовивозом від каси клубу.
              </p>
            </div>

            <StoreLocator />
          </div>
        )}

        {/* Tab 8: User Profile (Кабінет) */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="text-left max-w-6xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Кабінет Оперативника ВАРТА
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 flex items-center gap-2">
                Персональний Профіль Клієнта
              </h2>
              <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed max-w-3xl">
                Керуйте особистими контактами доставлення, відстежуйте поточні посилки та завантажуйте державні сертифікати МВС на легальність придбаних виробів прямо з вашого захищеного Сейфу. Накопичуйте КПД Ваших покупок для росту пожиттєвої знижки!
              </p>
            </div>

            <UserProfile 
              onApplyLoyaltyDiscount={setLoyaltyDiscount}
              onUpdateCheckoutForm={(data) => setCheckoutForm(prev => ({ ...prev, ...data }))}
              checkoutForm={checkoutForm}
              sessionOrders={sessionOrders}
            />
          </div>
        )}
      </main>

      {/* Cart Slider Overlay drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            
            {/* Backdrop slide click target */}
            <motion.div
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
              <motion.div
                className="w-screen max-w-lg bg-[#121214] border-l border-[#27272a] h-full flex flex-col shadow-2xl relative"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
              >
                {/* Header Slider bar */}
                <div className="p-5 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-base">Кошик та Оформлення</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-full bg-[#121214] border border-[#27272a] text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  {cart.length > 0 ? (
                    <div className="space-y-6 text-left">
                      
                      {/* Products chosen */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-mono text-zinc-500 uppercase font-semibold">Ваші товари:</h4>
                        {cart.map((item) => (
                          <div 
                            key={item.product.id}
                            className="flex items-center gap-3 bg-[#18181b] border border-[#27272a]/55 rounded-lg p-3 relative overflow-hidden"
                          >
                            <div className="w-16 h-12 rounded bg-[#09090b] overflow-hidden shrink-0 border border-[#27272a]/40">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold text-zinc-250 text-zinc-200 line-clamp-1 truncate">{item.product.name}</h5>
                              <span className="text-xs text-amber-500 font-mono">{item.product.price} ₴ / од.</span>
                            </div>

                            {/* Actions counter */}
                            <div className="flex items-center gap-1 bg-[#121214] rounded-md border border-[#27272a] p-1 scale-90 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.product.id, -1)}
                                className="p-1 text-zinc-450 hover:text-white transition bg-zinc-900 rounded cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-bold px-2.5 text-zinc-100">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.product.id, 1)}
                                className="p-1 text-zinc-450 hover:text-white transition bg-zinc-900 rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Detach button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="text-zinc-650 hover:text-rose-500 p-1 transition ml-1 cursor-pointer"
                              title="Вилучити"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <hr className="border-[#27272a]" />

                      {/* Checkout shipping details form */}
                      <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <h4 className="text-xs font-mono text-zinc-500 uppercase font-semibold">Дані доставки по Україні:</h4>
                        
                        <div className="space-y-3 text-xs">
                          {/* Full Name */}
                          <div>
                            <label className="text-[10px] font-mono text-zinc-450 uppercase block mb-1">Повне ім'я отримувача *</label>
                            <input
                              type="text"
                              required
                              placeholder="Коваленко Богдан Юрійович"
                              value={checkoutForm.fullName}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                              className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Phone & Email combo */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-mono text-zinc-450 block mb-1">НОМЕР ТЕЛЕФОНУ *</label>
                              <input
                                type="tel"
                                required
                                placeholder="+38"
                                value={checkoutForm.phone}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                                className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-mono text-zinc-450 block mb-1">Електронна пошта *</label>
                              <input
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={checkoutForm.email}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                                className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* City */}
                          <div>
                            <label className="text-[10px] font-mono text-zinc-450 block mb-1">Населений пункт / Місто *</label>
                            <input
                              type="text"
                              required
                              placeholder="Приклад: Київ, Львів, Одеса"
                              value={checkoutForm.city}
                              onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                              className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Ship choice */}
                          <div>
                            <label className="text-[10px] font-mono text-zinc-450 block mb-1.5 uppercase font-semibold">Поштовий оператор</label>
                            <div className="grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => setCheckoutForm({ ...checkoutForm, deliveryMethod: "nova_poshta" })}
                                className={`p-2.5 border rounded flex flex-col items-center gap-1 cursor-pointer font-semibold ${
                                  checkoutForm.deliveryMethod === "nova_poshta" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-[#27272a] text-zinc-450 hover:border-zinc-700"
                                }`}
                              >
                                <Truck className="w-4 h-4 shrink-0" />
                                <span>Нова Пошта</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCheckoutForm({ ...checkoutForm, deliveryMethod: "ukr_poshta" })}
                                className={`p-2.5 border rounded flex flex-col items-center gap-1 cursor-pointer font-semibold ${
                                  checkoutForm.deliveryMethod === "ukr_poshta" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-[#27272a] text-zinc-450 hover:border-zinc-700"
                                }`}
                              >
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span>Укрпошта</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCheckoutForm({ ...checkoutForm, deliveryMethod: "pickup" })}
                                className={`p-2.5 border rounded flex flex-col items-center gap-1 cursor-pointer font-semibold ${
                                  checkoutForm.deliveryMethod === "pickup" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-[#27272a] text-zinc-450 hover:border-zinc-700"
                                }`}
                              >
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                <span>Самовивіз</span>
                              </button>
                            </div>
                          </div>

                          {/* Dynamic address block based on ship method */}
                          {checkoutForm.deliveryMethod === "nova_poshta" && (
                            <div>
                              <label className="text-[10px] font-mono text-zinc-500 block mb-1">НОМЕР ВІДДІЛЕННЯ НОВОЇ ПОШТИ *</label>
                              <input
                                type="text"
                                required
                                placeholder="Приклад: Відділення №24 (вулиця...)"
                                value={checkoutForm.novaPoshtaOffice}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, novaPoshtaOffice: e.target.value })}
                                className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                          )}

                          {checkoutForm.deliveryMethod === "ukr_poshta" && (
                            <div>
                              <label className="text-[10px] font-mono text-zinc-500 block mb-1">Повна поштова адреса / Індекс *</label>
                              <input
                                type="text"
                                required
                                placeholder="вул. Героїв Майдану 14, кв. 3, індекс 58000"
                                value={checkoutForm.address}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                                className="w-full bg-[#18181b] border border-[#27272a] rounded p-2.5 text-zinc-200 outline-none focus:border-amber-500"
                              />
                            </div>
                          )}

                          {/* Payment method selection */}
                          <div>
                            <label className="text-[10px] font-mono text-zinc-450 block mb-1">Спосіб оплати замовлення</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "cod" })}
                                className={`p-2.5 border rounded flex items-center justify-center gap-2 cursor-pointer font-mono font-medium ${
                                  checkoutForm.paymentMethod === "cod" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-[#27272a] text-zinc-400 hover:border-zinc-700"
                                }`}
                              >
                                <Truck className="w-4 h-4 shrink-0" />
                                <span>Післяплата</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "online" })}
                                className={`p-2.5 border rounded flex items-center justify-center gap-2 cursor-pointer font-mono font-medium ${
                                  checkoutForm.paymentMethod === "online" ? "border-amber-500 bg-amber-500/5 text-amber-400" : "border-[#27272a] text-zinc-400 hover:border-zinc-700"
                                }`}
                              >
                                <CreditCard className="w-4 h-4 shrink-0" />
                                <span>Онлайн оплата</span>
                              </button>
                            </div>
                          </div>

                          {/* Promo code block */}
                          <div>
                            <label className="text-[10px] font-mono text-zinc-500 block mb-1">Промокод на знижку</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Приклад: VARTA10"
                                value={checkoutForm.promoCode}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, promoCode: e.target.value })}
                                className="flex-1 bg-[#18181b] border border-[#27272a] rounded p-2 text-zinc-200 outline-none focus:border-amber-500 placeholder-zinc-650 uppercase font-mono"
                              />
                              <button
                                type="button"
                                onClick={handleApplyPromo}
                                className="bg-[#18181b] hover:bg-zinc-800 border border-[#27272a] hover:border-amber-500/40 text-zinc-300 hover:text-amber-400 p-2 rounded transition cursor-pointer text-xs font-mono"
                              >
                                Застосувати
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Order calculation summary in Sidebar footer */}
                        <div className="bg-[#1c1c1f]/80 p-4 rounded-lg font-mono text-xs space-y-2 mt-4 text-left border border-[#27272a]/50">
                          <div className="flex justify-between text-zinc-500">
                            <span>Сума:</span>
                            <span>{cartSubtotal.toLocaleString()} ₴</span>
                          </div>
                          {discountPercent > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Знижка ({appliedPromo}):</span>
                              <span>-{discountAmount.toLocaleString()} ₴</span>
                            </div>
                          )}
                          <div className="flex justify-between text-zinc-300 font-bold border-t border-[#27272a]/40 pt-2 text-sm">
                            <span>Загалом:</span>
                            <span className="text-amber-500">{cartTotal.toLocaleString()} ₴</span>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isPlacingOrder}
                          className="w-full bg-amber-500 text-black font-extrabold py-3.5 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-95"
                        >
                          {isPlacingOrder ? (
                            <>Комплектація посилки...</>
                          ) : (
                            <>
                              <ShieldCheck className="w-5 h-5" /> Підтвердити Замовлення (Оплата)
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Cart Empty placeholder container */
                    <div className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-[#27272a] flex items-center justify-center mx-auto text-zinc-600">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-300">Ваш кошик порожній</h4>
                        <p className="text-zinc-500 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
                          Виберіть тактичні ножі чи балончики з нашого каталогу, або пройдіть інтерактивний експрес-тест для автоматичного підбору захисту.
                        </p>
                      </div>
                      <button
                        onClick={() => { setIsCartOpen(false); setActiveTab("catalog"); }}
                        className="bg-amber-500 text-black font-semibold py-2 px-5 rounded hover:bg-amber-400 transition cursor-pointer text-xs"
                      >
                        Перейти до Каталогу
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Products Detail modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onAskAIAboutProduct={(name) => {
          setSelectedProduct(null);
          handleConsultAIAboutProduct(name);
        }}
      />

      {/* Custom built-toasts container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-3.5 px-5 rounded-lg shadow-lg flex items-center justify-start gap-2.5 text-xs font-mono font-semibold pointer-events-auto border ${
                t.type === "success" 
                  ? "bg-zinc-900 border-amber-500 text-amber-400" 
                  : "bg-zinc-900 border-[#27272a] text-zinc-300"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dynamic Alert Banner about Age verification */}
      <section className="bg-yellow-500/5 border-t border-y border-amber-500/20 py-4 px-4 mt-12 text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>
              Увага: Продаж засобів самозахисту (ножі, газові балончики тощо) здійснюється суворо <strong className="text-zinc-205 text-zinc-100">повнолітнім особам віком від 18 років</strong>. Менеджери проводять верифікацію віку при дзвінку та відправці.
            </span>
          </div>
          <div className="shrink-0 font-mono text-[10px] text-zinc-500">
            Законодавство України 2026
          </div>
        </div>
      </section>

      {/* Solid professional footer info */}
      <footer className="bg-[#09090b] border-t border-[#27272a]/55 py-10 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-zinc-350 text-zinc-400 font-mono font-bold font-semibold uppercase">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>ВАРТА — Магазин тактичного захисту та спорядження</span>
            </div>
            <p className="leading-relaxed max-w-xl">
              Захищеність і спокій кожного українця. Вся продукція сертифікована ліцензованими експертними лабораторіями МВС та не є холодною зброєю чи спецзасобом подвійного призначення.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2.5 font-mono text-[11px]">
            <div>© 2026 ТОВ «Оборон-Варта Трейд». Всі права захищено.</div>
            <div className="flex gap-4">
              <button onClick={() => { setActiveTab("laws"); }} className="hover:text-zinc-300 cursor-pointer">Законодавча довідка</button>
              <button onClick={() => { setActiveTab("catalog"); }} className="hover:text-zinc-300 cursor-pointer">Каталог</button>
              <button href="tel:+380800500600" className="hover:text-zinc-300 cursor-pointer">Гаряча лінія</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
