import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   BOR-BI — Gestion images produits via MongoDB Atlas + Cloudinary
   © TransTech Solution — Roderic Sylvio N.D.
   
   ARCHITECTURE IMAGE :
   1. Vendeur/Admin upload une image
   2. Image → convertie en base64 → envoyée à Cloudinary
   3. URL Cloudinary → stockée dans MongoDB Atlas (champ imageUrl)
   4. App affiche l'image via l'URL sécurisée Cloudinary
   
   CONFIGURATION MONGODB :
   - Cluster : cloud.mongodb.com
   - Base : borbi_db
   - Collections : products, users, transactions, orders, messages
   - API : MongoDB Data API (activation dans Atlas)
   
   CONFIGURATION CLOUDINARY :
   - Compte gratuit : cloudinary.com
   - Upload preset : borbi_upload (unsigned)
═══════════════════════════════════════════════════════════════ */

// ─── CONFIGURATION MONGODB ATLAS DATA API ────────────────────
// Activez la Data API dans votre Atlas : 
// Atlas → Data API → Enable → Copier l'URL et la clé API
const MONGO_CONFIG = {
  dataApiUrl:  "https://data.mongodb-api.com/app/data-axxx/endpoint/data/v1",
  apiKey:      "VOTRE_CLE_API_MONGODB_ATLAS",   // ← remplacer
  dataSource:  "Cluster0",                        // ← nom de votre cluster
  database:    "borbi_db",
};

