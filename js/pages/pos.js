// js/pages/pos.js - Halaman Point of Sale (Kasir & Owner)
import { Store, formatRupiah } from '../store.js';

export function renderPosPage(container, currentUser) {
  let cart = [];
  let searchQuery = '';
  let paymentMethod = 'Tunai';

  function render() {
    const products = Store.getProducts().filter(p =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const subtotal = cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 style="color: var(--sage-dark);">Point of Sale (Kasir)</h2>
          <p style="font-size: 0.88rem; color: var(--slate-muted);">Kasir Bertugas: <strong>${currentUser.nama_lengkap}</strong></p>
        </div>
      </div>

      <div class="pos-layout">
        <div class="card">
          <input type="text" id="posSearch" class="form-control" placeholder="Cari nama produk atau scan SKU..." value="${searchQuery}" />
          <div class="product-grid">
            ${products.map(p => `
              <div class="product-card" data-sku="${p.sku}">
                <div style="font-size: 0.75rem; color: var(--slate-muted);">${p.sku} • Stok: ${p.stok}</div>
                <div style="font-weight: 600; margin: 6px 0; font-size: 0.92rem;">${p.nama}</div>
                <div style="color: var(--sage-primary); font-weight: 700;">${formatRupiah(p.harga_jual)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">Keranjang Belanja</h3>
            ${cart.length === 0 ? '<p style="color: var(--slate-muted); font-size: 0.9rem;">Belum ada item dipilih.</p>' : `
              <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
                ${cart.map((item, idx) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.5rem;">
                    <div>
                      <div style="font-weight: 600; font-size: 0.9rem;">${item.nama}</div>
                      <div style="font-size: 0.8rem; color: var(--slate-muted);">${formatRupiah(item.harga_jual)} x ${item.qty}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <button class="btn btn-outline" style="padding: 2px 8px;" data-dec="${idx}">-</button>
                      <span>${item.qty}</span>
                      <button class="btn btn-outline" style="padding: 2px 8px;" data-inc="${idx}">+</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.9rem;">
              <span>Subtotal</span><span>${formatRupiah(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.9rem;">
              <span>PPN (11%)</span><span>${formatRupiah(tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.15rem; color: var(--sage-dark); margin-bottom: 1rem;">
              <span>Total Tagihan</span><span>${formatRupiah(total)}</span>
            </div>

            <div class="form-group">
              <label>Metode Pembayaran</label>
              <select id="payMethod" class="form-control">
                <option value="Tunai" ${paymentMethod === 'Tunai' ? 'selected' : ''}>Tunai (Cash)</option>
                <option value="QRIS" ${paymentMethod === 'QRIS' ? 'selected' : ''}>QRIS</option>
                <option value="Transfer" ${paymentMethod === 'Transfer' ? 'selected' : ''}>Transfer Bank</option>
              </select>
            </div>

            <button id="btnCheckout" class="btn btn-primary btn-block" ${cart.length === 0 ? 'disabled' : ''}>
              Proses Pembayaran & Cetak Struk
            </button>
          </div>
        </div>
      </div>
    `;

    const searchInput = container.querySelector('#posSearch');
    searchInput.focus();
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      render();
    };

    container.querySelectorAll('.product-card').forEach(card => {
      card.onclick = () => {
        const sku = card.dataset.sku;
        const prod = Store.getProducts().find(p => p.sku === sku);
        if (!prod || prod.stok <= 0) return alert('Stok produk habis!');
        const existing = cart.find(c => c.sku === sku);
        if (existing) {
          if (existing.qty < prod.stok) existing.qty++;
        } else {
          cart.push({ ...prod, qty: 1 });
        }
        render();
      };
    });

    container.querySelectorAll('[data-inc]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.inc);
        const prod = Store.getProducts().find(p => p.sku === cart[idx].sku);
        if (cart[idx].qty < prod.stok) cart[idx].qty++;
        render();
      };
    });

    container.querySelectorAll('[data-dec]').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.dec);
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
        render();
      };
    });

    container.querySelector('#payMethod').onchange = (e) => {
      paymentMethod = e.target.value;
    };

    container.querySelector('#btnCheckout').onclick = () => {
      const tx = {
        id: 'TRX-' + Date.now().toString().slice(-6),
        kasir: currentUser.nama_lengkap,
        waktu: new Date().toLocaleString('id-ID'),
        items: [...cart],
        subtotal,
        tax,
        total,
        metode: paymentMethod
      };
      Store.addTransaction(tx);
      alert(`Transaksi ${tx.id} berhasil disimpan!
Total: ${formatRupiah(total)} (${paymentMethod})`);
      cart = [];
      render();
    };
  }

  render();
}
