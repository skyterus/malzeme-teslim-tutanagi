// LocalStorage key
const STORAGE_KEY = 'malzemeTeslimTutanaklari';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    tarihAyarla();
    tutanakNoOlustur();
    gecmisTutanaklariYukle();

    // Tab geçişleri
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Form gönderimi
    document.getElementById('tutanakForm').addEventListener('submit', tutanakKaydet);

    // Arama
    document.getElementById('aramaInput').addEventListener('input', gecmisTutanaklariYukle);
});

function tarihAyarla() {
    const bugun = new Date().toISOString().split('T')[0];
    document.getElementById('tarih').value = bugun;
}

function tutanakNoOlustur() {
    const tutanaklar = veriGetir();
    const yil = new Date().getFullYear();
    const sira = tutanaklar.length + 1;
    document.getElementById('tutanakNo').value = `MTT-${yil}-${String(sira).padStart(4, '0')}`;
}

function veriGetir() {
    const veri = localStorage.getItem(STORAGE_KEY);
    return veri ? JSON.parse(veri) : [];
}

function veriKaydet(tutanaklar) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tutanaklar));
}

// Malzeme satırı ekle
function satirEkle() {
    const tbody = document.getElementById('malzemeListesi');
    const satirSayisi = tbody.rows.length + 1;
    const yeniSatir = document.createElement('tr');
    yeniSatir.innerHTML = `
        <td class="sira">${satirSayisi}</td>
        <td><input type="text" name="malzemeAdi" placeholder="Malzeme adı" required></td>
        <td><input type="number" name="miktar" min="1" value="1" required></td>
        <td>
            <select name="birim">
                <option value="Adet">Adet</option>
                <option value="Kutu">Kutu</option>
                <option value="Paket">Paket</option>
                <option value="Koli">Koli</option>
                <option value="Metre">Metre</option>
                <option value="Kg">Kg</option>
                <option value="Litre">Litre</option>
            </select>
        </td>
        <td><input type="text" name="aciklama" placeholder="Opsiyonel"></td>
        <td><button type="button" class="btn-sil" onclick="satirSil(this)" title="Satır Sil">&times;</button></td>
    `;
    tbody.appendChild(yeniSatir);
}

// Malzeme satırı sil
function satirSil(btn) {
    const tbody = document.getElementById('malzemeListesi');
    if (tbody.rows.length <= 1) {
        alert('En az bir malzeme satırı olmalıdır.');
        return;
    }
    btn.closest('tr').remove();
    siralariGuncelle();
}

function siralariGuncelle() {
    const satirlar = document.querySelectorAll('#malzemeListesi tr');
    satirlar.forEach((satir, index) => {
        satir.querySelector('.sira').textContent = index + 1;
    });
}

// Malzeme listesini formdan al
function malzemeleriAl() {
    const satirlar = document.querySelectorAll('#malzemeListesi tr');
    const malzemeler = [];
    satirlar.forEach(satir => {
        malzemeler.push({
            malzemeAdi: satir.querySelector('[name="malzemeAdi"]').value.trim(),
            miktar: satir.querySelector('[name="miktar"]').value,
            birim: satir.querySelector('[name="birim"]').value,
            aciklama: satir.querySelector('[name="aciklama"]').value.trim()
        });
    });
    return malzemeler;
}

// Türkçe tarih ve saat notu oluştur
function turkceTarihSaatNot() {
    const simdi = new Date();
    const gun = String(simdi.getDate()).padStart(2, '0');
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const ay = aylar[simdi.getMonth()];
    const yil = simdi.getFullYear();
    const saat = String(simdi.getHours()).padStart(2, '0');
    const dakika = String(simdi.getMinutes()).padStart(2, '0');
    return `${gun} ${ay} ${yil} ${saat}:${dakika}'da yukarıdaki malzemeler teslim edilmiştir.`;
}

