import React, { useState } from 'react';
import Button from '@mui/material/Button';
import "../styles/form.css"

const BatchImageUrlInput = ({ onBatchUrlsSubmit }) => {
  const [urls, setUrls] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlList = urls.split('\n').map((url) => url.trim()).filter((url) => url !== '');
    onBatchUrlsSubmit(urlList);
  };

  return (
    <form onSubmit={handleSubmit} className='form-container'>
      <textarea
        placeholder="Enter image URLs, one per line"
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        rows={10}
        cols={50}
      />
      <Button type="submit" variant="contained" style={{ height: "fit-content", alignSelf: "center"}}>Submit</Button>
    </form>
  );
};

export default BatchImageUrlInput;
