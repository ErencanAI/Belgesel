"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const COUNTRY_FORMATS = {
  TR: {
    name: "Türkiye",
    prefix: "+90",
    generate() {
      const a = randomDigits(3);
      const b = randomDigits(3);
      const c = randomDigits(2);
      const d = randomDigits(2);
      return `+90 5${a} ${b} ${c} ${d}`;
    }
  },

  US: {
    name: "ABD",
    prefix: "+1",
    generate() {
      return `+1 ${randomDigits(3)}-${randomDigits(3)}-${randomDigits(4)}`;
    }
  },

  GB: {
    name: "Birleşik Krallık",
    prefix: "+44",
    generate() {
      return `+44 7${randomDigits(3)} ${randomDigits(3)} ${randomDigits(3)}`;
    }
  },

  DE: {
    name: "Almanya",
    prefix: "+49",
    generate() {
      return `+49 15${randomDigits(8)}`;
    }
  }
};

function randomDigits(length) {
  let result = "";

  for (let i = 0; i < length; i++) {
    result += crypto.randomInt(0, 10);
  }

  return result;
}

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function createVirtualNumber(country) {
  const config = COUNTRY_FORMATS[country];

  if (!config) {
    throw new Error("Desteklenmeyen ülke.");
  }

  return {
    id: generateId(),
    country,
    countryName: config.name,
    number: config.generate(),
    virtual: true,
    real: false,
    smsSupported: false,
    callsSupported: false,
    createdAt: new Date().toISOString()
  };
}

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    app: "Virtual Number Generator",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/countries", (req, res) => {
  const countries = Object.entries(COUNTRY_FORMATS).map(
    ([code, country]) => ({
      code,
      name: country.name,
      prefix: country.prefix
    })
  );

  res.json({
    success: true,
    countries
  });
});

app.get("/api/generate", (req, res) => {
  try {
    const country = String(req.query.country || "TR").toUpperCase();
    const amount = Math.min(
      Math.max(parseInt(req.query.amount, 10) || 1, 1),
      100
    );

    const numbers = [];

    for (let i = 0; i < amount; i++) {
      numbers.push(createVirtualNumber(country));
    }

    res.json({
      success: true,
      count: numbers.length,
      numbers
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post("/api/generate", (req, res) => {
  try {
    const country = String(req.body.country || "TR").toUpperCase();

    const amount = Math.min(
      Math.max(parseInt(req.body.amount, 10) || 1, 1),
      100
    );

    const numbers = [];

    for (let i = 0; i < amount; i++) {
      numbers.push(createVirtualNumber(country));
    }

    res.json({
      success: true,
      count: numbers.length,
      numbers
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/*
|--------------------------------------------------------------------------
| SPA fallback
|--------------------------------------------------------------------------
*/

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/*
|--------------------------------------------------------------------------
| Error handling
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    error: "Sunucu hatası oluştu."
  });
});

/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log("====================================");
  console.log("📱 VIRTUAL NUMBER GENERATOR");
  console.log("====================================");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log("⚠️ Gerçek telefon numarası tahsis edilmez.");
  console.log("⚠️ Üretilen numaralar yalnızca demo/test amaçlıdır.");
  console.log("====================================");
});
