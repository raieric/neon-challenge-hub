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
  {
    id: 11,
    name: "The Persistence of Memory",
    description: "By Salvador Dalí, 1931. The iconic melting clocks painting.",
    image: "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
    actual_price: 150000000,
    year: "1931",
  },
  {
    id: 12,
    name: "Water Lilies (Nymphéas)",
    description: "By Claude Monet, 1906. Part of his famous series of approximately 250 oil paintings.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    actual_price: 80000000,
    year: "1906",
  },
  {
    id: 13,
    name: "The Kiss",
    description: "By Gustav Klimt, 1907–1908. Austria's most famous painting.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    actual_price: 240000000,
    year: "1908",
  },
  {
    id: 14,
    name: "The Great Wave off Kanagawa",
    description: "By Katsushika Hokusai, c. 1831. One of the most recognizable works of Japanese art.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg",
    actual_price: 2760000,
    year: "1831",
  },
  {
    id: 15,
    name: "The Birth of Venus",
    description: "By Sandro Botticelli, c. 1485. A masterpiece of the Italian Renaissance.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    actual_price: 500000000,
    year: "1485",
  },
  {
    id: 16,
    name: "American Gothic",
    description: "By Grant Wood, 1930. One of the most familiar images in 20th-century American art.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/800px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg",
    actual_price: 30000000,
    year: "1930",
  },
  {
    id: 17,
    name: "Nighthawks",
    description: "By Edward Hopper, 1942. An iconic portrayal of urban isolation.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg",
    actual_price: 40000000,
    year: "1942",
  },
  {
    id: 18,
    name: "1963 Ferrari 250 GT Lusso",
    description: "A rare classic Ferrari. Only 350 were ever produced.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/1963_Ferrari_250_GT_Lusso.jpg/1280px-1963_Ferrari_250_GT_Lusso.jpg",
    actual_price: 2300000,
    year: "1963",
  },
  {
    id: 19,
    name: "Declaration of Independence (Dunlap Broadside)",
    description: "One of 26 surviving copies of the first printing of the Declaration of Independence.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/United_States_Declaration_of_Independence.jpg/800px-United_States_Declaration_of_Independence.jpg",
    actual_price: 8100000,
    year: "1776",
  },
  {
    id: 20,
    name: "Stradivarius 'Lady Blunt' Violin",
    description: "Made by Antonio Stradivari in 1721. One of the finest instruments ever crafted.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Stradivarius_violin_front.jpg/800px-Stradivarius_violin_front.jpg",
    actual_price: 15900000,
    year: "1721",
  },
  {
    id: 21,
    name: "Hope Diamond",
    description: "A 45.52-carat deep-blue diamond. One of the most famous jewels in the world.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/The_Hope_Diamond_-_SIA.jpg/800px-The_Hope_Diamond_-_SIA.jpg",
    actual_price: 250000000,
    year: "1958",
  },
  {
    id: 22,
    name: "T-Rex Skeleton 'Stan'",
    description: "One of the most complete T-Rex fossils ever found. Sold at Christie's in 2020.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Stan_the_Trex_at_Manchester_Museum.jpg/800px-Stan_the_Trex_at_Manchester_Museum.jpg",
    actual_price: 31800000,
    year: "2020",
  },
  {
    id: 23,
    name: "Honus Wagner Baseball Card",
    description: "The T206 card from 1909. The most valuable baseball card in history.",
    image: "https://upload.wikimedia.org/wikipedia/en/e/e5/T206_Honus_Wagner.jpg",
    actual_price: 7250000,
    year: "1909",
  },
  {
    id: 24,
    name: "The Codex Hammer",
    description: "A collection of Leonardo da Vinci's scientific writings. Purchased by Bill Gates.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Vinci_-_Hammer_2A.jpg/800px-Vinci_-_Hammer_2A.jpg",
    actual_price: 30800000,
    year: "1994",
  },
  {
    id: 25,
    name: "Interchange",
    description: "By Willem de Kooning, 1955. Sold privately for a record price in 2015.",
    image: "https://upload.wikimedia.org/wikipedia/en/4/48/Willem_de_Kooning_Interchange.jpg",
    actual_price: 300000000,
    year: "1955",
  },
  {
    id: 26,
    name: "Shot Sage Blue Marilyn",
    description: "By Andy Warhol, 1964. Most expensive American artwork ever sold at auction.",
    image: "https://upload.wikimedia.org/wikipedia/en/6/66/Shot_Sage_Blue_Marilyn_by_Andy_Warhol.jpg",
    actual_price: 195000000,
    year: "1964",
  },
  {
    id: 27,
    name: "The Card Players",
    description: "By Paul Cézanne, c. 1892. Sold privately to the Royal Family of Qatar.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Les_Joueurs_de_cartes%2C_par_Paul_C%C3%A9zanne%2C_Yorck.jpg/1280px-Les_Joueurs_de_cartes%2C_par_Paul_C%C3%A9zanne%2C_Yorck.jpg",
    actual_price: 250000000,
    year: "1892",
  },
  {
    id: 28,
    name: "Guernica",
    description: "By Pablo Picasso, 1937. A powerful anti-war masterpiece. Estimated insurance value.",
    image: "https://upload.wikimedia.org/wikipedia/en/7/74/Guernica.jpg",
    actual_price: 200000000,
    year: "1937",
  },
  {
    id: 29,
    name: "Rolex Daytona 'Paul Newman'",
    description: "The most expensive wristwatch ever sold at auction. Owned by Paul Newman himself.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Rolex-Cosmograph-Daytona-6239.jpg/800px-Rolex-Cosmograph-Daytona-6239.jpg",
    actual_price: 17800000,
    year: "2017",
  },
  {
    id: 30,
    name: "Inverted Jenny Stamp",
    description: "A 1918 US airmail stamp with an upside-down airplane. Extremely rare misprint.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/US_Airmail_inverted_Jenny_24c_1918_issue.jpg/800px-US_Airmail_inverted_Jenny_24c_1918_issue.jpg",
    actual_price: 1593000,
    year: "1918",
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
