#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <DHT.h>
#include <ESP32Servo.h>

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
int cachedLight = -1; // -1 indicates disabled or null
int cachedSound = -1;
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

  char lightStr[16];
  char soundStr[16];

  if (ENABLE_LDR && cachedLight >= 0 && sensorStatus == "online") {
    snprintf(lightStr, sizeof(lightStr), "%d", cachedLight);
  } else {
    snprintf(lightStr, sizeof(lightStr), "null");
  }

  if (ENABLE_SOUND && cachedSound >= 0 && sensorStatus == "online") {
    snprintf(soundStr, sizeof(soundStr), "%d", cachedSound);
  } else {
    snprintf(soundStr, sizeof(soundStr), "null");
  }

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
      "{\"device_id\":\"%s\",\"temperature\":%s,\"humidity\":%s,\"light_raw\":%s,\"sound_raw\":%s,\"sensor_status\":\"online\",\"uptime_s\":%lu}",
      DEVICE_ID, tempStr, humStr, lightStr, soundStr, uptime
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

void roomiSetup() {
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

  #if (ENABLE_LDR)
    Serial.print("[ROOMI] LDR Channel Enabled on GPIO ");
    Serial.println(LDR_PIN);
    pinMode(LDR_PIN, INPUT);
  #endif

  #if (ENABLE_SOUND)
    Serial.print("[ROOMI] Sound Channel Enabled on GPIO ");
    Serial.println(SOUND_PIN);
    pinMode(SOUND_PIN, INPUT);
  #endif

  Serial.println("=================================");

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  dht.begin();

  // Initiate Wi-Fi connection
  WiFi.mode(WIFI_STA);
  Serial.println("[ROOMI] [WiFi] Connecting to: " WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void roomiLoop() {
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
      cachedLight = -1;
      cachedSound = -1;
      Serial.println("[ROOMI] [ERROR] DHT read failure! sensor_status set to 'error'.");
    } else {
      sensorStatus = "online";
      hasValidReading = true;
      cachedTemp = t;
      cachedHumidity = h;

      #if (ENABLE_LDR)
        cachedLight = analogRead(LDR_PIN); // ADC1 counts (0-4095)
      #else
        cachedLight = -1;
      #endif

      #if (ENABLE_SOUND)
        cachedSound = analogRead(SOUND_PIN); // ADC1 counts (0-4095)
      #else
        cachedSound = -1;
      #endif

      Serial.print("[ROOMI] Temp: ");
      Serial.print(cachedTemp, 1);
      Serial.print(" °C | Hum: ");
      Serial.print(cachedHumidity, 1);
      Serial.print(" %");

      #if (ENABLE_LDR)
        Serial.print(" | Light: ");
        Serial.print(cachedLight);
      #endif

      #if (ENABLE_SOUND)
        Serial.print(" | Sound: ");
        Serial.print(cachedSound);
      #endif

      Serial.print(" [Status: online] [WiFi: ");
      Serial.print(isWiFiConnected ? "Connected" : "Connecting");
      Serial.println("]");
    }
  }

  // 4. Update Status LED
  updateStatusLed();
}

// ======================= ROBOT CODE (unchanged) =======================

// Order: Front Left, Front Right, Back Left, Back Right
const int PINS[4] = {18, 21, 19, 22};
Servo servos[4];

// Right side is mirrored. If the robot walks BACKWARD, flip all four.
bool INVERT[4] = {false, true, false, true};

// Logical position: 0 = leg back, 180 = leg forward
const int POS_BACK  = 0;
const int POS_FRONT = 180;

// SLOW, strong push so the feet grip the floor
const int PUSH_STEP  = 6;
const int PUSH_DELAY = 3;   // ms per step (raise for more grip, lower for speed)

// SNAP return: servo jumps straight to the target at full speed
const int SNAP_WAIT = 250;   // ms to let the servo arrive after a snap
const int PAUSE     = 50;

const bool PAIR_A[4] = {true, false, false, true};   // FL + BR
const bool PAIR_B[4] = {false, true, true, false};   // FR + BL
const bool ALL[4]    = {true, true, true, true};

int current[4] = {0, 0, 0, 0};   // logical positions

int physicalAngle(int i, int logicalPos) {
  int a = INVERT[i] ? (180 - logicalPos) : logicalPos;
  return constrain(a, 0, 180);
}

// Slow controlled move (used for the push)
void slowMove(const bool group[4], int target, int stepSize, int stepDelay) {
  bool moving = true;
  while (moving) {
    moving = false;
    for (int i = 0; i < 4; i++) {
      if (!group[i]) continue;
      if (abs(current[i] - target) <= stepSize) {
        current[i] = target;
      } else {
        current[i] += (current[i] < target) ? stepSize : -stepSize;
        moving = true;
      }
      servos[i].write(physicalAngle(i, current[i]));
    }
    delay(stepDelay);
  }
}

// Instant move at the servo's maximum speed (used for the return)
void snapMove(const bool group[4], int target) {
  for (int i = 0; i < 4; i++) {
    if (!group[i]) continue;
    current[i] = target;
    servos[i].write(physicalAngle(i, target));
  }
  delay(SNAP_WAIT);
}

void robotSetup() {
  for (int i = 0; i < 4; i++) {
    servos[i].setPeriodHertz(50);
    servos[i].attach(PINS[i], 500, 2400);
    servos[i].write(0);            // all servos to 0° first
  }
  delay(3000);

  // After writing physical 0°, inverted servos are at logical 180
  for (int i = 0; i < 4; i++) current[i] = INVERT[i] ? 180 : 0;
  slowMove(ALL, POS_BACK, 3, 8);   // bring all legs to the same back position
  delay(1000);
}

void robotLoop() {
  slowMove(ALL, POS_FRONT, PUSH_STEP, PUSH_DELAY);   // slow push: body moves forward
  delay(PAUSE);

  snapMove(PAIR_A, POS_BACK);   // FL + BR snap back, FR + BL stay planted
  delay(PAUSE);

  snapMove(PAIR_B, POS_BACK);   // FR + BL snap back, FL + BR stay planted
  delay(PAUSE);
}

// ======================= COMBINER (new) =======================

// Runs the robot's setup once, then its loop forever, in its own task
void robotTask(void *param) {
  robotSetup();
  for (;;) {
    robotLoop();
  }
}

void setup() {
  roomiSetup();
  xTaskCreatePinnedToCore(robotTask, "robot", 4096, NULL, 1, NULL, 1);
}

void loop() {
  roomiLoop();
}