# Restructuring – IntelliJ IDEA Community Edition Setup

Dette er en CE‑vennlig pakke av prosjektet ditt.

## Strukturen i denne mappen

- `backend/`  – Spring Boot (Maven) backend
- `frontend/` – React/Vite frontend
- `infra/`    – Docker, Render, GitHub Actions osv. (uendret)
- `scripts/`  – Diverse hjelpe‑skript (uendret fra repoet)

Bygg‑/IDE‑spesifikke filer (`.idea`, `target`, `node_modules`, osv.) er fjernet.

---

## 1. Åpne backend i IntelliJ IDEA CE

1. Start **IntelliJ IDEA Community Edition**.
2. Velg **Open** og pek på mappen `backend` i denne pakken.
3. IntelliJ oppdager `pom.xml` og spør om du vil importere Maven‑prosjektet – svar **Yes**.
4. Vent til Maven‑indeksering er ferdig.

Da får du:

- Ett prosjekt: `restructuring-backend`
- Grønn **Run**/Play‑knapp på `RestructuringApplication` (main‑klassen).

---

## 2. Kjør backend fra IntelliJ

1. Åpne `src/main/java/io/ltj/restructuring/RestructuringApplication.java`.
2. Klikk på den grønne play‑ikonet ved siden av `main`‑metoden og velg **Run 'RestructuringApplication'**.
3. IntelliJ lager en **Application Run Configuration** automatisk.
4. Neste gang kan du bare trykke på grønne **Run**‑knappen øverst til høyre.

Backend starter på `http://localhost:8080`.

---

## 3. Start frontend med skript (uten IntelliJ‑plugin)

Siden IntelliJ CE ikke har Node‑plugin kan vi ikke få en "ekte" Node‑run config,
men du har en veldig enkel måte å starte Vite på:

### Windows – CMD

1. Åpne en **Command Prompt** (`cmd.exe`).
2. Gå til rotmappen for denne pakken (`restructuring-idea-ce-setup`).
3. Kjør:

   ```bat
   scripts\start-frontend.cmd
   ```

   Skriptet gjør:
   - `cd frontend`
   - `npm install` (første gang – kan kommenteres vekk senere)
   - `npm run dev -- --open=false`

4. Vite kjører på `http://localhost:5173/restructuring/`.

### Windows – PowerShell

Hvis du foretrekker PowerShell:

```powershell
.\scripts\start-frontend.ps1
```

---

## 4. "Compound" kjøring (backend + frontend)

IntelliJ CE kan ikke lage ekte "Compound" run configs uten Node‑plugin,
men du kan gjøre dette manuell‑enkelt:

1. **Tab 1 – IntelliJ**
   - Kjør backend via `RestructuringApplication` run config.

2. **Tab 2 – Terminal**
   - Kjør `scripts\start-frontend.cmd` (eller `.ps1`).

Da har du backend‑loggene i IntelliJ og frontend‑loggene i terminal‑vinduet.

---

## 5. Videre raffinering (frivillig)

Når du har dette oppsettet gående, kan du:

- Lage en **External Tool** i IntelliJ som kjører `scripts/start-frontend.cmd`
  (så du kan starte frontend fra `Tools → External Tools`).
- Legge den External Tool som "Before launch" på backend‑run config hvis du vil
  at IntelliJ skal åpne et eget CMD‑vindu for frontend når du starter backend.

Men det er helt valgfritt – denne pakken fungerer uten ekstra IDE‑konfigurasjon.

---

Kortversjon:

- Åpne `backend/` i IntelliJ → Run `RestructuringApplication`.
- Kjør `scripts/start-frontend.cmd` i separat terminal.
- Surf til `http://localhost:5173/restructuring/`.

