#ifndef CONFIG_H
#define CONFIG_H

// Wi-Fi Configuration (copy this file to config.h and add your actual credentials)
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Device Identification
#define DEVICE_ID "roomi-node-1"
#define HOSTNAME "roomi"

// Sensor Type: DHT11 or DHT22
#define SENSOR_TYPE DHT11

// Pin Definitions per docs/03-HARDWARE.md
#define DHT_PIN 4
#define LED_PIN 2
#define LDR_PIN 34
#define SOUND_PIN 35

// Optional Sensors (false for initial bring-up)
#define ENABLE_LDR false
#define ENABLE_SOUND false

#endif // CONFIG_H
