import React from 'react'

import Gif from "..//gifs/dot_loader_blue.gif"

const DotLoader = React.memo(({ props = {} }) => {
  return (
    <img src={Gif} alt="...loading" {...props} />
  )
})

export default DotLoader
