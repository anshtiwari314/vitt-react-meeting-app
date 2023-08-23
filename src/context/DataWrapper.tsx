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
    mob:string|number,
    remove:boolean,
    name:string,
    cameraStatus:boolean,
    microphoneStatus:boolean  
}

export default function DataWrapper({children}:{children:React.ReactNode}) {

    let initialUser = {
        id:'',
        name:'',
        stream:{},
        isAdmin:false,
        isAudioStream:false,
        isLoading:true,
        roomId:'',
        mob:'',
        remove:false,
        cameraStatus:true,
        microphoneStatus:true 
    }
    let initialMsgArr = [
        {
            id:'abcd',
            name:"siar",
            msg:"hello everyone i hope u guys are fine"
        },
        {
            id:"1234",
            name:"suresh",
            msg:"is elss fund is better than other mutual funds"
        },
    ]
    const [socket,setSocket] = useState<any>(null)
    const [socket2,setSocket2] = useState<any>(null)
    const [roomId ,setRoomId] = useState<string>('')
    const [myId,setMyId] = useState<string>('')
    const [peer,setPeer] = useState<Peer|null>(null)
    const firstTimeConnectRef = useRef<boolean>(true)
    const [users,setUsers] = useState<users[]>([]);
    const [myStream,setMyStream] = useState<MediaStream|null>(null);
    const peersObjRef = useRef<any>({});
    const peersArrRef = useRef<string[]>([]);
    let usersRef = useRef<users[]>([])
    let users2Ref = useRef<users[]>([])
    let tempData = useRef<users[]>([])
    let tempData2 = useRef<users[]>([])
    let usersFlag = useRef(2)
    let usersArrRef = useRef<users[]>([])
    let [isHost,setIsHost] = useState<null|boolean>(null)
    let isHostRef = useRef<null|boolean>(null)
    let [mob,setMob] = useState('')
    const [cues,setCues] = useState([])
    const [msg,setMsg] = useState(initialMsgArr);
    const [name,setName] = useState('')
    const [cameraToggle,setCameraToggle ] = useState(true)
    const cameraTogglerRef = useRef(true)
    const [microphoneToggle,setMicroPhoneToggle] = useState(true)
    const microphoneToggleRef = useRef(true)
    const vadEffectRender = useRef(0)
    const vadFlag = useRef(false)
    const adminMediaRecorderStatus = useRef(false)
    const clientMediaRecorderStatus = useRef(false)
    const clientTranscriptionMediaRecorderStatus = useRef(false)
    const adminUrl = `https://tso4smyf1j.execute-api.ap-south-1.amazonaws.com/test/transcription-2way-clientaudio`;
    
    //
    //https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-adminaudio
    const adminClientUrl = `http://localhost:5005/admin-client`
    //
    //https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio
    const clientTranscriptionUrl = `https://583c-182-72-76-34.ngrok-free.app/client`
    //http://localhost:5006/client
    //https://f6p70odi12.execute-api.ap-south-1.amazonaws.com

    //@ts-ignore
    function sendToServer(blob,url,data){
        //console.log("url",url,blob)
        //chunksWithMeta.splice(0,1)
        // chunks.splice(0,1)
        
        //chunksWithMeta=[]
        //chunks = []
        console.log(`sending`)
        let reader = new FileReader();
        reader.onloadend = ()=>{
            let base64data = reader.result;
            blob = null
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
            let blob = new Blob(mp3Buffer,{type:"audio/mp3"});
            
            sendToServer(blob,url,data)
            arrayofChunks=[]
            //@ts-ignore
            blob = null
            })
        }
        setTimeout(()=>mediaRecorder.stop(),recordingTime)
        
        mediaRecorder.start()
        }catch(e){
            console.log(e)
            return;
        }
    }

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

    
    function handleData(data:any){
        //setMsgLoading(false)
        let arr:Data[] =[]
        //@ts-ignore
        let obj:Data = {}
// "sessionid": <str>, "audiofiletimestamp": <str>
        
        if(data?.loading){
            return ;
        }
        if(data?.audiourl!=null){
            audioUrlRef.current = data.audiourl
            setAudioUrlFlag(prev=>!prev)
            //setAudioUrl('https://files.gospeljingle.com/uploads/music/2023/04/Taylor_Swift_-_August.mp3')
        }
        if(data?.imageurl){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="ImageMsg"
            obj["imageUrl"] = data.imageurl;
            obj["iconName"] = 'fa-solid fa-forward-fast'
            obj["similarity_query"] = data.similarity_query;
            obj["color"]= data.color;
            obj["iconColor"] = data.iconColor 
            obj["sessionid"] = data.sessionid;
            obj["audiofiletimestamp"]=data.audiofiletimestamp
            
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj = {}
        }
        if(data?.value){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="InputForm"
            obj["iconName"] = "fa-regular fa-pen-to-square"
            obj["value"] = data.value 
            obj["label"] = data.label 
            obj["color"] = data.color 
            obj["iconColor"] = data.iconColor 
            obj["similarity_query"] = data.similarity_query;
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data.audiofiletimestamp
            
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj = {}
        }
        if(data?.radio){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"]="RadioForm"
            obj["iconName"] = 'fa-regular fa-pen-to-square'
            obj["label"] = data.label 
            obj["radio"] = data.radio
            obj["color"] = data.color
            obj["iconColor"] = data.iconColor 
            obj["similarity_query"] = data.similarity_query;
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data.audiofiletimestamp
           
            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj={}
        }
        if(data?.content){
            data.content.map((e:any,i:number)=>{
                //@ts-ignore
                obj["id"]= uuidv4()
                obj["type"]="TextMsg"
                obj["content"] = e 
                obj["iconName"] = 'fa-solid fa-circle-question'
                obj["color"]= data.color 
                obj["iconColor"] = data.iconColor
                obj["similarity_query"] = data.similarity_query;
                obj["sessionid"] = data.sessionid
                obj["audiofiletimestamp"]=data.audiofiletimestamp

                //arr.push(obj)
                arr = [obj,...arr]
                //@ts-ignore
                obj={}
            })
            
        }
        if(data?.replies){
            //@ts-ignore
            obj["id"]= uuidv4()
            obj["type"] = "SuggestiveMsg"
            obj["replies"] = data.replies
            obj["color"] = data.color
            obj["iconColor"] = data.iconColor 
            obj["similarity_query"] = data.similarity_query;
            obj["iconName"] = 'fa-solid fa-forward-fast'
            obj["sessionid"] = data.sessionid
            obj["audiofiletimestamp"]=data.audiofiletimestamp

            //arr.push(obj)
            arr = [obj,...arr]
            //@ts-ignore
            obj={}
           
        } 
       //console.log(arr)
       setCues(prev=>[...arr,...prev])
       
    }

    let Data = {
        color: "#7D11E9",
        content: ['A mutual fund pools investment from multiple inves…and debt instruments <br/>2. Shares <br/>3. Bonds'],
        iconColor: "blue",
        initquery: "what is mutual fund? what is mutual fund? is mutual fund what is mutual fund what is mutual fund",
        match_score: "0.9741857",
        matched_query: "what is a mutual fund",
        query: ['what is a mutual fund'],
        raw_modded_query: "what is mutual fund fund",
        sessionid: ['aff2b452-5014-4132-8d6d-6ccfa8d520b1'],
        similarity_query: "Definition of mutual fund"
    }
    

    useEffect( ()=>{
        handleData(Data)
        handleData(Data)
        handleData(Data)
        handleData(Data)
        handleData(Data)
        if(socket2===null || myId==='')
        return ;

        function receiveData(data:any){
            
                console.log(data);
                // if(tempRef.current ===data){
                //     //console.log("tempRef current",tempRef.current)
                //     return ;
                // }
                console.log(data.sessionid ===myId,data.sessionid,myId)
    
                if(data.id=== myId){
                handleData(data)
               // handleAudio(data.speech_bytes,data.file_name)
                }
            
        }
        socket.on("receive-data",receiveData)

        return ()=>{
            socket.off("receive-data",receiveData)
        }
    },[myId,socket2])

    useEffect(()=>{
        if(myId==='')
        return 
        //https://vitt-jarvis-node-production.up.railway.app/
      let tempSocket =  io('https://vitt-jarvis-node-production.up.railway.app/')
      let tempSocket2 = io('https://vitt-ai-request-broadcaster-production.up.railway.app')
     // let tempId = uuidv4()

     // let peer = new Peer(myId)
      
      
      setSocket(tempSocket)
      setSocket2(tempSocket2)

      //setMyId(myId)
     // console.log('going to set peer')
     // setPeer(peer)

    },[myId])

    // useEffect(()=>{
    //     isHostRef.current=true
    //     setIsHost(true)
    // },[])
    
    
    
    useEffect(()=>{
        let id = setInterval(()=>{

            if(usersFlag.current>0){
            console.log(usersArrRef.current)
            setUsers(prev=>[...usersArrRef.current])
            //setUsers(usersArrRef.current)
            usersFlag.current--;
            }

            //removing black screen objects 
            //usersArrRef.current=[...usersArrRef.current.filter((e)=>e.remove ===false)] 


            // if(usersFlag.current>0){
            //     console.log(usersArrRef.current)
            //     setUsers(prev=>
            //         // [...usersArrRef.current]
            //         //increase 
            //         usersArrRef.current.map((e,i)=>{
            //             return e
            //         })
            //         //decrease 

            //     )
            //     usersFlag.current--;
            // }

        },5000)
        return ()=>clearInterval(id)
    },[])

    useEffect(()=>{
        // gettingMediaStream().then(bothStreams=>{

        // }).catch(err=>{
        //     getttingAudioStream().then()
        // })
        if(myId==='' || roomId==='' ||isHost===null || mob===''||name==='')
        return;
        
        //variables listed above change only one time 

        console.log('myId is',myId)

        let tempObj = {...initialUser }
            tempObj.id = myId 
            tempObj.isAdmin=isHost 
             
            tempObj.isLoading =false
            tempObj.roomId = roomId 
            tempObj.mob = mob   
            tempObj.name = name

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
    },[myId,roomId,isHost,mob,name])

    useEffect(()=>{
        //this code is responsible for enable & disable videostream 
        if(socket===null || usersArrRef.current.length===0 )
        return ;
        // ||cameraTogglerRef.current===cameraToggle
        console.log(usersArrRef.current[0].stream.getVideoTracks()[0].enabled=cameraToggle)
        //console.log("videostream can be modified")

        usersArrRef.current[0].cameraStatus = cameraToggle;

        socket.emit('camera-toggle-transmitter',{cameraStatus:cameraToggle,id:usersArrRef.current[0].id})
        
        setUsers(prev=>[...usersArrRef.current])

        console.log("myData modified",usersArrRef.current,cameraToggle)
    },[socket,cameraToggle])

    useEffect(()=>{
        //this code is responsible for enable & disable audioStream 
        if(socket===null || usersArrRef.current.length===0)
        return ;
        
        console.log(usersArrRef.current[0].stream.getAudioTracks()[0].enabled=microphoneToggle)
        //console.log("audioStream can be modified")

        usersArrRef.current[0].microphoneStatus = microphoneToggle;
        socket.emit('microphone-toggle-transmitter',{microphoneStatus:microphoneToggle,id:usersArrRef.current[0].id})
        setUsers(prev=>[...usersArrRef.current])

        console.log("myData modified",usersArrRef.current)
    },[socket,microphoneToggle])


    useEffect(()=>{
        if(peer ===null)
        return ;
        console.log('peer changed',peer)

        
    },[peer])
    
    useEffect(()=>{
        if(socket ===null || myId ==='')
        return ;

        let timeOutId=setTimeout(()=>{
        
        if(socket.connected){
            //console.log('socket connected')
        }
            let options1 ={
                host: "vitt-peerjs-server-production.up.railway.app",
                port:6404,
                path: "/myapp",
                // config :{
                //     iceServers: [
                //         //{ urls: "stun:stun.l.google.com:19302" },
                //         //{urls: "stun:127.0.0.1:5010"}	
                //        { urls: "turn:5776-182-72-76-34.ngrok-free.app", username: "anshtiwari31", credential: "jokanomy-jarvis" }
                //         //{ urls: "turn:0.peerjs.com:3478", username: "peerjs", credential: "peerjsp" }  
                //     ],
                //     sdpSemantics: "unified-plan"
                // }
            }
            
            let tempPeer = new Peer(myId)
            //console.log('my peer',tempPeer,myId)
            //tempPeer.disconnect()
            setPeer(tempPeer)  
            clearTimeout(timeOutId)
            
        },5000)

        return ()=>clearTimeout(timeOutId)
    },[socket,myId])

    useEffect(()=>{
        if(socket === null || myStream===null ||myId==='')
        return ;

        //console.log('user-connected effect')
        //this runs for first time 
       //socket.on('connect',()=>{console.log('1st connect triggered');console.log('connected')})

       function connected(){
            
            socket.emit('connected',myId)
         if(firstTimeConnectRef.current === true){
            //console.log('1st connect triggered');   
            
         }
         else {
         console.log('2nd connect triggered');
         socket.emit('join-room',roomId,myId)
             }
         
       }

       function disconnect(){
            console.log('disconnected')
       }
       function userDisconnect(userId:string){
        
            //console.log('user-disconnected',userId)
            // let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== userId)
            // usersArrRef.current = tempUsers
            
            if(peersObjRef.current.hasOwnProperty(userId))
            peersObjRef.current[userId].call.close()
        
       }
       socket.on('connect',connected)

        socket.on('disconnect',disconnect)
        
        socket.on('user-disconnected',userDisconnect)

        return ()=>{
            socket.off('connect',connected)
            socket.off('disconnect',disconnect)
            socket.off('user-disconnected',userDisconnect)
        }
    },[socket,myStream,myId])

    useEffect(()=>{
        if(myStream===null || isHost===null ||isHost===true)
        return ;

        //sending stream for transcription 

        let intervalId:number
        //let url3 = 'https://f6p70odi12.execute-api.ap-south-1.amazonaws.com'
            
        // sendStreamToServer(myStream,usersArrRef.current[0],3000,clientTranscriptionUrl)
        //     // triggers after 1.5sec
        // intervalId =setInterval(()=>{
                
        //     sendStreamToServer(myStream,usersArrRef.current[0],3000,clientTranscriptionUrl)
        // },1500)
        
        return ()=>{
           if(intervalId) clearInterval(intervalId)
        }
    },[myStream,isHost])

    useEffect(()=>{
        if(myStream ===null || isHost ===null || isHost===false)
        return ;

        //sending admin stream 
        
        let intervalId:number

        // sendStreamToServer(myStream,usersArrRef.current[0],4000,adminUrl)

        // intervalId= setInterval(()=>{ 
        // console.log(`sending admin stream`)
        
        // //let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-adminaudio`
        // sendStreamToServer(myStream,usersArrRef.current[0],4000,adminUrl)
        // },4000)
        
        return ()=>{
            if(intervalId) clearInterval(intervalId)
        }
    },[myStream,isHost])

    useEffect(()=>{
        if(myStream===null ||peer===null)
        return;

    },[myStream,peer])


    useEffect(()=>{
        if(peer ===null)
        return ;

        let intervalId = setTimeout(()=>{
            //console.log('listener count',peer.listenerCount('connection'))
            //console.log('peer status',peer,peer.disconnected,peer.destroyed)
            //peer.disconnect()
           // console.log('peer after disconnected',peer,peer.disconnected,peer.destroyed)
            //peer.destroy()
           // console.log('peer after destroy',peer,peer.disconnected,peer.destroyed)
            if(peer.disconnected===false){
               // console.log("join-room-first-time")
                firstTimeConnectRef.current = false;
                socket.emit('join-room',roomId,myId);
                clearInterval(intervalId);
                
            }
        },3000)
        return ()=>clearInterval(intervalId)
    },[peer])

    useEffect(()=>{

        if(peer===null && isHost===null)
        return ;

        let timeoutId:any =null 

        timeoutId= setTimeout(() => {
            // if(isHost===true){
            
            //     peer?.disconnect()
            // //@ts-ignore
            // console.log("manually disconnection triggers",peer.disconnected,peer.destroyed)
            // }
        }, 45000);


        return ()=>{
            clearTimeout(timeoutId)
        }
    },[peer,isHost])

    function isUserAvailable(userId:string){
        let flag = false ;
        for(let i=0;i<peersArrRef.current.length;i++){
            if(peersArrRef.current[i]===userId){
                flag = true; 
                break;
            }
        }
        return flag;
    }

    function removeUserFromPeersArr(userId:string){
        peersArrRef.current=peersArrRef.current.filter(id=>id !==userId)
    }

    async function connectToNewUser(stream:MediaStream,newUserId:string){
        console.log(peer,socket,stream,usersArrRef.current)

        //socket.emit('connected-user-data',{...usersArrRef.current[0],toPeer:newUserId,isLoading:true})
            let intervalId:number

            //peer?.call(newUserId,stream)
            let call = peer?.call(newUserId,stream);
            //console.log('call after await ',call);
            //call=undefined
            let count = 0
            //call undefined sometimes 
            
            while(!call){
                //console.log("while triggers",++count)
                call = peer?.call(newUserId,stream)
            }
           

           // console.log('after-a-while-loop-made',call,newUserId,stream,peer)
            try{
            //if call undefined 
            
            call?.on('stream',(userVideoStream)=>{
                //@ts-ignore
                console.log("includes 1st call peer")
                //@ts-ignore
                peersObjRef.current[call.peer] = {'call':call}

                //if websocket connect first 
                console.log('peersArray',isUserAvailable(call.peer),peersArrRef.current)

                    //@ts-ignore
                        
                    console.log('getting video stream',userVideoStream)
                    
                    // changing that element with original stream
                    for(let i=0;i<usersArrRef.current.length;i++){
                        //@ts-ignore
                        if(usersArrRef.current[i].id===call.peer){
                            
                            usersArrRef.current[i] = {...usersArrRef.current[i],stream:userVideoStream,isLoading:false}
                            usersFlag.current = 2

                            console.log('isHostRef 1',isHostRef.current)
                            if(isHostRef.current===true){
                                //let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio`
                                
                                // sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)
                                // intervalId = setInterval(()=>{  
                                //     console.log(`reply set interval triggred 1`,userVideoStream)        
                                //      //   adminRecordingWithMeta(oldUserVideoStream,false,url2,4000,"stream 1")
                                     
                                //      sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)
                                //     },4000)

                            }
                            break;
                        }
                    }
                    
                    console.log('length 1',usersArrRef.current.length) 
                
                
            })
            call?.on('close',()=>{
                console.log('close event fired 1')
                //@ts-ignore
                let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== call.peer)
                // let tempUsers= usersArrRef.current.map((e,i)=>{
                //     if(e.id === call.peer){
                //         e.remove = true ;
                //         e.isLoading = true; 
                //         return e;
                //     }else return e

                // })
                
                usersArrRef.current = tempUsers
                usersFlag.current = 2

                //@ts-ignore
                removeUserFromPeersArr(call.peer)
                //@ts-ignore
                delete peersObjRef.current[call.peer]

                

                clearInterval(intervalId)

            })

            }catch(err){
                console.log(err)
            }
    }

    useEffect(()=>{
        if(socket === null || myStream===null ||peer===null)
        return ;
       
        function newUser(userId:string){
            console.log('user-connected',userId)
            //send my stream to this user 
            
            //@ts-ignore
            console.log(users)
           //@ts-ignore

           //send this data to new user before making rtc connection
           socket.emit('connected-user-data',{...usersArrRef.current[0],toPeer:userId,isLoading:true,count:1})
         

           //@ts-ignore
           // connectToNewUser(myStream,userId)
        }

        function removeUser(userId:string){
            console.log('remove user triggered',userId)
            // let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== userId)
            // console.log('tab-close',tempUsers)
            // usersArrRef.current = tempUsers
            
            //setUsers(tempUsers)
        }
        
        function modifyingUser(data:any){

            if(data.count!==0){
                //new user data 
                console.log(data,data.count!==0)
                
                socket.emit('connected-user-data',{...usersArrRef.current[0],toPeer:data.id,isLoading:true,count:--data.count})
            }else{
                //@ts-ignore
                connectToNewUser(myStream,data.id)
            }
                peersArrRef.current.push(data.id)
                usersArrRef.current.push(data)
                console.log('connected-usr-data',data)
                
                setUsers(prev=>[...prev,data])
            //console.log('peersArray modify',isUserAvailable(data.id),peersArrRef.current)
            
        //   if(isUserAvailable(data.id)===false){
        //       //if new user 
        //       //websocket connect first
        //     peersArrRef.current.push(data.id)
        //     console.log('connected-usr-data',data)
        //     usersArrRef.current.push(data)
        //     setUsers(prev=>[...prev,data])
        //     }
        //     else {
        //     // if user already there 
        //     //peerjs connected first
        //     console.log('connected-usr-else',data)

        //     for(let i=0;i<usersArrRef.current.length;i++){
        //         if(usersArrRef.current[i].id===data.id){
                
        //         usersArrRef.current[i] = {...data,stream:usersArrRef.current[i].stream,isLoading:false}
        //         usersFlag.current = 2

        //         if(isHostRef.current===true){
        //             let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio`
                   
        //             //@ts-ignore
        //         //    sendStreamToServer(usersArrRef.current[i].stream,usersArrRef.current[i],4000,url)

        //         //     let intervalId = setInterval(()=>{  
        //         //         if(!usersArrRef.current[i]){
        //         //             console.log('clear interval triggered',intervalId)
        //         //             clearInterval(intervalId)
        //         //         }
        //         //         console.log(`reply set interval triggred 2 inside connected -user-else`,usersArrRef.current[i].stream)        
        //         //             //@ts-ignore
        //         //             sendStreamToServer(usersArrRef.current[i].stream,usersArrRef.current[i],4000,url)
        //         //         },4000)
        //         }
        //         break;
        //         }
        //      }
        //      }


            
        }
        function executeBeforeTabClose(e:Event){
            socket.emit('tab-close',myId)
        }

        function cameraToggle(data:any){
            console.log("camera toggle",data)


            usersArrRef.current = usersArrRef.current.map((e:any,i:number)=>{
                if(e.id===data.id){
                    e.cameraStatus = data.cameraStatus
                }
                    return e
                }) 
            setUsers(prev=>[...usersArrRef.current])
            console.log('new data',usersArrRef.current)
        }
        function microphoneToggle(data:any){
            console.log("microphone toggle",data)

            usersArrRef.current = usersArrRef.current.map((e:any,i:number)=>{
                if(e.id===data.id){
                    e.microphoneStatus = data.microphoneStatus
                }
                    return e
                }) 
            setUsers(prev=>[...usersArrRef.current])
            console.log('new data',usersArrRef.current)
        }
        socket.on('tab-close-remove-video',removeUser)
        socket.on('receive-connected-user-data',modifyingUser)
        socket.on('user-connected',newUser)
        socket.on('camera-toggle-receiver',cameraToggle)
        socket.on('microphone-toggle-receiver',microphoneToggle)
        let id= window.addEventListener('beforeunload',executeBeforeTabClose,{capture:true})

        return ()=>{
            socket.off('user-connected',newUser)
            window.removeEventListener('beforeunload',executeBeforeTabClose,{capture:true})
            socket.off('tab-close-remove-video',removeUser)
            socket.off('receive-connected-user-data',modifyingUser)
            socket.off('camera-toggle-receiver',cameraToggle)
            socket.off('microphone-toggle-receiver',cameraToggle)
        }
    },[socket,myStream,peer])

    useEffect(()=>{
        if(peer===null || socket === null || myId==='' || roomId==='' ||myStream===null)
        return ;
        

        console.log('triggering peer fn',peer,myStream)
        let id:number;
       
        
        function reply(call:any){
            console.log("replying trigerred")
           // socket.emit('connected-user-data',{...usersArrRef.current[0],toPeer:call.peer,isLoading:true})
            let intervalId:number 
            call.answer(myStream)
            console.log('after-a-call-answered',call,myStream)

            call.on('stream',(userVideoStream:MediaStream)=>{
                //@ts-ignore
                peersObjRef.current[call.peer] = {'call':call}

                console.log('peersArray2',isUserAvailable(call.peer),peersArrRef.current)

                //if websocket connect first 
                    //@ts-ignore
                    console.log('2nd getting stream',userVideoStream,call.peer)
                    
                    for(let i=0;i<usersArrRef.current.length;i++){

                        if(usersArrRef.current[i].id===call.peer){
                        usersArrRef.current[i] = {...usersArrRef.current[i],stream:userVideoStream,isLoading:false}
                        
                        usersFlag.current = 2

                        console.log('isHostRef 2',isHostRef.current)
                        if(isHostRef.current===true){
                            //let url = `https://19vnck5aw8.execute-api.ap-south-1.amazonaws.com/Prod/save-clientaudio`
                            
                            // sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)

                            // intervalId = setInterval(()=>{  
                            //     console.log(`reply set interval triggred 2`,userVideoStream)        
                            //      //   adminRecordingWithMeta(oldUserVideoStream,false,url2,4000,"stream 1")
                                 
                            //      sendStreamToServer(userVideoStream,usersArrRef.current[i],4000,adminClientUrl)
                            //     },4000)
                    
                            }
                        break;
                        }
                        
                    }
                    //if peerjs connections happens before the data from websocket came 
                    
                    console.log('length 2',usersArrRef.current.length)
                
 
            })
            call.on('close',()=>{
                console.log('close event fired 2')
                
                //modifying users
                let tempUsers= usersArrRef.current.filter((e,i)=>e.id !== call.peer)
                usersArrRef.current = tempUsers
                usersFlag.current = 2

                //removing from peersArrRef
                removeUserFromPeersArr(call.peer)

                //removing call from peersObjRef
                delete peersObjRef.current[call.peer]
        
                if(intervalId) clearInterval(intervalId)
            })
        }

        

        console.log('peer open useEffect')
        function onOpen(){
            console.log('peer open triggered')
            // setTimeout(()=>{
            //     firstTimeConnectRef.current = false;
            //     socket.emit('join-room',roomId,myId);
            // },5000)
            
        }
        
        function onConnection(conn:any){
            console.log('conn opened')
        }

        peer.on('call',reply)
        peer.on('open',onOpen)
        peer.on("connection",onConnection);
        
        // setTimeout(()=>{
            
        // },5000)
        return ()=>{
            peer.off('call',reply)
            peer.off('open',onOpen)
            peer.off('connection',onConnection)
            
        }
    },[peer,socket,roomId,myId,myStream])


    //vad code here 
    function sendVadStreamToServer(stream:MediaStream,data:any,url:string,time){
        let mediaStream =new MediaStream()
        //medRec = mediaStream
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
           // console.log('media recorder stop triggered')
          //  adminMediaRecorderStatus.current = false
            downsampleToWav(new Blob(arrayofChunks,{type:"audio/ogg"}),(buffer:ArrayBuffer)=>{
            const mp3Buffer = encodeMp3(buffer)
            let blob = new Blob(mp3Buffer,{type:"audio/mp3"});
            console.log('send to server',data)
            sendToServer(blob,url,data)
            arrayofChunks=[]
            //@ts-ignore 
            blob = null
            })
        }

        let timeOutId:any=null
        let intervalId:any=null

        //stop after T time 
        timeOutId =setTimeout(()=>{
           // console.log('state mediaRecorder inside timeout',mediaRecorder.state,intervalId,timeOutId)
            clearInterval(intervalId)
            clearTimeout(timeOutId)
            if(mediaRecorder.state==='recording')
            mediaRecorder.stop()
            

        },time)

        //check at specific interval & stop immediately
        intervalId = setInterval(()=>{
           if(vadFlag.current===false){
           // console.log('state mediaRecorder inside interval',mediaRecorder.state,intervalId,timeOutId)
                clearTimeout(timeOutId)
                clearInterval(intervalId)   
                if(mediaRecorder.state==='recording')
                mediaRecorder.stop()
               
               adminMediaRecorderStatus.current===false
           }
        },150)

        mediaRecorder.start()        
        console.log('state mediaRecorder',mediaRecorder.state)
        // if(mediaRecorder.state==='recording'){
            
        // }
        }catch(e){
            console.log(e)
            return;
        }

       
    }

    useEffect(()=>{

        if(myStream===null || users.length!=1)
        return ;
        if(vadEffectRender.current>0)
        return ;
        vadEffectRender.current++
        let myVad=null;
        async function VAD(cb1:CallableFunction,cb2:CallableFunction){
            // return new Promise(async (resolve,reject)=>{
            //     //@ts-ignore
            //     const myvad = await vad.MicVAD.new({
            //       onSpeechStart: cb1,
            //       onSpeechEnd: cb2
            //     })
            //     resolve(myvad)
            //     reject(myvad)
            // })
            const myvad = await vad.MicVAD.new({
                onSpeechStart: cb1,
                onSpeechEnd: cb2
              })
            myVad =myvad;
          }


      let stop:Function
      let medRec =null
      let flag=false ;

      function getWavBytes(buffer, options) {
        const type = options.isFloat ? Float32Array : Uint16Array
        const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT
      
        const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }))
        const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);
      
        // prepend header, then add pcmBytes
        wavBytes.set(headerBytes, 0)
        wavBytes.set(new Uint8Array(buffer), headerBytes.length)
      
        return wavBytes
      }
      

      function getWavHeader(options) {
        const numFrames =      options.numFrames
        const numChannels =    options.numChannels || 2
        const sampleRate =     options.sampleRate || 44100
        const bytesPerSample = options.isFloat? 4 : 2
        const format =         options.isFloat? 3 : 1
      
        const blockAlign = numChannels * bytesPerSample
        const byteRate = sampleRate * blockAlign
        const dataSize = numFrames * blockAlign
      
        const buffer = new ArrayBuffer(44)
        const dv = new DataView(buffer)
      
        let p = 0
      
        function writeString(s) {
          for (let i = 0; i < s.length; i++) {
            dv.setUint8(p + i, s.charCodeAt(i))
          }
          p += s.length
        }
      
        function writeUint32(d) {
          dv.setUint32(p, d, true)
          p += 4
        }
      
        function writeUint16(d) {
          dv.setUint16(p, d, true)
          p += 2
        }
      
        writeString('RIFF')              // ChunkID
        writeUint32(dataSize + 36)       // ChunkSize
        writeString('WAVE')              // Format
        writeString('fmt ')              // Subchunk1ID
        writeUint32(16)                  // Subchunk1Size
        writeUint16(format)              // AudioFormat https://i.stack.imgur.com/BuSmb.png
        writeUint16(numChannels)         // NumChannels
        writeUint32(sampleRate)          // SampleRate
        writeUint32(byteRate)            // ByteRate
        writeUint16(blockAlign)          // BlockAlign
        writeUint16(bytesPerSample * 8)  // BitsPerSample
        writeString('data')              // Subchunk2ID
        writeUint32(dataSize)            // Subchunk2Size
      
        return new Uint8Array(buffer)
      }

      function start(){
        console.log("audio started")
        if(adminMediaRecorderStatus.current===false){
            console.log("caling the function")
           // sendVadStreamToServer(myStream,usersArrRef.current[0],adminUrl,4000)
        }
        vadFlag.current=true
      }
      
      function stop1(audio){
          //console.log("stop tiggered",audio)
        
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createBufferSource();

        const myArrayBuffer = audioCtx.createBuffer(
            1,
            audio.length,
            16000,
          );

        let nowBuffering;
        for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
            // This gives us the actual array that contains the data
            nowBuffering = myArrayBuffer.getChannelData(channel);
          //  console.log('array buffer length',myArrayBuffer.length)
            for (let i = 0; i < myArrayBuffer.length; i++) {
              // Math.random() is in [0; 1.0]
              // audio needs to be in [-1.0; 1.0]
              nowBuffering[i] = audio[i]*2;
            }
          }

        // set the buffer in the AudioBufferSourceNode
        //source.buffer = myArrayBuffer;
        
        // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        //source.connect(audioCtx.destination);

        //start the source playing
        //console.log("ctx stream source",)
        
        //source.start();

        //let stream= audioCtx.createMediaStreamDestination()
        // stream
        
        const ch1Data = myArrayBuffer.getChannelData(0)
        const floatArr = new Float32Array(ch1Data.length)
        
        console.log("duration",myArrayBuffer.duration)
        const wavBytes = getWavBytes(nowBuffering?.buffer, {
                isFloat: true,       // floating point or 16-bit integer
                numChannels: 1,
                sampleRate: 16000,
            })
        const wavBlob = new Blob([wavBytes], { type: 'audio/ogg' })
        
        downsampleToWav(wavBlob,(buffer:ArrayBuffer)=>{
            const mp3Buffer = encodeMp3(buffer)
            let blob = new Blob(mp3Buffer,{type:"audio/mp3"});
          //  console.log('send to server')
            sendToServer(blob,adminUrl,usersArrRef.current[0])
        })
        // console.log('myArray buffer',myArrayBuffer,myArrayBuffer.length)

        // let fA = new Float32Array(audio)
        // console.log('bufff',audio.buffer)
        // let arrBuf = new ArrayBuffer(audio)
        // console.log('arrBuf',arrBuf)
        // let blob = new Blob([fA.buffer],{type:'audio/wav'})
        // console.log('blob',URL.createObjectURL(blob))
        
        



        //let stream= audioCtx.createMediaStreamDestination()
        //console.log('context stream',stream.stream.getAudioTracks()[0])

        // let mediaRec = new MediaRecorder(audioCtx.createMediaStreamDestination())
        // medRec.

        // sendToServer(blob,adminUrl,usersArrRef.current[0])

       // vadFlag.current=false

      }

      VAD(start,stop1).then(vad=>{
         myVad.start()
      })

    },[myStream,users])

    let values = {
        roomId,setRoomId,
        myId,setMyId,
        socket,setSocket,
        users,setUsers,
        myStream,setMyStream,
        mob,setMob,
        isHost,setIsHost,
        isHostRef,
        cues,setCues,
        msg,setMsg,
        name,setName,
        cameraToggle,setCameraToggle,
        microphoneToggle,setMicroPhoneToggle
    }   

    return (
        //@ts-ignore
    <Context.Provider value={values}>
        {children}
    </Context.Provider>
  )
}
