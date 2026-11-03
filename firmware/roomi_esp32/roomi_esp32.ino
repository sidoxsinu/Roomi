#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <DHT.h>

#if __has_include("config.h")
  #include "config.h"
#else
  #include "config.example.h"
#endif

// Sensor type validation switch
#if (SENSOR_TYPE != DHT11) && (SENSOR_TYPE != DHT22)
  #error "SENSOR_TYPE must be defined as either DHT11 or DHT22 in config.h"
#endif

DHT dht(DHT_PIN, SENSOR_TYPE);
WebServer server(80);

// Cached state (firmware never sends fabricated fallback values)
float cachedTemp = 0.0;
float cachedHumidity = 0.0;
bool hasValidReading = false;
String sensorStatus = "online"; // "online" or "error"

unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL_MS = 2000;

// Wi-Fi Connection Management
unsigned long lastWiFiCheck = 0;
const unsigned long WIFI_RETRY_INTERVAL_MS = 5000;
bool isWiFiConnected = false;

// LED Blink state tracking
unsigned long lastLedToggle = 0;
bool ledState = false;

void handleRoot() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "ROOMI ESP32 Sensor Node. Endpoints: /data, /health");
}

void handleHealth() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "ok");
}

void handleData() {
  server.sendHeader("Access-Control-Allow-Origin", "*");

  unsigned long uptime = millis() / 1000;
  char jsonBuffer[384];

  if (sensorStatus == "error" || !hasValidReading) {
    snprintf(jsonBuffer, sizeof(jsonBuffer),
      "{\"device_id\":\"%s\",\"temperature\":null,\"humidity\":null,\"light_raw\":null,\"sound_raw\":null,\"sensor_status\":\"error\",\"uptime_s\":%lu}",
      DEVICE_ID, uptime
    );
  } else {
    char tempStr[16];
    char humStr[16];
    dtostrf(cachedTemp, 1, 1, tempStr);
    dtostrf(cachedHumidity, 1, 1, humStr);

    snprintf(jsonBuffer, sizeof(jsonBuffer),
      "{\"device_id\":\"%s\",\"temperature\":%s,\"humidity\":%s,\"light_raw\":null,\"sound_raw\":null,\"sensor_status\":\"online\",\"uptime_s\":%lu}",
      DEVICE_ID, tempStr, humStr, uptime
    );
  }

  server.send(200, "application/json", jsonBuffer);
}

void handleNotFound() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(404, "text/plain", "Not Found");
}

void setupHttpServer() {
  server.on("/", HTTP_GET, handleRoot);
  server.on("/health", HTTP_GET, handleHealth);
  server.on("/data", HTTP_GET, handleData);
  server.onNotFound(handleNotFound);
  server.begin();
  Serial.println("[ROOMI] [HTTP] Web server started on port 80.");
}

void setupMdns() {
  if (MDNS.begin(HOSTNAME)) {
    MDNS.addService("http", "tcp", 80);
    Serial.print("[ROOMI] [mDNS] Responder started: http://");
    Serial.print(HOSTNAME);
    Serial.println(".local");
  } else {
    Serial.println("[ROOMI] [mDNS] [WARN] Failed to set up MDNS responder.");
  }
}

void checkWiFiConnection() {
  unsigned long now = millis();
  if (WiFi.status() == WL_CONNECTED) {
    if (!isWiFiConnected) {
      isWiFiConnected = true;
      Serial.print("[ROOMI] [WiFi] Connected! IP Address: ");
      Serial.println(WiFi.localIP());
      setupHttpServer();
      setupMdns();
    }
    return;
  }

  isWiFiConnected = false;
  if (now - lastWiFiCheck >= WIFI_RETRY_INTERVAL_MS) {
    lastWiFiCheck = now;
    Serial.println("[ROOMI] [WiFi] Disconnected. Reconnecting to: " WIFI_SSID);
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
}

void updateStatusLed() {
  unsigned long now = millis();
  if (sensorStatus == "error") {
    // Fast blink: 150 ms period on sensor failure
    if (now - lastLedToggle >= 150) {
      lastLedToggle = now;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
  } else if (!isWiFiConnected) {
    // Slow blink when Wi-Fi is connecting: 600 ms period
    if (now - lastLedToggle >= 600) {
      lastLedToggle = now;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
  } else {
    // Solid ON when Wi-Fi connected and sensor OK
    digitalWrite(LED_PIN, HIGH);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=================================");
  Serial.println("[ROOMI] ESP32 Firmware Starting");
  Serial.print("[ROOMI] Sensor Model: ");
  #if (SENSOR_TYPE == DHT11)
    Serial.println("DHT11");
  #else
    Serial.println("DHT22");
  #endif
  Serial.print("[ROOMI] DHT Pin: GPIO ");
  Serial.println(DHT_PIN);
  Serial.println("=================================");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  dht.begin();

  // Initiate Wi-Fi connection
  WiFi.mode(WIFI_STA);
  Serial.println("[ROOMI] [WiFi] Connecting to: " WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void loop() {
  unsigned long now = millis();

  // 1. Maintain Wi-Fi connection non-blockingly
  checkWiFiConnection();

  // 2. Handle HTTP clients if connected
  if (isWiFiConnected) {
    server.handleClient();
  }

  // 3. Non-blocking sensor reading every 2000 ms
  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;

    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (isnan(t) || isnan(h)) {
      sensorStatus = "error";
      hasValidReading = false;
      Serial.println("[ROOMI] [ERROR] DHT read failure! sensor_status set to 'error'.");
    } else {
      sensorStatus = "online";
      hasValidReading = true;
      cachedTemp = t;
      cachedHumidity = h;

      Serial.print("[ROOMI] Temp: ");
      Serial.print(cachedTemp, 1);
      Serial.print(" °C | Hum: ");
      Serial.print(cachedHumidity, 1);
      Serial.print(" % [Status: online] [WiFi: ");
      Serial.print(isWiFiConnected ? "Connected" : "Connecting");
      Serial.println("]");
    }
  }

  // 4. Update Status LED
  updateStatusLed();
}
