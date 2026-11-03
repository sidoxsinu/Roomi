#include <Arduino.h>
#include <DHT.h>

#if __has_include("config.h")
  #include "config.h"
#else
  #include "config.example.h"
#endif

DHT dht(DHT_PIN, SENSOR_TYPE);

unsigned long lastReadTime = 0;
const unsigned long READ_INTERVAL_MS = 2000;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[ROOMI] ESP32 Sensor Bring-up Starting...");

  dht.begin();
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("[ROOMI] DHT initialized.");
}

void loop() {
  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;

    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (isnan(t) || isnan(h)) {
      Serial.println("[ROOMI] [WARN] Failed to read from DHT sensor!");
    } else {
      Serial.print("[ROOMI] Temp: ");
      Serial.print(t, 1);
      Serial.print(" °C | Hum: ");
      Serial.print(h, 1);
      Serial.println(" %");
    }
  }
}
