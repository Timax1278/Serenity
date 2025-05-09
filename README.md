# Serenity - Your Space for Mental Wellness

-----------------------------------------------------------------------------------------------------------------
**Autore: Davydov Tymofiy**
-----------------------------------------------------------------------------------------------------------------

## Descrizione del Progetto

**Serenity** è una piattaforma innovativa dedicata al supporto della salute mentale, con un focus particolare sugli adolescenti, ma progettata per essere utile a un'ampia gamma di utenti inclusi genitori, educatori e professionisti del settore. L'obiettivo è fornire un approccio olistico al benessere mentale attraverso una combinazione di risorse accessibili, supporto professionale e una comunità solidale.

L'applicazione offre:
*   **Terapie Personalizzate:** Possibilità di prenotare sessioni con specialisti qualificati.
*   **Meditazione Guidata:** Una libreria di tracce audio per meditazione e rilassamento, con suggerimenti basati sulle preferenze dell'utente.
*   **Gruppi di Supporto (Social):** Spazi sicuri moderati dove gli utenti possono connettersi, discutere e supportarsi a vicenda.
*   **Risorse Educative:** Articoli, guide e strumenti per la gestione dello stress, ansia, e per lo sviluppo di meccanismi di coping sani.

Serenity si propone di essere un faro di speranza, contribuendo a migliorare il benessere mentale dei giovani e a costruire una comunità più consapevole e solidale.

## Target di Riferimento

*   Adolescenti (principale)
*   Genitori e Tutori
*   Insegnanti e Istituti Scolastici
*   Professionisti della Salute Mentale
*   Chiunque sia interessato a migliorare il proprio benessere emotivo.

## Problema Risolto

La piattaforma affronta la crescente necessità di un supporto accessibile, personalizzato e non stigmatizzante per la salute mentale, specialmente tra i giovani. Offre strumenti pratici e connessioni umane per aiutare gli utenti a navigare le sfide emotive e a costruire resilienza.

## Tecnologie Utilizzate

*   **Frontend:** Vue.js (Vue 3 con Composition API/Options API), Vuex, Vue Router, Axios.
*   **Backend:** Node.js, Express.js, WebSocket (per funzionalità real-time come chat).
*   **Database (attuale):** Sistema basato su file JSON (per `dataStore`) per prototipazione e sviluppo.
*   **API Esterne (integrate):**
    *   Freesound API (per tracce audio di meditazione).
*   **API Esterne (previste):**
    *   API di pagamento (Stripe, PayPal - da implementare).
    *   Servizi di autenticazione aggiuntivi.
*   **Styling:** CSS, SCSS.
*   **Ambiente di Sviluppo:** GitHub Codespaces.

## Timestamp Progetto

