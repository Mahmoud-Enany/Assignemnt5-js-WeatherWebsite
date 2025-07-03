document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('locationInput');
    const findButton = document.querySelector('.search-btn');
    const weatherCards = document.getElementById('weatherCards');

    const API_KEY = 'b1026a20185748dfbf5175609250307';

    // Function to get day name from date
    function getDayName(dateString) {
        const date = new Date(dateString);
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    // Function to get formatted date
    function getFormattedDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        return `${day} ${month}`;
    }

    // Function to get weather icon class
    function getWeatherIcon(condition, isDay) {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
            return isDay ? 'fas fa-sun sunny' : 'fas fa-moon';
        } else if (conditionLower.includes('cloud')) {
            return 'fas fa-cloud';
        } else if (conditionLower.includes('rain')) {
            return 'fas fa-cloud-rain';
        } else if (conditionLower.includes('snow')) {
            return 'fas fa-snowflake';
        } else {
            return isDay ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Function to update weather cards
    function updateWeatherCards(data) {
        const location = data.location;
        const current = data.current;
        const forecast = data.forecast.forecastday;

        let cardsHTML = '';

        // First card - Current day with detailed info
        const currentDay = forecast[0];
        const currentDayName = getDayName(currentDay.date);
        const currentIcon = getWeatherIcon(current.condition.text, current.is_day);
        const currentConditionClass = current.condition.text.toLowerCase().includes('sunny') ? 'sunny-text' : '';

        cardsHTML += `
            <div class="col-md-4 mb-4">
                <div class="weather-card">
                    <div class="card-header">
                        <h5>${currentDayName}</h5>
                    </div>
                    <div class="card-body">
                        <h3 class="city-name">${location.name}</h3>
                        <div class="temperature">${current.temp_c}°C</div>
                        <div class="weather-icon-container">
                            <i class="${currentIcon} weather-condition-icon"></i>
                        </div>
                        <div class="condition ${currentConditionClass}">${current.condition.text}</div>
                        <div class="weather-details">
                            <div class="detail-item">
                                <i class="fas fa-eye"></i>
                                <span>${current.humidity}%</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-wind"></i>
                                <span>${current.wind_kph}km/h</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-compass"></i>
                                <span>${current.wind_dir}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Next two days
        for (let i = 1; i < 3; i++) {
            const day = forecast[i];
            const dayName = i === 1 ? getFormattedDate(day.date) : getDayName(day.date);
            const icon = getWeatherIcon(day.day.condition.text, true);
            const conditionClass = day.day.condition.text.toLowerCase().includes('sunny') ? 'sunny-text' : '';

            cardsHTML += `
                <div class="col-md-4 mb-4">
                    <div class="weather-card">
                        <div class="card-header">
                            <h5>${dayName}</h5>
                        </div>
                        <div class="card-body">
                            <div class="temperature">${Math.round(day.day.maxtemp_c)}°C</div>
                            <div class="low-temp">${Math.round(day.day.mintemp_c)}°</div>
                            <div class="weather-icon-container">
                                <i class="${icon} weather-condition-icon"></i>
                            </div>
                            <div class="condition ${conditionClass}">${day.day.condition.text}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        weatherCards.innerHTML = cardsHTML;
    }

    // Function to fetch weather data
    async function fetchWeatherData(city) {
        try {
            console.log('Fetching weather for:', city);
            const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Weather data received:', data);
            
            if (data.error) {
                alert(`Error: ${data.error.message}`);
                return;
            }
            
            updateWeatherCards(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please check the city name and try again.');
        }
    }

    // Function to search weather
    function searchWeather() {
        const city = searchInput.value.trim();
        console.log('Search triggered for city:', city);
        if (city) {
            fetchWeatherData(city);
        } else {
            alert('Please enter a city name.');
        }
    }

    // Event listeners
    if (findButton) {
        findButton.addEventListener('click', searchWeather);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchWeather();
            }
        });
    }

    // Get user's location and fetch weather data
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    fetchWeatherData(`${lat},${lon}`);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    // Default to Cairo if geolocation fails
                    fetchWeatherData('Cairo');
                }
            );
        } else {
            console.log('Geolocation is not supported by this browser.');
            // Default to Cairo if geolocation is not supported
            fetchWeatherData('Cairo');
        }
    }

    // Initialize with user's location or default city
    getUserLocation();

    // Make functions globally available
    window.searchWeather = searchWeather;
    window.fetchWeatherData = fetchWeatherData;
});

