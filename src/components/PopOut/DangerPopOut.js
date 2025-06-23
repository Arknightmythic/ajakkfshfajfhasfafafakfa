import Swal from 'sweetalert2';

const DangerPopOut = (title, text, textButton, onConfirm) => {
    return Swal.fire({
        title: title || "Are you sure?",
        html: text || "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: textButton || "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed && typeof onConfirm === 'function') {
            onConfirm(); 
        }
    });
}
export default DangerPopOut;
