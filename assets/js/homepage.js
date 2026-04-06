document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const copyEmailButton = document.getElementById('copyEmailButton');
const copyToast = document.getElementById('copyToast');
let copyToastTimeout = null;

function showCopyToast() {
  if (!copyToast) return;

  copyToast.classList.add('is-visible');
  if (copyToastTimeout) {
    clearTimeout(copyToastTimeout);
  }

  copyToastTimeout = setTimeout(() => {
    copyToast.classList.remove('is-visible');
  }, 1800);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fall through to the legacy copy path below.
    }
  }

  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  tempInput.setAttribute('readonly', '');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';
  document.body.appendChild(tempInput);
  tempInput.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(tempInput);
  return copied;
}

if (copyEmailButton) {
  copyEmailButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = copyEmailButton.getAttribute('data-copy-email');
    if (!email) return;

    try {
      const copied = await copyTextToClipboard(email);
      if (copied) {
        showCopyToast();
        return;
      }

      window.location.href = copyEmailButton.href;
    } catch (error) {
      window.location.href = copyEmailButton.href;
    }
  });
}

const langToggleButton = document.getElementById('langToggleButton');
const metaDescription = document.querySelector('meta[name="description"]');

const translations = {
  en: {
    'meta.description': 'Simulation, embedded systems and technical software for high-performance engineering challenges.',
    'nav.services': 'Services',
    'nav.experiences': 'Experiences',
    'nav.material': 'Material',
    'nav.software': 'Common Software',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'hero.title': 'Engineering complex systems. From physics to code.',
    'hero.description': 'Simulation, embedded systems and technical software for high-performance engineering challenges. Built for startups, R&D teams and industrial projects requiring rigorous execution.',
    'hero.cta.contact': 'Get in touch',
    'hero.cta.services': 'View services',
    'hero.badge.one': 'Gradient fields • system dynamics',
    'hero.badge.two': 'Simulation • control • software',
    'services.title': 'Services',
    'services.description': 'Focused engineering support across simulation, embedded systems, technical software, data and AI.',
    'services.card1.title': 'Simulation & Thermal Engineering',
    'services.card1.description': 'Physics-based analysis for systems under thermal, aerodynamic or multiphysical constraints.',
    'services.card1.item1': 'CFD studies',
    'services.card1.item2': 'Heat transfer analysis',
    'services.card1.item3': 'Performance optimization',
    'services.card2.title': 'Embedded, Control & Technical Software',
    'services.card2.description': 'End-to-end technical development from control architecture to robust scientific tooling for engineering teams.',
    'services.card2.item1': 'Embedded development',
    'services.card2.item2': 'Control architecture',
    'services.card2.item3': 'Python & C++ engineering tools',
    'services.card3.title': 'Data Engineering & AI for R&D',
    'services.card3.description': 'Data-driven methods to model complex phenomena, analyze experiments and accelerate technical decision-making.',
    'services.card3.item1': 'Multiscale data analysis',
    'services.card3.item2': 'Predictive modeling workflows',
    'services.card3.item3': 'Big Data & applied AI pipelines',
    'experiences.title': 'Selected experience',
    'experiences.description': 'A background combining aerospace engineering, applied research and technical product development.',
    'experiences.card1.title': 'Thermal optimization under high power-density constraints',
    'experiences.card1.description': 'Engineering work focused on thermal behavior, constrained performance and embedded systems for drone automation.',
    'experiences.card2.title': 'Wireless power transmitter prototype',
    'experiences.card2.description': 'Multiphysical modeling, system optimization and software for control and data analysis in an R&D context.',
    'experiences.card3.title': 'Autonomous VTOL flying wing concept',
    'experiences.card3.description': 'Design of an autonomous flying wing capable of carrying a secondary UAV for dedicated mission scenarios.',
    'material.title': 'Prototyping Lab',
    'material.description': 'Core hardware available for fast iterations, electronics validation and physical prototyping.',
    'material.card1.title': '3D Printing',
    'material.card1.description': 'Fast fabrication of functional parts for mechanical integration, enclosure tests and iterative design.',
    'material.card2.title': '2-Channel Lab Oscilloscope',
    'material.card2.description': 'Measurement and debugging of analog and digital signals for embedded and power electronics work.',
    'material.card3.title': 'Adjustable Voltage Supply',
    'material.card3.description': 'Stable DC power source for prototyping, characterization and controlled bench validation.',
    'software.title': 'Software',
    'software.description': 'Stack software used in design, simulation and electronics workflows.',
    'about.title': 'About',
    'about.description': 'del·dynamics is built around a simple idea: high-level engineering should remain readable, rigorous and actionable.',
    'about.card.title': 'Background',
    'about.card.description': 'Engineer specialized in simulation, embedded systems and technical software development, with experience in aerospace, applied research and complex system design.',
    'about.card.note': 'The positioning is intentionally focused: physics-based reasoning, technical clarity and execution that can support real engineering teams.',
    'about.stat1.title': 'Simulation',
    'about.stat1.description': 'CFD, thermal analysis, multiphysical reasoning',
    'about.stat2.title': 'Systems',
    'about.stat2.description': 'Embedded development, automation, control logic',
    'about.stat3.title': 'Software',
    'about.stat3.description': 'Big data analysis, machine learning, applied mathematics',
    'contact.title': 'Let’s discuss your project.',
    'contact.description': 'Whether you need support on simulation, control systems or technical software, the first step is a clear conversation around scope, constraints and expected outcomes.',
    'contact.button.mail': 'Mail',
    'contact.button.linkedin': 'LinkedIn',
    'contact.copyToast': 'Copied in clipboard',
    'contact.details.title': 'Contact details',
    'contact.details.item1': 'Paris, France',
    'contact.details.item2': 'Hybrid / remote collaboration',
    'contact.details.item3': 'Projects for startups, R&D teams and industrial engineering needs'
  },
  fr: {
    'meta.description': 'Simulation, systemes embarques et logiciels techniques pour des defis d ingenierie haute performance.',
    'nav.services': 'Services',
    'nav.experiences': 'Experiences',
    'nav.material': 'Materiel',
    'nav.software': 'Logiciels',
    'nav.about': 'A propos',
    'nav.contact': 'Contact',
    'hero.title': 'Ingenierie des systemes complexes. De la physique au code.',
    'hero.description': 'Simulation, systemes embarques et logiciels techniques pour des defis d ingenierie haute performance. Concu pour les startups, les equipes R&D et les projets industriels exigeants.',
    'hero.cta.contact': 'Me contacter',
    'hero.cta.services': 'Voir les services',
    'hero.badge.one': 'Champs de gradient • dynamique des systemes',
    'hero.badge.two': 'Simulation • controle • logiciel',
    'services.title': 'Services',
    'services.description': 'Support d ingenierie cible en simulation, systemes embarques, logiciels techniques, data et IA.',
    'services.card1.title': 'Simulation et ingenierie thermique',
    'services.card1.description': 'Analyses basees sur la physique pour des systemes soumis a des contraintes thermiques, aerodynamiques ou multiphysiques.',
    'services.card1.item1': 'Etudes CFD',
    'services.card1.item2': 'Analyse de transfert thermique',
    'services.card1.item3': 'Optimisation des performances',
    'services.card2.title': 'Embarque, controle et logiciel technique',
    'services.card2.description': 'Developpement technique de bout en bout, de l architecture de controle aux outils scientifiques robustes pour les equipes d ingenierie.',
    'services.card2.item1': 'Developpement embarque',
    'services.card2.item2': 'Architecture de controle',
    'services.card2.item3': 'Outils d ingenierie Python et C++',
    'services.card3.title': 'Data engineering et IA pour la R&D',
    'services.card3.description': 'Methodes orientees donnees pour modeliser des phenomenes complexes, analyser des essais et accelerer les decisions techniques.',
    'services.card3.item1': 'Analyse de donnees multi-echelles',
    'services.card3.item2': 'Workflows de modelisation predictive',
    'services.card3.item3': 'Pipelines Big Data et IA appliquee',
    'experiences.title': 'Experiences selectionnees',
    'experiences.description': 'Un parcours a la croisee de l ingenierie aerospatiale, de la recherche appliquee et du developpement produit technique.',
    'experiences.card1.title': 'Optimisation thermique sous fortes contraintes de densite de puissance',
    'experiences.card1.description': 'Travaux d ingenierie axes sur le comportement thermique, la performance sous contraintes et les systemes embarques pour l automatisation de drones.',
    'experiences.card2.title': 'Prototype de transmetteur d energie sans fil',
    'experiences.card2.description': 'Modelisation multiphysique, optimisation systeme et logiciels de controle et d analyse de donnees en contexte R&D.',
    'experiences.card3.title': 'Concept d aile volante VTOL autonome',
    'experiences.card3.description': 'Conception d une aile volante autonome capable d embarquer un drone secondaire pour des missions dediees.',
    'material.title': 'Laboratoire de prototypage',
    'material.description': 'Materiel de base disponible pour des iterations rapides, la validation electronique et le prototypage physique.',
    'material.card1.title': 'Impression 3D',
    'material.card1.description': 'Fabrication rapide de pieces fonctionnelles pour l integration mecanique, les tests de boitiers et la conception iterative.',
    'material.card2.title': 'Oscilloscope de laboratoire 2 voies',
    'material.card2.description': 'Mesure et debogage de signaux analogiques et numeriques pour l embarque et l electronique de puissance.',
    'material.card3.title': 'Alimentation a tension reglable',
    'material.card3.description': 'Source d alimentation DC stable pour le prototypage, la caracterisation et la validation sur banc.',
    'software.title': 'Logiciels',
    'software.description': 'Pile logicielle utilisee pour la conception, la simulation et les workflows electroniques.',
    'about.title': 'A propos',
    'about.description': 'del·dynamics repose sur une idee simple : une ingenierie de haut niveau doit rester lisible, rigoureuse et actionnable.',
    'about.card.title': 'Parcours',
    'about.card.description': 'Ingenieur specialise en simulation, systemes embarques et developpement de logiciels techniques, avec une experience en aerospatial, recherche appliquee et conception de systemes complexes.',
    'about.card.note': 'Le positionnement est volontairement cible : raisonnement physique, clarte technique et execution au service d equipes d ingenierie reelles.',
    'about.stat1.title': 'Simulation',
    'about.stat1.description': 'CFD, analyse thermique, raisonnement multiphysique',
    'about.stat2.title': 'Systemes',
    'about.stat2.description': 'Developpement embarque, automatisation, logique de controle',
    'about.stat3.title': 'Logiciel',
    'about.stat3.description': 'Analyse Big Data, machine learning, mathematiques appliquees',
    'contact.title': 'Discutons de votre projet.',
    'contact.description': 'Que vous ayez besoin de support en simulation, systemes de controle ou logiciels techniques, la premiere etape est un echange clair sur le scope, les contraintes et les resultats attendus.',
    'contact.button.mail': 'Mail',
    'contact.button.linkedin': 'LinkedIn',
    'contact.copyToast': 'Copie dans le presse-papiers',
    'contact.details.title': 'Coordonnees',
    'contact.details.item1': 'Paris, France',
    'contact.details.item2': 'Collaboration hybride / a distance',
    'contact.details.item3': 'Projets pour startups, equipes R&D et besoins d ingenierie industrielle'
  }
};

function applyLanguage(lang) {
  const activeLang = translations[lang] ? lang : 'en';
  const map = translations[activeLang];

  document.documentElement.lang = activeLang;
  if (metaDescription && map['meta.description']) {
    metaDescription.setAttribute('content', map['meta.description']);
  }

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    const value = map[key];
    if (typeof value === 'string') {
      node.textContent = value;
    }
  });

  if (langToggleButton) {
    const nextLang = activeLang === 'en' ? 'fr' : 'en';
    langToggleButton.textContent = nextLang.toUpperCase();
    langToggleButton.setAttribute('aria-label', activeLang === 'en' ? 'Switch to French' : 'Basculer en anglais');
  }
}

if (langToggleButton) {
  const storedLang = localStorage.getItem('siteLanguage') || 'en';
  applyLanguage(storedLang);

  langToggleButton.addEventListener('click', () => {
    const currentLang = document.documentElement.lang === 'fr' ? 'fr' : 'en';
    const nextLang = currentLang === 'en' ? 'fr' : 'en';
    localStorage.setItem('siteLanguage', nextLang);
    applyLanguage(nextLang);
  });
}
