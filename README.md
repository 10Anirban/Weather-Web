# WeatherFlow - Minimalist Weather Website

A beautiful, responsive weather website built with HTML, CSS, and JavaScript using the Open-Meteo API.

## Feature
### 🌤️ Real Weather Data
- **Current Weather**: Temperature, conditions, humidity, wind speed, UV index
- **Hourly Forecast**: 24-hour weather predictions
- **7-Day Forecast**: Weekly weather outlook
- **Air Quality**: Real-time AQI with health recommendations
- **Sun Times**: Sunrise and sunset with progress indicato
### 🎨 Beautiful UI
- **Modern Design**: Clean, minimalist interface using Tailwind CSS
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode**: Automatic dark/light theme support
- **Smooth Animations**: Elegant transitions and loading states
- **Material Icons**: Beautiful weather condition icons

### 🔍 User Features
- **City Search**: Search for any city worldwide
- **Geolocation**: Auto-detect user's location
- **Tab Navigation**: Easy switching between Today, Hourly, and Forecast views
- **Error Handling**: Graceful error messages and retry functionality
- **Loading States**: Smooth loading animations

## Technology Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: No frameworks, pure JS
- **Open-Meteo API**: Free weather data (no API key required)
- **Google Fonts**: Inter font family
- **Material Symbols**: Weather icons

## API Integration

### API Features Used
- Current weather conditions
- Hourly temperature and precipitation
- Daily forecasts
- UV index
- Air quality index
- Sunrise/sunset times
- Wind speed and direction
- Humidity levels

## File Structure

```
WeatherFlow/
├── index.html          # Main HTML file with UI structure
├── weather.js          # JavaScript application logic
└── README.md           # This documentation
```

## Getting Started

1. **Open the Website**
   ```bash
   # Simply open index.html in your browser
   open index.html
   ```

2. **Features Available**
   - Default location: San Francisco
   - Search for any city
   - Click location button for auto-detection
   - Switch between Today, Hourly, and 7-Day views

## Usage

### Search for a City
1. Type a city name in the search bar
2. Press Enter or click away
3. Weather data will update automatically

### Get Current Location
1. Click the location button (📍)
2. Allow browser location access
3. Weather will update for your current location

### Navigate Views
1. Click "Today" for current weather
2. Click "Hourly" for 24-hour forecast
3. Click "7-Day Forecast" for weekly outlook

## Weather Data

### Temperature Units
- Currently displays in Fahrenheit (°F)
- Can be easily modified to Celsius in weather.js

### Weather Conditions
- Clear, Cloudy, Rain, Snow, Thunderstorm
- Automatically mapped to appropriate icons
- Detailed descriptions for all weather codes

### Air Quality Index
- European AQI scale (0-500)
- Color-coded health recommendations
- Real-time pollution levels

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Performance

- **Fast Loading**: Minimal dependencies
- **Responsive**: Optimized for all screen sizes
- **Efficient**: Single API call for comprehensive data
- **Cached**: Smart data handling to minimize requests

## Customization

### Change Default Location
Edit `weather.js` line:
```javascript
this.currentLocation = { lat: 37.7749, lon: -122.4194, name: 'San Francisco' };
```

### Temperature Units
Edit `weather.js` line:
```javascript
this.currentUnit = 'C'; // Change to 'C' for Celsius
```

### Colors and Styling
Edit `index.html` Tailwind config:
```javascript
colors: {
    "primary": "#135bec", // Change primary color
    // ... other colors
}
```

## API Limits

- **Open-Meteo**: No API key required, no rate limits
- **Geocoding**: No API key required
- **Free Forever**: Completely free weather data

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - Feel free to use this project for personal or commercial purposes.

---

**Built with ❤️ using Open-Meteo API**
