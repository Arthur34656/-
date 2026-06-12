import { useState } from "react";
import { Product } from "../types";
import { ShieldCheck, Scale, Star, ShoppingBag, Eye } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onOpenDetails }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      id={`product-card-${product.id}`}
      className="bg-[#121214] border border-[#27272a] rounded-lg overflow-hidden flex flex-col justify-between group h-full relative"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Best Seller or Feature badge */}
      {product.isBestSeller && (
        <span className="absolute top-3 left-3 z-10 bg-amber-500 text-[#09090b] text-xs font-mono font-bold px-2 py-1 rounded uppercase tracking-wider">
          Хіт Продажів
        </span>
      )}

      {/* Legality Badge */}
      <span className="absolute top-3 right-3 z-10 bg-[#09090b]/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[11px] font-mono px-2 py-1 rounded flex items-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" /> 100% Дозволено
      </span>

      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-[#18181b] overflow-hidden cursor-pointer" onClick={() => onOpenDetails(product)}>
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent opacity-60" />
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-[#09090b]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="bg-white text-[#121214] p-2.5 rounded-full hover:bg-amber-500 hover:text-[#121214] transition-colors"
            title="Детальніше"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
            <span>{product.categoryLabel}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              <span className="text-zinc-600 font-sans">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>

          {/* Key specs mini block */}
          <div className="bg-[#18181b] border border-[#27272a]/40 rounded p-2.5 mb-4 text-[11px] font-mono text-zinc-400">
            {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-[#27272a]/20 last:border-0 py-0.5">
                <span className="text-zinc-500">{key}:</span>
                <span className="text-zinc-300 font-medium truncate max-w-[150px]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Cart Actions */}
        <div>
          <div className="flex items-center gap-1 text-xs text-amber-500 font-mono mb-3 bg-amber-500/5 px-2.5 py-1.5 rounded border border-amber-500/10">
            <Scale className="w-4 h-4 shrink-0" />
            <span className="truncate">Юр. статус: не є холодною зброєю</span>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div>
              <span className="text-xs text-zinc-500 block font-mono">Ціна</span>
              <span className="text-2xl font-bold text-zinc-100 font-mono">
                {product.price.toLocaleString()} <span className="text-sm font-sans font-normal text-zinc-400">₴</span>
              </span>
            </div>

            <button
              id={`add-to-cart-btn-${product.id}`}
              type="button"
              onClick={() => onAddToCart(product)}
              className="bg-amber-500 text-[#09090b] font-medium px-4 py-2.5 rounded hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer text-sm font-semibold active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" /> В кошик
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
