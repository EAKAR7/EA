export interface Personnel {
  id: string;
  sicilNo: string;
  adSoyad: string;
  unvan: string;
  muhurNo: string;
  birim: string;
  servis: string;
  iseGirisTarihi: string;
  bankacilikKidemiBaslangicTarihi: string;
  ayriKalinanSureBankacilik: number;
  denetimKidemiBaslangicTarihi: string;
  ayriKalinanSureDenetim: number;
  terfiyeEklenecekSure: number;
  bankacilikKidemi: number;
  denetimKidemi: number;
  sonrakiTerfiTarihi: string;
  terfiyeUygun: string;
  istenCikisTarihi: string | null;
  durum: "Aktif" | "Pasif";
}

export const defaultPersonnel: Personnel = {
  id: "",
  sicilNo: "",
  adSoyad: "",
  unvan: "",
  muhurNo: "-",
  birim: "",
  servis: "",
  iseGirisTarihi: "",
  bankacilikKidemiBaslangicTarihi: "",
  ayriKalinanSureBankacilik: 0,
  denetimKidemiBaslangicTarihi: "",
  ayriKalinanSureDenetim: 0,
  terfiyeEklenecekSure: 0,
  bankacilikKidemi: 0,
  denetimKidemi: 0,
  sonrakiTerfiTarihi: "",
  terfiyeUygun: "Evet",
  istenCikisTarihi: null,
  durum: "Aktif",
};

export const unvanOptions = [
  "Müfettiş Yardımcısı",
  "Yetkili Müfettiş Yardımcısı",
  "Müfettiş",
  "Kıdemli Müfettiş",
  "Başmüfettiş",
  "Başkan Yardımcısı",
  "Başkan",
];

export const birimOptions = [
  "Teftiş Kurulu Başkanlığı",
  "Bankacılık Denetimleri Başkan Yardımcılığı",
  "Bilgi Sistemleri Denetimleri Başkan Yardımcılığı",
];

export const servisOptions = {
  "Bilgi Sistemleri Denetimleri Başkan Yardımcılığı": [
    "BS Merkezi Denetimler ve İnceleme",
    "Bilgi Sistemleri Süreç Denetimleri",
    "Denetim Analitiği",
  ],
  "Bankacılık Denetimleri Başkan Yardımcılığı": [
    "Şube Denetimleri",
    "İştirak ve Birim Denetimleri",
    "İnceleme ve Soruşturma",
    "Merkezi Denetimler",
  ],
  "Teftiş Kurulu Başkanlığı": [],
};

export const terfiyeUygunOptions = ["Evet", "Hayır", "-"];
