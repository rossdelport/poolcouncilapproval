// ===== Pool package price list: edit prices here =====
// All prices include GST. "price" is added on top of the base package.
// Upgrades are priced at a 30% margin (your extra cost divided by 0.7).
// Pool colour and extras are Terra Tanks items, charged at Terra Tanks' own prices.
var PKG = {
  base: 20000,
  size: [
    { id: "urban",  name: "Urban Plunge 1.8m",  note: "Fits courtyards and small yards. Seats 2 to 3.", price: 0, scale: 0.8 },
    { id: "family", name: "Family Plunge 2.4m", note: "Our most popular size. Seats up to 5.", price: 0, scale: 1 }
  ],
  finish: [
    { id: "galv",      name: "Classic galvanised", price: 0,   color: "#b9c2c7" },
    { id: "black",     name: "Matte black",        price: 850, color: "#2e3033" },
    { id: "white",     name: "Matte white",        price: 850, color: "#ecebe6" },
    { id: "olive",     name: "Olive green",        price: 850, color: "#6b7350" },
    { id: "sandstone", name: "Sandstone",          price: 850, color: "#cdb48e" }
  ],
  fence: [
    { id: "vertibar", name: "Black Vertibar aluminium", note: "Classic, tough and fully pool-compliant.", price: 0 },
    { id: "slat",     name: "Aluminium batten", note: "A warm timber look that never needs painting.", price: 1600 },
    { id: "glass",    name: "Frameless glass", note: "Uninterrupted views. The showpiece option.", price: 5100 }
  ],
  deckSize: [
    { id: "small", name: "10 m² deck", note: "Space for a couple of chairs beside the pool." },
    { id: "large", name: "25 m² deck", note: "Wraps the pool, with room to lounge and entertain." }
  ],
  deckMat: [
    { id: "composite", name: "Composite, ash grey", note: "No oiling, no splinters, stays cooler underfoot.", top: "#bdb7ad", face: "#8f8a82" },
    { id: "merbau",    name: "Merbau hardwood", note: "Rich natural timber. Oil once or twice a year.", top: "#9a5a3a", face: "#6e3d26" },
    { id: "premium",   name: "Premium composite", note: "Deeper timber grain and a longer warranty.", top: "#b48d64", face: "#86684a" }
  ],
  // Deck price depends on size and material
  deckPrice: {
    small: { composite: 0,    merbau: 1600,  premium: 3600 },
    large: { composite: 7100, merbau: 11000, premium: 16000 }
  },
  land: [
    { id: "basic",   name: "Native garden", note: "WA natives, mulch and turf or gravel.", price: 0 },
    { id: "plus",    name: "Garden Plus", note: "Twice the planting, plus a feature plant.", price: 2900 },
    { id: "premium", name: "Resort garden", note: "Paving, a feature tree and garden lighting.", price: 7100 }
  ],
  extras: [
    { id: "heat",  name: "Heat pump", note: "Swim all year round.", price: 2750 },
    { id: "cover", name: "Premium hard-shell cover", note: "Keeps leaves out and warmth in.", price: 875 },
    { id: "liner", name: "Interior liner", note: "Soft blue finish and a 3-year warranty.", price: 400 },
    { id: "bench", name: "Bench seat", note: "Sit back and soak.", price: 295 }
  ]
};
// =====================================================

PKG.money = function (n) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);
};

PKG.find = function (key, id) {
  return PKG[key].find(function (o) { return o.id === id; }) || PKG[key][0];
};

PKG.defaults = function () {
  return { size: "urban", finish: "galv", fence: "vertibar", deckSize: "small", deckMat: "composite", land: "basic", extras: [] };
};

// Turn a build into "urban/galv/vertibar/small/composite/basic/heat+cover" and back
PKG.KEYS = ["size", "finish", "fence", "deckSize", "deckMat", "land"];
PKG.toHash = function (s) {
  return PKG.KEYS.map(function (k) { return s[k]; }).concat(s.extras.join("+")).join("/");
};
PKG.fromHash = function (hash) {
  var parts = (hash || "").replace("#", "").split("/");
  var s = PKG.defaults();
  PKG.KEYS.forEach(function (k, i) {
    if (parts[i] && PKG[k].some(function (o) { return o.id === parts[i]; })) s[k] = parts[i];
  });
  s.extras = (parts[6] || "").split("+").filter(function (id) {
    return PKG.extras.some(function (o) { return o.id === id; });
  });
  return s;
};

// The itemised quote for a build
PKG.quote = function (s) {
  var size = PKG.find("size", s.size), finish = PKG.find("finish", s.finish), fence = PKG.find("fence", s.fence);
  var dSize = PKG.find("deckSize", s.deckSize), dMat = PKG.find("deckMat", s.deckMat), land = PKG.find("land", s.land);
  var lines = [
    { label: "Base package", detail: "Pool, fence, deck, garden, site prep and council approval", price: PKG.base },
    { label: size.name, detail: "Genuine Tarter USA stock tank from Terra Tanks", price: size.price },
    { label: finish.name, detail: "Pool colour", price: finish.price },
    { label: fence.name, detail: "Pool fence, 10 m plus self-closing gate", price: fence.price },
    { label: dSize.name + ", " + dMat.name.toLowerCase(), detail: "Deck", price: PKG.deckPrice[s.deckSize][s.deckMat] },
    { label: land.name, detail: "Landscaping", price: land.price }
  ];
  s.extras.forEach(function (id) {
    var x = PKG.find("extras", id);
    lines.push({ label: x.name, detail: "Extra", price: x.price });
  });
  var total = lines.reduce(function (sum, l) { return sum + l.price; }, 0);
  return { lines: lines, total: total };
};

PKG.priceText = function (p) {
  return p ? "+" + PKG.money(p) : "Included";
};
