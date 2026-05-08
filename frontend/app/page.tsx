'use client';
import { useState, useEffect } from 'react';

// --- Komponen Ikon SVG biar UI kelihatan Mahal ---
const IconLapor = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const IconAdmin = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
const IconCloud = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-400"><path fillRule="evenodd" d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.25-10.5z" clipRule="evenodd" /></svg>;
const Spinner = () => <svg className="animate-spin h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function Home() {
  const [activeTab, setActiveTab] = useState('warga');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [daftarAduan, setDaftarAduan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const fetchAduan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backend/pengaduan');
      const json = await res.json();
      if (json.data) setDaftarAduan(json.data);
    } catch (err) {
      console.error("Gagal tarik data", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'dashboardAdmin') fetchAduan();
  }, [activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '12345') {
      setLoginError('');
      setActiveTab('dashboardAdmin');
    } else {
      setLoginError('Kredensial tidak valid!');
    }
  };

  const handleLogout = () => {
    setUsername(''); setPassword(''); setActiveTab('loginAdmin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: '🚀 Mengunggah ke infrastruktur AWS...' });

    if (!file) {
      setStatus({ type: 'error', message: 'File bukti lampiran wajib diisi!' });
      setIsSubmitting(false); return;
    }

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('lampiran', file);

    try {
      const res = await fetch('/api/backend/pengaduan', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: '✅ Aduan berhasil diamankan di Amazon S3 & RDS!' });
        setJudul(''); setDeskripsi(''); setFile(null);
      } else {
        setStatus({ type: 'error', message: `❌ Gagal: ${data.error}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: '❌ Koneksi ke server AWS terputus.' });
    }
    setIsSubmitting(false);
  };

  return (
    // Ganti tag <main> yang lama jadi ini:
    <main 
      className="min-h-screen font-sans text-slate-800 selection:bg-blue-200 bg-cover bg-center bg-fixed relative z-0"
      style={{ backgroundImage: "url('/desa.jpg')" }}
    >
      {/* Ini overlay gelap transparannya biar text & card lu tetep kebaca jelas */}
      <div className="absolute inset-0 bg-slate-900/60 -z-10"></div>

      {/* NAVBAR MODERN (ke bawahnya biarin tetep sama persis) */}
      <nav className="bg-slate-900/90 backdrop-blur-md text-white shadow-xl sticky top-0 z-50">
        {/* ... sisa kodingan lu ... */}
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <IconCloud />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Sipadu Cloud
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">INTEGRATED PUBLIC SERVICE</p>
            </div>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-700/50">
            <button onClick={() => setActiveTab('warga')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'warga' ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              <IconLapor /> Formulir Warga
            </button>
            <button onClick={() => setActiveTab(activeTab === 'dashboardAdmin' ? 'dashboardAdmin' : 'loginAdmin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${(activeTab === 'loginAdmin' || activeTab === 'dashboardAdmin') ? 'bg-indigo-600 text-white shadow-md transform scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              <IconAdmin /> Panel Admin
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 mt-4">
        
        {/* ================= TAMPILAN WARGA ================= */}
        {activeTab === 'warga' && (
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20"></div>
            
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Buat Pengaduan Laporan</h2>
              <p className="text-slate-500 mt-2 font-medium">Laporan Anda akan dienkripsi dan disimpan di infrastruktur cloud AWS.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Judul Laporan</label>
                <input type="text" required value={judul} onChange={(e) => setJudul(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Contoh: Infrastruktur jalan rusak di area..."
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Deskripsi Detail</label>
                <textarea required rows={4} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-y"
                  placeholder="Deskripsikan lokasi dan masalah secara spesifik..."
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">Bukti Lampiran (Foto)</label>
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition duration-300 relative">
                  <input type="file" required accept="image/*"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                    onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }}
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting}
                className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white active:scale-[0.98]'}`}
              >
                {isSubmitting ? <><Spinner /> Memproses Data...</> : 'Kirim Laporan via Secure API'}
              </button>
            </form>

            {status.message && (
              <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                <div className="font-semibold text-sm">{status.message}</div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAMPILAN LOGIN ADMIN ================= */}
        {activeTab === 'loginAdmin' && (
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-stretch justify-center mt-12">
            
            <div className="w-full md:w-5/12 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-8 rounded-3xl shadow-sm flex flex-col justify-center">
              <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <IconAdmin />
              </div>
              <h3 className="text-xl font-extrabold text-indigo-900 mb-3">Informasi Akses Dosen</h3>
              <p className="text-sm text-indigo-700 mb-6 leading-relaxed">
                Panel ini terhubung langsung dengan Amazon RDS. Gunakan kredensial *read-only* berikut untuk pengujian sistem.
              </p>
              <div className="bg-white p-4 rounded-xl border border-indigo-100/50 shadow-sm font-mono text-sm text-slate-700 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Username</span>
                  <span className="font-bold text-indigo-600 tracking-wider">admin</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Password</span>
                  <span className="font-bold text-indigo-600 tracking-wider">12345</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="text-2xl font-extrabold mb-8 text-slate-800">Otentikasi Sistem</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Username</label>
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Masukkan username"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
                
                {loginError && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100 text-center">{loginError}</div>}
                
                <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                  Secure Login
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAMPILAN DASHBOARD ADMIN ================= */}
        {activeTab === 'dashboardAdmin' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  Database Monitor
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">Live data sync dari Amazon RDS Private Subnet.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={fetchAduan} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2">
                  🔄 Refresh Data
                </button>
                <button onClick={handleLogout} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-5 py-2.5 rounded-xl font-bold transition">
                  Logout
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Spinner />
                <p className="mt-4 font-bold tracking-wide">Menghubungkan ke RDS Endpoint...</p>
              </div>
            ) : daftarAduan.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center shadow-sm">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-slate-700">Belum ada data masuk</h3>
                <p className="text-slate-500 mt-2">Menunggu respons dari API AWS ECS...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {daftarAduan.map((aduan: any) => (
                  <div key={aduan.ID} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group flex flex-col">
                    
                    {/* CDN Viewer - Sama kayak fitur sebelumnya, tapi dibikin lebih elegan */}
                    <a href={aduan.LampiranURL} target="_blank" rel="noopener noreferrer" className="block relative cursor-pointer h-52 overflow-hidden bg-slate-100" title="Buka gambar via AWS CloudFront CDN">
                      <img src={aduan.LampiranURL} alt="Bukti" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                      <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="bg-white/90 backdrop-blur text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
                          Lihat via CDN ↗
                        </span>
                      </div>
                    </a>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h3 className="text-lg font-extrabold text-slate-800 leading-snug">{aduan.Judul}</h3>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shrink-0 border border-emerald-200">
                          {aduan.Status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{aduan.Deskripsi}</p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-400">ID Laporan</span>
                        <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">#{aduan.ID}</span>
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