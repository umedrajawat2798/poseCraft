import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageUpload from "./components/ImageUpload";
import ImageUrlInput from "./components/ImageUrlInput";
import BatchImageUrlInput from "./components/BatchImageUrlInput";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ImageTable from "./components/ImageTable";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const App = () => {
  const [shots, setShots] = useState([]);
  const [type, setType] = useState("file");
  const [imageIds, setImageIds] = useState([]);
  const [imageStatuses, setImageStatuses] = useState({});
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const validateImageUrl = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("Content-Type");
      return contentType.startsWith("image/");
    } catch (error) {
      return false;
    }
  };

  const handleImageUpload = async (imageData) => {
    try {
      // setProcessing(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/process`, {
        imageData,
      });
      setImageIds([response.data.imageId]);
      setImageStatuses((prevStatuses) => ({
        ...prevStatuses,
        [response.data.imageId]: { status: "pending" },
      }));
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  const handleImageUrlSubmit = async (url) => {
    try {
      // setProcessing(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/process`, {
        imageUrl: url,
      });
      setImageIds([response.data.imageId]);
      setImageStatuses((prevStatuses) => ({
        ...prevStatuses,
        [response.data.imageId]: { status: "pending" },
      }));
    } catch (error) {
      console.error("Error processing image URL:", error);
    }
  };

  const handleBatchUrlsSubmit = async (urls) => {
    try {
      if (urls.length === 0) {
        setError("Please enter the urls");
        setSnackbarOpen(true);
        return;
      }
      // setProcessing(true);
      setError("");
      // urls.forEach(async (url)=> {
      //   isValid = await validateImageUrl(url);
      // })
      const results = await Promise.all(urls.map(validateImageUrl));

      const validUrls = urls.filter((url, index) => results[index]);
      const invalidUrls = urls.filter((url, index) => !results[index]);

      if (invalidUrls.length > 0) {
        setError(`Invalid image URLs: ${invalidUrls.join(", ")}`);
        setSnackbarOpen(true);
        return;
      }
      const response = await axios.post(
        "http://localhost:8080/api/process-batch",
        { imageUrls: urls }
      );
      setImageIds(response.data.imageIds);

      const initialStatuses = response.data.imageIds.reduce((acc, id) => {
        acc[id] = { status: "pending" };
        return acc;
      }, {});
      setImageStatuses(initialStatuses);
    } catch (error) {
      console.error("Error processing batch image URLs:", error);
    }
  };

  useEffect(() => {
    if (imageIds.length > 0) {
      const interval = setInterval(async () => {
        try {
          const promises = imageIds.map(async (id) => {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/image-status/${id}`
            );
            return { id, ...response.data };
          });
          const results = await Promise.all(promises);
          const completedShots = results.filter(
            (result) => result.status === "completed"
          );
          const updatedStatuses = { ...imageStatuses };

          completedShots.forEach((result) => {
            updatedStatuses[result.id].status = "completed";
          });

          setImageStatuses(updatedStatuses);

          if (completedShots.length > 0) {
            setShots((prevShots) => [
              ...prevShots,
              ...completedShots.flatMap((result) => result.shots),
            ]);
            setImageIds((prevIds) =>
              prevIds.filter(
                (id) => !completedShots.some((result) => result.id === id)
              )
            );
            if (imageIds.length === 0) {
              // setProcessing(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Error fetching image status or shots:", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [imageIds, imageStatuses]);

  const handleChange = (event, nextView) => {
    setType(nextView);
  };

  const handleClose = (event) => {
    setSnackbarOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button color="secondary" size="small" onClick={handleClose}>
        UNDO
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          display: "grid",
          justifyItems: "center",
          backgroundColor: "blue",
        }}
      >
        <h1 style={{ color: "white" }}>Fashion Image Generator</h1>
      </header>
      <div style={{ display: "grid", justifyItems: "center", marginTop: 50 }}>
        <ToggleButtonGroup
          color="primary"
          value={type}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton value="file">Image Upload</ToggleButton>
          {/* <ToggleButton value="url">Upload Image link</ToggleButton> */}
          <ToggleButton value="batch">Upload Multiple Images</ToggleButton>
        </ToggleButtonGroup>
        {type === "file" ? (
          <ImageUpload onImageUpload={handleImageUpload} />
        ) : type === "url" ? (
          <ImageUrlInput onImageUrlSubmit={handleImageUrlSubmit} />
        ) : type === "batch" ? (
          <BatchImageUrlInput onBatchUrlsSubmit={handleBatchUrlsSubmit} />
        ) : (
          <div>Please select an upload method</div>
        )}
      </div>
      {Object.keys(imageStatuses).length > 0 && (
        <ImageTable
          shots={shots}
          imageIds={imageIds}
          imageStatuses={imageStatuses}
        />
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        message={error}
        action={action}
      />
    </div>
  );
};

export default App;
