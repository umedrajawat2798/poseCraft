import React, { useState } from 'react';

const ImageUrlInput = ({ onImageUrlSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onImageUrlSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

export default ImageUrlInput;
