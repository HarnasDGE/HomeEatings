# 🔐 Konfiguracja Supabase dla HomeEatings

## 1. Tworzenie tabel w bazie danych

Przejdź do SQL Editor w Supabase Dashboard i wykonaj poniższe zapytania:

### Tabela Profiles

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2. Konfiguracja Storage dla avatarów

### Tworzenie bucket

1. Przejdź do **Storage** w Supabase Dashboard
2. Kliknij **New bucket**
3. Nazwa: `avatars`
4. Zaznacz **Public bucket**
5. Kliknij **Create bucket**

### Polityki bezpieczeństwa dla Storage

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars'
  );

-- Allow public access to view avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars'
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars'
  );
```

## 3. Konfiguracja OAuth Providers

### Google OAuth

1. Przejdź do **Authentication > Providers** w Supabase Dashboard
2. Znajdź **Google** i kliknij przycisk konfiguracji
3. Włącz Google provider
4. Wykonaj poniższe kroki:

#### Tworzenie OAuth aplikacji w Google Cloud Console

1. Przejdź do [Google Cloud Console](https://console.cloud.google.com/)
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz **Google+ API**
4. Przejdź do **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Wybierz **Web application**
6. Dodaj autoryzowane redirect URIs:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Skopiuj **Client ID** i **Client Secret**
8. Wklej je w Supabase Dashboard

### Apple OAuth

1. Przejdź do **Authentication > Providers** w Supabase Dashboard
2. Znajdź **Apple** i kliknij przycisk konfiguracji
3. Włącz Apple provider
4. Wykonaj poniższe kroki:

#### Tworzenie Apple Sign In

1. Przejdź do [Apple Developer Portal](https://developer.apple.com/)
2. Przejdź do **Certificates, Identifiers & Profiles**
3. Utwórz nowy **App ID**
4. Włącz **Sign In with Apple** capability
5. Utwórz nowy **Services ID**
6. Skonfiguruj redirect URL:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Wygeneruj **Key** dla Sign In with Apple
8. Skopiuj wymagane dane do Supabase Dashboard

## 4. Konfiguracja Email Templates (opcjonalne)

Możesz dostosować szablony emaili w **Authentication > Email Templates**:

- **Confirm signup**: Email potwierdzający rejestrację
- **Magic Link**: Link do logowania bez hasła
- **Change Email Address**: Potwierdzenie zmiany emaila
- **Reset Password**: Reset hasła

## 5. Zmienne środowiskowe

Upewnij się, że plik `.env` zawiera poprawne dane:

```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

## 6. Testowanie

Po skonfigurowaniu:

1. Uruchom aplikację lokalnie: `npm run dev`
2. Sprawdź rejestrację emailem
3. Sprawdź logowanie Google (jeśli skonfigurowane)
4. Sprawdź logowanie Apple (jeśli skonfigurowane)
5. Sprawdź edycję profilu i upload avatara

## Troubleshooting

### Problem: OAuth nie działa
- Sprawdź czy redirect URLs są poprawnie skonfigurowane
- Sprawdź czy provider jest włączony w Supabase
- Sprawdź konsole przeglądarki dla błędów

### Problem: Upload avatara nie działa
- Sprawdź czy bucket `avatars` jest publiczny
- Sprawdź polityki bezpieczeństwa Storage
- Sprawdź rozmiar pliku (max 2MB w aplikacji)

### Problem: Profile nie tworzy się automatycznie
- Sprawdź czy trigger `on_auth_user_created` jest aktywny
- Sprawdź logi w Supabase Dashboard
- Sprawdź czy funkcja `handle_new_user()` została utworzona

## Przydatne linki

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
