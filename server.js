const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tutanaklar.json');

// Data klasörünü oluştur
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Data dosyası yoksa oluştur
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Veri okuma yardımcısı
function veriOku() {
    try {
        const veri = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(veri);
    } catch (e) {
        return [];
    }
}

// Veri yazma yardımcısı
function veriYaz(tutanaklar) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tutanaklar, null, 2), 'utf8');
}

// API: Tüm tutanakları getir
app.get('/api/tutanaklar', (req, res) => {
    const tutanaklar = veriOku();
    res.json(tutanaklar);
});

// API: Yeni tutanak kaydet
app.post('/api/tutanaklar', (req, res) => {
    const tutanaklar = veriOku();
    const yeniTutanak = req.body;
    yeniTutanak.id = Date.now();
    tutanaklar.unshift(yeniTutanak);
    veriYaz(tutanaklar);
    res.json({ basarili: true, id: yeniTutanak.id, mesaj: 'Tutanak kaydedildi.' });
});

// API: Tutanak güncelle
app.put('/api/tutanaklar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let tutanaklar = veriOku();
    const index = tutanaklar.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ basarili: false, mesaj: 'Tutanak bulunamadı.' });
    }
    tutanaklar[index] = { ...req.body, id: id };
    veriYaz(tutanaklar);
    res.json({ basarili: true, mesaj: 'Tutanak güncellendi.' });
});

// API: Tutanak sil
app.delete('/api/tutanaklar/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let tutanaklar = veriOku();
    const oncekiUzunluk = tutanaklar.length;
    tutanaklar = tutanaklar.filter(t => t.id !== id);
    if (tutanaklar.length === oncekiUzunluk) {
        return res.status(404).json({ basarili: false, mesaj: 'Tutanak bulunamadı.' });
    }
    veriYaz(tutanaklar);
    res.json({ basarili: true, mesaj: 'Tutanak silindi.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Malzeme Teslim Tutanağı sunucusu http://0.0.0.0:${PORT} adresinde çalışıyor`);
});
