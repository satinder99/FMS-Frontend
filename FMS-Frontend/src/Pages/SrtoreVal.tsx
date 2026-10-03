import { useAuthStore } from "../store/authStore";

function StoreVal(){
   function buttonClick(){

    const userdata = useAuthStore.getState();
    console.log("userdata in store is : ",userdata)
}
    return <button onClick={buttonClick}>store value</button>
    
}

export default StoreVal;