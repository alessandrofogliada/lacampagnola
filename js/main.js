document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.getElementById("menu-container");
  const loader = document.getElementById("loader");
  // const messaggioFiltri = document.getElementById("messaggio-filtri");
  const menuSwitchButtons = document.querySelectorAll(".menu-switch");
  const menuSezioni = document.getElementById("menuSezioni");
  const filtriCibo = document.getElementById("filtri-cibo");
  const filtriBevande = document.getElementById("filtri-bevande");
  const navButtons = document.querySelectorAll(".bottom-nav .nav-btn");


  let datiCaricatiMenu = false;
  let sezionePrincipale = null;
  let activeMenu = "Antipasti";
  let lang = localStorage.getItem("lang") || "it";
  let langData = {};
  let menuData = {};
  let loaderTimeout;
  
  menuContainer.classList.remove("fade-in");
  void menuContainer.offsetWidth; // forza il reflow
  menuContainer.classList.add("fade-in");
  

  // Filtri attivi per categorie
  let filters = {
    vegetariano: false,
    vegano: false,
    glutenfree: false,
    piccante: false,
    lattosiofree: false,
    alcolico: false,
    analcolico: false
  };

  updateLangLabel();


  // URL per recuperare i dati dal foglio Google Sheets
  const sheetUrls = {
    menu: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhYV5Lre2RdYx97zG3_aPf4HzIBzNwcbr_2F_zu6P-vUzKog5Jai02HAzVZVLNBCcW7WX3hO8lEbXjBHmNEQzJ05dwcMcJH2ljyupvNAmjOk9WgQXdYouInHksZb-MUnlAoqxPBxd7VsaMKhKfnHpJBlwi-87zzDJCN2q8gB84Vb7RpSS1ReqwpAubamP7_G8o8okwZ4TZhgJXdbkQWYExjadKBSJhegOrj7L-aEghYtDSW6sfx1hiNch6P-gzEfOwhrTJ4gKASLUKztfSylSUCjRV39w&lib=MoyGcHZ7QfCaNWTkzEmMQPD3FZZAEnAtP',
  };

  let lastScrollTop = 0;
  const bottomNav = document.querySelector(".bottom-nav");
  
  window.addEventListener("scroll", function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    if (scrollTop > lastScrollTop) {
      // Scroll down
      bottomNav.classList.add("show");
    } else {
      // Scroll up
      bottomNav.classList.remove("show");
    }
  
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
  

  

  document.querySelectorAll(".menu-card").forEach(card => {
    card.addEventListener("click", () => {
      const tipo = card.dataset.menu;
      document.querySelector(`[data-menu="${tipo}"]`).click(); // simula il click
    });
  });
  
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active")); // rimuove dagli altri
      btn.classList.add("active"); // aggiunge solo al cliccato
    });
  });

  // 🗣️ Carica il file delle traduzioni e imposta lingua attiva
  fetch("lang.json")
    .then(res => res.json())
    .then(data => {
      langData = data;
      translateUI();
      enableButtons();
      fetchEventi();
    });

  // 🔓 Sblocca i pulsanti di menu dopo che la lingua è caricata
  function enableButtons() {
    menuSwitchButtons.forEach(btn => btn.disabled = false);
  }

  // 🌐 Cambia lingua e aggiorna UI
  document.querySelectorAll("#lingua-selector button").forEach(btn => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      localStorage.setItem("lang", lang);
      translateUI();
      renderMenu();
      updateLangLabel();
      fetchEventi();
    });
  });

  // 🔄 Traduce tutti i testi visibili
  function translateUI() {

    document.querySelectorAll('[data-menu="Bevande"]').forEach(el => {
      el.innerHTML = langData[lang].bevande;
    });

    document.querySelectorAll('[data-menu="cibo"]').forEach(el => {
      el.innerHTML = langData[lang].menu;
    });    

    document.querySelectorAll('[data-menu="lingua"]').forEach(el => {
      el.textContent = langData[lang].lingua;
    });
  
    [
      ["[data-menu='Antipasti']", langData[lang].antipasti],
      ["[data-menu='Primi']", langData[lang].primi],
      ["[data-menu='Secondi']", langData[lang].secondi],
      ["[data-menu='Contorni']", langData[lang].contorni],
      ["[data-menu='Dolci']", langData[lang].dolci],
      ["[data-menu='benvenuto']", langData[lang].benvenuto],
      ["[data-menu='scopriMenu']", langData[lang].scopriMenu],
      ["[data-menu='eventi']", langData[lang].eventi],
      ["[data-menu='filtroDieta']", langData[lang].filtroDieta],
      ["[data-menu='Bibite']", langData[lang].bibite],
      ["[data-menu='Acqua']", langData[lang].acqua],
      ["[data-menu='Vino']", langData[lang].vino],
      ["[data-menu='Birra']", langData[lang].birra],

    ].forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (el) el.innerHTML = text;
    });
    


    // 🥗 Traduzione dei filtri CIBO
    const ciboFilters = {
      glutenfree: "🌾 " + langData[lang].glutenfree,
      lattosiofree: "🥛 " + langData[lang].lattosiofree,
      vegetariano: "🥦 " + langData[lang].vegetariano,
      vegano: "🥕 " + langData[lang].vegano,
      piccante: "🌶️ " + langData[lang].piccante,
      reset: "🔁 " + langData[lang].reset
    };

    Object.entries(ciboFilters).forEach(([key, label]) => {
      const btn = document.querySelector(`#filtri-cibo button[data-filter="${key}"]`);
      if (btn) btn.textContent = label;
    });

    // 🍷 Traduzione dei filtri BEVANDE
    const bevandeFilters = {
      alcolico: "🍷 " + langData[lang].alcolico,
      analcolico: "🥤 " + langData[lang].analcolico,
      reset: "🔁 " + langData[lang].reset
    };

    Object.entries(bevandeFilters).forEach(([key, label]) => {
      const btn = document.querySelector(`#filtri-bevande button[data-filter="${key}"]`);
      if (btn) btn.textContent = label;
    });
  }

  function updateLangLabel() {
    const currentLang = localStorage.getItem("lang") || "it";
    const labelMap = {
      it: "🇮🇹 Italiano",
      en: "🇬🇧 English",
      de: "🇩🇪 Deutsch",
      fr: "🇫🇷 Français" 
    };
    document.querySelector('.dropdown-toggle').textContent = ` ${labelMap[currentLang]}`;
  }
  

  menuSwitchButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tipo = btn.dataset.menu;
  
      // Nascondi tutto all'inizio
      filtriCibo.style.display = "none";
      filtriBevande.style.display = "none";
  
      if (btn.dataset.menu === "cibo" || btn.dataset.menu === "Bevande") {
        menuSezioni.style.display = "none";
      }
  
      if (tipo === "cibo") {
        sezionePrincipale = "cibo";
        menuSezioni.style.display = "flex";
        document.getElementById("menuSezioniBevande").style.display = "none";
        filtriCibo.style.display = "block";
        activeMenu = "Antipasti";
      
      } else if (tipo === "Bevande") {
        sezionePrincipale = "bevande";
        menuSezioni.style.display = "none"; 
        document.getElementById("menuSezioniBevande").style.display = "flex"; 
        filtriBevande.style.display = "flex";
        activeMenu = "Bibite"; 
      
  
      } else {
        activeMenu = tipo;
  
        if (sezionePrincipale === "cibo") {
          filtriCibo.style.display = "block";
        } else {
          filtriCibo.style.display = "none";
        }
      }
  
      // ✅ Scroll verso l'alto dopo aver impostato la sezione
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
  
      if (!datiCaricatiMenu) {
        datiCaricatiMenu = true;
        showLoader();         
        fetchMenu();
      } else {
        showLoader();  
        renderMenu();
      }
    });
  });
  
  

  // 🎯 Attiva/disattiva i filtri
  function attachFilterListeners() {
    const allFilterButtons = document.querySelectorAll("#filtri-cibo button, #filtri-bevande button");
  
    allFilterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.filter;
  
        if (type === "reset") {
          // 1. Reset logico dei filtri
          for (let key in filters) {
            filters[key] = false;
          }
  
          // 2. Reset visivo dei bottoni
          document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
          });
  
        } else {
          // Toggle logico
          filters[type] = !filters[type];
  
          // Toggle visivo (aggiunge o rimuove 'active')
          btn.classList.toggle('active');
          console.log(btn.classList); 

        }
  
        renderMenu(); // Aggiorna la lista dei piatti
        updateActiveFiltersUI();
      });
    });
  }

  function updateActiveFiltersUI() {
    const activeList = document.getElementById("active-filter-list");
    const wrapper = document.getElementById("active-filters");
    activeList.innerHTML = "";
  
    const labels = {
      vegetariano: "🥦 " + langData[lang].vegetariano,
      vegano: "🥕 " + langData[lang].vegano,
      glutenfree: "🌾 " + langData[lang].glutenfree,
      lattosiofree: "🥛 " + langData[lang].lattosiofree,
      piccante: "🌶️ " + langData[lang].piccante,
      alcolico: "🍷 " + langData[lang].alcolico,
      analcolico: "🥤 " + langData[lang].analcolico
    };
  
    let count = 0;
    Object.entries(filters).forEach(([key, attivo]) => {
      if (attivo) {
        const badge = document.createElement("span");
        badge.className = "badge bg-secondary";
        badge.innerText = labels[key];
        activeList.appendChild(badge);
        count++;
      }
    });
  
    wrapper.style.display = count > 0 ? "block" : "none";
  }
  
  

  // 📥 Recupera il menu dal Google Sheet
  function fetchMenu() {
    // ✅ Se i dati sono già presenti, usa la cache
    if (Object.keys(menuData).length > 0) {
      renderMenu(); // usa direttamente i dati già caricati
      return;
    }
  
    const url = sheetUrls["menu"];
    showLoader();
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log("Sheet disponibili:", Object.keys(data)); // 👈 DEBUG
        menuData = data;
        attachFilterListeners();
        renderMenu();
      })
      .catch(err => {
        console.error(err);
        menuContainer.innerHTML = "<p>Errore nel caricamento del menu.</p>";
        hideLoader();
      });
  }
  
  

  // 🖼️ Visualizza i piatti/elementi filtrati e tradotti
  function renderMenu() {
    menuContainer.innerHTML = "";

    if (!menuData[activeMenu]) {
      console.warn(`❌ Nessun dato disponibile per la sezione: "${activeMenu}"`);
      menuContainer.innerHTML = `<p class="text-center mt-3">${langData[lang].noDati || "Nessun dato disponibile."}</p>`;
      hideLoader();
      return;
    }
  
    const filtered = menuData[activeMenu].filter(item => {
      let ok = true;

      if (sezionePrincipale === "cibo") {
        ["vegetariano", "vegano", "glutenfree", "piccante", "lattosiofree"].forEach(key => {
          if (filters[key] && (!item["Categoria"] || !item["Categoria"].toLowerCase().includes(key))) {
            ok = false;
          }
        });
      }

      if (sezionePrincipale === "bevande") {
        if (filters.alcolico && (!item["Categoria"] || item["Categoria"].toLowerCase() !== "alcolico")) ok = false;
        if (filters.analcolico && (!item["Categoria"] || item["Categoria"].toLowerCase() !== "analcolico")) ok = false;
      }

      return ok;
    });

    if (filtered.length === 0) {
      menuContainer.innerHTML = `
        <div class="text-center mt-4" style="background-color:white; border-radius:15px">
        <p>${langData[lang].noMatch}</p>

        </div>
      `;
      hideLoader();
      return;
    }
    

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "menu-item col-md-4 mb-4";
    
      // Badge dinamici
      const categorie = (item["Categoria"] || "").toLowerCase().split(",").map(c => c.trim());
      const badgeMap = {
        vegetariano: { label: langData[lang].vegetariano || "Vegetariano", class: "bg-warning" },
        vegano: { label: langData[lang].vegano || "Vegano", class: "bg-success" },
        glutenfree: { label: langData[lang].glutenfree || "Senza Glutine", class: "glutenfree" },
        lattosiofree: { label: langData[lang].lattosiofree || "Senza Lattosio", class: "bg-primary" },
        piccante: { label: langData[lang].piccante || "Piccante", class: "bg-danger" },
        alcolico: { label: langData[lang].alcolico || "Alcolico", class: "bg-danger" },
        analcolico: { label: langData[lang].analcolico || "Analcolico", class: "bg-primary" }
      };
    
      let badgeHTML = "";
    
      Object.keys(badgeMap).forEach(key => {
        if (categorie.includes(key)) {
          badgeHTML += `<span class="badge ${badgeMap[key].class} me-1">${badgeMap[key].label}</span>`;
        }
      });
      

      div.innerHTML = `
        <div class="card h-100 align-items-center">
          ${item["Immagine"] ? `<img src="img/${item["Immagine"]}" class="card-img-top w-50 mt-3" alt="${item["Nome piatto"]}" loading="lazy">` : ""}
            <div class="card-body d-flex flex-column align-items-center">
              <h5 class="card-title" style="font-weight:bold">${item[`Nome piatto (${lang})`] || item["Nome piatto"]}</h5>
              <div class="mb-2">${badgeHTML}</div>
              <p class="card-text text-center"><strong>${langData[lang].ingredienti}:</strong> ${item[`Ingredienti (${lang})`] || item["Ingredienti"]}</p>
              <p class="card-text"><strong>${langData[lang].prezzo}:</strong> €${item["Prezzo"]}</p>
          </div>

        </div>
      `;
      menuContainer.appendChild(div);
    });
    updateActiveFiltersUI();
    hideLoader();
  } 

  
  menuSwitchButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      menuSwitchButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });

  });

  function fetchEventi() {
    const eventiURL = sheetUrls["eventi"];
    const container = document.getElementById("eventi-container");
    const eventiLoader = document.getElementById("loader-eventi");
  
    if (!container) return;
  
    // MOSTRA loader
    eventiLoader.style.display = "block";
    container.style.display = "none";
  
    fetch(eventiURL)
      .then(res => res.json())
      .then(data => {
        container.innerHTML = "";
  
        if (!data || data.length === 0) {
          container.innerHTML = `
            <div class="text-center my-4">
              <p style="font-size: 18px;">📅 Nessun evento in programma al momento.</p>
              <p>Torna a trovarci presto!</p>
            </div>
          `;
        }
         else {
          data.forEach(evento => {
            const div = document.createElement("div");
            const dataObj = new Date(evento.Data);
            const dataFormattata = dataObj.toLocaleDateString("it-IT");
  
            div.innerHTML = `
              <div class="card shadow h-100 text-center">
              ${evento.Immagine ? `<img src="img/${evento.Immagine}" class="card-img-top" alt="${evento.Titolo || "Evento"}">` : ""}
                <div class="card-body">
                  <h5 class="card-title">${evento.Titolo || "Evento"}</h5>
                  <p class="card-text mb-1"><strong> ${langData[lang].data}:</strong> ${dataFormattata}</p>
                </div>
              </div>
            `;
            container.appendChild(div);
          });
        }
  
        // NASCONDI loader
        eventiLoader.style.display = "none";
        container.style.display = "flex";
      })
      .catch(err => {
        console.error("Errore nel caricamento eventi:", err);
        container.innerHTML = "<p>Errore nel caricamento eventi.</p>";
        eventiLoader.style.display = "none";
        container.style.display = "block";
      });
  }
  
  function showLoader() {
    loader.style.display = "flex";
    document.getElementById("home-screen").style.display = "none";
    menuContainer.style.display = "none";
  
    // ⏳ Imposta timeout per fallback
    loaderTimeout = setTimeout(() => {
      loader.innerHTML = `
        <div class="text-danger">
          <i class="fa-solid fa-triangle-exclamation fa-2x mb-2"></i>
          <p>Tempo di attesa superato. Riprova per favore.</p>
        </div>
      `;
    }, 10000);
  }
  
  function hideLoader() {
    clearTimeout(loaderTimeout); // ✅ cancella il timeout se carica correttamente
    loader.style.display = "none";
    menuContainer.style.display = "flex";
  }
  
});



