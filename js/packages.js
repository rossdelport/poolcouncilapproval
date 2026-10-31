// ===== Pool package price list: edit prices here =====
// All prices include GST. "price" is added on top of the base package.
// Upgrades are priced at a 30% margin (your extra cost divided by 0.7).
// Pool colour and extras are Terra Tanks items, charged at Terra Tanks' own prices.
var PKG = {
  base: 20000,
  size: [
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
    { id: "blade",    name: "Aluminium blade, Monument", note: "Wide flat blades in dark charcoal. Sleek, modern and never needs painting.", price: 1750 },
    { id: "glass",    name: "Frameless glass", note: "Uninterrupted views. The showpiece option.", price: 5100 }
  ],
  deckSize: [
    { id: "small", name: "10 m² deck", note: "Space for a couple of chairs beside the pool." },
    { id: "large", name: "25 m² deck", note: "Wraps the pool, with room to lounge and entertain." }
  ],
  deckMat: [
    { id: "moonlight", name: "Ekodeck Moonlight", short: "Moonlight composite", note: "Soft light grey composite. No oiling, no splinters, stays cooler underfoot.", top: "#c9c4bb", face: "#9a958d" },
    { id: "nightfall", name: "Ekodeck Nightfall", short: "Nightfall composite", note: "Deep charcoal composite. No oiling, no splinters.", top: "#4a4b4d", face: "#333436" },
    { id: "merbau",    name: "Merbau hardwood", short: "merbau", note: "Rich red-brown timber. Oil once or twice a year.", top: "#9a5a3a", face: "#6e3d26" },
    { id: "spotted",   name: "Spotted gum hardwood", short: "spotted gum", note: "Honey-toned Aussie hardwood. Oil once or twice a year.", top: "#c18a5a", face: "#8f6440" }
  ],
  // Deck price depends on size and material
  deckPrice: {
    small: { moonlight: 0,    nightfall: 0,    merbau: 1600,  spotted: 2800 },
    large: { moonlight: 7100, nightfall: 7100, merbau: 11000, spotted: 14000 }
  },
  // One landscaping allowance, no garden upgrades (customer picks plants with the landscaper)
  land: [
    { id: "basic", name: "Landscaping", note: "$2,000 allowance. Choose your plants, turf and mulch with our landscaper.", price: 0 }
  ],
  extras: [
    { id: "heat",  name: "Heat pump", note: "Swim all year round. Heats the pool to 36°C in 12 to 18 hours with the cover on (up to 40°C), then holds it for about $1 a day.", price: 2750 },
    { id: "cover", name: "Premium hard-shell cover", note: "Keeps leaves out and warmth in.", price: 875 },
    { id: "liner", name: "Interior liner", note: "Soft blue finish and a 3-year warranty.", price: 400 }
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
  return { size: "family", finish: "galv", fence: "vertibar", deckSize: "small", deckMat: "moonlight", land: "basic", extras: [] };
};

// Turn a build into "family/galv/vertibar/small/moonlight/basic/heat+cover" and back
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
    { label: dSize.name.replace("deck", dMat.short + " deck"), detail: "Deck", price: PKG.deckPrice[s.deckSize][s.deckMat] },
    { label: land.name, detail: "$2,000 allowance, plants of your choice", price: land.price }
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

// Photos for a build, best first. If a photo is missing, the page shows the next one,
// so new colour photos appear by themselves once they are added to images/pool.
PKG.photos = function (s) {
  var scene = ["s", s.fence, s.deckSize, s.deckMat].join("-");
  var list = [scene + "-" + s.finish, scene + "-galv", "s-vertibar-small-moonlight-galv"];
  return list.filter(function (name, i) { return list.indexOf(name) === i; });
};

// Each photo comes in two sizes (900 and 1400 wide). Phones get the small one, so photos load fast.
PKG.img = function (img, name, sizes) {
  img.sizes = sizes || "(max-width: 600px) 300px, 960px";
  img.srcset = "/images/pool/" + name + "-sm.webp 900w, /images/pool/" + name + ".webp 1400w";
  img.src = "/images/pool/" + name + ".webp";
};

// The quote lines as list items, used by the designer and the quote page
PKG.linesHTML = function (q) {
  return q.lines.map(function (l, i) {
    return "<li><span>" + l.label + "<small>" + l.detail + "</small></span><span>" + (i ? PKG.priceText(l.price) : PKG.money(l.price)) + "</span></li>";
  }).join("");
};
