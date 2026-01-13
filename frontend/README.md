# 🍽️ HomeEatings - Frontend

Aplikacja webowa do zarządzania posiłkami w domu.

## Technologie

- **React 19** - Biblioteka do budowania interfejsu użytkownika
- **Vite** - Szybki build tool i dev server
- **Tailwind CSS 4** - Framework CSS do stylowania
- **Vercel** - Platforma do hostingu

## Instalacja i uruchomienie lokalnie

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Build produkcyjny
npm run build

# Podgląd buildu produkcyjnego
npm run preview
```

## Deployment na Vercel

### Opcja 1: Przez CLI Vercel
```bash
npm install -g vercel
vercel
```

### Opcja 2: Przez GitHub
1. Wrzuć kod na GitHub
2. Zaimportuj repozytorium w Vercel Dashboard
3. Vercel automatycznie wykryje projekt Vite i skonfiguruje deployment

### Opcja 3: Przez Vercel Dashboard
1. Przejdź do [vercel.com](https://vercel.com)
2. Kliknij "Add New Project"
3. Zaimportuj repozytorium lub uploaduj folder
4. Vercel automatycznie skonfiguruje projekt

## Struktura projektu

```
frontend/
├── public/          # Pliki statyczne
├── src/
│   ├── App.jsx     # Główny komponent aplikacji
│   ├── main.jsx    # Entry point
│   └── index.css   # Style globalne (Tailwind)
├── index.html      # HTML template
├── package.json    # Zależności i skrypty
├── vite.config.js  # Konfiguracja Vite
├── tailwind.config.js  # Konfiguracja Tailwind
└── vercel.json     # Konfiguracja Vercel

```

## Funkcjonalności (v1.0.0)

- ✅ Wyświetlanie listy posiłków dziennych
- ✅ Oznaczanie posiłków jako przygotowane
- ✅ Statystyki posiłków
- ✅ Responsywny design

## Roadmap

- [ ] Dodawanie własnych posiłków
- [ ] Edycja i usuwanie posiłków
- [ ] Planowanie posiłków na cały tydzień
- [ ] Lista zakupów
- [ ] Przepisy kulinarne
- [ ] Synchronizacja między urządzeniami
- [ ] Aplikacja mobilna (Android/iOS)

## Licencja

MIT