// ─── CONFIGURATION CLOUDINARY ─────────────────────────────────
// Compte gratuit cloudinary.com → Settings → Upload → Add upload preset
const CLOUDINARY_CONFIG = {
  cloudName:    "VOTRE_CLOUD_NAME",              // ← remplacer
  uploadPreset: "borbi_upload",                  // ← créer preset unsigned
  apiUrl:       (cloud) => `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
};

// ─── COULEURS ────────────────────────────────────────────────
const C = {
  navy:"#1e3a8a", navyD:"#0f2260", navyL:"#2d4fa8",
  green:"#10b981", greenL:"#34d399",
  red:"#ef4444", purple:"#8b5cf6", amber:"#f59e0b",
  bg:"#060d1f", surface:"#0d1b38", card:"#112044",
  border:"#1e3a8a44", text:"#e8f0fe", muted:"#7a92cc", dimmed:"#3d5496",
};

const ADMIN_EMAIL = "pauledoux@protonmail.com";

// ─── CATALOGUE DE BASE (avec emojis comme fallback) ──────────
const CATALOG_BASE = [
  // BOULANGERIE
  { id:"boul-1",  nameFr:"Pain baguette",     nameWolof:"Pain baguette",   nameAr:"خبز الباغيت",   category:"boulangerie", unit:"pièce",  price:20000,  emoji:"🥖", keywords:["pain","baguette","mburu"] },
  { id:"boul-2",  nameFr:"Pain de mie",       nameWolof:"Pain de mie",     nameAr:"خبز التوست",     category:"boulangerie", unit:"sachet", price:50000,  emoji:"🍞", keywords:["pain","mie","toast"] },
  { id:"boul-3",  nameFr:"Croissant",         nameWolof:"Kroasaan",        nameAr:"كرواسون",        category:"boulangerie", unit:"pièce",  price:30000,  emoji:"🥐", keywords:["croissant"] },
  // FRAIS & PROTEINES
  { id:"frais-1", nameFr:"Poulet PAC entier", nameWolof:"Jën u kër (PAC)", nameAr:"دجاج كامل",      category:"frais",       unit:"kg",     price:280000, emoji:"🍗", keywords:["poulet","jën","dajaj"] },
  { id:"frais-2", nameFr:"Thiof entier",      nameWolof:"Thiof",           nameAr:"سمك ثيوف",       category:"frais",       unit:"kg",     price:500000, emoji:"🐟", keywords:["thiof","poisson","jën"] },
  { id:"frais-3", nameFr:"Cuisses poulet",    nameWolof:"Bëñ u jën",      nameAr:"أفخاذ الدجاج",   category:"frais",       unit:"kg",     price:220000, emoji:"🍖", keywords:["cuisse","poulet"] },
  { id:"frais-4", nameFr:"Sardines fraîches", nameWolof:"Yabée yu bees",   nameAr:"سردين طازج",     category:"frais",       unit:"kg",     price:120000, emoji:"🐠", keywords:["sardines","yabée"] },
  { id:"frais-5", nameFr:"Kéthiakh fumé",     nameWolof:"Kéthiakh",        nameAr:"كيثياخ مدخن",   category:"frais",       unit:"kg",     price:600000, emoji:"🐡", keywords:["kethiakh","fumé"] },
  { id:"frais-6", nameFr:"Œufs (plateau)",    nameWolof:"Ngor (plato)",    nameAr:"بيض دجاج",      category:"frais",       unit:"plateau",price:350000, emoji:"🥚", keywords:["oeufs","ngor","beid"] },
  // FRUITS & LÉGUMES
  { id:"fl-1",    nameFr:"Tomate",            nameWolof:"Tomaat",          nameAr:"طماطم",          category:"fruits",      unit:"kg",     price:50000,  emoji:"🍅", keywords:["tomate","tomaat"] },
  { id:"fl-2",    nameFr:"Oignon",            nameWolof:"Soble",           nameAr:"بصل",            category:"fruits",      unit:"kg",     price:40000,  emoji:"🧅", keywords:["oignon","soble","basal"] },
  { id:"fl-3",    nameFr:"Mangue",            nameWolof:"Maango",          nameAr:"مانجو",          category:"fruits",      unit:"kg",     price:60000,  emoji:"🥭", keywords:["mangue","maango"] },
  { id:"fl-4",    nameFr:"Banane douce",      nameWolof:"Banaana",         nameAr:"موز",            category:"fruits",      unit:"kg",     price:50000,  emoji:"🍌", keywords:["banane","banaana","muz"] },
  { id:"fl-5",    nameFr:"Citron",            nameWolof:"Limoŋ",           nameAr:"ليمون",          category:"fruits",      unit:"kg",     price:70000,  emoji:"🍋", keywords:["citron","limon"] },
  { id:"fl-6",    nameFr:"Pomme de terre",    nameWolof:"Pomdeteer",       nameAr:"بطاطس",          category:"fruits",      unit:"kg",     price:45000,  emoji:"🥔", keywords:["pomme terre","patate"] },
  // ÉPICERIE
  { id:"epic-1",  nameFr:"Riz brisé 25kg",   nameWolof:"Ceep (25kg)",     nameAr:"أرز مكسور 25كغ", category:"epicerie",    unit:"sac",    price:1200000,emoji:"🌾", keywords:["riz","ceep","aruz"] },
  { id:"epic-2",  nameFr:"Huile végétale 5L", nameWolof:"Diiwël (5L)",    nameAr:"زيت نباتي 5ل",   category:"epicerie",    unit:"bidon",  price:550000, emoji:"🫙", keywords:["huile","diiwel","zeit"] },
  { id:"epic-3",  nameFr:"Sucre 1kg",         nameWolof:"Sukër (1kg)",     nameAr:"سكر 1كغ",        category:"epicerie",    unit:"kg",     price:70000,  emoji:"🍬", keywords:["sucre","sukër","sukar"] },
  { id:"epic-4",  nameFr:"Farine de blé 1kg", nameWolof:"Fariin (1kg)",   nameAr:"دقيق القمح",     category:"epicerie",    unit:"kg",     price:60000,  emoji:"🌾", keywords:["farine","fariin","daqiq"] },
  { id:"epic-5",  nameFr:"Cube Maggi",        nameWolof:"Kukuu Maggi",     nameAr:"مكعب ماجي",      category:"epicerie",    unit:"sachet", price:5000,   emoji:"🟡", keywords:["maggi","cube","kukuu"] },
  { id:"epic-6",  nameFr:"Lait en poudre",    nameWolof:"Meew bu gëm",     nameAr:"حليب بودرة",     category:"epicerie",    unit:"boîte",  price:250000, emoji:"🥛", keywords:["lait","meew","halib"] },
  { id:"epic-7",  nameFr:"Tomate concentrée", nameWolof:"Tomat",           nameAr:"معجون طماطم",    category:"epicerie",    unit:"boîte",  price:20000,  emoji:"🍅", keywords:["tomate","concentrée"] },
  { id:"epic-8",  nameFr:"Sel fin 1kg",       nameWolof:"Melax (1kg)",     nameAr:"ملح ناعم",       category:"epicerie",    unit:"kg",     price:20000,  emoji:"🧂", keywords:["sel","melax","milh"] },
  // BOISSONS
  { id:"bois-1",  nameFr:"Eau Kirène 1.5L",   nameWolof:"Ndox Kirène",     nameAr:"ماء كيرين",      category:"boissons",    unit:"bouteille",price:40000, emoji:"💧", keywords:["eau","ndox","kirene","ma"] },
  { id:"bois-2",  nameFr:"Coca-Cola 1.5L",    nameWolof:"Coca Cola",       nameAr:"كوكاكولا",       category:"boissons",    unit:"bouteille",price:100000,emoji:"🥤", keywords:["coca","cola"] },
  { id:"bois-3",  nameFr:"Jus de bissap",     nameWolof:"Jus bisaap",      nameAr:"عصير الكركدي",   category:"boissons",    unit:"bouteille",price:50000, emoji:"🍵", keywords:["bissap","bisaap","jus"] },
  // HYGIÈNE
  { id:"hyg-1",   nameFr:"Savon Cadum",       nameWolof:"Sabun Cadum",     nameAr:"صابون كادوم",    category:"hygiene",     unit:"barre",  price:30000,  emoji:"🧼", keywords:["savon","sabun","sabun"] },
  { id:"hyg-2",   nameFr:"Lessive poudre 1kg",nameWolof:"Lesiv (1kg)",     nameAr:"مسحوق الغسيل",  category:"hygiene",     unit:"kg",     price:80000,  emoji:"🫧", keywords:["lessive","lesiv"] },
  { id:"hyg-3",   nameFr:"Liquide vaisselle", nameWolof:"Likid vesèl",     nameAr:"سائل الأطباق",   category:"hygiene",     unit:"flacon", price:60000,  emoji:"🫧", keywords:["vaisselle","liquide"] },
  { id:"hyg-4",   nameFr:"Papier toilette 6r",nameWolof:"Papyé (6 rulo)",  nameAr:"ورق حمام",       category:"hygiene",     unit:"paquet", price:120000, emoji:"🧻", keywords:["papier","toilette"] },
  // ÉNERGIE
  { id:"tech-1",  nameFr:"Ampoule LED 9W",    nameWolof:"Ampool LED 9W",   nameAr:"مصباح LED",      category:"energie",     unit:"pièce",  price:150000, emoji:"💡", keywords:["ampoule","led","lamp"] },
  { id:"tech-2",  nameFr:"Pile AA (×4)",       nameWolof:"Pil AA (×4)",     nameAr:"بطاريات AA",     category:"energie",     unit:"pack",   price:60000,  emoji:"🔋", keywords:["pile","batterie","pil"] },
  // QUINCAILLERIE
  { id:"quin-1",  nameFr:"Marteau 500g",      nameWolof:"Martoo (500g)",   nameAr:"مطرقة",          category:"quincaillerie",unit:"pièce", price:350000, emoji:"🔨", keywords:["marteau","martoo"] },
  { id:"quin-2",  nameFr:"Tournevis plat",    nameWolof:"Turnevis plat",   nameAr:"مفك مستقيم",     category:"quincaillerie",unit:"pièce", price:80000,  emoji:"🪛", keywords:["tournevis","turnevis"] },
  // CUISINE
  { id:"cuis-1",  nameFr:"Casserole 5L",      nameWolof:"Kasrol (5L)",     nameAr:"قدر 5 لتر",      category:"cuisine",     unit:"pièce",  price:800000, emoji:"🍲", keywords:["casserole","kasrol","qidr"] },
  { id:"cuis-2",  nameFr:"Mortier et pilon",  nameWolof:"Mbëgël",          nameAr:"هاون ومدقة",     category:"cuisine",     unit:"jeu",    price:350000, emoji:"🫙", keywords:["mortier","pilon","mbëgël"] },
  // MATÉRIAUX
  { id:"mat-1",   nameFr:"Ciment Portland 50kg",nameWolof:"Simañ (50kg)",  nameAr:"إسمنت 50كغ",     category:"materiaux",   unit:"sac",    price:750000, emoji:"🏗️", keywords:["ciment","simañ","esmant"] },
  { id:"mat-2",   nameFr:"Fer 10mm barre",    nameWolof:"Fer (10mm)",      nameAr:"حديد تسليح 10مم",category:"materiaux",   unit:"barre",  price:1200000,emoji:"🔩", keywords:["fer","acier","hadid"] },
  // MOBILIER
  { id:"mob-1",   nameFr:"Chaise plastique",  nameWolof:"Kees u plastik",  nameAr:"كرسي بلاستيك",   category:"mobilier",    unit:"pièce",  price:300000, emoji:"🪑", keywords:["chaise","kees","kursi"] },
  { id:"mob-2",   nameFr:"Matelas 2 places",  nameWolof:"Matalas (ñaar)",  nameAr:"مرتبة مزدوجة",   category:"mobilier",    unit:"pièce",  price:5500000,emoji:"🛏️", keywords:["matelas","matalas","firash"] },
];

const CATEGORIES = [
  {id:"boulangerie",  label:"Boulangerie",           labelWo:"Mburu ak Gâteau",  labelAr:"المخبوزات",        icon:"🥖"},
  {id:"frais",        label:"Frais & Protéines",     labelWo:"Jën yu bees",      labelAr:"منتجات طازجة",    icon:"🐟"},
  {id:"fruits",       label:"Fruits & Légumes",      labelWo:"Fruits ak Légumes",labelAr:"الفواكه والخضروات",icon:"🍎"},
  {id:"epicerie",     label:"Épicerie",               labelWo:"Épicerie",         labelAr:"البقالة",          icon:"🛒"},
  {id:"boissons",     label:"Boissons",               labelWo:"Ndox ak Jus",      labelAr:"المشروبات",        icon:"🥤"},
  {id:"hygiene",      label:"Hygiène & Bazar",        labelWo:"Santé ak Soin",    labelAr:"النظافة",          icon:"🧴"},
  {id:"energie",      label:"Énergie & Tech",         labelWo:"Courant ak Tech",  labelAr:"الكهرباء والتقنية",icon:"⚡"},
  {id:"quincaillerie",label:"Quincaillerie",           labelWo:"Butil ak Outil",   labelAr:"العتاد",           icon:"🔧"},
  {id:"cuisine",      label:"Ustensiles Cuisine",     labelWo:"Cantine ak Jaaxal",labelAr:"أدوات المطبخ",    icon:"🍳"},
  {id:"materiaux",    label:"Matériaux Construction", labelWo:"Kër defar",        labelAr:"مواد البناء",      icon:"🏗️"},
  {id:"mobilier",     label:"Mobilier",               labelWo:"Biir kër",         labelAr:"الأثاث",           icon:"🛋️"},
];

// ─── MONGODB ATLAS DATA API ───────────────────────────────────
const mongoFetch = async (action, collection, body={}) => {
  try {
    const res = await fetch(`${MONGO_CONFIG.dataApiUrl}/action/${action}`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "api-key":        MONGO_CONFIG.apiKey,
      },
      body: JSON.stringify({
        dataSource: MONGO_CONFIG.dataSource,
        database:   MONGO_CONFIG.database,
        collection,
        ...body,
      }),
    });
    if (!res.ok) throw new Error(`MongoDB ${action} failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`MongoDB [${action}/${collection}]:`, err.message);
    return null;
  }
};

