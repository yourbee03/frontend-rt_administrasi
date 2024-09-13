import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getRumah, getPenghuni, createRumah, updateRumah, createPenghuniRumah, updatePenghuniRumah, deletePenghuniRumah, getHistoricalPenghuni, getCurrentPenghuni, getPembayaran } from '../api/api';
import './Rumah.css';

const Rumah = () => {
  const [rumah, setRumah] = useState([]);
  const [penghuni, setPenghuni] = useState([]);
  const [newRumah, setNewRumah] = useState({
    alamat: '',
    status_huni: 'tidak dihuni',
  });
  const [editing, setEditing] = useState(null);
  const [selectedRumah, setSelectedRumah] = useState(null);
  const [historicalPenghuni, setHistoricalPenghuni] = useState([]);
  const [currentPenghuni, setCurrentPenghuni] = useState(null);
  const [pembayaran, setPembayaran] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const rumahResponse = await getRumah();
      setRumah(rumahResponse.data);

      const penghuniResponse = await getPenghuni();
      setPenghuni(penghuniResponse.data);

      const pembayaranResponse = await getPembayaran();
      setPembayaran(pembayaranResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRumah({ ...newRumah, [name]: value });
  };

  const handleSubmitRumah = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateRumah(editing, newRumah);
      } else {
        await createRumah(newRumah);
      }
      fetchData();
      setNewRumah({ alamat: '', status_huni: 'tidak dihuni' });
      setEditing(null);
    } catch (error) {
      console.error('Error saving rumah:', error);
    }
  };

  const handleEditRumah = (rumah) => {
    setNewRumah(rumah);
    setEditing(rumah.id);
  };

  const handleRumahChange = async (selectedOption) => {
    setSelectedRumah(selectedOption);
    try {
      const historicalResponse = await getHistoricalPenghuni(selectedOption.value);
      setHistoricalPenghuni(historicalResponse.data);
      
      const currentResponse = await getCurrentPenghuni(selectedOption.value);
      setCurrentPenghuni(currentResponse.data);

      const pembayaranResponse = await getPembayaran();
      setPembayaran(pembayaranResponse.data.filter(p => p.rumah_id === selectedOption.value));
    } catch (error) {
      console.error('Error fetching penghuni data:', error);
    }
  };

  const handlePenghuniChange = (selectedOption) => {
    setCurrentPenghuni(selectedOption);
  };

  const updateRumahStatus = async (rumahId, status) => {
    try {
      await updateRumah(rumahId, { status_huni: status });
    } catch (error) {
      console.error('Error updating rumah status:', error);
    }
  };

  const handleAddPenghuni = async () => {
    if (selectedRumah && currentPenghuni) {
      try {
        await createPenghuniRumah({
          rumah_id: selectedRumah.value,
          penghuni_id: currentPenghuni.value,
          tanggal_mulai_huni: new Date().toISOString(),
          tanggal_akhir_huni: null
        });

        const rumahToUpdate = rumah.find(r => r.id === selectedRumah.value);
        if (rumahToUpdate && rumahToUpdate.status_huni === 'tidak dihuni') {
          await updateRumahStatus(selectedRumah.value, 'dihuni');
        }

        await fetchData();
        setCurrentPenghuni(null);
        setHistoricalPenghuni([]);
      } catch (error) {
        console.error('Error adding penghuni to rumah:', error);
      }
    }
  };

  const handleUpdatePenghuni = async () => {
    if (selectedRumah && currentPenghuni) {
      try {
        await updatePenghuniRumah(selectedRumah.value, {
          penghuni_id: currentPenghuni.value,
          tanggal_akhir_huni: null
        });
        await fetchData();
        setCurrentPenghuni(null);
        setHistoricalPenghuni([]);
      } catch (error) {
        console.error('Error updating penghuni in rumah:', error);
      }
    }
  };

  const handleRemovePenghuni = async () => {
    if (selectedRumah && currentPenghuni) {
      try {
        await deletePenghuniRumah({
          rumah_id: selectedRumah.value,
          penghuni_id: currentPenghuni.value,
          tanggal_akhir_huni: new Date().toISOString()
        });

        await fetchData();
        setCurrentPenghuni(null);
        setHistoricalPenghuni([]);
      } catch (error) {
        console.error('Error removing penghuni from rumah:', error);
      }
    }
  };

  return (
    <div>
      <h2>Daftar Rumah dan Penghuni</h2>
      <form onSubmit={handleSubmitRumah}>
        <label>Alamat</label>
        <input type="text" name="alamat" value={newRumah.alamat} onChange={handleInputChange} required />
        
        <label>Status Huni</label>
        <select name="status_huni" value={newRumah.status_huni} onChange={handleInputChange}>
          <option value="dihuni">Dihuni</option>
          <option value="tidak dihuni">Tidak Dihuni</option>
        </select>
        
        <button type="submit">{editing ? 'Update' : 'Tambah'} Rumah</button>
      </form>

      <ul>
        {rumah.map((r) => (
          <li key={r.id}>
            {r.alamat} - {r.status_huni}
            <button onClick={() => handleEditRumah(r)}>Edit</button>
          </li>
        ))}
      </ul>

      <div>
        <h2>Pengelolaan Penghuni Rumah</h2>
        <Select
          options={rumah.map(r => ({ value: r.id, label: r.alamat }))}
          onChange={handleRumahChange}
          value={selectedRumah}
          placeholder="Pilih Rumah"
        />

        {selectedRumah && (
          <>
            <div>
              <h3>Penghuni Saat Ini</h3>
              <Select
                options={penghuni.map(p => ({ value: p.id, label: p.nama_lengkap }))}
                onChange={handlePenghuniChange}
                value={currentPenghuni}
                placeholder="Pilih Penghuni"
              />
              <button onClick={handleAddPenghuni}>Tambah Penghuni ke Rumah</button>
              <button onClick={handleUpdatePenghuni}>Update Penghuni Rumah</button>
              <button onClick={handleRemovePenghuni}>Hapus Penghuni dari Rumah</button>
            </div>

            <div>
              <h3>Catatan Historis Penghuni</h3>
              <ul>
                {historicalPenghuni.map((p) => (
                  <li key={p.id}>
                    Nama: {p.nama_lengkap} - Alamat: {p.alamat} (Dari: {p.tanggal_mulai_huni} - Sampai: {p.tanggal_akhir_huni || 'Sekarang'})
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3>Riwayat Pembayaran</h3>
              <ul>
                {pembayaran.map((p) => (
                  <li key={p.id}>
                    Bulan: {p.bulan} - Iuran Kebersihan: {p.iuran_kebersihan} - Iuran Satpam: {p.iuran_satpam} - Status: {p.status}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Rumah;
