import { NewsArticle, BreakingAlert } from '../types';

export const BREAKING_ALERTS: BreakingAlert[] = [
  {
    id: 'brk-1',
    headline: 'Bank Indonesia Pertahankan Suku Bunga Acuan BI-Rate di Level 6,00% untuk Jaga Stabilitas Rupiah',
    country: 'Indonesia',
    countryCode: 'ID',
    urgency: 'breaking',
    timestamp: 'Baru saja',
  },
  {
    id: 'brk-2',
    headline: 'Federal Reserve Isyaratkan Pemangkasan Suku Bunga Bertahap Seiring Penurunan Laju Inflasi AS',
    country: 'United States of America',
    countryCode: 'US',
    urgency: 'urgent',
    timestamp: '15 mnt lalu',
  },
  {
    id: 'brk-3',
    headline: 'Jepang dan ASEAN Sepakati Kerjasama Ketahanan Rantai Pasok Semikonduktor & Energi Bersih',
    country: 'Japan',
    countryCode: 'JP',
    urgency: 'update',
    timestamp: '42 mnt lalu',
  },
  {
    id: 'brk-4',
    headline: 'Uni Eropa Resmi Terapkan Regulasi AI Act: Standar Global Baru Pengawasan Kecerdasan Buatan',
    country: 'Germany',
    countryCode: 'DE',
    urgency: 'update',
    timestamp: '1 jam lalu',
  },
];

