import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import axios from 'axios';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: '*' }));

async function fetchWeatherData(location, units = 'imperial') {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${units}`;
  try {
    const response = await axios.get(url);
    const { weather, main } = response.data;
    const unitSymbol = units === 'imperial' ? '°F' : '°C';

    return {
      description: weather[0].description,
      temperature: main.temp,
      temperatureUnit: unitSymbol,
      humidity: main.humidity,
      fullDescription: `${weather[0].description} with a temperature of ${main.temp}${unitSymbol} and humidity of ${main.humidity}%`,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

async function getClothingRecommendation(weatherDescription) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: `Given the weather is ${weatherDescription}, what clothing recommendations would you suggest? Please provide the response **exactly** in JSON format with the following structure and no additional text:
          {
            "clothingRecommendations": [
              { "item": "Item name", "description": "Item description" }
            ]
          }`,
        },
      ],
    });

    const assistantMessage = completion.choices[0].message.content.trim();
    const jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error('Error getting clothing recommendation:', error);
    return null;
  }
}

async function getRestaurantsAndActivities(location) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: `Suggest popular restaurants and activities for tourists in ${location}. Provide the response exactly in JSON format with the following structure and no additional text:
          {
            "restaurants": [
              { "name": "Restaurant name", "address": "Restaurant address", "rating": "Restaurant rating" }
            ],
            "activities": [
              { "name": "Activity name", "description": "Activity description" }
            ]
          }`,
        },
      ],
    });

    const assistantMessage = completion.choices[0].message.content.trim();
    const jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.error('Error getting restaurants and activities:', error);
    return null;
  }
}

app.get('/recommendations/:location', async (req, res) => {
  const location = req.params.location;
  const units = req.query.units || 'imperial';

  try {
    const weatherData = await fetchWeatherData(location, units);
    if (!weatherData) return res.status(500).json({ error: 'Failed to fetch weather data.' });

    const recommendation = await getClothingRecommendation(weatherData.fullDescription);
    if (!recommendation) return res.status(500).json({ error: 'Failed to get clothing recommendations.' });

    res.json({ location, weather: weatherData, clothingRecommendation: recommendation });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/restaurants-activities/:location', async (req, res) => {
  const location = req.params.location;

  try {
    const data = await getRestaurantsAndActivities(location);
    if (!data) return res.status(500).json({ error: 'Failed to get restaurant and activity recommendations.' });

    res.json({ location, restaurants: data.restaurants, activities: data.activities });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Serve React frontend

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// Catch-all route for frontend (MUST come after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
