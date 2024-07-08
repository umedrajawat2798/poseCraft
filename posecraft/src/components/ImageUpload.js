import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Snackbar } from '@mui/material';


const ImageUpload = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      if (!e.target.files[0].type.startsWith('image/')) {
        setError('Only image files are allowed.');
        setSnackbarOpen(true);
        return;
      }
      setError('');
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        onImageUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const action = (
    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <div style={{ margin: 50 }}>
      <label htmlFor="image-upload-button">
        <Button
          component="label"
          variant="contained"
          role={undefined}
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload Image
          <input
            accept="image/*"
            id="image-upload-button"
            type="file"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </Button>
      </label>
      {image && <img src={image} alt="Uploaded" height={50} width={50} />}
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

export default ImageUpload;
