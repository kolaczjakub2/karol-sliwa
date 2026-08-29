# Karol Śliwa — komentarze REST API

Wtyczka pozwala niezalogowanym czytelnikom dodawać komentarze przez endpoint WordPress REST API używany przez nową stronę:

`POST /wp-json/wp/v2/comments`

Zwykłe ustawienia WordPressa dotyczące moderacji, wymaganych danych, blokowania spamu i zamknięcia komentarzy nadal obowiązują.

## Instalacja przez panel WordPressa

1. Zaloguj się do panelu administracyjnego WordPressa.
2. Wejdź w **Wtyczki → Dodaj nową wtyczkę**.
3. Kliknij **Wyślij wtyczkę na serwer**.
4. Wybierz plik `karol-sliwa-rest-comments.zip`.
5. Kliknij **Zainstaluj teraz**, a następnie **Włącz wtyczkę**.

## Ustawienia komentarzy

1. Wejdź w **Ustawienia → Dyskusja**.
2. Opcja zezwalająca na komentowanie nowych wpisów powinna być włączona.
3. Opcja **Użytkownicy muszą być zarejestrowani i zalogowani, aby móc komentować** powinna być wyłączona.
4. Zalecane jest pozostawienie moderacji komentarzy lub używanie ochrony antyspamowej.

Trzeba również sprawdzić, czy komentarze są otwarte dla konkretnego wpisu.

## Test

Po aktywacji wtyczki dodaj komentarz z nowej strony jako niezalogowany użytkownik. Prawidłowy komentarz zostanie opublikowany lub trafi do moderacji — zależnie od ustawień WordPressa.

Jeśli nadal pojawia się błąd, należy sprawdzić odpowiedź żądania w narzędziach deweloperskich przeglądarki oraz reguły wtyczek bezpieczeństwa, zapory i CORS.

## Odinstalowanie

Wyłączenie albo usunięcie wtyczki przywraca domyślne blokowanie anonimowego komentowania przez REST API. Wtyczka nie zapisuje własnych danych w bazie.
