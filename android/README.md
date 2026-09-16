# 📱 Pashu Suraksha - Android APK Build & Installation Guide

This directory contains the native Android project wrapper for **पशु सुरक्षा (Pashu Suraksha)** with support for camera capture, GPS outbreak containment locating, offline PWA storage, and audio advisories.

There are **4 easy ways** to build or install the Android APK:

---

## ⚡ Method 1: Instant 1-Click Online Build (PWABuilder by Microsoft)
> **Best for**: Non-developers or if you do not have Android Studio installed on your computer.

1. Deploy your Pashu Suraksha web app to a live URL (e.g. Render, Railway, PythonAnywhere, AWS, or use Cloudflare Tunnel / ngrok).
2. Go to [**PWABuilder.com**](https://www.pwabuilder.com).
3. Enter your website URL (e.g. `https://your-pashu-suraksha-domain.com`) and click **Start**.
4. PWABuilder automatically scans `manifest.json` and `sw.js` (both are already configured with the official logo, icons, and theme color).
5. Click **Package for Android** $\rightarrow$ Click **Generate APK**.
6. Download the generated `.apk` file directly to your Android phone and tap to install!

---

## ☁️ Method 2: Free Cloud Build via GitHub Actions (Zero Local Software Needed)
> **Best for**: Automated builds directly from this GitHub repository.

1. Push this repository to GitHub (`main` branch).
2. On GitHub, navigate to the **Actions** tab at the top of your repository:
   `https://github.com/Heisenberg-RMS/pashu-suraksha/actions`
3. Click on **Build Android APK** in the left sidebar.
4. Click **Run workflow** $\rightarrow$ **Run workflow**.
5. In ~2 minutes, the workflow finishes. Click on the completed run.
6. Under **Artifacts**, download `PashuSuraksha-Android-APK.zip`.
7. Extract the ZIP to get `app-debug.apk` and install it on your phone!

---

## 💻 Method 3: Build Locally Using Android Studio
> **Best for**: Developers with Android Studio installed.

1. Open **Android Studio**.
2. Select **Open an Existing Project** $\rightarrow$ browse to the `android/` folder of this repository.
3. Wait for Gradle sync to complete.
4. (Optional) To customize the target server URL, edit `android/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="server_url">https://your-domain.com</string>
   ```
5. From the top menu, click **Build** $\rightarrow$ **Build Bundle(s) / APK(s)** $\rightarrow$ **Build APK(s)**.
6. Android Studio will generate the APK at:
   `android/app/build/outputs/apk/debug/app-debug.apk`.
7. Transfer to your phone via USB cable or WhatsApp / Google Drive and install!

---

## 📲 Method 4: Instant Native Install on Phone (No APK Compilation Required)
> **Best for**: Instant field testing on any Android phone within 10 seconds.

Pashu Suraksha is a certified **Progressive Web App (PWA)**:
1. Open Google Chrome on your Android mobile device.
2. Navigate to your Pashu Suraksha web address (e.g. `http://<your-ip>:5000` or hosted domain).
3. Tap the **Three Dots (⋮)** in the top-right corner of Chrome.
4. Tap **"Install App"** (or **"Add to Home screen"**).
5. The app will install with the **Official Pashu Suraksha Logo**, launching full-screen without address bars, with offline caching and camera support!
