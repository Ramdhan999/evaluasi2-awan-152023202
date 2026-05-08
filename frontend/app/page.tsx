'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('warga'); // 'warga', 'loginAdmin', atau 'dashboardAdmin'
  
  // State Warga
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  
  // State Admin
  const [daftarAduan, setDaftarAduan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Fungsi ambil data dari RDS buat Admin
  const fetchAduan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backend/pengaduan');
      const json = await res.json();
      if (json.data) {
        setDaftarAduan(json.data);
      }
    } catch (err) {
      console.error("Gagal tarik data", err);
    }
    setLoading(false);
  };

  // Otomatis tarik data kalau berhasil masuk dashboard
  useEffect(() => {
    if (activeTab === 'dashboardAdmin') {
      fetchAduan();
    }
  }, [activeTab]);

  // Fungsi Login Admin (Hardcoded di Frontend biar simpel)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '12345') {
      setLoginError('');
      setActiveTab('dashboardAdmin');
    } else {
      setLoginError('Username atau Password salah bro!');
    }
  };

  // Fungsi Logout
  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setActiveTab('loginAdmin');
  };

  // Fungsi kirim aduan (Warga)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sedang mengunggah ke AWS S3 & RDS...');

    if (!file) {
      setStatus('Wajib lampirkan foto bukti bro!');
      return;
    }

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('lampiran', file);

    try {
      const res = await fetch('/api/backend/pengaduan', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('✅ Aduan berhasil terkirim ke sistem!');
        setJudul(''); setDeskripsi(''); setFile(null);
      } else {
        setStatus(`❌ Gagal: ${data.error || 'Ada yang salah'}`);
      }
    } catch (err) {
      setStatus('❌ Error koneksi ke server AWS.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* NAVBAR */}
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold tracking-tight">☁️ Sipadu Cloud</h1>
          <div className="flex gap-4 font-semibold">
            <button 
              onClick={() => setActiveTab('warga')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'warga' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-500'}`}
            >
              Lapor Aduan
            </button>
            <button 
              onClick={() => {
                // Kalau udah login, arahin ke dashboard, kalo belum ke form login
                setActiveTab(activeTab === 'dashboardAdmin' ? 'dashboardAdmin' : 'loginAdmin');
              }}
              className={`px-4 py-2 rounded-lg transition ${(activeTab === 'loginAdmin' || activeTab === 'dashboardAdmin') ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-500'}`}
            >
              Panel Admin
            </button>
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <div className="max-w-5xl mx-auto p-6 mt-6">
        
        {/* ================= TAMPILAN WARGA ================= */}
        {activeTab === 'warga' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold mb-2 text-slate-800">Buat Pengaduan</h2>
            <p className="mb-6 text-slate-500">Laporan Anda akan disimpan secara aman di infrastruktur AWS.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Judul Laporan</label>
                <input type="text" required value={judul} onChange={(e) => setJudul(e.target.value)}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Contoh: Jalan berlubang di depan pom bensin..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Deskripsi Detail</label>
                <textarea required rows={4} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Ceritakan detail lokasinya..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Lampiran Foto</label>
                <input type="file" required accept="image/*"
                  className="w-full border border-slate-300 p-2 rounded-lg bg-slate-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md">
                🚀 Kirim Laporan
              </button>
            </form>

            {status && (
              <div className={`mt-6 p-4 rounded-lg text-center font-bold ${status.includes('✅') ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                {status}
              </div>
            )}
          </div>
        )}

        {/* ================= TAMPILAN LOGIN ADMIN ================= */}
        {activeTab === 'loginAdmin' && (
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center justify-center mt-10">
            {/* Hint Box buat Dosen */}
            <div className="w-full md:w-1/3 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Informasi Akses</h3>
              <p className="text-sm text-blue-600 mb-4">
                Silakan gunakan kredensial berikut untuk menguji fitur Panel Admin yang terhubung ke database RDS.
              </p>
              <div className="bg-white p-3 rounded border border-blue-100 font-mono text-sm text-slate-700">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> 12345</p>
              </div>
            </div>

            {/* Form Login */}
            <div className="w-full md:w-1/2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-3xl font-bold mb-6 text-slate-800 text-center">Login Admin</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Username</label>
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
                {loginError && <p className="text-red-500 text-sm font-semibold text-center">{loginError}</p>}
                <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-lg hover:bg-slate-900 transition-all shadow-md">
                  Masuk ke Dashboard
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAMPILAN DASHBOARD ADMIN ================= */}
        {activeTab === 'dashboardAdmin' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Dashboard Admin</h2>
                <p className="text-slate-500 mt-1">Data ditarik secara real-time dari Amazon RDS.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={fetchAduan} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold transition">
                  🔄 Refresh
                </button>
                <button onClick={handleLogout} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition">
                  Logout
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-slate-500 animate-pulse font-semibold mt-10">Mengambil data dari RDS...</p>
            ) : daftarAduan.length === 0 ? (
              <p className="text-center text-slate-500 mt-10">Belum ada aduan yang masuk.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {daftarAduan.map((aduan: any) => (
                  <div key={aduan.ID} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                    <a 
                    href={aduan.LampiranURL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block relative group cursor-pointer"
                    title="Buka gambar via CDN"
                  >
                    <img 
                      src={aduan.LampiranURL} 
                      alt="Bukti Aduan" 
                      className="w-full h-48 object-cover bg-slate-200 group-hover:brightness-75 transition duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                      <span className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                        Lihat Link CDN ↗
                      </span>
                    </div>
                  </a>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{aduan.Judul}</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {aduan.Status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">{aduan.Deskripsi}</p>
                      <div className="text-xs text-slate-400 font-medium">
                        ID Laporan: #{aduan.ID}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}