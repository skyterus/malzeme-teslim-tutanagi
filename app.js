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
        genelAciklama: document.getElementById('genelAciklama').value.trim(),
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
    window.print();
}

// Modal dışına tıklayınca kapat
document.getElementById('yazdir-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('yazdir-modal')) {
        modalKapat();
    }
});
