import React, { useState } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { setActionStatus } from '../../features/removebg/removebgSlice';
import loadImage from "blueimp-load-image";
import "./RemoveBG.css";
import ReactLoading from 'react-loading';
import { Button, Col, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function RemoveBG() {


    const status = useSelector((state) => state.status.bgRemoved);
    const dispatch = useDispatch();

    let b =null

    const [image, setImage] = useState(null);

    const imgUpload = (e) => {
        const i = e.target.files[0];
        setImage(i);
        console.log(i);
    }

    const uploadImage = async () => { 

        dispatch(setActionStatus(false));

        const resizedImage = await loadImage(image, {
        // resize before sending to PhotoRoom for performance
        maxWidth: 1500,
        maxHeight: 1500,
        canvas: true
        });

        resizedImage.image.toBlob(async function (inputBlob) {
        const formData = new FormData();
        formData.append("image_file", inputBlob);

        const response = await fetch("https://sdk.photoroom.com/v1/segment", {
            method: "POST",
            headers: {
            "x-api-key": "f6a35b3f209ecdcd2f693a5c150347384053e580"
            },
            body: formData
        });

        if(response.status === 200) {
            dispatch(setActionStatus(true));
        }
        else{
            dispatch(setActionStatus(false));
        }
        // https://developers.google.com/web/ilt/pwa/working-with-the-fetch-api#example_fetching_images
        const outputBlob = await response.blob();

        b = URL.createObjectURL(outputBlob);
        const image = document.getElementById("result")
        image.src = b;
        console.log(b);
        var btn = document.getElementById("btn");
        btn.addEventListener("click",function() {
            localStorage.setItem(b,image)
            var a=document.createElement('a');
            var event=new MouseEvent('click');
            a.download='removebg';
            a.href=b;
            a.dispatchEvent(event);
        })
        });
    }

    return (
        <div className="main">
            <Row>
                <div className="App-header"></div>
            </Row>
            <div className="input">
                <input type="file" onChange={imgUpload} accept=".jpg, .png" />
                <Button onClick={uploadImage} size="sm" variant="link">點擊去背</Button>
            </div>
            <Col>
                {status ? <div className="image">
                    <Row>
                        <img id="result" alt="" src={b} />
                    </Row>
                    <div>
                        <Button id="btn" variant="secondary">下載</Button>
                    </div>
                 </div>: null}
                {status === false ? <ReactLoading id="loading" type="spin" color="#000000" height={100} width={100} /> : null} 
            </Col>

        </div>
    )
}
