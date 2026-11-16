// ─── Rule-based categorization ────────────────────────────────────────────────
// Maps regex patterns (matched against transaction description) to system category names.
// Category names must exactly match a system category in prisma/system-categories.ts —
// tests/unit/import.categories.test.ts fails if one doesn't.
// Rules are checked in order and the first match wins.
//
// Kept free of imports so it can be unit-tested without a database or env config.

export interface CategoryRule {
  pattern: RegExp
  category: string
}

export const CATEGORY_RULES: CategoryRule[] = [
  // Food & Dining
  { pattern: /swiggy|zomato|uber.?eat|foodpanda|dunzo.*food|blinkit.*food/i, category: 'Food & Dining' },
  { pattern: /restaurant|cafe|bistro|kitchen|dhaba|canteen|eatery|parotta|thali|biriyani|biryani/i, category: 'Food & Dining' },
  { pattern: /mcdonald|kfc|pizza|domino|burger|subway|starbucks|coffee.?day|ccd\b/i, category: 'Food & Dining' },
  { pattern: /naivedya|curry.?box|yellow.?sapphire|white.?elephant.*food|virunthu|amuktha|kanchi.?cafe/i, category: 'Food & Dining' },

  // Groceries
  { pattern: /bigbasket|big.?basket|grofers|zepto|blinkit|instamart|dmart|more.?retail|reliance.?fresh/i, category: 'Groceries' },
  { pattern: /supermarket|hypermarket|grand.?bazar|balaji.*bazar|grocery|kirana|provisions/i, category: 'Groceries' },

  // Vegetables & Fruits
  { pattern: /vegetable|fruits|sabzi|mandi|veggie/i, category: 'Vegetables & Fruits' },

  // Shopping
  { pattern: /amazon(?!.*prime)|flipkart|myntra|ajio|nykaa|meesho|snapdeal|shopsy/i, category: 'Shopping' },
  { pattern: /bata\b|nike|adidas|puma|woodland|levis|zara|h&m|max.?fashion|pantaloon|westside/i, category: 'Shopping' },
  { pattern: /inorbit|phoenix.?mall|lulu.?mall|central.*retail|shoppers.?stop/i, category: 'Shopping' },

  // Transportation
  { pattern: /uber(?!.*eat)|ola.?cab|rapido|meru|taxi|auto.?rickshaw/i, category: 'Transportation' },
  { pattern: /metro.?(rail|card)|bus.?(pass|ticket)|ksrtc|msrtc|tsrtc|apsrtc|bmtc/i, category: 'Transportation' },

  // Air Travel
  { pattern: /indigo|air.?india|spicejet|vistara|akasa|go.?first|air.?asia/i, category: 'Air Travel' },
  { pattern: /airport|airways|airlines(?!.*ins)/i, category: 'Air Travel' },

  // Train Travel
  { pattern: /irctc|indian.?rail|railways|train.?ticket/i, category: 'Train Travel' },
  { pattern: /kpn.?ff|kpn.*travels/i, category: 'Train Travel' },

  // Fuel & Petrol
  { pattern: /petrol|diesel|hp.*petrol|iocl.*fuel|bpcl.*fuel|shell.*fuel|indian.?oil.*fuel/i, category: 'Fuel & Petrol' },

  // FASTag & Tolls
  { pattern: /fastag|fasttag|\btoll\b/i, category: 'FASTag & Tolls' },

  // Entertainment
  { pattern: /netflix|hotstar|disney|amazon.?prime|sony.?liv|zee5|jio.?cinema|manorama/i, category: 'Entertainment' },
  { pattern: /bookmyshow|pvr|inox|cinepolis|multiplex|cinema|movie.?ticket/i, category: 'Entertainment' },
  { pattern: /spotify|gaana|jiosaavn|wynk|youtube.?premium/i, category: 'Entertainment' },

  // Healthcare
  { pattern: /apollo|medplus|1mg|netmeds|pharmeasy|pharmacy|chemist|medical store|medicine/i, category: 'Healthcare' },
  { pattern: /hospital|clinic|doctor|diagnostic|lab.*test|health.*check|aravind|narayana/i, category: 'Healthcare' },

  // Insurance
  { pattern: /lic\b|life.?insur|health.?insur|term.?plan|icici.?lombard|star.?health|bajaj.?allianz/i, category: 'Insurance' },
  { pattern: /hdfc.?ergo|new.?india.?assur|national.?insur|oriental.?insur/i, category: 'Insurance' },

  // Internet & Fiber
  { pattern: /jio.?(fiber|broadband|xstream)|airtel.?(broadband|fiber|xstream)/i, category: 'Internet & Fiber' },
  { pattern: /act.?fiber|hathway|you.?broadband|bsnl.*(broadband|fiber)|broadband|internet.?bill/i, category: 'Internet & Fiber' },

  // Utilities (electricity, water, mobile recharge)
  { pattern: /jio.?(recharge|prepaid|postpaid)|airtel.?(mobile|recharge)|vi\b.*recharge|vodafone.*recharge/i, category: 'Utilities' },
  { pattern: /electricity|bescom|tneb|msedcl|power.?bill|water.?bill|piped.?gas.?bill/i, category: 'Utilities' },

  // Gas & LPG
  { pattern: /lpg|indane|hp.?gas|bharat.?gas|cylinder|gas.?booking/i, category: 'Gas & LPG' },

  // Gym & Fitness
  { pattern: /gym|fitness|cult.?fit|gold.*gym|yoga|crossfit|workout/i, category: 'Gym & Fitness' },

  // Education
  { pattern: /school|college|university|tuition|coaching|byju|unacademy|vedantu|coursera|udemy/i, category: 'Education' },

  // Stationery & Books
  { pattern: /stationery|bookstore|crossword|oxford.?book|sapna.?book/i, category: 'Stationery & Books' },

  // Savings & Investments
  { pattern: /zerodha|groww|upstox|kuvera|coin.*zerodha|mutual.?fund|\bsip\b/i, category: 'Savings & Investments' },
  { pattern: /\bppf\b|\bnps\b|\belss\b|fd.?booking|fixed.?deposit/i, category: 'Savings & Investments' },

  // Loan Payment — "EMI ..." is a common label in HDFC CC statements
  { pattern: /^emi\s+/i, category: 'Loan Payment' },
]
