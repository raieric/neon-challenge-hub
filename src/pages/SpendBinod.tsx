import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import binodPhoto from "@/assets/binod-chaudhary.jpg";
import mukeshPhoto from "/billionaire-photos/mukesh-ambani.jpg";
import elonPhoto from "/billionaire-photos/elon-musk.jpg";
import zuckPhoto from "/billionaire-photos/mark-zuckerberg.jpg";
import pavelPhoto from "/billionaire-photos/pavel-durov.jpg";
import bezosPhoto from "/billionaire-photos/jeff-bezos.jpg";
import gatesPhoto from "/billionaire-photos/bill-gates.jpg";
import buffettPhoto from "/billionaire-photos/warren-buffett.jpg";
import Confetti from "@/components/Confetti";

interface Billionaire {
  id: string;
  name: string;
  netWorth: number;
  photo: string;
  emoji: string;
  description: string;
}

const billionaires: Billionaire[] = [
  { id: "binod", name: "Binod Chaudhary", netWorth: 2_000_000_000, photo: binodPhoto, emoji: "🇳🇵", description: "Nepal's only billionaire – Wai Wai king" },
  { id: "mukesh", name: "Mukesh Ambani", netWorth: 116_000_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Mukesh_Ambani.jpg/440px-Mukesh_Ambani.jpg", emoji: "🇮🇳", description: "Chairman of Reliance Industries" },
  { id: "elon", name: "Elon Musk", netWorth: 250_000_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg", emoji: "🚀", description: "CEO of Tesla & SpaceX" },
  { id: "zuck", name: "Mark Zuckerberg", netWorth: 177_000_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/440px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg", emoji: "👤", description: "CEO of Meta (Facebook)" },
  { id: "pavel", name: "Pavel Durov", netWorth: 15_500_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Pavel_Durov_in_2024_%28cropped%29.jpg/440px-Pavel_Durov_in_2024_%28cropped%29.jpg", emoji: "✈️", description: "Founder of Telegram" },
  { id: "bezos", name: "Jeff Bezos", netWorth: 200_000_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29_%28cropped%29.jpg/440px-Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29_%28cropped%29.jpg", emoji: "📦", description: "Founder of Amazon" },
  { id: "gates", name: "Bill Gates", netWorth: 128_000_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/440px-Bill_Gates_2017_%28cropped%29.jpg", emoji: "💻", description: "Co-founder of Microsoft" },
  { id: "buffett", name: "Warren Buffett", netWorth: 133_000_000_000, photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/440px-Warren_Buffett_KU_Visit.jpg", emoji: "📈", description: "CEO of Berkshire Hathaway" },
];

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
  { id: 9, name: "Semester at Tribhuvan Uni", price: 2000, image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop", category: "Medium" },
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
  { id: 36, name: "Pashmina Shawl", price: 250, image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=200&h=200&fit=crop", category: "Small" },
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
  { id: 47, name: "Solar Farm", price: 30000000, image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=200&h=200&fit=crop", category: "Large" },
  { id: 48, name: "University Campus", price: 75000000, image: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop", category: "Large" },
  { id: 49, name: "Bugatti Chiron", price: 3000000, image: "https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=200&h=200&fit=crop", category: "Large" },
  { id: 50, name: "Pokhara Coffee Shop", price: 50000, image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop", category: "Medium" },
  { id: 51, name: "Satellite Launch", price: 50000000, image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=200&h=200&fit=crop", category: "Large" },
  { id: 52, name: "Thamel Night Club", price: 500000, image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=200&h=200&fit=crop", category: "Medium" },
  { id: 53, name: "Nepali Film Production", price: 2000000, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop", category: "Large" },
  { id: 54, name: "Cargo Ship", price: 35000000, image: "https://images.unsplash.com/photo-1524522173746-f628baad3644?w=200&h=200&fit=crop", category: "Large" },
  { id: 55, name: "PlayStation 5 Bundle", price: 600, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop", category: "Small" },
  // Extra big-ticket items for mega billionaires
  { id: 56, name: "NBA Basketball Team", price: 2_500_000_000, image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=200&fit=crop", category: "Mega" },
  { id: 57, name: "Social Media Company", price: 10_000_000_000, image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop", category: "Mega" },
  { id: 58, name: "Mars Colony Mission", price: 20_000_000_000, image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=200&h=200&fit=crop", category: "Mega" },
  { id: 59, name: "Aircraft Carrier", price: 13_000_000_000, image: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=200&h=200&fit=crop", category: "Mega" },
  { id: 60, name: "Undersea Cable Network", price: 5_000_000_000, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop", category: "Mega" },
  { id: 61, name: "Space Station Module", price: 3_000_000_000, image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=200&h=200&fit=crop", category: "Mega" },
  { id: 62, name: "Premier League Club", price: 4_000_000_000, image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&h=200&fit=crop", category: "Mega" },
  { id: 63, name: "Semiconductor Factory", price: 15_000_000_000, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop", category: "Mega" },
  { id: 64, name: "Hyperloop Network", price: 8_000_000_000, image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=200&h=200&fit=crop", category: "Mega" },
  { id: 65, name: "Nuclear Power Plant", price: 25_000_000_000, image: "https://images.unsplash.com/photo-1591529824855-667a60e5b3c2?w=200&h=200&fit=crop", category: "Mega" },
  { id: 66, name: "Global Vaccine Program", price: 7_000_000_000, image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=200&h=200&fit=crop", category: "Mega" },
  { id: 67, name: "Tropical Island", price: 1_000_000_000, image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=200&h=200&fit=crop", category: "Mega" },
  { id: 68, name: "Luxury Cruise Ship", price: 1_500_000_000, image: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=200&h=200&fit=crop", category: "Mega" },
  { id: 69, name: "Self-Driving Car Company", price: 30_000_000_000, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=200&h=200&fit=crop", category: "Mega" },
  { id: 70, name: "Global 5G Network", price: 50_000_000_000, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop", category: "Mega" },
].sort((a, b) => a.price - b.price);

const formatMoney = (amount: number): string => {
  if (Number.isInteger(amount)) return "$" + amount.toLocaleString("en-US");
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatMoneyFull = (amount: number): string => {
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

// ─── Selection Screen ───────────────────────────────────────────
const BillionaireSelector = ({ onSelect }: { onSelect: (b: Billionaire) => void }) => {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            💰 Spend a Billionaire's Money
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Whose fortune do you want to blow through?
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {billionaires.map((b, i) => (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(b)}
              className="glass-panel rounded-xl p-4 text-center border border-border/50 hover:border-neon-cyan/40 hover:shadow-[0_0_30px_hsl(185_80%_50%/0.15)] transition-all duration-300 group"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-3 border-neon-cyan/30 group-hover:border-neon-cyan/60 transition-colors">
                <img
                  src={b.photo}
                  alt={b.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="font-display text-sm font-bold mb-1 truncate">{b.emoji} {b.name}</p>
              <p className="text-neon-cyan font-display text-xs font-bold">{formatMoney(b.netWorth)}</p>
              <p className="text-muted-foreground text-[10px] mt-1 leading-tight">{b.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Spending Screen ────────────────────────────────────────────
const SpendingGame = ({ billionaire, onBack }: { billionaire: Billionaire; onBack: () => void }) => {
  const startingBalance = billionaire.netWorth;
  const [balance, setBalance] = useState(startingBalance);
  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const q: Record<number, number> = {};
    items.forEach((i) => (q[i.id] = 0));
    return q;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const totalSpent = startingBalance - balance;
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const buy = useCallback((item: Item) => {
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
    setBalance(startingBalance);
    const q: Record<number, number> = {};
    items.forEach((i) => (q[i.id] = 0));
    setQuantities(q);
    setShowConfetti(false);
    setShowModal(false);
  };

  const mostExpensiveBought = items
    .filter((i) => quantities[i.id] > 0)
    .sort((a, b) => b.price - a.price)[0];

  const spentPercent = Math.min(100, (totalSpent / startingBalance) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {showConfetti && <Confetti />}

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-neon-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-neon-cyan/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 font-display">
              <ArrowLeft className="w-4 h-4" /> Change Person
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={restart} className="gap-2 font-display">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-neon-cyan/40 shadow-[0_0_30px_hsl(185_80%_50%/0.3)]">
            <img
              src={billionaire.photo}
              alt={billionaire.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-1">
            💰 Spend {billionaire.name}'s Money
          </h1>
          <p className="text-muted-foreground text-sm">Try to spend {formatMoneyFull(startingBalance)}</p>
        </div>

        {/* Money Counter */}
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
                    <p className="text-neon-cyan font-display font-bold text-base">{formatMoneyFull(item.price)}</p>
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
              <p className="text-muted-foreground text-sm mb-6">All {formatMoneyFull(startingBalance)} of {billionaire.name}'s money gone!</p>
              <div className="space-y-2 text-sm mb-6">
                <p><span className="text-muted-foreground">Total Items: </span><span className="font-bold text-neon-cyan">{totalItems}</span></p>
                {mostExpensiveBought && (
                  <p><span className="text-muted-foreground">Most Expensive: </span><span className="font-bold text-neon-pink">{mostExpensiveBought.name}</span></p>
                )}
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={restart} className="font-display gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Button variant="outline" onClick={onBack} className="font-display">
                  Choose Another
                </Button>
                <Link to="/">
                  <Button variant="ghost" className="font-display">Home</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────
const SpendBinod = () => {
  const [selected, setSelected] = useState<Billionaire | null>(null);

  if (!selected) {
    return <BillionaireSelector onSelect={setSelected} />;
  }

  return <SpendingGame billionaire={selected} onBack={() => setSelected(null)} />;
};

export default SpendBinod;
