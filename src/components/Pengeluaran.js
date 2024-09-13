import React, { useState, useEffect } from 'react';
import { getPengeluaran, createPengeluaran } from '../api/api';
import './Pengeluaran.css';

// Helper function to format date as "Bulan Tahun"
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const Pengeluaran = () => {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [newPengeluaran, setNewPengeluaran] = useState({
    kategori: '', deskripsi: '', jumlah: '', tanggal_pengeluaran: ''
  });

  useEffect(() => {
    fetchPengeluaran();
  }, []);

  const fetchPengeluaran = async () => {
    try {
      const response = await getPengeluaran();
      setPengeluaran(response.data);
    } catch (error) {
      console.error('Failed to fetch pengeluaran:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPengeluaran({ ...newPengeluaran, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPengeluaran(newPengeluaran);
      fetchPengeluaran(); // Refresh data after creating
      setNewPengeluaran({ kategori: '', deskripsi: '', jumlah: '', tanggal_pengeluaran: '' }); // Reset form
    } catch (error) {
      console.error('Failed to create pengeluaran:', error);
    }
  };

  return (
    <div className="pengeluaran-container">
      <h2>Daftar Pengeluaran</h2>
      <form onSubmit={handleSubmit} className="pengeluaran-form">
        <select name="kategori" value={newPengeluaran.kategori} onChange={handleInputChange} required>
          <option value="">Pilih Kategori</option>
          <option value="perbaikan jalan">Perbaikan Jalan</option>
          <option value="gaji satpam">Gaji Satpam</option>
          <option value="dll.">DLL</option>
        </select>
        <input name="deskripsi" value={newPengeluaran.deskripsi} onChange={handleInputChange} placeholder="Deskripsi" required />
        <input name="jumlah" type="number" step="0.01" value={newPengeluaran.jumlah} onChange={handleInputChange} placeholder="Jumlah (Rp)" required />
        <input name="tanggal_pengeluaran" type="month" value={newPengeluaran.tanggal_pengeluaran} onChange={handleInputChange} required />
        <button type="submit">Tambah Pengeluaran</button>
      </form>
      <ul className="pengeluaran-list">
        {pengeluaran.map((p) => (
          <li key={p.id}>
            <strong>{p.kategori}</strong> - {p.deskripsi} - Jumlah: Rp {p.jumlah} - Tanggal: {formatDate(p.tanggal_pengeluaran)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pengeluaran;
