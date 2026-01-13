# 🍽️ HomeEatings - Frontend

Aplikacja webowa do zarządzania posiłkami w domu.

## Technologie

- **React 19** - Biblioteka do budowania interfejsu użytkownika
- **Vite** - Szybki build tool i dev server
- **Tailwind CSS 3** - Framework CSS do stylowania
- **Supabase** - Backend as a Service (autentykacja, baza danych, storage)
- **Vercel** - Platforma do hostingu

## Instalacja i uruchomienie lokalnie

```bash
# Instalacja zależności
npm install

# Skopiuj plik .env.example do .env i uzupełnij dane Supabase
cp .env.example .env

# Uruchomienie serwera deweloperskiego
npm run dev

# Build produkcyjny
npm run build

# Podgląd buildu produkcyjnego
npm run preview
```

## Konfiguracja Supabase

1. Utwórz projekt na [supabase.com](https://supabase.com)
2. Skopiuj URL i Anon Key z Settings > API
3. Wykonaj migracje SQL z pliku `SUPABASE_SETUP.md`
4. Skonfiguruj OAuth providers (opcjonalnie)

**Szczegółowa instrukcja:** Zobacz plik [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

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
├── public/                    # Pliki statyczne
├── src/
│   ├── components/
│   │   ├── auth/             # Komponenty autoryzacji
│   │   │   └── AuthModal.jsx
│   │   ├── profile/          # Komponenty profilu
│   │   │   └── ProfileModal.jsx
│   │   └── layout/           # Komponenty layoutu
│   │       └── UserMenu.jsx
│   ├── contexts/             # React contexts
│   │   └── AuthContext.jsx
│   ├── lib/                  # Biblioteki i konfiguracje
│   │   └── supabase.js
│   ├── App.jsx              # Główny komponent aplikacji
│   ├── main.jsx             # Entry point
│   └── index.css            # Style globalne (Tailwind)
├── .env                      # Zmienne środowiskowe (nie w repo)
├── .env.example              # Przykładowe zmienne środowiskowe
├── SUPABASE_SETUP.md         # Instrukcje konfiguracji Supabase
├── index.html                # HTML template
├── package.json              # Zależności i skrypty
├── vite.config.js            # Konfiguracja Vite
├── tailwind.config.js        # Konfiguracja Tailwind
└── vercel.json               # Konfiguracja Vercel

```

## Funkcjonalności (v2.0.0)

### Autoryzacja i Profile
- ✅ Rejestracja z emailem i hasłem
- ✅ Logowanie z emailem i hasłem
- ✅ OAuth - Logowanie przez Google
- ✅ OAuth - Logowanie przez Apple
- ✅ Zarządzanie profilem użytkownika
- ✅ Upload i edycja avatara
- ✅ Automatyczne tworzenie profilu przy rejestracji
- ✅ Wylogowanie

### Posiłki
- ✅ Wyświetlanie listy posiłków dziennych
- ✅ Oznaczanie posiłków jako przygotowane
- ✅ Statystyki posiłków
- ✅ Responsywny design

### UI/UX
- ✅ Nawigacja z menu użytkownika
- ✅ Avatar w menu (z inicjałami lub zdjęciem)
- ✅ Modalne okna dla logowania i profilu
- ✅ Loading states
- ✅ Error handling

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
