# **Overview**
The Planting Outlook Web App is a tool that helps users determine if the current conditions are optimal for planting specific plants based on real-time weather and soil data. The app allows users to either use their location or manually input a city to fetch the latest weather and soil conditions, then compare them with the ideal planting requirements for their chosen plant.

## **Features**

**Geolocation & Manual City Input:** Fetches the user’s current location via geolocation or allows manual city input to retrieve weather and soil data.

**Real-Time Weather Data:** Uses the OpenWeather API to get current weather information, including temperature, humidity, wind speed, and feels-like temperature.

**Soil Data Retrieval:** Fetches current soil temperature and moisture based on the user’s location using the Agromonitoring API.

**Optimal Planting Conditions:** Allows users to input a plant name and retrieve its optimal planting conditions (sunlight, soil temperature, moisture, frost dates) using the OpenAI API.

**Intelligent Planting Insights:** Compares current weather and soil data with optimal planting conditions and provides recommendations on whether it's a good time to plant.

**LocalStorage Optimization**: Polygon data is cached in localStorage, reducing API calls and improving response times by 300ms.

## **Technologies Used**
* **HTML, CSS, JavaScript:** For front-end design and user interactions.
  
* **OpenWeather API:** Fetches real-time weather data based on user location.
  
* **Agromonitoring API:** Retrieves soil information such as soil temperature and moisture.
  
* **OpenAI API:** Provides optimal planting conditions for the user’s selected plant.
  
* **LocalStorage:** Saves polygon data to reduce repeated API requests and enhance app performance.
  
## **How It Works**
1. **User Location:**
   
    * The app uses geolocation to get the user’s latitude and longitude or allows manual city input if geolocation is disabled.
      
1. **Weather Data:**
   
    * Current weather conditions (temperature, humidity, wind speed, etc.) are fetched from the OpenWeather API.

1. **Soil Data:**

    * The Agromonitoring API is used to create a polygon around the user’s location to fetch real-time soil temperature and moisture.
      Polygon data is saved using localStorage to reduce API calls on repeated use.

1. **Plant Input:**
   
    * The user inputs a plant name, and the OpenAI API provides the optimal planting conditions for that plant.

1. **Planting Recommendation:**
   
    * The app compares the current weather and soil conditions against the optimal conditions for the plant. If two or more conditions match, the app suggests that it is a good time to plant.
