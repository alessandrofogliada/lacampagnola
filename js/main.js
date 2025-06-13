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

  const allergeniMap = {
    glutine: {
      it: "🌾 Glutine",
      en: "🌾 Gluten",
      de: "🌾 Gluten",
      fr: "🌾 Gluten"
    },
    crostacei: {
      it: "🦐 Crostacei",
      en: "🦐 Crustaceans",
      de: "🦐 Krebstiere",
      fr: "🦐 Crustacés"
    },
    uova: {
      it: "🥚 Uova",
      en: "🥚 Eggs",
      de: "🥚 Eier",
      fr: "🥚 Œufs"
    },
    pesce: {
      it: "🐟 Pesce",
      en: "🐟 Fish",
      de: "🐟 Fisch",
      fr: "🐟 Poisson"
    },
    arachidi: {
      it: "🥜 Arachidi",
      en: "🥜 Peanuts",
      de: "🥜 Erdnüsse",
      fr: "🥜 Arachides"
    },
    soia: {
      it: "🌱 Soia",
      en: "🌱 Soy",
      de: "🌱 Soja",
      fr: "🌱 Soja"
    },
    latte: {
      it: "🥛 Latte",
      en: "🥛 Milk",
      de: "🥛 Milch",
      fr: "🥛 Lait"
    },
    frutta: {
      it: "🌰 Frutta a guscio",
      en: "🌰 Tree nuts",
      de: "🌰 Schalenfrüchte",
      fr: "🌰 Fruits à coque"
    },
    sedano: {
      it: "🥬 Sedano",
      en: "🥬 Celery",
      de: "🥬 Sellerie",
      fr: "🥬 Céleri"
    },
    senape: {
      it: "🌿 Senape",
      en: "🌿 Mustard",
      de: "🌿 Senf",
      fr: "🌿 Moutarde"
    },
    sesamo: {
      it: "⚪ Sesamo",
      en: "⚪ Sesame",
      de: "⚪ Sesam",
      fr: "⚪ Sésame"
    },
    solfiti: {
      it: "🧪 Solfiti",
      en: "🧪 Sulphites",
      de: "🧪 Sulfite",
      fr: "🧪 Sulfites"
    },
    lupini: {
      it: "🌾 Lupini",
      en: "🌾 Lupin",
      de: "🌾 Lupinen",
      fr: "🌾 Lupin"
    },
    molluschi: {
      it: "🐚 Molluschi",
      en: "🐚 Molluscs",
      de: "🐚 Weichtiere",
      fr: "🐚 Mollusques"
    }
  };

  function renderTabellaAllergeni() {
    const titolo = document.getElementById("allergeni-titolo");
    const thSimbolo = document.getElementById("th-simbolo");
    const thNome = document.getElementById("th-nome");
    const thDescrizione = document.getElementById("th-descrizione");
    const tbody = document.getElementById("allergeni-body");
  
    titolo.textContent = langData[lang].allergeni;
    thSimbolo.textContent = langData[lang].simbolo;
    thNome.textContent = langData[lang].nome;
    thDescrizione.textContent = langData[lang].descrizione;
  
    tbody.innerHTML = "";
  
    for (const key in allergeniMap) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${allergeniMap[key][lang].split(" ")[0]}</td>
        <td>${allergeniMap[key][lang]}</td>
        <td>${langData[lang].dettagliAllergeni?.[key] || ""}</td>
      `;
      tbody.appendChild(row);
    }
  }
  
  document.getElementById("btn-lang-toggle").addEventListener("click", () => {
    const tabella = document.getElementById("tabella-allergeni");
    const menu = document.getElementById("menu-container");
  
    // Mostra sempre la tabella, indipendentemente dallo stato attuale
    tabella.style.display = "block";
    menu.style.display = "none";
    renderTabellaAllergeni();
  });
  
  
  
  menuContainer.classList.remove("fade-in");
  void menuContainer.offsetWidth; // forza il reflow
  menuContainer.classList.add("fade-in");
  

  updateLangLabel();


  // URL per recuperare i dati dal foglio Google Sheets
  const sheetUrls = {
    menu: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLizRIETsMFlW5NffFSoxi4vHuHGjHDIZWRn3jWpd1WjhZNVLX7HPS5vLBviTZnkmv8iveDeN5nb6l9UeoQmsrTkuWI7SNyXgWSxS3YCuN940-LTBPYH6Fx-cwUVcmDDQQWTXfikeHSEY1zkbfI48Ay69H0Z2rdh6tawys9Min8f7t4S8UX4RzxAiwQ7RLJFeuUE_fIsFaDJWy_i0Ol-DQU3QE4cFxbtbFlrpKcVOFiHB6D50Djs8rWin_YJ_7FsGRpSgrfl-vATfVXKrPYGv6LhQmCk-w&lib=MoyGcHZ7QfCaNWTkzEmMQPD3FZZAEnAtP'
  };
  

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
      updateLangLabel();
  
      const tabella = document.getElementById("tabella-allergeni");
      if (tabella.style.display === "block") {
        renderTabellaAllergeni(); // se siamo nella tabella, aggiorniamo solo quella
      } else {
        renderMenu(); // altrimenti, aggiorniamo il menu
      }
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

    document.querySelectorAll('[data-menu="allergeni"]').forEach(el => {
      el.textContent = langData[lang].allergeni;
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
      ["[data-menu='loading']", langData[lang].loading],

    ].forEach(([selector, text]) => {
      const el = document.querySelector(selector);
      if (el) el.innerHTML = text;
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
  
      menuSezioni.style.display = "none";
      document.getElementById("menuSezioniBevande").style.display = "none";
  
      if (tipo === "cibo") {
        sezionePrincipale = "cibo";
        menuSezioni.style.display = "flex";
        activeMenu = "Antipasti";
      } else if (tipo === "Bevande") {
        sezionePrincipale = "bevande";
        document.getElementById("menuSezioniBevande").style.display = "flex";
        activeMenu = "Bibite";
      } else {
        activeMenu = tipo;
  
        // 👉 Mantieni visibile la giusta sezione
        if (sezionePrincipale === "cibo") {
          menuSezioni.style.display = "flex";
          document.getElementById("menuSezioniBevande").style.display = "none";
        } else if (sezionePrincipale === "bevande") {
          menuSezioni.style.display = "none";
          document.getElementById("menuSezioniBevande").style.display = "flex";
        }
      }
  
      window.scrollTo({ top: 0, behavior: "smooth" });
  
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
  
    const filtered = menuData[activeMenu].filter(item => true); // Nessun filtro attivo al momento
  
    if (filtered.length === 0) {
      menuContainer.innerHTML = `
        <div class="text-center mt-4" style="background-color:white; border-radius:15px">
          <p>${langData[lang].noMatch}</p>
        </div>
      `;
      hideLoader();
      return;
    }
  
    const renderItem = (item) => {
      const div = document.createElement("div");
      div.className = "menu-item col-md-4 mb-4";
  
      // ✅ Parsing allergeni con normalizzazione
      let allergeniHTML = "";
      const allergeniRaw = item["Allergeni"] || "";
      const allergeni = allergeniRaw
        .split(",")
        .map(a => a.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  
      allergeni.forEach(allergene => {
        if (allergeniMap[allergene]) {
          if (allergeniMap[allergene] && allergeniMap[allergene][lang]) {
            allergeniHTML += `<span class="badge me-1 allergene-${allergene}">${allergeniMap[allergene][lang]}</span>`;
          }
        }
      });
  
      div.innerHTML = `
        <div class="card h-100 align-items-center">
          ${item["Immagine"] ? `<img src="${item["Immagine"].startsWith('http') ? item["Immagine"] : `img/${item["Immagine"]}`}" 
              class="card-img-top mt-3" 
              alt="${item["Nome piatto"]}" 
              loading="lazy">
          ` : ""}
          <div class="card-body d-flex flex-column align-items-center">
            <h5 class="card-title" style="font-weight:bold">${item[`Nome piatto (${lang})`] || item["Nome piatto"]}</h5>
            <p class="card-text text-center">${item[`Ingredienti (${lang})`] || item["Ingredienti"]}</p>
            ${allergeniHTML ? `<div class="mb-2">${allergeniHTML}</div>` : ""}
            <p class="card-text"><strong>${langData[lang].prezzo}:</strong> €${item["Prezzo"]}</p>
          </div>
        </div>
      `;
      menuContainer.appendChild(div);
    };
  
    if (activeMenu === "Vino" || activeMenu === "Birra") {
      const groupedByFormat = {};
      filtered.forEach(item => {
        const formato = String(item.Formato || "").trim() || "Altro";
        if (!groupedByFormat[formato]) groupedByFormat[formato] = [];
        groupedByFormat[formato].push(item);
      });
  
      const formatoOrdine = ["Calice", "0,75", "0,375", "1,5", "Birra in bottiglia", "Birra alla spina piccola", "Birra alla spina media"];
      const sortedFormats = Object.keys(groupedByFormat).sort((a, b) => formatoOrdine.indexOf(a) - formatoOrdine.indexOf(b));
  
      sortedFormats.forEach(formato => {
        const sectionTitle = document.createElement("h3");
        sectionTitle.className = "mt-4 mb-3 w-100";
        sectionTitle.textContent = formato;
        menuContainer.appendChild(sectionTitle);
  
        groupedByFormat[formato].forEach(renderItem);
      });
  
    } else {
      filtered.forEach(renderItem);
    }
  
    hideLoader();
  }
  

  menuSwitchButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Disattiva visualizzazione della tabella allergeni
      document.getElementById("tabella-allergeni").style.display = "none";
      menuContainer.style.display = "flex";
  
      // Aggiorna i pulsanti attivi
      menuSwitchButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  

  
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



