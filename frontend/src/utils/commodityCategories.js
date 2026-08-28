// Comprehensive Agricultural Category Mapping for 123 Indian Mandi Commodities
export const COMMODITY_CATEGORIES = {
  'Vegetables': [
    'Amaranthus',
    'Amphophalus',
    'Ashgourd',
    'Beans',
    'Beetroot',
    'Bhindi(Ladies Finger)',
    'Bitter Gourd',
    'Bottle Gourd',
    'Brinjal',
    'Cabbage',
    'Capsicum',
    'Carrot',
    'Cauliflower',
    'Cluster Beans',
    'Colacasia',
    'Cowpea(Veg)',
    'Cucumbar(Kheera)',
    'Drumstick',
    'Elephant Yam (Suran)',
    'French Beans (Frasbean)',
    'Green Peas',
    'Indian Beans (Seam)',
    'Kartali (Kantola)',
    'Knool Khol',
    'Leafy Vegetable',
    'Little Gourd (Kundru)',
    'Long Melon(Kakri)',
    'Mashrooms',
    'Mint(Pudina)',
    'Onion',
    'Peas Wet',
    'Pointed Gourd (Parval)',
    'Potato',
    'Pumpkin',
    'Raddish',
    'Ridgeguard(Tori)',
    'Snakeguard',
    'Spinach',
    'Sponge Gourd',
    'Squash(Chappal Kadoo)',
    'Sweet Potato',
    'Sweet Pumpkin',
    'Tapioca',
    'Tinda',
    'Tomato',
    'Yam (Ratalu)'
  ],
  'Spices': [
    'Ajwan',
    'Black Pepper',
    'Coriander(Leaves)',
    'Cummin Seed(Jeera)',
    'Dry Chillies',
    'Garlic',
    'Ginger(Dry)',
    'Ginger(Green)',
    'Green Chilli',
    'Methi Seeds',
    'Mustard',
    'Soanf',
    'Suva (Dill Seed)'
  ],
  'Millets & Cereals': [
    'Bajra(Pearl Millet/Cumbu)',
    'Jowar(Sorghum)',
    'Maize',
    'Paddy(Dhan)(Basmati)',
    'Paddy(Dhan)(Common)',
    'Rice',
    'Wheat'
  ],
  'Pulses & Legumes': [
    'Arhar (Tur/Red Gram)(Whole)',
    'Arhar Dal(Tur Dal)',
    'Bengal Gram(Gram)(Whole)',
    'Black Gram (Urd Beans)(Whole)',
    'Cowpea (Lobia/Karamani)',
    'Field Pea',
    'Green Avare (W)',
    'Green Gram (Moong)(Whole)',
    'Green Gram Dal (Moong Dal)',
    'Kabuli Chana(Chickpeas-White)',
    'Kulthi(Horse Gram)',
    'Lentil (Masur)(Whole)',
    'Masur Dal',
    'Peas(Dry)',
    'Pegeon Pea (Arhar Fali)'
  ],
  'Fruits': [
    'Apple',
    'Apricot(Jardalu/Khumani)',
    'Banana',
    'Banana - Green',
    'Cherry',
    'Chikoos(Sapota)',
    'Grapes',
    'Guava',
    'Jack Fruit',
    'Karbuja(Musk Melon)',
    'Lemon',
    'Lime',
    'Mango',
    'Mango (Raw-Ripe)',
    'Mousambi(Sweet Lime)',
    'Orange',
    'Papaya',
    'Peach',
    'Pineapple',
    'Plum',
    'Pomegranate',
    'Water Melon'
  ],
  'Oilseeds & Cash Crops': [
    'Castor Seed',
    'Coconut Oil',
    'Coconut Seed',
    'Cotton',
    'Firewood',
    'Fish',
    'Groundnut',
    'Groundnut Pods (Raw)',
    'Guar',
    'Guar Seed(Cluster Beans Seed)',
    'Gur(Jaggery)',
    'Isabgul (Psyllium)',
    'Jute',
    'Linseed',
    'Mustard Oil',
    'Pigs',
    'Sesamum(Sesame,Gingelly,Til)',
    'Soyabean',
    'Tender Coconut',
    'Wood'
  ]
};

export const CATEGORY_ICONS = {
  'Vegetables': '🥦',
  'Spices': '🌶️',
  'Millets & Cereals': '🌾',
  'Pulses & Legumes': '🫘',
  'Fruits': '🍎',
  'Oilseeds & Cash Crops': '🌻',
  'Other': '🌿'
};

export const CATEGORY_COLORS = {
  'Vegetables': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Spices': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  'Millets & Cereals': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  'Pulses & Legumes': 'bg-orange-500/10 text-orange-300 border-orange-500/30',
  'Fruits': 'bg-pink-500/10 text-pink-300 border-pink-500/30',
  'Oilseeds & Cash Crops': 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  'Other': 'bg-slate-500/10 text-slate-300 border-slate-500/30'
};

// Fast lookup map from commodity name to category
export const COMMODITY_TO_CATEGORY = {};
Object.entries(COMMODITY_CATEGORIES).forEach(([cat, list]) => {
  list.forEach(comm => {
    COMMODITY_TO_CATEGORY[comm.toLowerCase().trim()] = cat;
  });
});

export function getCommodityCategory(commodityName = '') {
  if (!commodityName) return 'Other';
  return COMMODITY_TO_CATEGORY[commodityName.toLowerCase().trim()] || 'Other';
}

