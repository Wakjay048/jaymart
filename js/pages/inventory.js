// js/pages/inventory.js - Halaman Master Data Produk & Kartu Stok (Khusus Owner)
import { Store, formatRupiah } from '../store.js';

export function renderInventoryPage(container) {
  function render() {
    const products = Store.getProducts();
    const mutations = Store.getMutations();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 style="color: var(--sage-dark);">Inventaris & Master Produk</h2>
          <p style="font-size: 0.88rem; color: var(--slate-muted);">Kelola katalog SKU, harga jual, dan kartu riwayat mutasi stok</p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem; font-size: 1rem;">Tambah Produk Baru</h3>
        <form id="addProductForm" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; align-items: end;">
          <div class="form-group" style="margin:0;">
            <label>SKU</label>
            <input type="text" id="pSku" class="form-control" placeholder="JM-006" required />
          </div>
          <div class="form-group" style="margin:0;">
            <label>Nama Produk</label>
            <input type="text" id="pNama" class="form-control" placeholder="Teh Botol 350ml" required />
          </div>
          <div class="form-group" style="margin:0;">
            <label>Kategori</label>
            <input type="text" id="pKategori" class="form-control" placeholder="Minuman" required />
          </div>
          <div class="form-group" style="margin:0;">
            <label>Harga Beli (HPP)</label>
            <input type="number" id="pBeli" class="form-control" required />
          </div>
          <div class="form-group" style="margin:0;">
            <label>Harga Jual</label>
            <input type="number" id="pJual" class="form-control" required />
          </div>
          <div class="form-group" style="margin:0;">
            <label>Stok Awal</label>
            <input type="number" id="pStok" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Simpan Produk</button>
        </form>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <h3 style="margin-bottom: 1rem; font-size: 1rem;">Daftar Katalog Produk</h3>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga Beli</th>
              <th>Harga Jual</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td><strong>${p.sku}</strong></td>
                <td>${p.nama}</td>
                <td>${p.kategori}</td>
                <td>${formatRupiah(p.harga_beli)}</td>
                <td>${formatRupiah(p.harga_jual)}</td>
                <td><strong>${p.stok}</strong> ${p.satuan}</td>
                <td><button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.8rem;" data-restock="${p.sku}">+ Restock (10)</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 1rem; font-size: 1rem;">Kartu Stok (Log Mutasi Barang)</h3>
        <table>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>SKU</th>
              <th>Produk</th>
              <th>Jenis</th>
              <th>Qty</th>
              <th>Referensi</th>
            </tr>
          </thead>
          <tbody>
            ${mutations.length === 0 ? '<tr><td colspan="6">Belum ada riwayat mutasi barang.</td></tr>' : mutations.slice(0, 10).map(m => `
              <tr>
                <td>${m.waktu}</td>
                <td>${m.sku}</td>
                <td>${m.nama}</td>
                <td><span class="badge ${m.jenis === 'MASUK' ? 'badge-success' : 'badge-wood'}">${m.jenis}</span></td>
                <td>${m.qty}</td>
                <td>${m.referensi}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelector('#addProductForm').onsubmit = (e) => {
      e.preventDefault();
      const prods = Store.getProducts();
      const sku = container.querySelector('#pSku').value.trim();
      const nama = container.querySelector('#pNama').value.trim();
      const kategori = container.querySelector('#pKategori').value.trim();
      const harga_beli = Number(container.querySelector('#pBeli').value);
      const harga_jual = Number(container.querySelector('#pJual').value);
      const stok = Number(container.querySelector('#pStok').value);

      prods.push({ sku, nama, kategori, harga_beli, harga_jual, stok, satuan: 'Pcs' });
      Store.saveProducts(prods);
      Store.addMutation({ sku, nama, jenis: 'MASUK', qty: stok, referensi: 'STOK-AWAL', waktu: new Date().toLocaleString('id-ID') });
      render();
    };

    container.querySelectorAll('[data-restock]').forEach(btn => {
      btn.onclick = () => {
        const sku = btn.dataset.restock;
        const prods = Store.getProducts();
        const item = prods.find(p => p.sku === sku);
        if (item) {
          item.stok += 10;
          Store.saveProducts(prods);
          Store.addMutation({ sku: item.sku, nama: item.nama, jenis: 'MASUK', qty: 10, referensi: 'PO-RESTOCK', waktu: new Date().toLocaleString('id-ID') });
          render();
        }
      };
    });
  }

  render();
}
