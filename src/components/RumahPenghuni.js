import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
  getRumah, getPenghuni, createPenghuniRumah, updatePenghuniRumah, deletePenghuniRumah,
  updateRumahStatus, getCurrentPenghuni, getPembayaran
} from '../api/api';

const RumahPenghuni = () => {
  const [rumah, setRumah] = useState([]);
  const [penghuni, setPenghuni] = useState([]);
  const [selectedRumah, setSelectedRumah] = useState(null);
  const [currentPenghuni, setCurrentPenghuni] = useState(null);
  const [pembayaran, setPembayaran] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRumah();
    fetchPenghuni();
    fetchPembayaran();
  }, []);

  const fetchRumah = async () => {
    const rumahResponse = await getRumah();
    setRumah(rumahResponse.data);
  };

  const fetchPenghuni = async () => {
    const penghuniResponse = await getPenghuni();
    setPenghuni(penghuniResponse.data);
  };

  const fetchPembayaran = async () => {
    const pembayaranResponse = await getPembayaran();
    setPembayaran(pembayaranResponse.data);
  };

  const handleRumahChange = async (selectedOption) => {
    setSelectedRumah(selectedOption);
    const currentPenghuniResponse = await getCurrentPenghuni(selectedOption.value);
    setCurrentPenghuni(currentPenghuniResponse.data);
  };

  const handlePenghuniChange = (selectedOption) => {
    setCurrentPenghuni(selectedOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRumah && currentPenghuni) {
      try {
        if (isEditing) {
          await updatePenghuniRumah(selectedRumah.value, { penghuni_id: currentPenghuni.value });
        } else {
          await createPenghuniRumah({
            rumah_id: selectedRumah.value,
            penghuni_id: currentPenghuni.value,
            tanggal_mulai_huni: new Date().toISOString(),
            tanggal_akhir_huni: null
          });
        }

        const selectedRumahDetails = rumah.find(r => r.id === selectedRumah.value);
        if (selectedRumahDetails.status_huni === 'tidak dihuni') {
          await updateRumahStatus(selectedRumah.value, { status_huni: 'dihuni' });
        }

        fetchRumah();
        setSelectedRumah(null);
        setCurrentPenghuni(null);
        setIsEditing(false);
      } catch (error) {
        console.error('Error managing penghuni rumah:', error);
      }
    }
  };

  const handleEdit = (rumah) => {
    setSelectedRumah({ value: rumah.id, label: rumah.alamat });
    setIsEditing(true);
  };

  const handleDelete = async (rumahId, penghuniId) => {
    await deletePenghuniRumah(rumahId, penghuniId);
    fetchRumah();
  };

  return (
    <div>
      <h2>Pengelolaan Rumah dan Penghuni</h2>

      <form onSubmit={handleSubmit}>
        <label>Alamat Rumah</label>
        <Select
          options={rumah.map(r => ({ value: r.id, label: r.alamat }))}
          onChange={handleRumahChange}
          value={selectedRumah}
          placeholder="Pilih Rumah"
        />

        <label>Penghuni</label>
        <Select
          options={penghuni.map(p => ({ value: p.id, label: p.nama_lengkap }))}
          onChange={handlePenghuniChange}
          value={currentPenghuni}
          placeholder="Pilih Penghuni"
        />

        <button type="submit">{isEditing ? 'Update' : 'Tambah'} Penghuni ke Rumah</button>
      </form>

      {selectedRumah && (
        <>
          <h3>Catatan Historis Penghuni</h3>
          <ul>
            {historicalPenghuni.map(p => (
              <li key={p.id}>
                {p.nama_lengkap} - {p.status_penghuni} (Dari: {p.tanggal_mulai} - Sampai: {p.tanggal_berakhir || 'Sekarang'})
              </li>
            ))}
          </ul>

          <h3>Riwayat Pembayaran</h3>
          <ul>
            {pembayaran.filter(p => p.rumah_id === selectedRumah.value).map(p => (
              <li key={p.id}>
                Bulan: {p.bulan} - Iuran Kebersihan: {p.iuran_kebersihan} - Iuran Satpam: {p.iuran_satpam} - Status: {p.status}
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>Daftar Rumah</h3>
      <ul>
        {rumah.map(r => (
          <li key={r.id}>
            {r.alamat} - {r.status_huni}
            <button onClick={() => handleEdit(r)}>Edit</button>
            <button onClick={() => handleDelete(r.id, currentPenghuni?.value)} disabled={!currentPenghuni}>
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RumahPenghuni;