Inizio Progetto (basato sull'ID esempio): `1726737865509` (circa: 16 Settembre 2024)

## Requisiti Funzionali Chiave Implementati/Previsti

*   **Registrazione e Login Utente:** Autenticazione locale e con Google.
*   **Profilo Utente:** Visualizzazione e modifica (parziale) dei dati utente.
*   **Gruppi di Discussione:** Creazione (admin), join, leave, invio messaggi in tempo reale.
*   **Libreria di Meditazione:** Caricamento e riproduzione tracce audio da API esterna (Freesound).
*   **Prenotazione Appuntamenti:**
    *   Visualizzazione servizi/terapie e professionisti associati.
    *   Gestione admin dei servizi.
    *   Visualizzazione disponibilità professionisti per data.
    *   Prenotazione di uno slot.
    *   Visualizzazione e cancellazione appuntamenti prenotati dall'utente.
*   *(Molti altri requisiti elencati nel documento originale sono previsti per future implementazioni, come pagamenti, abbonamenti, recensioni, ecc.)*

## Requisiti Non Funzionali e di Dominio

Il progetto mira a rispettare alti standard di:
*   **Sicurezza:** Protezione dei dati (futura implementazione di crittografia e 2FA).
*   **Prestazioni:** Tempi di risposta rapidi e gestione utenti concorrenti.
*   **Affidabilità:** Meccanismi di backup (con un database reale).
*   **Usabilità:** Interfaccia intuitiva.
*   **Scalabilità:** Architettura modulare.
*   **Conformità:** Rispetto delle normative sulla privacy (GDPR, HIPAA ove applicabile), qualificazione degli specialisti, consenso per minori.

---

## Come Avviare il Progetto (Ambiente di Sviluppo - Codespaces)

Questo progetto è strutturato con un frontend Vue.js e un backend Node.js/Express.

### Prerequisiti

*   Accesso a un ambiente GitHub Codespaces (o un ambiente locale con Node.js e npm installati).
*   Un file `.env` configurato nella cartella `backend` con le chiavi API necessarie.

### Avvio del Backend

1.  **Aprire un Terminale** nel Codespace.
2.  Navigare nella cartella del backend:
    ```bash
    cd serenety-app/backend
    ```
3.  Installare le dipendenze (solo la prima volta o dopo aver aggiunto nuovi pacchetti):
    ```bash
    npm install
    ```
4.  **Creare e Configurare il File `.env`:**
    Nella cartella `serenety-app/backend/`, creare un file chiamato `.env` e aggiungere le variabili d'ambiente necessarie. Ad esempio:
    ```dotenv
    PORT=5000
    FREESOUND_API_KEY=LA_TUA_CHIAVE_API_FREESOUND_REALE
    # GOOGLE_CLIENT_ID=IL_TUO_GOOGLE_CLIENT_ID_PER_IL_BACKEND (se usato dal backend per verifica token ID Google)
    # JWT_SECRET=IL_TUO_SEGRETO_MOLTO_FORTE_PER_JWT (per futura implementazione JWT)
    ```
    *Sostituire `LA_TUA_CHIAVE_API_FREESOUND_REALE` con la chiave API effettiva ottenuta da Freesound.org.*
5.  Avviare il server backend:
    ```bash
    node server.js
    ```
    Oppure, se hai uno script `start` in `backend/package.json`:
    ```bash
    npm start
    ```
    Il backend dovrebbe essere in esecuzione sulla porta specificata (default 5000). Cerca i log di avvio nel terminale, come `Server running on port 5000`.

### Avvio del Frontend

1.  **Aprire un NUOVO Terminale** nel Codespace (lasciare il backend in esecuzione nel primo).
2.  Navigare nella cartella del frontend (la root di `serenety-app`):
    ```bash
    cd serenety-app 
    ```
    (Se sei già in `serenety-app/backend`, prima fai `cd ..`)
3.  Installare le dipendenze (solo la prima volta o dopo aver aggiunto nuovi pacchetti):
    ```bash
    npm install
    ```
4.  **Creare e Configurare il File `.env.development`:**
    Nella cartella `serenety-app/` (la root del frontend), creare un file chiamato `.env.development` e aggiungere le variabili d'ambiente per il frontend. Ad esempio:
    ```dotenv
    VUE_APP_API_URL=https://NOME_DEL_TUO_CODESPACE-5000.app.github.dev
    VUE_APP_WEBSOCKET_URL=wss://NOME_DEL_TUO_CODESPACE-5000.app.github.dev
    VUE_APP_GOOGLE_CLIENT_ID=IL_TUO_GOOGLE_CLIENT_ID_PER_IL_FRONTEND.apps.googleusercontent.com
    ```
    *Sostituire `NOME_DEL_TUO_CODESPACE-5000.app.github.dev` con l'URL pubblico del tuo backend in esecuzione sulla porta 5000 (puoi trovarlo nel tab "Ports" del Codespace). Assicurati che il protocollo per WebSocket sia `wss://` se il Codespace usa HTTPS.*
5.  Avviare il server di sviluppo del frontend:
    ```bash
    npm run serve
    ```
    Il frontend dovrebbe essere accessibile all'URL fornito dal server di sviluppo Vue (solitamente sulla porta 8080 o una simile, es. `https://NOME_DEL_TUO_CODESPACE-8080.app.github.dev/`). Controlla l'output del terminale per l'URL esatto.

### Accesso all'Applicazione

Una volta che sia il backend che il frontend sono in esecuzione:
*   Apri il browser e naviga all'URL del **frontend** fornito da `npm run serve`.
*   Dovresti vedere la HomePage e poter interagire con l'applicazione.

---

## Esempi di Payload API (per riferimento e test)

*(Mantenuti gli esempi che avevi fornito, puoi espanderli o rimuoverli se necessario)*

**Gestione dei Metodi di Pagamento**
*Richiesta:*
```json
{
  "action": "add_payment_method",
  "user_id": "12345",
  "payment_method": { "type": "credit_card", "card_number": "...", "expiry_date": "12/25", "cvv": "123" }
}
