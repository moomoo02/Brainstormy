import { render } from '@testing-library/react';
import React, { useState, useEffect, useRef, useLayoutEffect, useContext, useCallback } from 'react';
import ColorPicker from './ColorPicker';
import { firebase, db } from './FirebaseConfig';
import { Context } from '../Store';
import axios from "axios";
/* Followed tutorial by Maksim Ivanov (thank you) https://www.youtube.com/watch?v=FLESHMJ-bI0&t=189s */

//Pass 2 props: height and width
function Canvas(props) {
    const canvasRef = useRef([]); //Create Ref object to canvas
    const backgroundCanvasRef = useRef(); //Create Ref object to background canvas
    const contextRef = useRef(null); //Create Ref object to context
    const parentRef = useRef(null); //Create Ref object to parent component
    const [isDrawing, setIsDrawing] = useState(false); //isDrawing State
    const [CanDraw, setCanDraw] = useState(false);   //canDraw is toggled by the draw button and allows user to draw.
    const [buttonStr, setButtonStr] = useState('Draw');  //The string on the draw button
    const [someoneIsDrawing, setSomeoneIsDrawing] = useState(false);  //Lets the server know if someone is drawing
    const [prevMouseX, setPrevMouseX] = useState(0); //Previous mouse X coordinate for the server
    const [prevMouseY, setPrevMouseY] = useState(0); //Previous mouse Y coordinate for the server
    const [state, dispatch] = useContext(Context); //Global state containing profile object and hexColor
    const [testState, setTestState] = useState(0);
    const [canvasLayers, setCanvasLayers] = useState(["canvas0", "canvas1", "canvas2", "canvas3", "canvas4", "canvas5", "canvas6", "canvas7", "canvas8", "canvas9", "canvas10", "canvas11", "canvas12", "canvas13", "canvas14", "canvas15", "canvas16", "canvas17", "canvas18", "canvas19"]);
    const [contextArr,setContextArr] = useState([])
    const numberOfCanvases = 5;

    let localContext;
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = state.colorHexCode;
        }
    }, [state.colorHexCode]);


    //Sets up the canvas
    useEffect(() => {

        console.log(props.uid)

        //Sets the width and height of all the canvases
        for (let i = 0; i < numberOfCanvases; i++) {
            if (canvasRef.current[i]) {
                console.log(canvasRef.current[i]);
                canvasRef.current[i].width = props.width * 2;
                canvasRef.current[i].height = props.height * 2;
                canvasRef.current[i].style.width = `${props.width}px`;
                canvasRef.current[i].style.height = `${props.height}px`;

            }
        }
        //Sets up the Background Canvas
        backgroundCanvasRef.current.width = props.width * 2;
        backgroundCanvasRef.current.height = props.height * 2;
        backgroundCanvasRef.current.style.width = `${props.width}px`;
        backgroundCanvasRef.current.style.height = `${props.height}px`;
        
        //Sets the constant properties of 2d context
        let temp = [];
        for(let i = 0; i < numberOfCanvases; i++){
            let tempCtx = canvasRef.current[i].getContext('2d');
            tempCtx.scale(2,2);
            tempCtx.lineCap = 'round';
            tempCtx.strokeStyle = 'black';
            tempCtx.lineWidth = 10;
            temp.push(tempCtx);
        }
        setContextArr(temp);
        console.log(contextArr);

        //Assigns the localContext the local client can draw on
        if(contextArr[props.canvasId]){
            localContext = contextArr[props.canvasId]; //gets the 2d context
            localContext.strokeStyle = state.colorHexCode;
    
        }
        
        contextRef.current = localContext

        // Firebase On Draw Event
        firebase
            .database()
            .ref('board/')
            .on('value', (snapshot) => {
                if (snapshot.exists()) {
                    let b = false;
                    snapshot.forEach((child) => {
                        if (child.val().isDrawing) {
                            b = true;
                            // console.log("Props.uid: " + props.uid);
                            // console.log("child.key: " + child.key);
                            console.log("boolean val: " + (props.uid === child.key));
                            if (props.uid === child.key) {
                                return 0;
                            }
                            if (contextArr[child.val().canvasId] == null) {
                                console.log("canvasRef is null for " + child.val().canvasId);
                                console.log(canvasRef.current[1])
                                return;
                            }

                            let ctx = contextArr[child.val().canvasId];
                            let backgroundContext = backgroundCanvasRef.current.getContext('2d');
                            ctx.strokeStyle = child.val().colorHexCode;
                            ctx.beginPath();
                            ctx.moveTo(child.val().x1, child.val().y1);
                            ctx.lineTo(child.val().x2, child.val().y2);
                            ctx.stroke();
                            ctx.closePath();
                            backgroundContext.drawImage(canvasRef.current[child.val().canvasId],0,0);
                            ctx.clearRect(0,0,props.width * 2, props.height * 2);
                            console.log("written");
                        }
                    });
                    if (b) {
                        setSomeoneIsDrawing(true);
                    } else {
                        setSomeoneIsDrawing(false);
                    }
                } else {
                    console.log('No data available');
                }
            });
    }, [props.width, props.height, canvasRef, testState]);

    const writeCoordinates = async (mouseX, mouseY, prevMouseX, prevMouseY) => {
        console.log("Writing Coordinates");
        //Writes data to firebase
        if (!isDrawing) {
            firebase
                .database()
                .ref('board/' + props.uid)
                .update({
                    x1: mouseX,
                    y1: mouseY,
                    x2: mouseX,
                    y2: mouseY,
                });
        } else {
            firebase
                .database()
                .ref('board/' + props.uid)
                .update({
                    x1: prevMouseX,
                    y1: prevMouseY,
                    x2: mouseX,
                    y2: mouseY,
                });
        }
    };
    const writeIsDrawing = (b) => {
        //Writes data to firebase
        firebase
            .database()
            .ref('board/' + props.uid)
            .update(
                {
                    isDrawing: b,
                },
                (error) => {
                    if (error) {
                        console.log('writeNotDrawing Failed');
                    }
                }
            );
    };
    const startDrawing = async ({ nativeEvent }) => {
        if (!CanDraw) {
            console.log("cant draw")
            return;
        }
        console.log("start")
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY); //Begins path at current mouse Position
        await writeCoordinates(offsetX, offsetY, 0, 0);
        setPrevMouseX(offsetX);
        setPrevMouseY(offsetY);

        setIsDrawing(true);
        writeIsDrawing(true);
    };
    const finishDrawing = () => {
        contextRef.current.closePath();
        let backgroundContext = backgroundCanvasRef.current.getContext('2d');
        backgroundContext.drawImage(canvasRef.current[props.canvasId],0,0);
        contextRef.current.clearRect(0, 0, props.width, props.height);
        setIsDrawing(false);
        writeIsDrawing(false);
    };

    const draw = async ({ nativeEvent }) => {
        if (!isDrawing || !CanDraw) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        
        await writeCoordinates(offsetX, offsetY, prevMouseX, prevMouseY);

        setPrevMouseX(offsetX);
        setPrevMouseY(offsetY);
        contextRef.current.lineTo(offsetX, offsetY); //Moves path to current mouse Position
        contextRef.current.stroke(); //Renders the Stroke
        // let backgroundContext = backgroundCanvasRef.current.getContext('2d');
        // backgroundContext.drawImage(canvasRef.current[props.canvasId],0,0);
        // contextRef.current.clearRect(0, 0, props.width*2, props.height*2);
    };
    const clickHandlerDraw = () => {

        if (!CanDraw) {
            console.log("Can draw")
            setCanDraw(true);
            setButtonStr('Stop Draw');
        } else {
            setCanDraw(false);
            setButtonStr('Draw');
        }
    };
    const clickHandlerClear = () => { //clears the background canvas
        let backgroundContext = backgroundCanvasRef.current.getContext('2d');
        console.log(props.width + " _____ " + props.height)
        backgroundContext.clearRect(0, 0, 2*props.width, 2*props.height);
    };
    const clickHandlerShare = async () => { //Sends a Post request to write in database
        var image = backgroundCanvasRef.current.toDataURL("image/png"); 
        console.log(props.name)
        let res = await axios.post("http://localhost:8080/add-blog", {
            Author: props.name,
            Image: image
          });
          alert(
            `Sucessfully shared!`
          );
          
        console.log(res.data);
    };
    // const test = () => {
    //     console.log("test1");
    //     if (canvasRef.current[4]) {
    //         console.log("test2");
    //         let ctx = backgroundCanvasRef.current.getContext('2d');
    //         ctx.beginPath();
    //         ctx.rect(20, 20, 150, 100);
    //         ctx.stroke();
    //         console.log("test3");
    //     }
    // }
    // const test2 = () => {
    //     console.log("rerendered")
    //     setTestState(testState => !testState);
    // }
    
    return (
        <div>
            <div style={{ position: 'relative' }}>
                <canvas
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    ref={a => canvasRef.current[props.canvasId] = a}
                    id={"canvas" + props.canvasId}
                    key={props.canvasId}
                    style={{ position: "absolute", left: 0, top: 0, zIndex: 100 }}
                />
                {canvasLayers.map((layer, key) => {
                    return key == props.canvasId ?
                        null
                        :
                        <canvas
                            ref={a => canvasRef.current[key] = a}
                            id={layer}
                            style={{ position: "absolute", left: 0, top: 0, zIndex: key }}
                            key={key} />
                })}
                <canvas
                    ref={backgroundCanvasRef}
                    id={"backgroundCanvas"}
                    key={-1}
                    style={{ position: "absolute", left: 0, top: 0, zIndex: 0 }}
                />
            </div>
            <div style={{ width: props.width, height: props.height }} />
            <div>
                <button type="button" onClick={clickHandlerDraw}>{buttonStr}</button>
                <div style={{ width: '50px', height: 'auto', display: 'inline-block' }} />
                <button type="button" onClick={clickHandlerClear}>Clear</button>
                <div style={{ width: '50px', height: 'auto', display: 'inline-block' }} />
                <button type="button" onClick={clickHandlerShare}>Share</button>
                {/* <button type="button" onClick={test}>Test</button>
                <button type="button" onClick={test2}>ReRender</button> */}
            </div>
            <div>{someoneIsDrawing ? 'Someone is Drawing' : 'No one is Drawing'}</div>
            <div>
                <ColorPicker />
            </div>
            {/* <div>
                <img id='testImg' src=''></img>
            </div> */}
        </div>
    );
}

export default Canvas;
