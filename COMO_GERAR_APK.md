# Como Baixar o Código e Gerar o APK do Mercado Fácil

O projeto nativo Android já está **100% criado e sincronizado** dentro deste repositório na pasta `android/`, já com a **logo oficial** configurada nos ícones do aplicativo (`ic_launcher.png`).

---

## 1. Como baixar o código completo

1. No canto superior direito desta tela do **Google AI Studio**, clique no menu de opções (**⋮** ou ícone de configurações).
2. Clique em **Export** (Exportar).
3. Selecione:
   - **Download ZIP** (para baixar o arquivo no seu computador) ou
   - **Export to GitHub** (para enviar diretamente para a sua conta do GitHub).

---

## 2. Como gerar o arquivo `.apk` no seu computador

Com o projeto descompactado no seu computador:

### Método Direto (Via Android Studio - Mais recomendado):
1. Abra o **Android Studio**.
2. Clique em **Open** (Abrir) e selecione a pasta **`android`** que está dentro do projeto.
3. Aguarde o Android Studio carregar os arquivos (o Gradle sincronizará automaticamente).
4. No menu superior, clique em:
   **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
5. Em poucos segundos o Android Studio exibirá uma notificação: **"APK(s) generated successfully"**.
6. Clique em **locate** para pegar o arquivo **`app-debug.apk`** (ou `app-release.apk`).
7. Pronto! Esse é o arquivo que você instala no celular ou envia via WhatsApp para os seus clientes.

---

### Método via Linha de Comando (Sem abrir o Android Studio):
Se você já tiver o SDK do Android instalado:
1. Abra o terminal na pasta do projeto.
2. Rode:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   *(No Windows utilize: `gradlew.bat assembleDebug`)*
3. O APK gerado estará em:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 3. Scripts úteis disponíveis no projeto:
- `npm run cap:build`: Compila os arquivos web e sincroniza tudo na pasta Android.
- `npm run cap:open`: Abre o projeto diretamente no Android Studio.
- `npm run cap:sync`: Sincroniza qualquer alteração feita no app com o projeto Android.
