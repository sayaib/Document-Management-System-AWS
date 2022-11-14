import React, { useState } from 'react';
import S3 from 'react-aws-s3';


window.Buffer = window.Buffer || require("buffer").Buffer;



const Upload = () => {

    const [selectedFile, setSelectedFile] = useState(null);


    const config = {
        bucketName: "my-dms-bucket-osl1",
        region: "us-east-1",
        accessKeyId: process.env.REACT_APP_ACCESS,
        secretAccessKey: process.env.REACT_APP_SECRET,
    }

    const handleFileInput = (e) => {
        setSelectedFile(e.target.files[0]);
    }
    console.log(selectedFile)


    const ReactS3Client = new S3(config);

    ReactS3Client
        .uploadFile(selectedFile)
        .then(data => console.log(data.location))
        .catch(err => console.error(err))

    return <div>
        <div>React S3 File Upload</div>
        <input type="file" onChange={handleFileInput} />
        <br></br>
        {/* <button onClick={() => uploadFile(selectedFile)}> Upload to S3</button> */}
    </div>
}

export default Upload;