export const CURATED_NEWS: Record<string, NewsArticle[]> = {
  'Indonesia': [
    {
      id: 'id-1',
      countryName: 'Indonesia',
      countryCode: 'ID',
      title: 'Pembangunan Tahap Lanjutan IKN Nusantara Fokus pada Pusat Finansial Hijau dan Ekosistem Riset',
      titleEn: 'Next Phase of Nusantara Capital Focuses on Green Financial Center and Research Ecosystem',
      summary: 'Otorita Ibu Kota Nusantara (OIKN) mengumumkan percepatan pembangunan klaster finansial terbarukan dan pusat riset hayati tropis dengan investasi swasta domestik dan internasional.',
      summaryEn: 'The Nusantara Capital Authority announced accelerated development of renewable financial clusters and tropical research centers with private investment.',
      category: 'Ekonomi',
      source: 'Antara News',
      publishedAt: '18 menit lalu',
      readTimeMinutes: 3,
      author: 'Bambang Sulistyo',
      imageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Investasi swasta telah melampaui target awal kuartal ini dengan fokus pada energi terbarukan.',
        'Sistem transportasi cerdas nir-emisi mulai diuji coba secara bertahap di Kawasan Inti Pusat Pemerintahan.',
        'Kemitraan strategis dengan investor Asia Timur memperkuat pendanaan infrastruktur digital.',
      ],
      fullContent: [
        'IKN NUSANTARA — Otorita Ibu Kota Nusantara (OIKN) bersama kementerian terkait mengonfirmasi dimulainya konstruksi fasilitas perbankan hijau serta pusat inovasi teknologi berkelanjutan di kawasan inti IKN.',
        'Kepala Otorita menyampaikan bahwa fokus saat ini adalah membangun ekosistem perkotaan berbasis kecerdasan buatan (Smart City) dan 100 persen energi terbarukan. Fasilitas energi surya berkapasitas 50 MW telah beroperasi stabil menyuplai kebutuhan esensial.',
        '"Kami memastikan setiap jengkal pembangunan mengedepankan prinsip kelestarian hutan hujan tropis Kalimantan. Lebih dari 65 persen area tetap dipertahankan sebagai zona hijau terlindungi," tegas juru bicara OIKN.',
        'Respons pasar modal dan investor institusi menunjukkan tren positif seiring diberikannya berbagai insentif perpajakan dan kemudahan hak guna bangunan jangka panjang.',
      ],
    },
    {
      id: 'id-2',
      countryName: 'Indonesia',
      countryCode: 'ID',
      title: 'Hilirisasi Nikel dan Baterai Listrik Nasional Catat Lonjakan Nilai Ekspor dan Serapan Tenaga Kerja',
      titleEn: 'Nickel Downstreaming and Electric Vehicle Battery Output Surge in Export Value',
      summary: 'Kementerian Perindustrian melaporkan peningkatan kapasitas ekspor produk turunan nikel bernilai tambah tinggi serta rantai pasok kendaraan listrik regional.',
      category: 'Ekonomi',
      source: 'CNBC Indonesia',
      publishedAt: '1 jam lalu',
      readTimeMinutes: 4,
      author: 'Rina Kartika',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Ekspor prekursor baterai naik 24% secara tahunan (YoY).',
        'Pemerintah mendorong kepatuhan standar lingkungan (ESG) yang lebih ketat di seluruh fasilitas smelter.',
        'Program pelatihan vokasi lokal berhasil menyerap puluhan ribu teknisi muda.',
      ],
      fullContent: [
        'JAKARTA — Transformasi industri manufaktur Indonesia menuju ekosistem kendaraan bermotor listrik berbasis baterai (KBLBB) semakin menampakkan hasil signifikan.',
        'Data terkini menunjukkan peningkatan ekspor produk hasil hilirisasi mineral yang kini tidak lagi bertumpu pada bijih mentah. Langkah ini memberikan kontribusi nyata terhadap cadangan devisa dan stabilitas nilai tukar Rupiah.',
        'Menteri Koordinator menekankan komitmen pemerintah dalam menerapkan praktik ramah lingkungan, termasuk transisi pasokan listrik smelter dari PLTU ke hidro dan gas.',
      ],
    },
    {
      id: 'id-3',
      countryName: 'Indonesia',
      countryCode: 'ID',
      title: 'BRIN Kembangkan Varietas Padi Tahan Cuaca Ekstrem untuk Jaga Kedaulatan Pangan Nasional',
      titleEn: 'National Research Agency Develops Climate-Resilient Rice Varieties for Food Security',
      summary: 'Badan Riset dan Inovasi Nasional (BRIN) merilis benih padi unggul yang adaptif terhadap anomali cuaca El Nino dan genangan banjir.',
      category: 'Sains',
      source: 'Kompas Sains',
      publishedAt: '3 jam lalu',
      readTimeMinutes: 2,
      author: 'Ahmad Fauzi',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Varietas baru mampu menghasilkan hingga 9,2 ton gabah kering panen per hektare.',
        'Kebutuhan air irigasi berkurang sekitar 25% dibandingkan benih konvensional.',
        'Distribusi bibit ke petani di Pulau Jawa dan Sulawesi segera dimulai musim tanam ini.',
      ],
      fullContent: [
        'BOGOR — Peneliti pemuliaan tanaman dari BRIN berhasil menciptakan galur padi baru yang dirancang khusus menghadapi dampak nyata perubahan iklim global di kawasan tropis.',
        'Varietas ini memiliki sistem perakaran yang lebih dalam sehingga mampu bertahan pada periode kemarau berkepanjangan tanpa penurunan produktivitas yang drastis.',
        'Menteri Pertanian menyambut antusias temuan ini sebagai benteng utama pertahanan pangan nasional di tengah volatilitas harga beras global.',
      ],
    },
  ],

  'United States of America': [
    {
      id: 'us-1',
      countryName: 'United States of America',
      countryCode: 'US',
      title: 'Wall Street Menguat Seiring Inflasi Melandai Menuju Target 2% dan Kinerja Positif Sektor Teknologi',
      titleEn: 'Wall Street Rallies as Inflation Cools Toward 2% Target with Tech Strength',
      summary: 'Indeks S&P 500 dan Nasdaq ditutup di zona hijau menyusul rilis data indeks harga konsumen (CPI) yang lebih rendah dari perkiraan konsensus.',
      category: 'Ekonomi',
      source: 'Bloomberg News',
      publishedAt: '25 menit lalu',
      readTimeMinutes: 3,
      author: 'David Harrison',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Inflasi CPI tahunan melambat ke 2,4%, mendekati target jangka panjang The Fed.',
        'Saham semikonduktor dan komputasi awan memimpin reli bursa New York.',
        'Yield obligasi US Treasury 10-tahun turun ke level terendah dalam 4 bulan.',
      ],
      fullContent: [
        'NEW YORK — Pasar saham Amerika Serikat mencatatkan kenaikan solid pada penutupan perdagangan hari ini setelah Departemen Tenaga Kerja mengumumkan data inflasi yang menunjukkan pelambatan berkelanjutan.',
        'Para investor kian optimis bahwa bank sentral Federal Reserve memiliki ruang yang cukup lebar untuk melonggarkan kebijakan moneter tanpa memicu perlambatan ekonomi yang curam (soft landing).',
        'Sektor kecerdasan buatan dan komputasi skala besar terus menjadi motor penggerak utama keuntungan emiten indeks S&P 500.',
      ],
    },
    {
      id: 'us-2',
      countryName: 'United States of America',
      countryCode: 'US',
      title: 'NASA Umumkan Kesiapan Misi Berawak Artemis Menuju Orbit Bulan Akhir Tahun Ini',
      titleEn: 'NASA Confirms Crewed Artemis Lunar Orbital Mission Readiness',
      summary: 'Badan Antariksa Amerika Serikat merampungkan uji coba sistem pendorong roket SLS dan modul kapsul Orion untuk persiapan misi membawa astronot mengitari bulan.',
      category: 'Sains',
      source: 'Reuters Science',
      publishedAt: '2 jam lalu',
      readTimeMinutes: 4,
      author: 'Sarah Jenkins',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Misi Artemis II akan membawa 4 astronot dalam uji terbang melintasi orbit bulan selama 10 hari.',
        'Peluncuran akan menjadi misi berawak pertama ke luar orbit rendah Bumi sejak Apollo 17 pada 1972.',
        'Kerjasama internasional melibatkan modul layanan Eropa dan stasiun luar angkasa Gateway.',
      ],
      fullContent: [
        'WASHINGTON — Direktur NASA menyatakan seluruh tahapan uji integrasi krusial roket Space Launch System (SLS) di Kennedy Space Center telah membuahkan hasil memuaskan.',
        'Keempat astronot yang terdiri dari tiga perwakilan NASA dan satu astronot Badan Antariksa Kanada (CSA) telah menyelesaikan latihan simulasi prosedur darurat dan navigasi manual.',
        'Misi ini akan menjadi batu loncatan vital sebelum manusia kembali menginjakkan kaki di kutub selatan Bulan pada misi Artemis III mendatang.',
      ],
    },
  ],

  'China': [
    {
      id: 'cn-1',
      countryName: 'China',
      countryCode: 'CN',
      title: 'Pemerintah Rilis Paket Stimulus Fiskal Baru untuk Dongkrak Konsumsi Domestik dan Sektor Properti',
      titleEn: 'China Unveils Fresh Fiscal Stimulus Package to Boost Domestic Consumption',
      summary: 'Bank Rakyat Tiongkok (PBOC) dan Kementerian Keuangan meluncurkan serangkaian insentif moneter termasuk pemangkasan rasio cadangan wajib perbankan (RRR).',
      category: 'Ekonomi',
      source: 'Xinhua / Caixin',
      publishedAt: '45 menit lalu',
      readTimeMinutes: 3,
      author: 'Li Wei',
      imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Pemangkasan RRR sebesar 50 basis poin menyuntikkan likuiditas sekitar 1 triliun yuan ke sistem perbankan.',
        'Suku bunga KPR eksisting dipangkas rata-rata 0,5% untuk meringankan beban 50 juta rumah tangga.',
        'Pasar saham Shanghai dan Shenzhen merespons dengan lonjakan volume perdagangan harian.',
      ],
      fullContent: [
        'BEIJING — Dalam konferensi pers bersama yang dihadiri para pembuat kebijakan ekonomi utama, otoritas Tiongkok mengumumkan paket stimulus terpadu terbesar tahun ini guna memacu target pertumbuhan PDB di kisaran 5 persen.',
        'Langkah-langkah terobosan mencakup pendanaan langsung bagi pemerintah daerah untuk menyerap persediaan perumahan yang belum terjual serta subsidi pembelian barang elektronik hemat energi.',
      ],
    },
    {
      id: 'cn-2',
      countryName: 'China',
      countryCode: 'CN',
      title: 'Ekspor Mobil Listrik dan Panel Surya Tiongkok Catat Rekor Baru di Pasar Asia dan Amerika Latin',
      titleEn: 'China EV and Solar Panel Exports Reach New High in Asia and Latin America',
      summary: 'Produsen kendaraan energi baru asal Tiongkok terus memperluas pabrik perakitan lokal di luar negeri untuk mendekati konsumen akhir.',
      category: 'Teknologi',
      source: 'South China Morning Post',
      publishedAt: '4 jam lalu',
      readTimeMinutes: 3,
      author: 'Chen Xiao',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'neutral',
      keyTakeaways: [
        'Ekspor kendaraan listrik tumbuh 32% pada kuartal berjalan.',
        'Pembangunan gigafactory di kawasan Asia Tenggara dan Brasil mempercepat lokalisasi suku cadang.',
      ],
      fullContent: [
        'SHENZHEN — Produsen otomotif terkemuka Tiongkok melaporkan ekspansi pesat pada segmen kendaraan ramah lingkungan dengan keunggulan efisiensi biaya dan teknologi baterai generasi terbaru.',
      ],
    },
  ],

  'Japan': [
    {
      id: 'jp-1',
      countryName: 'Japan',
      countryCode: 'JP',
      title: 'Bank of Japan Pertimbangkan Kenaikan Suku Bunga Bertahap Menyusul Pertumbuhan Upah Tertinggi 3 Dekade',
      titleEn: 'Bank of Japan Weighs Gradual Rate Hikes on Strongest Wage Gains in 3 Decades',
      summary: 'Gubernur Bank of Japan Kazuo Ueda menyatakan siklus upah dan harga yang sehat kian mengakar kuat dalam perekonomian domestik Jepang.',
      category: 'Ekonomi',
      source: 'Nikkei Asia',
      publishedAt: '35 menit lalu',
      readTimeMinutes: 3,
      author: 'Kenji Sato',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Negosiasi upah musim semi (Shunto) menghasilkan kenaikan rata-rata lebih dari 5,1%.',
        'Nilai tukar Yen menguat terhadap Dolar AS pasca pernyataan dewan gubernur.',
        'Sektor ritel dan pariwisata menikmati lonjakan konsumsi domestik serta wisatawan mancanegara.',
      ],
      fullContent: [
        'TOKYO — Era suku bunga negatif yang telah berlangsung selama bertahun-tahun di Negeri Sakura kini memasuki babak baru normalisasi kebijakan moneter.',
        'Data ketenagakerjaan menunjukkan perusahaan-perusahaan besar hingga menengah sepakat menaikkan kompensasi pekerja demi mengatasi krisis kekurangan tenaga kerja di tengah penuaan demografi.',
      ],
    },
  ],

  'United Kingdom': [
    {
      id: 'gb-1',
      countryName: 'United Kingdom',
      countryCode: 'GB',
      title: 'Pemerintah Inggris Umumkan Rencana Investasi Masif Rp400 Triliun untuk Energi Angin Lepas Pantai',
      titleEn: 'UK Announces Massive £22B Investment in Offshore Wind and Clean Energy Grid',
      summary: 'Perdana Menteri Inggris merilis strategi nasional untuk memposisikan London sebagai pusat pembiayaan transisi energi bersih Eropa.',
      category: 'Iklim',
      source: 'BBC News',
      publishedAt: '50 menit lalu',
      readTimeMinutes: 3,
      author: 'Emma Watson',
      imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Kapasitas pembangkit angin Laut Utara ditargetkan meningkat dua kali lipat sebelum 2030.',
        'Ribuan lapangan kerja baru bidang rekayasa hijau tercipta di wilayah Skotlandia dan Inggris Utara.',
      ],
      fullContent: [
        'LONDON — Pemerintah Inggris menegaskan komitmennya untuk mencapai target bebas emisi (Net Zero) dengan menyuntikkan dana publik dan memfasilitasi investasi swasta pada jaringan transmisi laut dalam.',
      ],
    },
  ],

  'Germany': [
    {
      id: 'de-1',
      countryName: 'Germany',
      countryCode: 'DE',
      title: 'Kanselir Jerman Resmikan Fasilitas Fabrikasi Semikonduktor Canggih Senilai 10 Miliar Euro di Dresden',
      titleEn: 'German Chancellor Inaugurates €10 Billion Advanced Semiconductor Fab in Dresden',
      summary: 'Kawasan "Silicon Saxony" memperkuat statusnya sebagai tulang punggung pasokan cip industri otomotif dan otomasi Eropa.',
      category: 'Teknologi',
      source: 'Deutsche Welle (DW)',
      publishedAt: '1 jam lalu',
      readTimeMinutes: 3,
      author: 'Hans Becker',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Pabrik baru akan memproduksi cip arsitektur mikro untuk mobil listrik dan sistem robotik.',
        'Mengurangi ketergantungan pasokan semikonduktor Eropa dari kawasan luar.',
      ],
      fullContent: [
        'BERLIN / DRESDEN — Pemerintah Jerman bersama konsorsium industri chip global meresmikan pembangunan mega-fasilitas pembuatan wafer semikonduktor di Dresden.',
      ],
    },
  ],

  'Saudi Arabia': [
    {
      id: 'sa-1',
      countryName: 'Saudi Arabia',
      countryCode: 'SA',
      title: 'Arab Saudi Luncurkan Dana Investasi Teknologi AI Senilai $40 Miliar Melalui Dana Investasi Publik (PIF)',
      titleEn: 'Saudi Arabia Launches $40 Billion AI Tech Investment Fund Via PIF',
      summary: 'Kerajaan berambisi menjadi kekuatan kecerdasan buatan terdepan di Timur Tengah dengan pusat data bersumber energi surya.',
      category: 'Teknologi',
      source: 'Arab News / Bloomberg',
      publishedAt: '1 jam lalu',
      readTimeMinutes: 4,
      author: 'Tariq Al-Mansoor',
      imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        'Dana diarahkan pada pembangunan infrastruktur superkomputer ramah lingkungan di proyek NEOM.',
        'Kemitraan dijalin dengan raksasa teknologi global untuk transfer riset dan pengembangan talenta lokal.',
      ],
      fullContent: [
        'RIYADH — Dana Investasi Publik (PIF) Arab Saudi mengumumkan inisiatif terbesarnya di bidang kecerdasan buatan, menandai akselerasi visi Saudi Vision 2030 untuk diversifikasi ekonomi non-minyak.',
      ],
    },
  ],

  'Palestine': [
    {
      id: 'ps-1',
      countryName: 'Palestine',
      countryCode: 'PS',
      title: 'Bantuan Kemanusiaan Internasional dan Upaya Gencatan Senjata Terus Didesak dalam Sidang Umum PBB',
      titleEn: 'International Humanitarian Aid and Ceasefire Push Intensifies at UN General Assembly',
      summary: 'Mayoritas negara anggota PBB menyerukan pembukaan koridor bantuan darurat medis dan bahan pangan tanpa hambatan bagi warga sipil di Gaza.',
      category: 'Dunia',
      source: 'Al Jazeera / UN News',
      publishedAt: '30 menit lalu',
      readTimeMinutes: 3,
      author: 'Youssef Nabil',
      imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'urgent',
      keyTakeaways: [
        'Resolusi PBB mendesak perlindungan penuh terhadap fasilitas medis dan staf kemanusiaan.',
        'Distribusi bantuan logistik dan penyediaan air bersih menjadi prioritas mendesak.',
      ],
      fullContent: [
        'NEW YORK / GAZA — Suara dunia internasional kembali bersatu di markas besar PBB mendesak penghentian kekerasan dan perlindungan nyata bagi populasi sipil yang terdampak krisis kemanusiaan berkepanjangan.',
      ],
    },
  ],

  'Ukraine': [
    {
      id: 'ua-1',
      countryName: 'Ukraine',
      countryCode: 'UA',
      title: 'Rekonstruksi Jaringan Listrik dan Ketahanan Energi Hadapi Musim Dingin Jadi Prioritas Utama Kyiv',
      titleEn: 'Power Grid Reconstruction and Energy Resilience for Winter Takes Top Priority in Kyiv',
      summary: 'Bantuan peralatan trafo tegangan tinggi dan pembangkit desentralisasi dari sekutu Eropa mulai tiba di berbagai kota.',
      category: 'Politik',
      source: 'Kyiv Independent',
      publishedAt: '2 jam lalu',
      readTimeMinutes: 3,
      author: 'Olena Kovaleva',
      imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'neutral',
      keyTakeaways: [
        'Lebih dari 80 generator skala besar dan sistem baterai cadangan telah terpasang.',
        'Pemerintah mempercepat desentralisasi pasokan energi ke unit-unit mikro.',
      ],
      fullContent: [
        'KYIV — Menjelang musim dingin, otoritas ketenagalistrikan Ukraina bekerja tanpa henti memulihkan kapasitas transmisi yang mengalami kerusakan.',
      ],
    },
  ],
};

