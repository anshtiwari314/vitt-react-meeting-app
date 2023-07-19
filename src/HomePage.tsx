import React, { useEffect, useState } from 'react'
import {v4 as uuidv4} from 'uuid'

export default function HomePage() {
   const [link,setLink] = useState('')

   async function newMeeting(){
       let mobile= '8708213235'
       let roomId = uuidv4()
        let custId ;


        //add roomId as local storage in the browser 
        if(localStorage.getItem('created_by_admin') !=null){
            let d = new Date()
            let storedArr = localStorage.getItem('created_by_admin')
            //@ts-ignore
            let tempArr = JSON.parse(storedArr)
            tempArr.push( {id:roomId,time:d.getTime()} )
            //console.log(tempArr)
            
            //add links to browser
            localStorage.setItem('created_by_admin',JSON.stringify(tempArr));
            
        }
        else{
            //if creating link first time
            let d = new Date()
            localStorage.setItem('created_by_admin',JSON.stringify([{id:roomId,time:d.getTime()}]))
        }

        //verifying mobile number 
       await fetch('https://qhpv9mvz1h.execute-api.ap-south-1.amazonaws.com/prod/fetch-customerid',{
        method:'POST',
        headers:{
            'Accept':'application.json',
            'Content-Type':'application/json'
        },
        body:JSON.stringify({mobileno:mobile}),
        cache:'default'
        }).then((res)=>{
            return res.json()
        }).then(result=>{
            console.log('i am value',result)
            if(result.custid===null)
            return ;
            else custId = result.custid;

        }).catch((err)=>{
            console.log('error in verifying mobile',err)
            //meetingBtn.disabled = false
        })

        setLink(`${window.location.host}/#/meeting/room_id=${roomId}&cust_id=${custId}&mob=${mobile}`)
   }

   useEffect(()=>{

   },[])

   
  return (
    <div>HomePage
        <button onClick={()=>newMeeting()}>new meeting</button>
        <p>{link}</p>
    </div>
  )
}