// Tutanak kaydet
function tutanakKaydet(e) {
    e.preventDefault();

    const tutanak = {
        id: Date.now(),
        tutanakNo: document.getElementById('tutanakNo').value,
        tarih: document.getElementById('tarih').value,
        teslimEdenBirim: document.getElementById('teslimEdenBirim').value.trim(),
        teslimEdenKisi: document.getElementById('teslimEdenKisi').value.trim(),
        teslimAlanBirim: document.getElementById('teslimAlanBirim').value.trim(),
        teslimAlanKisi: document.getElementById('teslimAlanKisi').value.trim(),
        malzemeler: malzemeleriAl(),
        genelAciklama: turkceTarihSaatNot(),
        olusturmaTarihi: new Date().toISOString()
    };

    const tutanaklar = veriGetir();
    tutanaklar.unshift(tutanak);
    veriKaydet(tutanaklar);

    alert('Tutanak başarıyla kaydedildi!');
    formuTemizle();
    gecmisTutanaklariYukle();
}

// Formu temizle
function formuTemizle() {
    document.getElementById('tutanakForm').reset();
    const tbody = document.getElementById('malzemeListesi');
    while (tbody.rows.length > 1) {
        tbody.deleteRow(1);
    }
    // İlk satırı temizle
    const ilkSatir = tbody.rows[0];
    ilkSatir.querySelector('[name="malzemeAdi"]').value = '';
    ilkSatir.querySelector('[name="miktar"]').value = '1';
    ilkSatir.querySelector('[name="birim"]').value = 'Adet';
    ilkSatir.querySelector('[name="aciklama"]').value = '';

    tarihAyarla();
    tutanakNoOlustur();
}

// Geçmiş tutanakları yükle
function gecmisTutanaklariYukle() {
    const container = document.getElementById('gecmisTutanaklar');
    let tutanaklar = veriGetir();

    // Arama filtresi
    const arama = document.getElementById('aramaInput').value.toLowerCase().trim();
    if (arama) {
        tutanaklar = tutanaklar.filter(t =>
            t.tutanakNo.toLowerCase().includes(arama) ||
            t.teslimEdenBirim.toLowerCase().includes(arama) ||
            t.teslimAlanBirim.toLowerCase().includes(arama) ||
            t.teslimEdenKisi.toLowerCase().includes(arama) ||
            t.teslimAlanKisi.toLowerCase().includes(arama)
        );
    }

    if (tutanaklar.length === 0) {
        container.innerHTML = '<div class="bos-mesaj">Henüz kayıtlı tutanak bulunmuyor.</div>';
        return;
    }

    container.innerHTML = tutanaklar.map(t => `
        <div class="tutanak-kart">
            <div class="tutanak-kart-header">
                <strong>${t.tutanakNo}</strong>
                <span>${tarihFormatla(t.tarih)}</span>
            </div>
            <div class="tutanak-kart-body">
                <div><strong>Teslim Eden:</strong> ${t.teslimEdenBirim} - ${t.teslimEdenKisi}</div>
                <div><strong>Teslim Alan:</strong> ${t.teslimAlanBirim} - ${t.teslimAlanKisi}</div>
            </div>
            <div class="tutanak-kart-body">
                <div>${t.malzemeler.length} kalem malzeme</div>
            </div>
            <div class="tutanak-kart-actions">
                <button class="btn-goruntule" onclick="tutanakGoruntule(${t.id})">Görüntüle</button>
                <button class="btn-yazdir-kucuk" onclick="tutanakGoruntule(${t.id})">Yazdır</button>
                <button class="btn-sil-kucuk" onclick="tutanakSil(${t.id})">Sil</button>
            </div>
        </div>
    `).join('');
}

function tarihFormatla(tarihStr) {
    const [yil, ay, gun] = tarihStr.split('-');
    return `${gun}.${ay}.${yil}`;
}

