import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // Import react-select
import { getPembayaran, createPembayaran, updatePembayaran, getCurrentPenghuni } from '../api/api'; // Update API call
import './Pembayaran.css';

// Helper function to format numbers to Rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

// Helper function to format month into 'Januari 2024' format
const formatBulanTahun = (dateString) => {
  const options = { year: 'numeric', month: 'long' };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', options).format(date);
};

const Pembayaran = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [editMode, setEditMode] = useState(false); // For toggling between add and edit modes
  const [selectedPembayaranId, setSelectedPembayaranId] = useState(null); // To track which pembayaran is being edited
  const [newPembayaran, setNewPembayaran] = useState({
    penghuni_id: '', rumah_id: '', bulan: '', iuran_kebersihan: '', iuran_satpam: '', status: ''
  });
  const [options, setOptions] = useState([]);

  const defaultIuranSatpam = 100000; // Rp. 100.000
  const defaultIuranKebersihan = 15000; // Rp. 15.000

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pembayaranResponse = await getPembayaran();
        setPembayaran(pembayaranResponse.data);

        const rumahPenghuniResponse = await getCurrentPenghuni(1);
        const rumahPenghuniOptions = rumahPenghuniResponse.data.map(rp => ({
          value: rp.penghuni_id,
          label: `Penghuni: ${rp.Penghuni.nama_lengkap} - Rumah: ${rp.Rumah.alamat}`,
          rumah_id: rp.rumah_id
        }));
        setOptions(rumahPenghuniOptions);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (selectedOption) => {
    setNewPembayaran({
      ...newPembayaran,
      penghuni_id: selectedOption.value,
      rumah_id: selectedOption.rumah_id
    });
  };

  // Handle regular input change
  const handleInputChange = (e) => {
    setNewPembayaran({ ...newPembayaran, [e.target.name]: e.target.value });
  };

  // Handle form submission for both adding and updating pembayaran
const handleSubmit = async (e) => {
  e.preventDefault();

  const iuranSatpamShortfall = defaultIuranSatpam - newPembayaran.iuran_satpam;
  const iuranKebersihanShortfall = defaultIuranKebersihan - newPembayaran.iuran_kebersihan;

  const iuranSatpamToSave = iuranSatpamShortfall > 0 ? iuranSatpamShortfall : 0;
  const iuranKebersihanToSave = iuranKebersihanShortfall > 0 ? iuranKebersihanShortfall : 0;

  try {
    if (editMode && selectedPembayaranId) {
      // Update pembayaran jika dalam mode edit
      await updatePembayaran(selectedPembayaranId, {
        ...newPembayaran,
        iuran_kebersihan: iuranKebersihanToSave,
        iuran_satpam: iuranSatpamToSave
      });
    } else {
      // Tambah pembayaran baru
      await createPembayaran({
        ...newPembayaran,
        iuran_kebersihan: iuranKebersihanToSave,
        iuran_satpam: iuranSatpamToSave
      });
    }

    // Refresh pembayaran
    const pembayaranResponse = await getPembayaran(); 
    setPembayaran(pembayaranResponse.data);

    // Reset form dan keluar dari mode edit
    setNewPembayaran({
      penghuni_id: '', rumah_id: '', bulan: '', iuran_kebersihan: '', iuran_satpam: '', status: ''
    });
    setEditMode(false);
    setSelectedPembayaranId(null);
  } catch (error) {
    console.error("Error creating/updating pembayaran", error);
  }
};

  // Handle edit button click
  const handleEdit = (pembayaran) => {
  // Pastikan ID pembayaran diambil dan setel mode edit
  console.log('Editing Pembayaran ID:', pembayaran.id); // Tambahkan ini untuk debugging
  setNewPembayaran({
    penghuni_id: pembayaran.penghuni_id,
    rumah_id: pembayaran.rumah_id,
    bulan: pembayaran.bulan,
    iuran_kebersihan: pembayaran.iuran_kebersihan,
    iuran_satpam: pembayaran.iuran_satpam,
    status: pembayaran.status
  });
  setSelectedPembayaranId(pembayaran.id); // Simpan ID pembayaran yang sedang diedit
  setEditMode(true);
  };


  return (
    <div className="pembayaran-container">
      <h2>{editMode ? 'Edit Pembayaran' : 'Tambah Pembayaran'}</h2>
      <form onSubmit={handleSubmit} className="pembayaran-form">
        <label htmlFor="penghuni_id">Penghuni dan Rumah</label>
        <Select
          id="penghuni_id"
          options={options} // Opsi yang diambil dari query rumahpenghuni
          onChange={handleSelectChange}
          placeholder="Pilih Penghuni dan Rumah"
          value={options.find(option => option.value === newPembayaran.penghuni_id)}
        />

        <label htmlFor="bulan">Bulan</label>
        <input type="month" id="bulan" name="bulan" value={newPembayaran.bulan} onChange={handleInputChange} required />

        <label htmlFor="iuran_kebersihan">Iuran Kebersihan (Rp 15.000)</label>
        <input type="number" id="iuran_kebersihan" name="iuran_kebersihan" value={newPembayaran.iuran_kebersihan} onChange={handleInputChange} placeholder="Iuran Kebersihan" required />

        <label htmlFor="iuran_satpam">Iuran Satpam (Rp 100.000)</label>
        <input type="number" id="iuran_satpam" name="iuran_satpam" value={newPembayaran.iuran_satpam} onChange={handleInputChange} placeholder="Iuran Satpam" required />

        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={newPembayaran.status} onChange={handleInputChange} required>
          <option value="" disabled>Pilih Status</option>
          <option value="belum_lunas">Belum Lunas</option>
          <option value="lunas">Lunas</option>
        </select>

        <button type="submit" className="submit-btn">{editMode ? 'Update Pembayaran' : 'Tambah Pembayaran'}</button>
      </form>

      <ul className="pembayaran-list">
        {pembayaran.map((p) => (
          <li key={p.id}>
            <p>{options.find(option => option.value === p.penghuni_id)?.label.split(' - ')[0]}</p>
            <p>{options.find(option => option.value === p.penghuni_id)?.label.split(' - ')[1]}</p>
            <p>Bulan: {formatBulanTahun(p.bulan)}</p>
            <p>Status: {p.status}</p>
            <p>Kekurangan Iuran Kebersihan: {formatRupiah(p.iuran_kebersihan)}</p>
            <p>Kekurangan Iuran Satpam: {formatRupiah(p.iuran_satpam)}</p>
            <button onClick={() => handleEdit(p)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pembayaran;
