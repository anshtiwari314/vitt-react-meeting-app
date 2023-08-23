import React, { useEffect ,useRef} from 'react'

export function AudioVideo({e,muted}:{e:any,muted:boolean}){
    const vid = useRef<any>(null)
    const element = useRef<any>(null)

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
                vid.current.addEventListener('loadedmetadata',()=>{
                console.log('video available'); 
                let videoTrack = e.stream.getVideoTracks()[0]
                // videoTrack.addEventListener('ended',()=>{
                //     console.log('track ended')
                // })
                // e.stream.oninactive = ()=>{
                //     console.log('stream inactive')
                //     element.current.remove()
                // }
                // videoTrack.onmute =()=> {
                //     console.log('video track muted')
                // }
                setTimeout(()=>{
                  vid.current.play()
                },3000)
                 
                })
              }
              catch(err){
                console.log("vid.current",vid.current,e)
              }
        }
    },[])

    if(e.isAudioStream===false){
        return <span ref={element}>
                    <video  ref={vid} muted={muted} className={e.id}/>
                </span>
    }else{
        return <div><p>AN</p></div>
    }

}
export function DisplayComp({e,muted}:{e:any,muted:boolean}) {
  return (
    <>
        
       { e.isLoading===true ? <div ><p>AN</p></div> : <AudioVideo e={e} muted={muted}/>}
        
    </>
  )
}

export default function Comp({e,muted}:{e:any,muted:boolean}){
    if(e.remove===true){
        return null
    }else return <DisplayComp e={e} muted={muted}/>
}
