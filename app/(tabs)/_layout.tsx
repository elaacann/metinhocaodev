import React, { useState } from "react";
import axios from "axios";

export default function App() {
  const API_KEY = "a5fa69e0f0f4e81434abfa40297a0436";
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    const q = city.trim();
    if (!q) {
      setError("Lütfen önce bir şehir adı girin.");
      setWeather(null);
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    const encoded = encodeURIComponent(q);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encoded}&appid=${API_KEY}&units=metric&lang=tr`;

    try {
      const response = await axios.get(url, { timeout: 10000 });
      // console.debug ile yanıtı incele
      console.debug("OpenWeather response:", response);
      setWeather(response.data);
      setError("");
    } catch (err) {
      console.error("Hata detayları:", err);

      // axios hata nesnesinden anlamlı mesaj çıkar
      if (err.response) {
        // Sunucudan gelen cevap (4xx/5xx)
        const status = err.response.status;
        const data = err.response.data || {};
        // OpenWeatherMap genelde { cod: "404", message: "city not found" } döner
        const serverMessage = data.message || JSON.stringify(data);

        if (status === 401) {
          setError("API anahtarı geçersiz veya yetkisiz (401). API key'i kontrol et.");
        } else if (status === 404) {
          setError("Şehir bulunamadı. İsim doğru mu, yazım hatası var mı kontrol et.");
        } else if (status === 429) {
          setError("API isteği limitine ulaşıldı (429). Bir süre sonra tekrar dene.");
        } else {
          setError(`Sunucu hatası ${status}: ${serverMessage}`);
        }
      } else if (err.request) {
        // İstek gönderildi ama cevap alınamadı (network/CORS)
        setError(
          "Sunucuya ulaşılırken problem oldu (ağ/CORS). Tarayıcı konsolunu kontrol et."
        );
      } else {
        // İstek oluşturulurken hata
        setError("İstek sırasında hata oluştu: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") getWeather();
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Poppins', sans-serif; }
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #6aa9ff, #7b6cff);
          display:flex;align-items:center;justify-content:center;padding:24px;color:#fff;
        }
        .card {
          width:100%;max-width:460px;background:rgba(255,255,255,0.14);backdrop-filter:blur(12px);
          border-radius:16px;padding:28px;box-shadow:0 10px 30px rgba(0,0,0,0.25);
        }
        .title { text-align:center;font-size:1.9rem;margin:0 0 18px 0; }
        .search { display:flex;gap:0;margin-bottom:14px; }
        .search input {
          flex:1;padding:12px 14px;border:none;border-radius:10px 0 0 10px;font-size:1rem; outline:none;
        }
        .search button {
          padding:12px 16px;border:none;background:#1f4fff;border-radius:0 10px 10px 0;color:white;font-weight:600;
          cursor:pointer;
        }
        .search button:disabled { opacity:0.6; cursor:not-allowed; }
        .error { margin-top:10px;background:rgba(255,0,0,0.12);padding:10px;border-radius:8px;color:#ffd5d5;}
        .info { text-align:center;margin-top:12px; }
        .city { font-size:1.6rem;font-weight:700;margin:6px 0; }
        .desc { text-transform:capitalize;color:#f3f3f3;margin:6px 0; }
        .temp { font-size:3rem;font-weight:700;margin:8px 0; }
        .details { display:flex;justify-content:space-around;font-size:0.95rem;margin-top:10px;color:#f0f0f0; }
        .footer { text-align:center;margin-top:16px;opacity:0.85;font-size:0.9rem; }
        .small-muted { font-size:0.85rem;color:#e8eefc;opacity:0.9; margin-top:8px; text-align:center; }
      `}</style>

      <div className="app">
        <div className="card" role="region" aria-label="Hava durumu uygulaması">
          <h1 className="title">🌤️ Hava Durumu</h1>

          <div className="search">
            <input
              aria-label="Şehir"
              placeholder="ör: İstanbul veya New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={getWeather} disabled={loading}>
              {loading ? "Yükleniyor..." : "Ara"}
            </button>
          </div>

          {error && <div className="error" role="alert">{error}</div>}

          {weather && (
            <div className="info">
              <div className="city">{weather.name}, {weather.sys?.country || ""}</div>
              <div className="desc">{weather.weather?.[0]?.description}</div>
              <img
                alt={weather.weather?.[0]?.description || "weather icon"}
                src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@2x.png`}
                style={{ width: 100, height: 100 }}
              />
              <div className="temp">{Math.round(weather.main.temp)}°C</div>
              <div className="details">
                <div>💧 Nem: {weather.main.humidity}%</div>
                <div>🌬️ Rüzgar: {weather.wind.speed} m/s</div>
              </div>
              <div className="small-muted">Veri kaynağı: OpenWeatherMap</div>
            </div>
          )}

          <div className="footer">Made by <strong>Ela 🌸</strong></div>
        </div>
      </div>
    </>
  );
}