// Generates contextual, rich, realistic news articles for any country on the globe
export function getNewsForCountry(countryName: string, countryCode: string = 'GL'): NewsArticle[] {
  if (CURATED_NEWS[countryName] && CURATED_NEWS[countryName].length > 0) {
    return CURATED_NEWS[countryName];
  }

  // Dynamic contextual generation for ANY world country
  const categories: NewsArticle['category'][] = ['Ekonomi', 'Politik', 'Teknologi', 'Sains', 'Iklim', 'Dunia'];
  
  return [
    {
      id: `${countryName.toLowerCase().replace(/\s+/g, '-')}-1`,
      countryName,
      countryCode,
      title: `Pemerintah ${countryName} Perkuat Diplomasi Ekonomi dan Dorong Peningkatan Perdagangan Bilateral`,
      titleEn: `${countryName} Government Strengthens Economic Diplomacy and Bilateral Trade`,
      summary: `Pertemuan tingkat menteri di ${countryName} menyepakati perluasan akses pasar dan kolaborasi strategis dalam sektor energi dan manufaktur bernilai tambah.`,
      summaryEn: `Ministerial meetings in ${countryName} agreed on expanding market access and strategic collaboration in energy and value-added manufacturing.`,
      category: 'Ekonomi',
      source: 'Global Wire / Antara',
      publishedAt: '22 menit lalu',
      readTimeMinutes: 3,
      author: 'Koresponden Internasional',
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        `Pertumbuhan indikator makroekonomi ${countryName} menunjukkan tren pemulihan stabil.`,
        'Kemudahan investasi asing langsung (FDI) ditingkatkan melalui regulasi satu pintu.',
        'Kerjasama regional difokuskan pada ketahanan logistik dan digitalisasi rantai pasok.',
      ],
      fullContent: [
        `IBUKOTA — Delegasi resmi ${countryName} menggelar forum bilateral guna membahas penguatan hubungan perdagangan internasional di tengah dinamika ekonomi global saat ini.`,
        `Dalam pernyataan resminya, otoritas menegaskan komitmen untuk menjaga iklim investasi yang kondusif, transparan, serta mengedepankan prinsip keberlanjutan lingkungan dan kesejahteraan masyarakat lokal.`,
        `Sektor-sektor prioritas yang menjadi fokus utama mencakup modernisasi infrastruktur transportasi, transisi energi bersih, serta adopsi teknologi informasi pada layanan publik.`,
        `Analis pasar menyambut baik langkah-langkah proaktif ini yang diperkirakan akan memperkuat daya saing ekonomi ${countryName} di panggung dunia dalam beberapa tahun ke depan.`,
      ],
    },
    {
      id: `${countryName.toLowerCase().replace(/\s+/g, '-')}-2`,
      countryName,
      countryCode,
      title: `${countryName} Gelar Konferensi Transisi Energi Hijau dan Konservasi Keanekaragaman Hayati`,
      titleEn: `${countryName} Hosts Green Energy Transition and Biodiversity Conservation Summit`,
      summary: `Para ilmuwan, pembuat kebijakan, dan aktivis berkumpul di ${countryName} guna menyusun peta jalan dekarbonisasi industri dan perlindungan cagar alam nasional.`,
      summaryEn: `Scientists and policymakers convene in ${countryName} to map out industrial decarbonization and nature preservation roadmaps.`,
      category: 'Iklim',
      source: 'Reuters Environment',
      publishedAt: '1 jam lalu',
      readTimeMinutes: 4,
      author: 'Tim Liputan Lingkungan',
      imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'positive',
      keyTakeaways: [
        `Target penurunan emisi karbon ${countryName} diperbarui sejalan dengan perjanjian Paris.`,
        'Pengembangan proyek pembangkit listrik tenaga bayu dan surya skala besar mulai diakselerasi.',
        'Dukungan pendanaan hijau internasional dialokasikan untuk pemulihan ekosistem hutan dan perairan.',
      ],
      fullContent: [
        `Inisiatif lingkungan di ${countryName} mendapat momentum baru setelah pemerintah menetapkan alokasi anggaran khusus untuk mitigasi krisis iklim.`,
        `Kolaborasi lintas sektor antara universitas lokal dan lembaga internasional diharapkan mampu melahirkan solusi teknologi ramah lingkungan yang terjangkau bagi masyarakat luas.`,
      ],
    },
    {
      id: `${countryName.toLowerCase().replace(/\s+/g, '-')}-3`,
      countryName,
      countryCode,
      title: `Transformasi Digital dan Talenta Sains Muda Jadi Motor Baru Pertumbuhan di ${countryName}`,
      titleEn: `Digital Transformation and Young Science Talent Power New Growth in ${countryName}`,
      summary: `Ekosistem teknologi di ${countryName} mencatat kenaikan jumlah startup dan riset terapan di bidang komputasi serta layanan kesehatan cerdas.`,
      summaryEn: `Tech ecosystem in ${countryName} records rising startups and applied research in computing and smart healthcare.`,
      category: 'Teknologi',
      source: 'Tech Global Review',
      publishedAt: '4 jam lalu',
      readTimeMinutes: 3,
      author: 'Maya Lin',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
      sentiment: 'neutral',
      keyTakeaways: [
        `Akses internet pita lebar telah menjangkau lebih dari 88% wilayah ${countryName}.`,
        'Program beasiswa riset kecerdasan buatan dan sains data diluncurkan untuk generasi muda.',
      ],
      fullContent: [
        `Perkembangan pesat infrastruktur telekomunikasi membuka peluang baru bagi inovasi lokal di ${countryName}.`,
        `Banyak generasi muda yang kini aktif mendirikan usaha rintisan berbasis teknologi untuk memecahkan persoalan sehari-hari di bidang logistik, pertanian presisi, dan pendidikan digital.`,
      ],
    },
  ];
}

