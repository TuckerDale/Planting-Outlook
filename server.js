require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const port = 5500;

app.use(express.json());

app.post('/get-soil-data', async (req, res) => {
  const { polygonId } = req.body;
  const soilKey = process.env.SOIL_API;
  const soilURL = `http://api.agromonitoring.com/agro/1.0/soil?polyid=${polygonId}&appid=${soilKey}`;

  try {
    const response = await fetch(soilURL);
    const data = await response.json();
    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error fetching soil data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/get-weather-data', async (req, res) => {
  const { city } = req.body;
  const weatherKey = process.env.WEATHER_API;
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=imperial`;

  try {
    const response = await fetch(weatherURL);
    const data = await response.json();
    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/get-openai-data', async (req, res) => {
  const { plant, cityName } = req.body;
  const openaiKey = process.env.AI_API;
  const AIUrl = "https://api.openai.com/v1/chat/completions";

  const prompt = `Only give short, exact number responses, or one-word response: Give the optimal planting conditions for the flower "${plant}" in this format:
    Sun conditions: 
    Temp: 
    Soil temp:
    Soil moisture: [in m³/m³]
    First frost for "${cityName}" : [e.g. Nov 18th] 
    Watering needs:`;

  try {
    const response = await fetch(AIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 70,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error fetching OpenAI data:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
