const form = document.getElementById("listingForm");
const emptyState = document.getElementById("emptyState");
const results = document.getElementById("results");

const scoreText = document.getElementById("scoreText");
const scoreRingText = document.getElementById("scoreRingText");

const betterTitleEl = document.getElementById("betterTitle");
const betterDescriptionEl = document.getElementById("betterDescription");
const photoChecklistEl = document.getElementById("photoChecklist");
const priceTipsEl = document.getElementById("priceTips");

const scriptInterestedEl = document.getElementById("scriptInterested");
const scriptLowOfferEl = document.getElementById("scriptLowOffer");
const scriptPickupEl = document.getElementById("scriptPickup");

const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");
const toast = document.getElementById("toast");

const categoryRules = [
  {
    keywords: ["couch", "sofa", "loveseat", "chair", "table", "desk", "dresser", "bed", "mattress", "furniture"],
    category: "furniture",
    titleNoun: "Furniture",
    photos: [
      "Full item photo from the front in good lighting",
      "Side angle photo showing depth and shape",
      "Close-up of fabric, wood, leather, or surface texture",
      "Photo of any scratches, stains, dents, or wear",
      "Photo showing the item in a room for scale",
      "Measurement photo or dimensions in the description"
    ],
    details: [
      "dimensions",
      "material",
      "color",
      "pickup details",
      "any visible wear"
    ]
  },
  {
    keywords: ["iphone", "phone", "ipad", "laptop", "macbook", "computer", "monitor", "camera", "headphones", "speaker", "tv", "xbox", "playstation", "switch"],
    category: "electronics",
    titleNoun: "Device",
    photos: [
      "Front and back of the device",
      "Screen powered on, if applicable",
      "Close-up of ports, corners, and buttons",
      "Photo of included accessories or cables",
      "Photo of model number, storage size, or specs if safe to show",
      "Photo of any scratches, cracks, or cosmetic wear"
    ],
    details: [
      "brand and model",
      "storage/specs",
      "battery health if relevant",
      "included accessories",
      "whether it is unlocked or factory reset"
    ]
  },
  {
    keywords: ["shirt", "jacket", "jeans", "dress", "shoes", "sneakers", "boots", "coat", "hoodie", "bag", "purse", "clothing"],
    category: "clothing",
    titleNoun: "Clothing",
    photos: [
      "Front view laid flat or on hanger",
      "Back view",
      "Close-up of fabric and label",
      "Photo of size tag",
      "Photo of soles for shoes, if applicable",
      "Photo of any stains, wear, or flaws"
    ],
    details: [
      "brand",
      "size",
      "fit",
      "material",
      "condition and flaws"
    ]
  },
  {
    keywords: ["car", "truck", "suv", "van", "honda", "toyota", "ford", "chevy", "bmw", "mercedes", "vehicle"],
    category: "vehicle",
    titleNoun: "Vehicle",
    photos: [
      "Exterior front, rear, and both sides",
      "Interior dashboard and seats",
      "Odometer/mileage photo",
      "Tires and wheels",
      "Engine bay",
      "Any dents, scratches, warning lights, or damage"
    ],
    details: [
      "year, make, and model",
      "mileage",
      "title status",
      "maintenance history",
      "known issues"
    ]
  },
  {
    keywords: ["candle", "jewelry", "print", "art", "handmade", "soap", "sticker", "planner", "digital", "etsy"],
    category: "handmade",
    titleNoun: "Handmade Item",
    photos: [
      "Clean hero photo on a simple background",
      "Lifestyle photo showing the item in use",
      "Close-up of details, texture, or craftsmanship",
      "Scale photo showing size",
      "Packaging photo, if attractive",
      "Variant photos for colors, sizes, or styles"
    ],
    details: [
      "materials",
      "size",
      "use case",
      "gift occasion",
      "processing or shipping time"
    ]
  }
];

function sanitizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function titleCase(str) {
  const smallWords = new Set(["and", "or", "the", "a", "an", "of", "for", "with", "in", "on"]);
  return sanitizeText(str)
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index !== 0 && smallWords.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function detectCategory(item, description, details) {
  const text = `${item} ${description} ${details}`.toLowerCase();

  return categoryRules.find(rule =>
    rule.keywords.some(keyword => text.includes(keyword))
  ) || {
    category: "general",
    titleNoun: "Item",
    photos: [
      "Clear front photo in natural lighting",
      "Side or alternate angle photo",
      "Close-up of important details",
      "Photo of any flaws or wear",
      "Photo of included accessories or extras",
      "Scale photo if size is not obvious"
    ],
    details: [
      "brand or maker",
      "size or dimensions",
      "condition",
      "what is included",
      "pickup or shipping details"
    ]
  };
}

function getConditionPhrase(condition) {
  const map = {
    "New": "brand new condition",
    "Like New": "like-new condition",
    "Good": "good condition",
    "Fair": "fair condition",
    "Needs Repair": "needs repair"
  };

  return map[condition] || "good condition";
}

function getUrgencySentence(urgency) {
  const map = {
    "Moving": "Available because I’m moving.",
    "Decluttering": "Available because I’m decluttering and making more space.",
    "Need sold quickly": "Looking to sell soon, so serious buyers are welcome.",
    "Upgrading": "Available because I’m upgrading to something new.",
    "No rush": ""
  };

  return map[urgency] || "";
}

function getPlatformAdvice(platform) {
  const map = {
    "Facebook Marketplace": "Use simple local-search keywords and mention pickup availability clearly.",
    "eBay": "Include brand, model, condition, measurements/specs, and shipping details.",
    "Etsy": "Lead with use case, style, materials, gifting angle, and keywords buyers search for.",
    "Craigslist": "Keep it direct, include neighborhood/pickup details, and disclose condition honestly.",
    "Poshmark": "Emphasize brand, size, fit, condition, and styling keywords.",
    "Mercari": "Mention condition, shipping, included accessories, and bundle availability.",
    "Other": "Make the title searchable and the description easy to scan."
  };

  return map[platform] || map.Other;
}

function inferMissingDetailsTips(rule, combinedText) {
  const lower = combinedText.toLowerCase();

  return rule.details
    .filter(detail => {
      const words = detail.split(" ");
      return !words.some(word => lower.includes(word.toLowerCase()));
    })
    .slice(0, 4);
}

function buildBetterTitle(data, rule) {
  const item = titleCase(data.item);
  const condition = data.condition;

  const platformSuffix = {
    "Facebook Marketplace": "Pickup Available",
    "Craigslist": "Local Pickup",
    "eBay": "Ready to Ship",
    "Etsy": "Gift-Ready",
    "Poshmark": "Clean Condition",
    "Mercari": "Ships Fast",
    "Other": "Available Now"
  };

  let title = `${item} — ${condition} Condition`;

  if (data.price) {
    title += `, ${data.price}`;
  }

  title += `, ${platformSuffix[data.platform] || "Available Now"}`;

  if (title.length > 82) {
    title = `${item} — ${condition} Condition`;
  }

  return title;
}

function buildBetterDescription(data, rule) {
  const conditionPhrase = getConditionPhrase(data.condition);
  const urgencySentence = getUrgencySentence(data.urgency);
  const platformAdvice = getPlatformAdvice(data.platform);

  const itemTitle = titleCase(data.item);
  const priceLine = data.price ? `Price: ${data.price}` : "Price: Open to reasonable offers.";
  const originalDescription = sanitizeText(data.description);
  const extraDetails = sanitizeText(data.details);

  const detailLine = extraDetails
    ? `Additional details: ${extraDetails}`
    : `Additional details: Message me if you want measurements, extra photos, or more information.`;

  const honestConditionLine =
    data.condition === "Needs Repair"
      ? "Condition: This item needs repair, so please review the photos and ask questions before buying."
      : `Condition: ${itemTitle} is in ${conditionPhrase}.`;

  const pickupOrShipping =
    ["Facebook Marketplace", "Craigslist"].includes(data.platform)
      ? "Pickup/meetup: Local pickup preferred. Message me to coordinate a time."
      : "Shipping/pickup: Message me with any shipping, pickup, or delivery questions.";

  return [
    `Selling ${itemTitle}.`,
    "",
    honestConditionLine,
    detailLine,
    urgencySentence,
    "",
    "Why it’s worth considering:",
    `- Clear, practical item for someone looking for ${data.item.toLowerCase()}`,
    `- ${data.condition} condition`,
    `- ${priceLine}`,
    `- Easy to message with questions or arrange next steps`,
    "",
    pickupOrShipping,
    "",
    `Platform tip: ${platformAdvice}`,
    "",
    originalDescription.length > 20
      ? `Original note from seller: ${originalDescription}`
      : ""
  ].filter(Boolean).join("\n");
}

function buildPriceTips(data, rule) {
  const tips = [];

  if (data.price) {
    tips.push(`You listed the price as ${data.price}. Compare it against 3–5 similar sold or active listings before posting.`);
    tips.push("If you want a faster sale, price slightly below similar listings with worse photos or less detail.");
  } else {
    tips.push("Add a clear price. Listings with no price often attract lower-quality messages.");
    tips.push("Check 3–5 similar listings and price based on condition, brand, age, and urgency.");
  }

  if (data.urgency === "Need sold quickly" || data.urgency === "Moving") {
    tips.push("Because you want it sold soon, consider adding: “Reasonable offers considered for quick pickup.”");
  } else {
    tips.push("If you are not in a rush, leave room to negotiate instead of accepting the first low offer.");
  }

  if (rule.category === "electronics") {
    tips.push("For electronics, price depends heavily on model, storage/specs, battery health, accessories, and cosmetic wear.");
  }

  if (rule.category === "furniture") {
    tips.push("For furniture, clear measurements and pickup details can justify a stronger asking price.");
  }

  if (rule.category === "clothing") {
    tips.push("For clothing, brand, size, condition, and current style demand matter more than original retail price.");
  }

  return tips;
}

function buildScripts(data) {
  const price = data.price || "the listed price";

  let pickupScript;

  if (["eBay", "Etsy", "Mercari", "Poshmark"].includes(data.platform)) {
    pickupScript = "Thanks! I can confirm the item details before purchase. If you have questions about shipping or what’s included, send them over.";
  } else {
    pickupScript = "Thanks! Local pickup works best. If you’re serious, send me a time window that works for you and I’ll confirm availability.";
  }

  return {
    interested: `Thanks for your interest. Yes, it’s still available. Let me know if you have any questions or when you’d like to move forward.`,
    lowOffer: `Thanks for the offer. I’m asking ${price}, but I can consider a reasonable offer if you’re ready to move forward soon.`,
    pickup: pickupScript
  };
}

function calculateScore(data) {
  let score = 55;

  if (data.item.length >= 4) score += 8;
  if (data.title.length >= 12) score += 7;
  if (data.description.length >= 60) score += 10;
  if (data.description.length >= 150) score += 5;
  if (data.price) score += 8;
  if (data.details.length >= 30) score += 7;
  if (data.details.length >= 90) score += 4;
  if (data.condition) score += 3;

  return Math.min(score, 96);
}

function renderList(element, items) {
  element.innerHTML = "";

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
}

function showToast(message = "Copied to clipboard") {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
}

function animateResults() {
  results.animate(
    [
      { opacity: 0, transform: "translateY(14px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    {
      duration: 320,
      easing: "ease-out"
    }
  );
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(form);

  const data = {
    item: sanitizeText(formData.get("item")),
    title: sanitizeText(formData.get("title")),
    description: sanitizeText(formData.get("description")),
    condition: sanitizeText(formData.get("condition")),
    price: sanitizeText(formData.get("price")),
    platform: sanitizeText(formData.get("platform")),
    urgency: sanitizeText(formData.get("urgency")),
    details: sanitizeText(formData.get("details"))
  };

  const rule = detectCategory(data.item, data.description, data.details);
  const combinedText = `${data.item} ${data.title} ${data.description} ${data.details}`;

  const betterTitle = buildBetterTitle(data, rule);
  const betterDescription = buildBetterDescription(data, rule);
  const missingDetails = inferMissingDetailsTips(rule, combinedText);

  const photoChecklist = [...rule.photos];

  if (missingDetails.length) {
    photoChecklist.push(`Add missing listing details: ${missingDetails.join(", ")}.`);
  }

  const priceTips = buildPriceTips(data, rule);
  const scripts = buildScripts(data);
  const score = calculateScore(data);

  scoreText.textContent = `${score} / 100`;
  scoreRingText.textContent = score;

  betterTitleEl.textContent = betterTitle;
  betterDescriptionEl.textContent = betterDescription;

  renderList(photoChecklistEl, photoChecklist);
  renderList(priceTipsEl, priceTips);

  scriptInterestedEl.textContent = scripts.interested;
  scriptLowOfferEl.textContent = scripts.lowOffer;
  scriptPickupEl.textContent = scripts.pickup;

  emptyState.classList.add("hidden");
  results.classList.remove("hidden");

  animateResults();

  if (window.innerWidth < 960) {
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.addEventListener("click", async event => {
  const button = event.target.closest(".copy-btn");

  if (!button) return;

  const targetId = button.dataset.copyTarget;
  const target = document.getElementById(targetId);

  if (!target) return;

  const text = target.innerText || target.textContent;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  } catch {
    showToast("Could not copy");
  }
});

printBtn.addEventListener("click", () => {
  window.print();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  results.classList.add("hidden");
  emptyState.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});