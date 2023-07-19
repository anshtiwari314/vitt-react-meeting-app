import React, { useEffect ,useRef} from 'react'

export function AudioVideo({e,muted}:{e:any,muted:boolean}){
    const vid = useRef<any>(null)

    useEffect(()=>{
        if(e.isLoading===true)
        return 
        if(e.isAudioStream===true){
            let audio = new Audio();
            audio.srcObject = e.stream;
            console.log(muted)
            muted===true ? null:audio.play()
        }else{
            try{
                vid.current.srcObject = e.stream
                vid.current.addEventListener('loadedmetadata',()=>vid.current.play() )
              }
              catch(err){
                console.log("vid.current",vid.current,e)
              }
        }
    },[])

    if(e.isAudioStream===false){
        return <span>
                    <video ref={vid} muted={muted}/>
                </span>
        
        
    }else{
        return <div><p>AN</p></div>
    }
}
export default function DisplayComp({e,muted}:{e:any,muted:boolean}) {
  return (
    <>
        {e.isLoading===true ? <div ><p>AN</p></div> : <AudioVideo e={e} muted={muted}/>}
    </>
  )
}
