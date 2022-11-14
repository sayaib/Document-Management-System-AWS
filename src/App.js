import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import AWS from "aws-sdk";
import { Buffer } from "buffer";
// import "./styles.css";
import { saveAs } from 'file-saver';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import MaterialTable from "@material-table/core";
import './App.css'
import './MaterialTable.css'
import * as yup from "yup";
import { useFormik } from "formik";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useQuery } from "@tanstack/react-query";
import PropagateLoader from "react-spinners/PropagateLoader"




const App = () => {
  const [file, setfile] = useState(null)

  const [folderName, setfolderName] = useState([])

  AWS.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    sessionToken: ""
  });
  const S3 = new AWS.S3();


  const handleFileUpload = event => {
    console.log("event.target.files[0].name", event.target.files[0].name);
    console.log("event.target.files[0].name", event.target.files[0].type);
    console.log("event.target.value", event.target.value);
    setfile(event.target.files)
  };

  // const getData = async () => {
  //   try {
  //     const listAllKeys = (params, out = []) => new Promise((resolve, reject) => {
  //       S3.listObjectsV2(params).promise()
  //         .then(({ Contents, IsTruncated, NextContinuationToken }) => {
  //           out.push(...Contents);
  //           !IsTruncated ? resolve(out) : resolve(listAllKeys(Object.assign(params, { ContinuationToken: NextContinuationToken }), out));
  //         })
  //         .catch(reject);
  //     });

  //     listAllKeys({ Bucket: 'my-dms-bucket-osl1' })
  //       .then((data) => {
  //         // setobjData(data)
  //         // console.log(data)
  //         return data
  //         // console.log(data)
  //       })
  //       .catch(console.log);



  //   } catch (error) {

  //   }
  // }

  const getData = async () => {
    try {

      const results = await S3.listObjectsV2({ Bucket: "my-dms-bucket-osl1" }).promise().then(data => {
        return data;
      }).catch(function (err) {
        console.warn('Not exist folder exception is not catch here!');
        return false;
      });
      // console.log(results.Contents[0].Key);
      // let folderName = [];
      // for (let i = 0; i < results.Contents.length; i++) {
      //   const keyName = results.Contents[i].Key;
      //   const splitFolderName = keyName.substring(0, keyName.indexOf('/'));
      //   // console.log(splitFolderName)
      //   folderName.push(splitFolderName)



      // }
      // setfolderName(folderName)

      return results.Contents;


    } catch (error) {

    }
  }

  const { data, isLoading } = useQuery(['data'], getData)


  console.log(folderName)


  // useEffect(() => {
  //   getData()
  // }, [])
  const columns = [
    { title: "Key", field: "Key", width: "60%" },
    { title: "Storage Class", field: "StorageClass" },
    { title: "Size", field: "Size", },
    // { title: "E Tag", field: "ETag", }
  ];
  const actions = [
    {
      // icon: () => <button className="addbutton">Add</button>,
      icon: () => <button className="button-7">Download</button>,


      // tooltip: "",
      onClick: (event, rowData) => {
        console.log(rowData.Key)
        try {

          var params = { Bucket: "my-dms-bucket-osl1", Key: rowData.Key, Expires: 3600, ResponseContentDisposition: `attachment; filename=${rowData.Key}` };
          var url = S3.getSignedUrl('getObject', params);
          console.log(url)
          fetch(url, { method: 'GET' })
            .then(res => {
              return res.blob();
            })
            .then(blob => {
              saveAs(blob, `${rowData.Key}`);
            })
            .catch(err => {
              console.error('err: ', err);
            })


          //var FileSaver = require('file-saver');
          //FileSaver.saveAs(`https://my-dms-bucket-osl1.s3.amazonaws.com/${rowData.Key}`, `${rowData.Key}`);
        } catch (error) {

        }
      },
    },
    {
      // icon: () => <button className="addbutton">Add</button>,
      icon: () => <button className="button-7">Delete</button>,


      // tooltip: "Add User",
      onClick: (event, rowData) => {

        try {
          var params = {
            Bucket: "my-dms-bucket-osl1",
            Key: rowData.Key
          };
          S3.deleteObject(params, function (err, data) {
            if (data) {
              console.log("File deleted successfully");
            } else {
              console.log("Failed to delete")
            }

          })
        } catch (error) {

        }



      },
    },
  ];


  const fileTypes = [
    {
      label: "Image",
      value: "Image",
    },
    {
      label: "PDF",
      value: "PDF",
    },
    {
      label: "XLX",
      value: "XLX",
    },
    {
      label: "DOC",
      value: "DOC",
    },
    {
      label: "Others",
      value: "Others",
    },
  ];

  const validationSchema = yup.object({

  });
  const formik = useFormik({
    initialValues: {


    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {

    },
  });

  const submitFile = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", file[0]);





    const objParams = {
      Bucket: "my-dms-bucket-osl1",
      Key: formik.values.file_type === "PDF" ?
        ("PDF" + "/" + file[0].name) : formik.values.file_type === "XLX" ? ("XLX" + "/" + file[0].name) : formik.values.file_type === "DOC" ? ("DOC" + "/" + file[0].name) : formik.values.file_type === "Image" ? ("Image" + "/" + file[0].name) : formik.values.file_type === "Other" ? ("Other" + "/" + file[0].name) : "",
      Body: file[0],
      // Body: file,
      ContentType: 'application/pdf',
      acl: 'private',
      contentDisposition: 'attachment',
      ServerSideEncryption: 'AES256'
    };

    const response = S3.upload(objParams)
      .on("httpUploadProgress", function (progress) {
        console.log(progress);
        console.log("loaded", progress.loaded);
        console.log("total", progress.total);
        console.log("httpUploadProgress");
      })
      .send(function (err, data) {
        if (err) {
          console.log("Something went wrong");
          console.log(err.code);
          console.log(err.message);
        } else {
          console.log("SEND FINISHED", JSON.stringify(data));
        }
      });
  };

  // console.log(file)
  if (isLoading) {
    return (
      <>
        <div id="centerDiv">
          <PropagateLoader />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="materialTableDB">


        {/* <img src={`data: image / png; base64, ${data} `} alt="" srcset="" /> */}
        <form onSubmit={submitFile}>
          <div>
            <div className="pwd-container">
              <div>
                <span>File Type:</span>
              </div>

              <div>
                <select
                  // style={{ width: "100%", margin: "0" }}
                  name="file_type"
                  className="textSelectField"
                  fullWidth
                  select // label="Select"
                  value={formik.values.file_type}
                  onChange={formik.handleChange}
                  variant="standard"
                >
                  <option selected disabled value="">
                    Please select
                  </option>
                  {fileTypes.map((option) => {
                    return <option value={option.label}>{option.value}</option>;
                  })}
                </select>
                <div>
                  <p style={{ color: "#F44336", fontWeight: "400" }}>
                    {formik.touched.file_type && formik.errors.file_type}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {formik.values.file_type === undefined ? "" :
            <>
              <div style={{ display: "flex", alignItem: "center" }}>
                <div>
                  <input
                    type="file"
                    name="file-input"
                    id="file-input"
                    class="file-input__input"
                    accept={formik.values.file_type === "PDF" ?
                      "application/pdf" : formik.values.file_type === "XLX" ? ".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" : formik.values.file_type === "DOC" ? "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : formik.values.file_type === "Image" ? "image/png, image/gif, image/jpeg" : ""}

                    onChange={handleFileUpload}
                  />
                  <label class="file-input__label" for="file-input">

                    <UploadFileIcon />
                    <span>Select file</span></label
                  >
                </div>
                <button type="submit" className="uploadBtn"><span>Upload</span> <span><CloudUploadIcon /></span></button>
              </div>
              <p>{file !== null ? file[0].name : null}</p>

            </>
          }

          <div style={{ marginTop: "2rem" }} >
            <MaterialTable title="DMS Data" columns={columns} data={data} actions={actions} options={{
              actionsColumnIndex: -1
            }} />
          </div>

        </form>
      </div>
    </>
  );

}

export default App;
