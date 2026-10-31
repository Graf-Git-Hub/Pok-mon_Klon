package de.echochroniken.game;

import android.app.Activity;
import android.app.UiModeManager;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {
    private static final String TAG = "EchoChroniken";
    private WebView webView;
    private boolean television;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private String heldStick = null;
    private final Runnable stickRepeater = new Runnable() {
        @Override public void run() {
            if (heldStick != null) {
                sendToGame(heldStick);
                mainHandler.postDelayed(this, 155);
            }
        }
    };

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        UiModeManager manager = (UiModeManager) getSystemService(Context.UI_MODE_SERVICE);
        television = manager != null && manager.getCurrentModeType() == Configuration.UI_MODE_TYPE_TELEVISION;
        if (getPackageManager().hasSystemFeature("android.software.leanback")) television = true;
        if (television) setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        showImmersive();
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & 2) != 0);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(7, 11, 18));
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDefaultTextEncodingName("UTF-8");
        webView.addJavascriptInterface(new DeviceBridge(), "EchoAndroid");
        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest request) {
                return assets.shouldInterceptRequest(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                return !"appassets.androidplatform.net".equals(request.getUrl().getHost());
            }
            @Override public void onReceivedError(WebView v, WebResourceRequest request, android.webkit.WebResourceError error) {
                Log.e(TAG, "WebView: " + request.getUrl() + " " + error.getDescription());
            }
            @Override public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail detail) {
                Log.e(TAG, "WebView renderer exited: " + detail.didCrash());
                v.destroy();
                webView = null;
                // Stop safely instead of showing a frozen black screen; user may restart the app.
                finish();
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    private final class DeviceBridge {
        @JavascriptInterface public String getDeviceType() { return television ? "tv" : "phone"; }
        @JavascriptInterface public String getAppVersion() { return "0.12.0-balance"; }
        @JavascriptInterface public void log(String message) { Log.i(TAG, message); }
    }

    private void sendToGame(String cmd) {
        if (webView == null) return;
        final String sanitized = cmd.replaceAll("[^A-Z_]", "");
        webView.evaluateJavascript("window.echoAndroidInput && window.echoAndroidInput('" + sanitized + "')", null);
    }

    private void showImmersive() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) showImmersive();
    }

    @Override public boolean onKeyDown(int keyCode, KeyEvent event) {
        String command = keyToCommand(keyCode);
        if (command != null) {
            if (event.getRepeatCount() == 0 || command.equals("UP") || command.equals("DOWN") ||
                command.equals("LEFT") || command.equals("RIGHT")) sendToGame(command);
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
    @Override public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyToCommand(keyCode) != null) return true;
        return super.onKeyUp(keyCode, event);
    }
    @Override public void onBackPressed() { sendToGame("B"); }

    private String keyToCommand(int code) {
        switch(code) {
            case KeyEvent.KEYCODE_DPAD_UP: return "UP";
            case KeyEvent.KEYCODE_DPAD_DOWN: return "DOWN";
            case KeyEvent.KEYCODE_DPAD_LEFT: return "LEFT";
            case KeyEvent.KEYCODE_DPAD_RIGHT: return "RIGHT";
            case KeyEvent.KEYCODE_DPAD_CENTER:
            case KeyEvent.KEYCODE_ENTER:
            case KeyEvent.KEYCODE_NUMPAD_ENTER: return "A";
            case KeyEvent.KEYCODE_BUTTON_B: return "A_FACE"; // Switch: physical right face button
            case KeyEvent.KEYCODE_BUTTON_A: return "B_FACE"; // Switch: physical bottom face button
            case KeyEvent.KEYCODE_BACK: return "B";
            case KeyEvent.KEYCODE_BUTTON_START:
            case KeyEvent.KEYCODE_MENU: return "START";
            case KeyEvent.KEYCODE_BUTTON_SELECT: return "SELECT";
            case KeyEvent.KEYCODE_BUTTON_L1: return "L";
            case KeyEvent.KEYCODE_BUTTON_R1: return "R";
            case KeyEvent.KEYCODE_BUTTON_L2: return "MOVES";
            case KeyEvent.KEYCODE_BUTTON_R2: return "FULLSCREEN";
            case KeyEvent.KEYCODE_BUTTON_X: return "L";
            case KeyEvent.KEYCODE_BUTTON_Y: return "R";
            default: return null;
        }
    }

    @Override public boolean onGenericMotionEvent(MotionEvent event) {
        if ((event.getSource() & InputDevice.SOURCE_JOYSTICK) == InputDevice.SOURCE_JOYSTICK &&
                event.getAction() == MotionEvent.ACTION_MOVE) {
            float x = event.getAxisValue(MotionEvent.AXIS_X);
            float y = event.getAxisValue(MotionEvent.AXIS_Y);
            if (Math.abs(x) < .45f) x = event.getAxisValue(MotionEvent.AXIS_HAT_X);
            if (Math.abs(y) < .45f) y = event.getAxisValue(MotionEvent.AXIS_HAT_Y);
            String next = null;
            if (Math.abs(x) >= .55f || Math.abs(y) >= .55f) {
                next = Math.abs(x) > Math.abs(y) ? (x > 0 ? "RIGHT" : "LEFT") : (y > 0 ? "DOWN" : "UP");
            }
            if ((heldStick == null && next != null) || (heldStick != null && !heldStick.equals(next))) {
                mainHandler.removeCallbacks(stickRepeater);
                heldStick = next;
                if (next != null) {
                    sendToGame(next);
                    mainHandler.postDelayed(stickRepeater, 160);
                }
            } else if (next == null) {
                heldStick = null;
                mainHandler.removeCallbacks(stickRepeater);
            }
            return true;
        }
        return super.onGenericMotionEvent(event);
    }
    @Override public void onPause() {
        heldStick = null;
        mainHandler.removeCallbacks(stickRepeater);
        if (webView != null) webView.onPause();
        super.onPause();
    }
    @Override public void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
        showImmersive();
    }
    @Override public void onDestroy() {
        mainHandler.removeCallbacks(stickRepeater);
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
