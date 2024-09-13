import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getPengeluaran, getPembayaran } from '../api/api';
import './Report.css';

const Report = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);

  const defaultIuranSatpam = 100000;
  const defaultIuranKebersihan = 15000;

  // Menggunakan useCallback untuk menghindari dependency issues
  const fetchReport = useCallback(async () => {
    try {
      const [pengeluaranResponse, pembayaranResponse] = await Promise.all([getPengeluaran(), getPembayaran()]);

      const formatMonthYear = (date) => {
        return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
      };

      const formatFullDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
      };

      const formatPembayaranData = (data, defaultSatpam, defaultKebersihan) => {
        return data.reduce((acc, item) => {
          const monthYear = formatMonthYear(item.bulan);
          if (!acc[monthYear]) {
            acc[monthYear] = { monthYear, pemasukan: 0 };
          }

          const iuranSatpam = item.iuran_satpam || 0;
          const iuranKebersihan = item.iuran_kebersihan || 0;
          const kekuranganSatpam = defaultSatpam - iuranSatpam;
          const kekuranganKebersihan = defaultKebersihan - iuranKebersihan;
          acc[monthYear].pemasukan += kekuranganSatpam + kekuranganKebersihan;
          return acc;
        }, {});
      };

      const formatPengeluaranData = (data) => {
        return data.reduce((acc, item) => {
          const tanggal = formatFullDate(item.tanggal_pengeluaran);
          if (!acc[tanggal]) {
            acc[tanggal] = { tanggal_pengeluaran: tanggal, pengeluaran: 0 };
          }
          acc[tanggal].pengeluaran += parseFloat(item.jumlah) || 0;
          return acc;
        }, {});
      };

      const formattedPembayaran = formatPembayaranData(pembayaranResponse.data, defaultIuranSatpam, defaultIuranKebersihan);
      const formattedPengeluaran = formatPengeluaranData(pengeluaranResponse.data);

      const mergedData = Object.keys(formattedPembayaran).map(key => ({
        monthYear: key,
        pemasukan: formattedPembayaran[key]?.pemasukan || 0,
        pengeluaran: formattedPengeluaran[key]?.pengeluaran || 0,
        saldo: (formattedPembayaran[key]?.pemasukan || 0) - (formattedPengeluaran[key]?.pengeluaran || 0)
      }));

      const last12MonthsData = mergedData.slice(-12);
      setMonthlyData(last12MonthsData);

      const detailedFormattedData = Object.values(formattedPengeluaran);
      setDetailedData(detailedFormattedData);

    } catch (error) {
      console.error('Failed to fetch report data:', error);
    }
  }, [defaultIuranSatpam, defaultIuranKebersihan]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="report-container">
      <h2>Report Pengeluaran dan Pembayaran</h2>

      {/* Monthly Summary Chart */}
      <div className="chart-container">
        <h3>Ringkasan Bulanan (Pemasukan, Pengeluaran, Saldo)</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pemasukan" stroke="#82ca9d" name="Pemasukan" />
              <Line type="monotone" dataKey="pengeluaran" stroke="#8884d8" name="Pengeluaran" />
              <Line type="monotone" dataKey="saldo" stroke="#ff7300" name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading data...</p>
        )}
      </div>

      {/* Detailed Expenditure Chart */}
      <div className="chart-container">
        <h3>Detail Pengeluaran</h3>
        {detailedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={detailedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tanggal_pengeluaran" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pengeluaran" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </div>
  );
};

export default Report;