// CRUD MongoDB
const mongoDB = {
  // Récupérer tous les produits
  getProducts: async () => {
    const r = await mongoFetch("find", "products", {
      filter: {}, sort: { category: 1, nameFr: 1 }, limit: 1000
    });
    return r?.documents || [];
  },
  // Récupérer un produit par ID
  getProduct: async (id) => {
    const r = await mongoFetch("findOne", "products", { filter: { _id: { $oid: id } } });
    return r?.document || null;
  },
  // Insérer un produit
  insertProduct: async (product) => {
    const r = await mongoFetch("insertOne", "products", { document: product });
    return r?.insertedId || null;
  },
  // Mettre à jour un produit
  updateProduct: async (id, update) => {
    return await mongoFetch("updateOne", "products", {
      filter: { _id: { $oid: id } },
      update: { $set: { ...update, updatedAt: new Date().toISOString() } }
    });
  },
  // Supprimer un produit
  deleteProduct: async (id) => {
    return await mongoFetch("deleteOne", "products", { filter: { _id: { $oid: id } } });
  },
  // Récupérer les produits par catégorie
  getProductsByCategory: async (category) => {
    const r = await mongoFetch("find", "products", {
      filter: { category }, sort: { nameFr: 1 }, limit: 200
    });
    return r?.documents || [];
  },
  // Récupérer les produits sponsorisés
  getSponsoredProducts: async () => {
    const r = await mongoFetch("find", "products", {
      filter: { sponsored: true, sponsoredActive: true },
      sort: { sponsoredOrder: 1 }, limit: 50
    });
    return r?.documents || [];
  },
  // Initialiser le catalogue de base (seed)
  seedCatalog: async () => {
    const existing = await mongoDB.getProducts();
    if (existing.length > 0) return existing.length;
    const docs = CATALOG_BASE.map(p => ({
      ...p,
      imageUrl:        "",
      imagePublicId:   "",
      sponsored:       false,
      sponsoredActive: false,
      sponsoredOrder:  null,
      brand:           "",
      createdAt:       new Date().toISOString(),
      updatedAt:       new Date().toISOString(),
    }));
    const r = await mongoFetch("insertMany", "products", { documents: docs });
    return r?.insertedIds?.length || 0;
  },
};

