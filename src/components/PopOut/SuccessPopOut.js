import Swal from "sweetalert2";

export const SuccessPopOut = (title, text) => { 
    return(Swal.fire({
        title: title,
        icon: "success",
        text: text,
        draggable: false
      })
    );
 }