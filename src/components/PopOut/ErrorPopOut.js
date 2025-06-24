import Swal from "sweetalert2";

export const ErrorPopOut = () => { 
    return(Swal.fire({
        title: "Oops...",
        icon: "error",
        text: "Something went wrong!",
        draggable: false
      })
    );
 }