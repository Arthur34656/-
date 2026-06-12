import { Product } from "../types";
import { X, ShieldCheck, Scale, Check, ShoppingBag, MessageSquareCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAskAIAboutProduct: (productName: string) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart, onAskAIAboutProduct }: ProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal content box */}
        <motion.div
          className="bg-[#121214] border border-[#27272a] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
            {/* Left: Product Media */}
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-lg bg-[#18181b] overflow-hidden border border-[#27272a]/40">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Legal info panel */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 font-mono text-left">Законодавчий Статус</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed text-left">
                      {product.legalSelfDefenseStatus}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Specs & Information */}
            <div className="flex flex-col justify-between text-left">
              <div>
                <span className="text-xs font-mono text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded">
                  {product.categoryLabel}
                </span>

                <h2 className="text-2xl font-bold text-zinc-100 mt-2.5 mb-2 leading-tight">
                  {product.name}
                </h2>

                <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
                  {product.description}
                </p>

                {/* Key features */}
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2.5">
                  Ключові Переваги:
                </h4>
                <ul className="space-y-1.5 mb-5 text-sm text-zinc-300">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Specifications table */}
                <h4 className="text-xs font-mono font-bold uppercase text-zinc-500 tracking-wider mb-2">
                  Технічні Особливості:
                </h4>
                <div className="bg-[#18181b] rounded-lg border border-[#27272a]/30 p-3 text-xs mb-6 space-y-1.5 font-mono text-zinc-300">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-[#27272a]/20 last:border-0 pb-1.5 last:pb-0">
                      <span className="text-zinc-500">{key}:</span>
                      <span className="text-zinc-200 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Primary CTA */}
              <div className="pt-4 border-t border-[#27272a] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 block font-mono">Вартість</span>
                  <span className="text-3xl font-extrabold text-zinc-100 font-mono">
                    {product.price.toLocaleString()} <span className="text-lg font-sans font-normal text-zinc-400">₴</span>
                  </span>
                </div>

                <div className="flex gap-2 flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => onAskAIAboutProduct(product.name)}
                    className="flex-1 sm:flex-initial bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-amber-400 transition-colors py-2.5 px-3.5 rounded flex items-center justify-center gap-1.5 cursor-pointer text-xs font-mono"
                    title="Спитати ШІ консультанта"
                  >
                    <MessageSquareCode className="w-4 h-4" /> ШІ-Радник
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial bg-amber-500 text-[#09090b] hover:bg-amber-400 font-semibold px-5 py-2.5 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <ShoppingBag className="w-4 h-4" /> Додати
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
