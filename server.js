"use strict";

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(express.json());

/* =====================================================
   STATIC DOSYALAR
===================================================== */

const publicPath = path.join(__dirname, "public");

app.use(
  express.static(publicPath, {
    extensions: ["html"]
  })
);


/* =====================================================
   UYGULAMA BİLGİSİ
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "DOCUVIA",
    apiKeyRequired: false,
    time: new Date().toISOString()
  });
});


/* =====================================================
   KATEGORİLER
===================================================== */

const categories = [
  {
    id: "uzay",
    name: "Uzay",
    query: "uzay belgeseli"
  },
  {
    id: "bilim",
    name: "Bilim",
    query: "bilim belgeseli"
  },
  {
    id: "doga",
    name: "Doğa",
    query: "doğa belgeseli"
  },
  {
    id: "hayvanlar",
    name: "Hayvanlar",
    query: "hayvan belgeseli"
  },
  {
    id: "tarih",
    name: "Tarih",
    query: "tarih belgeseli"
  },
  {
    id: "teknoloji",
    name: "Teknoloji",
    query: "teknoloji belgeseli"
  },
  {
    id: "okyanus",
    name: "Okyanus",
    query: "okyanus belgeseli"
  },
  {
    id: "arkeoloji",
    name: "Arkeoloji",
    query: "arkeoloji belgeseli"
  },
  {
    id: "astronomi",
    name: "Astronomi",
    query: "astronomi belgeseli"
  },
  {
    id: "antarktika",
    name: "Antarktika",
    query: "antarktika belgeseli"
  }
];

app.get("/api/categories", (req, res) => {
  res.json({
    ok: true,
    categories
  });
});


/* =====================================================
   API'SİZ ARAMA ALTYAPISI
===================================================== */

/*
  Burada bilerek sahte video ID'si üretmiyoruz.

  API anahtarı olmadığı için dış kaynaklardan alınan
  verileri daha sonra buraya bağlayacağız.

  Şimdilik güvenli bir JSON endpoint'i sağlıyoruz.
*/

app.get("/api/search", async (req, res) => {

  const q = String(
    req.query.q || ""
  ).trim();

  if (!q) {
    return res.status(400).json({
      ok: false,
      error: "Arama kelimesi gerekli."
    });
  }

  res.json({
    ok: true,
    apiKeyRequired: false,
    query: q,
    videos: [],
    nextPage: null,
    message:
      "API'siz arama motoru hazır. İçerik sağlayıcı bağlantısı eklenebilir."
  });
});


/* =====================================================
   ANA SAYFA
===================================================== */

app.get("/", (req, res) => {

  res.sendFile(
    path.join(
      publicPath,
      "index.html"
    )
  );

});


/* =====================================================
   404
===================================================== */

app.use((req, res) => {

  if (req.path.startsWith("/api/")) {

    return res.status(404).json({
      ok: false,
      error: "API endpoint bulunamadı."
    });

  }

  res.sendFile(
    path.join(
      publicPath,
      "index.html"
    )
  );

});


/* =====================================================
   HATA YAKALAMA
===================================================== */

app.use((err, req, res, next) => {

  console.error(
    "[DOCUVIA ERROR]",
    err
  );

  res.status(500).json({
    ok: false,
    error: "Sunucu hatası."
  });

});


/* =====================================================
   SERVER
===================================================== */

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log("");
    console.log("================================");
    console.log("       DOCUVIA SERVER");
    console.log("================================");
    console.log(
      "Port:",
      PORT
    );
    console.log(
      "API Key: YOK"
    );
    console.log(
      "URL:",
      `http://localhost:${PORT}`
    );
    console.log("================================");
    console.log("");

  }
); 
