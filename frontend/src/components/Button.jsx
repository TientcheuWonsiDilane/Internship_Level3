import React from "react";

const Button = ({type, title})=>{  
       if(type==='white'){
        return(
            <button className="border ">{title}</button>
        )
       }
       else if(type==='black'){
        return(
            <button >{title}</button>
        )
       } 
       else{
        return(
            <button>{title}</button>
        )  
        
       }
}

export default Button;