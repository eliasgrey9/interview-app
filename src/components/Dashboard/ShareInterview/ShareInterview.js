import React, { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import axios from "axios";
import style from "./shareInterview.module.css";
import { useParams } from "react-router-dom";
const emailjsKey = process.env.REACT_APP_EMAILJS_KEY;

const ShareInterview = () => {
  const [formData, setFormData] = useState({ email: "", name: "" });
  const [linkSent, setLinkSent] = useState(false);
  const [randomString, setRandomString] = useState("");
  const [dataFromApi, setDataFromApi] = useState({});

  const myForm = useRef();
  const params = useParams();

  //String Generator for dynamic link creation
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const generateString = (length) => {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return setRandomString(result.toLowerCase());
  };

  //Updates invitation numbers by getting the recent amount and passing it to the parent function updateInvitations
  const updateInivitationsOnClientSide = async () => {
    const response = await axios.get(
      `http://localhost:8080/api/jobs/getPositionInvitations/${params.id}`
    );

    updateInvitations(response.data);
  };

  //**SUBMISSION TO INVITE RECIPIENT */
  //Submits email
  //If email is successful creates candidate record
  //Then updates invitations, generates a new string, and Clears formData
  const handleSubmit = (e) => {
    e.preventDefault();

    const dynamicLink = `http://localhost:3000/interview?inviteId=${randomString}&positionId=${params.id}`;

    if (formData.email !== "" && formData.name !== "") {
      emailjs.init(emailjsKey);

      emailjs
        .send("service_roundz", "template_roundz", {
          to_email: formData.email,
          from_name: "Elias's Test Name",
          from_email: "eliasgrey9@gmail.com",
          message: `Invite link: ${dynamicLink}`,
        })
        .then(function (response) {
          if (response) {
            axios.post(
              `http://localhost:8080/api/jobs/addCandidateToPosition/${params.id}`,
              {
                name: formData.name,
                email: formData.email,
                code: randomString,
              }
            );
          }
        })
        .then(function () {
          setLinkSent(true);
        })
        .then(function () {
          generateString(15);
        })
        .then(function () {
          updateInivitationsOnClientSide();
        })
        .then(function () {
          setFormData({ email: "", name: "" });
        })

        .catch(function (error) {
          console.error("Failed to send email: " + error);
        });
    } else {
      return;
    }
  };

  //Sets the values of the input fields for the handleSubmit fn to grab
  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    generateString(15);
  };
  const updateInvitations = (response) => {
    const updatedInvites = {
      ...dataFromApi,
      invitations: response.invitations,
    };
    setDataFromApi(updatedInvites);
  };

  useEffect(() => {
    const renderSinglePosition = async () => {
      const response = await axios.get(
        `http://localhost:8080/api/jobs/singlePosition/${params.id}`
      );
      setDataFromApi(response.data);
    };
    renderSinglePosition();
  }, [params.id]);

  return (
    <form ref={myForm} onSubmit={handleSubmit}>
      {linkSent && <p>Link sent to your email!</p>}
      <input
        type="text"
        name="name"
        placeholder="Recipients name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Recipients email"
        value={formData.email}
        onChange={handleChange}
      />
      <button type="submit">Send Invite</button>
    </form>
  );
};

export default ShareInterview;
