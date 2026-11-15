// js/pages/reports.js - Halaman Laporan Keuangan & Riwayat Transaksi
import { Store, formatRupiah } from '../store.js';

export function renderReportsPage(container, currentUser) {
  const allTransactions = Store.getTransactions();
  // Kasir hanya melihat transaksi miliknya sendiri; Owner melihat semua transaksi
  const transactions = currentUser.role === 'owner'
    ? allTransactions
    : allTransactions.filter(t => t.kasir === currentUser.nama_lengkap);

  const totalRevenue = transactions.reduce((sum, t) => sum + t.subtotal, 0);
  const totalCOGS = transactions.reduce((sum, t) => {
    return sum + t.items.reduce((s, i) => s + (i.harga_beli * i.qty), 0);
  }, 0);
  const grossProfit = totalRevenue - totalCOGS;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2 style="color: var(--sage-dark);">${currentUser.role === 'owner' ? 'Laporan Keuangan & Laba Kotor' : 'Riwayat Transaksi Shift Saya'}</h2>
        <p style="font-size: 0.88rem; color: var(--slate-muted);">Rekapitulasi transaksi penjualan JayMart</p>
      </div>
    </div>

    ${currentUser.role === 'owner' ? `
      <div class="grid-cards">
        <div class="card">
          <div class="stat-label">Pendapatan Bersih (Non-PPN)</div>
          <div class="stat-value">${formatRupiah(totalRevenue)}</div>
        </div>
        <div class="card">
          <div class="stat-label">Total HPP (COGS)</div>
          <div class="stat-value" style="color: var(--wood-brown);">${formatRupiah(totalCOGS)}</div>
        </div>
        <div class="card">
          <div class="stat-label">Laba Kotor (Gross Profit)</div>
          <div class="stat-value" style="color: #2D6A4F;">${formatRupiah(grossProfit)}</div>
        </div>
      </div>
    ` : ''}

    <div class="card">
      <h3 style="margin-bottom: 1rem; font-size: 1rem;">Daftar Struk Transaksi</h3>
      <table>
        <thead>
          <tr>
            <th>No. Struk</th>
            <th>Waktu</th>
            <th>Kasir</th>
            <th>Metode</th>
            <th>Total Bayar</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.length === 0 ? '<tr><td colspan="5">Belum ada transaksi tercatat.</td></tr>' : transactions.map(t => `
            <tr>
              <td><strong>${t.id}</strong></td>
              <td>${t.waktu}</td>
              <td>${t.kasir}</td>
              <td><span class="badge badge-success">${t.metode}</span></td>
              <td><strong>${formatRupiah(t.total)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
