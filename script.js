const AIUrl = "https://api.openai.com/v1/chat/completions";
const AIKey = "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";

const soilURL = "http://api.agromonitoring.com/agro/1.0/soil";
const soilKey = "e9b61da1d8a4f4af84fbf0c4ef02c636";

let popup = document.getElementById("popup");
const userLocationButton = document.getElementById("userLocationButton");
let lat, lon;
let locationGiven = false;
let plantGiven = false;
let plantName, cityName;

// Initialize the polygonMap to store city and polygon ID
let polygonMap = new Map();

// Load polygonMap from localStorage if available
function loadMapFromLocalStorage() {
  const storedMap = localStorage.getItem('polygonMap');
  if (storedMap) {
    polygonMap = new Map(Object.entries(JSON.parse(storedMap)));
  }
}

// Save polygonMap to localStorage
function saveMapToLocalStorage() {
  localStorage.setItem('polygonMap', JSON.stringify(Object.fromEntries(polygonMap)));
}

loadMapFromLocalStorage();

function getLocation() {
  navigator.geolocation.getCurrentPosition(success, error);

  function success(pos) {
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;

    reverseCoords(lat, lon);
  }

  function error(err) {
    if (err.code == 1) {
      popup.classList.add("open-popup");
    } else {
      alert("Location unavailable");
    }
  }
}

const weatherApiKey = "eea3d41105f705dbc76c7b10c71c37a7";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?";
const units = "&units=imperial";

const plantSearchBox = document.querySelector(".search input");
const plantSearchButton = document.getElementById("searchButton");

const citySearchBox = document.querySelector(".popup input");
const citySearchButton = document.querySelector(".popup button");

const weatherIcon = document.querySelector(".weather-icon");

async function reverseCoords(lat, lon) {
  const response = await fetch(
    "http://api.openweathermap.org/geo/1.0/reverse?lat=" + lat + "&lon=" + lon + "&limit=" + 5 + "&appid=" + weatherApiKey
  );
  var data = await response.json();
  const city = data[0].name;
  checkWeather(city);
}

async function checkWeather(city) {
  // Normalize the city input
  city = city.trim().toLowerCase();

  const response = await fetch(weatherApiUrl + "&q=" + city + `&appid=${weatherApiKey}` + units);

  if (response.status == 404) {
    document.querySelector(".error").style.display = "block";
  } else {
    var data = await response.json();

    // Store cityName in a normalized form
    const normalizedCity = data.name.trim().toLowerCase();
    cityName = normalizedCity;

    lat = data.coord.lat;
    lon = data.coord.lon;

    locationGiven = true;
    userLocationButton.classList.remove("glowing-location");
    userLocationButton.classList.add("no-glow");
    popup.classList.remove("open-popup");

    // Check if polygon exists for the city, otherwise create one
    if (!polygonMap.has(normalizedCity)) {
      getSoilInfo(lat, lon, normalizedCity);
    } else {
      const polygonId = polygonMap.get(normalizedCity);
      console.log(`Using cached polygon ID for ${normalizedCity}: ${polygonId}`);
      getSoilData(polygonId);
    }

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°F";
    document.querySelector(".humidity").innerHTML = "Humidity: " + data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = "Wind Speed: " + Math.round(data.wind.speed) + " mph";
    document.querySelector(".feelsLike").innerHTML = "Feels Like: " + Math.round(data.main.feels_like) + "°F";

    if (data.weather[0].main == "Clear") {
      weatherIcon.src = "weather-app-images/clear.png";
    } else if (data.weather[0].main == "Clouds") {
      weatherIcon.src = "weather-app-images/clouds.png";
    } else if (data.weather[0].main == "Snow") {
      weatherIcon.src = "weather-app-images/snow.png";
    } else if (data.weather[0].main == "Rain") {
      weatherIcon.src = "weather-app-images/rain.png";
    } else if (data.weather[0].main == "Mist") {
      weatherIcon.src = "weather-app-images/mist.png";
    } else if (data.weather[0].main == "drizzle") {
      weatherIcon.src = "weather-app-images/drizzle.png";
    }

    displayReady();
  }
}

// Normalize the manual city input and compare it to geolocation result
citySearchButton.addEventListener("click", () => {
  const manualCity = citySearchBox.value.trim().toLowerCase();
  checkWeather(manualCity);
});