// ─── CLOUDINARY UPLOAD ────────────────────────────────────────
const uploadToCloudinary = async (file, folder="borbi-products") => {
  const formData = new FormData();
  formData.append("file",         file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder",        folder);
  formData.append("quality",       "auto");
  formData.append("fetch_format",  "auto");

  const res = await fetch(
    CLOUDINARY_CONFIG.apiUrl(CLOUDINARY_CONFIG.cloudName),
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Upload Cloudinary échoué");
  const data = await res.json();
  return {
    url:      data.secure_url,
    publicId: data.public_id,
    width:    data.width,
    height:   data.height,
  };
};

// Générer les variantes d'URL Cloudinary (redimensionnement automatique)
const cloudinaryUrl = (url, opts={}) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  const { w=150, h=150, crop="fill", q="auto", f="auto" } = opts;
  return url.replace(
    "/upload/",
    `/upload/c_${crop},w_${w},h_${h},q_${q},f_${f}/`
  );
};

// ─── UTILITAIRES ─────────────────────────────────────────────
const uid    = () => Math.random().toString(36).slice(2,11);
const now    = () => new Date().toISOString();
const fmt    = (cents, cur="XOF") => {
  const v = cents/100;
  if(cur==="XOF") return `${Math.round(v).toLocaleString("fr-FR")} FCFA`;
  if(cur==="EUR") return `${v.toFixed(2)} €`;
  if(cur==="USD") return `$${v.toFixed(2)}`;
  return `${v.toLocaleString()} ${cur}`;
};

const LS = {
  get: (k,d) => { try{const r=localStorage.getItem(k);return r?JSON.parse(r):d;}catch{return d;} },
  set: (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
};

// ─── CSS GLOBAL ───────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans','Segoe UI',system-ui,sans-serif; background:${C.bg}; color:${C.text}; -webkit-font-smoothing:antialiased; }
  input,select,textarea,button { font-family:inherit; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:99px; }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .page { animation:fadeUp .25s ease both; }
  .card { background:${C.card}; border:1px solid ${C.border}; border-radius:14px; overflow:hidden; }
  .input-base { width:100%; background:${C.bg}; border:1.5px solid ${C.border}; border-radius:10px; padding:10px 14px; color:${C.text}; outline:none; transition:border-color .2s; }
  .input-base:focus { border-color:${C.green}; }
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:none; border-radius:10px; cursor:pointer; font-weight:600; transition:filter .15s,transform .1s; white-space:nowrap; }
  .btn:hover:not(:disabled) { filter:brightness(1.12); }
  .btn:active:not(:disabled) { transform:scale(.97); }
  .btn:disabled { opacity:.5; cursor:not-allowed; }
  .badge { display:inline-flex; align-items:center; border-radius:99px; padding:2px 10px; font-size:11px; font-weight:700; }
  .skeleton { background:linear-gradient(90deg,${C.card} 25%,${C.surface} 50%,${C.card} 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
  .img-product { width:100%; height:100%; object-fit:cover; border-radius:inherit; transition:transform .3s; }
  .img-product:hover { transform:scale(1.05); }
  .upload-zone { border:2px dashed ${C.border}; border-radius:12px; padding:24px; text-align:center; cursor:pointer; transition:border-color .2s,background .2s; }
  .upload-zone:hover,.upload-zone.drag { border-color:${C.green}; background:${C.green}11; }
  [dir='rtl'] { direction:rtl; text-align:right; }
`;

// ─── COMPOSANTS UI ────────────────────────────────────────────
const Btn = ({children, color=C.green, size="md", onClick, disabled, style={}, ...p}) => {
  const pd = {sm:"6px 14px", md:"10px 22px", lg:"14px 32px"}[size]||"10px 22px";
  const fs = {sm:12, md:14, lg:16}[size]||14;
  return (
    <button className="btn" disabled={disabled} onClick={onClick}
      style={{background:disabled?"#1e3a8a55":color,color:"#fff",padding:pd,fontSize:fs,...style}} {...p}>
      {children}
    </button>
  );
};

const Inp = ({label, value, onChange, type="text", placeholder, required, hint, ...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:.5}}>
      {label}{required&&<span style={{color:C.red}}> *</span>}
    </label>}
    <input className="input-base" value={value||""} onChange={onChange}
      type={type} placeholder={placeholder} required={required} {...p}/>
    {hint&&<span style={{fontSize:11,color:C.dimmed}}>{hint}</span>}
  </div>
);

const Sel = ({label, value, onChange, options, required}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    {label&&<label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:.5}}>
      {label}{required&&<span style={{color:C.red}}> *</span>}
    </label>}
    <select className="input-base" value={value||""} onChange={onChange}>
      {options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const Spinner = ({size=24,color=C.green}) => (
  <div style={{width:size,height:size,border:`2px solid ${C.border}`,borderTopColor:color,
    borderRadius:"50%",animation:"spin .7s linear infinite",margin:"auto"}}/>
);

const Skeleton = ({w="100%",h=20,style={}}) => (
  <div className="skeleton" style={{width:w,height:h,...style}}/>
);

const Modal = ({open,onClose,title,children,size=480}) => {
  useEffect(()=>{
    const h = e=>e.key==="Escape"&&onClose();
    if(open) document.addEventListener("keydown",h);
    return()=>document.removeEventListener("keydown",h);
  },[open,onClose]);
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,zIndex:2000,animation:"fadeIn .15s"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,
        borderRadius:18,padding:28,width:"100%",maxWidth:size,maxHeight:"90vh",overflowY:"auto",animation:"fadeUp .2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <h3 style={{fontSize:18,fontWeight:800,color:C.text}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:24,cursor:"pointer"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({toasts,rm}) => (
  <div style={{position:"fixed",bottom:80,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8}}>
    {toasts.map(t=>(
      <div key={t.id} onClick={()=>rm(t.id)} style={{
        background:t.type==="ok"?C.green:t.type==="err"?C.red:t.type==="warn"?C.amber:C.navy,
        color:"#fff",padding:"12px 18px",borderRadius:12,cursor:"pointer",minWidth:260,maxWidth:340,
        fontSize:13,fontWeight:500,boxShadow:"0 4px 24px rgba(0,0,0,.5)",animation:"fadeUp .3s ease",
        display:"flex",gap:10,alignItems:"flex-start",
      }}>
        <span>{t.type==="ok"?"✓":t.type==="err"?"✕":t.type==="warn"?"⚠":"ℹ"}</span>
        <span>{t.msg}</span>
      </div>
    ))}
  </div>
);

const useToasts = () => {
  const [toasts,setT] = useState([]);
  const add = useCallback((msg,type="info")=>{
    const id=uid();
    setT(p=>[...p.slice(-4),{id,msg,type}]);
    setTimeout(()=>setT(p=>p.filter(t=>t.id!==id)),4500);
  },[]);
  const rm = useCallback(id=>setT(p=>p.filter(t=>t.id!==id)),[]);
  return {toasts,add,rm};
};

// ─── COMPOSANT IMAGE PRODUIT ──────────────────────────────────
// Affiche l'image Cloudinary avec fallback emoji + placeholder animé
const ProductImage = ({
  imageUrl, emoji="📦", alt="produit",
  width=120, height=120, style={}, className=""
}) => {
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [src, setSrc]       = useState("");

  useEffect(()=>{
    if(!imageUrl){setStatus("error");return;}
    // Construire l'URL Cloudinary optimisée
    const optimized = cloudinaryUrl(imageUrl, {w:width*2,h:height*2,crop:"fill"});
    setSrc(optimized);
    setStatus("loading");
  },[imageUrl,width,height]);

  return (
    <div style={{width,height,borderRadius:12,overflow:"hidden",
      background:C.surface,position:"relative",flexShrink:0,...style}}
      className={className}>

      {/* Skeleton pendant le chargement */}
      {status==="loading" && (
        <div className="skeleton" style={{position:"absolute",inset:0}}/>
      )}

      {/* Image Cloudinary */}
      {src && status!=="error" && (
        <img
          src={src}
          alt={alt}
          className="img-product"
          style={{opacity:status==="ok"?1:0,transition:"opacity .3s"}}
          onLoad={()=>setStatus("ok")}
          onError={()=>setStatus("error")}
        />
      )}

      {/* Fallback emoji si pas d'image ou erreur */}
      {(status==="error" || !imageUrl) && (
        <div style={{
          position:"absolute",inset:0,display:"flex",
          alignItems:"center",justifyContent:"center",
          background:`linear-gradient(135deg,${C.navyD},${C.surface})`,
          fontSize:Math.min(width,height)*0.45,
        }}>
          {emoji}
        </div>
      )}
    </div>
  );
};

// ─── UPLOAD IMAGE (avec Cloudinary) ──────────────────────────
const ImageUploader = ({onUploaded, currentUrl, label="Photo du produit"}) => {
  const [uploading, setUploading] = useState(false);
  const [drag,      setDrag]      = useState(false);
  const [preview,   setPreview]   = useState(currentUrl||"");
  const [error,     setError]     = useState("");
  const inputRef = useRef();

  const handleFile = async (file) => {
    if(!file) return;
    if(!file.type.startsWith("image/")){setError("Fichier invalide — image uniquement");return;}
    if(file.size > 10*1024*1024){setError("Image trop lourde — maximum 10 Mo");return;}
    setError("");
    // Aperçu local immédiat
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload vers Cloudinary
    setUploading(true);
    try {
      const result = await uploadToCloudinary(file, "borbi-products");
      setPreview(result.url);
      onUploaded(result);
    } catch(e) {
      setError("Échec de l'upload — vérifiez votre connexion");
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = e => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const isCloudinaryConfigured = CLOUDINARY_CONFIG.cloudName !== "VOTRE_CLOUD_NAME";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <label style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:.5}}>
        {label}
      </label>

      {/* Zone de drop */}
      <div
        className={`upload-zone${drag?" drag":""}`}
        onDrop={onDrop}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onClick={()=>inputRef.current?.click()}
      >
        {preview ? (
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <img src={preview} alt="aperçu" style={{width:80,height:80,objectFit:"cover",borderRadius:10}}/>
            <div style={{textAlign:"left"}}>
              <div style={{color:C.green,fontWeight:700,fontSize:13}}>✓ Image chargée</div>
              <div style={{color:C.muted,fontSize:11,marginTop:3}}>Cliquez pour changer</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:32,marginBottom:8}}>📷</div>
            <div style={{color:C.text,fontSize:14,fontWeight:600,marginBottom:4}}>
              {uploading ? "Upload en cours..." : "Glissez une photo ici"}
            </div>
            <div style={{color:C.muted,fontSize:12}}>ou cliquez pour choisir · JPG, PNG, WebP · max 10 Mo</div>
          </div>
        )}
        {uploading && (
          <div style={{marginTop:10}}>
            <Spinner size={20}/>
            <div style={{color:C.muted,fontSize:12,marginTop:6}}>
              Upload vers Cloudinary...
            </div>
          </div>
        )}
      </div>

      {/* Avertissement si Cloudinary pas configuré */}
      {!isCloudinaryConfigured && (
        <div style={{background:`${C.amber}15`,border:`1px solid ${C.amber}44`,borderRadius:8,padding:"8px 12px",fontSize:12,color:C.amber}}>
          ⚠️ Cloudinary non configuré — les images ne seront pas sauvegardées.<br/>
          Configurez <code>CLOUDINARY_CONFIG.cloudName</code> et <code>uploadPreset</code>.
        </div>
      )}

      {error && <div style={{color:C.red,fontSize:12}}>✕ {error}</div>}

      <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}}
        onChange={e=>handleFile(e.target.files[0])}/>
    </div>
  );
};

// ─── CATALOGUE PRODUITS MONGODB ───────────────────────────────
// Page principale d'affichage des produits avec images Cloudinary
const CatalogPage = ({lang="fr", onAddToCart}) => {
  const [products, setProducts]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");
  const [cat,      setCat]        = useState("all");
  const [showAdd,  setShowAdd]    = useState(false);
  const [seeding,  setSeeding]    = useState(false);
  const [mongoOk,  setMongoOk]    = useState(false);
  const {toasts,add:toast,rm}     = useToasts();

  // Chargement depuis MongoDB (avec fallback local)
  const loadProducts = useCallback(async () => {
    setLoading(true);
    const fromMongo = await mongoDB.getProducts();
    if(fromMongo.length > 0){
      setProducts(fromMongo);
      setMongoOk(true);
    } else {
      // Fallback : catalogue local
      setProducts(CATALOG_BASE);
      setMongoOk(false);
    }
    setLoading(false);
  },[]);

  useEffect(()=>{ loadProducts(); },[loadProducts]);

  // Initialiser le catalogue dans MongoDB
  const handleSeed = async () => {
    setSeeding(true);
    const n = await mongoDB.seedCatalog();
    if(n > 0){
      toast(`${n} produits ajoutés à MongoDB Atlas !`,"ok");
      await loadProducts();
    } else {
      toast("Catalogue déjà initialisé","warn");
    }
    setSeeding(false);
  };

  // Filtrage des produits
  const filtered = useMemo(()=>{
    return products.filter(p=>{
      const inCat  = cat==="all" || p.category===cat;
      const q      = search.toLowerCase();
      const inName = !q || p.nameFr?.toLowerCase().includes(q)
        || p.nameWolof?.toLowerCase().includes(q)
        || p.nameAr?.includes(q)
        || p.keywords?.some(k=>k.includes(q));
      return inCat && inName;
    });
  },[products,cat,search]);

  const sponsored = filtered.filter(p=>p.sponsored&&p.sponsoredActive);
  const regular   = filtered.filter(p=>!p.sponsored||!p.sponsoredActive);

  const catLabel = (c) => lang==="ar"?c.labelAr:lang==="wo"?c.labelWo:c.label;
  const prodName = (p) => lang==="ar"?(p.nameAr||p.nameFr):lang==="wo"?(p.nameWolof||p.nameFr):p.nameFr;

  return (
    <div className="page">
      <style>{CSS}</style>
      <Toast toasts={toasts} rm={rm}/>

      {/* En-tête */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22,flexWrap:"wrap"}}>
        <h1 style={{fontSize:22,fontWeight:800,flex:1}}>
          📦 {lang==="ar"?"الكتالوج":lang==="wo"?"Sa listu":"Catalogue Produits"}
        </h1>
        <div style={{display:"flex",gap:8}}>
          {!mongoOk && (
            <Btn color={C.amber} size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? <Spinner size={14}/> : "🔄 Init MongoDB"}
            </Btn>
          )}
          <Btn size="sm" onClick={()=>setShowAdd(true)}>
            + {lang==="ar"?"إضافة منتج":lang==="wo"?"Yokk jën":"Ajouter produit"}
          </Btn>
        </div>
      </div>

      {/* Statut MongoDB */}
      <div style={{marginBottom:14,padding:"8px 14px",borderRadius:8,fontSize:12,
        background:mongoOk?`${C.green}15`:`${C.amber}15`,
        border:`1px solid ${mongoOk?C.green:C.amber}44`,
        color:mongoOk?C.green:C.amber}}>
        {mongoOk
          ? `✓ MongoDB Atlas connecté — ${products.length} produits chargés`
          : `⚠ MongoDB non connecté — ${products.length} produits en local. Configurez MONGO_CONFIG.`}
      </div>

      {/* Recherche */}
      <input className="input-base" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder={lang==="ar"?"🔍 ابحث عن منتج...":lang==="wo"?"🔍 Seet jën wi...":"🔍 Rechercher un produit..."}
        style={{marginBottom:12,fontSize:15}}/>

      {/* Filtres catégories */}
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={()=>setCat("all")} style={{
          padding:"5px 14px",borderRadius:99,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
          background:cat==="all"?C.green:C.card,color:"#fff"}}>
          {lang==="ar"?"الكل":lang==="wo"?"Yëpp":"Tous"}
        </button>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} style={{
            padding:"5px 12px",borderRadius:99,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
            background:cat===c.id?C.green:C.card,color:cat===c.id?"#fff":C.muted}}>
            {c.icon} {catLabel(c).split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Skeletons pendant le chargement */}
      {loading && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14}}>
          {Array(12).fill(0).map((_,i)=>(
            <div key={i} className="card" style={{padding:12}}>
              <Skeleton h={120} style={{borderRadius:10,marginBottom:8}}/>
              <Skeleton h={14} w="80%" style={{marginBottom:6}}/>
              <Skeleton h={12} w="50%"/>
            </div>
          ))}
        </div>
      )}

      {/* Produits sponsorisés */}
      {!loading && sponsored.length>0 && (
        <div style={{marginBottom:22}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontWeight:700,fontSize:15}}>
              {lang==="ar"?"⭐ منتجات مميزة":lang==="wo"?"⭐ Jën yi gën a am solo":"⭐ Produits à la une"}
            </span>
            <span className="badge" style={{background:`${C.purple}22`,color:C.purple,border:`1px solid ${C.purple}44`}}>
              {lang==="ar"?"رعاية":lang==="wo"?"Sponsorisé":"Sponsorisé"}
            </span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
            {sponsored.map(p=>(
              <ProductCard key={p._id||p.id} product={p} lang={lang}
                sponsored onAdd={onAddToCart} prodName={prodName}/>
            ))}
          </div>
        </div>
      )}

      {/* Grille principale */}
      {!loading && (
        regular.length===0 && sponsored.length===0 ? (
          <div className="card" style={{padding:40,textAlign:"center",color:C.muted}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div>
              {lang==="ar"?"لا توجد نتائج":lang==="wo"?"Amul dara":"Aucun résultat"}
            </div>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
            {regular.map(p=>(
              <ProductCard key={p._id||p.id} product={p} lang={lang}
                onAdd={onAddToCart} prodName={prodName}/>
            ))}
          </div>
        )
      )}

      {/* Modal ajout produit */}
      <AddProductModal
        open={showAdd}
        onClose={()=>setShowAdd(false)}
        onSaved={async(product)=>{
          const id = await mongoDB.insertProduct(product);
          if(id){
            toast("Produit ajouté dans MongoDB Atlas !","ok");
            await loadProducts();
          } else {
            // Fallback local
            setProducts(p=>[...p,{...product,id:uid()}]);
            toast("Produit ajouté (local — MongoDB non connecté)","warn");
          }
          setShowAdd(false);
        }}
        lang={lang}
      />
    </div>
  );
};

// ─── CARTE PRODUIT ────────────────────────────────────────────
const ProductCard = ({product, lang, sponsored=false, onAdd, prodName}) => {
  const name  = prodName ? prodName(product) : product.nameFr;
  const price = product.price || product.defaultPrice || 0;
  const cat   = CATEGORIES.find(c=>c.id===product.category);

  return (
    <div className="card" style={{
      cursor:"pointer",transition:"transform .15s,box-shadow .15s",
      border:`1.5px solid ${sponsored?C.purple:C.border}`,
    }}
      onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 24px rgba(0,0,0,.4)`;}}
      onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>

      {/* IMAGE */}
      <div style={{position:"relative"}}>
        <ProductImage
          imageUrl={product.imageUrl}
          emoji={cat?.icon||"📦"}
          alt={name}
          width={160} height={130}
          style={{borderRadius:"12px 12px 0 0",width:"100%",height:130}}
        />
        {sponsored && (
          <div style={{position:"absolute",top:6,left:6,
            background:C.purple,color:"#fff",fontSize:9,fontWeight:800,
            padding:"2px 7px",borderRadius:99,letterSpacing:.3}}>
            ⭐ {lang==="ar"?"مميز":lang==="wo"?"Gën a gis":"UNE"}
          </div>
        )}
        {product.brand && (
          <div style={{position:"absolute",bottom:6,right:6,
            background:"rgba(0,0,0,.7)",color:"#fff",fontSize:9,
            padding:"2px 6px",borderRadius:6}}>
            {product.brand}
          </div>
        )}
      </div>

      {/* INFOS */}
      <div style={{padding:"10px 10px 12px"}}>
        <div style={{fontWeight:700,fontSize:13,color:C.text,lineHeight:1.3,marginBottom:4,
          overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
          WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
          {name}
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
          {cat?.icon} {lang==="ar"?cat?.labelAr:lang==="wo"?cat?.labelWo:cat?.label}
          {" · "}/{product.unit}
        </div>
        <div style={{fontWeight:800,fontSize:15,color:C.green,marginBottom:8}}>
          {fmt(price)}
        </div>
        {onAdd && (
          <button onClick={()=>onAdd(product)} style={{
            width:"100%",padding:"6px",borderRadius:8,border:"none",
            background:`${C.green}22`,color:C.green,cursor:"pointer",
            fontWeight:700,fontSize:12,transition:"background .15s"}}
            onMouseOver={e=>e.target.style.background=`${C.green}44`}
            onMouseOut={e=>e.target.style.background=`${C.green}22`}>
            + {lang==="ar"?"أضف":lang==="wo"?"Yokk":"Ajouter"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── MODAL AJOUT PRODUIT ──────────────────────────────────────
const AddProductModal = ({open, onClose, onSaved, lang}) => {
  const [form, setForm] = useState({
    nameFr:"", nameWolof:"", nameAr:"",
    category:"epicerie", unit:"kg", price:"",
    brand:"", imageUrl:"", imagePublicId:"",
    sponsored:false, sponsoredActive:false, sponsoredOrder:1,
    keywords:[],
  });
  const [saving, setSaving] = useState(false);
  const up = k => e => setForm(p=>({...p,[k]:typeof e==="string"?e:e.target.value}));

  const handleSave = async () => {
    if(!form.nameFr||!form.price){return;}
    setSaving(true);
    const product = {
      ...form,
      price:      Math.round(parseFloat(form.price)*100),
      keywords:   [form.nameFr,form.nameWolof,form.nameAr].filter(Boolean).map(s=>s.toLowerCase()),
      createdAt:  now(),
      updatedAt:  now(),
    };
    await onSaved(product);
    setSaving(false);
    setForm({nameFr:"",nameWolof:"",nameAr:"",category:"epicerie",unit:"kg",
      price:"",brand:"",imageUrl:"",imagePublicId:"",sponsored:false,
      sponsoredActive:false,sponsoredOrder:1,keywords:[]});
  };

  return (
    <Modal open={open} onClose={onClose} title={
      lang==="ar"?"إضافة منتج جديد":lang==="wo"?"Yokk jën bu bees":"Ajouter un produit"
    } size={600}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>

        {/* UPLOAD IMAGE */}
        <ImageUploader
          currentUrl={form.imageUrl}
          label={lang==="ar"?"صورة المنتج":lang==="wo"?"Tele u jën wi":"Photo du produit"}
          onUploaded={result=>{
            setForm(p=>({...p, imageUrl:result.url, imagePublicId:result.publicId}));
          }}
        />

        {/* Aperçu si image uploadée */}
        {form.imageUrl && (
          <div style={{display:"flex",alignItems:"center",gap:12,padding:12,
            background:C.bg,borderRadius:10}}>
            <ProductImage imageUrl={form.imageUrl} alt="aperçu"
              width={80} height={80} style={{borderRadius:8}}/>
            <div>
              <div style={{color:C.green,fontSize:13,fontWeight:700}}>✓ Image enregistrée sur Cloudinary</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2,wordBreak:"break-all"}}>{form.imageUrl.slice(0,60)}...</div>
            </div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Nom français *" required value={form.nameFr} onChange={up("nameFr")}/>
          <Inp label="Nom wolof" value={form.nameWolof} onChange={up("nameWolof")}/>
        </div>

        <Inp label="Nom arabe — اسم بالعربية" value={form.nameAr} onChange={up("nameAr")}/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <Sel label="Catégorie" required value={form.category} onChange={up("category")}
            options={CATEGORIES.map(c=>({v:c.id,l:`${c.icon} ${c.label}`}))}/>
          <Inp label="Unité" value={form.unit} onChange={up("unit")} placeholder="kg / pièce / L"/>
          <Inp label="Prix (FCFA) *" required type="number" value={form.price} onChange={up("price")}/>
        </div>

        <Inp label="Marque / Brand" value={form.brand} onChange={up("brand")} placeholder="Ex: Kirène, Maggi..."/>

        <div style={{background:C.bg,borderRadius:10,padding:14}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:C.text}}>⭐ Mise en avant (vitrine)</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.muted}}>
              <input type="checkbox" checked={form.sponsored}
                onChange={e=>setForm(p=>({...p,sponsored:e.target.checked}))}/>
              Produit sponsorisé
            </label>
            {form.sponsored && (
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.muted}}>
                <input type="checkbox" checked={form.sponsoredActive}
                  onChange={e=>setForm(p=>({...p,sponsoredActive:e.target.checked}))}/>
                Actif sur la vitrine
              </label>
            )}
            {form.sponsored && (
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:12,color:C.muted}}>Ordre:</span>
                <input type="number" value={form.sponsoredOrder}
                  onChange={e=>setForm(p=>({...p,sponsoredOrder:parseInt(e.target.value)||1}))}
                  style={{width:55,background:C.card,border:`1px solid ${C.border}`,
                    borderRadius:6,padding:"4px 8px",color:C.text,fontSize:12,outline:"none"}}/>
              </div>
            )}
          </div>
        </div>

        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn color={C.surface} onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave} disabled={saving||!form.nameFr||!form.price}>
            {saving?<Spinner size={16}/>:"💾 Enregistrer dans MongoDB"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─── GESTIONNAIRE D'IMAGES (page admin) ──────────────────────
const ImageManager = ({lang="fr"}) => {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(null);
  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const {toasts,add:toast,rm}     = useToasts();

  useEffect(()=>{
    const load = async () => {
      setLoading(true);
      const p = await mongoDB.getProducts();
      setProducts(p.length>0 ? p : CATALOG_BASE);
      setLoading(false);
    };
    load();
  },[]);

  const filtered = products.filter(p=>
    !search || p.nameFr?.toLowerCase().includes(search.toLowerCase())
  );

  const updateImage = async (product, result) => {
    setSaving(true);
    if(product._id){
      // Produit MongoDB réel
      await mongoDB.updateProduct(product._id.$oid||product._id, {
        imageUrl:      result.url,
        imagePublicId: result.publicId,
      });
      setProducts(ps=>ps.map(p=>
        (p._id===product._id)?{...p,imageUrl:result.url,imagePublicId:result.publicId}:p
      ));
      toast(`Image mise à jour pour "${product.nameFr}"`,"ok");
    } else {
      toast("Produit en mode local — connectez MongoDB pour sauvegarder","warn");
    }
    setSaving(false);
    setEditing(null);
  };

  const stats = {
    total:     products.length,
    avecImage: products.filter(p=>p.imageUrl).length,
    sansImage: products.filter(p=>!p.imageUrl).length,
  };

  return (
    <div className="page">
      <Toast toasts={toasts} rm={rm}/>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:8}}>🖼️ Gestionnaire d'images</h1>
      <p style={{color:C.muted,fontSize:14,marginBottom:20}}>
        Gérez les photos de tous vos produits. Les images sont stockées sur Cloudinary et référencées dans MongoDB Atlas.
      </p>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          {l:"Total produits",v:stats.total,c:C.navy},
          {l:"Avec image ✓",  v:stats.avecImage,c:C.green},
          {l:"Sans image ⚠",  v:stats.sansImage,c:C.amber},
        ].map(s=>(
          <div key={s.l} className="card" style={{padding:"14px 16px",borderLeft:`3px solid ${s.c}`}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:900,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Guide rapide */}
      <div style={{background:`${C.purple}11`,border:`1px solid ${C.purple}33`,
        borderRadius:10,padding:16,marginBottom:20,fontSize:13,color:C.muted}}>
        <div style={{fontWeight:700,color:C.purple,marginBottom:8}}>📋 Comment ajouter des images</div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {[
            "1. Cliquez sur le bouton 📷 à côté d'un produit",
            "2. Glissez une photo ou cliquez pour choisir (JPG, PNG, WebP — max 10 Mo)",
            "3. L'image est automatiquement uploadée vers Cloudinary",
            "4. L'URL est sauvegardée dans MongoDB Atlas",
            "5. L'image apparaît instantanément dans toute l'application"
          ].map((t,i)=><div key={i}>{t}</div>)}
        </div>
      </div>

      <input className="input-base" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="🔍 Rechercher un produit..." style={{marginBottom:14}}/>

      {loading ? (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {Array(8).fill(0).map((_,i)=><Skeleton key={i} h={60}/>)}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtered.map(p=>{
            const cat = CATEGORIES.find(c=>c.id===p.category);
            const isEditing = editing?._id===p._id||editing?.id===p.id;
            return (
              <div key={p._id||p.id} className="card" style={{padding:"12px 16px"}}>
                {isEditing ? (
                  // MODE ÉDITION
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <ProductImage imageUrl={p.imageUrl} emoji={cat?.icon||"📦"}
                        width={50} height={50} style={{borderRadius:8,flexShrink:0}}/>
                      <div style={{fontWeight:700,color:C.text}}>{p.nameFr}</div>
                      <Btn color={C.surface} size="sm" onClick={()=>setEditing(null)} style={{marginLeft:"auto"}}>
                        ✗ Annuler
                      </Btn>
                    </div>
                    <ImageUploader
                      currentUrl={p.imageUrl}
                      label=""
                      onUploaded={result=>updateImage(p,result)}
                    />
                    {saving && <div style={{display:"flex",alignItems:"center",gap:8,color:C.muted,fontSize:13}}>
                      <Spinner size={16}/> Sauvegarde dans MongoDB...
                    </div>}
                  </div>
                ) : (
                  // MODE LISTE
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    {/* Miniature */}
                    <ProductImage imageUrl={p.imageUrl} emoji={cat?.icon||"📦"}
                      width={54} height={54} style={{borderRadius:8,flexShrink:0}}/>

                    {/* Infos */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,color:C.text,fontSize:14,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nameFr}</div>
                      <div style={{fontSize:11,color:C.muted}}>{cat?.icon} {cat?.label} · {fmt(p.price||p.defaultPrice||0)}</div>
                      {p.imageUrl
                        ? <div style={{fontSize:10,color:C.green}}>✓ Image Cloudinary</div>
                        : <div style={{fontSize:10,color:C.amber}}>⚠ Pas d'image — emoji affiché</div>}
                    </div>

                    {/* Bouton edit */}
                    <Btn size="sm" color={p.imageUrl?C.navy:C.amber}
                      onClick={()=>setEditing(p)}>
                      📷 {p.imageUrl?"Changer":"Ajouter"}
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── PAGE DE CONFIGURATION ────────────────────────────────────
const ConfigPage = () => {
  const [mongoUrl,    setMongoUrl]    = useState(MONGO_CONFIG.dataApiUrl);
  const [mongoKey,    setMongoKey]    = useState(MONGO_CONFIG.apiKey);
  const [mongoDb,     setMongoDb]     = useState(MONGO_CONFIG.database);
  const [mongoSource, setMongoSource] = useState(MONGO_CONFIG.dataSource);
  const [cloudName,   setCloudName]   = useState(CLOUDINARY_CONFIG.cloudName);
  const [cloudPreset, setCloudPreset] = useState(CLOUDINARY_CONFIG.uploadPreset);
  const [testResult,  setTestResult]  = useState("");
  const [testing,     setTesting]     = useState(false);

  const testMongo = async () => {
    setTesting(true);
    setTestResult("");
    // Appliquer les configs temporairement
    MONGO_CONFIG.dataApiUrl  = mongoUrl;
    MONGO_CONFIG.apiKey      = mongoKey;
    MONGO_CONFIG.database    = mongoDb;
    MONGO_CONFIG.dataSource  = mongoSource;
    CLOUDINARY_CONFIG.cloudName    = cloudName;
    CLOUDINARY_CONFIG.uploadPreset = cloudPreset;

    const products = await mongoDB.getProducts();
    if(products!==null){
      setTestResult(`✓ MongoDB OK — ${products.length} produits trouvés dans la collection "products"`);
    } else {
      setTestResult("✕ Connexion échouée — vérifiez l'URL, la clé API et le nom du cluster");
    }
    setTesting(false);
  };

  const saveConfig = () => {
    MONGO_CONFIG.dataApiUrl  = mongoUrl;
    MONGO_CONFIG.apiKey      = mongoKey;
    MONGO_CONFIG.database    = mongoDb;
    MONGO_CONFIG.dataSource  = mongoSource;
    CLOUDINARY_CONFIG.cloudName    = cloudName;
    CLOUDINARY_CONFIG.uploadPreset = cloudPreset;
    LS.set("borbi_config", {mongoUrl,mongoKey,mongoDb,mongoSource,cloudName,cloudPreset});
    alert("Configuration sauvegardée !");
  };

  useEffect(()=>{
    const saved = LS.get("borbi_config",null);
    if(saved){
      setMongoUrl(saved.mongoUrl||mongoUrl);
      setMongoKey(saved.mongoKey||mongoKey);
      setMongoDb(saved.mongoDb||mongoDb);
      setMongoSource(saved.mongoSource||mongoSource);
      setCloudName(saved.cloudName||cloudName);
      setCloudPreset(saved.cloudPreset||cloudPreset);
    }
  },[]);

  return (
    <div className="page">
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:22}}>⚙️ Configuration MongoDB & Cloudinary</h1>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

        {/* MongoDB */}
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:16,color:C.text}}>
            🍃 MongoDB Atlas
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontSize:12,color:C.muted,fontWeight:600,marginBottom:4}}>ÉTAPE 1 — Activez la Data API</div>
              <div style={{fontSize:12,color:C.dimmed,lineHeight:1.6}}>
                Dans Atlas → <b style={{color:C.text}}>Data API</b> → Enable<br/>
                Copiez l'URL et créez une clé API.
              </div>
            </div>
            <Inp label="Data API URL" value={mongoUrl} onChange={e=>setMongoUrl(e.target.value)}
              placeholder="https://data.mongodb-api.com/app/data-xxx/endpoint/data/v1"/>
            <Inp label="Clé API" value={mongoKey} onChange={e=>setMongoKey(e.target.value)}
              placeholder="Votre clé API Atlas" type="password"/>
            <Inp label="Nom du cluster" value={mongoSource} onChange={e=>setMongoSource(e.target.value)}
              placeholder="Cluster0"/>
            <Inp label="Nom de la base de données" value={mongoDb} onChange={e=>setMongoDb(e.target.value)}
              placeholder="borbi_db"/>
          </div>
        </div>

        {/* Cloudinary */}
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:800,fontSize:16,marginBottom:16,color:C.text}}>
            ☁️ Cloudinary (images)
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontSize:12,color:C.muted,fontWeight:600,marginBottom:4}}>ÉTAPE 1 — Créez un compte gratuit</div>
              <div style={{fontSize:12,color:C.dimmed,lineHeight:1.6}}>
                Allez sur <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{color:C.green}}>cloudinary.com</a> → Inscription gratuite<br/>
                <b style={{color:C.text}}>Settings → Upload → Add upload preset</b><br/>
                Signing mode : <b style={{color:C.green}}>Unsigned</b>
              </div>
            </div>
            <Inp label="Cloud Name" value={cloudName} onChange={e=>setCloudName(e.target.value)}
              placeholder="votre-cloud-name"/>
            <Inp label="Upload Preset (unsigned)" value={cloudPreset} onChange={e=>setCloudPreset(e.target.value)}
              placeholder="borbi_upload"/>
            <div style={{background:C.bg,borderRadius:8,padding:10,fontSize:12,color:C.dimmed}}>
              <div style={{fontWeight:700,color:C.text,marginBottom:6}}>Paramètres recommandés du preset :</div>
              <div>• Signing mode : <b style={{color:C.green}}>Unsigned</b></div>
              <div>• Folder : <b style={{color:C.green}}>borbi-products</b></div>
              <div>• Quality : <b style={{color:C.green}}>auto</b></div>
              <div>• Format : <b style={{color:C.green}}>auto (WebP)</b></div>
              <div>• Max file size : <b style={{color:C.green}}>10 MB</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap"}}>
        <Btn onClick={testMongo} disabled={testing}>
          {testing?<Spinner size={16}/>:"🔌 Tester la connexion MongoDB"}
        </Btn>
        <Btn color={C.navy} onClick={saveConfig}>💾 Sauvegarder la configuration</Btn>
      </div>

      {testResult && (
        <div style={{marginTop:14,padding:"12px 16px",borderRadius:10,fontSize:13,
          background:testResult.startsWith("✓")?`${C.green}15`:`${C.red}15`,
          border:`1px solid ${testResult.startsWith("✓")?C.green:C.red}44`,
          color:testResult.startsWith("✓")?C.green:C.red}}>
          {testResult}
        </div>
      )}

      {/* Schéma MongoDB */}
      <div className="card" style={{padding:20,marginTop:20}}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:14,color:C.text}}>
          📋 Schéma MongoDB — Collection "products"
        </div>
        <pre style={{background:C.bg,borderRadius:10,padding:14,fontSize:12,
          color:C.green,overflowX:"auto",lineHeight:1.7}}>
{`{
  "_id":            ObjectId,          // Généré par MongoDB
  "nameFr":         "Pain baguette",   // Nom en français
  "nameWolof":      "Pain baguette",   // Nom en wolof
  "nameAr":         "خبز الباغيت",     // Nom en arabe
  "category":       "boulangerie",     // Catégorie
  "unit":           "pièce",           // Unité de vente
  "price":          20000,             // Prix en centimes (FCFA)
  "brand":          "BoulangerieDakar",// Marque (optionnel)
  "keywords":       ["pain","baguette"], // Pour la recherche
  "imageUrl":       "https://res.cloudinary.com/votre-cloud/...",
  "imagePublicId":  "borbi-products/xyz123", // ID Cloudinary
  "sponsored":      false,             // Produit sponsorisé
  "sponsoredActive":false,             // Visible sur vitrine
  "sponsoredOrder": null,              // Ordre d'affichage
  "createdAt":      ISODate,
  "updatedAt":      ISODate
}`}
        </pre>
      </div>

      {/* Initialiser le catalogue */}
      <div className="card" style={{padding:20,marginTop:16}}>
        <div style={{fontWeight:800,fontSize:15,marginBottom:10,color:C.text}}>
          🌱 Initialiser le catalogue dans MongoDB
        </div>
        <div style={{fontSize:13,color:C.muted,marginBottom:14}}>
          Insère les {CATALOG_BASE.length} produits de base dans votre collection MongoDB.
          À faire une seule fois après la configuration.
        </div>
        <Btn color={C.purple} onClick={async()=>{
          const n = await mongoDB.seedCatalog();
          alert(n>0 ? `✓ ${n} produits insérés dans MongoDB !` : "Collection déjà initialisée.");
        }}>
          🌱 Lancer le seeding ({CATALOG_BASE.length} produits)
        </Btn>
      </div>
    </div>
  );
};

