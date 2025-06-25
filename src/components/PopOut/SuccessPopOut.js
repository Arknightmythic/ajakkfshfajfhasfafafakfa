import Swal from "sweetalert2";

export const SuccessPopOut = (title, icon, text) => { 
    return(Swal.fire({
        title: title,
        icon: icon || "success",
        text: text,
        draggable: false
      })
    );
 }