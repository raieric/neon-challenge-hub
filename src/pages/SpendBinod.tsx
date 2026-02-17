import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import binodPhoto from "@/assets/binod-chaudhary.jpg";
import Confetti from "@/components/Confetti";

const STARTING_BALANCE = 2_000_000_000;

interface Item {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const items: Item[] = [
  { id: 1, name: "Wai Wai Noodles Pack", price: 1, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=200&h=200&fit=crop", category: "Small" },
  { id: 2, name: "Cup of Chiya", price: 0.5, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&h=200&fit=crop", category: "Small" },
  { id: 3, name: "Movie Ticket", price: 8, image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop", category: "Small" },
  { id: 4, name: "Momo Plate (100 pcs)", price: 15, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=200&fit=crop", category: "Small" },
  { id: 5, name: "Trekking Backpack", price: 120, image: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=200&h=200&fit=crop", category: "Small" },
  { id: 6, name: "iPhone 16 Pro", price: 1200, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop", category: "Small" },
  { id: 7, name: "Gaming PC Setup", price: 3000, image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=200&h=200&fit=crop", category: "Small" },
  { id: 8, name: "Royal Enfield Bike", price: 5000, image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&h=200&fit=crop", category: "Small" },
  { id: 9, name: "Semester at Tribhuvan Uni", price: 2000, image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop", category: "Medium" },
  { id: 10, name: "Wedding Ceremony", price: 25000, image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&h=200&fit=crop", category: "Medium" },
  { id: 11, name: "Kathmandu Land (1 ropani)", price: 300000, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=200&fit=crop", category: "Medium" },
  { id: 12, name: "KTM Apartment", price: 200000, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop", category: "Medium" },
  { id: 13, name: "Toyota Land Cruiser", price: 150000, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=200&h=200&fit=crop", category: "Medium" },
  { id: 14, name: "Tesla Model S", price: 90000, image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&h=200&fit=crop", category: "Medium" },
  { id: 15, name: "Pokhara Resort Villa", price: 500000, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&h=200&fit=crop", category: "Medium" },
  { id: 16, name: "Private School", price: 2000000, image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&h=200&fit=crop", category: "Medium" },
  { id: 17, name: "Hospital", price: 10000000, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop", category: "Large" },
  { id: 18, name: "Shopping Mall", price: 20000000, image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=200&h=200&fit=crop", category: "Large" },
  { id: 19, name: "Hydropower Plant", price: 25000000, image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&h=200&fit=crop", category: "Large" },
  { id: 20, name: "5-Star Hotel", price: 50000000, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop", category: "Large" },
  { id: 21, name: "Football Stadium", price: 150000000, image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=200&h=200&fit=crop", category: "Large" },
  { id: 22, name: "Airline Company", price: 300000000, image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=200&h=200&fit=crop", category: "Large" },
  { id: 23, name: "Skyscraper Tower", price: 400000000, image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=200&fit=crop", category: "Large" },
  { id: 24, name: "Noodle Factory", price: 15000000, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop", category: "Large" },
  { id: 25, name: "Private Jet", price: 65000000, image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=200&h=200&fit=crop", category: "Large" },
  { id: 26, name: "Yacht", price: 10000000, image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=200&h=200&fit=crop", category: "Large" },
  { id: 27, name: "Gold Bar (1 kg)", price: 65000, image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=200&h=200&fit=crop", category: "Medium" },
  { id: 28, name: "Everest Expedition", price: 45000, image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=200&h=200&fit=crop", category: "Medium" },
  { id: 29, name: "Cricket Team", price: 100000000, image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&h=200&fit=crop", category: "Large" },
  { id: 30, name: "Space Tourism Ticket", price: 250000, image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=200&fit=crop", category: "Medium" },
  { id: 31, name: "Lamborghini Aventador", price: 500000, image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&h=200&fit=crop", category: "Medium" },
  { id: 32, name: "Island Resort", price: 200000000, image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=200&h=200&fit=crop", category: "Large" },
  { id: 33, name: "Tech Startup Investment", price: 5000000, image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop", category: "Large" },
  { id: 34, name: "Nepali Dal Bhat Set", price: 3, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop", category: "Small" },
  { id: 35, name: "Rolex Watch", price: 40000, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&h=200&fit=crop", category: "Medium" },
  { id: 36, name: "Pashmina Shawl", price: 250, image: "https://images.unsplash.com/photo-1601924921557-45e6dea0f10d?w=200&h=200&fit=crop", category: "Small" },
  { id: 37, name: "Helicopter", price: 2000000, image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&h=200&fit=crop", category: "Large" },
  { id: 38, name: "Cinema Hall", price: 8000000, image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=200&h=200&fit=crop", category: "Large" },
  { id: 39, name: "Nepali Thangka Painting", price: 5000, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop", category: "Small" },
  { id: 40, name: "Electric Bus Fleet (10)", price: 3000000, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=200&h=200&fit=crop", category: "Large" },
  { id: 41, name: "Penthouse in Dubai", price: 15000000, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop", category: "Large" },
  { id: 42, name: "Ferrari F40", price: 2500000, image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200&h=200&fit=crop", category: "Medium" },
  { id: 43, name: "Rolls Royce Phantom", price: 450000, image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&h=200&fit=crop", category: "Medium" },
  { id: 44, name: "Nepali Tea Garden", price: 1000000, image: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop", category: "Medium" },
  { id: 45, name: "Diamond Ring", price: 75000, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=200&fit=crop", category: "Medium" },
  { id: 46, name: "Kathmandu Restaurant", price: 350000, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop", category: "Medium" },
  { id: 47, name: "Solar Farm", price: 30000000, image: "https://images.unsplash.com/photo-1509391111056-a823e693caaf?w=200&h=200&fit=crop", category: "Large" },
  { id: 48, name: "University Campus", price: 75000000, image: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop", category: "Large" },
  { id: 49, name: "Bugatti Chiron", price: 3000000, image: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=200&h=200&fit=crop", category: "Large" },
  { id: 50, name: "Pokhara Coffee Shop", price: 50000, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop", category: "Medium" },
  { id: 51, name: "Satellite Launch", price: 50000000, image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=200&h=200&fit=crop", category: "Large" },
  { id: 52, name: "Thamel Night Club", price: 500000, image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=200&h=200&fit=crop", category: "Medium" },
  { id: 53, name: "Nepali Film Production", price: 2000000, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop", category: "Large" },
  { id: 54, name: "Cargo Ship", price: 35000000, image: "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=200&h=200&fit=crop", category: "Large" },
  { id: 55, name: "PlayStation 5 Bundle", price: 600, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop", category: "Small" },
].sort((a, b) => a.price - b.price);

const formatMoney = (amount: number): string => {
  if (Number.isInteger(amount)) return "$" + amount.toLocaleString("en-US");
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const playTone = (freq: number, dur: number, type: OscillatorType = "sine") => {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = 0.06;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch {}
};

// Animated counter component
const AnimatedMoney = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const rounded = Math.round(display * 100) / 100;
  return <span>{formatMoney(rounded)}</span>;
};

const SpendBinod = () => {
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const q: Record<number, number> = {};
    items.forEach((i) => (q[i.id] = 0));
    return q;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const totalSpent = STARTING_BALANCE - balance;
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const buy = useCallback((item: Item) => {
    // Use cents to avoid floating point issues
    const balanceCents = Math.round(balance * 100);
    const priceCents = Math.round(item.price * 100);
    if (balanceCents < priceCents) return;
    playTone(880, 0.08);
    const newBalance = (balanceCents - priceCents) / 100;
    setBalance(newBalance);
    setQuantities((q) => ({ ...q, [item.id]: q[item.id] + 1 }));
    if (newBalance === 0) {
      setTimeout(() => { setShowConfetti(true); setShowModal(true); }, 300);
    }
  }, [balance]);

  const sell = useCallback((item: Item) => {
    if (quantities[item.id] <= 0) return;
    playTone(440, 0.08, "triangle");
    const balanceCents = Math.round(balance * 100);
    const priceCents = Math.round(item.price * 100);
    setBalance((balanceCents + priceCents) / 100);
    setQuantities((q) => ({ ...q, [item.id]: q[item.id] - 1 }));
    setShowModal(false);
    setShowConfetti(false);
  }, [balance, quantities]);

  const restart = () => {
    setBalance(STARTING_BALANCE);
    const q: Record<number, number> = {};
    items.forEach((i) => (q[i.id] = 0));
    setQuantities(q);
    setShowConfetti(false);
    setShowModal(false);
  };

  const mostExpensiveBought = items
    .filter((i) => quantities[i.id] > 0)
    .sort((a, b) => b.price - a.price)[0];

  const spentPercent = Math.min(100, (totalSpent / STARTING_BALANCE) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {showConfetti && <Confetti />}

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={restart} className="gap-2 font-display">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-neon-cyan/40 shadow-[0_0_30px_hsl(185_80%_50%/0.3)]">
            <img
              src={binodPhoto}
              alt="Binod Chaudhary"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-1">
            💰 Spend Binod Chaudhary's Money
          </h1>
          <p className="text-muted-foreground text-sm">Try to spend $2,000,000,000</p>
        </div>

        {/* Money Counter - Sticky */}
        <div className="sticky top-0 z-20 mb-8 -mx-4 px-4 pt-2 pb-2 bg-background/80 backdrop-blur-md">
          <div className="rounded-2xl p-3 sm:p-4 text-center bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 border border-green-500/30 shadow-[0_0_40px_hsl(140_60%_40%/0.15)]">
            <p className="text-xs text-muted-foreground mb-1 font-display tracking-wider uppercase">Remaining Balance</p>
            <div className="font-display text-2xl sm:text-4xl font-black text-green-400 tracking-tight">
              <AnimatedMoney value={balance} />
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted/30 overflow-hidden max-w-md mx-auto">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                animate={{ width: `${100 - spentPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Spent: {formatMoney(totalSpent)} • Items: {totalItems}</p>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const canBuy = Math.round(balance * 100) >= Math.round(item.price * 100);
            const qty = quantities[item.id];
            return (
              <motion.div
                key={item.id}
                className="glass-panel rounded-xl overflow-hidden border border-border/50 hover:border-neon-cyan/30 transition-all duration-300 group"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-4 p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-sm truncate">{item.name}</h3>
                    <p className="text-neon-cyan font-display font-bold text-base">{formatMoney(item.price)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-4 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={qty <= 0}
                    onClick={() => sell(item)}
                    className="font-display text-xs border-red-500/40 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-30"
                  >
                    Sell
                  </Button>
                  <span className="font-display font-bold text-lg min-w-[2rem] text-center">{qty}</span>
                  <Button
                    size="sm"
                    disabled={!canBuy}
                    onClick={() => buy(item)}
                    className="font-display text-xs bg-green-600 hover:bg-green-700 text-white disabled:opacity-30"
                  >
                    Buy
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-border/50"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="font-display text-2xl font-black mb-2">You Spent It All!</h2>
              <p className="text-muted-foreground text-sm mb-6">All $2,000,000,000 gone!</p>
              <div className="space-y-2 text-sm mb-6">
                <p><span className="text-muted-foreground">Total Items: </span><span className="font-bold text-neon-cyan">{totalItems}</span></p>
                {mostExpensiveBought && (
                  <p><span className="text-muted-foreground">Most Expensive: </span><span className="font-bold text-neon-pink">{mostExpensiveBought.name}</span></p>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={restart} className="font-display gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Link to="/">
                  <Button variant="outline" className="font-display">Home</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpendBinod;
