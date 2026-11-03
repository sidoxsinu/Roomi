#include <Arduino.h>
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

// Cached state (firmware never sends fabricated fallback values)
float cachedTemp = 0.0;
float cachedHumidity = 0.0;
bool hasValidReading = false;
String sensorStatus = "online"; // "online" or "error"

unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL_MS = 2000;

// LED Blink state tracking
unsigned long lastLedToggle = 0;
bool ledState = false;

void updateStatusLed() {
  unsigned long now = millis();
  if (sensorStatus == "error") {
    // Fast blink: 150 ms period
    if (now - lastLedToggle >= 150) {
      lastLedToggle = now;
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
  } else {
    // Solid ON when sensor is OK
    digitalWrite(LED_PIN, HIGH);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n=================================");
  Serial.println("[ROOMI] ESP32 Sensor Initialising");
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
}

void loop() {
  unsigned long now = millis();

  // Non-blocking sensor reading every 2000 ms
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
      Serial.println(" % [Status: online]");
    }
  }

  updateStatusLed();
}
