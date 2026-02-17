import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuctionItem {
  id: number;
  name: string;
  description: string;
  image: string;
  actual_price: number;
  year: string;
}

const items: AuctionItem[] = [
  {
    id: 1,
    name: "Mona Lisa",
    description: "Painted by Leonardo da Vinci, c. 1503–1519. The world's most famous portrait.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    actual_price: 860000000,
    year: "1503",
  },
  {
    id: 2,
    name: "The Scream",
    description: "By Edvard Munch, 1895 pastel version. Sold at auction in 2012.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/800px-The_Scream.jpg",
    actual_price: 119900000,
    year: "1895",
  },
  {
    id: 3,
    name: "Salvator Mundi",
    description: "Attributed to Leonardo da Vinci. Most expensive painting ever sold at auction.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Leonardo_da_Vinci%2C_Salvator_Mundi%2C_c.1500%2C_oil_on_walnut%2C_45.4_%C3%97_65.6_cm.jpg/800px-Leonardo_da_Vinci%2C_Salvator_Mundi%2C_c.1500%2C_oil_on_walnut%2C_45.4_%C3%97_65.6_cm.jpg",
    actual_price: 450300000,
    year: "2017",
  },
  {
    id: 4,
    name: "Les Femmes d'Alger (Version O)",
    description: "By Pablo Picasso, 1955. Sold at Christie's New York.",
    image: "https://upload.wikimedia.org/wikipedia/en/7/7e/Les_Femmes_d%27Alger.jpg",
    actual_price: 179400000,
    year: "1955",
  },
  {
    id: 5,
    name: "No. 5, 1948",
    description: "By Jackson Pollock. One of the most expensive paintings ever sold privately.",
    image: "https://upload.wikimedia.org/wikipedia/en/4/4a/No._5%2C_1948.jpg",
    actual_price: 140000000,
    year: "1948",
  },
  {
    id: 6,
    name: "The Starry Night",
    description: "By Vincent van Gogh, 1889. Housed at MoMA, estimated insurance value.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    actual_price: 200000000,
    year: "1889",
  },
  {
    id: 7,
    name: "Girl with a Pearl Earring",
    description: "By Johannes Vermeer, c. 1665. The 'Mona Lisa of the North.'",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
    actual_price: 30000000,
    year: "1665",
  },
  {
    id: 8,
    name: "1962 Ferrari 250 GTO",
    description: "The most expensive car ever sold at auction. Only 36 were made.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/1962_Ferrari_250_GTO_%28chassis_3851GT%29_at_Goodwood_Revival_2012.jpg/1280px-1962_Ferrari_250_GTO_%28chassis_3851GT%29_at_Goodwood_Revival_2012.jpg",
    actual_price: 48405000,
    year: "1962",
  },
  {
    id: 9,
    name: "Codex Leicester",
    description: "Leonardo da Vinci's scientific manuscript. Bought by Bill Gates in 1994.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vinci_-_Hammer_2A.jpg/800px-Vinci_-_Hammer_2A.jpg",
    actual_price: 30800000,
    year: "1994",
  },
  {
    id: 10,
    name: "Action Comics #1",
    description: "First appearance of Superman, 1938. The holy grail of comic books.",
    image: "https://upload.wikimedia.org/wikipedia/en/5/5a/Action_Comics_1.jpg",
    actual_price: 3250000,
    year: "1938",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "items") {
      // Return items WITHOUT prices
      const safeItems = items.map(({ actual_price, ...rest }) => rest);
      // Shuffle
      const shuffled = [...safeItems].sort(() => Math.random() - 0.5);
      return new Response(JSON.stringify(shuffled), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "guess" && req.method === "POST") {
      const { itemId, guess } = await req.json();
      const item = items.find((i) => i.id === itemId);
      if (!item) {
        return new Response(JSON.stringify({ error: "Item not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const actual = item.actual_price;
      const difference = Math.abs(guess - actual);
      const percentOff = (difference / actual) * 100;
      const score = Math.max(0, Math.round(1000 - (difference / actual) * 1000));

      return new Response(
        JSON.stringify({
          actual_price: actual,
          guess,
          difference,
          percent_off: Math.round(percentOff * 10) / 10,
          score,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
