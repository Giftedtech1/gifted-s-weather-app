class WeatherDashboard {
  constructor() {
    this.apiKey = "d2b25814b5b82cf3f869382817c17367"; // chill lol   i left the API key cus its free im not paying for it and no damages can be caused 
    this.animations = new WeatherAnimations();
    this.chart = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startClock();
    this.loadDefaultCity();
  }

  setupEventListeners() {
    const searchBox = document.querySelector(".search-box input");
    const searchBtn = document.querySelector(".search-box button");
    const cityButtons = document.querySelectorAll(".city-btn");

    searchBtn.addEventListener("click", () =>
      this.handleSearch(searchBox.value)
    );
    searchBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch(searchBox.value);
    });

    cityButtons.forEach((button) => {
      button.addEventListener("click", () =>
        this.handleSearch(button.dataset.city)
      );
    });
  }

  startClock() {
    const timeElement = document.querySelector(".live-time");
    const dateElement = document.querySelector(".date");

    const updateTime = () => {
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      dateElement.textContent = now.toLocaleDateString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  async handleSearch(city) {
    try {
      const weatherData = await this.getWeatherData(city);
      this.updateUI(weatherData);
      this.updateLastUpdated();
    } catch (error) {
      this.showError("City not found. Please try again.");
    }
  }
  async getWeatherData(city) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data.");
    }

    return await response.json();
  }
  async getForecast(city) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch forecast data.");
    }

    return await response.json();
  }

  updateUI(data) {
    //  to Update current weather
    document.querySelector(".city").textContent = `${data.name}, Nigeria`;
    document.querySelector(".temp").textContent = `${Math.round(
      data.main.temp
    )}°C`;
    document.querySelector(".weather-description").textContent =
      data.weather[0].description;
    document.querySelector(
      ".weather-icon"
    ).src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Update weather details
    const details = document.querySelectorAll(".detail span");
    details[0].textContent = `Humidity: ${data.main.humidity}%`;
    details[1].textContent = `Wind: ${Math.round(data.wind.speed)} km/h`;
    details[2].textContent = `Feels like: ${Math.round(
      data.main.feels_like
    )}°C`;
    details[3].textContent = `Pressure: ${data.main.pressure} hPa`;

    //  to Update animations
    this.animations.setWeatherAnimation(data.weather[0].id);

    //  to Update forecast
    this.updateForecast(data.name);

    // to Update chart
    this.updateWeatherChart(data.name);
  }

  async updateForecast(city) {
    const forecastData = await this.getForecast(city);
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = "";

    const dailyForecasts = forecastData.list.filter(
      (item, index) => index % 8 === 0
    );

    dailyForecasts.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `
                <div class="forecast-date">${date.toLocaleDateString("en-NG", {
                  weekday: "short",
                })}</div>
                <img src="http://openweathermap.org/img/wn/${
                  forecast.weather[0].icon
                }.png" alt="weather">
                <div class="forecast-temp">${Math.round(
                  forecast.main.temp
                )}°C</div>
                <div class="forecast-desc">${
                  forecast.weather[0].description
                }</div>
            `;
      forecastContainer.appendChild(card);
    });
  }

  async updateWeatherChart(city) {
    const forecast = await this.getForecast(city);
    const hourlyData = forecast.list.slice(0, 8);

    const labels = hourlyData.map((item) =>
      new Date(item.dt * 1000).toLocaleTimeString("en-NG", { hour: "2-digit" })
    );
    const temperatures = hourlyData.map((item) => Math.round(item.main.temp));

    if (this.chart) this.chart.destroy();

    const ctx = document.getElementById("hourlyChart").getContext("2d");
    this.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatures,
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    });
  }

  updateLastUpdated() {
    const lastUpdate = document.querySelector(".last-update");
    lastUpdate.textContent = new Date().toLocaleTimeString("en-NG");
  }

  showError(message) {
    // to Implement error notification lol
    alert(message);
  }

  loadDefaultCity() {
    this.handleSearch("Lagos");
  }
}

class WeatherAnimations {
  constructor() {
    this.container = document.querySelector(".animation-container");
    this.background = document.querySelector(".weather-background");
  }

  clearAnimations() {
    this.container.innerHTML = "";
    this.background.className = "weather-background";
  }

  setWeatherAnimation(weatherCode) {
    this.clearAnimations();

    if (weatherCode >= 200 && weatherCode < 300) {
      this.createThunderstorm();
    } else if (weatherCode >= 300 && weatherCode < 600) {
      this.createRain();
    } else if (weatherCode >= 600 && weatherCode < 700) {
      this.createSnow();
    } else if (weatherCode === 800) {
      this.createSunny();
    } else {
      this.createCloudy();
    }
  }

  createRain() {
    this.background.classList.add("rainy-bg");
    for (let i = 0; i < 100; i++) {
      const drop = document.createElement("div");
      drop.className = "rain-drop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
      drop.style.opacity = Math.random();
      this.container.appendChild(drop);
    }
  }

  createSnow() {
    this.background.classList.add("snowy-bg");
    for (let i = 0; i < 50; i++) {
      const snowflake = document.createElement("div");
      snowflake.className = "snowflake";
      snowflake.innerHTML = "❄";
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
      snowflake.style.opacity = Math.random();
      this.container.appendChild(snowflake);
    }
  }

  createSunny() {
    this.background.classList.add("sunny-bg");
    const sun = document.createElement("div");
    sun.className = "sun";
    this.container.appendChild(sun);
  }

  createCloudy() {
    this.background.classList.add("cloudy-bg");
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement("div");
      cloud.className = "cloud";
      cloud.style.left = `${Math.random() * 100}%`;
      cloud.style.animationDelay = `${i * 2}s`;
      this.container.appendChild(cloud);
    }
  }

  createThunderstorm() {
    this.createRain();
    const lightning = document.createElement("div");
    lightning.className = "lightning";
    this.container.appendChild(lightning);
  }
}

// to Initialize the dashboard when the DOM is loaded  
document.addEventListener("DOMContentLoaded", () => {
  new WeatherDashboard();
});
