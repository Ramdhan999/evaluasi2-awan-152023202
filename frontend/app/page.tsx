'use client';
import { useState } from 'react';

export default function Home() {
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Loading... lagi ngirim ke AWS bro...');

    if (!file) {
      setStatus('Bro, file lampirannya jangan lupa!');
      return;
    }

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('lampiran', file);

    try {
      // Nembak ke proxy Next.js yang bakal diterusin ke ECS
      const res = await fetch('/api/backend/pengaduan', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus('Sukses! Aduan berhasil masuk ke RDS & S3.');
        console.log('Response AWS:', data);
      } else {
        setStatus(`Gagal bro: ${data.error || 'Ada yang salah'}`);
      }
    } catch (err) {
      setStatus('Error koneksi ke server AWS.');
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Sipadu - Pelayanan Publik</h1>
        <p className="mb-6 text-gray-500">Layanan pengaduan masyarakat terintegrasi Cloud.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Judul Pengaduan</label>
            <input 
              type="text" 
              required
              className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Lengkap</label>
            <textarea 
              required
              rows={4}
              className="w-full border border-gray-300 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lampiran Foto (Bukti)</label>
            <input 
              type="file" 
              required
              accept="image/*"
              className="w-full border border-gray-300 p-2 rounded"
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0]);
              }}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition"
          >
            Kirim Pengaduan ke Cloud
          </button>
        </form>

        {status && (
          <div className={`mt-6 p-4 rounded text-center font-semibold ${status.includes('Sukses') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {status}
          </div>
        )}
      </div>
    </main>
  );
}