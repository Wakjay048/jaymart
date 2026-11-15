// js/pages/dashboard.js - Halaman Dashboard Overview (Khusus Owner)
import { Store, formatRupiah } from '../store.js';

export function renderDashboardPage(container) {
  const products = Store.getProducts();
  const transactions = Store.getTransactions();

  const totalOmzet = transactions.reduce((sum, t) => sum + t.total, 0);
  const lowStock = products.filter(p => p.stok <= 5);

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h2 style="color: var(--sage-dark);">Dashboard Overview</h2>
        <p style="font-size: 0.88rem; color: var(--slate-muted);">Ringkasan performa operasional JayMart hari ini</p>
      </div>
    </div>

    <div class="grid-cards">
      <div class="card">
        <div class="stat-label">Total Omzet Penjualan</div>
        <div class="stat-value">${formatRupiah(totalOmzet)}</div>
      </div>
      <div class="card">
        <div class="stat-label">Jumlah Transaksi</div>
        <div class="stat-value">${transactions.length} Struk</div>
      </div>
      <div class="card">
        <div class="stat-label">Total SKU Produk</div>
        <div class="stat-value">${products.length} Item</div>
      </div>
      <div class="card">
        <div class="stat-label">Peringatan Stok Menipis</div>
        <div class="stat-value" style="color: #B5651D;">${lowStock.length} Produk</div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 1rem; font-size: 1.05rem;">Daftar Produk Perlu Restock (Stok <= 5)</h3>
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Sisa Stok</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${lowStock.length === 0 ? '<tr><td colspan="5">Semua stok produk dalam kondisi aman.</td></tr>' : lowStock.map(p => `
            <tr>
              <td><strong>${p.sku}</strong></td>
              <td>${p.nama}</td>
              <td>${p.kategori}</td>
              <td>${p.stok} ${p.satuan}</td>
              <td><span class="badge badge-warning">Menipis</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
