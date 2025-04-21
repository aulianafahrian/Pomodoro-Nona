export function showSwal(type) {
    if (type === 'start') {
        Swal.fire({ title: 'Waktunya Kerja!', text: 'Fokus yuk 💻', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'break') {
        Swal.fire({ title: 'Istirahat Dulu 😌', text: 'Ambil napas sebentar...', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'longbreak') {
        Swal.fire({ title: 'Saatnya Istirahat Panjang 😴', text: 'Ambil napas sebentar...', icon: 'info', timer: 2000, showConfirmButton: false });
    } else if (type === 'done') {
        Swal.fire({ title: 'Selesai Semua! 🎉', text: 'Kamu hebat! Waktunya istirahat total 💖', icon: 'success', confirmButtonColor: '#ff69b4' });
    } else if (type === 'saved') {
        Swal.fire({ title: 'Pengaturan Disimpan!', text: 'Klik tombol Mulai untuk memulai ⏰', icon: 'success', confirmButtonColor: '#ff69b4' });
    }
}
