import React,{useState,useEffect,useRef} from 'react'
import DisplayComp from '../components/DisplayComp'
import './mainpage.css'
import placeholderImg from './assets/placeholder.png'
import { useNavigate,useParams,useSearchParams } from 'react-router-dom'
import { useData } from '../context/DataWrapper'
import {v4 as uuidv4} from 'uuid'
import DisplayLargerComp from '../components/DisplayLargerComp'
import DisplaySmallerComp from '../components/DisplaySmallerComp'
import Msg from '../components/Msg'


//@ts-ignore
export function Tray({openSideWindow,setOpenSideWindow,messagingOn,setMessagingOn,isMobile,toggleRmWindow,setToggleRmWindow}){
  // const [cameraToggle,setCameraToggle ] = useState(true)
  // const [microphoneToggle,setMicroPhoneToggle] = useState(true)
  //@ts-ignore
  const {cameraToggle,setCameraToggle ,microphoneToggle,setMicroPhoneToggle} = useData()
  const [time,setTime] = useState('')
  //const navigate = useNavigation()
  // const [] = useState()
  
  function handleLeave(e:{e:any}){
    //navigate('/leave')
  }
  let styling:any = {
    tray:{
      position:"absolute",

      //border:"0.2rem solid blue",
      transform:"translate(-50%)",
      left:"50%",
      bottom:"1%",
    },
    trayWrapper:{
      width:isMobile===false?"50vw":"99vw",
      height:isMobile===false?"6rem":"8rem",
      display:"flex",
      flexDirection:"row",
      justifyContent:"space-equally"
    },
    iconHolderDiv:{
      display:"flex",
      justifyContent:"space-around",
      alignItems:"center",
      width:"100%",
      backgroundColor:"gray",
      margin:"0 0.1rem",
      fontSize:"2.5rem",
      padding:"0.5rem 0.2rem",
     
      // justifyContent:"center",
      // alignItems:"center"
    },
    icon:{
      color:"white",
      fontSize:isMobile===false?"3rem":"3.5rem",
      margin:"0 1.2rem",
      cursor:'pointer'
    },
    iconRed:{
      color:"white",
      fontSize:"4rem"
    }
  }

  //@ts-ignore
  function timer(hour,min,sec,d){
    let date2= new Date()
    var diff = date2.getTime() - d.getTime();

    var msec = diff;
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    if(hh<=0) 
    setTime(`${mm}:${ss}`)
    else 
    setTime(`${hh}:${mm}:${ss}`)
}

  useEffect(()=>{
    let d = new Date()
    let intervalId :any;
    intervalId = setInterval(()=>{
        timer(d.getHours(),d.getMinutes(),d.getSeconds(),d)
    },1000)
    return ()=>{
      clearInterval(intervalId)
    }
  },[])
  return(
    <div style={styling.tray}>
      <div style={styling.trayWrapper}>
        <div style={styling.iconHolderDiv}>{time}</div>
        <div style={styling.iconHolderDiv}>
            <i 
              style={{...styling.icon,display:`${toggleRmWindow===true?"":"none"}`}} 
              className="fa-solid fa-table-cells-large icons" 
              id="layoutIcon"
              onClick={()=>setToggleRmWindow(false)}
            ></i>
            <i 
              style={{...styling.icon,display:`${toggleRmWindow===false?"":"none"}`}} 
              className="fa-solid fa-comment icons"  
              id="commentIcon"  
              onClick={()=>setToggleRmWindow(true)}
            ></i>
        </div>
        <div style={styling.iconHolderDiv}>
            <i 
              style={{...styling.icon,display:`${cameraToggle===true?"":"none"}`}} 
              className="fa-solid fa-video icons" 
              id="vidIcon"
              onClick={()=>{setCameraToggle(false);}}
            ></i>
            <i 
              style={{...styling.icon,display:`${cameraToggle===false?"":"none"}`}} 
              className="fa-solid fa-video-slash icons" 
              id="crossVidIcon" 
              onClick={()=>{setCameraToggle(true);}}
            ></i>
                  
            <i 
              style={{...styling.icon,display:`${microphoneToggle===true?"":"none"}`}} 
              className="fa-solid fa-microphone icons" 
              id="micIcon" 
              onClick={()=>{setMicroPhoneToggle(false);}}
              ></i>
            <i 
              style={{...styling.icon,display:`${microphoneToggle===false?"":"none"}`}} 
              className="fa-solid fa-microphone-slash icons" 
              id="crossMicIcon" 
              onClick={()=>{setMicroPhoneToggle(true);}}
              ></i>
        </div>
        <div style={styling.iconHolderDiv}>
          <i 
            style={{...styling.icon,display:""}} 
            className="fa-solid fa-message icons" 
            id="msgIcon"
            onClick={()=>{setMessagingOn(true);setOpenSideWindow(true);}}
          ></i>
          <i 
            style={{...styling.icon,display:""}} 
            className="fa-solid fa-users icons" 
            id="usersIcon"
            onClick={()=>{setMessagingOn(false);setOpenSideWindow(true);}}
          ></i>
        </div>
        <div style={styling.iconHolderDiv}>
          <i 
            style={{...styling.icon,display:""}} 
            className="fa-solid fa-display icons" 
            id="screen-sharing"
          ></i>
        </div>
        <div style={{...styling.iconHolderDiv,backgroundColor:"red"}}>
          <a href="/leave" >
              <i 
                style={{...styling.icon,...styling.iconRed,display:""}} 
                className="fa-solid fa-xmark icons" 
                id="crossIcon"
                //onClick={handleLeave}

              ></i>
          </a> 
        </div>
      </div>
    </div>
  )
}
//@ts-ignore
export function SideWindow({openSideWindow,setOpenSideWindow,messagingOn,setMessagingOn,isMobile}){
  //let [messagingOn,setMessagingOn] = useState<boolean>(false);
  const {msg,setMsg,myId,name} =  useData()
  const [message,setMessage] = useState('')

  function handleMessage(){
    console.log("handle message clicked")
    //send this message to other users
    let tempMsgObj = {
      id:myId,
      msg:message,
      name:name
    } 
    setMsg(prev=>[...prev,tempMsgObj])
    setMessage('')

  }

  let styling:any ={
    sideWindow:{
      position:"absolute",
      right:isMobile===false ?(openSideWindow===true?"0":"-20vw"):(openSideWindow===true?"0":"-100vw"),
      top:"0",
      //border:"0.1rem solid blue",
      zIndex:"2",

    },
    sideWindowWrapper:{
      width:isMobile===false?"20vw":"100vw",
      height:"100vh",
      backgroundColor:"gray",
      border:"0.2rem solid blue",

    },
    firstRow:{
      display:"flex",
      justifyContent:"flex-end",
      height:"4rem",
      border:"0.1rem solid red"
    },
    crossButton:{
      // width:"2rem",
      // height:"1rem",
      //height:"2rem",
      padding:"1rem 1.2rem",
      fontSize:"2rem",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    },
    secondRow:{
      display:"flex",
      margin:"0 1rem",
      flexWrap:"wrap",
      alignItems:"center",
      justifyContent:"space-around"
    },
    button:{
      margin:"0.5rem 0",
      padding:"1rem 1.5rem",
      fontSize:"2rem",
      borderRadius:"0.2rem",
      outline:"none",
      border:"none",
    },
    subSideWindow:{
      margin:"2rem 0",
      height:"80%",
     
      
      //border:"0.1rem solid blue",
    },
    usersWindow:{
      overflowY:"scroll",
      scrollBehaviour:"smooth"
    },
    user:{
      margin:"1rem 1rem",
      boxSizing:"border-box",
      display:"flex",
      alignItems:"center",
      justifyContent:"space-around",
      fontSize:"1.8rem",
      width:"80%",
      padding:"1rem 0"
      // border:"0.1rem solid red",
      
    },
    msgWindow:{
      height:"90%",
      border:"0.1rem solid violet",
      overflowY:"scroll",
      scrollBehaviour:"smooth"
    },
    inputWrapper:{
      height:"5rem",
      display:"flex",
      alignItems:"center",
      backgroundColor:"white",
      padding:"0.5rem 0"
    },
    inputBar:{
      height:"100%",
      width:"80%",
      paddingLeft:"1rem",
      outline:"none",
      
    },
    sendBtn:{
      width:"20%",
      margin:"0",
      padding:"0",
      height:"4rem",
      // margin:"0.5rem 0",
      // padding:"1rem 1.5rem",
      fontSize:"2rem",
      borderRadius:"1rem",
      outline:"none",
      border:"none",
      backgroundColor:"blue",
      color:"white",
      
    },
    msg:{
      // border:"0.1rem solid white",
      display:"flex",
      flexDirection:"column",
      margin:"0.5rem 0"
      // alignItems:"end"
    },
    msgWrapper:{
      width:"fit-content",
      // border:"0.1rem solid red",
      padding:"0 1rem"
    },
    incomingWrapper:{
      alignSelf:"start",
    },
    outgoingWrapper:{
      alignSelf:"end",
      textAlign:"right",
      
    },
    name:{
      letterSpacing:"0.1rem",
      textTransform:"capitalize",
      
    },
    incoming:{
      padding:"1rem",
      backgroundColor:"silver",
      width:"fit-content",
      borderRadius:"0.5rem"
    },
    outgoing:{
      padding:"1rem",
      backgroundColor:"silver",
      width:"fit-content",
      borderRadius:"0.5rem"
    }
  }
  return ( 
      <div style={styling.sideWindow}>
        <div style={styling.sideWindowWrapper}>
          <div style={styling.firstRow}>
              <button style={styling.crossButton} onClick={()=>setOpenSideWindow(false)}>
                    <i 
                    style={{...styling.icon,...styling.iconRed,display:""}} 
                    className="fa-solid fa-xmark icons" 
                    //onClick={handleLeave}
                  ></i>
              </button>
          </div>
          <br/>
          <br/>
          <div style={styling.secondRow}>
              <span style={{fontSize:"1.8rem",color:"white"}}>users</span>
              <button style={styling.button} onClick={()=>setMessagingOn(true)}>message</button>
              <button style={styling.button} onClick={()=>setMessagingOn(false)}>users</button>
          </div>
          {messagingOn===false?
          <div style={{...styling.subSideWindow ,...styling.usersWindow}}>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>
              
              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>

              <div style={styling.user}>
                  <div style={{width:"fit-content"}}>
                    <div style={{display:"flex",alignItems:"center",width:"3.5rem",justifyContent:"center",height:"3.5rem",borderRadius:"1.75rem",backgroundColor:"red"}}>
                      <p style={{width:"fit-content",fontSize:"1.2rem"}}>AN</p>
                    </div>
                  </div>
                  <div >
                    <p style={{width:"fit-content",fontSize:"1.5rem"}}>Anuj</p>
                    <p style={{width:"fit-content",fontSize:"1rem"}}>meeting host</p>
                  </div>
                  <div >
                    <i className='fa-solid fa-thumbtack pin'></i>
                  </div>
              </div>
          </div>
          :
          <div style={styling.subSideWindow}>
              <div style={styling.msgWindow}>
                  {
                  msg.map((e:any,i:number)=>{
                   // console.log("msg map",e)
                    if(e.id===myId)
                    return  <div style={{...styling.msg}} key={i}>
                      <div style={{...styling.msgWrapper,...styling.outgoingWrapper}}>
                        <p style={{...styling.name,width:"fit-content",textAlign:"right",marginLeft:"86%"}}>you</p>
                        <p style={styling.outgoing}>{e.msg}</p>
                      </div>
                    </div>
                    
                    else
                    return <div style={styling.msg} key={i}>
                            <div style={{...styling.msgWrapper,...styling.incomingWrapper}}>
                              <p style={{...styling.name,width:"fit-content"}}>
                                {e.name}
                              </p>
                              <p style={styling.incoming}>{e.msg}</p>
                            </div>
                          </div>
                  }) 
                  }
                 

                  
                  {/* <p>hi</p>
                  <p>hi</p>
                  <p>hi</p>
                  <p>hi</p> */}
              </div>
              <div style={styling.inputWrapper}>
                <input 
                  style={styling.inputBar} 
                  placeholder='write your message'
                  value={message}
                  onChange={(e)=>setMessage(e.target.value)}
                />
                <button style={styling.sendBtn} onClick={()=>handleMessage()}>
                 <i className="fa-solid fa-share"></i>
                </button>
              </div>
          </div>
        }
        </div>
      </div>
    )
}
export function VideoLayout({openSideWindow,isMobile,toggleRmWindow}:{openSideWindow:boolean , isMobile:boolean,toggleRmWindow:boolean}){
  const [largeVideo,setLargeVideo] = useState(null)
  const largeVideoRef = useRef(null)
  const [selectedNumber,setSelectedNumber] = useState<number|null>(null)
  

  let number = 3;
  //@ts-ignore
  const {users} = useData();
  let styling:any ={
      gridView:{
        width:"49vw",
        height:number>2?"50vh":"100vh",
        border:"0.1rem solid red"
      },
      scaledView:{
        flex1:{
          width:isMobile===false?"80%":"100%",
          border:"0.1rem solid red",
          display:"flex",
          justifyContent:"center",
          alignItems:"center",
          height:isMobile===false?"":"90%",
        },
        flex2:{
          display:"flex",
          flexDirection:isMobile===false?"column":"row",
          width:isMobile===false?"20%":"100vw",
          height:isMobile ===false?"100%":"fit-content",
          border:"0.1rem solid red",
          overflow:"scroll",
          
          background:"transparent"
        },
        videoWrapper:{
          // height:"100%",
          
          // width:"100%":"25rem",
          // width:"100%",
           border:"0.1rem solid red",
          margin:"1rem 0",
          // backgroundColor:"gray"

          // backgroundColor:"aqua",
          // width:isMobile===false?"100%":"25rem",
          // position:"absolute",

        },
        flex1Video:{
          height:"90%",
          width:"70%",
          objectFit:"cover",
          
        },
        flex2Video:{
          height:"10rem",
          width:"100%"
        }
      }
  }

  useEffect(()=>{
    //console.log("i am users length",users.length,users)
    if(users.length===0)
    return ;
    
  //  console.log("i am users length 2",users.length)
    if(users.length===1 && largeVideoRef.current !==users[0]){
     // console.log("i am users inside",users.length)
      largeVideoRef.current = users[0]
      setLargeVideo(users[0])
  }
    else if(users.length>1 && selectedNumber ===null && largeVideoRef.current !==users[1]){
      largeVideoRef.current = users[1]
      setLargeVideo(users[1]) 
    }

    else if(users.length>1 && selectedNumber !==null && largeVideoRef.current !==users[selectedNumber]){
      largeVideoRef.current = users[selectedNumber]
      setLargeVideo(users[selectedNumber])
    }
  },[users,selectedNumber])
  
  useEffect(()=>{
   console.log("users changed in mainPage")
  },[users])
  useEffect(()=>{
    console.log("isMobile",isMobile)
  },[isMobile])
  
  function screenSize(){
    // console.log("window size",window.screen.height,window.screen.availHeight)
    // console.log("window height",window.screen.width,window.screen.availWidth)
    // let isMobile = false ;
    // let openWindow = true 
    // console.log(isMobile?(openWindow ?"a":"b"):(openWindow?"c":"d"))

  }
  

  return (

    <> 
    <div className='left-window' style={{
      display:"flex",
      flexDirection:isMobile===false?"row":"column",
      height:"90vh",
      zIndex:0,
      width:isMobile===false ?(openSideWindow===true?"78vw":"88vw"):("100vw")

      }}>

      <div style={styling.scaledView.flex1} className='large-video-holder'>
          {/* @ts-ignore */}
          {/* {largeVideo && <DisplayComp e={largeVideo} muted={true} large={true} num={4193}/>} */}
          {/* @ts-ignore */}
          {toggleRmWindow===true ? 
            <RmLayout/>
          : 
          largeVideo && <DisplayLargerComp e={largeVideo} muted={true} large={true} num={4193} isMobile={isMobile}/>
          }
          {/* {largeVideo && <DisplayLargerComp e={largeVideo} muted={true} large={true} num={4193} isMobile={isMobile}/>} */}
      </div>

      <div style={styling.scaledView.flex2} className='smaller-video-holder'> 
      {/* {users.length>0 && console.log("loggin before render",users)} */}
        { users.map((e:any,i:number)=>{
         // console.log('triggered',e.id)
          const randomValue = Math.random()
          if(e.remove===true){
            return null
          }
          if(i==0){
            return <div style={styling.scaledView.videoWrapper} key={i*randomValue}>
              <DisplaySmallerComp 
              e={e} 
              muted={true}  
              num={i} 
              large={false} 
              //@ts-ignore
              isMobile={isMobile}
              setSelectedNumber={setSelectedNumber}
              />
          </div>
          }else{
            return <div style={styling.scaledView.videoWrapper} key={i*randomValue}>
              <DisplaySmallerComp 
              e={e} 
              muted={e.microphoneStatus===true?false:true}  
              num={i} 
              large={false} 
              //@ts-ignore
              isMobile={isMobile}
              setSelectedNumber={setSelectedNumber}  
              />
          </div>
          //   <div style={styling.scaledView.videoWrapper}>
          //   <video src={placeholderImg} style={styling.scaledView.flex2Video}/>
          // </div>
          }
        })}
        {/* <div style={styling.scaledView.videoWrapper}>
          <img src={placeholderImg} style={styling.scaledView.flex2Video}/>
        </div>
        <div style={styling.scaledView.videoWrapper}>
          <img src={placeholderImg} style={styling.scaledView.flex2Video}/>
        </div> */}
        
       
      </div>
        

    </div>
    
    </>
  )
}
export function RmLayout(){
  const {cues} = useData()
return (
  <div className='msg-box'>
                {/* {data && data.map((e:any,i:number)=>{
                    console.log(e)
                    if(e.type ==="TextMsg")
                        return <AddTextMsg data={e} key={i}/>
                    else if(e.type === "SuggestiveMsg")
                        return <AddOnlySuggestiveMsg data={e} key={i}/>
                    else if(e.type === "ImageMsg")
                        return <AddImageMsg data={e} key={i}/>
                    else if(e.type === "InputForm")
                        return <AddInputForm data={e} key={i}/>
                    else if(e.type === "RadioForm")
                        return <AddRadioForm data={e} key={i}/>;
                })} */}
            

            {/* { 
            msgLoading==true ?
            <div className='msg-loader-wrapper'>
                <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" className='msg-loader'/>
            </div>
             :
            null
            } */}
            {cues && cues.map((e:any,i:number)=>{
                return <Msg e={e} key={i}/>
            })}
            {/* <Msg e={Data} /> */}
  </div>
)
}