// ─── APPLICATION PRINCIPALE ───────────────────────────────────
export default function BorBiImages() {
  const [tab,  setTab]  = useState("catalog");
  const [lang, setLang] = useState("fr");
  const [cart, setCart] = useState([]);

  const addToCart = useCallback(p=>{
    setCart(c=>{
      const ex = c.find(i=>(i._id||i.id)===(p._id||p.id));
      if(ex) return c.map(i=>(i._id||i.id)===(p._id||p.id)?{...i,qty:i.qty+1}:i);
      return [...c,{...p,qty:1}];
    });
  },[]);

  const tabs = [
    {id:"catalog",  icon:"📦", label:"Catalogue"},
    {id:"images",   icon:"🖼️", label:"Gérer images"},
    {id:"config",   icon:"⚙️", label:"Configuration"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif"}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:"12px 24px",display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:100}}>
        <div>
          <span style={{fontSize:20,fontWeight:900,letterSpacing:-1}}>
            <span style={{color:C.green}}>Bor</span>-Bi
          </span>
          <span style={{fontSize:10,color:C.dimmed,marginLeft:8}}>Images & MongoDB</span>
        </div>

        {/* Onglets */}
        <div style={{display:"flex",gap:4,flex:1,justifyContent:"center"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"7px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
              background:tab===t.id?C.green:C.card,color:"#fff",transition:"all .15s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Langue + Panier */}
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {["fr","wo","ar"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{
              padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",fontSize:11,
              background:lang===l?C.green:C.card,color:"#fff",fontWeight:lang===l?700:400}}>
              {l.toUpperCase()}
            </button>
          ))}
          {cart.length>0 && (
            <div style={{background:C.navy,borderRadius:10,padding:"6px 12px",
              display:"flex",alignItems:"center",gap:6,fontSize:13,color:C.text}}>
              🛒 {cart.reduce((s,i)=>s+i.qty,0)} article(s)
            </div>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:24}}>
        {tab==="catalog" && <CatalogPage lang={lang} onAddToCart={addToCart}/>}
        {tab==="images"  && <ImageManager lang={lang}/>}
        {tab==="config"  && <ConfigPage/>}
      </div>
    </div>
  );
}
