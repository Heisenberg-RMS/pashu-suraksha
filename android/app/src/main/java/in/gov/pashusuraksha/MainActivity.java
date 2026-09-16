package in.gov.pashusuraksha;

import android.Manifest;
import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.view.View;
import android.view.animation.DecelerateInterpolator;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;

    private WebView webView;
    private View splashContainer;
    private ProgressBar splashProgressBar;
    private TextView splashStatusText;
    private boolean splashDismissed = false;
    private long splashStartTime = 0;

    private ValueCallback<Uri[]> filePathCallback;
    private String cameraPhotoPath;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        splashContainer = findViewById(R.id.splashContainer);
        splashProgressBar = findViewById(R.id.splashProgressBar);
        splashStatusText = findViewById(R.id.splashStatusText);
        splashStartTime = System.currentTimeMillis();

        // Initial smooth loading line progression in the lower section
        if (splashProgressBar != null) {
            ObjectAnimator initialAnim = ObjectAnimator.ofInt(splashProgressBar, "progress", 10, 80);
            initialAnim.setDuration(2200);
            initialAnim.setInterpolator(new DecelerateInterpolator());
            initialAnim.start();
        }

        // Safety fallback: dismiss splash after 5.5s even if network is slow
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                dismissSplash(true);
            }
        }, 5500);

        requestAppPermissions();
        setupWebView();

        // Load configured URL (production domain, local network IP, or fallback)
        String appUrl = getString(R.string.server_url);
        webView.loadUrl(appUrl);
    }

    private void requestAppPermissions() {
        String[] permissions = {
                Manifest.permission.CAMERA,
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.RECORD_AUDIO
        };

        boolean needsRequest = false;
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                needsRequest = true;
                break;
            }
        }

        if (needsRequest) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        // Force Mobile Native Viewport - Disables wide desktop overview simulation
        settings.setUseWideViewPort(false);
        settings.setLoadWithOverviewMode(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setDefaultTextEncodingName("utf-8");
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Force mobile user agent so web app immediately knows it is running on mobile Android APK
        String defaultUA = settings.getUserAgentString();
        String mobileUA = defaultUA;
        if (!mobileUA.contains("Mobile")) {
            mobileUA += " Mobile";
        }
        mobileUA += " PashuSurakshaApp/1.0 (Android; MobileApp)";
        settings.setUserAgentString(mobileUA);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                // Immediately apply mobile mode class before rendering
                view.evaluateJavascript(
                    "document.documentElement.classList.add('mobile-app-mode');" +
                    "if (!document.querySelector('meta[name=\"viewport\"]')) {" +
                    "  var meta = document.createElement('meta');" +
                    "  meta.name = 'viewport';" +
                    "  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';" +
                    "  document.head.appendChild(meta);" +
                    "}", null);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                view.evaluateJavascript("document.documentElement.classList.add('mobile-app-mode');", null);
                dismissSplash(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    dismissSplash(true);
                    Toast.makeText(MainActivity.this, "Connecting to Pashu Suraksha network...", Toast.LENGTH_SHORT).show();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                super.onProgressChanged(view, newProgress);
                if (!splashDismissed && splashProgressBar != null) {
                    if (newProgress > splashProgressBar.getProgress()) {
                        splashProgressBar.setProgress(newProgress);
                    }
                    if (newProgress >= 100) {
                        dismissSplash(false);
                    }
                }
            }

            // Geolocation permissions for outbreak containment rings & GPS locating
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            // WebRTC Camera / Mic permissions for video & audio advisories
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.grant(request.getResources());
            }

            // Handle Camera capture & file browsing for livestock triage photo uploads
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                if (takePictureIntent.resolveActivity(getPackageManager()) != null) {
                    File photoFile = null;
                    try {
                        photoFile = createImageFile();
                    } catch (IOException ex) {
                        ex.printStackTrace();
                    }
                    if (photoFile != null) {
                        Uri photoURI = FileProvider.getUriForFile(MainActivity.this,
                                getPackageName() + ".fileprovider", photoFile);
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                    } else {
                        takePictureIntent = null;
                    }
                }

                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentSelectionIntent.setType("image/*");

                Intent[] intentArray;
                if (takePictureIntent != null) {
                    intentArray = new Intent[]{takePictureIntent};
                } else {
                    intentArray = new Intent[0];
                }

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Select Livestock Photo");
                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

                startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE);
                return true;
            }
        });
    }

    private synchronized void dismissSplash(boolean immediate) {
        if (splashDismissed || splashContainer == null) return;

        long elapsed = System.currentTimeMillis() - splashStartTime;
        long minDisplayDuration = 2200; // 2.2s pleasant display time
        long delay = (immediate || elapsed >= minDisplayDuration) ? 0 : (minDisplayDuration - elapsed);

        if (delay == 0) {
            executeSplashFadeOut();
        } else {
            new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    executeSplashFadeOut();
                }
            }, delay);
        }
    }

    private void executeSplashFadeOut() {
        if (splashDismissed || splashContainer == null) return;
        splashDismissed = true;

        if (splashProgressBar != null) {
            ObjectAnimator finishAnim = ObjectAnimator.ofInt(splashProgressBar, "progress", splashProgressBar.getProgress(), 100);
            finishAnim.setDuration(250);
            finishAnim.start();
        }

        if (splashStatusText != null) {
            splashStatusText.setText("स्वागतम् / Welcome");
        }

        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                if (splashContainer != null) {
                    splashContainer.animate()
                        .alpha(0f)
                        .setDuration(450)
                        .withEndAction(new Runnable() {
                            @Override
                            public void run() {
                                splashContainer.setVisibility(View.GONE);
                            }
                        })
                        .start();
                }
            }
        }, 200);
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "LIVESTOCK_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        File image = File.createTempFile(imageFileName, ".jpg", storageDir);
        cameraPhotoPath = image.getAbsolutePath();
        return image;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (!allGranted) {
                Toast.makeText(this, "Camera and Location enhance diagnosis & hotspot mapping", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return;

            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK) {
                if (data == null || data.getData() == null) {
                    if (cameraPhotoPath != null) {
                        results = new Uri[]{Uri.fromFile(new File(cameraPhotoPath))};
                    }
                } else {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
            }
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public void onBackPressed() {
        if (splashContainer != null && splashContainer.getVisibility() == View.VISIBLE && !splashDismissed) {
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
