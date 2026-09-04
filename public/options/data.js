// Fælles data og kort-rendering for de tre designforslag.
// Forsidebillederne er simple SVG-illustrationer i hvert forslags farver —
// ingen fotos, så det ser ens og roligt ud.
const GUIDES = [
  { n:1, tag:'Start here', min:6,  t:'What is AI, actually? A plain-English answer',
    d:'Forget the movies and the headlines. Here\'s what today\'s AI really is, how it works in everyday terms, and why it sometimes feels like magic.' },
  { n:2, tag:'Getting started', min:8, t:'Your first conversation with an AI, step by step',
    d:'A calm, click-by-click walkthrough of trying an AI chatbot for the first time — free, safe, and with nothing to install.' },
  { n:3, tag:'Safety', min:7, t:'Is it safe? What happens to the things you type',
    d:'Where your words go when you talk to an AI, what to keep to yourself, and simple habits that keep you in control.' },
  { n:4, tag:'Judgement', min:6, t:'How to tell when AI is wrong (because sometimes it is)',
    d:'AI answers with total confidence even when it\'s mistaken. Here\'s why that happens and the simple habits that protect you.' },
  { n:5, tag:'Everyday use', min:9, t:'Ten everyday things AI can genuinely help you with',
    d:'Not futuristic promises — practical, tested uses for AI in ordinary life, each with an example you can copy and try today.' },
];

// Motiver pr. guide: enkle geometriske former, ét pr. emne
const MOTIF = [
  '<circle cx="230" cy="95" r="46" fill="C2"/><circle cx="230" cy="95" r="18" fill="C1"/>',
  '<rect x="150" y="60" width="150" height="46" rx="23" fill="C2"/><rect x="190" y="118" width="110" height="40" rx="20" fill="C1" opacity=".55"/>',
  '<path d="M230 45l52 20v40c0 34-22 60-52 72-30-12-52-38-52-72V65z" fill="C2"/><path d="M212 108l14 14 26-30" stroke="C1" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  '<circle cx="230" cy="100" r="50" fill="C2"/><path d="M230 72v34" stroke="C1" stroke-width="9" stroke-linecap="round"/><circle cx="230" cy="126" r="6" fill="C1"/>',
  '<rect x="160" y="60" width="38" height="38" rx="9" fill="C2"/><rect x="211" y="60" width="38" height="38" rx="9" fill="C2"/><rect x="262" y="60" width="38" height="38" rx="9" fill="C2"/><rect x="160" y="111" width="38" height="38" rx="9" fill="C2" opacity=".6"/><rect x="211" y="111" width="38" height="38" rx="9" fill="C1"/><rect x="262" y="111" width="38" height="38" rx="9" fill="C2" opacity=".6"/>',
];

// cover(i, {bg1,bg2,c1,c2,num}) -> SVG-streng i 16:10
function cover(i, p) {
  const m = MOTIF[i].replaceAll('C1', p.c1).replaceAll('C2', p.c2);
  return `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
    <defs><linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg1}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient></defs>
    <rect width="320" height="200" fill="url(#g${i})"/>
    ${m}
    <text x="28" y="160" font-family="Poppins,sans-serif" font-weight="700" font-size="84" fill="${p.num}">${i+1}</text>
  </svg>`;
}

function renderA() {
  const pal = { bg1:'#e9f2ec', bg2:'#d3e6da', c1:'#1f6b48', c2:'#a9d3bb', num:'#1f6b48' };
  document.getElementById('grid').innerHTML = GUIDES.map((g,i)=>`
    <a class="card" href="#">
      <span class="cover">${cover(i,pal)}</span>
      <span class="tag">${g.tag}</span>
      <h3>${g.t}</h3>
      <p>${g.d}</p>
      <div class="meta"><span class="dot">✓</span> Reviewed by a person · ${g.min} min read</div>
    </a>`).join('');
}

function renderB() {
  const pals = [
    { bg1:'#ffe7c2', bg2:'#ffd08a', c1:'#16273d', c2:'#f2a33c', num:'#16273d' },
    { bg1:'#d5efeb', bg2:'#a8ddd5', c1:'#16273d', c2:'#2a9d8f', num:'#16273d' },
  ];
  document.getElementById('grid').innerHTML = GUIDES.map((g,i)=>`
    <a class="card" href="#">
      <span class="cover">${cover(i,pals[i%2])}</span>
      <div class="body">
        <span class="tag">${g.tag}</span>
        <h3>${g.t}</h3>
        <p>${g.d}</p>
        <span class="more">Read the guide →</span>
      </div>
    </a>`).join('');
}

function renderC() {
  const pal = { bg1:'#f3f4f6', bg2:'#e5e7eb', c1:'#0f766e', c2:'#99d1cb', num:'#111827' };
  document.getElementById('grid').innerHTML = GUIDES.map((g,i)=>`
    <a class="card" href="#">
      <span class="cover">${cover(i,pal)}</span>
      <div class="body">
        <div class="kicker">${g.tag} · ${g.min} min</div>
        <h3>${g.t}</h3>
        <p>${g.d}</p>
      </div>
    </a>`).join('');
}
