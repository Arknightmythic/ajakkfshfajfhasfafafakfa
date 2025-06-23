import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  let location = useLocation()
  const [title, setTitle] = useState('')

  useEffect(() => { 
    if(location.pathname == '/'){
      setTitle('Dashboard')
    }
    else if(location.pathname == '/upload-grading'){
      setTitle('Upload & Grading')
    }
    else if(location.pathname == '/batch-synchronization'){
      setTitle('Batch Synchronization List')
    }
    else if(location.pathname == '/history'){
      setTitle('Synchronization History')
    }
    
  }, [location])
    return (
        <header className="flex flex-row bg-[#F9FAFB] justify-between items-center ">
            <div>
                <h1 className="text-3xl font-bold mx-8 mt-8">{title}</h1>
            </div>
        </header>
    )
}

export default Header