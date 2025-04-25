export function showSwal(type) {
    if (type === 'start') {
        Swal.fire({ title: 'Waktunya Kerja!', text: 'Fokus yuk 💻', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'break') {
        Swal.fire({ title: 'Istirahat Dulu 😌', text: 'Ambil napas sebentar...', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'longbreak') {
        Swal.fire({ title: 'Saatnya Istirahat Panjang 😴', text: 'Ambil napas sebentar...', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'done') {
        Swal.fire({ title: 'Selesai Semua! 🎉', text: 'Kamu hebat! Waktunya istirahat total 💖', icon: 'success', confirmButtonColor: '#a7d6f1', confirmButtonText: 'Terima Kasih!' });
    } else if (type === 'saved') {
        Swal.fire({ title: 'Pengaturan Tersimpan! 🥳', text: 'Waktu untuk mulai! Klik Start untuk memulai siklusmu! ⏰💪', icon: 'success', confirmButtonColor: '#a7d6f1', confirmButtonText: 'Yuk Mulai! 🚀' });
    } else if (type === 'notif-denied') {
        Swal.fire({
            title: 'Oh tidak! 😢',
            text: 'Ayo, aktifkan notifikasi di pengaturan browser agar kamu nggak ketinggalan! 🌟',
            icon: 'error',
            confirmButtonColor: '#a7d6f1',
            confirmButtonText: 'Oke! Saya Aktifkan! 💖'
        });
    } else if (type === 'not-saved') {
        Swal.fire({
            title: 'Oops! Pengaturan Belum Disimpan 😅',
            text: 'Yuk, simpan pengaturan dulu supaya bisa mulai timer-nya! ⏰✨',
            icon: 'error',
            confirmButtonColor: '#a7d6f1',
            confirmButtonText: 'Simpan Pengaturan! 📝'
          });
    }
}
