import React,{useState,useEffect,createContext,useContext,useRef} from 'react'
import io from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid';
import Peer from 'peerjs';


const Context = createContext("");

export function useData(){
    return useContext(Context);
}
type users = {
    id:string,
    stream:MediaStream|Object,
    isAdmin:boolean,
    isAudioStream:boolean,
    isLoading:boolean,
    roomId:string ,
    mob:string|number
}

export default function DataWrapper({children}:{children:React.ReactNode}) {

    let initialUser = {
        id:'',
        stream:{},
        isAdmin:false,
        isAudioStream:false,
        isLoading:true,
        roomId:'',
        mob:''
    }

    const [socket,setSocket] = useState<any>(null)
    const [roomId ,setRoomId] = useState<string>('')
    const [myId,setMyId] = useState<string>('')
    const [peer,setPeer] = useState<Peer|null>(null)
    const firstTimeConnectRef = useRef<boolean>(true)
    const [users,setUsers] = useState<users[]>([]);
    const [myStream,setMyStream] = useState<MediaStream|null>(null);
    const peersObjRef = useRef<any>({});
    let usersRef = useRef<users[]>([])
    let users2Ref = useRef<users[]>([])
    let tempData = useRef<users[]>([])
    let tempData2 = useRef<users[]>([])
    let usersFlag = useRef(2)
    let usersArrRef = useRef<users[]>([])
    let [isHost,setIsHost] = useState<null|boolean>(null)
    let isHostRef = useRef<null|boolean>(null)
    let [mob,setMob] = useState('')

    const adminUrl = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-adminaudio`
    //http://localhost:5004/admin
    const adminClientUrl = 'https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio'
    //http://localhost:5005/admin-client
    const clientTranscriptionUrl = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com' 
    //http://localhost:5006/client

    function gettingMediaStream(){
        return navigator.mediaDevices.getUserMedia({
            video:{
                frameRate:{
                    ideal:60,
                    min:10
                }
            },
            audio:true
        })
    }
    function gettingAudioStream(){
        return navigator.mediaDevices.getUserMedia({
                    audio:true
                })
    }    

    
    useEffect(()=>{
        if(myId==='')
        return 
      let tempSocket =  io('http://localhost:3005')
     // let tempId = uuidv4()

      let peer = new Peer(myId)
      
      
      setSocket(tempSocket)
      setMyId(myId)
      setPeer(peer)


    },[myId])

    // useEffect(()=>{
    //     isHostRef.current=true
    //     setIsHost(true)
    // },[])
    
    
    
    useEffect(()=>{
        let id = setInterval(()=>{

            if(usersFlag.current>0){
            console.log(usersArrRef.current)
            setUsers([...usersArrRef.current])
            usersFlag.current--;
            }

        },5000)
        return ()=>clearInterval(id)
    },[])

    useEffect(()=>{
        // gettingMediaStream().then(bothStreams=>{

        // }).catch(err=>{
        //     getttingAudioStream().then()
        // })
        if(myId==='' || roomId==='' ||isHost===null || mob==='')
        return;
        console.log('myId is',myId)

        let tempObj = {...initialUser }
            tempObj.id = myId 
            tempObj.isAdmin=isHost 
             
            tempObj.isLoading =false 
            tempObj.roomId = roomId 
            tempObj.mob = mob   

        gettingMediaStream().then(bothStreams=>{
            setMyStream(bothStreams)

            tempObj.stream=bothStreams
            tempObj.isAudioStream = false
            usersArrRef.current.push(tempObj)
            setUsers([tempObj])
        }).catch(err=>{
            gettingAudioStream().then(audioStream=>{

                console.log(audioStream)
                setMyStream(audioStream)

                tempObj.stream =audioStream
                tempObj.isAudioStream = true
                usersArrRef.current.push(tempObj)
                setUsers([tempObj])
            })
        })
    },[myId,roomId,isHost,mob])

    //@ts-ignore
    function sendToServer(blob,url,data){
        console.log("url",url)
        //chunksWithMeta.splice(0,1)
        // chunks.splice(0,1)
        
        //chunksWithMeta=[]
        //chunks = []
        console.log(`sending`)
        let reader = new FileReader();
        reader.onloadend = ()=>{
            let base64data = reader.result;
           //console.log(base64data.split(',')[1])
    
            //https://f6p70odi12.execute-api.ap-south-1.amazonaws.com
            //http://localhost:5002/base64
            
            console.log('inside send to server',data);
           
            let date = new Date()
            fetch(url,{
                method:'POST',
                headers:{
                   'Accept':'application.json',
                   'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    uid:data.id,
                    roomid:data.roomId,
                    isadmin:data.isAdmin, 
                    mob:data.mob,
                    //@ts-ignore
                    audiomessage:base64data.split(',')[1],
                    timeStamp:`${date.toLocaleDateString()} ${date.toLocaleTimeString()}:${date.getMilliseconds()}`
                }),
                cache:'default',}).then(res=>{
                   console.log("res from audio server",res)
                })
            
        }
        reader.readAsDataURL(blob)
    }

    function bufferToWav(abuffer:ArrayBuffer, len:number) {
        //console.log("abuffer", abuffer, len);

        //@ts-ignore
        var numOfChan = abuffer.numberOfChannels,
          length = len * numOfChan * 2 + 44,
          buffer = new ArrayBuffer(length),
          view = new DataView(buffer),
          channels = [],
          i,
          sample,
          offset = 0,
          pos = 0;
      
        // write WAVE header
    
        //console.log("pos", pos, length);
        setUint32(0x46464952); // "RIFF"
        //console.log("pos", pos, length);
        setUint32(length - 8); // file length - 8
        //console.log("pos", pos, length);
        setUint32(0x45564157); // "WAVE"
        //console.log("pos", pos, length);
        setUint32(0x20746d66); // "fmt " chunk
        //console.log("pos", pos, length);
        setUint32(16); // length = 16
        //console.log("pos", pos, length);
        setUint16(1); // PCM (uncompressed)
        //console.log("pos", pos, length);
        setUint16(numOfChan);
        //console.log("pos", pos, length);
        //@ts-ignore
        setUint32(abuffer.sampleRate);
        //console.log("pos", pos, length);
        //@ts-ignore
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        //console.log("pos", pos, length);
        setUint16(numOfChan * 2); // block-align
        //console.log("pos", pos, length);
        setUint16(16); // 16-bit (hardcoded in this demo)
        //console.log("pos", pos, length);
        setUint32(0x61746164); // "data" - chunk
        //console.log("pos", pos, length);
        setUint32(length - pos - 4); // chunk length
        //console.log("pos", pos, length);
    
        // write interleaved data
        //@ts-ignore
        for (i = 0; i < abuffer.numberOfChannels; i++)
            //@ts-ignore
          channels.push(abuffer.getChannelData(i));
      
        while (pos < length) {
          for (i = 0; i < numOfChan; i++) {
            // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
          }
          offset++; // next source sample
        }
      
        return buffer;
        //@ts-ignore
        function setUint16(data) {
          view.setUint16(pos, data, true);
          pos += 2;
        }
        //@ts-ignore
        function setUint32(data) {
          view.setUint32(pos, data, true);
          pos += 4;
        }
    }
    
    function downsampleToWav(file:any, callback:CallableFunction) {
        //Browser compatibility
        // https://caniuse.com/?search=AudioContext

        //@ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext || AudioContext;
        const audioCtx = new AudioContext();
        const fileReader1 = new FileReader();
        fileReader1.onload = function (ev) {
          // Decode audio
          //@ts-ignore
          audioCtx.decodeAudioData(ev.target.result, (buffer) => {
            // this is where you down sample the audio, usually is 44100 samples per second
            const usingWebkit = !window.OfflineAudioContext;
            //console.log("usingWebkit", usingWebkit);

            //@ts-ignore
            const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            // {
            //   numberOfChannels: 1,
            //   length: 16000 * buffer.duration,
            //   sampleRate: 16000
            // }
            var offlineAudioCtx = new OfflineAudioContext(
              1,
              16000 * buffer.duration,
              16000
            );
      
            let soundSource = offlineAudioCtx.createBufferSource();
            soundSource.buffer = buffer;
            soundSource.connect(offlineAudioCtx.destination);
      
            const reader2 = new FileReader();
            reader2.onload = function (ev) {
              const renderCompleteHandler = function (evt:any){
                //console.log("renderCompleteHandler", evt, offlineAudioCtx);
                let renderedBuffer = usingWebkit ? evt.renderedBuffer : evt;
                const buffer = bufferToWav(renderedBuffer, renderedBuffer.length);
                if (callback) {
                  callback(buffer);
                }
              };
              if (usingWebkit) {
                offlineAudioCtx.addEventListener("complete", renderCompleteHandler);
                offlineAudioCtx.startRendering();
              } else {
                offlineAudioCtx
                  .startRendering()
                  .then(renderCompleteHandler)
                  .catch(function (err) {
                    console.log(err);
                  });
              }
            };
            reader2.readAsArrayBuffer(file);
      
            soundSource.start(0);
          });
        };
      
        fileReader1.readAsArrayBuffer(file);
    }
    
    function encodeMp3(arrayBuffer:any) {
    
        //@ts-ignore
        const wav = lamejs.WavHeader.readHeader(new DataView(arrayBuffer));
        console.log("i am wav", wav);
        const dataView = new Int16Array(arrayBuffer, wav.dataOffset, wav.dataLen / 2);
        //@ts-ignore
        const mp3Encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128);
        const maxSamples = 1152;
      
        console.log("wav", wav);
      
        const samplesLeft =
          wav.channels === 1
            ? dataView
            : new Int16Array(wav.dataLen / (2 * wav.channels));
      
        const samplesRight =
          wav.channels === 2
            ? new Int16Array(wav.dataLen / (2 * wav.channels))
            : undefined;
      
        if (wav.channels > 1) {
            //@ts-ignore
          for (var j = 0; j < samplesLeft.length; i++) {
            samplesLeft[j] = dataView[j * 2];
            //@ts-ignore
            samplesRight[j] = dataView[j * 2 + 1];
          }
        }
      
        let dataBuffer = [];
        let remaining = samplesLeft.length;
        for (var i = 0; remaining >= maxSamples; i += maxSamples) {
          var left = samplesLeft.subarray(i, i + maxSamples);
          var right;
          if (samplesRight) {
            right = samplesRight.subarray(i, i + maxSamples);
          }
          var mp3buf = mp3Encoder.encodeBuffer(left, right);
          dataBuffer.push(new Int8Array(mp3buf));
          remaining -= maxSamples;
        }
      
        const mp3Lastbuf = mp3Encoder.flush();
        dataBuffer.push(new Int8Array(mp3Lastbuf));
        return dataBuffer;
    }
    function sendStreamToServer(stream:MediaStream,data:any,recordingTime:number,url:string){
        let mediaStream =new MediaStream()
        mediaStream.addTrack(stream.getAudioTracks()[0])
        try{
        let arrayofChunks:Blob[] = []
        let mediaRecorder = new MediaRecorder(mediaStream,{
            audioBitsPerSecond:32000
        })
        mediaRecorder.ondataavailable = (e)=>{
            
            arrayofChunks.push(e.data)
        }
        mediaRecorder.onstop=()=>{
            downsampleToWav(new Blob(arrayofChunks,{type:"audio/ogg"}),(buffer:ArrayBuffer)=>{
            const mp3Buffer = encodeMp3(buffer)
            const blob = new Blob(mp3Buffer,{type:"audio/mp3"});
            
            sendToServer(blob,url,data)
            arrayofChunks=[]
            })
        }
        setTimeout(()=>mediaRecorder.stop(),recordingTime)
        
        mediaRecorder.start()
        }catch(e){
            console.log(e)
            return;
        }
    }

    useEffect(()=>{
        if(myStream===null || isHost===null ||isHost===true)
        return ;

        //sending stream for transcription 

        let intervalId:number
        //let url3 = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'
            
        sendStreamToServer(myStream,usersArrRef.current[0],3000,clientTranscriptionUrl)
            // triggers after 1.5sec
        intervalId =setInterval(()=>{
                
            sendStreamToServer(myStream,usersArrRef.current[0],3000,clientTranscriptionUrl)
        },1500)
        
        return ()=>{
           if(intervalId) clearInterval(intervalId)
        }
    },[myStream,isHost])

    useEffect(()=>{
        if(myStream ===null || isHost ===null || isHost===false)
        return 

        //sending admin stream 
        
        let intervalId:number

        sendStreamToServer(myStream,usersArrRef.current[0],4000,adminUrl)

        intervalId= setInterval(()=>{ 
        console.log(`sending admin stream`)
        
        //let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-adminaudio`
        sendStreamToServer(myStream,usersArrRef.current[0],4000,adminUrl)
        },4000)
        
        return ()=>{
            if(intervalId) clearInterval(intervalId)
        }
    },[myStream,isHost])

    useEffect(()=>{
        if(peer ===null || myStream===null )
        return;

        console.log('triggering peer fn',peer,myStream)
        let id:number;
       
        
        function reply(call:any){
            console.log("replying trigerred")
            socket.emit('connected-user-data',{...usersArrRef.current[0],toPeer:call.peer,isLoading:true})
            let intervalId:number 
            call.answer(myStream)
            
            call.on('stream',(userVideoStream:MediaStream)=>{
                //@ts-ignore
                
                if(!peersObjRef.current.hasOwnProperty(call.peer)){
                    //@ts-ignore
                    peersObjRef.current[call.peer] = {'call':call}

                    console.log('2nd getting stream',userVideoStream,call.peer)
                    
                    let flag =false;

                    for(let i=0;i<usersArrRef.current.length;i++){
                        if(usersArrRef.current[i].id===call.peer){
                        flag = true
                        usersArrRef.current[i] = {...usersArrRef.current[i],stream:userVideoStream,isLoading:false}
                        
                        usersFlag.current = 2

                        console.log('isHostRef 2',isHostRef.current)
                        if(isHostRef.current===true){
                            //let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio`
                            sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)

                            intervalId = setInterval(()=>{  
                                console.log(`reply set interval triggred 2`,userVideoStream)        
                                 //   adminRecordingWithMeta(oldUserVideoStream,false,url2,4000,"stream 1")
                                 
                                 sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)
                                },4000)
                    
                            }
                        break;
                        }
                        
                    }

                    if(flag ===false){  
                        
                        let tempObj = {...initialUser }
                        
                        tempObj.id = call.peer 
                        tempObj.stream = userVideoStream    
                        tempObj.isLoading=false 
                        usersArrRef.current.push(tempObj)   
                        console.log('inside flag 2',initialUser,tempObj)
                        usersFlag.current = 2   
                    }
                    console.log('length 2',usersArrRef.current.length)
                }
            })
            call.on('close',()=>{
                console.log('close event fired 2')
                let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== call.peer)
                usersArrRef.current = tempUsers
                usersFlag.current = 2

                if(intervalId) clearInterval(intervalId)
            })
        }
        peer.on('call',reply)

        return ()=>{
            peer.off('call',reply)
        }

    },[peer,myStream])


    useEffect(()=>{
        if(socket === null || myStream===null)
        return ;

        console.log('user-connected effect')
        //this runs for first time 
       //socket.on('connect',()=>{console.log('1st connect triggered');console.log('connected')})
       socket.on('connect',()=>{
           socket.emit('connected',myId)
        if(firstTimeConnectRef.current === true){
            console.log('1st connect triggered');
           
        }
        else {
        console.log('2nd connect triggered')
        socket.emit('join-room',roomId,myId)
            }
        })

        socket.on('disconnect',()=>console.log('disconnected'))
        
        socket.on('user-disconnected',(userId:string)=>{
            console.log('user-disconnected',userId)
            // let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== userId)
            // usersArrRef.current = tempUsers
            

            if(peersObjRef.current.hasOwnProperty(userId))
            peersObjRef.current[userId].call.close()
        })

    },[socket,myStream])
    
    useEffect(()=>{
        if(socket === null || myStream===null )
        return ;

        function connectToNewUser(stream:MediaStream,newUserId:string){
            console.log(peer,socket,stream,usersArrRef.current)
            socket.emit('connected-user-data',{...usersArrRef.current[0],toPeer:newUserId,isLoading:true})
                let intervalId:number
                const call = peer?.call(newUserId,stream)
                
                call?.on('stream',(userVideoStream)=>{
                    //@ts-ignore
                    console.log("includes 1st call peer")
                    //@ts-ignore

                    if(!peersObjRef.current.hasOwnProperty(call.peer)){
                        //@ts-ignore
                        peersObjRef.current[call.peer] = {'call':call}

                        console.log('getting video stream',userVideoStream)
                        
                            // if user is not in usersArrRef 
                            let flag = false

                            // changing that element with original stream
                            for(let i=0;i<usersArrRef.current.length;i++){
                                if(usersArrRef.current[i].id===call.peer){
                                flag = true
                                usersArrRef.current[i] = {...usersArrRef.current[i],stream:userVideoStream,isLoading:false}
                                usersFlag.current = 2

                                console.log('isHostRef 1',isHostRef.current)
                                if(isHostRef.current===true){
                                    //let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio`
                                    sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)
                                    intervalId = setInterval(()=>{  
                                        console.log(`reply set interval triggred 1`,userVideoStream)        
                                         //   adminRecordingWithMeta(oldUserVideoStream,false,url2,4000,"stream 1")
                                         
                                         sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)
                                        },4000)
                                }
                                break;
                            }
                        }
                        if(flag ===false){  
                                
                            let tempObj ={ ...initialUser}   
                            tempObj.id = call.peer 
                            tempObj.stream = userVideoStream
                            tempObj.isLoading=false
                            usersArrRef.current.push(tempObj)
                            console.log('inside flag 1',initialUser,tempObj)
                            usersFlag.current = 2
                        }

                            console.log('length 1',usersArrRef.current.length) 
                    }

                })
                call?.on('close',()=>{
                    console.log('close event fired 1')
                    let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== call.peer)
                    usersArrRef.current = tempUsers
                    usersFlag.current = 2

                    clearInterval(intervalId)

                })
        }
        function newUser(userId:string){
            console.log('user-connected',userId)
            //send my stream to this user 
            
            //@ts-ignore
            console.log(users)
           //@ts-ignore
          
           if(!peersObjRef.current.hasOwnProperty(userId)){
           //@ts-ignore
            connectToNewUser(myStream,userId)
           }
        }
        socket.on('user-connected',newUser)

        return ()=>socket.off('user-connected',newUser)
    },[socket,myStream])

    useEffect(()=>{
        if(socket ===null)
        return ;
    
       
        function removeUser(userId:string){
            console.log('remove user triggered')
            let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== userId)
            console.log('tab-close',tempUsers)
            usersArrRef.current = tempUsers
            
            //setUsers(tempUsers)
        }
        function modifyingUser(data:any){

            console.log("connected user data",data)
            
            //let misMatched = users.filter((e,i)=>e.id !== data.toPeer)
            //let matched = users.filter((e,i)=>e.id === data.toPeer)
            //console.log('matched',matched,misMatched)
            // matched[0].isAudioStream = data.isAudioStream
            //matched[0].isAdmin = data.isAdmin
            // setUsers([...misMatched,...matched])

            // if(data.toReceiver===true){
            //     users2Ref.current.push(data)   
            // }else{
            //     usersRef.current.push(data)
            // }
          if(!peersObjRef.current.hasOwnProperty(data.id)){
              //if new user
            console.log('connected-usr-data',data)
            usersArrRef.current.push(data)
            setUsers(prev=>[...prev,data])

            }
            else {
            // if user already there 
            console.log('connected-usr-else',data)

            for(let i=0;i<usersArrRef.current.length;i++){
                if(usersArrRef.current[i].id===data.id){
                
                
                usersArrRef.current[i] = {...data,stream:usersArrRef.current[i].stream,isLoading:false}
                usersFlag.current = 2

                if(isHostRef.current===true){
                    let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio`
                   
                    //@ts-ignore
                    sendStreamToServer(usersArrRef.current[i].stream,usersArrRef.current[i],4000,url)

                    let intervalId = setInterval(()=>{  
                        if(!usersArrRef.current[i]){
                            console.log('clear interval triggered',intervalId)
                            clearInterval(intervalId)
                        }
                        console.log(`reply set interval triggred 2 inside connected -user-else`,usersArrRef.current[i].stream)        
                            //@ts-ignore
                            sendStreamToServer(usersArrRef.current[i].stream,usersArrRef.current[i],4000,url)
                        },4000)
                }
                break;
                }
            }
        }


            
       }

        socket.on('tab-close-remove-video',removeUser)
        socket.on('receive-connected-user-data',modifyingUser)

        function executeBeforeTabClose(e:Event){
            socket.emit('tab-close',myId)
        }

        let id= window.addEventListener('beforeunload',executeBeforeTabClose,{capture:true})
        return ()=>{ 
            window.removeEventListener('beforeunload',executeBeforeTabClose,{capture:true})
            socket.off('tab-close-remove-video',removeUser)
            socket.off('receive-connected-user-data',modifyingUser) 
                    }
    },[socket])

    useEffect(()=>{
        if(peer===null || socket === null || myId==='' || roomId==='')
        return ;
        
        
        function onOpen(myId:string){
            console.log('peer open triggered')
            socket.emit('join-room',roomId,myId)
            firstTimeConnectRef.current = false;
            
        }
        
        function onConnection(conn:any){
            console.log('conn opened')
        }
        
        peer.on('open',onOpen)
        peer.on("connection",onConnection);
        return ()=>{
            peer.off('open',onOpen)
            peer.off('connection',onConnection)
        }
    },[peer,socket,roomId,myId])

    let values = {
        roomId,setRoomId,
        myId,setMyId,
        socket,setSocket,
        users,setUsers,
        myStream,setMyStream,
        mob,setMob,
        isHost,setIsHost,
        isHostRef
    }   

    return (
        //@ts-ignore
    <Context.Provider value={values}>
        {children}
    </Context.Provider>
  )
}