async function getSoilData(polygonId) {
  try {
    const soilResponse = await fetch(`${soilURL}?polyid=${polygonId}&appid=${soilKey}`);

    if (!soilResponse.ok) {
      if (soilResponse.status === 404) {
        console.error("Polygon ID not found. Deleting from localStorage and recreating.");

        // Remove the polygon ID from localStorage
        polygonMap.delete(cityName);
        saveMapToLocalStorage();

        // Attempt to recreate the polygon
        getSoilInfo(lat, lon, cityName);
        return;
      }

      const errorDetails = await soilResponse.json();
      console.error("Soil data fetch error:", errorDetails);
      throw new Error(`Error fetching soil data: ${soilResponse.statusText}`);
    }

    const soilData = await soilResponse.json();
    const soilTempKelvin = soilData.t0;
    const soilMoisture = soilData.moisture;
    console.log(soilData);
    const soilTempFahrenheit = (soilTempKelvin - 273.15) * 9/5 + 32;

    document.querySelector(".currentSoilTemp").textContent = `Soil Temp: ${Math.round(soilTempFahrenheit)}°F`;
    document.querySelector(".currentSoilMoisture").textContent = `Soil Moisture: ${soilMoisture} m³/m³`;

  } catch (error) {
    console.error("Error fetching soil data:", error);
  }
}

async function getSoilInfo(lat, lon, city) {
  // Create a larger polygon around the user's location (about 1 ha or more)
  const polygon = {
    name: "User_Location_Polygon",
    geo_json: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lon - 0.005, lat - 0.005], // point southwest
            [lon + 0.005, lat - 0.005], // point southeast
            [lon + 0.005, lat + 0.005], // point northeast
            [lon - 0.005, lat + 0.005], // point northwest
            [lon - 0.005, lat - 0.005], // closing the polygon
          ],
        ],
      },
    },
  };

  try {
    const polygonResponse = await fetch(
      `http://api.agromonitoring.com/agro/1.0/polygons?appid=${soilKey}&duplicated=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(polygon),
      }
    );

    if (!polygonResponse.ok) {
      const errorDetails = await polygonResponse.json();
      console.error("Polygon creation error:", errorDetails);
      throw new Error(`Error creating polygon: ${polygonResponse.statusText}`);
    }

    const polygonData = await polygonResponse.json();
    const polygonId = polygonData.id;

    // Update polygonMap and save it to localStorage
    polygonMap.set(city, polygonId);
    saveMapToLocalStorage();

    // Proceed to get soil data with the new polygon ID
    getSoilData(polygonId);
  } catch (error) {
    console.error("Error fetching soil data:", error);
  }
}



async function checkPlant(plant){
  try{
    const prompt = `Only give short,exact number responses, or one word response:Give the optimal planting conditions about the flower "${plant}" in this format:
  Sun conditions: 
  Temp: 
  Soil temp:
  Soil moisture: [in m³/m³]
  First frost for "${cityName}" : [e.g. Nov 18th] 
  Watering needs:`;
    const response = await fetch(AIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AIKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_completion_tokens: 70,
        messages: [{role: "user", content: prompt}]
      })
    })
    plantName = plant;
    const AIData = await response.json();
    console.log(AIData);
    const result = AIData.choices[0].message.content.trim();
    document.querySelector(".plantHeading").textContent = "Optimal Planting Conditions";
    plantGiven = true;
      // Update HTML with response data
      const sunConditions = result.split('\n')[0].split(': ')[1];
      const temp = result.split('\n')[1].split(': ')[1];
      const soilTemp = result.split('\n')[2].split(': ')[1];
      const soilMoisture = result.split('\n')[3].split(': ')[1];
      const frost  = result.split('\n')[4].split(': ')[1];
      const wateringNeeds = result.split('\n')[5].split(': ')[1];
      
      document.querySelector(".plantSun").textContent = "Sun Conditions: "+ sunConditions ;
      document.querySelector(".plantTemp").textContent = "Temperature: " + temp  ;
      document.querySelector(".plantSoilTemp").textContent = "Soil Temperature: " + soilTemp ;
      document.querySelector(".plantSoilMoisture").textContent = "Soil Moisture: " + soilMoisture;
      document.querySelector(".frost").textContent = "First Frost: " + frost ;
      displayReady();
      //document.querySelector('.plantWatering').textContent = wateringNeeds || 'N/A';
  }catch(error) {
    console.error("Error: ", error);
  }
}


plantSearchButton.addEventListener("click", () => {
  checkPlant(plantSearchBox.value);
});

function displayReady() {
  if (locationGiven && !plantGiven) {
    document.querySelector(".instruction").innerHTML =
      "Your location: " + cityName + ". Now, enter your plant name to retrieve currrent planting conditions!";
  } else if (!locationGiven && plantGiven) {
    document.querySelector(".instruction").innerHTML =
      "Your plant: " + plantName + ". Now, enter your location to retrieve currrent weather conditions!";
  } else if (locationGiven && plantGiven) {
    document.querySelector(".instruction").innerHTML =
      "Here are the current planting conditions for " + plantName + "'s in " + cityName + "!";
    document.querySelector(".weather").style.display = "block";
  }
}

