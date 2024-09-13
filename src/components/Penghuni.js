import React, { useState, useEffect } from 'react';
import { getPenghuni, createPenghuni } from '../api/api';
import './Penghuni.css';

const Penghuni = () => {
  const [penghuni, setPenghuni] = useState([]);
  const [newPenghuni, setNewPenghuni] = useState({
    nama_lengkap: '', foto_ktp: null, status_penghuni: '', nomor_telepon: '', status_perkawinan: ''
  });

  useEffect(() => {
    fetchPenghuni();
  }, []);

  const fetchPenghuni = async () => {
    try {
      const response = await getPenghuni();
      setPenghuni(response.data);
    } catch (error) {
      console.error('Error fetching penghuni:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'foto_ktp') {
      setNewPenghuni({ ...newPenghuni, [name]: files[0] });
    } else {
      setNewPenghuni({ ...newPenghuni, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Membuat FormData untuk mengirim file dan data lainnya
    const formData = new FormData();
    formData.append('nama_lengkap', newPenghuni.nama_lengkap);
    formData.append('foto_ktp', newPenghuni.foto_ktp);
    formData.append('status_penghuni', newPenghuni.status_penghuni);
    formData.append('nomor_telepon', newPenghuni.nomor_telepon);
    formData.append('status_perkawinan', newPenghuni.status_perkawinan);

    try {
      // Mengirim data ke API
      await createPenghuni(formData);
      fetchPenghuni(); // Refresh data setelah menambahkan penghuni baru

      // Clear form setelah submit
      setNewPenghuni({
        nama_lengkap: '', foto_ktp: null, status_penghuni: '', nomor_telepon: '', status_perkawinan: ''
      });
    } catch (error) {
      console.error('Error creating penghuni:', error);
    }
  };

  return (
    <div className="penghuni-container">
      <h2>Daftar Penghuni</h2>
      <form onSubmit={handleSubmit} className="penghuni-form" encType="multipart/form-data">
        <label htmlFor="nama_lengkap">Nama Lengkap</label>
        <input type="text" id="nama_lengkap" name="nama_lengkap" value={newPenghuni.nama_lengkap} onChange={handleInputChange} placeholder="Nama Lengkap" required />

        <label htmlFor="foto_ktp">Foto KTP</label>
        <input type="file" id="foto_ktp" name="foto_ktp" onChange={handleInputChange} required />

        <label htmlFor="status_penghuni">Status Penghuni</label>
        <select id="status_penghuni" name="status_penghuni" value={newPenghuni.status_penghuni} onChange={handleInputChange} required>
          <option value="" disabled>Pilih Status</option>
          <option value="kontrak">Kontrak</option>
          <option value="tetap">Tetap</option>
        </select>

        <label htmlFor="nomor_telepon">Nomor Telepon</label>
        <input type="tel" id="nomor_telepon" name="nomor_telepon" value={newPenghuni.nomor_telepon} onChange={handleInputChange} placeholder="Nomor Telepon" required />

        <label htmlFor="status_perkawinan">Status Perkawinan</label>
        <select id="status_perkawinan" name="status_perkawinan" value={newPenghuni.status_perkawinan} onChange={handleInputChange} required>
          <option value="" disabled>Pilih Status</option>
          <option value="menikah">Menikah</option>
          <option value="belum menikah">Belum Menikah</option>
        </select>

        <button type="submit" className="submit-btn">Tambah Penghuni</button>
      </form>

      <ul className="penghuni-list">
        {penghuni.map((p) => (
          <li key={p.id}>{p.nama_lengkap} - {p.status_penghuni}</li>
        ))}
      </ul>
    </div>
  );
};

export default Penghuni;