export const FALLBACK_WORLD_NEWS: NewsArticle[] = [
  {
    id: 'world-trending-1',
    countryName: 'Indonesia',
    countryCode: 'ID',
    title: 'Transformasi Infrastruktur Energi Terbarukan & Koridor Digital Jadi Sorotan di Pertemuan Regional',
    summary: 'Rangkaian kesepakatan bilateral di bidang interkoneksi jaringan listrik bersih dan pusat data hijau mulai memasuki babak implementasi nyata tahun ini.',
    fullContent: [
      'Pengembangan koridor interkoneksi listrik bersih antar-wilayah terus menunjukkan kemajuan pesat didorong sinergi investasi swasta dan BUMN.',
      'Langkah strategis ini ditargetkan meningkatkan porsi bauran energi hijau nasional sekaligus menjamin keandalan pasokan daya bagi kawasan industri berteknologi tinggi.'
    ],
    category: 'Energi',
    source: 'Antara News',
    publishedAt: '25 menit lalu',
    readTimeMinutes: 3,
    keyTakeaways: [
      'Komitmen penurunan intensitas emisi karbon sektor ketenagalistrikan berjalan sesuai peta jalan.',
      'Pendanaan berkelanjutan dialirkan ke proyek pembangkit surya dan mikrohidro terdistribusi.',
      'Sistem transmisi pintar terintegrasi menjamin stabilitas jaringan interkoneksi.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80',
    originalUrl: 'https://news.google.com',
    isBreaking: true
  },
  {
    id: 'world-trending-2',
    countryName: 'United States of America',
    countryCode: 'US',
    title: 'Perkembangan Generasi Baru Arsitektur Komputasi Kecerdasan Buatan Pacu Efisiensi Pusat Data Global',
    summary: 'Laboratorium riset dan produsen chip semikonduktor terkemuka mengumumkan lompatan arsitektur pemrosesan AI dengan konsumsi daya hingga 40% lebih hemat.',
    fullContent: [
      'Inovasi arsitektur silikon baru ini memungkinkan akselerasi model kecerdasan buatan skala besar tanpa membebani infrastruktur kelistrikan komputasi awan.',
      'Pelaku industri memprediksi teknologi ini akan mempercepat integrasi AI generatif di berbagai sektor vertikal seperti medis, otomotif otonom, dan manufaktur presisi.'
    ],
    category: 'Teknologi',
    source: 'Reuters Tech',
    publishedAt: '45 menit lalu',
    readTimeMinutes: 4,
    keyTakeaways: [
      'Efisiensi energi komputasi menjadi fokus utama generasi chip kecerdasan buatan mutakhir.',
      'Penyedia cloud global mulai menjadwalkan penerapan klaster akselerator generasi baru ini.',
      'Permintaan pasar korporasi terhadap solusi AI terdesentralisasi terus meningkat.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    originalUrl: 'https://news.google.com'
  },
  {
    id: 'world-trending-3',
    countryName: 'Japan',
    countryCode: 'JP',
    title: 'Bank Sentral dan Otoritas Moneter Global Selaraskan Kebijakan Stabilisasi Inflasi dan Nilai Tukar',
    summary: 'Pertemuan pejabat keuangan global di Tokyo menegaskan pentingnya transparansi komunikasi kebijakan moneter di tengah pergeseran suku bunga acuan dunia.',
    fullContent: [
      'Gubernur bank sentral menegaskan komitmen untuk menjaga likuiditas pasar valuta asing dan mengantisipasi volatilitas arus modal lintas negara.',
      'Indikator upah riil dan produktivitas tenaga kerja terus menjadi acuan utama dalam penentuan trajektori suku bunga jangka panjang.'
    ],
    category: 'Ekonomi',
    source: 'Bloomberg News',
    publishedAt: '1 jam lalu',
    readTimeMinutes: 3,
    keyTakeaways: [
      'Stabilitas pasar keuangan Asia menunjukkan ketahanan menghadapi fluktuasi yield obligasi global.',
      'Pertumbuhan konsumsi domestik tetap solid didukung program penguatan upah pekerja.',
      'Langkah mitigasi risiko nilai tukar disiapkan melalui koordinasi swap bilateral.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80',
    originalUrl: 'https://news.google.com'
  }
];