// Tutanak görüntüle / yazdır
function tutanakGoruntule(id) {
    const tutanaklar = veriGetir();
    const t = tutanaklar.find(x => x.id === id);
    if (!t) return;

    const icerik = `
        <div class="tutanak-baslik">
            <h2>MALZEME TESLİM TUTANAĞI</h2>
            <p>${t.tutanakNo} | ${tarihFormatla(t.tarih)}</p>
        </div>
        <div class="tutanak-bilgi">
            <div><strong>Teslim Eden Birim:</strong> ${t.teslimEdenBirim}</div>
            <div><strong>Teslim Alan Birim:</strong> ${t.teslimAlanBirim}</div>
            <div><strong>Teslim Eden Kişi:</strong> ${t.teslimEdenKisi}</div>
            <div><strong>Teslim Alan Kişi:</strong> ${t.teslimAlanKisi}</div>
        </div>
        <table class="tutanak-tablo">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Malzeme Adı</th>
                    <th>Miktar</th>
                    <th>Birim</th>
                    <th>Açıklama</th>
                </tr>
            </thead>
            <tbody>
                ${t.malzemeler.map((m, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${m.malzemeAdi}</td>
                        <td>${m.miktar}</td>
                        <td>${m.birim}</td>
                        <td>${m.aciklama || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${t.genelAciklama ? `<div class="tutanak-not"><strong>Not:</strong> ${t.genelAciklama}</div>` : ''}
        <div class="imza-alani">
            <div class="imza-kutusu">
                <div class="cizgi"></div>
                <p><strong>Teslim Eden</strong></p>
                <p>${t.teslimEdenKisi}</p>
            </div>
            <div class="imza-kutusu">
                <div class="cizgi"></div>
                <p><strong>Teslim Alan</strong></p>
                <p>${t.teslimAlanKisi}</p>
            </div>
        </div>
    `;

    document.getElementById('yazdir-icerik').innerHTML = icerik;
    document.getElementById('yazdir-modal').classList.add('aktif');
}

// Tutanak sil
function tutanakSil(id) {
    if (!confirm('Bu tutanağı silmek istediğinize emin misiniz?')) return;

    let tutanaklar = veriGetir();
    tutanaklar = tutanaklar.filter(t => t.id !== id);
    veriKaydet(tutanaklar);
    gecmisTutanaklariYukle();
    tutanakNoOlustur();
}

// Modal işlemleri
function modalKapat() {
    document.getElementById('yazdir-modal').classList.remove('aktif');
}

function sayfaYazdir() {
    const icerik = document.getElementById('yazdir-icerik').innerHTML;

    // Mevcut iframe varsa kaldır
    let iframe = document.getElementById('yazdir-iframe');
    if (iframe) iframe.remove();

    iframe = document.createElement('iframe');
    iframe.id = 'yazdir-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <title>Malzeme Teslim Tutanağı</title>
            <style>
                @page { margin: 0; size: portrait; }
                body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; padding: 15mm; margin: 0; }
                .tutanak-baslik { text-align: center; margin-bottom: 24px; }
                .tutanak-baslik h2 { font-size: 1.3rem; margin-bottom: 4px; }
                .tutanak-baslik p { color: #666; font-size: 0.9rem; }
                .tutanak-bilgi { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 20px; font-size: 0.9rem; }
                .tutanak-bilgi div { padding: 4px 0; }
                .tutanak-bilgi strong { color: #555; }
                .tutanak-tablo { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                .tutanak-tablo th, .tutanak-tablo td { border: 1px solid #999; padding: 8px 10px; text-align: left; font-size: 0.9rem; }
                .tutanak-tablo th { font-weight: 600; background: #e8e8e8; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .tutanak-tablo td { background: #f5f5f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .tutanak-not { margin-bottom: 30px; font-size: 0.9rem; color: #555; }
                .imza-alani { display: flex; justify-content: space-between; margin-top: 50px; }
                .imza-kutusu { text-align: center; width: 200px; }
                .imza-kutusu .cizgi { border-top: 1px solid #333; margin-bottom: 4px; margin-top: 60px; }
                .imza-kutusu p { font-size: 0.85rem; color: #555; }
            </style>
        </head>
        <body>${icerik}</body>
        </html>
    `);
    doc.close();

    iframe.onload = () => {
        iframe.contentWindow.print();
    };
}

// Modal dışına tıklayınca kapat
document.getElementById('yazdir-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('yazdir-modal')) {
        modalKapat();
    }
});
