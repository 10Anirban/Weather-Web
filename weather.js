// WeatherFlow - Glassmorphic Weather App with Chart.js
// Add your API key here (replace with your actual key)
const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with: sk-live-Ua9MsvVeoTlvsRBtUBEsavTA8ATvlgugdif6fHkY

class WeatherApp {
    constructor() {
        this.currentLocation = { lat: 48.856, lon: 2.3522, name: 'Paris, France' }; // Default: Paris
        this.currentUnit = 'C';
        this.chart = null;
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWeatherData();
        this.updateDateTime();
        this.initChart();
        setInterval(() => this.updateDateTime(), 60000); // Update every minute
    }

    setupEventListeners() {
        // City search
        const citySearch = document.getElementById('citySearch');
        citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCity(citySearch.value);
            }
        });

        // Temperature unit toggle
        const unitToggle = document.getElementById('unitToggle');
        unitToggle.addEventListener('click', () => {
            this.toggleTemperatureUnit();
        });

        // Geolocation button
        const geolocationBtn = document.getElementById('geolocationBtn');
        geolocationBtn.addEventListener('click', () => {
            this.getUserLocation();
        });

        // Retry button
        document.getElementById('retryBtn')?.addEventListener('click', () => {
            this.loadWeatherData();
        });
    }

    toggleTemperatureUnit() {
        this.currentUnit = this.currentUnit === 'C' ? 'F' : 'C';
        document.getElementById('unitToggle').textContent = `°${this.currentUnit}`;
        
        // Reload weather data to update all temperatures
        this.loadWeatherData();
    }

    convertTemperature(temp) {
        if (this.currentUnit === 'F') {
            return Math.round((temp * 9/5) + 32);
        }
        return Math.round(temp);
    }

    async getUserLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.showLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    name: 'Your Location'
                };
                await this.loadWeatherData();
                this.showLoading(false);
            },
            (error) => {
                this.showError('Unable to retrieve your location. Please enable location services.');
                this.showLoading(false);
            }
        );
    }

    async searchCity(cityName) {
        if (!cityName.trim()) return;
        
        this.showLoading(true);
        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const location = data.results[0];
                this.currentLocation = {
                    lat: location.latitude,
                    lon: location.longitude,
                    name: `${location.name}, ${location.country}`
                };
                await this.loadWeatherData();
            } else {
                this.showError('City not found. Please try another location.');
            }
        } catch (error) {
            this.showError('Failed to search for city. Please try again.');
        }
        this.showLoading(false);
    }

    getCacheKey(lat, lon) {
        return `${lat},${lon}`;
    }

    isCacheValid(cacheEntry) {
        return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
    }

    async loadWeatherData() {
        const cacheKey = this.getCacheKey(this.currentLocation.lat, this.currentLocation.lon);
        const cachedData = this.cache.get(cacheKey);
        
        if (this.isCacheValid(cachedData)) {
            // Use cached data
            this.updateCurrentWeather(cachedData.data);
            this.updateChart(cachedData.data.hourly);
            this.updateWeeklyForecast(cachedData.data.daily);
            return;
        }

        this.showLoading(true);
        try {
            // Get current weather
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${this.currentLocation.lat}&longitude=${this.currentLocation.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,uv_index,visibility,apparent_temperature,precipitation_probability,precipitation,pressure_msl&daily=uv_index_max,sunrise,sunset,weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
            );
            const weatherData = await weatherResponse.json();

            // Cache the data
            this.cache.set(cacheKey, {
                data: weatherData,
                timestamp: Date.now()
            });

            // Update UI with weather data
            this.updateCurrentWeather(weatherData);
            this.updateChart(weatherData.hourly);
            this.updateWeeklyForecast(weatherData.daily);
            
        } catch (error) {
            this.showError('Failed to load weather data. Please check your connection.');
        }
        this.showLoading(false);
    }

    updateCurrentWeather(data) {
        // Update city name
        document.getElementById('cityName').textContent = this.currentLocation.name;
        
        // Update current weather
        if (data.current_weather && data.hourly) {
            const current = data.current_weather;
            const hourly = data.hourly;
            const daily = data.daily;
            const temp = this.convertTemperature(current.temperature);
            document.getElementById('currentTemp').textContent = `${temp}°`;
            document.getElementById('weatherDescription').textContent = this.getWeatherDescription(current.weathercode);
            document.getElementById('weatherIcon').textContent = this.getWeatherIcon(current.weathercode);
            
            // Get current hour index for hourly data
            const now = new Date();
            const currentHour = now.getHours();
            
            // Update stats with proper data access
            document.getElementById('humidity').textContent = `${hourly.relativehumidity_2m[currentHour] || 65}%`;
            document.getElementById('windSpeed').textContent = `${Math.round(current.windspeed * 3.6)} km/h`;
            document.getElementById('visibility').textContent = `${hourly.visibility ? Math.round(hourly.visibility[currentHour] / 1000) || 10 : 10} km`;
            document.getElementById('uvIndex').textContent = this.getUVDescription(hourly.uv_index ? hourly.uv_index[currentHour] || 3 : 3);
            
            // Update precipitation chance
            const precipitationChance = hourly.precipitation_probability ? hourly.precipitation_probability[currentHour] || 0 : 0;
            document.getElementById('precipitation').textContent = `${Math.round(precipitationChance)}%`;
            
            // Update pressure
            const pressure = hourly.pressure_msl ? Math.round(hourly.pressure_msl[currentHour]) : 1013;
            document.getElementById('pressure').textContent = `${pressure} mb`;
            
            // Update sunrise and sunset
            if (daily && daily.sunrise && daily.sunset) {
                const sunriseTime = new Date(daily.sunrise[0]);
                const sunsetTime = new Date(daily.sunset[0]);
                document.getElementById('sunrise').textContent = sunriseTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                document.getElementById('sunset').textContent = sunsetTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }
            
            // Update feels like temperature
            const feelsLike = hourly.apparent_temperature ? this.convertTemperature(hourly.apparent_temperature[currentHour]) : temp;
            document.querySelector('.feels').textContent = `Feels like ${feelsLike}°${this.currentUnit}`;
        }
    }

    updateWeeklyForecast(dailyData) {
        if (!dailyData || !document.getElementById('weeklyForecast')) return;
        
        const weeklyForecastContainer = document.getElementById('weeklyForecast');
        weeklyForecastContainer.innerHTML = '';
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().getDay();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            const dayIndex = (today + i) % 7;
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[dayIndex];
            
            const highTemp = this.convertTemperature(dailyData.temperature_2m_max[i]);
            const lowTemp = this.convertTemperature(dailyData.temperature_2m_min[i]);
            const weatherCode = dailyData.weathercode[i];
            const precipitation = dailyData.precipitation_sum[i];
            
            const forecastDay = document.createElement('div');
            forecastDay.className = 'forecast-day';
            forecastDay.innerHTML = `
                <div class="forecast-date">
                    <span style="font-size: 20px; margin-right: 8px;">${this.getWeatherIcon(weatherCode)}</span>
                    ${dayName}
                </div>
                <div class="forecast-weather">
                    ${this.getWeatherDescription(weatherCode)}
                    ${precipitation > 0 ? ` • ${Math.round(precipitation)}mm` : ''}
                </div>
                <div class="forecast-temps">
                    <span class="high">${highTemp}°</span>
                    <span class="low">${lowTemp}°</span>
                </div>
            `;
            
            weeklyForecastContainer.appendChild(forecastDay);
        }
    }

    updateChart(hourlyData) {
        if (!this.chart || !hourlyData) return;
        
        // Get next 6 hours of data
        const labels = [];
        const temperatures = [];
        const now = new Date();
        
        for (let i = 0; i < 6; i++) {
            const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
            labels.push(hour.getHours() + ':00');
            temperatures.push(this.convertTemperature(hourlyData.temperature_2m[i] || 20));
        }
        
        // Smooth update without destroying/recreating the chart
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = temperatures;
        this.chart.update('none'); // Update without animation to prevent scratching
    }

    initChart() {
        const ctx = document.getElementById('chart');
        if (!ctx) return;

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Now', '15:00', '18:00', '21:00', '00:00', '03:00'],
                datasets: [{
                    data: [24, 26, 22, 19, 17, 18],
                    borderColor: 'white',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointBackgroundColor: 'white',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 3,
                animation: {
                    duration: 0
                },
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'white',
                        borderWidth: 1,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: { 
                        ticks: { color: 'white', font: { family: 'Inter' } }, 
                        grid: { display: false },
                        border: { display: false }
                    },
                    y: { 
                        display: false,
                        border: { display: false }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    line: {
                        borderJoinStyle: 'round'
                    }
                }
            }
        });
    }

    updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = now.toLocaleDateString('en-US', options);
        document.getElementById('currentDate').textContent = formattedDate;
    }

    getWeatherIcon(weatherCode) {
        const icons = {
            0: '☀️',    // Clear sky
            1: '🌤️',    // Mainly clear
            2: '⛅',     // Partly cloudy
            3: '☁️',     // Overcast
            45: '🌫️',    // Fog
            48: '🌫️',    // Fog
            51: '🌦️',    // Drizzle
            53: '🌦️',    // Drizzle
            55: '🌦️',    // Drizzle
            56: '🌨️',    // Freezing Drizzle
            57: '🌨️',    // Freezing Drizzle
            61: '🌧️',    // Rain
            63: '🌧️',    // Rain
            65: '🌧️',    // Rain
            66: '🌨️',    // Freezing Rain
            67: '🌨️',    // Freezing Rain
            71: '🌨️',    // Snow fall
            73: '🌨️',    // Snow fall
            75: '🌨️',    // Snow fall
            77: '🌨️',    // Snow grains
            80: '🌦️',    // Rain showers
            81: '🌦️',    // Rain showers
            82: '🌦️',    // Rain showers
            85: '🌨️',    // Snow showers
            86: '🌨️'     // Snow showers
        };
        return icons[weatherCode] || '⛅';
    }

    getWeatherDescription(weatherCode) {
        const codes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Fog',
            48: 'Fog',
            51: 'Drizzle',
            53: 'Drizzle',
            55: 'Drizzle',
            56: 'Freezing Drizzle',
            57: 'Freezing Drizzle',
            61: 'Rain',
            63: 'Rain',
            65: 'Rain',
            66: 'Freezing Rain',
            67: 'Freezing Rain',
            71: 'Snow fall',
            73: 'Snow fall',
            75: 'Snow fall',
            77: 'Snow grains',
            80: 'Rain showers',
            81: 'Rain showers',
            82: 'Rain showers',
            85: 'Snow showers',
            86: 'Snow showers'
        };
        return codes[weatherCode] || 'Partly Cloudy';
    }

    getUVDescription(uvIndex) {
        if (uvIndex <= 2) return `${Math.round(uvIndex)} Low`;
        if (uvIndex <= 5) return `${Math.round(uvIndex)} Med`;
        if (uvIndex <= 7) return `${Math.round(uvIndex)} High`;
        if (uvIndex <= 10) return `${Math.round(uvIndex)} Very High`;
        return `${Math.round(uvIndex)} Extreme`;
    }

    showLoading(show) {
        document.getElementById('loadingState').classList.toggle('hidden', !show);
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorState').classList.remove('hidden');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