export default function MainPage() {
  const [openSideWindow,setOpenSideWindow] = useState<boolean>(false);
  const [messagingOn,setMessagingOn] = useState<boolean>(false);

  //@ts-ignore
  const {setRoomId,users,myStream,setMob,roomId,setIsHost,setMyId,isHostRef,normalize,setName} = useData()
   const {link} = useParams()
   const [searchParams,setSearchParams] = useSearchParams()
   const navigate = useNavigate()
   const [toggleVideo,setToggleVideo] = useState(true)
   const [toggleAudio,setToggleAudio] = useState(true)
   const [isMobile,setIsMobile] = useState(false);
   const [toggleRmWindow,setToggleRmWindow] = useState(false)
  

   function diff_minutes(time2:number, time1:number) {

    var diff =(time2-time1) / 1000;
    let diff_in_min = diff/ 60;
    //let diff_in_hours = diff_in_min / 60;
    return Math.abs(Math.round(diff_in_min));
}

  useEffect(()=>{

    //getting name 
    let myName:string = ''
    if(sessionStorage.getItem('userName') !== null){
      setName(sessionStorage.getItem('userName'))
  }else{
     
      while(myName.length<2){
      myName = prompt("Please enter your name")

      if(myName.length<2)
          alert('Name must have 2 letters long')
      }
      setName(myName)
      sessionStorage.setItem('userName',myName)
  }
  },[])

  useEffect(()=>{
  function Resizing(){
    //console.log("window width",window.screen.width)
    if(window.screen.width<800)
    setIsMobile(true)
    else
    setIsMobile(false)
  }
    Resizing()
    window.onresize = Resizing
 // if(window.screen.width<600)
    
  },[])

  useEffect(()=>{
    if(!link)
    navigate('/#')

    let params = new URLSearchParams(link)
   // console.log('params',setRoomId,params.get('room_id'))
  //cust id 
  //room id 
  //mob 
  if(!params.get('room_id') || !params.get('cust_id') || !params.get('mob')){
    navigate(`/#`)
  }
  else{
   // console.log(link)
    
    //console.log(link,params.get('room_id'),params.get('cust_id'),params.get('mob') )
    setRoomId(params.get('room_id'))
    setMob(params.get('mob'))
  }
  
  },[link])

  useEffect(()=>{
  if(!link || roomId ==='')
  return ;

  let params = new URLSearchParams(link)
  //params.get('cust_id')
  let tempId =uuidv4()
  let tempIsHost = false 
  
  if(!localStorage.getItem('created_by_admin')){
    //console.log('u r a general user')
    // setMyId()
    //setIsHost(false)
    // tempId = params.get('cust_id')
    // tempIsHost = false
  }else{
    try{
        let storedArr = localStorage.getItem('created_by_admin')
        //@ts-ignore
        let arr = JSON.parse(storedArr)

        let d = new Date()

        arr=arr.filter((e:any,index:number)=>{
        
            if(e.id === roomId){
              //setMyId(uuidv4())
              //setIsHost(false)
              console.log('admin u r admin')
              tempId = uuidv4()
              tempIsHost = true
            }
                  

            if(diff_minutes(d.getTime() ,e.time)<480)
                return true ;
            return false;
          })
      localStorage.setItem('created_by_admin',JSON.stringify(arr))
  }
  catch(e){
    console.log('error in try block',e)
    //localStorage.removeItem('created_by_admin')
    //setTimeout(()=>window.location.href='/',3000)
    }
  }
  //console.log(tempId,tempIsHost)

  isHostRef.current = tempIsHost
  setIsHost(tempIsHost)
  setMyId(tempId)

  },[link,roomId])

  return (
    <div style={{
      overflow:"hidden",
      width:"100vw",
      height:"100vh",
      position:"relative",
      backgroundColor:'#636363',
      border:"0.3rem solid tomato",

      }}>
    
    <VideoLayout 
      openSideWindow={openSideWindow} 
      isMobile={isMobile} 
      toggleRmWindow={toggleRmWindow} 
      
      />
    <SideWindow 
      openSideWindow={openSideWindow} 
      setOpenSideWindow={setOpenSideWindow}
      messagingOn={messagingOn}
      setMessagingOn={setMessagingOn}
      isMobile={isMobile}
      
    />
    <Tray 
    openSideWindow={openSideWindow} 
    setOpenSideWindow={setOpenSideWindow}
    messagingOn={messagingOn}
    setMessagingOn={setMessagingOn}
    isMobile={isMobile}
    toggleRmWindow={toggleRmWindow}
    setToggleRmWindow={setToggleRmWindow}
    />
    
    </div>
  )
}
