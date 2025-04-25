export function showSwal(type) {
    if (type === 'start') {
        Swal.fire({ title: 'Waktunya Kerja!', text: 'Fokus yuk 💻', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'break') {
        Swal.fire({ title: 'Istirahat Dulu 😌', text: 'Ambil napas sebentar...', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'longbreak') {
        Swal.fire({ title: 'Saatnya Istirahat Panjang 😴', text: 'Ambil napas sebentar...', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'done') {
        Swal.fire({ title: 'Selesai Semua! 🎉', text: 'Kamu hebat! Waktunya istirahat total 💖', icon: 'success', confirmButtonColor: '#a7d6f1' });
    } else if (type === 'saved') {
        Swal.fire({ title: 'Pengaturan Disimpan!', text: 'Klik tombol Mulai untuk memulai ⏰', icon: 'success', confirmButtonColor: '#a7d6f1' });
    } else if (type === 'notif-denied') {
        Swal.fire({ title: 'Notifikasi Ditolak!', text: 'Silakan aktifkan notifikasi di pengaturan browser.', icon: 'error', confirmButtonColor: '#a7d6f1' });
    } else if (type === 'not-saved') {
        Swal.fire({ title: 'Setting Belum Disimpan', text: 'Silahkan Simpan Setting Terlebih Dahulu.', icon: 'error', confirmButtonColor: '#a7d6f1' });
    }
}
