import React, { useEffect ,useRef, useState} from 'react'
import {v4 as uuidv4} from 'uuid';
import  TextPlaceHolder from './TextPlaceHolder';
import AudioVideo  from './AudioVideo';


export default function DisplayComp({e,muted,large,setSelectedNumber=null,num}:{e:any,muted:boolean,large:boolean,setSelectedNumber:any,num:number}) {
 
    useEffect(()=>{
      console.log('display-component triggers')
    },[])
    function displayOnLargeScreen(){
        
        if(setSelectedNumber===null|| large===true)
        return ;

        setSelectedNumber(num)
      }
      
  return (
    <div onClick={displayOnLargeScreen} style={{height:"100%",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
        <AudioVideo e={e} muted={muted} large={large} num={num} />
        {/* <TextPlaceHolder large={large} setLargeVideo={setLargeVideo}/> */}
    </div>
  )
}
